/**
 * Legacy export → ServiceNow loader.
 *
 *   npm run migrate -- --source ../COG-GTM-haas-domino-legacy/export/csv --batch-id 20260921-full
 *   npm run migrate -- --source sample-data --dry-run          # no instance, expectation only
 *
 * For every legacy form in contract load order (parents before children):
 *   1. read + header-check the CSV (tools/lib/sourceExport.ts);
 *   2. POST each row to the Import Set REST API (`/api/now/import/{staging_table}`), which maps
 *      the body by staging column name, runs the generated Transform Map synchronously and therefore
 *      the MAHMigration engine (status map, orphans, exceptions) per row, and returns the outcome.
 *      (`insertMultiple` is deliberately not used: it maps body keys by column *label*, transforms
 *      asynchronously and returns no per-row result, so finalize/reconcile could run against an
 *      empty target.)
 *   3. tally inserted / updated / ignored (= quarantined) / error results.
 * Rows are posted in source order, one at a time, so duplicate-business-key detection is
 * deterministic (the later row is the one flagged). `--chunk` sets the progress-log interval.
 * Then POST /migration/finalize (requester coalescing, aging recompute), GET the target
 * reconciliation and compare it with the dry-run expectation computed from the same CSVs.
 *
 * Credentials come only from the environment (see .env.example). Nothing is written to the
 * source directory; reports go to --out (default reports/<batch-id>/).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTRA_STAGING_COLUMNS, LEGACY_FORMS, stagingColumnMap, type LegacyFormName } from '../src/server/lib/legacyContract'
import { compareReports, renderComparison, type TargetReport } from '../src/server/migration/compare'
import { dryRun, type DryRunReport } from '../src/server/migration/dryRun'
import { QUARANTINE_STATUS_MESSAGE, type SourceRow } from '../src/server/migration/rowTransforms'
import { callInstance, callScriptedApi, instanceFromEnv, type InstanceConfig } from './lib/instance'
import { readSourceExport, sourcesByForm, type SourceFile } from './lib/sourceExport'

export interface MigrateArgs {
    source: string
    batchId: string
    chunk: number
    dryRun: boolean
    out: string
    forms?: LegacyFormName[]
}

export function parseArgs(argv: readonly string[]): MigrateArgs {
    const get = (flag: string): string | undefined => {
        const i = argv.indexOf(flag)
        return i >= 0 ? argv[i + 1] : undefined
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
    const batchId = get('--batch-id') ?? `mah-${stamp}`
    if (!/^[A-Za-z0-9._-]{1,40}$/.test(batchId)) throw new Error('--batch-id: letters, digits, . _ - only (max 40)')
    const chunk = Number(get('--chunk') ?? '200')
    if (!Number.isInteger(chunk) || chunk < 1 || chunk > 1000) throw new Error('--chunk must be 1..1000')
    const forms = get('--forms')?.split(',').map((f) => f.trim()) as LegacyFormName[] | undefined
    for (const f of forms ?? []) if (!(f in LEGACY_FORMS)) throw new Error(`--forms: unknown legacy form ${f}`)
    return {
        source: resolve(get('--source') ?? 'sample-data'),
        batchId,
        chunk,
        dryRun: argv.includes('--dry-run'),
        out: resolve(get('--out') ?? join('reports', batchId)),
        ...(forms ? { forms } : {}),
    }
}

/** Import Set REST payload for one source row: staging columns + batch traceability. */
export function stagingPayload(file: SourceFile, row: SourceRow, sourceRow: number, batchId: string): Record<string, string> {
    const [batchCol, rowCol, fileCol] = EXTRA_STAGING_COLUMNS
    const out: Record<string, string> = {}
    for (const c of stagingColumnMap(file.form)) out[c.column] = (row[c.key] ?? '').slice(0, c.length)
    out[batchCol] = batchId
    out[rowCol] = String(sourceRow)
    out[fileCol] = file.file
    return out
}

interface ImportResultRow {
    status?: string
    status_message?: string
    transform_map?: string
    sys_id?: string
}

/** Body of `POST /api/now/import/{staging_table}` (one staging row, synchronous transform). */
interface ImportResponse {
    import_set?: string
    staging_table?: string
    result?: ImportResultRow[]
}

export interface FormLoadSummary {
    form: LegacyFormName
    stagingTable: string
    rows: number
    importSets: string[]
    statuses: Record<string, number>
    errors: { sourceRow: number; message: string }[]
}

export async function loadForm(cfg: InstanceConfig, file: SourceFile, args: MigrateArgs, log: (s: string) => void): Promise<FormLoadSummary> {
    const stagingTable = LEGACY_FORMS[file.form].stagingTable
    const summary: FormLoadSummary = { form: file.form, stagingTable, rows: file.rows.length, importSets: [], statuses: {}, errors: [] }
    for (let i = 0; i < file.rows.length; i++) {
        const row = file.rows[i]
        if (!row) continue
        const sourceRow = i + 2 // header line is 1
        const res = await callInstance<ImportResponse>(cfg, { method: 'POST', path: `/api/now/import/${stagingTable}`, body: stagingPayload(file, row, sourceRow, args.batchId) })
        if (res.import_set && !summary.importSets.includes(res.import_set)) summary.importSets.push(res.import_set)
        const results = res.result ?? []
        if (results.length === 0) summary.errors.push({ sourceRow, message: 'no transform result returned' })
        for (const r of results) {
            const message = r.status_message ?? ''
            const quarantined = r.status === 'error' && message.startsWith(QUARANTINE_STATUS_MESSAGE)
            const status = quarantined ? 'quarantined' : (r.status ?? 'unknown')
            summary.statuses[status] = (summary.statuses[status] ?? 0) + 1
            if (status === 'error') summary.errors.push({ sourceRow, message })
        }
        const done = i + 1
        if (done % args.chunk === 0 || done === file.rows.length) log(`  ${file.file}: ${done}/${file.rows.length} rows → ${summary.importSets.join(',') || '?'}`)
    }
    return summary
}

interface FinalizeResponse {
    batch_id: string
    requesters: { groups: number; merged: number; repointed: number; flattened: number }
    aging: unknown
    exceptions: Record<string, number>
}

export async function main(argv: readonly string[], log: (s: string) => void = console.log): Promise<number> {
    const args = parseArgs(argv)
    const exp = readSourceExport(args.source)
    if (exp.unexpectedFiles.length > 0) log(`warning: files not in contract, ignored: ${exp.unexpectedFiles.join(', ')}`)
    if (exp.missingForms.length > 0) log(`warning: no file for forms: ${exp.missingForms.join(', ')}`)
    const files = args.forms ? exp.files.filter((f) => args.forms?.includes(f.form)) : exp.files

    const expected: DryRunReport = dryRun({ sources: sourcesByForm({ ...exp, files }), now: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    mkdirSync(args.out, { recursive: true })
    writeFileSync(join(args.out, 'expected.json'), JSON.stringify(expected, null, 2))
    log(`source: ${exp.dir} (${expected.source_rows} rows in ${files.length} files) → ${args.out}/expected.json`)
    for (const f of expected.forms) {
        const warn = Object.entries(f.warningsByType)
            .map(([k, v]) => `${k}=${v}`)
            .join(' ')
        log(`  ${f.file.padEnd(34)} rows=${String(f.rows).padStart(5)} load=${String(f.loaded).padStart(5)} quarantine=${String(f.quarantined).padStart(3)} unmapped=${String(f.unmappedStatusRows).padStart(3)} ${warn}`)
    }
    if (args.dryRun) {
        log('dry run: no instance calls made')
        return 0
    }

    const cfg = instanceFromEnv()
    log(`loading batch ${args.batchId} into ${cfg.baseUrl} as ${cfg.username}`)
    const loads: FormLoadSummary[] = []
    for (const file of files) {
        log(`${file.form} → ${LEGACY_FORMS[file.form].targetTable}`)
        loads.push(await loadForm(cfg, file, args, log))
    }
    writeFileSync(join(args.out, 'load.json'), JSON.stringify(loads, null, 2))

    log('finalizing: requester coalescing + aging recompute')
    const fin = await callScriptedApi<FinalizeResponse>(cfg, { method: 'POST', path: '/api/x_cog_mah/authorization_intake/migration/finalize', body: { batch_id: args.batchId } })
    writeFileSync(join(args.out, 'finalize.json'), JSON.stringify(fin, null, 2))
    log(`  requesters merged=${fin.requesters.merged} repointed=${fin.requesters.repointed} flattened=${fin.requesters.flattened}`)

    const actual = await callScriptedApi<TargetReport>(cfg, { method: 'GET', path: '/api/x_cog_mah/authorization_intake/reconciliation' })
    writeFileSync(join(args.out, 'target.json'), JSON.stringify(actual, null, 2))
    const cmp = compareReports(expected.expected, actual)
    writeFileSync(join(args.out, 'comparison.json'), JSON.stringify(cmp, null, 2))
    log(renderComparison(cmp))
    const errors = loads.reduce((n, l) => n + l.errors.length, 0)
    if (errors > 0) log(`${errors} rows returned status=error; see ${args.out}/load.json`)
    return cmp.ok && errors === 0 ? 0 : 1
}

const invokedDirectly = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    main(process.argv.slice(2)).then(
        (code) => process.exit(code),
        (err: unknown) => {
            console.error(err instanceof Error ? err.message : String(err))
            process.exit(2)
        }
    )
}

/**
 * Source ↔ target reconciliation without reloading anything.
 *
 *   npm run reconcile -- --source ../sample-data [--out reports/reconcile.json] [--strict]
 *
 * Computes the expectation from the CSVs (dry run of the pure transforms), fetches the target
 * report from GET /api/x_cog_mah_native/mah_operations/reconciliation (the one small Scripted REST
 * resource v2 keeps: aggregate counts over eleven tables cannot be expressed as one Table API call),
 * prints the comparison and writes `{ expected, actual, comparison }` as JSON. `--strict` exits 1 on
 * any mismatch. `--target-file <json>` reads a saved target report instead of calling the instance.
 * Per-row exceptions are not part of this report: they are the Import Set rows in state
 * error / ignored (sys_import_set_row) and the import_log, both surfaced on the native dashboard.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compareReports, renderComparison, type TargetReport } from '../src/server/migration/compare'
import { dryRun } from '../src/server/migration/dryRun'
import { callScriptedApi, instanceFromEnv, unwrapResult } from './lib/instance'
import { readSourceExport, sourcesByForm } from './lib/sourceExport'

export const RECONCILIATION_PATH = '/api/x_cog_mah_native/mah_operations/reconciliation'

/** Reconciliation endpoint for one batch (`--batch-id`); without it the instance reports its latest batch. */
export function reconciliationPath(batchId?: string): string {
    return batchId ? `${RECONCILIATION_PATH}?batch_id=${encodeURIComponent(batchId)}` : RECONCILIATION_PATH
}
export const FINALIZE_PATH = '/api/x_cog_mah_native/mah_operations/migration/finalize'

export async function main(argv: readonly string[], log: (s: string) => void = console.log): Promise<number> {
    const get = (flag: string): string | undefined => {
        const i = argv.indexOf(flag)
        return i >= 0 ? argv[i + 1] : undefined
    }
    const source = resolve(get('--source') ?? '../sample-data')
    const out = resolve(get('--out') ?? 'reports/reconcile.json')
    const targetFile = get('--target-file')
    const batchId = get('--batch-id')

    const exp = readSourceExport(source)
    const expected = dryRun({ sources: sourcesByForm(exp), now: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    const actual: TargetReport = targetFile
        ? unwrapResult<TargetReport>(JSON.parse(readFileSync(resolve(targetFile), 'utf8')))
        : await callScriptedApi<TargetReport>(instanceFromEnv(), { method: 'GET', path: reconciliationPath(batchId) })
    const comparison = compareReports(expected.expected, actual)

    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, JSON.stringify({ source: exp.dir, expected, actual, comparison }, null, 2))
    log(`source rows: ${expected.source_rows} in ${exp.files.length} files`)
    log(renderComparison(comparison))
    log(`written ${out}`)
    return comparison.ok || !argv.includes('--strict') ? 0 : 1
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

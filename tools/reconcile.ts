/**
 * Source ↔ target reconciliation without reloading anything.
 *
 *   npm run reconcile -- --source ../COG-GTM-haas-domino-legacy/export/csv [--out reports/reconcile.json] [--strict]
 *
 * Computes the expectation from the CSVs (dry run of the pure transforms), fetches the target
 * report from GET /api/x_cog_mah/authorization_intake/reconciliation, prints the comparison
 * and writes `{ expected, actual, comparison }` as JSON. `--strict` exits 1 on any mismatch.
 * `--target-file <json>` reads a saved target report instead of calling the instance.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compareReports, renderComparison, type TargetReport } from '../src/server/migration/compare'
import { dryRun } from '../src/server/migration/dryRun'
import { callInstance, instanceFromEnv } from './lib/instance'
import { readSourceExport, sourcesByForm } from './lib/sourceExport'

export async function main(argv: readonly string[], log: (s: string) => void = console.log): Promise<number> {
    const get = (flag: string): string | undefined => {
        const i = argv.indexOf(flag)
        return i >= 0 ? argv[i + 1] : undefined
    }
    const source = resolve(get('--source') ?? 'sample-data')
    const out = resolve(get('--out') ?? 'reports/reconcile.json')
    const targetFile = get('--target-file')

    const exp = readSourceExport(source)
    const expected = dryRun({ sources: sourcesByForm(exp), now: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    const actual: TargetReport = targetFile
        ? (JSON.parse(readFileSync(resolve(targetFile), 'utf8')) as TargetReport)
        : await callInstance<TargetReport>(instanceFromEnv(), { method: 'GET', path: '/api/x_cog_mah/authorization_intake/reconciliation' })
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

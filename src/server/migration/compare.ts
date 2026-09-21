/**
 * Source ↔ target comparison: the dry-run expectation (computed from the legacy CSVs) against
 * the instance reconciliation report (computed from the loaded tables). Pure so the sample
 * data tests can pin it and `tools/reconcile.ts` can print it.
 */
import type { ExpectedTargets } from './dryRun'

/** Shape of GET /api/x_cog_mah/authorization_intake/reconciliation that the comparison reads. */
export interface TargetReport {
    tables: readonly { table: string; rows: number }[]
    award_line_quantity_total: number
    request_line_extended_price_total: string
    orphan_count: number
    duplicate_merge_count: number
    unmapped_status_count: number
    exception_counts: Record<string, number>
    cases_by_stage: Record<string, number>
    requests_by_state: Record<string, number>
}

export interface CheckResult {
    check: string
    expected: string | number
    actual: string | number
    ok: boolean
}

export interface ComparisonReport {
    ok: boolean
    checks: CheckResult[]
    mismatches: number
}

function check(name: string, expected: string | number, actual: string | number): CheckResult {
    return { check: name, expected, actual, ok: String(expected) === String(actual) }
}

export function compareReports(expected: ExpectedTargets, actual: TargetReport): ComparisonReport {
    const checks: CheckResult[] = []
    const actualRows = new Map(actual.tables.map((t) => [t.table, t.rows]))
    for (const [table, rows] of Object.entries(expected.tables).sort(([a], [b]) => a.localeCompare(b))) {
        checks.push(check(`rows:${table}`, rows, actualRows.get(table) ?? 0))
    }
    checks.push(check('award_line_quantity_total', expected.award_line_quantity_total, actual.award_line_quantity_total))
    checks.push(check('request_line_extended_price_total', expected.request_line_extended_price_total, Number(actual.request_line_extended_price_total).toFixed(2)))
    checks.push(check('orphan_count', expected.orphan_count, actual.orphan_count))
    checks.push(check('duplicate_merge_count', expected.duplicate_merge_count, actual.duplicate_merge_count))
    checks.push(check('unmapped_status_count', expected.unmapped_status_count, actual.unmapped_status_count))
    for (const [type, count] of Object.entries(expected.exception_counts).sort(([a], [b]) => a.localeCompare(b))) {
        checks.push(check(`exceptions:${type}`, count, actual.exception_counts[type] ?? 0))
    }
    for (const [stage, count] of Object.entries(expected.cases_by_stage)) {
        checks.push(check(`cases_by_stage:${stage}`, count, actual.cases_by_stage[stage] ?? 0))
    }
    for (const [state, count] of Object.entries(expected.requests_by_state)) {
        checks.push(check(`requests_by_state:${state}`, count, actual.requests_by_state[state] ?? 0))
    }
    const mismatches = checks.filter((c) => !c.ok).length
    return { ok: mismatches === 0, checks, mismatches }
}

/** Fixed-width text rendering for the CLI. */
export function renderComparison(report: ComparisonReport): string {
    const width = Math.max(...report.checks.map((c) => c.check.length), 5)
    const lines = report.checks.map((c) => `${c.ok ? 'OK  ' : 'DIFF'} ${c.check.padEnd(width)}  source=${String(c.expected).padStart(12)}  target=${String(c.actual).padStart(12)}`)
    lines.push(report.ok ? `All ${report.checks.length} checks match.` : `${report.mismatches} of ${report.checks.length} checks differ.`)
    return lines.join('\n')
}

/**
 * Server-rendered HTML for the operator "Reconciliation report" UI page (`x_cog_mah_reconciliation.do`).
 * Pure: takes a report, returns markup. Every dynamic value is HTML-escaped; no scripts, no
 * external assets, so the page works under the platform CSP and offline. The markup is emitted through
 * a Jelly `<g:no_escape>` and re-parsed as XML by the platform, so it must be well-formed XHTML with
 * no DOCTYPE ("A DOCTYPE is not allowed in content").
 */
import type { ReconciliationReport } from '../services/reconciliation.ts'

export const GENERIC_PAGE_DENIED = 'You are not authorized to view this page.'

export function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

const STYLE = [
    'body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px;color:#141414;background:#fcfcfc;margin:16px}',
    'h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px}',
    '.meta{color:#7d7d7d;margin-bottom:12px}',
    'table{border-collapse:collapse;min-width:420px}th,td{border-bottom:1px solid #e7e7e7;padding:4px 10px;text-align:left}',
    'th{background:#f7f6f5}td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}',
    '.cards{display:flex;flex-wrap:wrap;gap:10px}.card{border:1px solid #e7e7e7;padding:8px 12px;min-width:150px}',
    '.card b{display:block;font-size:20px}.warn b{color:#f53b3a}',
    'pre{background:#f3f3f3;padding:10px;overflow:auto;font-size:11px}',
].join('')

const HEAD = `<html><head><meta charset="utf-8"/><title>MAH reconciliation report</title><style>${STYLE}</style></head><body>`

function card(label: string, value: number | string, warn = false): string {
    return `<div class="card${warn && Number(value) > 0 ? ' warn' : ''}"><b>${escapeHtml(value)}</b>${escapeHtml(label)}</div>`
}

function keyValueTable(caption: string, rows: Record<string, number>): string {
    const body = Object.entries(rows)
        .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td class="num">${escapeHtml(v)}</td></tr>`)
        .join('')
    return `<h2>${escapeHtml(caption)}</h2><table><thead><tr><th>Value</th><th class="num">Rows</th></tr></thead><tbody>${body}</tbody></table>`
}

export function reconciliationHtml(report: ReconciliationReport): string {
    const tableRows = report.tables
        .map(
            (t) =>
                `<tr><td>${escapeHtml(t.legacyForm)}</td><td>${escapeHtml(t.table)}</td>` +
                `<td class="num">${escapeHtml(t.rows)}</td><td class="num">${escapeHtml(t.withLegacyUnid)}</td>` +
                `<td class="num">${escapeHtml(t.unmappedStatus)}</td></tr>`,
        )
        .join('')
    const totalRows = report.tables.reduce((sum, t) => sum + t.rows, 0)
    const totalLegacy = report.tables.reduce((sum, t) => sum + t.withLegacyUnid, 0)
    return (
        `${HEAD}` +
        `<h1>MAH reconciliation report</h1>` +
        `<div class="meta">Generated ${escapeHtml(report.generated_at)} from the live x_cog_mah tables (GlideAggregate). ` +
        `Compare with the legacy export using <code>npm run reconcile</code>.</div>` +
        `<div class="cards">` +
        card('Target rows (all reconciled tables)', totalRows) +
        card('Rows carrying a legacy UNID', totalLegacy) +
        card('Award-line quantity total', report.award_line_quantity_total) +
        card('Request-line extended price total', report.request_line_extended_price_total) +
        card('Orphaned lines quarantined', report.orphan_count, true) +
        card('Duplicate requesters merged', report.duplicate_merge_count) +
        card('Unmapped legacy statuses', report.unmapped_status_count, true) +
        `</div>` +
        `<h2>Rows per table</h2><table><thead><tr><th>Legacy form</th><th>Target table</th><th class="num">Rows</th>` +
        `<th class="num">With legacy UNID</th><th class="num">Unmapped status</th></tr></thead><tbody>${tableRows}</tbody>` +
        `<tfoot><tr><th colspan="2">Total</th><th class="num">${escapeHtml(totalRows)}</th><th class="num">${escapeHtml(totalLegacy)}</th>` +
        `<th class="num">${escapeHtml(report.unmapped_status_count)}</th></tr></tfoot></table>` +
        keyValueTable('Migration exceptions by type', report.exception_counts) +
        keyValueTable('Awards cases by stage', report.cases_by_stage) +
        keyValueTable('Awards cases by aging flag', report.cases_by_aging_flag) +
        keyValueTable('Heraldry requests by state', report.requests_by_state) +
        keyValueTable('Work queues', report.queues) +
        `<h2>Raw JSON</h2><pre>${escapeHtml(JSON.stringify(report, null, 2))}</pre>` +
        `</body></html>`
    )
}

export function deniedHtml(reference: string): string {
    return (
        `${HEAD}` +
        `<h1>MAH reconciliation report</h1><p>${escapeHtml(GENERIC_PAGE_DENIED)}</p>` +
        `<div class="meta">Reference ${escapeHtml(reference)}</div></body></html>`
    )
}

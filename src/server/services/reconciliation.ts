/**
 * Migration reconciliation: target-side counts that `tools/reconcile.ts` compares with the
 * legacy export. Exposed through GET /api/x_cog_mah/reconciliation and the
 * `MAHReconciliation` Script Include (for reports / scheduled delivery).
 *
 * Every number here is computed from the live tables with GlideAggregate so the report can
 * never drift from the data it describes.
 */
import { GlideAggregate, gs, type GlideRecord } from '@servicenow/glide'
import { CASE_STAGE_ORDER, LEGACY_FORMS, MIGRATION_EXCEPTION_TYPES, REQUEST_STATE_ORDER, TABLES, TARGET_STATUS_FIELD, type DomainTableKey } from '../lib/domain.ts'
import { deniedHtml, reconciliationHtml } from '../lib/reconciliationHtml.ts'
import { hasAnyRole, nowValue, securityLog } from '../rules/glideSupport.ts'

export interface TableCount {
    table: string
    legacyForm: string
    rows: number
    withLegacyUnid: number
    unmappedStatus: number
}

export interface ReconciliationReport {
    generated_at: string
    tables: TableCount[]
    award_line_quantity_total: number
    request_line_extended_price_total: string
    orphan_count: number
    duplicate_merge_count: number
    unmapped_status_count: number
    exception_counts: Record<string, number>
    cases_by_stage: Record<string, number>
    cases_by_aging_flag: Record<string, number>
    requests_by_state: Record<string, number>
    queues: {
        engraving_open: number
        assembly_qc: number
        warehouse: number
        vendor_in_production: number
        ses_pending: number
    }
}

/** Tables that carry a legacy form and participate in source ↔ target row-count checks. */
export const RECONCILED_TABLES: readonly { key: DomainTableKey; legacyForm: string }[] = [
    { key: 'awards_case', legacyForm: LEGACY_FORMS.awards_case },
    { key: 'award_line', legacyForm: LEGACY_FORMS.award_line },
    { key: 'requester', legacyForm: LEGACY_FORMS.requester },
    { key: 'authorization_file', legacyForm: LEGACY_FORMS.authorization_file },
    { key: 'engraving_job', legacyForm: LEGACY_FORMS.engraving_job },
    { key: 'shipment', legacyForm: LEGACY_FORMS.shipment },
    { key: 'heraldry_request', legacyForm: LEGACY_FORMS.heraldry_request },
    { key: 'request_line', legacyForm: LEGACY_FORMS.request_line },
    { key: 'heraldic_item', legacyForm: LEGACY_FORMS.heraldic_item },
    { key: 'ses_flag_request', legacyForm: LEGACY_FORMS.ses_flag_request },
    { key: 'vendor', legacyForm: LEGACY_FORMS.vendor },
    { key: 'case_note', legacyForm: LEGACY_FORMS.case_note },
]

/**
 * Single ungrouped aggregate over a table. GlideAggregate groups by the aggregated column unless
 * `setGroup(false)` is set, so every whole-table total goes through here to get exactly one
 * result row.
 */
function total(table: string, type: 'COUNT' | 'SUM', field: string, apply?: (gr: GlideRecord<string>) => void): number {
    const ga = new GlideAggregate(table)
    if (apply) apply(ga as unknown as GlideRecord<string>)
    ga.addAggregate(type, field)
    ga.setGroup(false)
    ga.query()
    return ga.next() ? Number(ga.getAggregate(type, field) || 0) : 0
}

function countRows(table: string, apply?: (gr: GlideRecord<string>) => void): number {
    return total(table, 'COUNT', 'sys_id', apply)
}

function sumField(table: string, field: string, apply?: (gr: GlideRecord<string>) => void): number {
    return total(table, 'SUM', field, apply)
}

function groupCounts(table: string, field: string, order: readonly string[]): Record<string, number> {
    const out: Record<string, number> = {}
    for (const key of order) out[key] = 0
    const ga = new GlideAggregate(table)
    ga.addAggregate('COUNT', field)
    ga.groupBy(field)
    ga.query()
    while (ga.next()) {
        const key = String(ga.getValue(field) ?? '') || '(empty)'
        out[key] = Number(ga.getAggregate('COUNT', field) || 0)
    }
    return out
}

export function buildReconciliationReport(): ReconciliationReport {
    const tables: TableCount[] = []
    let unmappedTotal = 0
    for (const entry of RECONCILED_TABLES) {
        const table = TABLES[entry.key]
        const statusField = TARGET_STATUS_FIELD[entry.key]
        const unmapped = countRows(table, (gr) => gr.addQuery(statusField, 'unmapped'))
        unmappedTotal += unmapped
        tables.push({
            table,
            legacyForm: entry.legacyForm,
            rows: countRows(table),
            withLegacyUnid: countRows(table, (gr) => gr.addNotNullQuery('legacy_unid')),
            unmappedStatus: unmapped,
        })
    }

    const exceptionCounts: Record<string, number> = {}
    for (const type of Object.keys(MIGRATION_EXCEPTION_TYPES)) {
        exceptionCounts[type] = countRows(TABLES.migration_exception, (gr) => gr.addQuery('exception_type', type))
    }

    return {
        generated_at: nowValue(),
        tables,
        award_line_quantity_total: sumField(TABLES.award_line, 'quantity'),
        request_line_extended_price_total: sumField(TABLES.request_line, 'extended_price').toFixed(2),
        orphan_count: exceptionCounts['orphan_parent'] ?? 0,
        duplicate_merge_count: countRows(TABLES.requester, (gr) => gr.addNotNullQuery('merged_into')),
        unmapped_status_count: unmappedTotal,
        exception_counts: exceptionCounts,
        cases_by_stage: groupCounts(TABLES.awards_case, 'stage', CASE_STAGE_ORDER),
        cases_by_aging_flag: groupCounts(TABLES.awards_case, 'aging_flag', ['green', 'amber', 'red']),
        requests_by_state: groupCounts(TABLES.heraldry_request, 'state', REQUEST_STATE_ORDER),
        queues: {
            engraving_open: countRows(TABLES.engraving_job, (gr) => gr.addQuery('status', 'IN', 'queued,in_progress,qc_hold,rework')),
            assembly_qc: countRows(TABLES.awards_case, (gr) => gr.addQuery('stage', 'assembly_qc')),
            warehouse: countRows(TABLES.awards_case, (gr) => gr.addQuery('stage', 'warehouse')),
            vendor_in_production: countRows(TABLES.heraldry_request, (gr) => gr.addQuery('state', 'IN', 'released_to_vendor,in_production')),
            ses_pending: countRows(TABLES.ses_flag_request, (gr) => gr.addQuery('state', 'IN', 'submitted,approved,in_production')),
        },
    }
}

/** Roles allowed to read the report, shared by the REST route and the operator UI page. */
export const RECONCILIATION_ROLES = ['tacom_staff', 'dla', 'admin'] as const

/**
 * Markup for the `x_cog_mah_reconciliation.do` UI page. A browser session cannot call the
 * Scripted REST route directly (the REST layer demands a user token), so the module renders the
 * same report server-side. Unauthorised users get a generic page; the attempt is logged.
 */
export function reconciliationPageHtml(): string {
    const reference = gs.generateGUID()
    if (!hasAnyRole(RECONCILIATION_ROLES)) {
        securityLog({ event: 'authorization_failure', source: 'ui_page:reconciliation', outcome: 'failure', reason: 'missing_role', details: { reference } })
        return deniedHtml(reference)
    }
    const report = buildReconciliationReport()
    securityLog({ event: 'data_access', source: 'ui_page:reconciliation', outcome: 'success', details: { reference, tables: report.tables.length } })
    return reconciliationHtml(report)
}

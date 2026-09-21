/**
 * Migration reconciliation: target-side counts that `tools/reconcile.ts` compares with the
 * legacy export. Exposed through GET /api/x_cog_mah/reconciliation and the
 * `MAHReconciliation` Script Include (for reports / scheduled delivery).
 *
 * Every number here is computed from the live tables with GlideAggregate so the report can
 * never drift from the data it describes.
 */
import { GlideAggregate, type GlideRecord } from '@servicenow/glide'
import { CASE_STAGE_ORDER, LEGACY_FORMS, MIGRATION_EXCEPTION_TYPES, REQUEST_STATE_ORDER, TABLES, type DomainTableKey } from '../lib/domain'
import { nowValue } from '../rules/glideSupport'

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
]

/** Field that receives the mapped legacy status on each table. */
const STATUS_FIELD: Readonly<Record<DomainTableKey, string>> = {
    awards_case: 'stage',
    award_line: 'status',
    requester: 'state',
    authorization_file: 'parse_status',
    engraving_job: 'status',
    shipment: 'status',
    heraldry_request: 'state',
    request_line: 'status',
    heraldic_item: 'state',
    ses_flag_request: 'state',
    vendor: 'state',
    case_note: 'state',
    status_map: 'state',
    migration_exception: 'state',
}

function countRows(table: string, apply?: (gr: GlideRecord<string>) => void): number {
    const ga = new GlideAggregate(table)
    if (apply) apply(ga as unknown as GlideRecord<string>)
    ga.addAggregate('COUNT', 'sys_id')
    ga.query()
    return ga.next() ? Number(ga.getAggregate('COUNT', 'sys_id') || 0) : 0
}

function sumField(table: string, field: string, apply?: (gr: GlideRecord<string>) => void): number {
    const ga = new GlideAggregate(table)
    if (apply) apply(ga as unknown as GlideRecord<string>)
    ga.addAggregate('SUM', field)
    ga.query()
    return ga.next() ? Number(ga.getAggregate('SUM', field) || 0) : 0
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
        const statusField = STATUS_FIELD[entry.key]
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

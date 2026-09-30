/**
 * Migration reconciliation, target side. `tools/reconcile.ts` normally computes these numbers
 * over the native Table / Aggregate APIs; this module is the in-instance equivalent (Script
 * Include `MAHNativeReconciliation`) for background scripts and scheduled reports.
 *
 * Migration exceptions are not a table any more: the counts come from `sys_import_set_row`
 * states (error / ignored) on the native staging tables.
 */
import { GlideAggregate, type GlideRecord } from '@servicenow/glide'
import { CASE_STAGE_ORDER, COMPANY_FIELDS, LEGACY_FORMS, PLATFORM_TABLES, REQUEST_STATE_ORDER, STAGING_TABLE_PREFIX, TABLES, TARGET_STATUS_FIELD, TASK_STATES, type DomainTableKey } from '../lib/domain.ts'
import { nowValue } from '../rules/glideSupport.ts'

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
    companies: { rows: number; withLegacyUnid: number }
    award_line_quantity_total: number
    request_line_extended_price_total: string
    orphan_count: number
    duplicate_merge_count: number
    unmapped_status_count: number
    import_row_states: Record<string, number>
    journal_entries: number
    cases_by_stage: Record<string, number>
    cases_by_task_state: Record<string, number>
    requests_by_stage: Record<string, number>
    sla: { active: number; breached: number }
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
    { key: 'catalog_item', legacyForm: LEGACY_FORMS.catalog_item },
    { key: 'ses_flag_request', legacyForm: LEGACY_FORMS.ses_flag_request },
]

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

function groupCounts(table: string, field: string, order: readonly string[], apply?: (gr: GlideRecord<string>) => void): Record<string, number> {
    const out: Record<string, number> = {}
    for (const key of order) out[key] = 0
    const ga = new GlideAggregate(table)
    if (apply) apply(ga as unknown as GlideRecord<string>)
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
        const unmapped = statusField ? countRows(table, (gr) => gr.addQuery(statusField, 'unmapped')) : 0
        unmappedTotal += unmapped
        tables.push({
            table,
            legacyForm: entry.legacyForm,
            rows: countRows(table),
            withLegacyUnid: countRows(table, (gr) => gr.addNotNullQuery('legacy_unid')),
            unmappedStatus: unmapped,
        })
    }
    const importRowStates = groupCounts(PLATFORM_TABLES.import_set_row, 'state', ['inserted', 'updated', 'ignored', 'error'], (gr) =>
        gr.addQuery('sys_class_name', 'STARTSWITH', STAGING_TABLE_PREFIX),
    )
    const taskStateOrder = Object.values(TASK_STATES).map(String)
    return {
        generated_at: nowValue(),
        tables,
        companies: {
            rows: countRows(PLATFORM_TABLES.company, (gr) => gr.addNotNullQuery(COMPANY_FIELDS.legacy_unid)),
            withLegacyUnid: countRows(PLATFORM_TABLES.company, (gr) => gr.addNotNullQuery(COMPANY_FIELDS.legacy_unid)),
        },
        award_line_quantity_total: sumField(TABLES.award_line, 'quantity'),
        request_line_extended_price_total: sumField(TABLES.request_line, 'extended_price').toFixed(2),
        orphan_count: importRowStates['error'] ?? 0,
        duplicate_merge_count: countRows(TABLES.requester, (gr) => gr.addNotNullQuery('merged_into')),
        unmapped_status_count: unmappedTotal,
        import_row_states: importRowStates,
        journal_entries: countRows(PLATFORM_TABLES.journal, (gr) => gr.addQuery('name', 'STARTSWITH', 'x_cog_mah_native_')),
        cases_by_stage: groupCounts(TABLES.awards_case, 'stage', CASE_STAGE_ORDER),
        cases_by_task_state: groupCounts(TABLES.awards_case, 'state', taskStateOrder),
        requests_by_stage: groupCounts(TABLES.heraldry_request, 'stage', REQUEST_STATE_ORDER),
        sla: {
            active: countRows(PLATFORM_TABLES.task_sla, (gr) => {
                gr.addQuery('task.sys_class_name', TABLES.awards_case)
                gr.addQuery('active', 'true')
            }),
            breached: countRows(PLATFORM_TABLES.task_sla, (gr) => {
                gr.addQuery('task.sys_class_name', TABLES.awards_case)
                gr.addQuery('has_breached', 'true')
            }),
        },
        queues: {
            engraving_open: countRows(TABLES.engraving_job, (gr) => gr.addQuery('stage', 'IN', 'queued,in_progress,qc_hold,rework')),
            assembly_qc: countRows(TABLES.awards_case, (gr) => gr.addQuery('stage', 'assembly_qc')),
            warehouse: countRows(TABLES.awards_case, (gr) => gr.addQuery('stage', 'warehouse')),
            vendor_in_production: countRows(TABLES.heraldry_request, (gr) => gr.addQuery('stage', 'IN', 'released_to_vendor,in_production')),
            ses_pending: countRows(TABLES.ses_flag_request, (gr) => gr.addQuery('stage', 'IN', 'submitted,approved,in_production')),
        },
    }
}

/** Roles allowed to read the report. */
export const RECONCILIATION_ROLES = ['tacom_staff', 'dla', 'admin'] as const

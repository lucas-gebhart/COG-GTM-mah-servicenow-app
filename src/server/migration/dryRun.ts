/**
 * Instance-free migration dry run. Pushes every source row through the same pure
 * `transformRow` the Transform Maps use and replays the engine's decisions (required parent
 * missing → quarantine, non-required reference missing → warning, duplicate business key,
 * requester coalescing) against an in-memory index instead of GlideRecord.
 *
 * The output is the *expected* reconciliation for a source export: `tools/reconcile.ts`
 * compares it with the instance report so "source 3,000 = target 3,000" is asserted, not
 * eyeballed, and the sample-data tests pin the exact totals.
 */
import { coalesceRequesters, type DedupeCandidate } from '../lib/dedupe.ts'
import { CASE_STAGE_ORDER, MIGRATION_EXCEPTION_TYPES, REQUEST_STATE_ORDER, TABLES, TARGET_STATUS_FIELD, type DomainTableKey } from '../lib/domain.ts'
import { LEGACY_FORMS, LOAD_ORDER, TARGET_BUSINESS_KEY_FIELD, type LegacyFormName } from '../lib/legacyContract.ts'
import { buildStatusLookup, DEFAULT_STATUS_MAP, type StatusLookup } from '../lib/statusMap.ts'
import { type RowTransform, type SourceRow, transformRow } from './rowTransforms.ts'

export interface FormDryRun {
    form: LegacyFormName
    file: string
    targetTable: string
    rows: number
    loaded: number
    quarantined: number
    unmappedStatusRows: number
    /** normalized legacy status → rows, for statuses with no map entry */
    unmappedStatuses: Record<string, number>
    /** mapped target value → rows */
    statusDistribution: Record<string, number>
    warningsByType: Record<string, number>
}

export interface ExpectedTargets {
    /** target table → rows expected after the load (quarantined rows excluded) */
    tables: Record<string, number>
    award_line_quantity_total: number
    request_line_extended_price_total: string
    orphan_count: number
    duplicate_merge_count: number
    unmapped_status_count: number
    exception_counts: Record<string, number>
    cases_by_stage: Record<string, number>
    cases_by_aging_flag: Record<string, number>
    requests_by_state: Record<string, number>
}

export interface DryRunReport {
    generated_at: string
    source_rows: number
    forms: FormDryRun[]
    expected: ExpectedTargets
}

export interface DryRunInput {
    /** Parsed rows per legacy form (keys per `stagingColumnMap(form)[i].key`). Missing forms are skipped. */
    sources: Partial<Record<LegacyFormName, readonly SourceRow[]>>
    now: string
    statusLookup?: StatusLookup
}

type FieldIndex = Map<string, Map<string, Set<string>>>

function index(fi: FieldIndex, table: string, field: string, value: string): void {
    if (!value) return
    let byField = fi.get(table)
    if (!byField) {
        byField = new Map()
        fi.set(table, byField)
    }
    let values = byField.get(field)
    if (!values) {
        values = new Set()
        byField.set(field, values)
    }
    values.add(value)
}

function has(fi: FieldIndex, table: string, fields: readonly string[], value: string): boolean {
    const byField = fi.get(table)
    if (!byField || !value) return false
    return fields.some((f) => byField.get(f)?.has(value) ?? false)
}

function bump(map: Record<string, number>, key: string, by = 1): void {
    map[key] = (map[key] ?? 0) + by
}

function ordered(counts: Record<string, number>, order: readonly string[]): Record<string, number> {
    const out: Record<string, number> = {}
    for (const k of order) out[k] = counts[k] ?? 0
    for (const k of Object.keys(counts).sort()) if (!(k in out)) out[k] = counts[k] ?? 0
    return out
}

export function dryRun(input: DryRunInput): DryRunReport {
    const lookup = input.statusLookup ?? buildStatusLookup(DEFAULT_STATUS_MAP)
    const fi: FieldIndex = new Map()
    /** target table → business-key field → value → first legacy UNID that used it */
    const businessKeys = new Map<string, Map<string, string>>()
    const tables: Record<string, number> = {}
    const exceptionCounts: Record<string, number> = {}
    for (const type of Object.keys(MIGRATION_EXCEPTION_TYPES)) exceptionCounts[type] = 0
    const casesByStage: Record<string, number> = {}
    const casesByAging: Record<string, number> = {}
    const requestsByState: Record<string, number> = {}
    const requesterCandidates: DedupeCandidate<RowTransform>[] = []
    let quantityTotal = 0
    let extendedTotal = 0
    let sourceRows = 0
    let unmappedTotal = 0
    const forms: FormDryRun[] = []

    for (const form of LOAD_ORDER) {
        const rows = input.sources[form]
        if (!rows) continue
        const contract = LEGACY_FORMS[form]
        const summary: FormDryRun = {
            form,
            file: contract.csvFile,
            targetTable: contract.targetTable,
            rows: rows.length,
            loaded: 0,
            quarantined: 0,
            unmappedStatusRows: 0,
            unmappedStatuses: {},
            statusDistribution: {},
            warningsByType: {},
        }
        const keyField = TARGET_BUSINESS_KEY_FIELD[form]
        for (const row of rows) {
            sourceRows++
            const t = transformRow(form, row, { now: input.now, statusLookup: lookup })
            const legacyUnid = t.fields.legacy_unid ?? ''
            if (!t.statusMapped) {
                summary.unmappedStatusRows++
                unmappedTotal++
                bump(summary.unmappedStatuses, t.statusNormalized || '(empty)')
            }

            let quarantined = false
            for (const l of t.lookups) {
                if (has(fi, l.table, l.matchFields, l.value)) continue
                if (l.required) {
                    quarantined = true
                    break
                }
                t.warnings.push({ type: 'invalid_reference', field: l.field, rawValue: l.value, message: `${l.table} ${l.matchFields.join('/')} = ${l.value} not found` })
            }
            if (quarantined) {
                summary.quarantined++
                bump(summary.warningsByType, 'orphan_parent')
                bump(exceptionCounts, 'orphan_parent')
                continue
            }

            if (keyField) {
                const value = t.fields[keyField] ?? ''
                if (value) {
                    let byValue = businessKeys.get(`${t.targetTable}.${keyField}`)
                    if (!byValue) {
                        byValue = new Map()
                        businessKeys.set(`${t.targetTable}.${keyField}`, byValue)
                    }
                    const first = byValue.get(value)
                    if (first !== undefined && first !== legacyUnid) {
                        t.warnings.push({ type: 'duplicate_business_key', field: keyField, rawValue: value, message: `Business key ${keyField} = ${value} already loaded from ${first}` })
                    } else if (first === undefined) {
                        byValue.set(value, legacyUnid)
                    }
                }
            }

            summary.loaded++
            bump(tables, t.targetTable)
            for (const [field, value] of Object.entries(t.fields)) index(fi, t.targetTable, field, value)
            for (const w of t.warnings) {
                bump(summary.warningsByType, w.type)
                bump(exceptionCounts, w.type)
            }
            const statusField = STATUS_FIELD_BY_TABLE[t.targetTable]
            if (statusField) bump(summary.statusDistribution, t.fields[statusField] ?? '(empty)')

            if (t.targetTable === TABLES.awards_case) {
                bump(casesByStage, t.fields.stage ?? '(empty)')
                bump(casesByAging, t.fields.aging_flag ?? '(empty)')
            } else if (t.targetTable === TABLES.heraldry_request) {
                bump(requestsByState, t.fields.state ?? '(empty)')
            } else if (t.targetTable === TABLES.award_line) {
                quantityTotal += Number(t.fields.quantity ?? 0) || 0
            } else if (t.targetTable === TABLES.request_line) {
                extendedTotal += Number(t.fields.extended_price ?? 0) || 0
            } else if (t.targetTable === TABLES.requester && t.dedupeKey) {
                requesterCandidates.push({ unid: legacyUnid, key: t.dedupeKey, lastModified: t.fields.legacy_last_modified ?? '', record: t })
            }
        }
        forms.push(summary)
    }

    const merge = coalesceRequesters(requesterCandidates)
    exceptionCounts['duplicate_requester'] = (exceptionCounts['duplicate_requester'] ?? 0) + merge.mergedInto.size

    return {
        generated_at: input.now,
        source_rows: sourceRows,
        forms,
        expected: {
            tables,
            award_line_quantity_total: quantityTotal,
            request_line_extended_price_total: extendedTotal.toFixed(2),
            orphan_count: exceptionCounts['orphan_parent'] ?? 0,
            duplicate_merge_count: merge.mergedInto.size,
            unmapped_status_count: unmappedTotal,
            exception_counts: exceptionCounts,
            cases_by_stage: ordered(casesByStage, CASE_STAGE_ORDER),
            cases_by_aging_flag: ordered(casesByAging, ['green', 'amber', 'red']),
            requests_by_state: ordered(requestsByState, REQUEST_STATE_ORDER),
        },
    }
}

/** TARGET_STATUS_FIELD keyed by table name instead of domain key. */
export const STATUS_FIELD_BY_TABLE: Readonly<Record<string, string>> = Object.fromEntries(
    (Object.keys(TABLES) as DomainTableKey[]).map((k) => [TABLES[k], TARGET_STATUS_FIELD[k]])
)

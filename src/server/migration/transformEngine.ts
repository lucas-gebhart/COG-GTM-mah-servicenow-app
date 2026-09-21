/**
 * Glide side of the migration: the Transform Map scripts for every staging table call into
 * this module (through the `MAHMigration` Script Include) so the per-form logic stays in
 * `rowTransforms.ts`, which is pure and unit-tested. This file only:
 *
 *   - reads the staging row into a header-keyed `SourceRow` (duplicate headers positional);
 *   - looks the free-text status up in `x_cog_mah_status_map` (instance rows win, then the seed);
 *   - resolves reference lookups with parameterized `addQuery` calls (never encoded queries);
 *   - quarantines orphans (required parent missing) instead of inserting them;
 *   - writes one `x_cog_mah_migration_exception` per warning, linked to the target row;
 *   - detects duplicate business keys across different legacy UNIDs;
 *   - coalesces requesters by `dedupe_key` on request (`merged_into` + re-pointing);
 *   - emits one structured JSON log line per batch.
 *
 * Every hook is idempotent: re-running a transform for the same import set coalesces on
 * `legacy_unid` and replaces the exceptions written for that row in the same batch.
 */
import { GlideAggregate, GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { coalesceRequesters, type DedupeCandidate } from '../lib/dedupe.ts'
import { TABLES } from '../lib/domain.ts'
import { EXTRA_STAGING_COLUMNS, LEGACY_FORMS, stagingColumnMap, TARGET_BUSINESS_KEY_FIELD, type LegacyFormName } from '../lib/legacyContract.ts'
import { formatSecurityEvent, type SecurityEventType } from '../lib/logging.ts'
import { buildStatusLookup, DEFAULT_STATUS_MAP, normalizeStatusText, type StatusLookup, type StatusMapEntry } from '../lib/statusMap.ts'
import { DIRECT_FIELD_MAPS, type ReferenceLookup, type RowTransform, type RowWarning, type SourceRow, transformRow } from './rowTransforms.ts'

type AnyRecord = GlideRecord<string>

/** Result the onBefore transform script turns into `ignore` / `status_message`. */
export interface BeforeResult {
    ignore: boolean
    statusMessage: string
    warningCount: number
    quarantined: boolean
}

export interface RowMeta {
    batchId: string
    sourceRow: number
    sourceFile: string
    importSet: string
    sourceTable: string
    legacyUnid: string
}

export interface CompletionSummary {
    form: LegacyFormName
    batchId: string
    importSet: string
    rows: number
    quarantined: number
    warnings: number
    statusMatches: number
    unmappedStatuses: number
}

export interface MergeSummary {
    groups: number
    merged: number
    repointed: number
}

// ---------------------------------------------------------------------------------------------
// per-transform-run state (one JS context per Import Set transform run)
// ---------------------------------------------------------------------------------------------

interface RunState {
    form: LegacyFormName
    importSet: string
    batchId: string
    rows: number
    quarantined: number
    warnings: number
    unmappedStatuses: number
    statusMatches: Map<string, number>
    lookup: StatusLookup
    /** legacy_unid → warnings written in onBefore, linked to the target sys_id in onAfter. */
    pending: Map<string, string[]>
}

let run: RunState | null = null

function get(gr: AnyRecord, field: string): string {
    const v = gr.getValue(field)
    return v === null || v === undefined ? '' : String(v)
}

/** Staging columns may be created with or without the platform `u_` prefix depending on how the table was materialised. */
function stagingValue(gr: AnyRecord, column: string): string {
    if (gr.isValidField(column)) return get(gr, column)
    const prefixed = `u_${column}`
    if (gr.isValidField(prefixed)) return get(gr, prefixed)
    return ''
}

function nowValue(): string {
    return new GlideDateTime().getValue()
}

function log(event: SecurityEventType, details: Record<string, string | number | boolean>, outcome: 'success' | 'blocked' | 'failure' = 'success'): void {
    gs.info(formatSecurityEvent({ event, user: gs.getUserName(), outcome, details }))
}

// ---------------------------------------------------------------------------------------------
// status lookup: instance table first, code seed as fallback
// ---------------------------------------------------------------------------------------------

/** Read active rows of `x_cog_mah_status_map`; operators add rows here when the report shows unmapped values. */
export function instanceStatusLookup(): StatusLookup {
    const rows: StatusMapEntry[] = []
    const gr = new GlideRecord(TABLES.status_map)
    gr.addQuery('active', true)
    gr.query()
    while (gr.next()) {
        const targetField = get(gr, 'target_field')
        if (targetField !== 'stage' && targetField !== 'state' && targetField !== 'status' && targetField !== 'parse_status') continue
        rows.push({
            legacyForm: get(gr, 'legacy_form') as StatusMapEntry['legacyForm'],
            legacyStatus: normalizeStatusText(get(gr, 'legacy_status')),
            targetValue: get(gr, 'target_value'),
            targetField,
        })
    }
    const instance = buildStatusLookup(rows)
    const seed = buildStatusLookup(DEFAULT_STATUS_MAP)
    return (form, normalized) => instance(form, normalized) ?? seed(form, normalized)
}

// ---------------------------------------------------------------------------------------------
// source row + metadata
// ---------------------------------------------------------------------------------------------

export function readSourceRow(form: LegacyFormName, source: AnyRecord): SourceRow {
    const row: Record<string, string> = {}
    for (const c of stagingColumnMap(form)) row[c.key] = stagingValue(source, c.column)
    return row
}

export function readRowMeta(form: LegacyFormName, source: AnyRecord, row: SourceRow): RowMeta {
    const [batchCol, rowCol, fileCol] = EXTRA_STAGING_COLUMNS
    const sourceRow = Number.parseInt(stagingValue(source, rowCol), 10)
    return {
        batchId: stagingValue(source, batchCol).slice(0, 40),
        sourceRow: Number.isFinite(sourceRow) ? sourceRow : 0,
        sourceFile: stagingValue(source, fileCol).slice(0, 255) || LEGACY_FORMS[form].csvFile,
        importSet: get(source, 'sys_import_set'),
        sourceTable: LEGACY_FORMS[form].stagingTable,
        legacyUnid: (row.UNID ?? '').toUpperCase().slice(0, 32),
    }
}

// ---------------------------------------------------------------------------------------------
// exceptions
// ---------------------------------------------------------------------------------------------

export interface ExceptionInput {
    form: LegacyFormName
    meta: RowMeta
    warning: RowWarning
    targetSysId?: string
    parentUnid?: string
    legacyStatusRaw?: string
    rawRow?: SourceRow
}

/** Insert one quarantine / warning row. Never throws: a failure here must not abort the load. */
export function writeException(input: ExceptionInput): string {
    const gr = new GlideRecord(TABLES.migration_exception)
    gr.initialize()
    gr.setValue('exception_type', input.warning.type)
    gr.setValue('legacy_unid', input.meta.legacyUnid)
    gr.setValue('legacy_form', LEGACY_FORMS[input.form].legacyForm)
    gr.setValue('legacy_status_raw', (input.legacyStatusRaw ?? '').slice(0, 100))
    gr.setValue('batch_id', input.meta.batchId)
    gr.setValue('import_set', input.meta.importSet)
    gr.setValue('source_table', input.meta.sourceTable)
    gr.setValue('source_row', String(input.meta.sourceRow))
    gr.setValue('target_table', LEGACY_FORMS[input.form].targetTable)
    gr.setValue('target_sys_id', input.targetSysId ?? '')
    gr.setValue('parent_unid', (input.parentUnid ?? '').slice(0, 32))
    gr.setValue('field_name', input.warning.field.slice(0, 80))
    const raw = input.rawRow ? JSON.stringify(input.rawRow) : input.warning.rawValue
    gr.setValue('raw_value', raw.slice(0, 4000))
    gr.setValue('message', input.warning.message.slice(0, 255))
    gr.setValue('state', 'open')
    gr.setValue('active', 'true')
    const id = gr.insert()
    return id === null || id === undefined ? '' : String(id)
}

/** Remove exceptions written for this UNID in this batch so a re-run does not double count. */
function clearRowExceptions(meta: RowMeta): void {
    if (!meta.legacyUnid || !meta.batchId) return
    const gr = new GlideRecord(TABLES.migration_exception)
    gr.addQuery('legacy_unid', meta.legacyUnid)
    gr.addQuery('batch_id', meta.batchId)
    gr.addQuery('source_table', meta.sourceTable)
    gr.addQuery('state', 'open')
    gr.query()
    gr.deleteMultiple()
}

// ---------------------------------------------------------------------------------------------
// reference resolution
// ---------------------------------------------------------------------------------------------

export interface ResolvedLookup {
    lookup: ReferenceLookup
    sysId: string
}

/**
 * Exact match on each candidate field, parameterized. Requesters that were merged resolve to
 * their survivor so no case ever points at a duplicate.
 */
export function resolveLookup(lookup: ReferenceLookup): string {
    if (!lookup.value) return ''
    const gr = new GlideRecord(lookup.table)
    const [first, ...rest] = lookup.matchFields
    if (first === undefined) return ''
    const q = gr.addQuery(first, lookup.value)
    for (const f of rest) q.addOrCondition(f, lookup.value)
    gr.setLimit(1)
    gr.query()
    if (!gr.next()) return ''
    if (lookup.table === TABLES.requester && gr.isValidField('merged_into')) {
        const survivor = get(gr, 'merged_into')
        if (survivor) return survivor
    }
    return String(gr.getUniqueValue())
}

// ---------------------------------------------------------------------------------------------
// duplicate business keys
// ---------------------------------------------------------------------------------------------

/** Another target row already carries this business key under a different legacy UNID. */
export function findDuplicateBusinessKey(form: LegacyFormName, t: RowTransform, legacyUnid: string): string {
    const field = TARGET_BUSINESS_KEY_FIELD[form]
    if (!field) return ''
    const value = t.fields[field]
    if (!value) return ''
    const gr = new GlideRecord(t.targetTable)
    gr.addQuery(field, value)
    gr.addQuery('legacy_unid', '!=', legacyUnid)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? get(gr, 'legacy_unid') : ''
}

// ---------------------------------------------------------------------------------------------
// transform hooks
// ---------------------------------------------------------------------------------------------

export function onStart(form: LegacyFormName, importSet: string): void {
    run = {
        form,
        importSet,
        batchId: '',
        rows: 0,
        quarantined: 0,
        warnings: 0,
        unmappedStatuses: 0,
        statusMatches: new Map(),
        lookup: instanceStatusLookup(),
        pending: new Map(),
    }
    log('migration_run', { phase: 'start', form, importSet })
}

function state(form: LegacyFormName, importSet: string): RunState {
    if (run === null || run.form !== form || (importSet && run.importSet && run.importSet !== importSet)) onStart(form, importSet)
    return run as RunState
}

/**
 * onBefore: transform the staging row, resolve references, quarantine orphans and set every
 * target field. Returns what the script must do with `ignore`.
 */
export function onBefore(form: LegacyFormName, source: AnyRecord, target: AnyRecord, isUpdate: boolean): BeforeResult {
    const row = readSourceRow(form, source)
    const meta = readRowMeta(form, source, row)
    const s = state(form, meta.importSet)
    if (!s.batchId && meta.batchId) s.batchId = meta.batchId
    s.rows++
    clearRowExceptions(meta)

    const t = transformRow(form, row, { now: nowValue(), statusLookup: s.lookup })
    const statusRaw = t.fields.legacy_status_raw ?? ''
    if (t.statusNormalized) s.statusMatches.set(`${LEGACY_FORMS[form].legacyForm}\u0000${t.statusNormalized}`, (s.statusMatches.get(`${LEGACY_FORMS[form].legacyForm}\u0000${t.statusNormalized}`) ?? 0) + 1)
    if (!t.statusMapped) s.unmappedStatuses++

    // Required parents first: an orphan is quarantined with the complete raw row and never inserted.
    for (const lookup of t.lookups) {
        const sysId = resolveLookup(lookup)
        if (sysId) {
            t.fields[lookup.field] = sysId
            continue
        }
        if (lookup.required) {
            s.quarantined++
            writeException({
                form,
                meta,
                legacyStatusRaw: statusRaw,
                parentUnid: lookup.value,
                rawRow: row,
                warning: {
                    type: 'orphan_parent',
                    field: lookup.field,
                    rawValue: lookup.value,
                    message: `Parent ${lookup.table} not found for ${lookup.matchFields.join('/')} = ${lookup.value}; row quarantined`,
                },
            })
            log('migration_exception', { form, legacyUnid: meta.legacyUnid, parent: lookup.value, sourceRow: meta.sourceRow, type: 'orphan_parent' }, 'blocked')
            return { ignore: true, statusMessage: 'Quarantined: parent not found', warningCount: 1, quarantined: true }
        }
        t.warnings.push({
            type: 'invalid_reference',
            field: lookup.field,
            rawValue: lookup.value,
            message: `${lookup.table} ${lookup.matchFields.join('/')} = ${lookup.value} not found; reference left empty`,
        })
        t.fields[lookup.field] = ''
    }

    if (!isUpdate) {
        const dup = findDuplicateBusinessKey(form, t, meta.legacyUnid)
        if (dup) {
            const field = TARGET_BUSINESS_KEY_FIELD[form] ?? ''
            t.warnings.push({
                type: 'duplicate_business_key',
                field,
                rawValue: t.fields[field] ?? '',
                message: `Business key ${field} = ${t.fields[field] ?? ''} already loaded from legacy UNID ${dup}; both rows kept`,
            })
        }
    }

    // Field maps copy raw values before this hook runs; clear any the transform decided not to keep.
    for (const f of Object.keys(DIRECT_FIELD_MAPS[form])) {
        if (!(f in t.fields) && target.isValidField(f)) target.setValue(f, '')
    }
    for (const [field, value] of Object.entries(t.fields)) {
        if (target.isValidField(field)) target.setValue(field, value)
    }

    const written: string[] = []
    for (const w of t.warnings) {
        const id = writeException({ form, meta, legacyStatusRaw: statusRaw, warning: w })
        if (id) written.push(id)
    }
    s.warnings += t.warnings.length
    if (written.length > 0) s.pending.set(meta.legacyUnid, written)

    return {
        ignore: false,
        statusMessage: t.warnings.length > 0 ? `${t.warnings.length} warning(s) recorded` : '',
        warningCount: t.warnings.length,
        quarantined: false,
    }
}

/** onAfter: link the exceptions written for this row to the target record and stamp `batch_id` when the table has it. */
export function onAfter(form: LegacyFormName, source: AnyRecord, target: AnyRecord): void {
    const legacyUnid = get(target, 'legacy_unid') || stagingValue(source, 'unid').toUpperCase()
    const s = state(form, get(source, 'sys_import_set'))
    const ids = s.pending.get(legacyUnid)
    if (!ids || ids.length === 0) return
    s.pending.delete(legacyUnid)
    const targetSysId = String(target.getUniqueValue())
    const gr = new GlideRecord(TABLES.migration_exception)
    gr.addQuery('sys_id', 'IN', ids.join(','))
    gr.query()
    while (gr.next()) {
        gr.setValue('target_sys_id', targetSysId)
        gr.update()
    }
}

/** Persist per-status match counts so the status map shows which aliases actually fired. */
function flushStatusMatches(s: RunState): number {
    let total = 0
    for (const [key, count] of s.statusMatches) {
        const [legacyForm, normalized] = key.split('\u0000')
        total += count
        const gr = new GlideRecord(TABLES.status_map)
        gr.addQuery('legacy_form', legacyForm ?? '')
        gr.addQuery('legacy_status', normalized ?? '')
        gr.setLimit(1)
        gr.query()
        if (gr.next()) {
            gr.setValue('match_count', String(count))
            gr.setWorkflow(false)
            gr.update()
        }
    }
    s.statusMatches.clear()
    return total
}

/**
 * onComplete: status match counts and the batch summary log. Requester coalescing is not run
 * here because the Import Set REST API transforms one import set per call; `tools/migrate.ts`
 * calls `coalesceRequesterTable` once through POST /migration/finalize after both requester
 * files are loaded.
 */
export function onComplete(form: LegacyFormName, importSet: string): CompletionSummary {
    const s = state(form, importSet)
    const statusMatches = flushStatusMatches(s)
    const summary: CompletionSummary = {
        form,
        batchId: s.batchId,
        importSet: s.importSet,
        rows: s.rows,
        quarantined: s.quarantined,
        warnings: s.warnings,
        statusMatches,
        unmappedStatuses: s.unmappedStatuses,
    }
    log('migration_run', { phase: 'complete', ...summary })
    run = null
    return summary
}

// ---------------------------------------------------------------------------------------------
// requester coalescing (replaces the MergeRequester agent)
// ---------------------------------------------------------------------------------------------

/** Tables and fields that reference a requester and must follow a merge. */
const REQUESTER_REFERENCES: readonly { table: string; field: string }[] = [
    { table: TABLES.awards_case, field: 'requester' },
    { table: TABLES.heraldry_request, field: 'requester' },
]

/**
 * Group every unmerged requester by `dedupe_key`, keep the most recently modified record and
 * point the rest at it through `merged_into`. Each merge writes a `duplicate_requester`
 * exception and every awards case / heraldry request on a duplicate is re-pointed.
 */
export function coalesceRequesterTable(batchId: string): MergeSummary {
    const candidates: DedupeCandidate<string>[] = []
    const gr = new GlideRecord(TABLES.requester)
    gr.addQuery('dedupe_key', '!=', '')
    gr.addNullQuery('merged_into')
    gr.orderBy('dedupe_key')
    gr.query()
    while (gr.next()) {
        candidates.push({
            unid: get(gr, 'legacy_unid') || String(gr.getUniqueValue()),
            key: get(gr, 'dedupe_key'),
            lastModified: get(gr, 'legacy_last_modified') || get(gr, 'sys_updated_on'),
            record: String(gr.getUniqueValue()),
        })
    }
    const result = coalesceRequesters(candidates)
    const sysIdByUnid = new Map<string, DedupeCandidate<string>>()
    for (const c of candidates) sysIdByUnid.set(c.unid, c)

    let merged = 0
    let repointed = 0
    const groups = new Set<string>()
    for (const [dupUnid, survivorUnid] of result.mergedInto) {
        const dup = sysIdByUnid.get(dupUnid)
        const survivor = sysIdByUnid.get(survivorUnid)
        if (!dup || !survivor) continue
        groups.add(survivor.key)
        const dupGr = new GlideRecord(TABLES.requester)
        if (!dupGr.get(dup.record)) continue
        dupGr.setValue('merged_into', survivor.record)
        dupGr.setValue('state', 'merged')
        dupGr.setValue('active', 'false')
        dupGr.setWorkflow(false)
        dupGr.update()
        merged++
        writeException({
            form: 'Requester',
            meta: { batchId, sourceRow: 0, sourceFile: '', importSet: '', sourceTable: TABLES.requester, legacyUnid: dupUnid },
            targetSysId: dup.record,
            parentUnid: survivorUnid,
            warning: {
                type: 'duplicate_requester',
                field: 'merged_into',
                rawValue: dup.key,
                message: `Requester ${dupUnid} merged into ${survivorUnid} (dedupe_key ${dup.key})`,
            },
        })
        for (const ref of REQUESTER_REFERENCES) {
            const cases = new GlideRecord(ref.table)
            cases.addQuery(ref.field, dup.record)
            cases.query()
            while (cases.next()) {
                cases.setValue(ref.field, survivor.record)
                cases.setWorkflow(false)
                cases.update()
                repointed++
            }
        }
    }
    log('migration_run', { phase: 'coalesce_requesters', batchId, groups: groups.size, merged, repointed })
    return { groups: groups.size, merged, repointed }
}

// ---------------------------------------------------------------------------------------------
// batch bookkeeping used by tools/migrate.ts through the reconciliation REST resource
// ---------------------------------------------------------------------------------------------

/** Exception counts for one batch, grouped by type (GlideAggregate, parameterized). */
export function batchExceptionCounts(batchId: string): Record<string, number> {
    const out: Record<string, number> = {}
    const ga = new GlideAggregate(TABLES.migration_exception)
    ga.addQuery('batch_id', '=', batchId)
    ga.addAggregate('COUNT', 'sys_id')
    ga.groupBy('exception_type')
    ga.query()
    while (ga.next()) {
        out[String(ga.getValue('exception_type'))] = Number(ga.getAggregate('COUNT', 'sys_id') || 0)
    }
    return out
}

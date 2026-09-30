/**
 * Glide side of the migration: the Transform Map scripts for every staging table call into
 * this module (through the `MAHNativeMigration` Script Include) so the per-form logic stays in
 * `rowTransforms.ts`, which is pure and unit-tested. This file only:
 *
 *   - reads the staging row into a header-keyed `SourceRow` (duplicate headers positional);
 *   - looks the free-text status up in `x_cog_mah_native_status_map` (instance rows win, then the seed);
 *   - resolves reference lookups with parameterized `addQuery` calls (never encoded queries);
 *   - quarantines orphans (required parent missing) as Import Set rows in state `error`;
 *   - records every other warning on the Import Set row (`sys_import_state_comment`) and in the
 *     native import log — there is no custom exception table in v2;
 *   - detects duplicate business keys across different legacy UNIDs;
 *   - coalesces requesters by `dedupe_key` when the requester import sets complete (`merged_into`).
 *
 * Every hook is idempotent: re-running a transform for the same rows coalesces on `legacy_unid`
 * and the Import Set row comment is rewritten, not appended.
 */
import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { coalesceRequesters, type DedupeCandidate } from '../lib/dedupe.ts'
import { PLATFORM_TABLES, TABLES } from '../lib/domain.ts'
import { EXTRA_STAGING_COLUMNS, LEGACY_FORMS, stagingColumnMap, TARGET_BUSINESS_KEY_FIELD, type LegacyFormName } from '../lib/legacyContract.ts'
import { formatSecurityEvent, type SecurityEventType } from '../lib/logging.ts'
import { buildStatusLookup, DEFAULT_STATUS_MAP, normalizeStatusText, type StatusLookup, type StatusMapEntry } from '../lib/statusMap.ts'
import { DIRECT_FIELD_MAPS, QUARANTINE_STATUS_MESSAGE, type ReferenceLookup, type RowTransform, type RowWarning, type SourceRow, transformRow } from './rowTransforms.ts'

type AnyRecord = GlideRecord<string>

/** Result the onBefore transform script turns into `ignore` / `error` / `status_message`. */
export interface BeforeResult {
    /** Skip the target write (the row stays in the import set). */
    ignore: boolean
    /** Mark the Import Set row `error` (quarantine) — `error_message` receives `statusMessage`. */
    error: boolean
    /** Written to `sys_import_set_row.sys_import_state_comment` by the platform. */
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
    merge?: MergeSummary
}

export interface MergeSummary {
    groups: number
    merged: number
    repointed: number
    /** Legacy-merged rows whose `merged_into` pointed at a record that was itself merged here. */
    flattened: number
}

/** Serialise warnings into the Import Set row comment: `type[field]: message` per line. */
export function formatWarnings(warnings: readonly RowWarning[]): string {
    return warnings.map((w) => `${w.type}[${w.field}]: ${w.message}`.replace(/[\r\n]+/g, ' ')).join('\n').slice(0, 4000)
}

/** Parse the comment written by {@link formatWarnings} back into exception types (used by reconciliation). */
export function parseWarningTypes(comment: string): string[] {
    const out: string[] = []
    for (const line of comment.split('\n')) {
        const m = /^([a-z_]+)\[/.exec(line.trim())
        if (m?.[1]) out.push(m[1])
    }
    return out
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

/** Read active rows of `x_cog_mah_native_status_map`; operators add rows here when the report shows unmapped values. */
export function instanceStatusLookup(): StatusLookup {
    const rows: StatusMapEntry[] = []
    const gr = new GlideRecord(TABLES.status_map)
    gr.addQuery('active', true)
    gr.query()
    while (gr.next()) {
        const targetField = get(gr, 'target_field')
        if (targetField !== 'stage' && targetField !== 'state' && targetField !== 'status' && targetField !== 'catalog_state') continue
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
// reference resolution
// ---------------------------------------------------------------------------------------------

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
    const lineageField = t.targetTable === PLATFORM_TABLES.company ? 'x_cog_mah_native_legacy_unid' : 'legacy_unid'
    const gr = new GlideRecord(t.targetTable)
    gr.addQuery(field, value)
    gr.addQuery(lineageField, '!=', legacyUnid)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? get(gr, lineageField) : ''
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
    }
    log('migration_run', { phase: 'start', form, importSet })
}

function state(form: LegacyFormName, importSet: string): RunState {
    if (run === null || run.form !== form || (importSet && run.importSet && run.importSet !== importSet)) onStart(form, importSet)
    return run as RunState
}

/**
 * onBefore: transform the staging row, resolve references, quarantine orphans and set every
 * target field. Returns what the script must do with `ignore` / `error` / `status_message`.
 */
export function onBefore(form: LegacyFormName, source: AnyRecord, target: AnyRecord, isUpdate: boolean): BeforeResult {
    const row = readSourceRow(form, source)
    const meta = readRowMeta(form, source, row)
    const s = state(form, meta.importSet)
    if (!s.batchId && meta.batchId) s.batchId = meta.batchId
    s.rows++

    const t = transformRow(form, row, { now: nowValue(), statusLookup: s.lookup })
    if (t.statusNormalized) {
        const key = `${LEGACY_FORMS[form].legacyForm}\u0000${t.statusNormalized}`
        s.statusMatches.set(key, (s.statusMatches.get(key) ?? 0) + 1)
    }
    if (!t.statusMapped) s.unmappedStatuses++

    // Required parents first: an orphan is quarantined (Import Set row state `error`) and never inserted.
    for (const lookup of t.lookups) {
        const sysId = resolveLookup(lookup)
        if (sysId) {
            if (lookup.field !== 'sys_id') t.fields[lookup.field] = sysId
            continue
        }
        if (lookup.required) {
            s.quarantined++
            const message = `${QUARANTINE_STATUS_MESSAGE}: orphan_parent[${lookup.field}]: parent ${lookup.table} not found for ${lookup.matchFields.join('/')} = ${lookup.value}`
            log('import_set_row', { form, legacyUnid: meta.legacyUnid, parent: lookup.value, sourceRow: meta.sourceRow, type: 'orphan_parent' }, 'blocked')
            return { ignore: true, error: true, statusMessage: message.slice(0, 4000), warningCount: 1, quarantined: true }
        }
        t.warnings.push({
            type: 'invalid_reference',
            field: lookup.field,
            rawValue: lookup.value,
            message: `${lookup.table} ${lookup.matchFields.join('/')} = ${lookup.value} not found; reference left empty`,
        })
        t.fields[lookup.field] = ''
    }

    if (t.journalOnly) {
        // The target is the existing parent task (coalesced on legacy_unid); only the journal field is written.
        if (!isUpdate) {
            s.quarantined++
            return { ignore: true, error: true, statusMessage: `${QUARANTINE_STATUS_MESSAGE}: orphan_parent[legacy_unid]: parent case ${t.fields.legacy_unid ?? ''} not found`, warningCount: 1, quarantined: true }
        }
        for (const journal of ['work_notes', 'comments'] as const) {
            const text = t.fields[journal]
            if (text && target.isValidField(journal)) target.setValue(journal, text)
        }
    } else {
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
    }

    s.warnings += t.warnings.length
    if (t.warnings.length > 0) {
        log('import_set_row', { form, legacyUnid: meta.legacyUnid, sourceRow: meta.sourceRow, warnings: t.warnings.length, types: t.warnings.map((w) => w.type).join(',') })
    }
    return {
        ignore: false,
        error: false,
        statusMessage: formatWarnings(t.warnings),
        warningCount: t.warnings.length,
        quarantined: false,
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
 * onComplete: status match counts and the batch summary log. Requester import sets also run the
 * coalescing pass here (both requester files feed one table; the pass is idempotent), which is
 * what removes the need for a custom "finalize" REST resource.
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
    if (form === 'Requester' || form === 'HeraldryRequester') summary.merge = coalesceRequesterTable(s.batchId)
    log('migration_run', { phase: 'complete', ...summary, merge: summary.merge ? JSON.stringify(summary.merge) : '' })
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

/** Record a merge on the duplicate's own Import Set row so the import log / staging report shows it. */
function annotateStagingRow(stagingTable: string, legacyUnid: string, comment: string): void {
    if (!legacyUnid) return
    const gr = new GlideRecord(stagingTable)
    const unidCol = gr.isValidField('unid') ? 'unid' : gr.isValidField('u_unid') ? 'u_unid' : ''
    if (!unidCol) return
    gr.addQuery(unidCol, legacyUnid)
    gr.orderByDesc('sys_created_on')
    gr.setLimit(1)
    gr.query()
    if (!gr.next()) return
    const existing = get(gr, 'sys_import_state_comment')
    const line = comment.slice(0, 1000)
    if (existing.includes(line)) return
    gr.setValue('sys_import_state_comment', [existing, line].filter(Boolean).join('\n').slice(0, 4000))
    gr.setWorkflow(false)
    gr.update()
}

/**
 * Group every unmerged requester by `dedupe_key`, keep the most recently modified record and
 * point the rest at it through `merged_into`. Each merge is annotated on the duplicate's staging
 * row and every awards case / heraldry request on a duplicate is re-pointed.
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
        const note = `duplicate_requester[merged_into]: Requester ${dupUnid} merged into ${survivorUnid} (dedupe_key ${dup.key})`
        annotateStagingRow(LEGACY_FORMS.Requester.stagingTable, dupUnid, note)
        annotateStagingRow(LEGACY_FORMS.HeraldryRequester.stagingTable, dupUnid, note)
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
    const flattened = flattenMergeChains()
    log('migration_run', { phase: 'coalesce_requesters', batchId, groups: groups.size, merged, repointed, flattened })
    return { groups: groups.size, merged, repointed, flattened }
}

/**
 * A row the legacy system had already merged can point at a requester that this batch merged
 * again (A → B in the source, B → C here). Re-point A at the final survivor so `merged_into`
 * is always a single hop, and move A's cases along with it. Bounded so a cyclic source
 * pointer cannot loop.
 */
function flattenMergeChains(): number {
    let flattened = 0
    const gr = new GlideRecord(TABLES.requester)
    gr.addNotNullQuery('merged_into')
    gr.query()
    while (gr.next()) {
        let survivor = get(gr, 'merged_into')
        let hops = 0
        while (hops < 8) {
            const next = new GlideRecord(TABLES.requester)
            if (!next.get(survivor) || !get(next, 'merged_into')) break
            survivor = get(next, 'merged_into')
            hops++
        }
        if (hops === 0 || survivor === String(gr.getUniqueValue())) continue
        gr.setValue('merged_into', survivor)
        gr.setWorkflow(false)
        gr.update()
        flattened++
        for (const ref of REQUESTER_REFERENCES) {
            const cases = new GlideRecord(ref.table)
            cases.addQuery(ref.field, String(gr.getUniqueValue()))
            cases.query()
            while (cases.next()) {
                cases.setValue(ref.field, survivor)
                cases.setWorkflow(false)
                cases.update()
            }
        }
    }
    return flattened
}

/**
 * onAfter transform script hook. The native engine has nothing to do here (journals are written
 * in onBefore onto the coalesced parent task, lineage fields are direct maps), but the generated
 * transform scripts call it uniformly so the hook stays in one place.
 */
export function onAfter(_form: LegacyFormName, _source: AnyRecord, _target: AnyRecord): void {
    /* intentionally empty */
}

/**
 * Live authorization intake over the native Import Set API. v1 exposed a Scripted REST resource with
 * its own parser loop, idempotence check and exception rows; v2 lets the platform do the transport,
 * staging, run bookkeeping and error state (`sys_import_set_row.sys_import_state = error`) and keeps
 * only the mission logic here, called from the transform scripts of `tm_intake_authorization_line`:
 *
 *   - onBefore: the staging row (one award line of one source record) is re-serialised as a one-row
 *     delimited file and pushed through the *same* v1 parser/validators, so every DD-form rule
 *     (agency whitelist, record id format, quantity, engraving text, ZIP/state/email/phone…) applies;
 *     invalid rows become Import Set `error` rows and never touch a target table. Valid rows get an
 *     authorization-file task (one per file name and Import Set run), a de-duplicated requester and
 *     the awards-case fields. A record already loaded from an earlier file is a duplicate → `ignored`.
 *   - onAfter: the award line for this row is appended to the case (idempotent per award/device/text).
 *   - onComplete: the authorization-file task receives the run counters and its parse stage.
 */
import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { DELIMITED_COLUMNS, intakeCaseDescription, parseAuthorizationDelimited, type AuthorizationRecord } from '../lib/authFileParser.ts'
import { computeDedupeKey } from '../lib/dedupe.ts'
import { COMPANY_FIELDS, INTAKE_STAGING_TABLE, PLATFORM_TABLES, TABLES, TASK_PRIORITY_BY_HANDLING, taskStateForStage } from '../lib/domain.ts'
import { formatSecurityEvent, type SecurityEventType } from '../lib/logging.ts'
import { stagingValue, type BeforeResult } from '../migration/transformEngine.ts'
import { setJournal } from '../rules/glideSupport.ts'

type AnyRecord = GlideRecord<string>

export const INTAKE_COLUMNS = ['file_name', ...DELIMITED_COLUMNS] as const
export type IntakeColumn = (typeof INTAKE_COLUMNS)[number]
export type IntakeRow = Record<IntakeColumn, string>

export const DEFAULT_INTAKE_FILE_NAME = 'import-set-intake.txt'
export const INTAKE_REJECTED_MESSAGE = 'Rejected by intake validation'
export const INTAKE_DUPLICATE_MESSAGE = 'Duplicate source record'
export const INTAKE_CHANNEL = 'import_set'

// ---------------------------------------------------------------------------------------------
// pure: staging row → v1 parser → validated record
// ---------------------------------------------------------------------------------------------

const cell = (v: string | undefined): string => (v ?? '').replace(/[\t\r\n]+/g, ' ').trim()

/** One staging row as a single-record, tab-delimited authorization file (tabs/newlines inside a value are flattened). */
export function rowToDelimited(row: Partial<IntakeRow>): string {
    return `${DELIMITED_COLUMNS.join('\t')}\n${DELIMITED_COLUMNS.map((c) => cell(row[c])).join('\t')}`
}

export interface IntakeValidation {
    record?: AuthorizationRecord
    fileName: string
    /** `field: message` per issue; empty when the row is accepted. */
    issues: string[]
}

/** Validate a staging row with the ported v1 parser; the agency must be on the row (no file-level default). */
export function validateIntakeRow(row: Partial<IntakeRow>): IntakeValidation {
    const requested = cell(row.file_name) || DEFAULT_INTAKE_FILE_NAME
    const parsed = parseAuthorizationDelimited(rowToDelimited(row), requested)
    const issues = [...parsed.fileIssues, ...(parsed.rejected[0]?.issues ?? [])].map((i) => `${i.field}: ${i.message}`)
    const record = parsed.records[0]
    if (!record || issues.length > 0) return { fileName: parsed.file_name, issues: issues.length ? issues : ['record: no valid record in row'] }
    return { record, fileName: parsed.file_name, issues: [] }
}

export interface IntakeRunCounts {
    total: number
    inserted: number
    updated: number
    ignored: number
    error: number
}

export function intakeStage(c: Pick<IntakeRunCounts, 'inserted' | 'updated' | 'error'>): 'parsed' | 'partial' | 'failed' {
    if (c.inserted + c.updated === 0) return 'failed'
    return c.error > 0 ? 'partial' : 'parsed'
}

export function intakeParseLog(fileName: string, c: IntakeRunCounts, cases: number, lines: number): string {
    return [
        `Import Set intake ${fileName}: ${c.total} staging row(s)`,
        `accepted ${c.inserted + c.updated} (new cases ${c.inserted}, additional lines ${c.updated}), duplicates ignored ${c.ignored}, rejected ${c.error}`,
        `cases linked ${cases}, award lines ${lines}`,
    ].join('\n')
}

// ---------------------------------------------------------------------------------------------
// glide side
// ---------------------------------------------------------------------------------------------

function get(gr: AnyRecord, field: string): string {
    const v = gr.getValue(field)
    return v === null || v === undefined ? '' : String(v)
}

function insertedSysId(gr: AnyRecord): string {
    const id = gr.insert()
    return id === null || id === undefined ? '' : String(id)
}

function log(event: SecurityEventType, details: Record<string, string | number | boolean>, outcome: 'success' | 'blocked' | 'failure' = 'success'): void {
    gs.info(formatSecurityEvent({ event, user: gs.getUserName(), outcome, details }))
}

export function readIntakeRow(source: AnyRecord): IntakeRow {
    const row = {} as IntakeRow
    for (const c of INTAKE_COLUMNS) row[c] = stagingValue(source, c)
    return row
}

function agencyCompany(agency: string): string {
    const gr = new GlideRecord(PLATFORM_TABLES.company)
    gr.addQuery(COMPANY_FIELDS.agency_code, agency)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? String(gr.getUniqueValue()) : ''
}

/** One authorization-file task per (Import Set run, file name); the run link is the native import report. */
function ensureAuthorizationFile(fileName: string, record: AuthorizationRecord, importSet: string): string {
    const existing = new GlideRecord(TABLES.authorization_file)
    existing.addQuery('import_set', importSet)
    existing.addQuery('file_name', fileName)
    existing.setLimit(1)
    existing.query()
    if (existing.next()) return String(existing.getUniqueValue())

    const s = taskStateForStage('authorization_file', 'parsing')
    const gr = new GlideRecord(TABLES.authorization_file)
    gr.initialize()
    gr.setValue('legacy_unid', gs.generateGUID())
    gr.setValue('legacy_form', 'AuthorizationFile')
    gr.setValue('file_name', fileName)
    gr.setValue('source_agency', agencyCompany(record.source_agency))
    gr.setValue('format', 'delimited')
    gr.setValue('stage', 'parsing')
    gr.setValue('state', String(s.state))
    gr.setValue('active', s.active ? 'true' : 'false')
    gr.setValue('intake_channel', INTAKE_CHANNEL)
    gr.setValue('import_set', importSet)
    gr.setValue('submitted_by', gs.getUserID())
    gr.setValue('imported_at', new GlideDateTime().getValue())
    gr.setValue('short_description', `Authorization file ${fileName} (${record.source_agency.toUpperCase()}, Import Set API)`.slice(0, 160))
    const id = insertedSysId(gr)
    log('intake_received', { file: fileName, importSet, agency: record.source_agency, created: id !== '' }, id ? 'success' : 'failure')
    return id
}

function findOrCreateRequester(record: AuthorizationRecord): string {
    const rq = record.requester
    const key = computeDedupeKey({ type: rq.type, first_name: rq.first_name, last_name: rq.last_name, unit_name: rq.unit_name, service_number_last4: rq.service_number_last4, dob: rq.dob, email: rq.email, zip: rq.zip })
    if (key) {
        const existing = new GlideRecord(TABLES.requester)
        existing.addQuery('dedupe_key', key)
        existing.addNullQuery('merged_into')
        existing.setLimit(1)
        existing.query()
        if (existing.next()) return String(existing.getUniqueValue())
    }
    const gr = new GlideRecord(TABLES.requester)
    gr.initialize()
    gr.setValue('legacy_unid', gs.generateGUID())
    gr.setValue('legacy_form', 'Requester')
    gr.setValue('type', rq.type)
    gr.setValue('first_name', rq.first_name)
    gr.setValue('last_name', rq.last_name)
    gr.setValue('unit_name', rq.unit_name)
    gr.setValue('service_number_last4', rq.service_number_last4)
    if (rq.dob) gr.setValue('dob', rq.dob)
    gr.setValue('email', rq.email)
    gr.setValue('phone', rq.phone)
    gr.setValue('address_1', rq.address_1)
    gr.setValue('address_2', rq.address_2)
    gr.setValue('city', rq.city)
    gr.setValue('address_state', rq.state)
    gr.setValue('zip', rq.zip)
    gr.setValue('country', 'US')
    gr.setValue('state', 'active')
    gr.setValue('active', 'true')
    return insertedSysId(gr)
}

function reject(message: string, details: Record<string, string | number | boolean>): BeforeResult {
    log('intake_rejected', details, 'blocked')
    return { ignore: true, error: true, statusMessage: message.slice(0, 4000), warningCount: 1, quarantined: true }
}

/** The case a source record id already coalesces to, or '' (the transformer's own update flag is not reliable in onBefore). */
function existingCase(sourceRecordId: string): AnyRecord | null {
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('source_record_id', sourceRecordId)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr : null
}

/** onBefore of the intake transform: validate, resolve file/requester/agency, fill the case. */
export function intakeBefore(source: AnyRecord, target: AnyRecord, _isUpdateFlag: boolean): BeforeResult {
    const row = readIntakeRow(source)
    const importSet = get(source, 'sys_import_set')
    const v = validateIntakeRow(row)
    if (!v.record) {
        const message = `${INTAKE_REJECTED_MESSAGE}: ${v.issues.join('; ')}`
        noteRejectedRow(importSet, v.fileName, message)
        return reject(message, { importSet, recordId: cell(row.record_id).slice(0, 64), issues: v.issues.length })
    }
    const record = v.record
    const fileSysId = ensureAuthorizationFile(v.fileName, record, importSet)
    if (!fileSysId) return reject(`${INTAKE_REJECTED_MESSAGE}: authorization file task could not be created`, { importSet, file: v.fileName })

    const loaded = existingCase(record.source_record_id)
    if (loaded) {
        // Coalesced on source_record_id: another line of the same record in this run appends a line
        // (onAfter); the same record from an earlier file is a duplicate and is left `ignored`.
        if (get(loaded, 'authorization_file_task') !== fileSysId) {
            log('intake_rejected', { importSet, recordId: record.source_record_id, existingCase: get(loaded, 'number'), type: 'duplicate' }, 'blocked')
            return { ignore: true, error: false, statusMessage: `${INTAKE_DUPLICATE_MESSAGE}: ${record.source_record_id} already loaded as ${get(loaded, 'number')}`, warningCount: 1, quarantined: false }
        }
        return { ignore: false, error: false, statusMessage: `${INTAKE_ADDITIONAL_LINE_MESSAGE} ${get(loaded, 'number')}`, warningCount: 0, quarantined: false }
    }

    const requester = findOrCreateRequester(record)
    if (!requester) return reject(`${INTAKE_REJECTED_MESSAGE}: requester could not be created`, { importSet, recordId: record.source_record_id })

    const rq = record.requester
    const s = taskStateForStage('awards_case', 'authorized')
    const fields: Record<string, string> = {
        legacy_unid: gs.generateGUID(),
        legacy_form: 'AwardsCase',
        requester,
        authorization_file_task: fileSysId,
        source_agency: agencyCompany(record.source_agency),
        source_record_id: record.source_record_id,
        authorization_date: record.authorization_date,
        stage: 'authorized',
        state: String(s.state),
        active: s.active ? 'true' : 'false',
        priority: String(TASK_PRIORITY_BY_HANDLING.routine),
        handling_priority: 'routine',
        ship_to_name: record.ship_to || (rq.type === 'unit' ? rq.unit_name : `${rq.first_name} ${rq.last_name}`.trim()),
        ship_to_address_1: rq.address_1,
        ship_to_address_2: rq.address_2,
        ship_to_city: rq.city,
        ship_to_state: rq.state,
        ship_to_zip: rq.zip,
        ship_to_country: 'US',
        veteran_last_name: rq.type === 'unit' ? '' : rq.last_name,
        veteran_first_name: rq.type === 'unit' ? '' : rq.first_name,
        service_number_last4: rq.service_number_last4,
        short_description: intakeCaseDescription(record),
        work_notes: `[Intake] ${record.source_agency.toUpperCase()} record ${record.source_record_id} received through the Import Set API (file ${v.fileName}).`,
    }
    for (const [field, value] of Object.entries(fields)) {
        if (value === '' || !target.isValidField(field)) continue
        if (field === 'work_notes') setJournal(target, 'work_notes', value)
        else target.setValue(field, value)
    }
    log('intake_received', { importSet, recordId: record.source_record_id, agency: record.source_agency, file: v.fileName })
    return { ignore: false, error: false, statusMessage: '', warningCount: 0, quarantined: false }
}

function awardModel(key: string): string {
    const gr = new GlideRecord(TABLES.catalog_item)
    gr.addQuery('model_number', key)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? String(gr.getUniqueValue()) : ''
}

/** onAfter: append this row's award line to the (new or coalesced) case, once. */
export function intakeAfter(source: AnyRecord, target: AnyRecord): void {
    const v = validateIntakeRow(readIntakeRow(source))
    const award = v.record?.awards[0]
    const caseSysId = String(target.getUniqueValue() ?? '')
    if (!award || !caseSysId) return

    const lines = new GlideRecord(TABLES.award_line)
    lines.addQuery('awards_case', caseSysId)
    lines.query()
    let count = 0
    while (lines.next()) {
        count++
        if (get(lines, 'award_name') === award.award_name && get(lines, 'device') === award.device && get(lines, 'engraving_text') === award.engraving_text) return
    }

    const gr = new GlideRecord(TABLES.award_line)
    gr.initialize()
    gr.setValue('legacy_unid', gs.generateGUID())
    gr.setValue('legacy_form', 'AwardLine')
    gr.setValue('awards_case', caseSysId)
    gr.setValue('line_number', String(count + 1))
    gr.setValue('award_name', award.award_name)
    const model = awardModel(award.award_name)
    if (model) gr.setValue('award_model', model)
    gr.setValue('device', award.device)
    gr.setValue('quantity', String(award.quantity))
    gr.setValue('engraving_text', award.engraving_text)
    gr.setValue('engraving_required', award.engraving_required ? 'true' : 'false')
    gr.setValue('status', 'pending')
    gr.setValue('state', 'open')
    gr.setValue('active', 'true')
    const id = insertedSysId(gr)
    log('data_change', { table: TABLES.award_line, awardsCase: caseSysId, award: award.award_name, created: id !== '' }, id ? 'success' : 'failure')
}

export const INTAKE_ADDITIONAL_LINE_MESSAGE = 'Additional award line for'

/**
 * The Import Set engine writes a staging row's final state after onComplete has fired, so the row that
 * triggered this onComplete is still `pending`; its outcome is derived from the comment onBefore left on it.
 */
export function classifyPendingRow(comment: string): keyof Omit<IntakeRunCounts, 'total'> {
    if (comment.startsWith(INTAKE_REJECTED_MESSAGE)) return 'error'
    if (comment.startsWith(INTAKE_DUPLICATE_MESSAGE) || comment.startsWith(INTAKE_ADDITIONAL_LINE_MESSAGE)) return 'ignored'
    return 'inserted'
}

function countWhere(table: string, field: string, value: string): number {
    const gr = new GlideRecord(table)
    gr.addQuery(field, value)
    gr.query()
    return gr.getRowCount()
}

/** Staging-row outcomes of one file within one Import Set (the API reuses an open set across calls). */
export function intakeRunCounts(importSet: string, fileName: string): IntakeRunCounts {
    const counts: IntakeRunCounts = { total: 0, inserted: 0, updated: 0, ignored: 0, error: 0 }
    const gr = new GlideRecord(INTAKE_STAGING_TABLE)
    gr.addQuery('sys_import_set', importSet)
    gr.addQuery('file_name', fileName)
    gr.query()
    while (gr.next()) {
        counts.total++
        const state = get(gr, 'sys_import_state')
        const key = state === '' || state === 'pending' ? classifyPendingRow(get(gr, 'sys_import_state_comment')) : state
        if (key === 'inserted' || key === 'updated' || key === 'ignored' || key === 'error') counts[key]++
    }
    return counts
}

/**
 * A rejected row never reaches onComplete with its state committed, so its authorization-file task (when an
 * earlier valid row of the same file already created it) is updated here, from onBefore.
 */
function noteRejectedRow(importSet: string, fileName: string, message: string): void {
    if (!importSet || !fileName) return
    const files = new GlideRecord(TABLES.authorization_file)
    files.addQuery('import_set', importSet)
    files.addQuery('file_name', fileName)
    files.setLimit(1)
    files.query()
    if (!files.next()) return
    const counts = intakeRunCounts(importSet, fileName)
    counts.total++
    counts.error++
    const fileSysId = String(files.getUniqueValue())
    const cases = countWhere(TABLES.awards_case, 'authorization_file_task', fileSysId)
    const lines = countWhere(TABLES.award_line, 'awards_case.authorization_file_task', fileSysId)
    applyFileCounts(files, counts, cases, lines)
    setJournal(files, 'work_notes', message.slice(0, 4000))
    files.update()
}

function applyFileCounts(files: AnyRecord, counts: IntakeRunCounts, cases: number, lines: number): void {
    const stage = intakeStage(counts)
    const s = taskStateForStage('authorization_file', stage)
    files.setValue('record_count', String(counts.total))
    files.setValue('accepted_count', String(counts.inserted + counts.updated))
    files.setValue('rejected_count', String(counts.error))
    files.setValue('duplicate_count', String(counts.ignored))
    files.setValue('cases_created', String(cases))
    files.setValue('lines_created', String(lines))
    files.setValue('stage', stage)
    files.setValue('state', String(s.state))
    files.setValue('active', s.active ? 'true' : 'false')
    files.setValue('parse_log', intakeParseLog(get(files, 'file_name'), counts, cases, lines))
}

/** onComplete: the authorization-file task(s) of this run get the counters, parse stage and a work note. */
export function intakeComplete(importSet: string): { files: number; counts: IntakeRunCounts } {
    const counts: IntakeRunCounts = { total: 0, inserted: 0, updated: 0, ignored: 0, error: 0 }
    const files = new GlideRecord(TABLES.authorization_file)
    files.addQuery('import_set', importSet)
    files.query()
    let n = 0
    while (files.next()) {
        n++
        const fileSysId = String(files.getUniqueValue())
        const fileCounts = intakeRunCounts(importSet, get(files, 'file_name'))
        for (const k of Object.keys(counts) as (keyof IntakeRunCounts)[]) counts[k] += fileCounts[k]
        const cases = countWhere(TABLES.awards_case, 'authorization_file_task', fileSysId)
        const lines = countWhere(TABLES.award_line, 'awards_case.authorization_file_task', fileSysId)
        applyFileCounts(files, fileCounts, cases, lines)
        setJournal(files, 'work_notes', intakeParseLog(get(files, 'file_name'), fileCounts, cases, lines))
        files.update()
    }
    log('intake_completed', { importSet, files: n, ...counts })
    return { files: n, counts }
}

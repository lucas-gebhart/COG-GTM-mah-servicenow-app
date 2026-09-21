/**
 * Scripted REST handler for POST /api/x_cog_mah/authorization_intake.
 *
 * Replaces the `ImportAuthorizationFile` LotusScript agent, which read an HRC/NPRC
 * delimited drop file from a mail-in database and created AwardsCase / AwardLine
 * documents. The handler:
 *   1. enforces role + body size limits,
 *   2. parses JSON or delimited bodies with the pure, unit-tested parser,
 *   3. is idempotent on (source_agency, source_record_id) and on the whole-file hash,
 *   4. creates authorization_file + requester + awards_case + award_line records,
 *   5. returns only a generic summary to the caller and writes detailed JSON logs.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { parseAuthorizationFile, summarizeParse, type AuthorizationRecord, type ParsedAuthorizationFile } from '../lib/authFileParser'
import { computeDedupeKey } from '../lib/dedupe'
import { LIMITS, ROLES, TABLES } from '../lib/domain'
import { hasAnyRole, nowValue, securityLog, str } from '../rules/glideSupport'

/** Subset of the platform RESTAPIRequest / RESTAPIResponse surfaces used here. */
export interface IntakeRequest {
    body?: { dataString?: string }
    headers?: Record<string, string>
    queryParams?: Record<string, string[] | string>
    getHeader?: (name: string) => string | null
}
export interface IntakeResponse {
    setStatus: (code: number) => void
    setBody: (body: unknown) => void
    setHeader: (name: string, value: string) => void
}

export interface IntakeSummary {
    status: 'accepted' | 'duplicate' | 'rejected'
    authorization_file: string
    accepted: number
    rejected: number
    duplicates: number
    cases: string[]
}

const GENERIC_ERROR = 'The request could not be processed.'
const SAFE_FILE_NAME = /^[A-Za-z0-9._ -]{1,120}$/

/** Stable 16-hex-digit content hash (FNV-1a 64 emulated with two 32-bit lanes) — no crypto dependency needed for idempotency. */
export function contentHash(text: string): string {
    let h1 = 0x811c9dc5
    let h2 = 0x01000193
    for (let i = 0; i < text.length; i += 1) {
        const c = text.charCodeAt(i)
        h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0
        h2 = Math.imul(h2 ^ (c + i), 0x01000193) >>> 0
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
}

function header(request: IntakeRequest, name: string): string {
    if (typeof request.getHeader === 'function') {
        const v = request.getHeader(name)
        if (v) return String(v)
    }
    const headers = request.headers ?? {}
    for (const k of Object.keys(headers)) {
        if (k.toLowerCase() === name.toLowerCase()) return String(headers[k] ?? '')
    }
    return ''
}

function queryParam(request: IntakeRequest, name: string): string {
    const v = request.queryParams?.[name]
    if (Array.isArray(v)) return String(v[0] ?? '')
    return v === undefined ? '' : String(v)
}

function securityHeaders(response: IntakeResponse): void {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', "default-src 'none'")
}

function reject(response: IntakeResponse, status: number, reference: string): void {
    response.setStatus(status)
    response.setBody({ error: GENERIC_ERROR, reference })
}

/** Route handler (request, response) => void. */
export function authorizationIntake(request: IntakeRequest, response: IntakeResponse): void {
    const reference = gs.generateGUID()
    securityHeaders(response)
    try {
        if (!hasAnyRole(['tacom_staff', 'csr', 'admin'])) {
            securityLog({ event: 'authorization_failure', source: 'rest:authorization_intake', outcome: 'failure', reason: 'missing_role', details: { reference } })
            reject(response, 403, reference)
            return
        }
        const body = request.body?.dataString ?? ''
        if (body.length === 0) {
            securityLog({ event: 'intake_rejected', source: 'rest:authorization_intake', outcome: 'failure', reason: 'empty_body', details: { reference } })
            reject(response, 400, reference)
            return
        }
        if (body.length > LIMITS.maxIntakeBodyBytes) {
            securityLog({ event: 'intake_rejected', source: 'rest:authorization_intake', outcome: 'failure', reason: 'body_too_large', details: { reference, bytes: body.length } })
            reject(response, 413, reference)
            return
        }
        const contentType = header(request, 'Content-Type') || 'application/json'
        const requestedName = header(request, 'X-File-Name') || queryParam(request, 'file_name')
        const fileName = SAFE_FILE_NAME.test(requestedName) ? requestedName : undefined

        securityLog({
            event: 'intake_received',
            source: 'rest:authorization_intake',
            outcome: 'success',
            details: { reference, bytes: body.length, contentType, fileName: fileName ?? '' },
        })

        const hash = contentHash(body)
        const existing = new GlideRecord(TABLES.authorization_file)
        existing.addQuery('source_hash', hash)
        existing.setLimit(1)
        existing.query()
        if (existing.next()) {
            const summary: IntakeSummary = {
                status: 'duplicate',
                authorization_file: str(existing, 'number'),
                accepted: Number(str(existing, 'accepted_count') || 0),
                rejected: Number(str(existing, 'rejected_count') || 0),
                duplicates: Number(str(existing, 'duplicate_count') || 0),
                cases: caseNumbersForFile(existing.getUniqueValue()),
            }
            securityLog({ event: 'intake_completed', source: 'rest:authorization_intake', outcome: 'success', reason: 'duplicate_file', record: existing.getUniqueValue(), details: { reference } })
            response.setStatus(200)
            response.setBody(summary)
            return
        }

        const parsed = parseAuthorizationFile(body, contentType, fileName)
        const counts = summarizeParse(parsed)
        if (parsed.records.length === 0) {
            securityLog({
                event: 'intake_rejected',
                source: 'rest:authorization_intake',
                outcome: 'failure',
                reason: 'no_valid_records',
                details: { reference, rejected: counts.rejected, fileIssues: parsed.fileIssues.map((i) => `${i.field}:${i.code}`).join(';') },
            })
            reject(response, 400, reference)
            return
        }

        const result = loadParsedFile(parsed, hash, body.length)
        securityLog({
            event: 'intake_completed',
            source: 'rest:authorization_intake',
            outcome: 'success',
            table: TABLES.authorization_file,
            record: result.fileSysId,
            details: { reference, accepted: result.summary.accepted, rejected: result.summary.rejected, duplicates: result.summary.duplicates },
        })
        response.setStatus(201)
        response.setBody(result.summary)
    } catch (e) {
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
        securityLog({ event: 'intake_rejected', source: 'rest:authorization_intake', outcome: 'failure', reason: 'exception', details: { reference, message } })
        reject(response, 500, reference)
    }
}

function caseNumbersForFile(fileSysId: string): string[] {
    const out: string[] = []
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('authorization_file', fileSysId)
    gr.orderBy('number')
    gr.query()
    while (gr.next()) out.push(str(gr, 'number'))
    return out
}

export function loadParsedFile(parsed: ParsedAuthorizationFile, hash: string, bytes: number): { fileSysId: string; summary: IntakeSummary } {
    const file = new GlideRecord(TABLES.authorization_file)
    file.initialize()
    file.setValue('file_name', parsed.file_name)
    file.setValue('received', nowValue())
    file.setValue('source_agency', parsed.source_agency)
    file.setValue('format', parsed.format)
    file.setValue('record_count', String(parsed.records.length + parsed.rejected.length))
    file.setValue('parse_status', 'parsing')
    file.setValue('source_hash', hash)
    file.setValue('submitted_by', gs.getUserID())
    file.setValue('intake_channel', 'rest')
    file.setValue('legacy_form', 'AuthorizationFile')
    file.setValue('state', 'open')
    file.setValue('active', 'true')
    const fileSysId = String(file.insert())

    const cases: string[] = []
    let duplicates = 0
    let accepted = 0
    const log: string[] = [`bytes=${bytes}`, `format=${parsed.format}`]
    for (const issue of parsed.fileIssues) log.push(`file:${issue.field}:${issue.code}`)
    for (const r of parsed.rejected) log.push(`rejected:${r.source_record_id}:${r.issues.map((i) => `${i.field}/${i.code}`).join(',')}`)

    for (const record of parsed.records) {
        const existingCase = findCaseBySource(record)
        if (existingCase) {
            duplicates += 1
            log.push(`duplicate:${record.source_record_id}:${existingCase}`)
            continue
        }
        const requesterSysId = findOrCreateRequester(record)
        const caseNumber = createCase(record, requesterSysId, fileSysId)
        cases.push(caseNumber)
        accepted += 1
    }

    file.setValue('accepted_count', String(accepted))
    file.setValue('rejected_count', String(parsed.rejected.length))
    file.setValue('duplicate_count', String(duplicates))
    file.setValue('parse_status', accepted === 0 ? 'failed' : parsed.rejected.length > 0 || parsed.fileIssues.length > 0 ? 'partial' : 'parsed')
    file.setValue('parse_log', log.join('\n').slice(0, 8000))
    file.setValue('state', 'closed')
    file.setValue('active', 'false')
    file.update()

    return {
        fileSysId,
        summary: { status: 'accepted', authorization_file: str(file, 'number'), accepted, rejected: parsed.rejected.length, duplicates, cases },
    }
}

function findCaseBySource(record: AuthorizationRecord): string | null {
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('source_agency', record.source_agency)
    gr.addQuery('source_record_id', record.source_record_id)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? str(gr, 'number') : null
}

function findOrCreateRequester(record: AuthorizationRecord): string {
    const rq = record.requester
    const key = computeDedupeKey({
        type: rq.type,
        first_name: rq.first_name,
        last_name: rq.last_name,
        unit_name: rq.unit_name,
        service_number_last4: rq.service_number_last4,
        dob: rq.dob,
        email: rq.email,
        zip: rq.zip,
    })
    if (key) {
        const existing = new GlideRecord(TABLES.requester)
        existing.addQuery('dedupe_key', key)
        existing.addNullQuery('merged_into')
        existing.setLimit(1)
        existing.query()
        if (existing.next()) return existing.getUniqueValue()
    }
    const gr = new GlideRecord(TABLES.requester)
    gr.initialize()
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
    gr.setValue('legacy_form', 'Requester')
    return String(gr.insert())
}

function createCase(record: AuthorizationRecord, requesterSysId: string, fileSysId: string): string {
    const rq = record.requester
    const c = new GlideRecord(TABLES.awards_case)
    c.initialize()
    c.setValue('requester', requesterSysId)
    c.setValue('authorization_file', fileSysId)
    c.setValue('source_agency', record.source_agency)
    c.setValue('source_record_id', record.source_record_id)
    if (record.authorization_date) c.setValue('authorization_date', record.authorization_date)
    c.setValue('stage', 'authorized')
    c.setValue('state', 'open')
    c.setValue('active', 'true')
    c.setValue('legacy_form', 'AwardsCase')
    c.setValue('ship_to_name', record.ship_to || (rq.type === 'unit' ? rq.unit_name : `${rq.first_name} ${rq.last_name}`.trim()))
    c.setValue('ship_to_address_1', rq.address_1)
    c.setValue('ship_to_address_2', rq.address_2)
    c.setValue('ship_to_city', rq.city)
    c.setValue('ship_to_state', rq.state)
    c.setValue('ship_to_zip', rq.zip)
    c.setValue('ship_to_country', 'US')
    c.setValue('short_description', `${record.source_agency.toUpperCase()} authorization ${record.source_record_id} — ${record.awards.length} award line(s)`)
    const caseSysId = String(c.insert())

    let lineNo = 0
    for (const award of record.awards) {
        lineNo += 1
        const line = new GlideRecord(TABLES.award_line)
        line.initialize()
        line.setValue('awards_case', caseSysId)
        line.setValue('line_number', String(lineNo))
        line.setValue('award_name', award.award_name)
        line.setValue('device', award.device)
        line.setValue('quantity', String(award.quantity))
        line.setValue('engraving_text', award.engraving_text)
        line.setValue('engraving_required', award.engraving_required ? 'true' : 'false')
        line.setValue('status', 'pending')
        line.setValue('state', 'open')
        line.setValue('active', 'true')
        line.setValue('legacy_form', 'AwardLine')
        line.insert()
    }
    const saved = new GlideRecord(TABLES.awards_case)
    return saved.get(caseSysId) ? str(saved, 'number') : caseSysId
}

/** Roles allowed to call the intake endpoint (used by the REST ACL script). */
export const INTAKE_ROLES: readonly string[] = [ROLES.tacom_staff, ROLES.csr, ROLES.admin]

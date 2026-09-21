/**
 * Parser + validator for HRC / NPRC authorization files.
 *
 * Replaces the `ImportAuthorizationFile` LotusScript agent. Accepts either a JSON body
 * (`AuthorizationFilePayload`) or a delimited text file (pipe, comma or tab; header row
 * required; one row per award line) and produces fully validated, normalized case
 * records keyed on the source record id so the intake is idempotent.
 */
import { AWARD_CATALOG, AWARD_DEVICES, LIMITS, REQUESTER_TYPES, SOURCE_AGENCIES, type AwardKey, type RequesterType, type SourceAgency } from './domain'
import { normalizeLegacyDate } from './dates'
import {
    mergeResults,
    validateEmail,
    validateEngravingText,
    validateMultiline,
    validatePhone,
    validateQuantity,
    validateSafeText,
    type ValidationIssue,
    type ValidationResult,
} from './validators'

export interface AuthorizationAward {
    award_name: AwardKey
    device: keyof typeof AWARD_DEVICES
    quantity: number
    engraving_text: string
    engraving_required: boolean
}

export interface AuthorizationRequester {
    type: RequesterType
    first_name: string
    last_name: string
    unit_name: string
    service_number_last4: string
    dob: string
    email: string
    phone: string
    address_1: string
    address_2: string
    city: string
    state: string
    zip: string
}

export interface AuthorizationRecord {
    source_record_id: string
    source_agency: SourceAgency
    authorization_date: string
    requester: AuthorizationRequester
    ship_to: string
    awards: AuthorizationAward[]
}

export interface AuthorizationFilePayload {
    file_name?: unknown
    source_agency?: unknown
    records?: unknown
}

export interface ParsedAuthorizationFile {
    file_name: string
    source_agency: SourceAgency
    records: AuthorizationRecord[]
    /** Per-record issues; records with issues are excluded from `records`. */
    rejected: { source_record_id: string; issues: ValidationIssue[] }[]
    /** File-level issues (e.g. unknown columns, too many rows). */
    fileIssues: ValidationIssue[]
    format: 'json' | 'delimited'
}

/** Column contract for delimited files. Header names are matched case- and separator-insensitively. */
export const DELIMITED_COLUMNS = [
    'record_id',
    'agency',
    'authorization_date',
    'requester_type',
    'last_name',
    'first_name',
    'unit_name',
    'service_number_last4',
    'dob',
    'email',
    'phone',
    'address_1',
    'address_2',
    'city',
    'state',
    'zip',
    'ship_to',
    'award_name',
    'device',
    'quantity',
    'engraving_text',
    'engraving_required',
] as const
type DelimitedColumn = (typeof DELIMITED_COLUMNS)[number]

const REQUIRED_COLUMNS: readonly DelimitedColumn[] = ['record_id', 'agency', 'last_name', 'award_name', 'quantity']

const normalizeHeader = (h: string): string => h.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')

const HEADER_ALIASES: Readonly<Record<string, DelimitedColumn>> = {
    recordid: 'record_id',
    record_id: 'record_id',
    source_record_id: 'record_id',
    control_number: 'record_id',
    ctrl_no: 'record_id',
    agency: 'agency',
    source_agency: 'agency',
    source: 'agency',
    authorization_date: 'authorization_date',
    auth_date: 'authorization_date',
    date_authorized: 'authorization_date',
    requester_type: 'requester_type',
    type: 'requester_type',
    last_name: 'last_name',
    lastname: 'last_name',
    surname: 'last_name',
    first_name: 'first_name',
    firstname: 'first_name',
    given_name: 'first_name',
    unit_name: 'unit_name',
    unit: 'unit_name',
    service_number_last4: 'service_number_last4',
    svc_last4: 'service_number_last4',
    ssn_last4: 'service_number_last4',
    last4: 'service_number_last4',
    dob: 'dob',
    date_of_birth: 'dob',
    email: 'email',
    email_address: 'email',
    phone: 'phone',
    telephone: 'phone',
    address_1: 'address_1',
    address1: 'address_1',
    street: 'address_1',
    address_2: 'address_2',
    address2: 'address_2',
    city: 'city',
    state: 'state',
    zip: 'zip',
    zip_code: 'zip',
    postal_code: 'zip',
    ship_to: 'ship_to',
    shipto: 'ship_to',
    award_name: 'award_name',
    award: 'award_name',
    decoration: 'award_name',
    device: 'device',
    appurtenance: 'device',
    quantity: 'quantity',
    qty: 'quantity',
    engraving_text: 'engraving_text',
    engraving: 'engraving_text',
    engraving_required: 'engraving_required',
    engrave: 'engraving_required',
}

const RECORD_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

function str(v: unknown): string {
    return typeof v === 'string' ? v.trim() : typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''
}

function toBool(v: unknown): boolean | null {
    if (typeof v === 'boolean') return v
    const s = str(v).toLowerCase()
    if (['true', 'yes', 'y', '1', 'x'].includes(s)) return true
    if (['false', 'no', 'n', '0', ''].includes(s)) return false
    return null
}

const lookupIndex = <T extends Record<string, string>>(catalog: T): Map<string, keyof T> => {
    const idx = new Map<string, keyof T>()
    for (const [k, label] of Object.entries(catalog)) {
        idx.set(k.toLowerCase(), k)
        idx.set(label.toLowerCase().replace(/[^a-z0-9]/g, ''), k)
    }
    return idx
}
const AWARD_INDEX = lookupIndex(AWARD_CATALOG)
const DEVICE_INDEX = lookupIndex(AWARD_DEVICES)
const AGENCY_INDEX = lookupIndex(SOURCE_AGENCIES)
const REQUESTER_TYPE_INDEX = lookupIndex(REQUESTER_TYPES)

export function resolveAward(v: unknown): AwardKey | null {
    const s = str(v).toLowerCase()
    return (AWARD_INDEX.get(s) ?? AWARD_INDEX.get(s.replace(/[^a-z0-9]/g, '')) ?? null) as AwardKey | null
}

export function resolveDevice(v: unknown): keyof typeof AWARD_DEVICES | null {
    const s = str(v).toLowerCase()
    if (s === '') return 'none'
    return (DEVICE_INDEX.get(s) ?? DEVICE_INDEX.get(s.replace(/[^a-z0-9]/g, '')) ?? null) as keyof typeof AWARD_DEVICES | null
}

export function resolveAgency(v: unknown): SourceAgency | null {
    const s = str(v).toLowerCase()
    return (AGENCY_INDEX.get(s) ?? AGENCY_INDEX.get(s.replace(/[^a-z0-9]/g, '')) ?? null) as SourceAgency | null
}

export function resolveRequesterType(v: unknown): RequesterType | null {
    const s = str(v).toLowerCase()
    if (s === '') return 'veteran'
    return (REQUESTER_TYPE_INDEX.get(s) ?? REQUESTER_TYPE_INDEX.get(s.replace(/[^a-z0-9]/g, '')) ?? null) as RequesterType | null
}

interface RawRecord {
    source_record_id: unknown
    source_agency: unknown
    authorization_date: unknown
    requester: Record<string, unknown>
    ship_to: unknown
    awards: Record<string, unknown>[]
}

const issue = (field: string, code: string, message: string): ValidationResult => ({ valid: false, issues: [{ field, code, message }] })
const OK: ValidationResult = { valid: true, issues: [] }

function validateRecord(raw: RawRecord, defaultAgency: SourceAgency | null): { record?: AuthorizationRecord; issues: ValidationIssue[] } {
    const results: ValidationResult[] = []
    const id = str(raw.source_record_id)
    if (!RECORD_ID.test(id)) results.push(issue('source_record_id', 'format', 'Source record id must be 1–64 characters [A-Za-z0-9._-]'))

    const agency = resolveAgency(raw.source_agency) ?? defaultAgency
    if (!agency) results.push(issue('source_agency', 'whitelist', 'Source agency must be HRC, NPRC or Other'))

    let authDate = ''
    if (str(raw.authorization_date) !== '') {
        const d = normalizeLegacyDate(str(raw.authorization_date))
        if (!d) results.push(issue('authorization_date', 'format', 'Authorization date is not a recognized date'))
        else authDate = d.date
    }

    const rq = raw.requester
    const type = resolveRequesterType(rq['type'])
    if (!type) results.push(issue('requester.type', 'whitelist', 'Requester type must be Veteran, Next of kin or Unit'))
    results.push(validateSafeText('requester.last_name', str(rq['last_name']), LIMITS.name, type !== 'unit'))
    results.push(validateSafeText('requester.first_name', str(rq['first_name']), LIMITS.name))
    results.push(validateSafeText('requester.unit_name', str(rq['unit_name']), LIMITS.name, type === 'unit'))
    const last4 = str(rq['service_number_last4'])
    if (last4 !== '' && !/^\d{4}$/.test(last4)) results.push(issue('requester.service_number_last4', 'format', 'Service number last 4 must be 4 digits'))
    let dob = ''
    if (str(rq['dob']) !== '') {
        const d = normalizeLegacyDate(str(rq['dob']))
        if (!d) results.push(issue('requester.dob', 'format', 'DOB is not a recognized date'))
        else dob = d.date
    }
    results.push(validateEmail(str(rq['email']), 'requester.email'))
    results.push(validatePhone(str(rq['phone']), 'requester.phone'))
    results.push(validateSafeText('requester.address_1', str(rq['address_1']), 100))
    results.push(validateSafeText('requester.address_2', str(rq['address_2']), 100))
    results.push(validateSafeText('requester.city', str(rq['city']), 60))
    const state = str(rq['state']).toUpperCase()
    if (state !== '' && !/^[A-Z]{2}$/.test(state)) results.push(issue('requester.state', 'format', 'State must be a two-letter code'))
    const zip = str(rq['zip'])
    if (zip !== '' && !/^\d{5}(-\d{4})?$/.test(zip)) results.push(issue('requester.zip', 'format', 'ZIP must be 5 or 9 digits'))
    results.push(validateMultiline('ship_to', str(raw.ship_to), 500))

    if (raw.awards.length === 0) results.push(issue('awards', 'required', 'At least one award is required'))
    if (raw.awards.length > 50) results.push(issue('awards', 'range', 'A record may carry at most 50 awards'))
    const awards: AuthorizationAward[] = []
    raw.awards.forEach((a, i) => {
        const award = resolveAward(a['award_name'])
        if (!award) results.push(issue(`awards[${i}].award_name`, 'whitelist', 'Award is not in the catalog'))
        const device = resolveDevice(a['device'])
        if (!device) results.push(issue(`awards[${i}].device`, 'whitelist', 'Device/appurtenance is not recognized'))
        const qtyRaw = a['quantity'] === undefined || a['quantity'] === '' ? 1 : a['quantity']
        const qty = validateQuantity(qtyRaw, `awards[${i}].quantity`)
        results.push(qty)
        const text = str(a['engraving_text'])
        results.push(validateEngravingText(text, `awards[${i}].engraving_text`))
        const req = toBool(a['engraving_required'] ?? (text !== ''))
        if (req === null) results.push(issue(`awards[${i}].engraving_required`, 'format', 'Engraving required must be true/false'))
        if (award && device && qty.valid && req !== null) {
            awards.push({ award_name: award, device, quantity: Number(qtyRaw), engraving_text: text, engraving_required: req || text !== '' })
        }
    })

    const merged = mergeResults(results.length ? results : [OK])
    if (!merged.valid || !agency || !type) return { issues: merged.issues }
    return {
        record: {
            source_record_id: id,
            source_agency: agency,
            authorization_date: authDate,
            requester: {
                type,
                first_name: str(rq['first_name']),
                last_name: str(rq['last_name']),
                unit_name: str(rq['unit_name']),
                service_number_last4: last4,
                dob,
                email: str(rq['email']).toLowerCase(),
                phone: str(rq['phone']),
                address_1: str(rq['address_1']),
                address_2: str(rq['address_2']),
                city: str(rq['city']),
                state,
                zip,
            },
            ship_to: str(raw.ship_to),
            awards,
        },
        issues: [],
    }
}

function finish(fileName: string, agency: SourceAgency | null, raws: RawRecord[], fileIssues: ValidationIssue[], format: ParsedAuthorizationFile['format']): ParsedAuthorizationFile {
    const records: AuthorizationRecord[] = []
    const rejected: ParsedAuthorizationFile['rejected'] = []
    const seen = new Set<string>()
    for (const raw of raws) {
        const { record, issues } = validateRecord(raw, agency)
        if (!record) {
            rejected.push({ source_record_id: str(raw.source_record_id) || '(missing)', issues })
            continue
        }
        if (seen.has(record.source_record_id)) {
            rejected.push({ source_record_id: record.source_record_id, issues: [{ field: 'source_record_id', code: 'duplicate', message: 'Duplicate source record id within file' }] })
            continue
        }
        seen.add(record.source_record_id)
        records.push(record)
    }
    return { file_name: fileName, source_agency: agency ?? 'other', records, rejected, fileIssues, format }
}

function validateFileName(v: unknown, fallback: string): { name: string; issues: ValidationIssue[] } {
    const s = str(v) || fallback
    if (!/^[A-Za-z0-9._ -]{1,120}$/.test(s)) return { name: fallback, issues: [{ field: 'file_name', code: 'format', message: 'File name contains characters that are not permitted' }] }
    return { name: s, issues: [] }
}

/** Parse a JSON payload (already deserialized). */
export function parseAuthorizationJson(payload: unknown, fallbackName = 'authorization.json'): ParsedAuthorizationFile {
    const fileIssues: ValidationIssue[] = []
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
        return finish(fallbackName, null, [], [{ field: 'body', code: 'format', message: 'Body must be a JSON object' }], 'json')
    }
    const p = payload as AuthorizationFilePayload
    const fn = validateFileName(p.file_name, fallbackName)
    fileIssues.push(...fn.issues)
    const agency = p.source_agency === undefined ? null : resolveAgency(p.source_agency)
    if (p.source_agency !== undefined && !agency) fileIssues.push({ field: 'source_agency', code: 'whitelist', message: 'Source agency must be HRC, NPRC or Other' })
    if (!Array.isArray(p.records)) {
        fileIssues.push({ field: 'records', code: 'format', message: 'records must be an array' })
        return finish(fn.name, agency, [], fileIssues, 'json')
    }
    if (p.records.length > LIMITS.maxAuthorizationRecords) {
        fileIssues.push({ field: 'records', code: 'range', message: `A file may carry at most ${LIMITS.maxAuthorizationRecords} records` })
        return finish(fn.name, agency, [], fileIssues, 'json')
    }
    const raws: RawRecord[] = []
    for (const r of p.records) {
        if (typeof r !== 'object' || r === null) {
            fileIssues.push({ field: 'records', code: 'format', message: 'Each record must be an object' })
            continue
        }
        const rec = r as Record<string, unknown>
        const requester = typeof rec['requester'] === 'object' && rec['requester'] !== null ? (rec['requester'] as Record<string, unknown>) : {}
        const awards = Array.isArray(rec['awards']) ? (rec['awards'] as unknown[]).filter((a): a is Record<string, unknown> => typeof a === 'object' && a !== null) : []
        raws.push({
            source_record_id: rec['source_record_id'] ?? rec['record_id'],
            source_agency: rec['source_agency'] ?? p.source_agency,
            authorization_date: rec['authorization_date'],
            requester,
            ship_to: rec['ship_to'],
            awards,
        })
    }
    return finish(fn.name, agency, raws, fileIssues, 'json')
}

export function detectDelimiter(headerLine: string): '|' | ',' | '\t' {
    const counts: [string, number][] = [
        ['|', (headerLine.match(/\|/g) ?? []).length],
        ['\t', (headerLine.match(/\t/g) ?? []).length],
        [',', (headerLine.match(/,/g) ?? []).length],
    ]
    counts.sort((a, b) => b[1] - a[1])
    return (counts[0]?.[0] ?? ',') as '|' | ',' | '\t'
}

/** Minimal RFC-4180-ish splitter supporting double-quoted fields with doubled quotes. */
export function splitDelimited(line: string, delimiter: string): string[] {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"'
                    i++
                } else inQuotes = false
            } else cur += ch
        } else if (ch === '"') inQuotes = true
        else if (ch === delimiter) {
            out.push(cur)
            cur = ''
        } else cur += ch
    }
    out.push(cur)
    return out
}

/** Parse a delimited (pipe/comma/tab) text file; one row per award line, grouped by record id. */
export function parseAuthorizationDelimited(text: string, fileName = 'authorization.txt', defaultAgency?: unknown): ParsedAuthorizationFile {
    const fileIssues: ValidationIssue[] = []
    const fn = validateFileName(fileName, 'authorization.txt')
    fileIssues.push(...fn.issues)
    if (text.length > LIMITS.maxIntakeBodyBytes) {
        return finish(fn.name, null, [], [{ field: 'body', code: 'range', message: 'File exceeds the maximum accepted size' }], 'delimited')
    }
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '' && !l.startsWith('#'))
    const headerLine = lines.shift()
    if (!headerLine) return finish(fn.name, null, [], [{ field: 'body', code: 'required', message: 'File is empty' }], 'delimited')
    const delimiter = detectDelimiter(headerLine)
    const headers = splitDelimited(headerLine, delimiter).map((h) => HEADER_ALIASES[normalizeHeader(h)])
    const unknown = splitDelimited(headerLine, delimiter).filter((_, i) => headers[i] === undefined)
    if (unknown.length) fileIssues.push({ field: 'header', code: 'unknown_columns', message: `Unrecognized columns ignored: ${unknown.length}` })
    for (const req of REQUIRED_COLUMNS) {
        if (!headers.includes(req)) fileIssues.push({ field: 'header', code: 'missing_column', message: `Required column missing: ${req}` })
    }
    if (fileIssues.some((i) => i.code === 'missing_column')) return finish(fn.name, null, [], fileIssues, 'delimited')
    if (lines.length > LIMITS.maxAuthorizationRecords * 5) {
        return finish(fn.name, null, [], [{ field: 'body', code: 'range', message: 'File has too many rows' }], 'delimited')
    }

    const agency = defaultAgency === undefined ? null : resolveAgency(defaultAgency)
    const byId = new Map<string, RawRecord>()
    const order: string[] = []
    lines.forEach((line, n) => {
        const cells = splitDelimited(line, delimiter)
        const row: Partial<Record<DelimitedColumn, string>> = {}
        headers.forEach((h, i) => {
            if (h) row[h] = (cells[i] ?? '').trim()
        })
        const id = row.record_id ?? ''
        if (id === '') {
            fileIssues.push({ field: `row[${n + 2}]`, code: 'required', message: 'record_id is empty' })
            return
        }
        let rec = byId.get(id)
        if (!rec) {
            rec = {
                source_record_id: id,
                source_agency: row.agency ?? '',
                authorization_date: row.authorization_date ?? '',
                requester: {
                    type: row.requester_type ?? '',
                    last_name: row.last_name ?? '',
                    first_name: row.first_name ?? '',
                    unit_name: row.unit_name ?? '',
                    service_number_last4: row.service_number_last4 ?? '',
                    dob: row.dob ?? '',
                    email: row.email ?? '',
                    phone: row.phone ?? '',
                    address_1: row.address_1 ?? '',
                    address_2: row.address_2 ?? '',
                    city: row.city ?? '',
                    state: row.state ?? '',
                    zip: row.zip ?? '',
                },
                ship_to: row.ship_to ?? '',
                awards: [],
            }
            byId.set(id, rec)
            order.push(id)
        }
        rec.awards.push({
            award_name: row.award_name ?? '',
            device: row.device ?? '',
            quantity: row.quantity ?? '',
            engraving_text: row.engraving_text ?? '',
            engraving_required: row.engraving_required ?? '',
        })
    })
    const raws = order.map((id) => byId.get(id)).filter((r): r is RawRecord => r !== undefined)
    if (raws.length > LIMITS.maxAuthorizationRecords) {
        return finish(fn.name, agency, [], [{ field: 'body', code: 'range', message: `A file may carry at most ${LIMITS.maxAuthorizationRecords} records` }], 'delimited')
    }
    return finish(fn.name, agency, raws, fileIssues, 'delimited')
}

/** Dispatch on content type / body shape. */
export function parseAuthorizationFile(body: string, contentType: string, fileName?: string): ParsedAuthorizationFile {
    const ct = contentType.toLowerCase()
    const trimmed = body.trimStart()
    if (ct.includes('json') || trimmed.startsWith('{')) {
        try {
            return parseAuthorizationJson(JSON.parse(body), fileName ?? 'authorization.json')
        } catch {
            return finish(fileName ?? 'authorization.json', null, [], [{ field: 'body', code: 'format', message: 'Body is not valid JSON' }], 'json')
        }
    }
    return parseAuthorizationDelimited(body, fileName ?? 'authorization.txt')
}

export function summarizeParse(p: ParsedAuthorizationFile): { records: number; awardLines: number; rejected: number; fileIssues: number } {
    return {
        records: p.records.length,
        awardLines: p.records.reduce((n, r) => n + r.awards.length, 0),
        rejected: p.rejected.length,
        fileIssues: p.fileIssues.length,
    }
}

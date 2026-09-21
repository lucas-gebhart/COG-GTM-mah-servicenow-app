/**
 * Whitelist validators for user-supplied values. Every validator is total (never throws)
 * and returns a structured result so callers can surface a generic message to the user
 * while logging the specific reason server-side.
 *
 * Replaces the legacy @Formula input translation/validation on the DD Form 1348-6 XPage
 * and the QuerySave LotusScript on the `Request` form.
 */
import { LIMITS } from './domain'

export interface ValidationIssue {
    field: string
    code: string
    message: string
}

export interface ValidationResult {
    valid: boolean
    issues: ValidationIssue[]
}

const ok = (): ValidationResult => ({ valid: true, issues: [] })
const fail = (field: string, code: string, message: string): ValidationResult => ({
    valid: false,
    issues: [{ field, code, message }],
})

/** Uppercase A–Z and digits only; the alphabet used by DODAACs, UICs and document serials. */
const ALNUM_UPPER = /^[A-Z0-9]+$/
/** Domino UNIDs are 32 hex characters. */
const UNID = /^[0-9A-F]{32}$/i
/** Very conservative e-mail whitelist (no display names, no comments). */
const EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,189}\.[A-Za-z]{2,24}$/
/** Digits, spaces, dashes, dots, parentheses and a leading plus. */
const PHONE = /^\+?[0-9(][0-9 ().-]{6,23}$/
/** Names, unit designations and addresses: letters, digits, space and a short punctuation whitelist. */
const SAFE_TEXT = /^[A-Za-z0-9 .,'&/()#:-]*$/
/** Multi-line justification text: SAFE_TEXT plus newlines, semicolons, question and quotation marks. */
const SAFE_MULTILINE = /^[A-Za-z0-9 .,'&/()#:;?"!\r\n-]*$/
/** Engraving text: letters, digits, spaces, period, comma, apostrophe, hyphen, ampersand, slash. */
const ENGRAVING = /^[A-Za-z0-9 .,'&/-]*$/
/** NSN: 4-digit FSC + 2-digit NCB + 7-digit item number, dashes optional. */
const NSN = /^\d{4}-?\d{2}-?\d{3}-?\d{4}$/
/** CAGE code: 5 alphanumeric characters, never containing I or O. */
const CAGE = /^[0-9A-HJ-NP-Z]{5}$/

/** Leading DODAAC character identifies the owning service/agency. */
export const DODAAC_SERVICE_CODES: Readonly<Record<string, string>> = {
    W: 'Army',
    N: 'Navy',
    F: 'Air Force',
    M: 'Marine Corps',
    Z: 'Coast Guard',
    H: 'Defense agencies',
    S: 'Defense Logistics Agency',
    E: 'Defense Contract Management Agency',
    R: 'Navy (Reserve)',
    V: 'Navy (Ships)',
}

export function isSafeText(value: string, max: number = LIMITS.name): boolean {
    return value.length <= max && SAFE_TEXT.test(value)
}

export function isSafeMultiline(value: string, max: number = LIMITS.justification): boolean {
    return value.length <= max && SAFE_MULTILINE.test(value)
}

export function validateSafeText(field: string, value: unknown, max: number = LIMITS.name, required = false): ValidationResult {
    if (typeof value !== 'string') return fail(field, 'type', `${field} must be text`)
    if (required && value.trim() === '') return fail(field, 'required', `${field} is required`)
    if (value.length > max) return fail(field, 'length', `${field} exceeds ${max} characters`)
    if (!SAFE_TEXT.test(value)) return fail(field, 'charset', `${field} contains characters that are not permitted`)
    return ok()
}

export function validateMultiline(field: string, value: unknown, max: number = LIMITS.justification): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string') return fail(field, 'type', `${field} must be text`)
    if (value.length > max) return fail(field, 'length', `${field} exceeds ${max} characters`)
    if (!SAFE_MULTILINE.test(value)) return fail(field, 'charset', `${field} contains characters that are not permitted`)
    return ok()
}

export function validateLegacyUnid(value: unknown, field = 'legacy_unid'): ValidationResult {
    if (typeof value !== 'string' || value.length !== LIMITS.legacyUnid || !UNID.test(value)) {
        return fail(field, 'format', 'Legacy UNID must be 32 hexadecimal characters')
    }
    return ok()
}

export function validateEmail(value: unknown, field = 'email'): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string' || value.length > LIMITS.email || !EMAIL.test(value)) {
        return fail(field, 'format', 'E-mail address is not in an accepted format')
    }
    return ok()
}

export function validatePhone(value: unknown, field = 'phone'): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string' || value.length > LIMITS.phone || !PHONE.test(value)) {
        return fail(field, 'format', 'Phone number is not in an accepted format')
    }
    return ok()
}

export function validateEngravingText(value: unknown, field = 'engraving_text'): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string') return fail(field, 'type', 'Engraving text must be text')
    if (value.length > LIMITS.engravingText) {
        return fail(field, 'length', `Engraving text exceeds ${LIMITS.engravingText} characters`)
    }
    if (!ENGRAVING.test(value)) return fail(field, 'charset', 'Engraving text contains characters that cannot be engraved')
    return ok()
}

export function validateQuantity(value: unknown, field = 'quantity', max: number = LIMITS.maxQuantity): ValidationResult {
    const n = typeof value === 'string' ? Number(value.trim()) : value
    if (typeof n !== 'number' || !Number.isInteger(n)) return fail(field, 'type', `${field} must be a whole number`)
    if (n < 1 || n > max) return fail(field, 'range', `${field} must be between 1 and ${max}`)
    return ok()
}

export function validateNsn(value: unknown, field = 'nsn_or_exception'): ValidationResult {
    if (typeof value !== 'string' || value.trim() === '') return fail(field, 'required', 'NSN or exception code is required')
    const v = value.trim().toUpperCase()
    if (NSN.test(v)) return ok()
    // Exception (non-standard / local stock) codes: "EXC-" + up to 12 alphanumerics.
    if (/^EXC-[A-Z0-9]{1,12}$/.test(v)) return ok()
    return fail(field, 'format', 'Enter a 13-digit NSN (e.g. 8345-01-123-4567) or an exception code EXC-XXXX')
}

export function validateCageCode(value: unknown, field = 'cage_code'): ValidationResult {
    if (typeof value !== 'string' || !CAGE.test(value.toUpperCase())) {
        return fail(field, 'format', 'CAGE code must be 5 alphanumeric characters (letters I and O are not used)')
    }
    return ok()
}

// ---------------------------------------------------------------------------------------
// DD Form 1348-6 header validation
// ---------------------------------------------------------------------------------------

export function validateDodaac(value: unknown, field = 'dodaac'): ValidationResult {
    if (typeof value !== 'string') return fail(field, 'type', 'DODAAC must be text')
    const v = value.toUpperCase()
    if (v.length !== LIMITS.dodaac || !ALNUM_UPPER.test(v)) {
        return fail(field, 'format', 'DODAAC must be exactly 6 alphanumeric characters')
    }
    if (!(v.charAt(0) in DODAAC_SERVICE_CODES)) {
        return fail(field, 'service_code', `DODAAC service designator "${v.charAt(0)}" is not recognized`)
    }
    return ok()
}

export function validateUic(value: unknown, field = 'uic'): ValidationResult {
    if (typeof value !== 'string') return fail(field, 'type', 'UIC must be text')
    const v = value.toUpperCase()
    if (!/^W[A-Z0-9]{5}$/.test(v)) return fail(field, 'format', 'UIC must be "W" followed by 5 alphanumeric characters')
    return ok()
}

export function validateRequisitionPriority(value: unknown, field = 'requisition_priority'): ValidationResult {
    const s = typeof value === 'number' ? String(value).padStart(2, '0') : typeof value === 'string' ? value.trim() : ''
    if (!/^\d{2}$/.test(s)) return fail(field, 'format', 'Requisition priority must be a two-digit code 01–15')
    const n = Number(s)
    if (n < 1 || n > 15) return fail(field, 'range', 'Requisition priority must be between 01 and 15')
    return ok()
}

export function validateProjectCode(value: unknown, field = 'project_code'): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string' || !/^[A-Z0-9]{3}$/.test(value.toUpperCase())) {
        return fail(field, 'format', 'Project code must be 3 alphanumeric characters')
    }
    return ok()
}

export function validateFundCode(value: unknown, field = 'fund_code'): ValidationResult {
    if (value === undefined || value === null || value === '') return ok()
    if (typeof value !== 'string' || !/^[A-Z0-9]{2}$/.test(value.toUpperCase())) {
        return fail(field, 'format', 'Fund code must be 2 alphanumeric characters')
    }
    return ok()
}

/** Julian date used in MILSTRIP document numbers: last digit of year + day-of-year 001–366. */
export function isValidJulianDate(value: string): boolean {
    if (!/^\d{4}$/.test(value)) return false
    const doy = Number(value.slice(1))
    return doy >= 1 && doy <= 366
}

/**
 * Document number (14): DODAAC (6) + Julian date (4) + serial (4).
 * When `dodaac` is supplied the first six characters must match it.
 */
export function validateDocumentNumber(value: unknown, dodaac?: string, field = 'document_number'): ValidationResult {
    if (typeof value !== 'string') return fail(field, 'type', 'Document number must be text')
    const v = value.toUpperCase()
    if (v.length !== LIMITS.documentNumber || !ALNUM_UPPER.test(v)) {
        return fail(field, 'format', 'Document number must be exactly 14 alphanumeric characters')
    }
    const docDodaac = v.slice(0, 6)
    const julian = v.slice(6, 10)
    const serial = v.slice(10)
    const dodaacCheck = validateDodaac(docDodaac, field)
    if (!dodaacCheck.valid) return fail(field, 'dodaac', 'Document number must begin with a valid DODAAC')
    if (!isValidJulianDate(julian)) return fail(field, 'julian', 'Document number positions 7–10 must be a Julian date (YDDD)')
    if (!ALNUM_UPPER.test(serial)) return fail(field, 'serial', 'Document number serial must be 4 alphanumeric characters')
    if (dodaac && docDodaac !== dodaac.toUpperCase()) {
        return fail(field, 'mismatch', 'Document number DODAAC does not match the DODAAC field')
    }
    return ok()
}

export interface Dd1348Header {
    document_number?: unknown
    dodaac?: unknown
    uic?: unknown
    requisition_priority?: unknown
    project_code?: unknown
    fund_code?: unknown
    requester_poc?: unknown
    ship_to?: unknown
    justification?: unknown
}

/** Full DD Form 1348-6 header validation used by the business rule, client script and record producer. */
export function validateDd1348Header(header: Dd1348Header): ValidationResult {
    const dodaac = typeof header.dodaac === 'string' ? header.dodaac : undefined
    const results = [
        validateDodaac(header.dodaac),
        validateUic(header.uic),
        validateRequisitionPriority(header.requisition_priority),
        validateProjectCode(header.project_code),
        validateFundCode(header.fund_code),
        validateDocumentNumber(header.document_number, dodaac),
        validateSafeText('requester_poc', header.requester_poc ?? '', LIMITS.name, true),
        validateMultiline('ship_to', header.ship_to, 500),
        validateMultiline('justification', header.justification),
    ]
    return mergeResults(results)
}

export function mergeResults(results: ValidationResult[]): ValidationResult {
    const issues = results.flatMap((r) => r.issues)
    return { valid: issues.length === 0, issues }
}

/**
 * Generic message shown to callers/users. Specific issues are only logged server-side.
 * Keeps error text stable so it cannot be used to probe validation internals.
 */
export const GENERIC_VALIDATION_MESSAGE = 'One or more values were not accepted. Please review the highlighted fields.'

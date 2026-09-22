/**
 * Status inquiry: a veteran / next of kin / unit asks "where is my case?" by case number
 * plus one identity fact (last four of the service number or the requester's ZIP). Replaces
 * the anonymous `StatusLookup` XPage. Only the stage, aging band and last customer-visible
 * note are returned; PII on the requester is never echoed back.
 */
import { GlideRecord } from '@servicenow/glide'
import { TABLES } from '../lib/domain.ts'
import { validateSafeText } from '../lib/validators.ts'
import { securityLog, str, type AnyRecord } from '../rules/glideSupport.ts'

export interface StatusInquiryInput {
    case_number: string
    service_number_last4?: string
    zip?: string
}

export interface StatusInquiryResult {
    found: boolean
    /** Generic sentence safe to show to an anonymous requester. */
    message: string
    case_number?: string
    stage?: string
    stage_label?: string
    days_in_stage?: number
    aging_flag?: string
    last_update?: string
    latest_note?: string
    line_count?: number
    shipped?: string
    tracking_number?: string
}

const NOT_FOUND: StatusInquiryResult = {
    found: false,
    message: 'No case matched the details provided. Check the case number and identity information and try again.',
}

const CASE_NUMBER = /^MAH\d{7}$/

/** Pure input check, unit-tested; the record producer calls it client side too. */
export function validateInquiry(input: StatusInquiryInput): { valid: boolean; reason?: string } {
    const num = (input.case_number || '').trim().toUpperCase()
    if (!CASE_NUMBER.test(num)) return { valid: false, reason: 'Case number must look like MAH0001234' }
    const last4 = (input.service_number_last4 || '').trim()
    const zip = (input.zip || '').trim()
    if (!last4 && !zip) return { valid: false, reason: 'Provide the last four of the service number or the mailing ZIP code' }
    if (last4 && !/^\d{4}$/.test(last4)) return { valid: false, reason: 'Last four must be 4 digits' }
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) return { valid: false, reason: 'ZIP must be 5 digits (optionally +4)' }
    return { valid: true }
}

export function lookupCaseStatus(input: StatusInquiryInput): StatusInquiryResult {
    const check = validateInquiry(input)
    if (!check.valid) {
        securityLog({ event: 'validation_failure', table: TABLES.awards_case, outcome: 'failure', details: { reason: check.reason ?? '' } })
        return { found: false, message: check.reason ?? NOT_FOUND.message }
    }
    const num = input.case_number.trim().toUpperCase()
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('number', num)
    const last4 = (input.service_number_last4 || '').trim()
    const zip = (input.zip || '').trim()
    if (last4) gr.addQuery('requester.service_number_last4', last4)
    if (zip) gr.addQuery('requester.zip', 'STARTSWITH', zip.slice(0, 5))
    gr.setLimit(1)
    gr.query()
    if (!gr.next()) {
        securityLog({ event: 'data_access', table: TABLES.awards_case, outcome: 'failure', details: { case_number: num, reason: 'no_match' } })
        return NOT_FOUND
    }
    securityLog({ event: 'data_access', table: TABLES.awards_case, record: gr.getUniqueValue(), outcome: 'success', details: { case_number: num, channel: 'status_inquiry' } })
    return describeCase(gr)
}

export function describeCase(gr: AnyRecord): StatusInquiryResult {
    const result: StatusInquiryResult = {
        found: true,
        message: `Case ${str(gr, 'number')} is ${gr.getDisplayValue('stage')}.`,
        case_number: str(gr, 'number'),
        stage: str(gr, 'stage'),
        stage_label: gr.getDisplayValue('stage'),
        days_in_stage: Number(str(gr, 'days_in_stage') || 0),
        aging_flag: str(gr, 'aging_flag'),
        last_update: str(gr, 'sys_updated_on'),
        line_count: 0,
    }
    const lines = new GlideRecord(TABLES.award_line)
    lines.addQuery('awards_case', gr.getUniqueValue())
    lines.query()
    result.line_count = lines.getRowCount()

    const note = new GlideRecord(TABLES.case_note)
    note.addQuery('awards_case', gr.getUniqueValue())
    note.addQuery('customer_visible', 'true')
    note.orderByDesc('sys_created_on')
    note.setLimit(1)
    note.query()
    if (note.next()) {
        const body = str(note, 'body')
        result.latest_note = validateSafeText('body', body, 400, false).valid ? body : ''
    }

    const ship = new GlideRecord(TABLES.shipment)
    ship.addQuery('awards_case', gr.getUniqueValue())
    ship.orderByDesc('sys_created_on')
    ship.setLimit(1)
    ship.query()
    if (ship.next()) {
        result.shipped = str(ship, 'shipped')
        result.tracking_number = str(ship, 'tracking_number')
    }
    return result
}

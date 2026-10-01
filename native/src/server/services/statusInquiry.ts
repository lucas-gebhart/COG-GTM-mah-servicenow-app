/**
 * Status inquiry: a veteran / next of kin / unit asks "where is my case?" by case number
 * plus one identity fact (last four of the service number or the requester's ZIP). Replaces
 * the anonymous `StatusLookup` XPage. Only the stage, SLA band and last customer-visible
 * comment are returned; PII on the requester is never echoed back.
 *
 * Native differences from v1: the aging band comes from the case's `task_sla` rows (no
 * persisted days_in_stage / aging_flag) and the latest note is the newest `comments` journal
 * entry (sys_journal_field) instead of a CaseNote row.
 */
import { GlideRecord } from '@servicenow/glide'
import { NUMBER_PREFIXES, PLATFORM_TABLES, SLA_DEFINITIONS, TABLES } from '../lib/domain.ts'
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
    /** green / amber / red derived from the two Task SLAs on the case. */
    aging_flag?: string
    sla_percentage?: number
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

export const CASE_NUMBER = new RegExp(`^${NUMBER_PREFIXES.awards_case}\\d{7}$`)

/** Pure input check, unit-tested; the record producer calls it client side too. */
export function validateInquiry(input: StatusInquiryInput): { valid: boolean; reason?: string } {
    const num = (input.case_number || '').trim().toUpperCase()
    if (!CASE_NUMBER.test(num)) return { valid: false, reason: `Case number must look like ${NUMBER_PREFIXES.awards_case}0001234` }
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

/** Aging band from the case's Task SLAs: red once the 75-day SLA breached, amber once the 60-day one did. */
export function slaBand(caseSysId: string): { aging_flag: string; sla_percentage: number } {
    let amberBreached = false
    let redBreached = false
    let percentage = 0
    const sla = new GlideRecord(PLATFORM_TABLES.task_sla)
    sla.addQuery('task', caseSysId)
    sla.query()
    while (sla.next()) {
        const name = sla.getDisplayValue('sla')
        const breached = str(sla, 'has_breached') === 'true'
        if (name === SLA_DEFINITIONS.red.name) {
            redBreached = redBreached || breached
            percentage = Math.max(percentage, Number(str(sla, 'percentage') || 0))
        } else if (name === SLA_DEFINITIONS.amber.name) {
            amberBreached = amberBreached || breached
        }
    }
    return { aging_flag: redBreached ? 'red' : amberBreached ? 'amber' : 'green', sla_percentage: Math.round(percentage) }
}

export function describeCase(gr: AnyRecord): StatusInquiryResult {
    const band = slaBand(gr.getUniqueValue())
    const result: StatusInquiryResult = {
        found: true,
        message: `Case ${str(gr, 'number')} is ${gr.getDisplayValue('stage')}.`,
        case_number: str(gr, 'number'),
        stage: str(gr, 'stage'),
        stage_label: gr.getDisplayValue('stage'),
        aging_flag: band.aging_flag,
        sla_percentage: band.sla_percentage,
        last_update: str(gr, 'sys_updated_on'),
        line_count: 0,
    }
    const lines = new GlideRecord(TABLES.award_line)
    lines.addQuery('awards_case', gr.getUniqueValue())
    lines.query()
    result.line_count = lines.getRowCount()

    const note = new GlideRecord(PLATFORM_TABLES.journal)
    note.addQuery('element_id', gr.getUniqueValue())
    note.addQuery('element', 'comments')
    note.orderByDesc('sys_created_on')
    note.setLimit(1)
    note.query()
    if (note.next()) {
        const body = str(note, 'value')
        result.latest_note = validateSafeText('body', body, 400, false).valid ? body : ''
    }

    const ship = new GlideRecord(TABLES.shipment)
    ship.addQuery('parent', gr.getUniqueValue())
    ship.orderByDesc('sys_created_on')
    ship.setLimit(1)
    ship.query()
    if (ship.next()) {
        result.shipped = str(ship, 'shipped')
        result.tracking_number = str(ship, 'tracking_number')
    }
    return result
}

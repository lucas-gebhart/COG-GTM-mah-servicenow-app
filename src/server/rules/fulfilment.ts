/**
 * Business rules for the fulfilment tables: engraving jobs, shipments, SES flag requests
 * and case notes.
 *
 * Replaces the `EngravingJob` / `ShipmentRecord` PostSave agents that stamped Started /
 * Completed / Shipped timestamps and advanced the parent AwardsCase, and the `SESFlag`
 * form validation formulas.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { EVENTS, TABLES } from '../lib/domain.ts'
import { mergeResults, validateEmail, validateEngravingText, validateMultiline, validatePhone, validateQuantity, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, nowValue, securityLog, setIfEmpty, str, type AnyRecord } from './glideSupport.ts'

// ---------------------------------------------------------------- engraving job

export function engravingJobBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.engraving_job
    const result = mergeResults([validateEngravingText(str(current, 'text'), 'text'), validateMultiline('qc_notes', str(current, 'qc_notes'), 2000)])
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    const status = str(current, 'status')
    const statusChanged = current.isNewRecord() || Boolean(current.getElement('status')?.changes())
    if (statusChanged) {
        if (status === 'in_progress') {
            setIfEmpty(current, 'started', nowValue())
            if (str(current, 'engraver') === '') current.setValue('engraver', gs.getUserID())
        }
        if (status === 'complete') {
            setIfEmpty(current, 'started', nowValue())
            current.setValue('completed', nowValue())
        }
        if (status === 'rework' && previous) {
            current.setValue('rework_count', String(Number(str(previous, 'rework_count') || 0) + 1))
            current.setValue('completed', '')
        }
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'EngravingJob')
        if (str(current, 'awards_case') === '' && str(current, 'award_line') !== '') {
            const line = new GlideRecord(TABLES.award_line)
            if (line.get(str(current, 'award_line'))) current.setValue('awards_case', str(line, 'awards_case'))
        }
    }
    current.setValue('active', status === 'complete' || status === 'cancelled' ? 'false' : 'true')
    current.setValue('state', status === 'cancelled' ? 'cancelled' : status === 'complete' ? 'closed' : status === 'unmapped' ? 'unmapped' : 'open')
}

export function engravingJobAfter(current: AnyRecord): void {
    if (!current.getElement('status')?.changesTo('complete')) return
    const lineId = str(current, 'award_line')
    if (!lineId) return
    const line = new GlideRecord(TABLES.award_line)
    if (line.get(lineId) && str(line, 'status') !== 'complete') {
        line.setValue('status', 'in_progress')
        line.update()
    }
    // When every engraving job on the case is complete, the case moves to Assembly/QC.
    const caseId = str(current, 'awards_case')
    if (!caseId) return
    const open = new GlideRecord(TABLES.engraving_job)
    open.addQuery('awards_case', caseId)
    open.addQuery('status', 'NOT IN', 'complete,cancelled')
    open.setLimit(1)
    open.query()
    if (open.hasNext()) return
    const c = new GlideRecord(TABLES.awards_case)
    if (c.get(caseId) && str(c, 'stage') === 'engraving') {
        c.setValue('stage', 'assembly_qc')
        c.update()
    }
}

// ---------------------------------------------------------------- shipment

export function shipmentBefore(current: AnyRecord): void {
    const table = TABLES.shipment
    const tracking = str(current, 'tracking_number')
    const results = [validateSafeText('service_level', str(current, 'service_level'), 40, false), validateMultiline('ship_to', str(current, 'ship_to'), 500)]
    if (tracking && !/^[A-Z0-9 -]{8,40}$/i.test(tracking)) {
        results.push({ valid: false, issues: [{ field: 'tracking_number', code: 'format', message: 'Tracking number must be 8-40 letters, digits or dashes' }] })
    }
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    const status = str(current, 'status')
    if (current.isNewRecord() || current.getElement('status')?.changes()) {
        if (status === 'in_transit') {
            setIfEmpty(current, 'shipped', nowValue())
            if (str(current, 'shipped_by') === '') current.setValue('shipped_by', gs.getUserID())
        }
        if (status === 'delivered') {
            setIfEmpty(current, 'shipped', nowValue())
            current.setValue('delivered', nowValue())
        }
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'ShipmentRecord')
        if (str(current, 'ship_to') === '' && str(current, 'awards_case') !== '') {
            const c = new GlideRecord(TABLES.awards_case)
            if (c.get(str(current, 'awards_case'))) {
                const parts = [
                    str(c, 'ship_to_name'),
                    str(c, 'ship_to_address_1'),
                    str(c, 'ship_to_address_2'),
                    `${str(c, 'ship_to_city')}, ${str(c, 'ship_to_state')} ${str(c, 'ship_to_zip')}`.trim(),
                ].filter((p) => p && p !== ',')
                current.setValue('ship_to', parts.join('\n'))
            }
        }
    }
    current.setValue('active', status === 'delivered' || status === 'returned' || status === 'lost' ? 'false' : 'true')
    current.setValue('state', status === 'delivered' ? 'closed' : status === 'unmapped' ? 'unmapped' : 'open')
}

export function shipmentAfter(current: AnyRecord): void {
    const caseId = str(current, 'awards_case')
    if (!caseId) return
    const statusEl = current.getElement('status')
    if (statusEl?.changesTo('in_transit')) {
        const c = new GlideRecord(TABLES.awards_case)
        if (c.get(caseId) && str(c, 'stage') === 'warehouse') {
            c.setValue('stage', 'shipped')
            c.update()
        }
    }
    if (statusEl?.changesTo('delivered')) {
        const c = new GlideRecord(TABLES.awards_case)
        if (c.get(caseId) && str(c, 'stage') === 'shipped') {
            c.setValue('stage', 'closed')
            c.update()
        }
    }
}

// ---------------------------------------------------------------- SES flag request

const SES_TERMINAL: ReadonlySet<string> = new Set(['delivered', 'rejected', 'cancelled'])

export function sesFlagRequestBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.ses_flag_request
    const results = [
        validateSafeText('requesting_office', str(current, 'requesting_office'), 120, true),
        validateSafeText('executive_name', str(current, 'executive_name'), 100, true),
        validateSafeText('position_title', str(current, 'position_title'), 120, true),
        validateQuantity(str(current, 'quantity'), 'quantity', 10),
        validateMultiline('justification', str(current, 'justification')),
        validateMultiline('ship_to', str(current, 'ship_to'), 500),
        validateSafeText('rejection_reason', str(current, 'rejection_reason'), 200, false),
    ]
    if (str(current, 'poc_email')) results.push(validateEmail(str(current, 'poc_email'), 'poc_email'))
    if (str(current, 'poc_phone')) results.push(validatePhone(str(current, 'poc_phone'), 'poc_phone'))
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    const state = str(current, 'state') || 'draft'
    const fromState = current.isNewRecord() ? 'draft' : str(previous, 'state')
    if (fromState !== state) {
        if (SES_TERMINAL.has(fromState) && !gs.hasRole('x_cog_mah.admin') && !gs.hasRole('admin')) {
            abortWithMessage(current, `Request is ${fromState} and may not be changed`, table, `transition:${fromState}->${state}`)
            return
        }
        if ((state === 'approved' || state === 'rejected') && !gs.hasRole('x_cog_mah.tacom_staff') && !gs.hasRole('x_cog_mah.admin') && !gs.hasRole('admin')) {
            abortWithMessage(current, 'Only TACOM staff may approve or reject SES flag requests', table, `transition:${fromState}->${state}`)
            return
        }
        if (state === 'approved') {
            current.setValue('approved_by', gs.getUserID())
            current.setValue('approved_at', nowValue())
        }
        if (state === 'rejected' && str(current, 'rejection_reason') === '') {
            abortWithMessage(current, 'A rejection reason is required', table, 'reject_without_reason')
            return
        }
        if (state === 'delivered') current.setValue('delivered_at', nowValue())
    }
    if (current.isNewRecord() && str(current, 'legacy_form') === '') current.setValue('legacy_form', 'SESFlagRequest')
    current.setValue('active', SES_TERMINAL.has(state) ? 'false' : 'true')
}

export function sesFlagRequestAfter(current: AnyRecord, previous: AnyRecord): void {
    const isInsert = previous === null || previous === undefined || str(previous, 'sys_id') === ''
    if (!isInsert && !current.getElement('state')?.changes()) return
    securityLog({
        event: 'data_change',
        table: TABLES.ses_flag_request,
        record: current.getUniqueValue(),
        outcome: 'success',
        details: { number: str(current, 'number'), to: str(current, 'state') },
    })
    if (current.getElement('state')?.changesTo('submitted') || (isInsert && str(current, 'state') === 'submitted')) {
        gs.eventQueue(EVENTS.ses_submitted, current, str(current, 'poc_email'), gs.getUserName())
    }
}

// ---------------------------------------------------------------- case note

export function caseNoteBefore(current: AnyRecord): void {
    const result = mergeResults([validateMultiline('body', str(current, 'body'), 4000), validateSafeText('legacy_author', str(current, 'legacy_author'), 100, false)])
    if (!result.valid) {
        abortWithValidation(current, result, TABLES.case_note)
        return
    }
    if (str(current, 'awards_case') === '' && str(current, 'heraldry_request') === '') {
        abortWithMessage(current, 'A note must belong to an awards case or a heraldry request', TABLES.case_note, 'orphan_note')
        return
    }
    if (current.isNewRecord()) {
        setIfEmpty(current, 'noted_at', nowValue())
        if (str(current, 'author') === '') current.setValue('author', gs.getUserID())
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'CaseNote')
    }
}

/**
 * Business rules for the fulfilment task tables: engraving jobs, shipments and SES flag
 * requests (all extend task; `parent` is the awards case for engraving jobs and shipments).
 *
 * Replaces the `EngravingJob` / `ShipmentRecord` PostSave agents that stamped Started /
 * Completed / Shipped timestamps and advanced the parent AwardsCase, and the `SESFlag`
 * form validation formulas. Case notes are task journal entries now.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { EVENTS, ROLES, TABLES } from '../lib/domain.ts'
import { mergeResults, validateEmail, validateEngravingText, validateMultiline, validatePhone, validateQuantity, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, applyTaskPriority, applyTaskState, nowValue, securityLog, setIfEmpty, str, type AnyRecord } from './glideSupport.ts'

// ---------------------------------------------------------------- engraving job

export function engravingJobBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.engraving_job
    const result = mergeResults([validateEngravingText(str(current, 'text'), 'text'), validateMultiline('qc_notes', str(current, 'work_notes'), 4000)])
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    const stage = str(current, 'stage') || 'queued'
    const stageChanged = current.isNewRecord() || Boolean(current.getElement('stage')?.changes())
    if (stageChanged) {
        if (stage === 'in_progress') {
            setIfEmpty(current, 'started', nowValue())
            if (str(current, 'assigned_to') === '') current.setValue('assigned_to', gs.getUserID())
        }
        if (stage === 'complete') {
            setIfEmpty(current, 'started', nowValue())
            current.setValue('completed', nowValue())
        }
        if (stage === 'rework' && previous) {
            current.setValue('rework_count', String(Number(str(previous, 'rework_count') || 0) + 1))
            current.setValue('completed', '')
        }
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'EngravingJob')
        if (str(current, 'stage') === '') current.setValue('stage', 'queued')
        setIfEmpty(current, 'queued', nowValue())
        if (str(current, 'parent') === '' && str(current, 'award_line') !== '') {
            const line = new GlideRecord(TABLES.award_line)
            if (line.get(str(current, 'award_line'))) current.setValue('parent', str(line, 'awards_case'))
        }
        if (str(current, 'short_description') === '') current.setValue('short_description', `Engraving: ${str(current, 'text') || 'no text'}`.slice(0, 160))
    }
    applyTaskState(current, 'engraving_job', stage)
    applyTaskPriority(current)
}

export function engravingJobAfter(current: AnyRecord): void {
    if (!current.getElement('stage')?.changesTo('complete')) return
    const lineId = str(current, 'award_line')
    if (lineId) {
        const line = new GlideRecord(TABLES.award_line)
        if (line.get(lineId) && str(line, 'status') !== 'complete') {
            line.setValue('status', 'in_progress')
            line.update()
        }
    }
    // When every engraving job on the case is complete, the case moves to Assembly/QC.
    const caseId = str(current, 'parent')
    if (!caseId) return
    const open = new GlideRecord(TABLES.engraving_job)
    open.addQuery('parent', caseId)
    open.addQuery('stage', 'NOT IN', 'complete,cancelled')
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
    const stage = str(current, 'stage') || 'pending'
    if (current.isNewRecord() || current.getElement('stage')?.changes()) {
        if (stage === 'in_transit') {
            setIfEmpty(current, 'shipped', nowValue())
            if (str(current, 'shipped_by') === '') current.setValue('shipped_by', gs.getUserID())
        }
        if (stage === 'delivered') {
            setIfEmpty(current, 'shipped', nowValue())
            current.setValue('delivered', nowValue())
        }
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'ShipmentRecord')
        if (str(current, 'stage') === '') current.setValue('stage', 'pending')
        if (str(current, 'ship_to') === '' && str(current, 'parent') !== '') {
            const c = new GlideRecord(TABLES.awards_case)
            if (c.get(str(current, 'parent'))) {
                const parts = [
                    str(c, 'ship_to_name'),
                    str(c, 'ship_to_address_1'),
                    str(c, 'ship_to_address_2'),
                    `${str(c, 'ship_to_city')}, ${str(c, 'ship_to_state')} ${str(c, 'ship_to_zip')}`.trim(),
                ].filter((p) => p && p !== ',')
                current.setValue('ship_to', parts.join('\n'))
            }
        }
        if (str(current, 'short_description') === '') current.setValue('short_description', `Shipment for ${current.getDisplayValue('parent') || 'awards case'}`.slice(0, 160))
    }
    applyTaskState(current, 'shipment', stage)
}

export function shipmentAfter(current: AnyRecord): void {
    const caseId = str(current, 'parent')
    if (!caseId) return
    const stageEl = current.getElement('stage')
    if (stageEl?.changesTo('in_transit')) {
        const c = new GlideRecord(TABLES.awards_case)
        if (c.get(caseId) && str(c, 'stage') === 'warehouse') {
            c.setValue('stage', 'shipped')
            c.update()
        }
    }
    if (stageEl?.changesTo('delivered')) {
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
    const stage = str(current, 'stage') || 'draft'
    const fromStage = current.isNewRecord() ? 'draft' : str(previous, 'stage')
    const isTacom = gs.hasRole(ROLES.tacom_staff) || gs.hasRole(ROLES.admin) || gs.hasRole('admin')
    if (fromStage !== stage) {
        if (SES_TERMINAL.has(fromStage) && !gs.hasRole(ROLES.admin) && !gs.hasRole('admin')) {
            abortWithMessage(current, `Request is ${fromStage} and may not be changed`, table, `transition:${fromStage}->${stage}`)
            return
        }
        if ((stage === 'approved' || stage === 'rejected') && !isTacom) {
            abortWithMessage(current, 'Only TACOM staff may approve or reject SES flag requests', table, `transition:${fromStage}->${stage}`)
            return
        }
        if (stage === 'approved') {
            current.setValue('approved_by', gs.getUserID())
            current.setValue('approved_at', nowValue())
        }
        if (stage === 'rejected' && str(current, 'rejection_reason') === '') {
            abortWithMessage(current, 'A rejection reason is required', table, 'reject_without_reason')
            return
        }
        if (stage === 'delivered') current.setValue('delivered_at', nowValue())
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'SESFlagRequest')
        if (str(current, 'stage') === '') current.setValue('stage', 'draft')
        if (str(current, 'short_description') === '') {
            current.setValue('short_description', `SES flag — ${str(current, 'executive_name')} (${str(current, 'requesting_office')})`.slice(0, 160))
        }
    }
    applyTaskState(current, 'ses_flag_request', stage)
}

export function sesFlagRequestAfter(current: AnyRecord, previous: AnyRecord): void {
    const isInsert = previous === null || previous === undefined || str(previous, 'sys_id') === ''
    if (!isInsert && !current.getElement('stage')?.changes()) return
    securityLog({
        event: 'data_change',
        table: TABLES.ses_flag_request,
        record: current.getUniqueValue(),
        outcome: 'success',
        details: { number: str(current, 'number'), to: str(current, 'stage') },
    })
    if (current.getElement('stage')?.changesTo('submitted') || (isInsert && str(current, 'stage') === 'submitted')) {
        gs.eventQueue(EVENTS.ses_submitted, current, str(current, 'poc_email'), gs.getUserName())
    }
}

/**
 * Business rules for x_cog_mah_native_heraldry_request (DD Form 1348-6 requisitions, extends task).
 *
 * Replaces the legacy `Request` form's QuerySave / PostSave LotusScript and the
 * `@If(ReleasedToVendor != ""; @Failure("Request has been released to vendor..."))`
 * input-validation formula. The vendor is the inherited `task.company` (a core_company row
 * with vendor=true) — that column is also what the vendor-isolation query rule filters on.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { EVENTS, RELEASED_TO_VENDOR_MESSAGE, TABLES, type RequestState } from '../lib/domain.ts'
import { totalRequestLines } from '../lib/pricing.ts'
import { blockedPostReleaseEdits, canTransitionRequest } from '../lib/stageMachine.ts'
import { mergeResults, validateDd1348Header, validateEmail, validatePhone, validateSafeText } from '../lib/validators.ts'
import {
    abortWithMessage,
    abortWithValidation,
    applyTaskPriority,
    applyTaskState,
    changedFields,
    currentRoleKeys,
    journalOnTask,
    nowValue,
    securityLog,
    str,
    type AnyRecord,
} from './glideSupport.ts'

const HEADER_FIELDS = [
    'document_number',
    'dodaac',
    'uic',
    'requisition_priority',
    'project_code',
    'fund_code',
    'signal_code',
    'required_delivery_date',
    'requesting_unit',
    'requester_poc',
    'requester_poc_email',
    'requester_poc_phone',
    'ship_to',
    'justification',
    'company',
    'released_to_vendor',
    'cancel_reason',
] as const

/** Stages in which the header is still owned by the requesting activity and must validate. */
const HEADER_VALIDATED_STAGES: ReadonlySet<string> = new Set(['submitted', 'in_review', 'released_to_vendor'])

export function validateHeader(current: AnyRecord): ReturnType<typeof validateDd1348Header> {
    const header = validateDd1348Header({
        document_number: str(current, 'document_number'),
        dodaac: str(current, 'dodaac'),
        uic: str(current, 'uic'),
        requisition_priority: str(current, 'requisition_priority'),
        project_code: str(current, 'project_code'),
        fund_code: str(current, 'fund_code'),
        requester_poc: str(current, 'requester_poc'),
        ship_to: str(current, 'ship_to'),
        justification: str(current, 'justification'),
    })
    const extras = [
        validateSafeText('requesting_unit', str(current, 'requesting_unit'), 100, false),
        validateSafeText('signal_code', str(current, 'signal_code'), 1, false),
    ]
    const email = str(current, 'requester_poc_email')
    if (email) extras.push(validateEmail(email, 'requester_poc_email'))
    const phone = str(current, 'requester_poc_phone')
    if (phone) extras.push(validatePhone(phone, 'requester_poc_phone'))
    return mergeResults([header, ...extras])
}

/** before insert/update */
export function heraldryRequestBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.heraldry_request
    const isInsert = current.isNewRecord()
    const fromStage = (isInsert ? 'draft' : str(previous, 'stage')) as RequestState
    const toStage = (str(current, 'stage') || 'draft') as RequestState
    const roles = currentRoleKeys()

    // 1. Post-release freeze: only the vendor-facing fulfilment fields may change.
    if (!isInsert && str(previous, 'released_to_vendor') !== '') {
        const changed = changedFields(current, previous, HEADER_FIELDS)
        const blocked = blockedPostReleaseEdits(changed)
        const releaseCleared = current.getElement('released_to_vendor')?.changes() && str(current, 'released_to_vendor') === ''
        if (blocked.length > 0 && !(releaseCleared && roles.includes('admin'))) {
            abortWithMessage(current, RELEASED_TO_VENDOR_MESSAGE, table, `post_release_edit:${blocked.join(',')}`)
            return
        }
    }

    // 2. Header validation whenever the request is (or is becoming) submitted.
    if (HEADER_VALIDATED_STAGES.has(toStage) || (!isInsert && HEADER_VALIDATED_STAGES.has(fromStage))) {
        const result = validateHeader(current)
        if (!result.valid) {
            abortWithValidation(current, result, table)
            return
        }
    } else {
        const result = validateHeader(current)
        const hardIssues = result.issues.filter((i) => /not accepted|characters|too long|exceeds/i.test(i.message))
        if (hardIssues.length > 0) {
            abortWithValidation(current, { valid: false, issues: hardIssues }, table)
            return
        }
    }

    // 3. State machine guard rails (the approval step itself is the native flow's "Ask for approval").
    if (fromStage !== toStage) {
        const lineCount = isInsert ? 0 : countLines(current.getUniqueValue())
        const decision = canTransitionRequest({
            from: fromStage,
            to: toStage,
            roles,
            lineCount,
            headerValid: validateHeader(current).valid,
            hasVendor: str(current, 'company') !== '',
        })
        if (!decision.allowed) {
            abortWithMessage(current, decision.reason ?? 'That state change is not permitted', table, `transition:${fromStage}->${toStage}`)
            return
        }
        if (toStage === 'submitted') {
            current.setValue('submitted_at', nowValue())
            current.setValue('submitted_by', gs.getUserID())
        }
        if (toStage === 'in_review' && str(current, 'reviewer') === '') {
            current.setValue('reviewer', gs.getUserID())
        }
        if (toStage === 'released_to_vendor') {
            if (str(current, 'approval') !== 'approved' && !roles.includes('admin')) {
                abortWithMessage(current, 'The request must be approved before it is released to the vendor', table, 'release_without_approval')
                return
            }
            if (str(current, 'released_to_vendor') === '') current.setValue('released_to_vendor', nowValue().slice(0, 10))
            current.setValue('released_by', gs.getUserID())
        }
        if (toStage === 'cancelled' && str(current, 'cancel_reason') === '') {
            abortWithMessage(current, 'A cancellation reason is required', table, 'cancel_without_reason')
            return
        }
    }

    // 4. Setting the release date directly implies the released stage (legacy behaviour).
    if (str(current, 'released_to_vendor') !== '' && toStage !== 'released_to_vendor' && fromStage !== 'released_to_vendor') {
        if (['draft', 'submitted', 'in_review'].includes(toStage)) current.setValue('stage', 'released_to_vendor')
    }

    // 5. Native task lifecycle + derived fields.
    applyTaskState(current, 'heraldry_request', str(current, 'stage') || 'draft')
    applyTaskPriority(current)
    if (isInsert) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'Request')
        current.setValue('line_count', '0')
        current.setValue('total_extended_price', '0')
        if (str(current, 'short_description') === '') {
            current.setValue('short_description', `DD 1348-6 ${str(current, 'document_number') || 'draft'} — ${str(current, 'requesting_unit') || 'unit TBD'}`.slice(0, 160))
        }
    }
}

/** after insert/update */
export function heraldryRequestAfter(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.heraldry_request
    const stageEl = current.getElement('stage')
    const isInsert = previous === null || previous === undefined || str(previous, 'sys_id') === ''
    const stageChanged = isInsert || Boolean(stageEl?.changes())
    if (!stageChanged) return

    const toStage = str(current, 'stage')
    const fromStage = isInsert ? '' : str(previous, 'stage')
    securityLog({
        event: 'data_change',
        table,
        record: current.getUniqueValue(),
        outcome: 'success',
        details: { number: str(current, 'number'), from: fromStage, to: toStage },
    })
    if (toStage === 'submitted') {
        gs.eventQueue(EVENTS.request_submitted, current, str(current, 'requester_poc_email'), gs.getUserName())
        journalOnTask(table, current.getUniqueValue(), 'work_notes', `Request ${str(current, 'number')} submitted by ${gs.getUserName()}`)
    }
    if (toStage === 'released_to_vendor') {
        gs.eventQueue(EVENTS.request_released, current, str(current, 'company'), gs.getUserName())
        journalOnTask(
            table,
            current.getUniqueValue(),
            'comments',
            `Request ${str(current, 'number')} released to vendor ${current.getDisplayValue('company')} on ${str(current, 'released_to_vendor')}`,
        )
        cascadeLineStatus(current.getUniqueValue(), 'pending', 'in_progress')
    }
    if (toStage === 'cancelled') cascadeLineStatus(current.getUniqueValue(), '', 'cancelled')
    if (toStage === 'complete') cascadeLineStatus(current.getUniqueValue(), 'in_progress', 'complete')
}

function countLines(requestSysId: string): number {
    const gr = new GlideRecord(TABLES.request_line)
    gr.addQuery('heraldry_request', requestSysId)
    gr.addQuery('status', '!=', 'cancelled')
    gr.query()
    return gr.getRowCount()
}

function cascadeLineStatus(requestSysId: string, fromStatus: string, toStatus: string): void {
    const gr = new GlideRecord(TABLES.request_line)
    gr.addQuery('heraldry_request', requestSysId)
    if (fromStatus) gr.addQuery('status', fromStatus)
    else gr.addQuery('status', '!=', 'complete')
    gr.query()
    while (gr.next()) {
        gr.setValue('status', toStatus)
        gr.setValue('active', toStatus === 'cancelled' || toStatus === 'complete' ? 'false' : 'true')
        gr.update()
    }
}

/** Recompute line_count / total_extended_price on the parent from its lines (called by request-line rules). */
export function rollUpRequestTotals(requestSysId: string): void {
    if (!requestSysId) return
    const lines: { quantity: string; unit_price: string }[] = []
    const gr = new GlideRecord(TABLES.request_line)
    gr.addQuery('heraldry_request', requestSysId)
    gr.addQuery('status', '!=', 'cancelled')
    gr.query()
    while (gr.next()) {
        lines.push({ quantity: str(gr, 'quantity'), unit_price: str(gr, 'unit_price') })
    }
    const totals = totalRequestLines(lines)
    const req = new GlideRecord(TABLES.heraldry_request)
    if (req.get(requestSysId)) {
        req.setValue('line_count', String(totals.lineCount))
        req.setValue('total_extended_price', totals.totalExtended.toFixed(2))
        req.setWorkflow(false)
        req.update()
    }
}

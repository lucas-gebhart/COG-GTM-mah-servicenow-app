/**
 * Server-side handlers behind the MAH UI Actions (Submit request, Release to vendor,
 * Cancel, Advance stage, Merge requester). Each one only sets fields and calls update();
 * the before-business-rules own the guard rails, so the button can never bypass them.
 * Errors surface through gs.addErrorMessage with a generic sentence and a JSON log line.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { TABLES, type CaseStage, type RequestState } from '../lib/domain'
import { nextCaseStage } from '../lib/stageMachine'
import { securityLog, str, type AnyRecord } from '../rules/glideSupport'

type Params = unknown[]

function refresh(current: AnyRecord): void {
    // After update() the form redisplays the record; pull the latest values so messages are accurate.
    current.get(current.getUniqueValue())
}

function outcomeMessage(current: AnyRecord, ok: boolean, success: string, action: string): void {
    if (ok) {
        gs.addInfoMessage(success)
    } else {
        gs.addErrorMessage(gs.getMessage('The requested action could not be completed. Check the field messages and try again.'))
    }
    securityLog({
        event: 'admin_action',
        table: current.getTableName(),
        record: current.getUniqueValue(),
        outcome: ok ? 'success' : 'failure',
        details: { action, number: str(current, 'number') },
    })
}

/** UI Action: Advance stage (awards case) — moves to the next stage in the lifecycle. */
export function advanceCaseStage(current: AnyRecord, _params: Params): void {
    const stage = str(current, 'stage') as CaseStage
    const next = nextCaseStage(stage)
    if (next === null) {
        gs.addErrorMessage(gs.getMessage('This case is already at its final stage.'))
        return
    }
    current.setValue('stage', next)
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Case ${str(current, 'number')} advanced to ${current.getDisplayValue('stage')}`, `advance_stage:${stage}->${next}`)
}

/** UI Action: Cancel (awards case). */
export function cancelCase(current: AnyRecord, _params: Params): void {
    current.setValue('stage', 'cancelled')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Case ${str(current, 'number')} cancelled`, 'cancel_case')
}

/** UI Action: Submit request (heraldry request) — draft → submitted. */
export function submitRequest(current: AnyRecord, _params: Params): void {
    current.setValue('state', 'submitted')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Request ${str(current, 'number')} submitted for review`, 'submit_request')
}

/** UI Action: Start review (heraldry request) — submitted → in_review. */
export function startRequestReview(current: AnyRecord, _params: Params): void {
    current.setValue('state', 'in_review')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Request ${str(current, 'number')} is now in review`, 'start_review')
}

/** UI Action: Release to vendor (heraldry request) — in_review → released_to_vendor, stamps the release date. */
export function releaseRequestToVendor(current: AnyRecord, _params: Params): void {
    if (str(current, 'vendor') === '') {
        gs.addErrorMessage(gs.getMessage('Select a vendor before releasing the request.'))
        return
    }
    current.setValue('state', 'released_to_vendor')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Request ${str(current, 'number')} released to ${current.getDisplayValue('vendor')}`, 'release_to_vendor')
}

/** UI Action: Advance state (heraldry request) — vendor moves released → in_production → shipped; TACOM/DLA close. */
export function advanceRequestState(current: AnyRecord, _params: Params): void {
    const order: readonly RequestState[] = ['draft', 'submitted', 'in_review', 'released_to_vendor', 'in_production', 'shipped', 'complete']
    const from = str(current, 'state') as RequestState
    const idx = order.indexOf(from)
    const next = idx >= 0 ? order[idx + 1] : undefined
    if (next === undefined) {
        gs.addErrorMessage(gs.getMessage('This request is already at its final state.'))
        return
    }
    current.setValue('state', next)
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Request ${str(current, 'number')} moved to ${current.getDisplayValue('state')}`, `advance_request:${from}->${next}`)
}

/** UI Action: Cancel (heraldry request). */
export function cancelRequest(current: AnyRecord, _params: Params): void {
    current.setValue('state', 'cancelled')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Request ${str(current, 'number')} cancelled`, 'cancel_request')
}

/** UI Action: Approve / Reject (SES flag request). */
export function approveSesRequest(current: AnyRecord, _params: Params): void {
    current.setValue('state', 'approved')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `SES flag request ${str(current, 'number')} approved`, 'approve_ses')
}

export function rejectSesRequest(current: AnyRecord, _params: Params): void {
    current.setValue('state', 'rejected')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `SES flag request ${str(current, 'number')} rejected`, 'reject_ses')
}

/**
 * UI Action: Merge requester — the current record becomes a duplicate of the requester
 * chosen in `merge_target` (a form field populated by the operator). The before rule sets
 * state=merged and the after rule re-points open cases at the survivor.
 */
export function mergeRequester(current: AnyRecord, _params: Params): void {
    const target = str(current, 'merge_target')
    if (target === '') {
        gs.addErrorMessage(gs.getMessage('Choose the surviving requester in "Merge into" before merging.'))
        return
    }
    if (target === current.getUniqueValue()) {
        gs.addErrorMessage(gs.getMessage('A requester cannot be merged into itself.'))
        return
    }
    const survivor = new GlideRecord(TABLES.requester)
    if (!survivor.get(target) || str(survivor, 'merged_into') !== '') {
        gs.addErrorMessage(gs.getMessage('The chosen survivor is not an active requester.'))
        return
    }
    current.setValue('merged_into', target)
    current.setValue('merge_target', '')
    const ok = current.update() !== null
    refresh(current)
    outcomeMessage(current, ok, `Requester ${str(current, 'number')} merged into ${survivor.getDisplayValue('number')}`, 'merge_requester')
}

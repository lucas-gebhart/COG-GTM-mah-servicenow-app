/**
 * Business rules for x_cog_mah_native_awards_case (extends task).
 *
 * Replaces the `AwardsCase` form QuerySave (stage guard rails) and the `StageEntered`
 * computed field. Aging is *not* computed here any more: the 60 / 75-day clocks are Task SLAs
 * (contract_sla) that the platform runs on `task_sla`.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { EVENTS, isTerminalCaseStage, TABLES, type CaseStage } from '../lib/domain.ts'
import { canTransitionCase } from '../lib/stageMachine.ts'
import { mergeResults, validateSafeText } from '../lib/validators.ts'
import {
    abortWithMessage,
    abortWithValidation,
    applyTaskPriority,
    applyTaskState,
    currentRoleKeys,
    journalOnTask,
    nowValue,
    securityLog,
    str,
    type AnyRecord,
} from './glideSupport.ts'

function openLineCount(caseSysId: string): number {
    if (!caseSysId) return 0
    const gr = new GlideRecord(TABLES.award_line)
    gr.addQuery('awards_case', caseSysId)
    gr.addQuery('status', 'NOT IN', 'complete,cancelled')
    gr.query()
    return gr.getRowCount()
}

function hasShipment(caseSysId: string): boolean {
    if (!caseSysId) return false
    const gr = new GlideRecord(TABLES.shipment)
    gr.addQuery('parent', caseSysId)
    gr.addQuery('stage', '!=', 'returned')
    gr.setLimit(1)
    gr.query()
    return gr.hasNext()
}

/** before insert/update */
export function awardsCaseBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.awards_case
    const isInsert = current.isNewRecord()
    const fromStage = (isInsert ? 'authorized' : str(previous, 'stage') || 'authorized') as CaseStage
    const toStage = (str(current, 'stage') || 'authorized') as CaseStage

    const validation = mergeResults([
        validateSafeText('short_description', str(current, 'short_description'), 160, false),
        validateSafeText('ship_to_name', str(current, 'ship_to_name'), 100, false),
        validateSafeText('ship_to_address_1', str(current, 'ship_to_address_1'), 100, false),
        validateSafeText('ship_to_address_2', str(current, 'ship_to_address_2'), 100, false),
        validateSafeText('ship_to_city', str(current, 'ship_to_city'), 60, false),
        validateSafeText('ship_to_state', str(current, 'ship_to_state'), 2, false),
        validateSafeText('ship_to_zip', str(current, 'ship_to_zip'), 10, false),
        validateSafeText('cancel_reason', str(current, 'cancel_reason'), 200, false),
    ])
    if (!validation.valid) {
        abortWithValidation(current, validation, table)
        return
    }

    if (fromStage !== toStage) {
        const decision = canTransitionCase({
            from: fromStage,
            to: toStage,
            roles: currentRoleKeys(),
            openLines: openLineCount(current.getUniqueValue()),
            hasShipment: hasShipment(current.getUniqueValue()),
        })
        if (!decision.allowed) {
            abortWithMessage(current, decision.reason ?? 'That stage change is not permitted', table, `transition:${fromStage}->${toStage}`)
            return
        }
        if (toStage === 'cancelled' && str(current, 'cancel_reason') === '') {
            abortWithMessage(current, 'A cancellation reason is required', table, 'cancel_without_reason')
            return
        }
        current.setValue('stage_entered_at', nowValue())
        if (isTerminalCaseStage(toStage)) current.setValue('closed_by', gs.getUserID())
    }
    if (isInsert && str(current, 'stage_entered_at') === '') current.setValue('stage_entered_at', nowValue())

    // Native task lifecycle follows the stage; SLA clocks key off state / stage / on_hold.
    applyTaskState(current, 'awards_case', toStage)
    applyTaskPriority(current)

    if (isInsert) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'AwardsCase')
        if (str(current, 'short_description') === '') {
            current.setValue('short_description', `Awards case for ${current.getDisplayValue('requester') || 'unassigned requester'}`)
        }
    }
}

/** after insert/update */
export function awardsCaseAfter(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.awards_case
    const isInsert = previous === null || previous === undefined || str(previous, 'sys_id') === ''
    const stageChanged = isInsert || Boolean(current.getElement('stage')?.changes())
    if (!stageChanged) return
    const fromStage = isInsert ? '' : str(previous, 'stage')
    const toStage = str(current, 'stage')
    securityLog({
        event: 'data_change',
        table,
        record: current.getUniqueValue(),
        outcome: 'success',
        details: { number: str(current, 'number'), from: fromStage, to: toStage },
    })
    if (!isInsert) {
        gs.eventQueue(EVENTS.case_stage_changed, current, fromStage, toStage)
        // Customer-visible activity-stream entry (replaces the v1 system CaseNote).
        journalOnTask(table, current.getUniqueValue(), 'comments', `Stage changed to ${current.getDisplayValue('stage') || toStage} by ${gs.getUserName()}`)
    }
    if (toStage === 'cancelled') cascadeLines(current.getUniqueValue(), 'cancelled')
    if (toStage === 'closed') cascadeLines(current.getUniqueValue(), 'complete')
}

function cascadeLines(caseSysId: string, status: 'cancelled' | 'complete'): void {
    const gr = new GlideRecord(TABLES.award_line)
    gr.addQuery('awards_case', caseSysId)
    gr.addQuery('status', 'NOT IN', 'complete,cancelled')
    gr.query()
    while (gr.next()) {
        gr.setValue('status', status)
        gr.setValue('active', 'false')
        gr.update()
    }
}

/** Recompute line_count / total_quantity on the parent case (called from award-line rules). */
export function rollUpCaseLines(caseSysId: string): void {
    if (!caseSysId) return
    let count = 0
    let qty = 0
    const gr = new GlideRecord(TABLES.award_line)
    gr.addQuery('awards_case', caseSysId)
    gr.addQuery('status', '!=', 'cancelled')
    gr.query()
    while (gr.next()) {
        count += 1
        qty += Number(str(gr, 'quantity') || 0)
    }
    const c = new GlideRecord(TABLES.awards_case)
    if (c.get(caseSysId)) {
        c.setValue('line_count', String(count))
        c.setValue('total_quantity', String(qty))
        c.setWorkflow(false)
        c.update()
    }
}

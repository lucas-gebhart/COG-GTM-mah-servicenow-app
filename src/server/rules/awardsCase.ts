/**
 * Business rules for x_cog_mah_awards_case.
 *
 * Replaces the `AwardsCase` form QuerySave (stage guard rails), the `StageEntered`
 * computed field, and the per-save part of the `NightlyAging` agent.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { computeAging } from '../lib/aging.ts'
import { EVENTS, isTerminalCaseStage, TABLES, type CaseStage } from '../lib/domain.ts'
import { canTransitionCase } from '../lib/stageMachine.ts'
import { mergeResults, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, currentRoleKeys, insertCaseNote, nowValue, securityLog, str, type AnyRecord } from './glideSupport.ts'

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
    gr.addQuery('awards_case', caseSysId)
    gr.addQuery('status', '!=', 'returned')
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
        if (isTerminalCaseStage(toStage)) current.setValue('closed_at', nowValue())
        else current.setValue('closed_at', '')
    }
    if (isInsert && str(current, 'stage_entered_at') === '') current.setValue('stage_entered_at', nowValue())

    // Lifecycle state and active flag follow the stage.
    current.setValue('state', toStage === 'closed' ? 'closed' : toStage === 'cancelled' ? 'cancelled' : toStage === 'unmapped' ? 'unmapped' : 'open')
    current.setValue('active', isTerminalCaseStage(toStage) ? 'false' : 'true')

    // Aging is recomputed on every save so the list is never stale between nightly runs.
    const aging = computeAging(
        {
            stage: toStage,
            stage_entered_at: str(current, 'stage_entered_at'),
            days_in_stage: Number(str(current, 'days_in_stage') || 0),
            aging_flag: (str(current, 'aging_flag') || 'green') as 'green' | 'amber' | 'red',
        },
        nowValue(),
    )
    current.setValue('days_in_stage', String(aging.days_in_stage))
    current.setValue('aging_flag', aging.aging_flag)

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
    if (stageChanged) {
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
            insertCaseNote({
                awards_case: current.getUniqueValue(),
                note_type: 'system',
                body: `Stage changed ${current.getDisplayValue('stage') ? `to ${current.getDisplayValue('stage')}` : ''} by ${gs.getUserName()}`,
                customer_visible: true,
            })
        }
        if (toStage === 'cancelled') cascadeLines(current.getUniqueValue(), 'cancelled')
        if (toStage === 'closed') cascadeLines(current.getUniqueValue(), 'complete')
    }
    const agingEl = current.getElement('aging_flag')
    if (!isInsert && agingEl?.changesTo('red')) {
        gs.eventQueue(EVENTS.case_aging_red, current, str(current, 'days_in_stage'), str(current, 'assigned_to'))
    }
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

/**
 * Business rules for x_cog_mah_requester.
 *
 * Replaces the `Requester` form's `DedupeKey` computed field and the `MergeRequester`
 * agent that re-pointed AwardsCase documents at the surviving requester.
 */
import { GlideRecord } from '@servicenow/glide'
import { computeDedupeKey } from '../lib/dedupe'
import { TABLES } from '../lib/domain'
import { mergeResults, validateEmail, validatePhone, validateSafeText } from '../lib/validators'
import { abortWithMessage, abortWithValidation, insertCaseNote, securityLog, str, type AnyRecord } from './glideSupport'

/** before insert/update */
export function requesterBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.requester
    const results = [
        validateSafeText('first_name', str(current, 'first_name'), 60, false),
        validateSafeText('last_name', str(current, 'last_name'), 60, str(current, 'type') !== 'unit'),
        validateSafeText('unit_name', str(current, 'unit_name'), 100, str(current, 'type') === 'unit'),
        validateSafeText('middle_initial', str(current, 'middle_initial'), 1, false),
        validateSafeText('suffix', str(current, 'suffix'), 10, false),
        validateSafeText('relationship', str(current, 'relationship'), 40, false),
        validateSafeText('address_1', str(current, 'address_1'), 100, false),
        validateSafeText('address_2', str(current, 'address_2'), 100, false),
        validateSafeText('city', str(current, 'city'), 60, false),
        validateSafeText('address_state', str(current, 'address_state'), 2, false),
        validateSafeText('zip', str(current, 'zip'), 10, false),
        validateSafeText('country', str(current, 'country'), 3, false),
    ]
    const last4 = str(current, 'service_number_last4')
    if (last4 && !/^\d{4}$/.test(last4)) {
        results.push({ valid: false, issues: [{ field: 'service_number_last4', code: 'format', message: 'Last four of service number must be 4 digits' }] })
    }
    if (str(current, 'email')) results.push(validateEmail(str(current, 'email')))
    if (str(current, 'phone')) results.push(validatePhone(str(current, 'phone')))
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }

    // A requester can never be merged into itself or into a record that is itself merged.
    const mergedInto = str(current, 'merged_into')
    if (mergedInto) {
        if (mergedInto === current.getUniqueValue()) {
            abortWithMessage(current, 'A requester cannot be merged into itself', table, 'self_merge')
            return
        }
        const target = new GlideRecord(table)
        if (target.get(mergedInto) && str(target, 'merged_into') !== '') {
            abortWithMessage(current, 'The merge target is itself merged; choose the surviving requester', table, 'chained_merge')
            return
        }
    }

    const displayName =
        str(current, 'type') === 'unit'
            ? str(current, 'unit_name')
            : [str(current, 'last_name'), [str(current, 'first_name'), str(current, 'middle_initial')].filter(Boolean).join(' ')].filter(Boolean).join(', ') +
              (str(current, 'suffix') ? ` ${str(current, 'suffix')}` : '')
    current.setValue('name', displayName.slice(0, 100))
    current.setValue(
        'dedupe_key',
        computeDedupeKey({
            type: str(current, 'type'),
            first_name: str(current, 'first_name'),
            last_name: str(current, 'last_name'),
            unit_name: str(current, 'unit_name'),
            service_number_last4: last4,
            dob: str(current, 'dob'),
            email: str(current, 'email'),
            zip: str(current, 'zip'),
        }),
    )
    if (current.isNewRecord() && str(current, 'legacy_form') === '') current.setValue('legacy_form', 'Requester')
    if (mergedInto) {
        current.setValue('state', 'merged')
        current.setValue('active', 'false')
    } else if (str(current, 'state') === 'merged' && previous && str(previous, 'merged_into') !== '') {
        current.setValue('state', 'active')
        current.setValue('active', 'true')
    }
}

/** after update: when merged_into is set, re-point open cases at the survivor. */
export function requesterAfter(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.requester
    const mergedInto = str(current, 'merged_into')
    if (!mergedInto || !current.getElement('merged_into')?.changes()) return

    let moved = 0
    const cases = new GlideRecord(TABLES.awards_case)
    cases.addQuery('requester', current.getUniqueValue())
    cases.query()
    while (cases.next()) {
        cases.setValue('requester', mergedInto)
        cases.setWorkflow(false)
        cases.update()
        moved += 1
    }
    const survivor = new GlideRecord(table)
    if (survivor.get(mergedInto)) {
        survivor.setValue('duplicate_count', String(Number(str(survivor, 'duplicate_count') || 0) + 1))
        survivor.setValue('case_count', String(countCases(mergedInto)))
        survivor.setWorkflow(false)
        survivor.update()
    }
    securityLog({
        event: 'admin_action',
        table,
        record: current.getUniqueValue(),
        outcome: 'success',
        reason: 'requester_merge',
        details: { survivor: mergedInto, casesMoved: moved, previous: str(previous, 'merged_into') },
    })
    for (const c of caseSysIds(mergedInto)) {
        insertCaseNote({ awards_case: c, note_type: 'system', body: `Requester ${str(current, 'number')} merged into ${survivor.getValue('number') ?? mergedInto}` })
    }
}

function countCases(requesterSysId: string): number {
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('requester', requesterSysId)
    gr.query()
    return gr.getRowCount()
}

function caseSysIds(requesterSysId: string): string[] {
    const ids: string[] = []
    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('requester', requesterSysId)
    gr.addQuery('active', 'true')
    gr.query()
    while (gr.next()) ids.push(gr.getUniqueValue())
    return ids
}

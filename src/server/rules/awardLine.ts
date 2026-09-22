/**
 * Business rules for x_cog_mah_award_line.
 *
 * Replaces the `AwardLine` form input translation/validation formulas (engraving text
 * 60-character limit, quantity 1-999) and the `CreateEngravingJob` PostSave agent.
 */
import { GlideRecord } from '@servicenow/glide'
import { TABLES } from '../lib/domain.ts'
import { mergeResults, validateEngravingText, validateQuantity } from '../lib/validators.ts'
import { abortWithValidation, nowValue, str, type AnyRecord } from './glideSupport.ts'
import { rollUpCaseLines } from './awardsCase.ts'

/** before insert/update */
export function awardLineBefore(current: AnyRecord): void {
    const table = TABLES.award_line
    const engravingRequired = str(current, 'engraving_required') === 'true'
    const results = [validateQuantity(str(current, 'quantity'))]
    if (engravingRequired || str(current, 'engraving_text') !== '') {
        results.push(validateEngravingText(str(current, 'engraving_text')))
    }
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'AwardLine')
        if (str(current, 'line_number') === '' || str(current, 'line_number') === '0') {
            const gr = new GlideRecord(table)
            gr.addQuery('awards_case', str(current, 'awards_case'))
            gr.query()
            current.setValue('line_number', String(gr.getRowCount() + 1))
        }
        if (str(current, 'status') === '') current.setValue('status', 'pending')
    }
    const status = str(current, 'status')
    current.setValue('active', status === 'cancelled' || status === 'complete' ? 'false' : 'true')
    current.setValue('state', status === 'cancelled' ? 'cancelled' : status === 'complete' ? 'closed' : status === 'unmapped' ? 'unmapped' : 'open')
}

/** after insert/update/delete */
export function awardLineAfter(current: AnyRecord, previous: AnyRecord): void {
    rollUpCaseLines(str(current, 'awards_case'))
    if (previous && str(previous, 'awards_case') && str(previous, 'awards_case') !== str(current, 'awards_case')) {
        rollUpCaseLines(str(previous, 'awards_case'))
    }
    // Engraving-required lines get a queued engraving job the moment they are created.
    const isInsert = previous === null || previous === undefined || str(previous, 'sys_id') === ''
    if (isInsert && str(current, 'engraving_required') === 'true' && str(current, 'status') !== 'cancelled') {
        const existing = new GlideRecord(TABLES.engraving_job)
        existing.addQuery('award_line', current.getUniqueValue())
        existing.setLimit(1)
        existing.query()
        if (!existing.hasNext()) {
            const job = new GlideRecord(TABLES.engraving_job)
            job.initialize()
            job.setValue('award_line', current.getUniqueValue())
            job.setValue('awards_case', str(current, 'awards_case'))
            job.setValue('text', str(current, 'engraving_text'))
            job.setValue('font', 'roman_block')
            job.setValue('status', 'queued')
            job.setValue('state', 'open')
            job.setValue('active', 'true')
            job.setValue('legacy_form', 'EngravingJob')
            job.setValue('legacy_last_modified', nowValue())
            job.insert()
        }
    }
}

/**
 * Business rules for x_cog_mah_native_award_line (custom child table).
 *
 * Replaces the `AwardLine` form input translation/validation formulas (engraving text
 * 60-character limit, quantity 1-999) and the `CreateEngravingJob` PostSave agent. The
 * engraving job it creates is a task whose `parent` is the awards case, so it lands on the
 * engraving Visual Task Board and in the engraver group's "My Groups Work".
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
        // Catalog copy-down from the cmdb_model-based award model.
        const modelId = str(current, 'award_model')
        if (modelId && str(current, 'stock_number') === '') {
            const model = new GlideRecord(TABLES.catalog_item)
            if (model.get(modelId)) current.setValue('stock_number', str(model, 'model_number'))
        }
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
            job.setValue('parent', str(current, 'awards_case'))
            job.setValue('short_description', `Engrave ${str(current, 'award_name') || 'award'} for ${current.getDisplayValue('awards_case')}`)
            job.setValue('text', str(current, 'engraving_text'))
            job.setValue('font', 'roman_block')
            job.setValue('stage', 'queued')
            job.setValue('legacy_form', 'EngravingJob')
            job.setValue('legacy_last_modified', nowValue())
            job.insert()
        }
    }
}

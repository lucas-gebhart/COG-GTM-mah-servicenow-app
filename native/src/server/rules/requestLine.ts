/**
 * Business rules for x_cog_mah_native_request_line.
 *
 * Replaces the `RequestLine` form's `ExtendedPrice := Quantity * UnitPrice` computed field,
 * the `@DbLookup` that copied nomenclature / unit of issue from `HeraldicItem`, and the
 * parent-level `LineCount` / `TotalPrice` roll-up agent. The catalog is the cmdb_model-based
 * `x_cog_mah_native_catalog_item`: model_number = NSN, name = nomenclature, cost = unit price.
 */
import { GlideRecord } from '@servicenow/glide'
import { RELEASED_TO_VENDOR_MESSAGE, TABLES } from '../lib/domain.ts'
import { computeExtendedPrice } from '../lib/pricing.ts'
import { blockedPostReleaseEdits } from '../lib/stageMachine.ts'
import { mergeResults, validateNsn, validateQuantity, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, changedFields, currentRoleKeys, setIfEmpty, str, type AnyRecord } from './glideSupport.ts'
import { rollUpRequestTotals } from './heraldryRequest.ts'

const LINE_FIELDS = ['model', 'nsn_or_exception', 'nomenclature', 'unit_of_issue', 'quantity', 'unit_price', 'line_number'] as const

function parentIsReleased(requestSysId: string): boolean {
    if (!requestSysId) return false
    const req = new GlideRecord(TABLES.heraldry_request)
    if (!req.get(requestSysId)) return false
    return str(req, 'released_to_vendor') !== ''
}

/** before insert/update */
export function requestLineBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.request_line
    const isInsert = current.isNewRecord()
    const requestSysId = str(current, 'heraldry_request')

    if (parentIsReleased(isInsert ? requestSysId : str(previous, 'heraldry_request'))) {
        const changed = isInsert ? [...LINE_FIELDS] : changedFields(current, previous, LINE_FIELDS)
        const blocked = blockedPostReleaseEdits(changed)
        if (blocked.length > 0 && !currentRoleKeys().includes('admin')) {
            abortWithMessage(current, RELEASED_TO_VENDOR_MESSAGE, table, `post_release_line_edit:${blocked.join(',')}`)
            return
        }
    }

    const modelSysId = str(current, 'model')
    if (modelSysId && (isInsert || current.getElement('model')?.changes())) {
        const model = new GlideRecord(TABLES.catalog_item)
        if (model.get(modelSysId)) {
            if (str(current, 'nsn_or_exception') === '' || current.getElement('model')?.changes()) {
                current.setValue('nsn_or_exception', str(model, 'model_number'))
            }
            setIfEmpty(current, 'nomenclature', str(model, 'name'))
            setIfEmpty(current, 'unit_of_issue', str(model, 'unit_of_issue'))
            if (str(current, 'unit_price') === '' || str(current, 'unit_price') === '0') {
                current.setValue('unit_price', str(model, 'cost'))
            }
        }
    }

    const result = mergeResults([
        validateNsn(str(current, 'nsn_or_exception')),
        validateQuantity(str(current, 'quantity'), 'quantity', 10_000),
        validateSafeText('nomenclature', str(current, 'nomenclature'), 100, true),
    ])
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }

    current.setValue('extended_price', computeExtendedPrice(str(current, 'quantity'), str(current, 'unit_price')).toFixed(2))

    if (isInsert) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'RequestLine')
        if (str(current, 'line_number') === '' || str(current, 'line_number') === '0') {
            const gr = new GlideRecord(table)
            gr.addQuery('heraldry_request', requestSysId)
            gr.query()
            current.setValue('line_number', String(gr.getRowCount() + 1))
        }
    }
    const status = str(current, 'status')
    current.setValue('active', status === 'cancelled' || status === 'complete' ? 'false' : 'true')
}

/** after insert/update/delete */
export function requestLineAfter(current: AnyRecord, previous: AnyRecord): void {
    rollUpRequestTotals(str(current, 'heraldry_request'))
    if (previous && str(previous, 'heraldry_request') && str(previous, 'heraldry_request') !== str(current, 'heraldry_request')) {
        rollUpRequestTotals(str(previous, 'heraldry_request'))
    }
}

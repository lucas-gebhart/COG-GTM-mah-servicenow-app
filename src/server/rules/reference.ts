/**
 * Business rules for reference / intake tables: authorization files, heraldic items and
 * vendors. Replaces the corresponding Domino form validation formulas.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { TABLES } from '../lib/domain.ts'
import { mergeResults, validateCageCode, validateEmail, validateFileName, validateMultiline, validateNsn, validatePhone, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, nowValue, securityLog, setIfEmpty, str, type AnyRecord } from './glideSupport.ts'

export function authorizationFileBefore(current: AnyRecord): void {
    const table = TABLES.authorization_file
    const result = mergeResults([
        validateFileName('file_name', str(current, 'file_name'), true),
        validateMultiline('parse_log', str(current, 'parse_log'), 8000),
    ])
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    if (current.isNewRecord()) {
        setIfEmpty(current, 'received', nowValue())
        if (str(current, 'submitted_by') === '') current.setValue('submitted_by', gs.getUserID())
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'AuthorizationFile')
    }
    const parseStatus = str(current, 'parse_status')
    const terminal = parseStatus === 'parsed' || parseStatus === 'partial' || parseStatus === 'failed'
    current.setValue('active', terminal ? 'false' : 'true')
    current.setValue('state', parseStatus === 'unmapped' ? 'unmapped' : terminal ? 'closed' : 'open')
}

export function heraldicItemBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.heraldic_item
    const results = [
        validateSafeText('nomenclature', str(current, 'nomenclature'), 120, true),
        validateMultiline('description', str(current, 'description'), 1000),
        validateSafeText('drawing_number', str(current, 'drawing_number'), 40, false),
    ]
    const isException = str(current, 'exception_item') === 'true'
    const stock = str(current, 'stock_number')
    if (!isException) results.push(validateNsn(stock, 'stock_number'))
    else results.push(validateSafeText('stock_number', stock, 20, true))
    const price = Number(str(current, 'unit_price'))
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
        results.push({ valid: false, issues: [{ field: 'unit_price', code: 'range', message: 'Unit price must be between 0 and 100,000' }] })
    }
    const lead = Number(str(current, 'lead_time_days') || 0)
    if (!Number.isInteger(lead) || lead < 0 || lead > 730) {
        results.push({ valid: false, issues: [{ field: 'lead_time_days', code: 'range', message: 'Lead time must be 0-730 days' }] })
    }
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    // Stock numbers are unique across the catalog.
    if (current.isNewRecord() || current.getElement('stock_number')?.changes()) {
        const dup = new GlideRecord(table)
        dup.addQuery('stock_number', stock)
        if (!current.isNewRecord()) dup.addQuery('sys_id', '!=', current.getUniqueValue())
        dup.setLimit(1)
        dup.query()
        if (dup.hasNext()) {
            abortWithMessage(current, 'A heraldic item with this stock number already exists', table, 'duplicate_stock_number')
            return
        }
    }
    if (current.isNewRecord() && str(current, 'legacy_form') === '') current.setValue('legacy_form', 'HeraldicItem')
    const state = str(current, 'state') || 'active'
    current.setValue('active', state === 'active' ? 'true' : 'false')
    if (!current.isNewRecord() && current.getElement('unit_price')?.changes()) {
        securityLog({
            event: 'data_change',
            table,
            record: current.getUniqueValue(),
            outcome: 'success',
            reason: 'unit_price_changed',
            details: { from: str(previous, 'unit_price'), to: str(current, 'unit_price') },
        })
    }
}

export function vendorBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.vendor
    const results = [
        validateSafeText('name', str(current, 'name'), 120, true),
        validateCageCode(str(current, 'cage_code')),
        validateSafeText('uei', str(current, 'uei'), 12, false),
        validateSafeText('contract_number', str(current, 'contract_number'), 30, false),
        validateSafeText('poc', str(current, 'poc'), 100, false),
        validateMultiline('address', str(current, 'address'), 500),
        validateMultiline('capabilities', str(current, 'capabilities'), 1000),
    ]
    if (str(current, 'email')) results.push(validateEmail(str(current, 'email')))
    if (str(current, 'phone')) results.push(validatePhone(str(current, 'phone')))
    const uei = str(current, 'uei')
    if (uei && !/^[A-HJ-NP-Z0-9]{12}$/.test(uei)) {
        results.push({ valid: false, issues: [{ field: 'uei', code: 'format', message: 'UEI must be 12 alphanumeric characters (no I or O)' }] })
    }
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    if (current.isNewRecord() || current.getElement('cage_code')?.changes()) {
        const dup = new GlideRecord(table)
        dup.addQuery('cage_code', str(current, 'cage_code'))
        if (!current.isNewRecord()) dup.addQuery('sys_id', '!=', current.getUniqueValue())
        dup.setLimit(1)
        dup.query()
        if (dup.hasNext()) {
            abortWithMessage(current, 'A vendor with this CAGE code already exists', table, 'duplicate_cage_code')
            return
        }
    }
    if (current.isNewRecord() && str(current, 'legacy_form') === '') current.setValue('legacy_form', 'Vendor')
    const state = str(current, 'state') || 'active'
    current.setValue('active', state === 'active' ? 'true' : 'false')
    // Changing who can log in as this vendor is an administrative security action.
    const portalChanged = !current.isNewRecord() && (current.getElement('portal_user')?.changes() || current.getElement('user_group')?.changes())
    if (portalChanged) {
        securityLog({
            event: 'admin_action',
            table,
            record: current.getUniqueValue(),
            outcome: 'success',
            reason: 'vendor_access_changed',
            details: {
                portal_user_from: str(previous, 'portal_user'),
                portal_user_to: str(current, 'portal_user'),
                user_group_from: str(previous, 'user_group'),
                user_group_to: str(current, 'user_group'),
            },
        })
    }
}

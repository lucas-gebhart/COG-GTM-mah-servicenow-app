/**
 * Business rules for the reference / intake tables: authorization-file tasks, catalog models
 * (cmdb_model extension) and vendor companies (core_company with the scoped CAGE column).
 * Replaces the corresponding Domino form validation formulas.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { COMPANY_FIELDS, PLATFORM_TABLES, TABLES } from '../lib/domain.ts'
import { mergeResults, validateCageCode, validateEmail, validateFileName, validateMultiline, validateNsn, validateSafeText } from '../lib/validators.ts'
import { abortWithMessage, abortWithValidation, applyTaskState, nowValue, securityLog, setIfEmpty, str, type AnyRecord, isMigrationImport } from './glideSupport.ts'

export function authorizationFileBefore(current: AnyRecord): void {
    if (isMigrationImport()) return
    const table = TABLES.authorization_file
    const result = mergeResults([validateFileName('file_name', str(current, 'file_name'), true), validateMultiline('parse_log', str(current, 'parse_log'), 8000)])
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    if (current.isNewRecord()) {
        if (str(current, 'submitted_by') === '') current.setValue('submitted_by', gs.getUserID())
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'AuthorizationFile')
        if (str(current, 'stage') === '') current.setValue('stage', 'received')
        if (str(current, 'short_description') === '') current.setValue('short_description', `Authorization file ${str(current, 'file_name')}`.slice(0, 160))
    }
    const stage = str(current, 'stage') || 'received'
    if (stage === 'parsed' || stage === 'partial' || stage === 'failed') setIfEmpty(current, 'imported_at', nowValue())
    applyTaskState(current, 'authorization_file', stage)
}

/** before insert/update on x_cog_mah_native_catalog_item (cmdb_model extension). */
export function catalogItemBefore(current: AnyRecord, previous: AnyRecord): void {
    const table = TABLES.catalog_item
    const results = [
        validateSafeText('name', str(current, 'name'), 120, true),
        validateMultiline('description', str(current, 'description'), 1000),
        validateSafeText('drawing_number', str(current, 'drawing_number'), 40, false),
    ]
    const isException = str(current, 'exception_item') === 'true'
    const isAward = str(current, 'catalog_kind') === 'award'
    const stock = str(current, 'model_number')
    if (isAward) {
        // award / decoration models carry the catalog key, not an NSN
        const ok = /^[a-z0-9_]{1,60}$/.test(stock)
        results.push(ok ? { valid: true, issues: [] } : { valid: false, issues: [{ field: 'model_number', code: 'format', message: 'Award catalog key must be 1-60 lower-case letters, digits or underscores' }] })
    } else if (!isException) results.push(validateNsn(stock, 'model_number'))
    else results.push(validateSafeText('model_number', stock, 20, true))
    const price = Number(str(current, 'cost') || 0)
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
        results.push({ valid: false, issues: [{ field: 'cost', code: 'range', message: 'Unit price must be between 0 and 100,000' }] })
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
    if (current.isNewRecord() || current.getElement('model_number')?.changes()) {
        const dup = new GlideRecord(table)
        dup.addQuery('model_number', stock)
        if (!current.isNewRecord()) dup.addQuery('sys_id', '!=', current.getUniqueValue())
        dup.setLimit(1)
        dup.query()
        if (dup.hasNext()) {
            abortWithMessage(current, 'A catalog model with this stock number already exists', table, 'duplicate_stock_number')
            return
        }
    }
    if (current.isNewRecord()) {
        if (str(current, 'legacy_form') === '') current.setValue('legacy_form', 'HeraldicItem')
        if (str(current, 'catalog_state') === '') current.setValue('catalog_state', 'active')
        if (str(current, 'display_name') === '') current.setValue('display_name', `${str(current, 'name')} (${stock})`.slice(0, 255))
    }
    if (!current.isNewRecord() && current.getElement('cost')?.changes()) {
        securityLog({
            event: 'data_change',
            table,
            record: current.getUniqueValue(),
            outcome: 'success',
            reason: 'unit_price_changed',
            details: { from: str(previous, 'cost'), to: str(current, 'cost') },
        })
    }
}

/**
 * before insert/update on core_company: only rows that carry the MAH CAGE column (vendors and
 * agencies this app manages) are validated; every other company is untouched.
 */
export function companyBefore(current: AnyRecord): void {
    const table = PLATFORM_TABLES.company
    const cage = str(current, COMPANY_FIELDS.cage_code)
    const isMahCompany = cage !== '' || str(current, COMPANY_FIELDS.legacy_unid) !== '' || str(current, COMPANY_FIELDS.agency_code) !== ''
    if (!isMahCompany) return
    const results = [
        validateSafeText('name', str(current, 'name'), 120, true),
        validateSafeText(COMPANY_FIELDS.contract_number, str(current, COMPANY_FIELDS.contract_number), 30, false),
        validateSafeText(COMPANY_FIELDS.poc, str(current, COMPANY_FIELDS.poc), 100, false),
        validateMultiline(COMPANY_FIELDS.capabilities, str(current, COMPANY_FIELDS.capabilities), 1000),
    ]
    if (str(current, 'vendor') === 'true' || cage !== '') results.push(validateCageCode(cage, COMPANY_FIELDS.cage_code))
    if (str(current, COMPANY_FIELDS.poc_email)) results.push(validateEmail(str(current, COMPANY_FIELDS.poc_email), COMPANY_FIELDS.poc_email))
    const result = mergeResults(results)
    if (!result.valid) {
        abortWithValidation(current, result, table)
        return
    }
    if (cage !== '' && (current.isNewRecord() || current.getElement(COMPANY_FIELDS.cage_code)?.changes())) {
        const dup = new GlideRecord(table)
        dup.addQuery(COMPANY_FIELDS.cage_code, cage)
        if (!current.isNewRecord()) dup.addQuery('sys_id', '!=', current.getUniqueValue())
        dup.setLimit(1)
        dup.query()
        if (dup.hasNext()) {
            abortWithMessage(current, 'A company with this CAGE code already exists', table, 'duplicate_cage_code')
            return
        }
    }
    if (cage !== '') current.setValue('vendor', 'true')
}

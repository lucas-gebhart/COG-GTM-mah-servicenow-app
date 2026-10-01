/**
 * Company-based vendor isolation (the standard ServiceNow multi-tenancy pattern).
 *
 * v1 scoped vendors through `x_cog_mah_vendor.portal_user` / `user_group`. Here the vendor is a
 * `core_company` row, the vendor login's `sys_user.company` points at it, and every vendor-facing
 * task carries the inherited `task.company`. An external vendor session therefore sees exactly
 * the released tasks whose `company` equals `gs.getUser().getCompanyID()` — one parameterized
 * query, no per-table lookup tables.
 */
import { gs, type GlideRecord } from '@servicenow/glide'
import { ROLES, TABLES } from '../lib/domain.ts'
import { VENDOR_ISOLATION } from '../lib/security.ts'
import { securityLog } from './glideSupport.ts'

/** Internal roles that see everything; a vendor with one of these is treated as staff. */
const INTERNAL_ROLES: readonly string[] = [ROLES.tacom_staff, ROLES.csr, ROLES.dla, ROLES.admin, 'admin']

export function isExternalVendorSession(): boolean {
    if (!gs.hasRole(ROLES.vendor)) return false
    return !INTERNAL_ROLES.some((r) => gs.hasRole(r))
}

/** `sys_user.company` of the session user, or '' when the vendor login has no company (sees nothing). */
export function currentVendorCompany(): string {
    const id = gs.getUser().getCompanyID()
    return id === null || id === undefined ? '' : String(id)
}

function restrictToCompany(current: GlideRecord<string>, companyField: string, stageField: string, table: string): void {
    const company = currentVendorCompany()
    if (company === '') {
        current.addQuery('sys_id', 'NULL')
    } else {
        current.addQuery(companyField, company)
        current.addQuery(stageField, 'IN', VENDOR_ISOLATION.releasedStages.join(','))
    }
    securityLog({ event: 'data_access', table, outcome: 'success', reason: 'vendor_isolation', details: { hasCompany: company !== '' } })
}

/** before query on x_cog_mah_native_heraldry_request */
export function heraldryRequestVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    restrictToCompany(current, 'company', 'stage', TABLES.heraldry_request)
}

/** before query on x_cog_mah_native_ses_flag_request */
export function sesFlagRequestVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    restrictToCompany(current, 'company', 'stage', TABLES.ses_flag_request)
}

/** before query on x_cog_mah_native_request_line: filtered through the parent request's company. */
export function requestLineVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    restrictToCompany(current, 'heraldry_request.company', 'heraldry_request.stage', TABLES.request_line)
}

/** before query on core_company: a vendor sees only its own company record. */
export function companySelfQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    const company = currentVendorCompany()
    if (company === '') current.addQuery('sys_id', 'NULL')
    else current.addQuery('sys_id', company)
}

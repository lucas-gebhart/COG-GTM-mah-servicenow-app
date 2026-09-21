/**
 * Query business rules that scope vendor users to their own work.
 *
 * Replaces the Domino `Readers` fields on `Request` / `RequestLine` documents, which held
 * the vendor's hierarchical name plus `[TACOM]`/`[DLA]`/`[Admin]`. In ServiceNow the same
 * effect is achieved by adding a parameterized query to every read on the table when the
 * session user holds x_cog_mah.vendor and no internal role.
 */
import { GlideRecord, gs } from '@servicenow/glide'
import { ROLES, TABLES } from '../lib/domain'
import { securityLog } from './glideSupport'

/** Internal roles that see everything; a vendor with one of these is treated as staff. */
const INTERNAL_ROLES: readonly string[] = [ROLES.tacom_staff, ROLES.csr, ROLES.dla, ROLES.admin, 'admin']

export function isExternalVendorSession(): boolean {
    if (!gs.hasRole(ROLES.vendor)) return false
    return !INTERNAL_ROLES.some((r) => gs.hasRole(r))
}

/** Vendor sys_ids the current user may see: portal_user match OR membership in the vendor's user_group. */
export function vendorSysIdsForCurrentUser(): string[] {
    const userId = gs.getUserID()
    const ids = new Set<string>()
    const byUser = new GlideRecord(TABLES.vendor)
    byUser.addQuery('portal_user', userId)
    byUser.addQuery('active', 'true')
    byUser.query()
    while (byUser.next()) ids.add(byUser.getUniqueValue())

    const groups: string[] = []
    const membership = new GlideRecord('sys_user_grmember')
    membership.addQuery('user', userId)
    membership.query()
    while (membership.next()) groups.push(String(membership.getValue('group')))
    if (groups.length > 0) {
        const byGroup = new GlideRecord(TABLES.vendor)
        byGroup.addQuery('user_group', 'IN', groups.join(','))
        byGroup.addQuery('active', 'true')
        byGroup.query()
        while (byGroup.next()) ids.add(byGroup.getUniqueValue())
    }
    return [...ids]
}

/** before query on x_cog_mah_heraldry_request */
export function heraldryRequestVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    const vendors = vendorSysIdsForCurrentUser()
    if (vendors.length === 0) {
        current.addQuery('sys_id', 'NULL')
    } else {
        current.addQuery('vendor', 'IN', vendors.join(','))
        current.addNotNullQuery('released_to_vendor')
    }
    securityLog({
        event: 'data_access',
        table: TABLES.heraldry_request,
        outcome: 'success',
        reason: 'vendor_isolation',
        details: { vendorCount: vendors.length },
    })
}

/** before query on x_cog_mah_request_line */
export function requestLineVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    const vendors = vendorSysIdsForCurrentUser()
    if (vendors.length === 0) {
        current.addQuery('sys_id', 'NULL')
        return
    }
    current.addQuery('heraldry_request.vendor', 'IN', vendors.join(','))
    current.addNotNullQuery('heraldry_request.released_to_vendor')
}

/** before query on x_cog_mah_vendor: a vendor sees only its own vendor record. */
export function vendorSelfQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    const vendors = vendorSysIdsForCurrentUser()
    if (vendors.length === 0) current.addQuery('sys_id', 'NULL')
    else current.addQuery('sys_id', 'IN', vendors.join(','))
}

/** before query on x_cog_mah_case_note: vendors only see vendor-visible notes on their requests. */
export function caseNoteVendorQuery(current: GlideRecord<string>): void {
    if (!isExternalVendorSession()) return
    const vendors = vendorSysIdsForCurrentUser()
    if (vendors.length === 0) {
        current.addQuery('sys_id', 'NULL')
        return
    }
    current.addQuery('heraldry_request.vendor', 'IN', vendors.join(','))
    current.addQuery('customer_visible', 'true')
}

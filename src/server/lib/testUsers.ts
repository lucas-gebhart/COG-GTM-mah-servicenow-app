/**
 * Synthetic test principals: one user per application role plus the vendor portal group used by
 * the vendor isolation rules. Names are fictitious; no passwords are defined anywhere.
 *
 * This registry is the single source of truth for both halves of the delivery:
 *   - src/fluent/security/test_users.now.ts ships the `sys_user` / `sys_user_group` records
 *     inside the application package;
 *   - tools/grant-test-roles.ts grants the roles and group memberships through the Table API,
 *     because `sys_user_has_role`, `sys_group_has_role` and `sys_user_grmember` are not
 *     application-file tables and the application installer skips them ("permission denied").
 */
import { ROLES, type RoleKey } from './domain.ts'

export interface TestUser {
    /** Fluent `Now.ID` key of the sys_user record (`user_<key>`). */
    readonly key: string
    readonly userName: string
    readonly firstName: string
    readonly lastName: string
    readonly title: string
    readonly email: string
    /** Roles granted directly on the user (sys_user_has_role). */
    readonly roles: readonly RoleKey[]
    /** Groups the user is a member of (sys_user_grmember), by TestGroup key. */
    readonly groups: readonly string[]
    /** CAGE code of the `x_cog_mah_vendor` row whose `portal_user` this user becomes (vendor isolation). */
    readonly vendorCageCode?: string
}

export interface TestGroup {
    /** Fluent `Now.ID` key of the sys_user_group record (`group_<key>`). */
    readonly key: string
    readonly name: string
    readonly description: string
    /** Roles granted on the group (sys_group_has_role). */
    readonly roles: readonly RoleKey[]
    /** CAGE code of the `x_cog_mah_vendor` row whose `user_group` this group becomes (vendor isolation). */
    readonly vendorCageCode?: string
}

export const TEST_GROUPS: readonly TestGroup[] = [
    {
        key: 'vendor_clearfield',
        name: 'MAH Vendor - Clearfield Colors & Regalia',
        description: "Portal users of vendor CAGE 1CLR7. Members see only that vendor's heraldry requests.",
        roles: ['vendor'],
        vendorCageCode: '1CLR7',
    },
]

export const TEST_USERS: readonly TestUser[] = [
    {
        key: 'tacom',
        userName: 'mah.tacom',
        firstName: 'Dana',
        lastName: 'Whitcombe',
        title: 'MAH Program Lead (synthetic)',
        email: 'mah.tacom@example.mil',
        roles: ['tacom_staff'],
        groups: [],
    },
    {
        key: 'csr',
        userName: 'mah.csr',
        firstName: 'Marcus',
        lastName: 'Oyelaran',
        title: 'Customer Service Representative (synthetic)',
        email: 'mah.csr@example.mil',
        roles: ['csr'],
        groups: [],
    },
    {
        key: 'engraver',
        userName: 'mah.engraver',
        firstName: 'Priya',
        lastName: 'Castellanos',
        title: 'Engraving Technician (synthetic)',
        email: 'mah.engraver@example.mil',
        roles: ['engraver'],
        groups: [],
    },
    {
        key: 'assembler',
        userName: 'mah.assembler',
        firstName: 'Tomas',
        lastName: 'Reinholt',
        title: 'Assembly / QC Technician (synthetic)',
        email: 'mah.assembler@example.mil',
        roles: ['assembler'],
        groups: [],
    },
    {
        key: 'warehouse',
        userName: 'mah.warehouse',
        firstName: 'Leah',
        lastName: 'Baptiste',
        title: 'Warehouse Specialist (synthetic)',
        email: 'mah.warehouse@example.mil',
        roles: ['warehouse'],
        groups: [],
    },
    {
        key: 'vendor',
        userName: 'mah.vendor.clearfield',
        firstName: 'Evelyn',
        lastName: 'Fortenbury',
        title: 'Vendor portal user, Clearfield Colors & Regalia (synthetic)',
        email: 'mah.vendor.clearfield@example.com',
        roles: ['vendor'],
        groups: ['vendor_clearfield'],
        vendorCageCode: '1CLR7',
    },
    {
        key: 'dla',
        userName: 'mah.dla',
        firstName: 'Robert',
        lastName: 'Ashby-Kane',
        title: 'DLA Troop Support Liaison (synthetic)',
        email: 'mah.dla@example.mil',
        roles: ['dla'],
        groups: [],
    },
    {
        key: 'admin',
        userName: 'mah.admin',
        firstName: 'Simone',
        lastName: 'Varga',
        title: 'MAH Application Administrator (synthetic)',
        email: 'mah.admin@example.mil',
        roles: ['admin'],
        groups: [],
    },
]

export interface VendorLink {
    readonly cageCode: string
    /** `x_cog_mah_vendor.portal_user` by user_name, when a test user is that vendor's portal login. */
    readonly userName?: string
    /** `x_cog_mah_vendor.user_group` by group name, when a test group is that vendor's portal group. */
    readonly group?: string
}

export interface RoleGrantPlan {
    readonly userRoles: readonly { userName: string; role: string }[]
    readonly groupRoles: readonly { group: string; role: string }[]
    readonly memberships: readonly { userName: string; group: string }[]
    /** Vendor rows (by CAGE) that must point at a test principal for the isolation rules to bite. */
    readonly vendorLinks: readonly VendorLink[]
}

/**
 * Flatten the registry into the three membership tables the Table API tool has to populate, plus
 * the vendor links (portal_user / user_group are cut-over settings, never migrated from the legacy export).
 */
export function roleGrantPlan(users: readonly TestUser[] = TEST_USERS, groups: readonly TestGroup[] = TEST_GROUPS): RoleGrantPlan {
    const groupByKey = new Map(groups.map((g) => [g.key, g]))
    const userRoles: { userName: string; role: string }[] = []
    const memberships: { userName: string; group: string }[] = []
    for (const u of users) {
        for (const r of u.roles) userRoles.push({ userName: u.userName, role: ROLES[r] })
        for (const gk of u.groups) {
            const g = groupByKey.get(gk)
            if (!g) throw new Error(`test user ${u.userName} references unknown group ${gk}`)
            memberships.push({ userName: u.userName, group: g.name })
        }
    }
    const groupRoles = groups.flatMap((g) => g.roles.map((r) => ({ group: g.name, role: ROLES[r] })))
    const linksByCage = new Map<string, { cageCode: string; userName?: string; group?: string }>()
    for (const u of users) {
        if (u.vendorCageCode === undefined) continue
        const link = linksByCage.get(u.vendorCageCode) ?? { cageCode: u.vendorCageCode }
        if (link.userName !== undefined) throw new Error(`two test users claim vendor CAGE ${u.vendorCageCode}`)
        linksByCage.set(u.vendorCageCode, { ...link, userName: u.userName })
    }
    for (const g of groups) {
        if (g.vendorCageCode === undefined) continue
        const link = linksByCage.get(g.vendorCageCode) ?? { cageCode: g.vendorCageCode }
        if (link.group !== undefined) throw new Error(`two test groups claim vendor CAGE ${g.vendorCageCode}`)
        linksByCage.set(g.vendorCageCode, { ...link, group: g.name })
    }
    return { userRoles, groupRoles, memberships, vendorLinks: [...linksByCage.values()] }
}

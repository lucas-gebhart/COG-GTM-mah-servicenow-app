import { Record } from '@servicenow/sdk/core'

/**
 * Synthetic test users, one per application role, plus the vendor group used by the vendor
 * isolation rules. Names are fictitious. No passwords are shipped: sign in as an administrator
 * and use "Impersonate user" (the same path the verification screenshots use), or set a
 * password on the instance. `x_cog_mah_vendor.portal_user` / `user_group` are pointed at the
 * vendor user / group after migration (see docs/MIGRATION-RUNBOOK.md, cut-over step 3).
 */

export const user_tacom = Record({
    $id: Now.ID['user_tacom'],
    table: 'sys_user',
    data: {
        user_name: 'mah.tacom',
        first_name: 'Dana',
        last_name: 'Whitcombe',
        title: 'MAH Program Lead (synthetic)',
        email: 'mah.tacom@example.mil',
        active: true,
    },
})

export const user_csr = Record({
    $id: Now.ID['user_csr'],
    table: 'sys_user',
    data: {
        user_name: 'mah.csr',
        first_name: 'Marcus',
        last_name: 'Oyelaran',
        title: 'Customer Service Representative (synthetic)',
        email: 'mah.csr@example.mil',
        active: true,
    },
})

export const user_engraver = Record({
    $id: Now.ID['user_engraver'],
    table: 'sys_user',
    data: {
        user_name: 'mah.engraver',
        first_name: 'Priya',
        last_name: 'Castellanos',
        title: 'Engraving Technician (synthetic)',
        email: 'mah.engraver@example.mil',
        active: true,
    },
})

export const user_assembler = Record({
    $id: Now.ID['user_assembler'],
    table: 'sys_user',
    data: {
        user_name: 'mah.assembler',
        first_name: 'Tomas',
        last_name: 'Reinholt',
        title: 'Assembly / QC Technician (synthetic)',
        email: 'mah.assembler@example.mil',
        active: true,
    },
})

export const user_warehouse = Record({
    $id: Now.ID['user_warehouse'],
    table: 'sys_user',
    data: {
        user_name: 'mah.warehouse',
        first_name: 'Leah',
        last_name: 'Baptiste',
        title: 'Warehouse Specialist (synthetic)',
        email: 'mah.warehouse@example.mil',
        active: true,
    },
})

export const user_vendor = Record({
    $id: Now.ID['user_vendor'],
    table: 'sys_user',
    data: {
        user_name: 'mah.vendor.liberty',
        first_name: 'Evelyn',
        last_name: 'Fortenbury',
        title: 'Vendor portal user, Liberty Colors LLC (synthetic)',
        email: 'mah.vendor.liberty@example.com',
        active: true,
    },
})

export const user_dla = Record({
    $id: Now.ID['user_dla'],
    table: 'sys_user',
    data: {
        user_name: 'mah.dla',
        first_name: 'Robert',
        last_name: 'Ashby-Kane',
        title: 'DLA Troop Support Liaison (synthetic)',
        email: 'mah.dla@example.mil',
        active: true,
    },
})

export const user_admin = Record({
    $id: Now.ID['user_admin'],
    table: 'sys_user',
    data: {
        user_name: 'mah.admin',
        first_name: 'Simone',
        last_name: 'Varga',
        title: 'MAH Application Administrator (synthetic)',
        email: 'mah.admin@example.mil',
        active: true,
    },
})

export const group_vendor_liberty = Record({
    $id: Now.ID['group_vendor_liberty'],
    table: 'sys_user_group',
    data: {
        name: 'MAH Vendor - Liberty Colors LLC',
        description: 'Portal users of vendor CAGE 1CLR7. Members see only that vendor\'s heraldry requests.',
        active: true,
    },
})

export const grmember_vendor_liberty = Record({
    $id: Now.ID['grmember_vendor_liberty'],
    table: 'sys_user_grmember',
    data: { group: Now.ID['group_vendor_liberty'], user: Now.ID['user_vendor'] },
})

export const group_role_vendor_liberty = Record({
    $id: Now.ID['group_role_vendor_liberty'],
    table: 'sys_group_has_role',
    data: { group: Now.ID['group_vendor_liberty'], role: Now.ID['role_vendor'] },
})

export const has_role_tacom = Record({
    $id: Now.ID['has_role_tacom'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_tacom'], role: Now.ID['role_tacom_staff'] },
})

export const has_role_csr = Record({
    $id: Now.ID['has_role_csr'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_csr'], role: Now.ID['role_csr'] },
})

export const has_role_engraver = Record({
    $id: Now.ID['has_role_engraver'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_engraver'], role: Now.ID['role_engraver'] },
})

export const has_role_assembler = Record({
    $id: Now.ID['has_role_assembler'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_assembler'], role: Now.ID['role_assembler'] },
})

export const has_role_warehouse = Record({
    $id: Now.ID['has_role_warehouse'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_warehouse'], role: Now.ID['role_warehouse'] },
})

export const has_role_vendor = Record({
    $id: Now.ID['has_role_vendor'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_vendor'], role: Now.ID['role_vendor'] },
})

export const has_role_dla = Record({
    $id: Now.ID['has_role_dla'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_dla'], role: Now.ID['role_dla'] },
})

export const has_role_admin = Record({
    $id: Now.ID['has_role_admin'],
    table: 'sys_user_has_role',
    data: { user: Now.ID['user_admin'], role: Now.ID['role_admin'] },
})

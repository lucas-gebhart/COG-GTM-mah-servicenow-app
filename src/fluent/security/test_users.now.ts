// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/testUsers.ts. Regenerate with `npm run gen:security`.
//
// Synthetic test users, one per application role, plus the vendor group used by the vendor
// isolation rules. Only sys_user / sys_user_group rows ship with the application: role grants and
// group memberships (sys_user_has_role, sys_group_has_role, sys_user_grmember) are not application
// files and are skipped by the installer, so they are applied post-install by `npm run grant-roles`
// (tools/grant-test-roles.ts) from the same registry. No passwords are shipped: sign in as an
// administrator and use "Impersonate user", or set a password on the instance.
import { Record } from '@servicenow/sdk/core'

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

/**
 * Application navigator: "MAH Case Management" with mission-shaped modules — the equivalents of the
 * categorised Domino views the XPages app opened. Record-oriented modules (lists, "new" links,
 * migration and administration) live here; the operational queue, aging, dashboard and review
 * modules are generated into operations_modules.now.ts from tools/lib/operations-catalog.ts so a
 * queue definition exists exactly once.
 */
import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { admin, assembler, csr, dla, engraver, tacomStaff, vendor, warehouse } from '../security/roles.now'

export const mahCategory = Record({
    $id: Now.ID['app_category'],
    table: 'sys_app_category',
    data: {
        name: 'MAH Case Management',
        style: 'border-color: #4b6b3a; background-color: #eef3e8;',
    },
})

export const mahMenu = ApplicationMenu({
    $id: Now.ID['app_menu'],
    title: 'MAH Case Management',
    name: 'x_cog_mah',
    hint: 'Medals, Awards & Heraldry case management (modernization reference application)',
    description: 'Awards case fulfilment, DD Form 1348-6 heraldry requests, SES flag requests, vendor release and legacy migration tooling.',
    category: mahCategory,
    roles: [tacomStaff, csr, engraver, assembler, warehouse, vendor, dla, admin],
    active: true,
    order: 100,
})

// ------------------------------------------------------------------ Awards (medals)
export const modSepAwards = Record({
    $id: Now.ID['mod_sep_awards'],
    table: 'sys_app_module',
    data: { title: 'Awards (medals & decorations)', application: mahMenu, link_type: 'SEPARATOR', active: true, order: 200, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'] },
})
export const modCases = Record({
    $id: Now.ID['mod_cases'],
    table: 'sys_app_module',
    data: { title: 'Awards cases', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_awards_case', filter: 'active=true^ORDERBYDESCsys_updated_on', active: true, order: 210, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'] },
})
export const modNewCase = Record({
    $id: Now.ID['mod_new_case'],
    table: 'sys_app_module',
    data: { title: 'Create new case', application: mahMenu, link_type: 'NEW', name: 'x_cog_mah_awards_case', active: true, order: 220, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'] },
})
export const modLines = Record({
    $id: Now.ID['mod_lines'],
    table: 'sys_app_module',
    data: { title: 'Award lines', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_award_line', active: true, order: 230, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'] },
})
export const modRequesters = Record({
    $id: Now.ID['mod_requesters'],
    table: 'sys_app_module',
    data: { title: 'Requesters', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_requester', filter: 'merged_intoISEMPTY^ORDERBYlast_name', active: true, order: 240, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'] },
})
export const modRequesterDupes = Record({
    $id: Now.ID['mod_requester_dupes'],
    table: 'sys_app_module',
    data: { title: 'Requesters: possible duplicates', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_requester', filter: 'merged_intoISEMPTY^duplicate_count>1^ORDERBYdedupe_key', hint: 'Requesters sharing a dedupe key that have not been merged', active: true, order: 250, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'] },
})
export const modAuthFiles = Record({
    $id: Now.ID['mod_auth_files'],
    table: 'sys_app_module',
    data: { title: 'Authorization files (HRC / NPRC)', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_authorization_file', filter: 'ORDERBYDESCreceived', active: true, order: 260, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'] },
})
export const modEngravingJobs = Record({
    $id: Now.ID['mod_engraving_jobs'],
    table: 'sys_app_module',
    data: { title: 'Engraving jobs', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_engraving_job', active: true, order: 270, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'] },
})
export const modShipments = Record({
    $id: Now.ID['mod_shipments'],
    table: 'sys_app_module',
    data: { title: 'Shipments', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_shipment', filter: 'ORDERBYDESCshipped', active: true, order: 280, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.warehouse', 'x_cog_mah.admin'] },
})

// ------------------------------------------------------------------ Heraldry (DD 1348-6)
export const modSepHeraldry = Record({
    $id: Now.ID['mod_sep_heraldry'],
    table: 'sys_app_module',
    data: { title: 'Heraldry (DD Form 1348-6)', application: mahMenu, link_type: 'SEPARATOR', active: true, order: 300, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.vendor', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})
export const modRequests = Record({
    $id: Now.ID['mod_requests'],
    table: 'sys_app_module',
    data: { title: 'Heraldry requests', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_heraldry_request', filter: 'active=true^ORDERBYDESCsys_updated_on', active: true, order: 310, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.vendor', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})
export const modNewRequest = Record({
    $id: Now.ID['mod_new_request'],
    table: 'sys_app_module',
    data: { title: 'Create DD 1348-6 request', application: mahMenu, link_type: 'NEW', name: 'x_cog_mah_heraldry_request', active: true, order: 320, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})
export const modRequestLines = Record({
    $id: Now.ID['mod_request_lines'],
    table: 'sys_app_module',
    data: { title: 'Request lines', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_request_line', active: true, order: 330, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.vendor', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})
export const modCatalog = Record({
    $id: Now.ID['mod_catalog'],
    table: 'sys_app_module',
    data: { title: 'Heraldic item catalog', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_heraldic_item', filter: 'active=true^ORDERBYcategory^ORDERBYnomenclature', active: true, order: 340, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})
export const modSes = Record({
    $id: Now.ID['mod_ses'],
    table: 'sys_app_module',
    data: { title: 'SES flag requests', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_ses_flag_request', active: true, order: 350, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'] },
})
export const modVendors = Record({
    $id: Now.ID['mod_vendors'],
    table: 'sys_app_module',
    data: { title: 'Vendors', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_vendor', filter: 'active=true^ORDERBYname', active: true, order: 360, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'] },
})

// ------------------------------------------------------------------ Migration & administration
export const modSepAdmin = Record({
    $id: Now.ID['mod_sep_admin'],
    table: 'sys_app_module',
    data: { title: 'Migration & administration', application: mahMenu, link_type: 'SEPARATOR', active: true, order: 400, roles: ['x_cog_mah.admin'] },
})
export const modCaseNotes = Record({
    $id: Now.ID['mod_case_notes'],
    table: 'sys_app_module',
    data: { title: 'Case notes (migrated)', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_case_note', active: true, order: 410, roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'] },
})
export const modStatusMap = Record({
    $id: Now.ID['mod_status_map'],
    table: 'sys_app_module',
    data: { title: 'Legacy status map', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_status_map', filter: 'ORDERBYlegacy_form^ORDERBYlegacy_status', hint: 'Free-text legacy status → target choice mapping used by the transform maps', active: true, order: 420, roles: ['x_cog_mah.admin'] },
})
export const modExceptions = Record({
    $id: Now.ID['mod_exceptions'],
    table: 'sys_app_module',
    data: { title: 'Migration exceptions (open)', application: mahMenu, link_type: 'LIST', name: 'x_cog_mah_migration_exception', filter: 'state=open^ORDERBYexception_type^ORDERBYsource_table', active: true, order: 430, roles: ['x_cog_mah.admin'] },
})
export const modImportSets = Record({
    $id: Now.ID['mod_import_sets'],
    table: 'sys_app_module',
    data: { title: 'Import sets (legacy CSV loads)', application: mahMenu, link_type: 'LIST', name: 'sys_import_set', filter: 'table_nameSTARTSWITHx_cog_mah_imp_^ORDERBYDESCsys_created_on', active: true, order: 440, roles: ['x_cog_mah.admin'] },
})
export const modReconciliation = Record({
    $id: Now.ID['mod_reconciliation'],
    table: 'sys_app_module',
    data: {
        title: 'Reconciliation report (JSON)',
        application: mahMenu,
        link_type: 'DIRECT',
        query: 'api/x_cog_mah/authorization_intake/reconciliation',
        hint: 'Live target-side counts, orphans, merges, unmapped statuses and queue depth',
        active: true,
        order: 450,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})
export const modNightlyAging = Record({
    $id: Now.ID['mod_nightly_aging'],
    table: 'sys_app_module',
    data: { title: 'Scheduled job: MAH Nightly Aging', application: mahMenu, link_type: 'LIST', name: 'sysauto_script', filter: 'name=MAH Nightly Aging', active: true, order: 460, roles: ['x_cog_mah.admin'] },
})
export const modProperties = Record({
    $id: Now.ID['mod_properties'],
    table: 'sys_app_module',
    data: { title: 'Application properties', application: mahMenu, link_type: 'LIST', name: 'sys_properties', filter: 'nameSTARTSWITHx_cog_mah.', active: true, order: 470, roles: ['x_cog_mah.admin'] },
})

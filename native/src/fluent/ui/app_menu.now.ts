/**
 * Application navigator: "MAH Case Management (Native)". Record modules point at the native task
 * tables; the work-queue modules are the platform's own task views ("My Work", "My Groups Work",
 * "My Approvals") filtered to this scope's task classes, so there is no custom queue code. The
 * Visual Task Board, dashboard and report modules live in operations.now.ts.
 *
 * Fluent source files only accept literal initialisers, hence the repeated role arrays.
 */
import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { admin, assembler, csr, dla, engraver, tacomStaff, vendor, warehouse } from '../security/roles.now'

export const mahNativeCategory = Record({
    $id: Now.ID['app_category'],
    table: 'sys_app_category',
    data: {
        name: 'MAH Case Management (Native)',
        style: 'border-color: #1f4e79; background-color: #e8eef6;',
    },
})

export const mahMenu = ApplicationMenu({
    $id: Now.ID['app_menu'],
    title: 'MAH Case Management (Native)',
    name: 'x_cog_mah_native',
    hint: 'Medals, Awards & Heraldry case management — platform-native build (task, core_company, cmdb_model, Task SLA, approvals, Import Sets)',
    description: 'Awards case fulfilment, DD Form 1348-6 heraldry requests, SES flag requests, vendor release and legacy migration on native platform tables.',
    category: mahNativeCategory,
    roles: [tacomStaff, csr, engraver, assembler, warehouse, vendor, dla, admin],
    active: true,
    order: 110,
})

export const modSepMyWork = Record({
    $id: Now.ID['mod_sep_my_work'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 100,
        title: 'My work',
        link_type: 'SEPARATOR',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modMyWork = Record({
    $id: Now.ID['mod_my_work'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 110,
        title: 'My Work',
        link_type: 'LIST',
        name: 'task',
        filter: 'active=true^assigned_to=javascript:gs.getUserID()^sys_class_nameINx_cog_mah_native_awards_case,x_cog_mah_native_heraldry_request,x_cog_mah_native_ses_flag_request,x_cog_mah_native_engraving_job,x_cog_mah_native_shipment,x_cog_mah_native_authorization_file^ORDERBYpriority',
        hint: 'Active MAH tasks assigned to me (cases, requests, engraving jobs, shipments) — the platform task list, no custom queue',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modMyGroupsWork = Record({
    $id: Now.ID['mod_my_groups_work'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 120,
        title: 'My Groups Work',
        link_type: 'LIST',
        name: 'task',
        filter: 'active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b477fe^sys_class_nameINx_cog_mah_native_awards_case,x_cog_mah_native_heraldry_request,x_cog_mah_native_ses_flag_request,x_cog_mah_native_engraving_job,x_cog_mah_native_shipment,x_cog_mah_native_authorization_file^ORDERBYpriority',
        hint: 'Active MAH tasks assigned to one of my groups',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modMyApprovals = Record({
    $id: Now.ID['mod_my_approvals'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 130,
        title: 'My Approvals',
        link_type: 'LIST',
        name: 'sysapproval_approver',
        filter: 'approver=javascript:gs.getUserID()^state=requested^sysapproval.sys_class_nameINx_cog_mah_native_awards_case,x_cog_mah_native_heraldry_request,x_cog_mah_native_ses_flag_request,x_cog_mah_native_engraving_job,x_cog_mah_native_shipment,x_cog_mah_native_authorization_file',
        hint: 'Heraldry request reviews waiting for my approval (native approval engine)',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla'],
    },
})

export const modSepAwards = Record({
    $id: Now.ID['mod_sep_awards'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 200,
        title: 'Awards (medals & decorations)',
        link_type: 'SEPARATOR',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse'],
    },
})

export const modCases = Record({
    $id: Now.ID['mod_cases'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 210,
        title: 'Awards cases',
        link_type: 'LIST',
        name: 'x_cog_mah_native_awards_case',
        filter: 'active=true^ORDERBYDESCsys_updated_on',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse'],
    },
})

export const modNewCase = Record({
    $id: Now.ID['mod_new_case'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 220,
        title: 'Create new case',
        link_type: 'NEW',
        name: 'x_cog_mah_native_awards_case',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin'],
    },
})

export const modLines = Record({
    $id: Now.ID['mod_lines'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 230,
        title: 'Award lines',
        link_type: 'LIST',
        name: 'x_cog_mah_native_award_line',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler'],
    },
})

export const modRequesters = Record({
    $id: Now.ID['mod_requesters'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 240,
        title: 'Requesters',
        link_type: 'LIST',
        name: 'x_cog_mah_native_requester',
        filter: 'merged_intoISEMPTY^ORDERBYlast_name',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin'],
    },
})

export const modRequesterDupes = Record({
    $id: Now.ID['mod_requester_dupes'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 250,
        title: 'Requesters: possible duplicates',
        link_type: 'LIST',
        name: 'x_cog_mah_native_requester',
        filter: 'merged_intoISEMPTY^duplicate_count>1^ORDERBYdedupe_key',
        hint: 'Requesters sharing a dedupe key that have not been merged',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin'],
    },
})

export const modAuthFiles = Record({
    $id: Now.ID['mod_auth_files'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 260,
        title: 'Authorization files (HRC / NPRC)',
        link_type: 'LIST',
        name: 'x_cog_mah_native_authorization_file',
        filter: 'ORDERBYDESCopened_at',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin'],
    },
})

export const modEngravingJobs = Record({
    $id: Now.ID['mod_engraving_jobs'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 270,
        title: 'Engraving jobs',
        link_type: 'LIST',
        name: 'x_cog_mah_native_engraving_job',
        filter: 'active=true^ORDERBYopened_at',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler'],
    },
})

export const modShipments = Record({
    $id: Now.ID['mod_shipments'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 280,
        title: 'Shipments',
        link_type: 'LIST',
        name: 'x_cog_mah_native_shipment',
        filter: 'ORDERBYDESCopened_at',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.warehouse'],
    },
})

export const modCaseSlas = Record({
    $id: Now.ID['mod_case_slas'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 290,
        title: 'Awards case SLAs (task_sla)',
        link_type: 'LIST',
        name: 'task_sla',
        filter: 'task.sys_class_name=x_cog_mah_native_awards_case^ORDERBYDESChas_breached^ORDERBYDESCbusiness_percentage',
        hint: 'Running 60 / 75-day Task SLA timers on awards cases — replaces the nightly aging job',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.engraver', 'x_cog_mah_native.assembler', 'x_cog_mah_native.warehouse'],
    },
})

export const modSepHeraldry = Record({
    $id: Now.ID['mod_sep_heraldry'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 300,
        title: 'Heraldry (DD Form 1348-6)',
        link_type: 'SEPARATOR',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modRequests = Record({
    $id: Now.ID['mod_requests'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 310,
        title: 'Heraldry requests',
        link_type: 'LIST',
        name: 'x_cog_mah_native_heraldry_request',
        filter: 'active=true^ORDERBYDESCsys_updated_on',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modNewRequest = Record({
    $id: Now.ID['mod_new_request'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 320,
        title: 'Create new request',
        link_type: 'NEW',
        name: 'x_cog_mah_native_heraldry_request',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla'],
    },
})

export const modRequestLines = Record({
    $id: Now.ID['mod_request_lines'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 330,
        title: 'Request lines',
        link_type: 'LIST',
        name: 'x_cog_mah_native_request_line',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modReleased = Record({
    $id: Now.ID['mod_released'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 340,
        title: 'Released to vendor',
        link_type: 'LIST',
        name: 'x_cog_mah_native_heraldry_request',
        filter: 'stageINreleased_to_vendor,in_production,shipped^ORDERBYcompany',
        hint: 'Requests currently with a vendor company (task.company)',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modCatalog = Record({
    $id: Now.ID['mod_catalog'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 350,
        title: 'Heraldic item catalog (cmdb_model)',
        link_type: 'LIST',
        name: 'x_cog_mah_native_catalog_item',
        filter: 'catalog_state=active^ORDERBYname',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla', 'x_cog_mah_native.vendor'],
    },
})

export const modVendors = Record({
    $id: Now.ID['mod_vendors'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 360,
        title: 'Vendors & agencies (core_company)',
        link_type: 'LIST',
        name: 'core_company',
        filter: 'x_cog_mah_native_cage_codeISNOTEMPTY^ORx_cog_mah_native_agency_codeISNOTEMPTY^ORDERBYname',
        hint: 'Native company records carrying the MAH CAGE / agency columns',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.dla'],
    },
})

export const modSes = Record({
    $id: Now.ID['mod_ses'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 370,
        title: 'SES flag requests',
        link_type: 'LIST',
        name: 'x_cog_mah_native_ses_flag_request',
        filter: 'active=true^ORDERBYDESCsys_updated_on',
        roles: ['x_cog_mah_native.tacom_staff', 'x_cog_mah_native.csr', 'x_cog_mah_native.admin', 'x_cog_mah_native.vendor'],
    },
})

export const modSepMigration = Record({
    $id: Now.ID['mod_sep_migration'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 600,
        title: 'Legacy migration (Import Sets)',
        link_type: 'SEPARATOR',
        roles: ['x_cog_mah_native.admin', 'x_cog_mah_native.tacom_staff'],
    },
})

export const modImportSets = Record({
    $id: Now.ID['mod_import_sets'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 610,
        title: 'Import set runs',
        link_type: 'LIST',
        name: 'sys_import_set',
        filter: 'table_nameSTARTSWITHx_cog_mah_native_stg_^ORDERBYDESCsys_created_on',
        hint: 'One row per Import Set API call (tools/migrate.ts or the authorization-intake POST)',
        roles: ['x_cog_mah_native.admin', 'x_cog_mah_native.tacom_staff'],
    },
})

export const modImportErrors = Record({
    $id: Now.ID['mod_import_errors'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 620,
        title: 'Import rows in error / ignored',
        link_type: 'LIST',
        name: 'sys_import_set_row',
        filter: 'sys_class_nameSTARTSWITHx_cog_mah_native_stg_^stateINerror,ignored^ORDERBYDESCsys_created_on',
        hint: 'Native replacement for the v1 migration_exception table: orphan / invalid rows stay in the staging table with a state comment',
        roles: ['x_cog_mah_native.admin', 'x_cog_mah_native.tacom_staff'],
    },
})

export const modImportLog = Record({
    $id: Now.ID['mod_import_log'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 630,
        title: 'Import log',
        link_type: 'LIST',
        name: 'import_log',
        filter: 'sourceSTARTSWITHx_cog_mah_native^ORDERBYDESCsys_created_on',
        roles: ['x_cog_mah_native.admin'],
    },
})

export const modStatusMap = Record({
    $id: Now.ID['mod_status_map'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 640,
        title: 'Status map (legacy → target)',
        link_type: 'LIST',
        name: 'x_cog_mah_native_status_map',
        filter: 'ORDERBYlegacy_form^ORDERBYlegacy_status',
        roles: ['x_cog_mah_native.admin', 'x_cog_mah_native.tacom_staff'],
    },
})

export const modTransformMaps = Record({
    $id: Now.ID['mod_transform_maps'],
    table: 'sys_app_module',
    data: {
        application: mahMenu,
        active: true,
        order: 650,
        title: 'Transform maps',
        link_type: 'LIST',
        name: 'sys_transform_map',
        filter: 'target.nameSTARTSWITHx_cog_mah_native_^ORDERBYname',
        roles: ['x_cog_mah_native.admin'],
    },
})

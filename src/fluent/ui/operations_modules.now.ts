// GENERATED FILE - do not edit by hand.
// Source of truth: tools/lib/operations-catalog.ts (derived from src/server/lib/domain.ts, security.ts, uiLayout.ts).
// Regenerate with `npx tsx tools/generate-fluent-operations.ts`; tests/operations-sync.test.ts fails when stale.
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'
import { mahMenu } from './app_menu.now'
import { opsReport_aging_red_cases, opsReport_aging_amber_cases, opsReport_engraving_queue, opsReport_assembly_qc_queue, opsReport_warehouse_queue, opsReport_vendor_work, opsReport_migration_exceptions_by_type } from '../reports/operations_reports.now'

export const opsModSeparator = Record({
    $id: Now.ID['ops_mod_separator'],
    table: 'sys_app_module',
    data: {
        title: 'MAH Operations',
        application: mahMenu,
        link_type: 'SEPARATOR',
        active: true,
        order: 509,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.vendor', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_ops_dashboard = Record({
    $id: Now.ID['ops_mod_ops_dashboard'],
    table: 'sys_app_module',
    data: {
        title: 'Operations dashboard',
        application: mahMenu,
        link_type: 'DIRECT',
        query: 'now/mah-operations/home',
        hint: 'MAH Operations workspace landing page: stage / aging counters, queues and vendor work',
        active: true,
        order: 510,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_aging_red = Record({
    $id: Now.ID['ops_mod_aging_red'],
    table: 'sys_app_module',
    data: {
        title: 'Aging — red',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_aging_red_cases,
        hint: 'Active awards cases 75+ days in their current stage (aging flag red)',
        active: true,
        order: 520,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_aging_amber = Record({
    $id: Now.ID['ops_mod_aging_amber'],
    table: 'sys_app_module',
    data: {
        title: 'Aging — amber',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_aging_amber_cases,
        hint: 'Active awards cases 60–74 days in their current stage (aging flag amber)',
        active: true,
        order: 530,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_engraving_queue = Record({
    $id: Now.ID['ops_mod_engraving_queue'],
    table: 'sys_app_module',
    data: {
        title: 'Engraving queue',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_engraving_queue,
        hint: 'Open engraving jobs in work order',
        active: true,
        order: 540,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
    },
})

export const opsMod_assembly_qc_queue = Record({
    $id: Now.ID['ops_mod_assembly_qc_queue'],
    table: 'sys_app_module',
    data: {
        title: 'Assembly/QC queue',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_assembly_qc_queue,
        hint: 'Awards cases waiting for assembly and quality control',
        active: true,
        order: 550,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_warehouse_queue = Record({
    $id: Now.ID['ops_mod_warehouse_queue'],
    table: 'sys_app_module',
    data: {
        title: 'Warehouse queue',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_warehouse_queue,
        hint: 'Awards cases ready to pick, pack and ship',
        active: true,
        order: 560,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    },
})

export const opsMod_vendor_work = Record({
    $id: Now.ID['ops_mod_vendor_work'],
    table: 'sys_app_module',
    data: {
        title: 'Vendor work',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_vendor_work,
        hint: 'Heraldry requests released to vendors, in production or shipped',
        active: true,
        order: 570,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    },
})

export const opsMod_migration_exceptions = Record({
    $id: Now.ID['ops_mod_migration_exceptions'],
    table: 'sys_app_module',
    data: {
        title: 'Migration exceptions',
        application: mahMenu,
        link_type: 'REPORT',
        report: opsReport_migration_exceptions_by_type,
        hint: 'Open migration exceptions by type',
        active: true,
        order: 580,
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    },
})

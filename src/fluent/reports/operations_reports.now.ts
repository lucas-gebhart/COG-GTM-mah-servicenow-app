// GENERATED FILE - do not edit by hand.
// Source of truth: tools/lib/operations-catalog.ts (derived from src/server/lib/domain.ts, security.ts, uiLayout.ts).
// Regenerate with `npx tsx tools/generate-fluent-operations.ts`; tests/operations-sync.test.ts fails when stale.
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// Report sources are table-scoped on the platform, so "MAH Operations" is one source per operational table.

export const ops_source_awards_case = Record({
    $id: Now.ID['ops_source_awards_case'],
    table: 'sys_report_source',
    data: {
        name: 'MAH Operations — awards case',
        table: 'x_cog_mah_awards_case',
        filter: 'active=true',
        description: 'MAH Operations reports over x_cog_mah_awards_case (modernization reference application).',
    },
})

export const ops_source_engraving_job = Record({
    $id: Now.ID['ops_source_engraving_job'],
    table: 'sys_report_source',
    data: {
        name: 'MAH Operations — engraving job',
        table: 'x_cog_mah_engraving_job',
        filter: 'active=true',
        description: 'MAH Operations reports over x_cog_mah_engraving_job (modernization reference application).',
    },
})

export const ops_source_heraldry_request = Record({
    $id: Now.ID['ops_source_heraldry_request'],
    table: 'sys_report_source',
    data: {
        name: 'MAH Operations — heraldry request',
        table: 'x_cog_mah_heraldry_request',
        filter: 'active=true',
        description: 'MAH Operations reports over x_cog_mah_heraldry_request (modernization reference application).',
    },
})

export const ops_source_migration_exception = Record({
    $id: Now.ID['ops_source_migration_exception'],
    table: 'sys_report_source',
    data: {
        name: 'MAH Operations — migration exception',
        table: 'x_cog_mah_migration_exception',
        filter: 'active=true',
        description: 'MAH Operations reports over x_cog_mah_migration_exception (modernization reference application).',
    },
})

export const opsReport_cases_by_stage = Record({
    $id: Now.ID['ops_report_cases_by_stage'],
    table: 'sys_report',
    data: {
        title: 'Open awards cases by stage',
        description: 'Count of open awards cases in each fulfilment stage (authorization through warehouse).',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'bar',
        filter: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse',
        aggregate: 'COUNT',
        field: 'stage',
        chart_size: 'large',
        display_grid: true,
        others: 'no',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_aging_distribution = Record({
    $id: Now.ID['ops_report_aging_distribution'],
    table: 'sys_report',
    data: {
        title: 'Open awards cases by aging flag',
        description: 'Green / Amber (60d) / Red (75d) distribution of open awards cases.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'donut',
        filter: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse',
        aggregate: 'COUNT',
        field: 'aging_flag',
        chart_size: 'large',
        display_grid: true,
        others: 'no',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_aging_red_cases = Record({
    $id: Now.ID['ops_report_aging_red_cases'],
    table: 'sys_report',
    data: {
        title: 'Aging — red (75+ days)',
        description: 'Open awards cases past the 75-day red threshold, oldest first.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=red^ORDERBYDESCdays_in_stage',
        field_list: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_aging_amber_cases = Record({
    $id: Now.ID['ops_report_aging_amber_cases'],
    table: 'sys_report',
    data: {
        title: 'Aging — amber (60–74 days)',
        description: 'Open awards cases between the 60-day amber and 75-day red thresholds, oldest first.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=amber^ORDERBYDESCdays_in_stage',
        field_list: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_cases_on_hold = Record({
    $id: Now.ID['ops_report_cases_on_hold'],
    table: 'sys_report',
    data: {
        title: 'Awards cases on hold',
        description: 'Open awards cases with the on-hold flag set (SLA timers paused), oldest first.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^on_hold=true^ORDERBYDESCdays_in_stage',
        field_list: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_engraving_by_status = Record({
    $id: Now.ID['ops_report_engraving_by_status'],
    table: 'sys_report',
    data: {
        title: 'Engraving queue by status',
        description: 'Open engraving jobs grouped by status (queued, in progress, QC hold, rework).',
        table: 'x_cog_mah_engraving_job',
        report_source: ops_source_engraving_job,
        type: 'bar',
        filter: 'active=true^statusINqueued,in_progress,qc_hold,rework',
        aggregate: 'COUNT',
        field: 'status',
        chart_size: 'large',
        display_grid: true,
        others: 'no',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_engraving_queue = Record({
    $id: Now.ID['ops_report_engraving_queue'],
    table: 'sys_report',
    data: {
        title: 'Engraving queue',
        description: 'Open engraving jobs in work order: priority handling first, then queue time.',
        table: 'x_cog_mah_engraving_job',
        report_source: ops_source_engraving_job,
        type: 'list',
        filter: 'active=true^statusINqueued,in_progress,qc_hold,rework^ORDERBYDESCpriority_handling^ORDERBYqueued',
        field_list: 'number,legacy_number,awards_case,award_line,engraver,machine,font,text,status,priority,queued,started,completed,rework_count',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_assembly_qc_queue = Record({
    $id: Now.ID['ops_report_assembly_qc_queue'],
    table: 'sys_report',
    data: {
        title: 'Assembly / QC queue',
        description: 'Awards cases in the assembly / QC stage, priority handling first, then time in stage.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'active=true^stage=assembly_qc^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
        field_list: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_warehouse_queue = Record({
    $id: Now.ID['ops_report_warehouse_queue'],
    table: 'sys_report',
    data: {
        title: 'Warehouse ready-to-ship queue',
        description: 'Awards cases in the warehouse stage that are not on hold, priority handling first.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'active=true^stage=warehouse^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
        field_list: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_vendor_work_by_vendor = Record({
    $id: Now.ID['ops_report_vendor_work_by_vendor'],
    table: 'sys_report',
    data: {
        title: 'Vendor work by vendor and state',
        description: 'Heraldry requests released to vendors, grouped by vendor and stacked by request state.',
        table: 'x_cog_mah_heraldry_request',
        report_source: ops_source_heraldry_request,
        type: 'bar',
        filter: 'active=true^stateINreleased_to_vendor,in_production,shipped',
        aggregate: 'COUNT',
        field: 'vendor',
        additional_groupby: 'state',
        chart_size: 'large',
        display_grid: true,
        others: 'no',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_vendor_work = Record({
    $id: Now.ID['ops_report_vendor_work'],
    table: 'sys_report',
    data: {
        title: 'Vendor work',
        description: 'Heraldry requests released to vendors (released, in production, shipped), by vendor and required delivery date.',
        table: 'x_cog_mah_heraldry_request',
        report_source: ops_source_heraldry_request,
        type: 'list',
        filter: 'active=true^stateINreleased_to_vendor,in_production,shipped^ORDERBYvendor^ORDERBYrequired_delivery_date',
        field_list: 'number,document_number,dodaac,uic,requisition_priority,request_type,requesting_unit,state,vendor,released_to_vendor,required_delivery_date,line_count,total_extended_price',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_unmapped_stage_cases = Record({
    $id: Now.ID['ops_report_unmapped_stage_cases'],
    table: 'sys_report',
    data: {
        title: 'Awards cases with unmapped legacy status',
        description: 'Migrated awards cases whose legacy status did not map to a target stage; the raw legacy status is shown for triage.',
        table: 'x_cog_mah_awards_case',
        report_source: ops_source_awards_case,
        type: 'list',
        filter: 'stage=unmapped^ORDERBYlegacy_form^ORDERBYlegacy_status_raw',
        field_list: 'number,legacy_number,legacy_form,legacy_status_raw,stage,legacy_last_modified,sys_updated_on',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_unmapped_legacy_statuses = Record({
    $id: Now.ID['ops_report_unmapped_legacy_statuses'],
    table: 'sys_report',
    data: {
        title: 'Unmapped legacy statuses',
        description: 'Open migration exceptions raised for legacy status / choice values with no target mapping.',
        table: 'x_cog_mah_migration_exception',
        report_source: ops_source_migration_exception,
        type: 'list',
        filter: 'exception_typeINunmapped_status,unmapped_value^stateINopen,triaged^ORDERBYlegacy_form^ORDERBYlegacy_status_raw',
        field_list: 'number,exception_type,legacy_form,source_table,legacy_status_raw,raw_value,field_name,message,state',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
        is_published: false,
    },
})

export const opsReport_migration_exceptions_by_type = Record({
    $id: Now.ID['ops_report_migration_exceptions_by_type'],
    table: 'sys_report',
    data: {
        title: 'Open migration exceptions by type',
        description: 'Open (not yet resolved or accepted) migration exceptions grouped by exception type.',
        table: 'x_cog_mah_migration_exception',
        report_source: ops_source_migration_exception,
        type: 'horizontal_bar',
        filter: 'stateINopen,triaged',
        aggregate: 'COUNT',
        field: 'exception_type',
        chart_size: 'large',
        display_grid: true,
        others: 'no',
        roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
        is_published: false,
    },
})

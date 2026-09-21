// GENERATED FILE - do not edit by hand.
// Source of truth: tools/lib/operations-catalog.ts (derived from src/server/lib/domain.ts, security.ts, uiLayout.ts).
// Regenerate with `npx tsx tools/generate-fluent-operations.ts`; tests/operations-sync.test.ts fails when stale.
import '@servicenow/sdk/global'
import { Acl, Applicability, Dashboard, UxListMenuConfig, Workspace } from '@servicenow/sdk/core'
import { tacomStaff, csr, engraver, assembler, warehouse, vendor, dla, admin } from '../security/roles.now'

// Workspace list applicabilities mirror the read matrix of each table (src/server/lib/security.ts).

export const opsApplicability_awards_case = Applicability({
    $id: Now.ID['ops_applicability_awards_case'],
    name: 'MAH Operations: x_cog_mah_awards_case readers',
    description: 'Roles that may read x_cog_mah_awards_case; drives which MAH Operations lists a user sees.',
    active: true,
    roles: [tacomStaff, csr, engraver, assembler, warehouse, dla, admin],
})

export const opsApplicability_engraving_job = Applicability({
    $id: Now.ID['ops_applicability_engraving_job'],
    name: 'MAH Operations: x_cog_mah_engraving_job readers',
    description: 'Roles that may read x_cog_mah_engraving_job; drives which MAH Operations lists a user sees.',
    active: true,
    roles: [tacomStaff, csr, engraver, assembler, admin],
})

export const opsApplicability_heraldry_request = Applicability({
    $id: Now.ID['ops_applicability_heraldry_request'],
    name: 'MAH Operations: x_cog_mah_heraldry_request readers',
    description: 'Roles that may read x_cog_mah_heraldry_request; drives which MAH Operations lists a user sees.',
    active: true,
    roles: [tacomStaff, csr, dla, vendor, admin],
})

export const opsApplicability_migration_exception = Applicability({
    $id: Now.ID['ops_applicability_migration_exception'],
    name: 'MAH Operations: x_cog_mah_migration_exception readers',
    description: 'Roles that may read x_cog_mah_migration_exception; drives which MAH Operations lists a user sees.',
    active: true,
    roles: [tacomStaff, admin],
})

export const opsListMenu = UxListMenuConfig({
    $id: Now.ID['ops_list_menu'],
    name: 'MAH Operations lists',
    active: true,
    description: 'Operational queues for the MAH Operations workspace.',
    categories: [
        {
            $id: Now.ID['ops_list_category_awards'],
            title: 'Awards cases',
            active: true,
            order: 100,
            lists: [
                {
                    $id: Now.ID['ops_list_aging_red_cases'],
                    title: 'Aging — red (75+ days)',
                    table: 'x_cog_mah_awards_case',
                    condition: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=red^ORDERBYDESCdays_in_stage',
                    columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                    active: true,
                    order: 100,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_aging_red_cases'], applicability: opsApplicability_awards_case }],
                },
                {
                    $id: Now.ID['ops_list_aging_amber_cases'],
                    title: 'Aging — amber (60–74 days)',
                    table: 'x_cog_mah_awards_case',
                    condition: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=amber^ORDERBYDESCdays_in_stage',
                    columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                    active: true,
                    order: 200,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_aging_amber_cases'], applicability: opsApplicability_awards_case }],
                },
                {
                    $id: Now.ID['ops_list_cases_on_hold'],
                    title: 'Awards cases on hold',
                    table: 'x_cog_mah_awards_case',
                    condition: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^on_hold=true^ORDERBYDESCdays_in_stage',
                    columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                    active: true,
                    order: 300,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_cases_on_hold'], applicability: opsApplicability_awards_case }],
                },
                {
                    $id: Now.ID['ops_list_assembly_qc_queue'],
                    title: 'Assembly / QC queue',
                    table: 'x_cog_mah_awards_case',
                    condition: 'active=true^stage=assembly_qc^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
                    columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                    active: true,
                    order: 400,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_assembly_qc_queue'], applicability: opsApplicability_awards_case }],
                },
                {
                    $id: Now.ID['ops_list_warehouse_queue'],
                    title: 'Warehouse ready-to-ship queue',
                    table: 'x_cog_mah_awards_case',
                    condition: 'active=true^stage=warehouse^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
                    columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                    active: true,
                    order: 500,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_warehouse_queue'], applicability: opsApplicability_awards_case }],
                },
                {
                    $id: Now.ID['ops_list_unmapped_stage_cases'],
                    title: 'Awards cases with unmapped legacy status',
                    table: 'x_cog_mah_awards_case',
                    condition: 'stage=unmapped^ORDERBYlegacy_form^ORDERBYlegacy_status_raw',
                    columns: 'number,legacy_number,legacy_form,legacy_status_raw,stage,legacy_last_modified,sys_updated_on',
                    active: true,
                    order: 600,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_unmapped_stage_cases'], applicability: opsApplicability_awards_case }],
                },
            ],
        },
        {
            $id: Now.ID['ops_list_category_engraving'],
            title: 'Engraving',
            active: true,
            order: 200,
            lists: [
                {
                    $id: Now.ID['ops_list_engraving_queue'],
                    title: 'Engraving queue',
                    table: 'x_cog_mah_engraving_job',
                    condition: 'active=true^statusINqueued,in_progress,qc_hold,rework^ORDERBYDESCpriority_handling^ORDERBYqueued',
                    columns: 'number,legacy_number,awards_case,award_line,engraver,machine,font,text,status,priority,queued,started,completed,rework_count',
                    active: true,
                    order: 100,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_engraving_queue'], applicability: opsApplicability_engraving_job }],
                },
            ],
        },
        {
            $id: Now.ID['ops_list_category_heraldry'],
            title: 'Heraldry',
            active: true,
            order: 300,
            lists: [
                {
                    $id: Now.ID['ops_list_vendor_work'],
                    title: 'Vendor work',
                    table: 'x_cog_mah_heraldry_request',
                    condition: 'active=true^stateINreleased_to_vendor,in_production,shipped^ORDERBYvendor^ORDERBYrequired_delivery_date',
                    columns: 'number,document_number,dodaac,uic,requisition_priority,request_type,requesting_unit,state,vendor,released_to_vendor,required_delivery_date,line_count,total_extended_price',
                    active: true,
                    order: 100,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_vendor_work'], applicability: opsApplicability_heraldry_request }],
                },
            ],
        },
        {
            $id: Now.ID['ops_list_category_migration'],
            title: 'Migration',
            active: true,
            order: 400,
            lists: [
                {
                    $id: Now.ID['ops_list_unmapped_legacy_statuses'],
                    title: 'Unmapped legacy statuses',
                    table: 'x_cog_mah_migration_exception',
                    condition: 'exception_typeINunmapped_status,unmapped_value^stateINopen,triaged^ORDERBYlegacy_form^ORDERBYlegacy_status_raw',
                    columns: 'number,exception_type,legacy_form,source_table,legacy_status_raw,raw_value,field_name,message,state',
                    active: true,
                    order: 100,
                    applicabilities: [{ $id: Now.ID['ops_list_applicability_unmapped_legacy_statuses'], applicability: opsApplicability_migration_exception }],
                },
            ],
        },
    ],
})

export const opsWorkspace = Workspace({
    $id: Now.ID['ops_workspace'],
    title: 'MAH Operations',
    path: 'mah-operations',
    landingPath: 'home',
    active: true,
    listConfig: opsListMenu,
    tables: ['x_cog_mah_awards_case', 'x_cog_mah_award_line', 'x_cog_mah_requester', 'x_cog_mah_authorization_file', 'x_cog_mah_engraving_job', 'x_cog_mah_shipment', 'x_cog_mah_heraldry_request', 'x_cog_mah_request_line', 'x_cog_mah_heraldic_item', 'x_cog_mah_ses_flag_request', 'x_cog_mah_vendor', 'x_cog_mah_case_note', 'x_cog_mah_status_map', 'x_cog_mah_migration_exception'],
})

// Route ACL: who may open /now/mah-operations/home. Record-level ACLs are owned by src/fluent/security/acls.now.ts.
export const opsWorkspaceRouteAcl = Acl({
    $id: Now.ID['ops_workspace_route_acl'],
    localOrExisting: 'Existing',
    type: 'ux_route',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    name: 'now.mah-operations.*',
})

export const opsDashboard = Dashboard({
    $id: Now.ID['ops_dashboard'],
    name: 'MAH Operations',
    active: true,
    description: 'Stage / aging counters, fulfilment queues, vendor work and migration exceptions for the MAH Operations workspace.',
    tabs: [
        {
            $id: Now.ID['ops_dashboard_tab_operations'],
            name: 'Operations',
            active: true,
            widgets: [
                {
                    $id: Now.ID['ops_widget_count_open_cases'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Open awards cases',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse',
                                label: 'Open awards cases',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_red'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Red (75+ days)',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=red',
                                label: 'Red (75+ days)',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 6, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_amber'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Amber (60+ days)',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=amber',
                                label: 'Amber (60+ days)',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 12, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_on_hold'],
                    component: 'single-score',
                    componentProps: {
                        label: 'On hold',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^on_hold=true',
                                label: 'On hold',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 18, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_engraving'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Engraving jobs open',
                        dataSources: [
                            {
                                table: 'x_cog_mah_engraving_job',
                                filterQuery: 'active=true^statusINqueued,in_progress,qc_hold,rework',
                                label: 'Engraving jobs open',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 24, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_vendor'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Requests at vendors',
                        dataSources: [
                            {
                                table: 'x_cog_mah_heraldry_request',
                                filterQuery: 'active=true^stateINreleased_to_vendor,in_production,shipped',
                                label: 'Requests at vendors',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 30, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_exceptions'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Open migration exceptions',
                        dataSources: [
                            {
                                table: 'x_cog_mah_migration_exception',
                                filterQuery: 'stateINopen,triaged',
                                label: 'Open migration exceptions',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 36, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_count_unmapped'],
                    component: 'single-score',
                    componentProps: {
                        label: 'Unmapped legacy statuses',
                        dataSources: [
                            {
                                table: 'x_cog_mah_migration_exception',
                                filterQuery: 'exception_typeINunmapped_status,unmapped_value^stateINopen,triaged',
                                label: 'Unmapped legacy statuses',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                    },
                    width: 6,
                    height: 7,
                    position: { x: 42, y: 0 },
                },
                {
                    $id: Now.ID['ops_widget_chart_cases_by_stage'],
                    component: 'vertical-bar',
                    componentProps: {
                        label: 'Open awards cases by stage',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse',
                                label: 'Open awards cases by stage',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                        groupBy: [{ field: 'stage' }],
                    },
                    width: 16,
                    height: 14,
                    position: { x: 0, y: 7 },
                },
                {
                    $id: Now.ID['ops_widget_chart_aging_distribution'],
                    component: 'donut',
                    componentProps: {
                        label: 'Open awards cases by aging flag',
                        dataSources: [
                            {
                                table: 'x_cog_mah_awards_case',
                                filterQuery: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse',
                                label: 'Open awards cases by aging flag',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                        groupBy: [{ field: 'aging_flag' }],
                    },
                    width: 16,
                    height: 14,
                    position: { x: 16, y: 7 },
                },
                {
                    $id: Now.ID['ops_widget_chart_engraving_by_status'],
                    component: 'vertical-bar',
                    componentProps: {
                        label: 'Engraving queue by status',
                        dataSources: [
                            {
                                table: 'x_cog_mah_engraving_job',
                                filterQuery: 'active=true^statusINqueued,in_progress,qc_hold,rework',
                                label: 'Engraving queue by status',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                        groupBy: [{ field: 'status' }],
                    },
                    width: 16,
                    height: 14,
                    position: { x: 32, y: 7 },
                },
                {
                    $id: Now.ID['ops_widget_chart_aging_red_cases'],
                    component: 'list-simple',
                    componentProps: {
                        label: 'Aging — red (75+ days)',
                        table: 'x_cog_mah_awards_case',
                        query: 'active=true^stageINauthorized,engraving,assembly_qc,warehouse^aging_flag=red^ORDERBYDESCdays_in_stage',
                        columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                        limit: 15,
                    },
                    width: 24,
                    height: 14,
                    position: { x: 0, y: 21 },
                },
                {
                    $id: Now.ID['ops_widget_chart_assembly_qc_queue'],
                    component: 'list-simple',
                    componentProps: {
                        label: 'Assembly / QC queue',
                        table: 'x_cog_mah_awards_case',
                        query: 'active=true^stage=assembly_qc^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
                        columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                        limit: 15,
                    },
                    width: 24,
                    height: 14,
                    position: { x: 24, y: 21 },
                },
                {
                    $id: Now.ID['ops_widget_chart_warehouse_queue'],
                    component: 'list-simple',
                    componentProps: {
                        label: 'Warehouse ready-to-ship queue',
                        table: 'x_cog_mah_awards_case',
                        query: 'active=true^stage=warehouse^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at',
                        columns: 'number,legacy_number,veteran_last_name,requester,stage,aging_flag,days_in_stage,priority,source_agency,authorization_date,assigned_to,line_count,total_quantity,sys_updated_on',
                        limit: 15,
                    },
                    width: 24,
                    height: 14,
                    position: { x: 0, y: 35 },
                },
                {
                    $id: Now.ID['ops_widget_chart_vendor_work'],
                    component: 'list-simple',
                    componentProps: {
                        label: 'Vendor work',
                        table: 'x_cog_mah_heraldry_request',
                        query: 'active=true^stateINreleased_to_vendor,in_production,shipped^ORDERBYvendor^ORDERBYrequired_delivery_date',
                        columns: 'number,document_number,dodaac,uic,requisition_priority,request_type,requesting_unit,state,vendor,released_to_vendor,required_delivery_date,line_count,total_extended_price',
                        limit: 15,
                    },
                    width: 24,
                    height: 14,
                    position: { x: 24, y: 35 },
                },
                {
                    $id: Now.ID['ops_widget_chart_vendor_work_by_vendor'],
                    component: 'vertical-bar',
                    componentProps: {
                        label: 'Vendor work by vendor and state',
                        dataSources: [
                            {
                                table: 'x_cog_mah_heraldry_request',
                                filterQuery: 'active=true^stateINreleased_to_vendor,in_production,shipped',
                                label: 'Vendor work by vendor and state',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                        groupBy: [{ field: 'vendor' }],
                    },
                    width: 16,
                    height: 14,
                    position: { x: 0, y: 49 },
                },
                {
                    $id: Now.ID['ops_widget_chart_migration_exceptions_by_type'],
                    component: 'horizontal-bar',
                    componentProps: {
                        label: 'Open migration exceptions by type',
                        dataSources: [
                            {
                                table: 'x_cog_mah_migration_exception',
                                filterQuery: 'stateINopen,triaged',
                                label: 'Open migration exceptions by type',
                            },
                        ],
                        metrics: [{ aggregate: 'COUNT' }],
                        groupBy: [{ field: 'exception_type' }],
                    },
                    width: 16,
                    height: 14,
                    position: { x: 16, y: 49 },
                },
                {
                    $id: Now.ID['ops_widget_chart_unmapped_legacy_statuses'],
                    component: 'list-simple',
                    componentProps: {
                        label: 'Unmapped legacy statuses',
                        table: 'x_cog_mah_migration_exception',
                        query: 'exception_typeINunmapped_status,unmapped_value^stateINopen,triaged^ORDERBYlegacy_form^ORDERBYlegacy_status_raw',
                        columns: 'number,exception_type,legacy_form,source_table,legacy_status_raw,raw_value,field_name,message,state',
                        limit: 15,
                    },
                    width: 16,
                    height: 14,
                    position: { x: 32, y: 49 },
                },
            ],
        },
    ],
    visibilities: [{ $id: Now.ID['ops_dashboard_visibility'], experience: opsWorkspace }],
})

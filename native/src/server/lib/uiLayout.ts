/**
 * Source of truth for the operator UI layouts: list columns, form sections and related lists
 * for every x_cog_mah_native table. `tools/generate-fluent-ui.ts` renders this into Fluent `List`,
 * `Form` and sys_ui_related_list records, and validates every field name against the table
 * definitions so a renamed column fails the build instead of silently producing a blank cell.
 *
 * Task-derived tables lead with the standard task section (number, state, priority, assignment,
 * short description) and finish with the native activity stream (`work_notes` / `comments`);
 * their forms also carry the platform related lists (Task SLAs, Approvals, Attachments).
 */
import type { DomainTableKey } from './domain.ts'

export interface FormSection {
    caption: string
    /** Either a one-column list of fields, or a two-column split. */
    left: readonly string[]
    right?: readonly string[]
}

export interface RelatedList {
    /** `child_table.reference_field` — the child table key and the field that points to the parent. */
    child: DomainTableKey
    field: string
    orderBy?: string
}

export interface TableLayout {
    list: readonly string[]
    /** Numeric list columns that should show a sum footer. */
    listSums?: readonly string[]
    sections: readonly FormSection[]
    relatedLists: readonly RelatedList[]
    /** Platform related lists (`table.field`) shown on the form — Task SLAs, approvals, import set rows … */
    nativeRelatedLists?: readonly string[]
    /** Legacy Domino view(s) this list replaces — surfaced in documentation. */
    legacyViews: readonly string[]
}

const LEGACY: FormSection = {
    caption: 'Legacy record (HAAS)',
    left: ['legacy_unid', 'legacy_form'],
    right: ['legacy_status_raw', 'legacy_last_modified'],
}

/** Native activity stream: work notes (internal) and additional comments (customer / vendor visible). */
const ACTIVITY: FormSection = { caption: 'Notes', left: ['work_notes', 'comments'] }

/** Platform related lists every task-derived form carries. */
export const TASK_RELATED_LISTS: readonly string[] = ['task_sla.task', 'sysapproval_approver.sysapproval']

export const UI_LAYOUT: Readonly<Record<DomainTableKey, TableLayout>> = {
    awards_case: {
        list: ['number', 'legacy_number', 'veteran_last_name', 'requester', 'stage', 'state', 'priority', 'source_agency', 'authorization_date', 'opened_at', 'assigned_to', 'line_count', 'total_quantity', 'sys_updated_on'],
        listSums: ['line_count', 'total_quantity'],
        sections: [
            {
                caption: 'Awards case',
                left: ['number', 'legacy_number', 'requester', 'requester_relationship', 'source_agency', 'authorization_file_task', 'authorization_file_line', 'source_record_id', 'authorization_date'],
                right: ['stage', 'state', 'stage_entered_at', 'priority', 'handling_priority', 'priority_handling', 'assigned_to', 'assignment_group', 'opened_at', 'active'],
            },
            {
                caption: 'Veteran / service member',
                left: ['veteran_last_name', 'veteran_first_name', 'veteran_middle_initial', 'veteran_rank', 'service_number_last4'],
                right: ['service_component', 'service_era', 'service_from', 'service_to', 'veteran_deceased'],
            },
            {
                caption: 'Handling',
                left: ['on_hold', 'hold_reason', 'engraving_required'],
                right: ['qc_result', 'pick_bin', 'short_description'],
            },
            {
                caption: 'Ship to',
                left: ['ship_to_name', 'ship_to_address_1', 'ship_to_address_2', 'ship_to_city'],
                right: ['ship_to_state', 'ship_to_zip', 'ship_to_country'],
            },
            {
                caption: 'Fulfilment summary',
                left: ['line_count', 'total_quantity'],
                right: ['closed_at', 'cancel_reason'],
            },
            ACTIVITY,
            LEGACY,
        ],
        relatedLists: [
            { child: 'award_line', field: 'awards_case', orderBy: 'line_number' },
            { child: 'engraving_job', field: 'parent', orderBy: 'sys_created_on' },
            { child: 'shipment', field: 'parent', orderBy: 'shipped' },
        ],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['Cases\\By Stage', 'Cases\\Aging', 'Cases\\By Requester', 'Cases\\All'],
    },
    award_line: {
        list: ['number', 'awards_case', 'line_number', 'award_name', 'award_model', 'device', 'device_count', 'quantity', 'engraving_required', 'engraving_text', 'status', 'stock_on_hand'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'Award line',
                left: ['number', 'awards_case', 'line_number', 'award_name', 'award_model', 'device', 'device_count', 'set_type'],
                right: ['quantity', 'status', 'stock_on_hand', 'stock_number', 'backorder_eta', 'engraving_required', 'engraving_text', 'active'],
            },
            { caption: 'Authorization', left: ['authority', 'legacy_award_name'], right: ['legacy_award_code'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'engraving_job', field: 'award_line' }],
        legacyViews: ['Lines\\By Case', 'Lines\\Engraving Queue'],
    },
    requester: {
        list: ['number', 'legacy_number', 'name', 'type', 'service_number_last4', 'city', 'address_state', 'zip', 'case_count', 'merged_into', 'sys_updated_on'],
        sections: [
            {
                caption: 'Requester',
                left: ['number', 'legacy_number', 'type', 'first_name', 'middle_initial', 'last_name', 'suffix', 'name'],
                right: ['relationship', 'veteran_name', 'service_number_last4', 'dob', 'email', 'phone', 'preferred_contact', 'active'],
            },
            {
                caption: 'Unit (for unit requesters)',
                left: ['unit_name', 'rank', 'role_title'],
                right: ['dodaac', 'uic'],
            },
            {
                caption: 'Mailing address',
                left: ['address_1', 'address_2', 'city'],
                right: ['address_state', 'zip', 'country'],
            },
            {
                caption: 'Deduplication',
                left: ['dedupe_key', 'duplicate_count', 'case_count'],
                right: ['merged_into', 'merge_target'],
            },
            LEGACY,
        ],
        relatedLists: [
            { child: 'awards_case', field: 'requester', orderBy: 'authorization_date' },
            { child: 'heraldry_request', field: 'requester', orderBy: 'opened_at' },
        ],
        legacyViews: ['Requesters\\By Name', 'Requesters\\Duplicates'],
    },
    authorization_file: {
        list: ['number', 'file_name', 'source_agency', 'format', 'opened_at', 'record_count', 'accepted_count', 'rejected_count', 'duplicate_count', 'stage', 'state', 'import_set'],
        listSums: ['record_count', 'accepted_count', 'rejected_count', 'duplicate_count'],
        sections: [
            {
                caption: 'Authorization file',
                left: ['number', 'file_name', 'legacy_number', 'source_agency', 'format', 'layout', 'opened_at', 'intake_channel', 'import_set'],
                right: ['stage', 'state', 'record_count', 'accepted_count', 'rejected_count', 'duplicate_count', 'submitted_by', 'checksum_match', 'active'],
            },
            {
                caption: 'Batch results',
                left: ['transmission_date', 'authorization_date', 'imported_at'],
                right: ['cases_created', 'lines_created', 'requesters_created', 'requesters_matched'],
            },
            { caption: 'Parse log', left: ['short_description', 'source_hash', 'parse_log'] },
            ACTIVITY,
            LEGACY,
        ],
        relatedLists: [{ child: 'awards_case', field: 'authorization_file_task', orderBy: 'number' }],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['Intake\\Authorization Files'],
    },
    engraving_job: {
        list: ['number', 'legacy_number', 'parent', 'award_line', 'assigned_to', 'machine', 'font', 'text', 'stage', 'state', 'priority', 'queued', 'started', 'completed', 'rework_count'],
        sections: [
            {
                caption: 'Engraving job',
                left: ['number', 'legacy_number', 'parent', 'award_line', 'assigned_to', 'assignment_group', 'machine', 'priority', 'handling_priority', 'priority_handling'],
                right: ['stage', 'state', 'font', 'opened_at', 'queued', 'started', 'completed', 'rework_count', 'proof_checked', 'active'],
            },
            { caption: 'Engraving', left: ['short_description', 'text', 'items'] },
            ACTIVITY,
            LEGACY,
        ],
        relatedLists: [],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['Engraving\\Queue', 'Engraving\\By Engraver'],
    },
    shipment: {
        list: ['number', 'legacy_number', 'parent', 'carrier', 'service_level', 'tracking_number', 'pieces', 'partial', 'picked', 'shipped', 'delivered', 'stage', 'state'],
        sections: [
            {
                caption: 'Shipment',
                left: ['number', 'legacy_number', 'parent', 'carrier', 'service_level', 'tracking_number', 'partial', 'assigned_to', 'assignment_group'],
                right: ['stage', 'state', 'pieces', 'weight_oz', 'opened_at', 'picked', 'shipped', 'delivered', 'shipped_by', 'active'],
            },
            { caption: 'Ship to and contents', left: ['short_description', 'ship_to', 'contents', 'exception_note'] },
            ACTIVITY,
            LEGACY,
        ],
        relatedLists: [],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['Warehouse\\Shipments'],
    },
    heraldry_request: {
        list: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'request_type', 'requesting_unit', 'stage', 'state', 'approval', 'company', 'released_to_vendor', 'required_delivery_date', 'line_count', 'total_extended_price'],
        listSums: ['line_count', 'total_extended_price'],
        sections: [
            {
                caption: 'DD Form 1348-6 header',
                left: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'project_code', 'fund_code', 'signal_code', 'supplementary_address'],
                right: ['stage', 'state', 'approval', 'request_type', 'priority', 'handling_priority', 'priority_handling', 'required_delivery_date', 'requesting_unit', 'requester', 'requester_poc', 'requester_poc_email', 'requester_poc_phone', 'opened_at', 'active'],
            },
            { caption: 'Ship to and justification', left: ['short_description', 'ship_to_dodaac', 'ship_to', 'justification'] },
            {
                caption: 'Review and vendor release',
                left: ['submitted_at', 'submitted_by', 'reviewer', 'approved_at', 'company', 'legacy_vendor_key'],
                right: ['released_to_vendor', 'released_by', 'vendor_acknowledged', 'estimated_ship_date', 'vendor_ship_date', 'vendor_tracking_number'],
            },
            {
                caption: 'Totals',
                left: ['line_count', 'total_extended_price'],
                right: ['cancel_reason'],
            },
            { caption: 'Notes', left: ['work_notes', 'comments', 'vendor_notes'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'request_line', field: 'heraldry_request', orderBy: 'line_number' }],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['Requests\\By State', 'Requests\\By Vendor', 'Requests\\Released', 'Requests\\All'],
    },
    request_line: {
        list: ['number', 'heraldry_request', 'line_number', 'model', 'nsn_or_exception', 'nomenclature', 'unit_of_issue', 'quantity', 'unit_price', 'extended_price', 'status'],
        listSums: ['quantity', 'extended_price'],
        sections: [
            {
                caption: 'Request line',
                left: ['number', 'heraldry_request', 'line_number', 'line_document_number', 'model', 'nsn_or_exception', 'nomenclature', 'exception_data'],
                right: ['status', 'unit_of_issue', 'quantity', 'unit_price', 'extended_price', 'vendor_quantity_shipped', 'vendor_ship_date', 'active'],
            },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Lines\\By Request'],
    },
    catalog_item: {
        list: ['model_number', 'name', 'catalog_kind', 'heraldic_category', 'unit_of_issue', 'cost', 'lead_time_days', 'manufacturer', 'exception_item', 'catalog_state'],
        sections: [
            {
                caption: 'Catalog model (cmdb_model)',
                left: ['model_number', 'name', 'catalog_kind', 'fsc', 'niin', 'exception_item', 'heraldic_category', 'branch', 'drawing_number'],
                right: ['catalog_state', 'unit_of_issue', 'cost', 'lead_time_days', 'max_qty_per_request', 'manufacturer', 'approved_vendors', 'reference'],
            },
            { caption: 'Description', left: ['description'] },
            LEGACY,
        ],
        relatedLists: [
            { child: 'request_line', field: 'model' },
            { child: 'award_line', field: 'award_model' },
        ],
        legacyViews: ['Catalog\\Heraldic Items', 'Catalog\\By Category'],
    },
    ses_flag_request: {
        list: ['number', 'legacy_number', 'requesting_office', 'executive_name', 'position_title', 'executive_tier', 'flag_type', 'quantity', 'stage', 'state', 'approval', 'company', 'approved_at', 'delivered_at'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'SES flag request',
                left: ['number', 'legacy_number', 'requesting_office', 'dodaac', 'uic', 'executive_name', 'position_title', 'executive_tier', 'appointment_date'],
                right: ['stage', 'state', 'approval', 'flag_type', 'legacy_flag_type', 'quantity', 'poc_email', 'poc_phone', 'opened_at', 'active'],
            },
            { caption: 'Justification and delivery', left: ['short_description', 'justification', 'ship_to'] },
            {
                caption: 'Decision and fulfilment',
                left: ['approved_by', 'approved_at', 'rejection_reason'],
                right: ['company', 'released_to_vendor', 'delivered_at'],
            },
            ACTIVITY,
            LEGACY,
        ],
        relatedLists: [],
        nativeRelatedLists: TASK_RELATED_LISTS,
        legacyViews: ['SES\\Pending', 'SES\\All'],
    },
    status_map: {
        list: ['number', 'legacy_form', 'legacy_status', 'target_field', 'target_value', 'match_count', 'seeded', 'active'],
        listSums: ['match_count'],
        sections: [
            {
                caption: 'Status mapping',
                left: ['number', 'legacy_form', 'legacy_status', 'seeded'],
                right: ['target_field', 'target_value', 'match_count', 'active'],
            },
            { caption: 'Notes', left: ['notes'] },
        ],
        relatedLists: [],
        legacyViews: [],
    },
}

/** Fields every list/form may reference that are platform columns, not part of the Fluent schema. */
export const PLATFORM_FIELDS: readonly string[] = ['sys_created_on', 'sys_updated_on', 'sys_created_by', 'sys_updated_by']

/** Columns inherited from `task` that layouts on task-derived tables may reference. */
export const TASK_FIELDS: readonly string[] = [
    'number', 'state', 'active', 'priority', 'short_description', 'description', 'assigned_to', 'assignment_group',
    'opened_at', 'opened_by', 'closed_at', 'closed_by', 'due_date', 'work_notes', 'comments', 'company', 'parent',
    'approval', 'approval_set', 'location', 'contact_type', 'sla_due', 'made_sla', 'escalation', 'urgency', 'impact',
]

/** Columns inherited from `cmdb_model` that the catalog layout may reference. */
export const MODEL_FIELDS: readonly string[] = ['name', 'display_name', 'model_number', 'cost', 'cost_currency', 'manufacturer', 'description', 'status', 'short_description', 'owner', 'type']

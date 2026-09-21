/**
 * Source of truth for the operator UI layouts: list columns, form sections and related lists
 * for every x_cog_mah table. `tools/generate-fluent-ui.ts` renders this into Fluent `List`,
 * `Form` and sys_ui_related_list records, and validates every field name against the table
 * definitions so a renamed column fails the build instead of silently producing a blank cell.
 *
 * Layouts mirror the Domino views / XPages the application replaces (see docs/EQUIVALENCE-MATRIX.md).
 */
import type { DomainTableKey } from './domain'

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
    /** Legacy Domino view(s) this list replaces — surfaced in documentation. */
    legacyViews: readonly string[]
}

const LEGACY: FormSection = {
    caption: 'Legacy record (HAAS)',
    left: ['legacy_unid', 'legacy_form'],
    right: ['legacy_status_raw', 'legacy_last_modified'],
}

export const UI_LAYOUT: Readonly<Record<DomainTableKey, TableLayout>> = {
    awards_case: {
        list: ['number', 'legacy_number', 'veteran_last_name', 'requester', 'stage', 'aging_flag', 'days_in_stage', 'priority', 'source_agency', 'authorization_date', 'assigned_to', 'line_count', 'total_quantity', 'sys_updated_on'],
        listSums: ['line_count', 'total_quantity'],
        sections: [
            {
                caption: 'Awards case',
                left: ['number', 'legacy_number', 'requester', 'requester_relationship', 'source_agency', 'authorization_file', 'authorization_file_line', 'source_record_id', 'authorization_date'],
                right: ['stage', 'aging_flag', 'days_in_stage', 'stage_entered_at', 'priority', 'priority_handling', 'assigned_to', 'assignment_group', 'active'],
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
            { caption: 'Notes', left: ['notes', 'work_notes'] },
            LEGACY,
        ],
        relatedLists: [
            { child: 'award_line', field: 'awards_case', orderBy: 'line_number' },
            { child: 'engraving_job', field: 'awards_case', orderBy: 'sys_created_on' },
            { child: 'shipment', field: 'awards_case', orderBy: 'shipped' },
            { child: 'case_note', field: 'awards_case', orderBy: 'noted_at' },
        ],
        legacyViews: ['Cases\\By Stage', 'Cases\\Aging', 'Cases\\By Requester', 'Cases\\All'],
    },
    award_line: {
        list: ['number', 'awards_case', 'line_number', 'award_name', 'device', 'device_count', 'quantity', 'engraving_required', 'engraving_text', 'status', 'stock_on_hand'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'Award line',
                left: ['number', 'awards_case', 'line_number', 'award_name', 'device', 'device_count', 'set_type'],
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
        relatedLists: [{ child: 'awards_case', field: 'requester', orderBy: 'authorization_date' }],
        legacyViews: ['Requesters\\By Name', 'Requesters\\Duplicates'],
    },
    authorization_file: {
        list: ['number', 'file_name', 'source_agency', 'format', 'received', 'record_count', 'accepted_count', 'rejected_count', 'duplicate_count', 'parse_status'],
        listSums: ['record_count', 'accepted_count', 'rejected_count', 'duplicate_count'],
        sections: [
            {
                caption: 'Authorization file',
                left: ['number', 'file_name', 'legacy_number', 'source_agency', 'format', 'layout', 'received', 'intake_channel'],
                right: ['parse_status', 'record_count', 'accepted_count', 'rejected_count', 'duplicate_count', 'submitted_by', 'checksum_match'],
            },
            {
                caption: 'Batch results',
                left: ['transmission_date', 'authorization_date', 'imported_at'],
                right: ['cases_created', 'lines_created', 'requesters_created', 'requesters_matched'],
            },
            { caption: 'Parse log', left: ['source_hash', 'parse_log'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'awards_case', field: 'authorization_file', orderBy: 'number' }],
        legacyViews: ['Intake\\Authorization Files'],
    },
    engraving_job: {
        list: ['number', 'legacy_number', 'awards_case', 'award_line', 'engraver', 'machine', 'font', 'text', 'status', 'priority', 'queued', 'started', 'completed', 'rework_count'],
        sections: [
            {
                caption: 'Engraving job',
                left: ['number', 'legacy_number', 'awards_case', 'award_line', 'engraver', 'machine', 'priority', 'priority_handling'],
                right: ['status', 'font', 'queued', 'started', 'completed', 'rework_count', 'proof_checked'],
            },
            { caption: 'Engraving', left: ['text', 'items', 'qc_notes'] },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Engraving\\Queue', 'Engraving\\By Engraver'],
    },
    shipment: {
        list: ['number', 'legacy_number', 'awards_case', 'carrier', 'service_level', 'tracking_number', 'pieces', 'partial', 'picked', 'shipped', 'delivered', 'status'],
        sections: [
            {
                caption: 'Shipment',
                left: ['number', 'legacy_number', 'awards_case', 'carrier', 'service_level', 'tracking_number', 'partial'],
                right: ['status', 'pieces', 'weight_oz', 'picked', 'shipped', 'delivered', 'shipped_by'],
            },
            { caption: 'Ship to and contents', left: ['ship_to', 'contents', 'exception_note'] },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Warehouse\\Shipments'],
    },
    heraldry_request: {
        list: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'request_type', 'requesting_unit', 'state', 'vendor', 'released_to_vendor', 'required_delivery_date', 'line_count', 'total_extended_price'],
        listSums: ['line_count', 'total_extended_price'],
        sections: [
            {
                caption: 'DD Form 1348-6 header',
                left: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'project_code', 'fund_code', 'signal_code', 'supplementary_address'],
                right: ['state', 'request_type', 'priority_handling', 'required_delivery_date', 'requesting_unit', 'requester', 'requester_poc', 'requester_poc_email', 'requester_poc_phone', 'active'],
            },
            { caption: 'Ship to and justification', left: ['ship_to_dodaac', 'ship_to', 'justification'] },
            {
                caption: 'Review and vendor release',
                left: ['submitted_at', 'submitted_by', 'reviewer', 'approved_at', 'vendor', 'legacy_vendor_key'],
                right: ['released_to_vendor', 'released_by', 'vendor_acknowledged', 'estimated_ship_date', 'vendor_ship_date', 'vendor_tracking_number'],
            },
            {
                caption: 'Totals',
                left: ['line_count', 'total_extended_price'],
                right: ['cancel_reason'],
            },
            { caption: 'Notes', left: ['work_notes', 'vendor_notes'] },
            LEGACY,
        ],
        relatedLists: [
            { child: 'request_line', field: 'heraldry_request', orderBy: 'line_number' },
            { child: 'case_note', field: 'heraldry_request', orderBy: 'noted_at' },
        ],
        legacyViews: ['Requests\\By State', 'Requests\\By Vendor', 'Requests\\Released', 'Requests\\All'],
    },
    request_line: {
        list: ['number', 'heraldry_request', 'line_number', 'heraldic_item', 'nsn_or_exception', 'nomenclature', 'unit_of_issue', 'quantity', 'unit_price', 'extended_price', 'status'],
        listSums: ['quantity', 'extended_price'],
        sections: [
            {
                caption: 'Request line',
                left: ['number', 'heraldry_request', 'line_number', 'line_document_number', 'heraldic_item', 'nsn_or_exception', 'nomenclature', 'exception_data'],
                right: ['status', 'unit_of_issue', 'quantity', 'unit_price', 'extended_price', 'vendor_quantity_shipped', 'vendor_ship_date'],
            },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Lines\\By Request'],
    },
    heraldic_item: {
        list: ['number', 'stock_number', 'nomenclature', 'category', 'unit_of_issue', 'unit_price', 'lead_time_days', 'preferred_vendor', 'exception_item', 'active'],
        sections: [
            {
                caption: 'Heraldic item',
                left: ['number', 'stock_number', 'fsc', 'niin', 'exception_item', 'nomenclature', 'category', 'branch', 'drawing_number'],
                right: ['unit_of_issue', 'unit_price', 'lead_time_days', 'max_qty_per_request', 'preferred_vendor', 'approved_vendors', 'reference', 'active'],
            },
            { caption: 'Description', left: ['description'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'request_line', field: 'heraldic_item' }],
        legacyViews: ['Catalog\\Heraldic Items', 'Catalog\\By Category'],
    },
    ses_flag_request: {
        list: ['number', 'legacy_number', 'requesting_office', 'executive_name', 'position_title', 'executive_tier', 'flag_type', 'quantity', 'state', 'vendor', 'approved_at', 'delivered_at'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'SES flag request',
                left: ['number', 'legacy_number', 'requesting_office', 'dodaac', 'uic', 'executive_name', 'position_title', 'executive_tier', 'appointment_date'],
                right: ['state', 'flag_type', 'legacy_flag_type', 'quantity', 'poc_email', 'poc_phone', 'active'],
            },
            { caption: 'Justification and delivery', left: ['justification', 'ship_to'] },
            {
                caption: 'Decision and fulfilment',
                left: ['approved_by', 'approved_at', 'rejection_reason'],
                right: ['vendor', 'released_to_vendor', 'delivered_at'],
            },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['SES\\Pending', 'SES\\All'],
    },
    vendor: {
        list: ['number', 'name', 'cage_code', 'uei', 'contract_number', 'poc', 'email', 'lead_time_days', 'portal_user', 'user_group', 'active'],
        sections: [
            {
                caption: 'Vendor',
                left: ['number', 'name', 'cage_code', 'uei', 'contract_number', 'capabilities', 'lead_time_days'],
                right: ['poc', 'email', 'phone', 'active', 'state'],
            },
            {
                caption: 'Portal access (replaces Readers fields)',
                left: ['portal_user', 'legacy_vendor_users'],
                right: ['user_group', 'legacy_user_group'],
            },
            { caption: 'Address', left: ['address'] },
            LEGACY,
        ],
        relatedLists: [
            { child: 'heraldry_request', field: 'vendor', orderBy: 'released_to_vendor' },
            { child: 'heraldic_item', field: 'preferred_vendor' },
        ],
        legacyViews: ['Vendors\\Active'],
    },
    case_note: {
        list: ['number', 'awards_case', 'heraldry_request', 'note_type', 'summary', 'noted_at', 'author', 'legacy_author', 'customer_visible', 'follow_up_date', 'follow_up_done'],
        sections: [
            {
                caption: 'Case note',
                left: ['number', 'awards_case', 'heraldry_request', 'note_type', 'legacy_note_type', 'summary'],
                right: ['noted_at', 'author', 'legacy_author', 'customer_visible', 'contact_name', 'contact_phone'],
            },
            { caption: 'Note', left: ['body'] },
            { caption: 'Follow-up', left: ['follow_up_date'], right: ['follow_up_done'] },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Notes\\By Case'],
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
    migration_exception: {
        list: ['number', 'exception_type', 'legacy_form', 'source_table', 'source_row', 'legacy_unid', 'parent_unid', 'field_name', 'message', 'state', 'batch_id'],
        sections: [
            {
                caption: 'Migration exception',
                left: ['number', 'exception_type', 'state', 'batch_id', 'import_set', 'source_table', 'source_row'],
                right: ['legacy_form', 'legacy_unid', 'parent_unid', 'target_table', 'target_sys_id', 'field_name'],
            },
            { caption: 'Detail', left: ['message', 'raw_value'] },
            { caption: 'Resolution', left: ['resolution'], right: ['resolved_by', 'resolved_at'] },
        ],
        relatedLists: [],
        legacyViews: [],
    },
}

/** Fields every list/form may reference that are platform columns, not part of the Fluent schema. */
export const PLATFORM_FIELDS: readonly string[] = ['sys_created_on', 'sys_updated_on', 'sys_created_by', 'sys_updated_by']

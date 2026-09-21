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
        list: ['number', 'requester', 'stage', 'aging_flag', 'days_in_stage', 'source_agency', 'authorization_date', 'assigned_to', 'line_count', 'total_quantity', 'sys_updated_on'],
        listSums: ['line_count', 'total_quantity'],
        sections: [
            {
                caption: 'Awards case',
                left: ['number', 'requester', 'source_agency', 'authorization_file', 'source_record_id', 'authorization_date', 'priority_handling'],
                right: ['stage', 'aging_flag', 'days_in_stage', 'stage_entered_at', 'assigned_to', 'assignment_group', 'active'],
            },
            { caption: 'Description', left: ['short_description'] },
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
        list: ['number', 'awards_case', 'line_number', 'award_name', 'device', 'device_count', 'quantity', 'engraving_required', 'engraving_text', 'status'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'Award line',
                left: ['number', 'awards_case', 'line_number', 'award_name', 'device', 'device_count'],
                right: ['quantity', 'status', 'stock_on_hand', 'engraving_required', 'engraving_text', 'active'],
            },
            LEGACY,
        ],
        relatedLists: [{ child: 'engraving_job', field: 'award_line' }],
        legacyViews: ['Lines\\By Case', 'Lines\\Engraving Queue'],
    },
    requester: {
        list: ['number', 'name', 'type', 'service_number_last4', 'city', 'address_state', 'zip', 'case_count', 'merged_into', 'sys_updated_on'],
        sections: [
            {
                caption: 'Requester',
                left: ['number', 'type', 'first_name', 'middle_initial', 'last_name', 'suffix', 'name'],
                right: ['relationship', 'unit_name', 'service_number_last4', 'dob', 'email', 'phone', 'active'],
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
                left: ['number', 'file_name', 'source_agency', 'format', 'received', 'intake_channel'],
                right: ['parse_status', 'record_count', 'accepted_count', 'rejected_count', 'duplicate_count', 'submitted_by'],
            },
            { caption: 'Parse log', left: ['source_hash', 'parse_log'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'awards_case', field: 'authorization_file', orderBy: 'number' }],
        legacyViews: ['Intake\\Authorization Files'],
    },
    engraving_job: {
        list: ['number', 'awards_case', 'award_line', 'engraver', 'font', 'text', 'status', 'priority_handling', 'started', 'completed', 'rework_count'],
        sections: [
            {
                caption: 'Engraving job',
                left: ['number', 'awards_case', 'award_line', 'engraver', 'priority_handling'],
                right: ['status', 'font', 'started', 'completed', 'rework_count'],
            },
            { caption: 'Engraving', left: ['text', 'qc_notes'] },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Engraving\\Queue', 'Engraving\\By Engraver'],
    },
    shipment: {
        list: ['number', 'awards_case', 'carrier', 'service_level', 'tracking_number', 'pieces', 'shipped', 'delivered', 'status'],
        sections: [
            {
                caption: 'Shipment',
                left: ['number', 'awards_case', 'carrier', 'service_level', 'tracking_number'],
                right: ['status', 'pieces', 'weight_oz', 'shipped', 'delivered', 'shipped_by'],
            },
            { caption: 'Ship to', left: ['ship_to'] },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['Warehouse\\Shipments'],
    },
    heraldry_request: {
        list: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'requesting_unit', 'state', 'vendor', 'released_to_vendor', 'required_delivery_date', 'line_count', 'total_extended_price'],
        listSums: ['line_count', 'total_extended_price'],
        sections: [
            {
                caption: 'DD Form 1348-6 header',
                left: ['number', 'document_number', 'dodaac', 'uic', 'requisition_priority', 'project_code', 'fund_code', 'signal_code'],
                right: ['state', 'required_delivery_date', 'requesting_unit', 'requester_poc', 'requester_poc_email', 'requester_poc_phone', 'active'],
            },
            { caption: 'Ship to and justification', left: ['ship_to', 'justification'] },
            {
                caption: 'Review and vendor release',
                left: ['submitted_at', 'submitted_by', 'reviewer', 'vendor'],
                right: ['released_to_vendor', 'released_by', 'vendor_acknowledged', 'vendor_ship_date', 'vendor_tracking_number'],
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
                left: ['number', 'heraldry_request', 'line_number', 'heraldic_item', 'nsn_or_exception', 'nomenclature'],
                right: ['status', 'unit_of_issue', 'quantity', 'unit_price', 'extended_price', 'vendor_quantity_shipped'],
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
                left: ['number', 'stock_number', 'exception_item', 'nomenclature', 'category', 'drawing_number'],
                right: ['unit_of_issue', 'unit_price', 'lead_time_days', 'preferred_vendor', 'active'],
            },
            { caption: 'Description', left: ['description'] },
            LEGACY,
        ],
        relatedLists: [{ child: 'request_line', field: 'heraldic_item' }],
        legacyViews: ['Catalog\\Heraldic Items', 'Catalog\\By Category'],
    },
    ses_flag_request: {
        list: ['number', 'requesting_office', 'executive_name', 'position_title', 'flag_type', 'quantity', 'state', 'appointment_date', 'approved_by', 'approved_at'],
        listSums: ['quantity'],
        sections: [
            {
                caption: 'SES flag request',
                left: ['number', 'requesting_office', 'executive_name', 'position_title', 'appointment_date'],
                right: ['state', 'flag_type', 'quantity', 'poc_email', 'poc_phone', 'active'],
            },
            { caption: 'Justification and delivery', left: ['justification', 'ship_to'] },
            {
                caption: 'Decision',
                left: ['approved_by', 'approved_at'],
                right: ['rejection_reason', 'delivered_at'],
            },
            LEGACY,
        ],
        relatedLists: [],
        legacyViews: ['SES\\Pending', 'SES\\All'],
    },
    vendor: {
        list: ['number', 'name', 'cage_code', 'uei', 'contract_number', 'poc', 'email', 'portal_user', 'user_group', 'active'],
        sections: [
            {
                caption: 'Vendor',
                left: ['number', 'name', 'cage_code', 'uei', 'contract_number', 'capabilities'],
                right: ['poc', 'email', 'phone', 'active', 'state'],
            },
            { caption: 'Portal access (replaces Readers fields)', left: ['portal_user'], right: ['user_group'] },
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
        list: ['number', 'awards_case', 'heraldry_request', 'note_type', 'noted_at', 'author', 'customer_visible', 'body'],
        sections: [
            {
                caption: 'Case note',
                left: ['number', 'awards_case', 'heraldry_request', 'note_type'],
                right: ['noted_at', 'author', 'legacy_author', 'customer_visible'],
            },
            { caption: 'Note', left: ['body'] },
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

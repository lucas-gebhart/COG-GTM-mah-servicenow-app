// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (form sections). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { Form, default_view } from '@servicenow/sdk/core'

export const form_awards_case = Form({
    table: 'x_cog_mah_native_awards_case',
    view: default_view,
    sections: [
        {
            caption: 'Awards case',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'requester' },
                        { type: 'table_field', field: 'requester_relationship' },
                        { type: 'table_field', field: 'source_agency' },
                        { type: 'table_field', field: 'authorization_file_task' },
                        { type: 'table_field', field: 'authorization_file_line' },
                        { type: 'table_field', field: 'source_record_id' },
                        { type: 'table_field', field: 'authorization_date' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'stage_entered_at' },
                        { type: 'table_field', field: 'priority' },
                        { type: 'table_field', field: 'handling_priority' },
                        { type: 'table_field', field: 'priority_handling' },
                        { type: 'table_field', field: 'assigned_to' },
                        { type: 'table_field', field: 'assignment_group' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Veteran / service member',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'veteran_last_name' },
                        { type: 'table_field', field: 'veteran_first_name' },
                        { type: 'table_field', field: 'veteran_middle_initial' },
                        { type: 'table_field', field: 'veteran_rank' },
                        { type: 'table_field', field: 'service_number_last4' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'service_component' },
                        { type: 'table_field', field: 'service_era' },
                        { type: 'table_field', field: 'service_from' },
                        { type: 'table_field', field: 'service_to' },
                        { type: 'table_field', field: 'veteran_deceased' },
                    ],
                },
            ],
        },
        {
            caption: 'Handling',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'on_hold' },
                        { type: 'table_field', field: 'hold_reason' },
                        { type: 'table_field', field: 'engraving_required' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'qc_result' },
                        { type: 'table_field', field: 'pick_bin' },
                        { type: 'table_field', field: 'short_description' },
                    ],
                },
            ],
        },
        {
            caption: 'Ship to',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'ship_to_name' },
                        { type: 'table_field', field: 'ship_to_address_1' },
                        { type: 'table_field', field: 'ship_to_address_2' },
                        { type: 'table_field', field: 'ship_to_city' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'ship_to_state' },
                        { type: 'table_field', field: 'ship_to_zip' },
                        { type: 'table_field', field: 'ship_to_country' },
                    ],
                },
            ],
        },
        {
            caption: 'Fulfilment summary',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'line_count' },
                        { type: 'table_field', field: 'total_quantity' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'closed_at' },
                        { type: 'table_field', field: 'cancel_reason' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_award_line = Form({
    table: 'x_cog_mah_native_award_line',
    view: default_view,
    sections: [
        {
            caption: 'Award line',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'awards_case' },
                        { type: 'table_field', field: 'line_number' },
                        { type: 'table_field', field: 'award_name' },
                        { type: 'table_field', field: 'award_model' },
                        { type: 'table_field', field: 'device' },
                        { type: 'table_field', field: 'device_count' },
                        { type: 'table_field', field: 'set_type' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'stock_on_hand' },
                        { type: 'table_field', field: 'stock_number' },
                        { type: 'table_field', field: 'backorder_eta' },
                        { type: 'table_field', field: 'engraving_required' },
                        { type: 'table_field', field: 'engraving_text' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Authorization',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'authority' },
                        { type: 'table_field', field: 'legacy_award_name' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_award_code' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_requester = Form({
    table: 'x_cog_mah_native_requester',
    view: default_view,
    sections: [
        {
            caption: 'Requester',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'type' },
                        { type: 'table_field', field: 'first_name' },
                        { type: 'table_field', field: 'middle_initial' },
                        { type: 'table_field', field: 'last_name' },
                        { type: 'table_field', field: 'suffix' },
                        { type: 'table_field', field: 'name' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'relationship' },
                        { type: 'table_field', field: 'veteran_name' },
                        { type: 'table_field', field: 'service_number_last4' },
                        { type: 'table_field', field: 'dob' },
                        { type: 'table_field', field: 'email' },
                        { type: 'table_field', field: 'phone' },
                        { type: 'table_field', field: 'preferred_contact' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Unit (for unit requesters)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'unit_name' },
                        { type: 'table_field', field: 'rank' },
                        { type: 'table_field', field: 'role_title' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'dodaac' },
                        { type: 'table_field', field: 'uic' },
                    ],
                },
            ],
        },
        {
            caption: 'Mailing address',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'address_1' },
                        { type: 'table_field', field: 'address_2' },
                        { type: 'table_field', field: 'city' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'address_state' },
                        { type: 'table_field', field: 'zip' },
                        { type: 'table_field', field: 'country' },
                    ],
                },
            ],
        },
        {
            caption: 'Deduplication',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'dedupe_key' },
                        { type: 'table_field', field: 'duplicate_count' },
                        { type: 'table_field', field: 'case_count' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'merged_into' },
                        { type: 'table_field', field: 'merge_target' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_authorization_file = Form({
    table: 'x_cog_mah_native_authorization_file',
    view: default_view,
    sections: [
        {
            caption: 'Authorization file',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'file_name' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'source_agency' },
                        { type: 'table_field', field: 'format' },
                        { type: 'table_field', field: 'layout' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'intake_channel' },
                        { type: 'table_field', field: 'import_set' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'record_count' },
                        { type: 'table_field', field: 'accepted_count' },
                        { type: 'table_field', field: 'rejected_count' },
                        { type: 'table_field', field: 'duplicate_count' },
                        { type: 'table_field', field: 'submitted_by' },
                        { type: 'table_field', field: 'checksum_match' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Batch results',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'transmission_date' },
                        { type: 'table_field', field: 'authorization_date' },
                        { type: 'table_field', field: 'imported_at' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'cases_created' },
                        { type: 'table_field', field: 'lines_created' },
                        { type: 'table_field', field: 'requesters_created' },
                        { type: 'table_field', field: 'requesters_matched' },
                    ],
                },
            ],
        },
        {
            caption: 'Parse log',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'source_hash' },
                        { type: 'table_field', field: 'parse_log' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_engraving_job = Form({
    table: 'x_cog_mah_native_engraving_job',
    view: default_view,
    sections: [
        {
            caption: 'Engraving job',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'parent' },
                        { type: 'table_field', field: 'award_line' },
                        { type: 'table_field', field: 'assigned_to' },
                        { type: 'table_field', field: 'assignment_group' },
                        { type: 'table_field', field: 'machine' },
                        { type: 'table_field', field: 'priority' },
                        { type: 'table_field', field: 'handling_priority' },
                        { type: 'table_field', field: 'priority_handling' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'font' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'queued' },
                        { type: 'table_field', field: 'started' },
                        { type: 'table_field', field: 'completed' },
                        { type: 'table_field', field: 'rework_count' },
                        { type: 'table_field', field: 'proof_checked' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Engraving',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'text' },
                        { type: 'table_field', field: 'items' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_shipment = Form({
    table: 'x_cog_mah_native_shipment',
    view: default_view,
    sections: [
        {
            caption: 'Shipment',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'parent' },
                        { type: 'table_field', field: 'carrier' },
                        { type: 'table_field', field: 'service_level' },
                        { type: 'table_field', field: 'tracking_number' },
                        { type: 'table_field', field: 'partial' },
                        { type: 'table_field', field: 'assigned_to' },
                        { type: 'table_field', field: 'assignment_group' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'pieces' },
                        { type: 'table_field', field: 'weight_oz' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'picked' },
                        { type: 'table_field', field: 'shipped' },
                        { type: 'table_field', field: 'delivered' },
                        { type: 'table_field', field: 'shipped_by' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Ship to and contents',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'ship_to' },
                        { type: 'table_field', field: 'contents' },
                        { type: 'table_field', field: 'exception_note' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_heraldry_request = Form({
    table: 'x_cog_mah_native_heraldry_request',
    view: default_view,
    sections: [
        {
            caption: 'DD Form 1348-6 header',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'document_number' },
                        { type: 'table_field', field: 'dodaac' },
                        { type: 'table_field', field: 'uic' },
                        { type: 'table_field', field: 'requisition_priority' },
                        { type: 'table_field', field: 'project_code' },
                        { type: 'table_field', field: 'fund_code' },
                        { type: 'table_field', field: 'signal_code' },
                        { type: 'table_field', field: 'supplementary_address' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'approval' },
                        { type: 'table_field', field: 'request_type' },
                        { type: 'table_field', field: 'priority' },
                        { type: 'table_field', field: 'handling_priority' },
                        { type: 'table_field', field: 'priority_handling' },
                        { type: 'table_field', field: 'required_delivery_date' },
                        { type: 'table_field', field: 'requesting_unit' },
                        { type: 'table_field', field: 'requester' },
                        { type: 'table_field', field: 'requester_poc' },
                        { type: 'table_field', field: 'requester_poc_email' },
                        { type: 'table_field', field: 'requester_poc_phone' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Ship to and justification',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'ship_to_dodaac' },
                        { type: 'table_field', field: 'ship_to' },
                        { type: 'table_field', field: 'justification' },
                    ],
                },
            ],
        },
        {
            caption: 'Review and vendor release',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'submitted_at' },
                        { type: 'table_field', field: 'submitted_by' },
                        { type: 'table_field', field: 'reviewer' },
                        { type: 'table_field', field: 'approved_at' },
                        { type: 'table_field', field: 'company' },
                        { type: 'table_field', field: 'legacy_vendor_key' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'released_to_vendor' },
                        { type: 'table_field', field: 'released_by' },
                        { type: 'table_field', field: 'vendor_acknowledged' },
                        { type: 'table_field', field: 'estimated_ship_date' },
                        { type: 'table_field', field: 'vendor_ship_date' },
                        { type: 'table_field', field: 'vendor_tracking_number' },
                    ],
                },
            ],
        },
        {
            caption: 'Totals',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'line_count' },
                        { type: 'table_field', field: 'total_extended_price' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'cancel_reason' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                        { type: 'table_field', field: 'vendor_notes' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_request_line = Form({
    table: 'x_cog_mah_native_request_line',
    view: default_view,
    sections: [
        {
            caption: 'Request line',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'heraldry_request' },
                        { type: 'table_field', field: 'line_number' },
                        { type: 'table_field', field: 'line_document_number' },
                        { type: 'table_field', field: 'model' },
                        { type: 'table_field', field: 'nsn_or_exception' },
                        { type: 'table_field', field: 'nomenclature' },
                        { type: 'table_field', field: 'exception_data' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'unit_of_issue' },
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'unit_price' },
                        { type: 'table_field', field: 'extended_price' },
                        { type: 'table_field', field: 'vendor_quantity_shipped' },
                        { type: 'table_field', field: 'vendor_ship_date' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_catalog_item = Form({
    table: 'x_cog_mah_native_catalog_item',
    view: default_view,
    sections: [
        {
            caption: 'Catalog model (cmdb_model)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'model_number' },
                        { type: 'table_field', field: 'name' },
                        { type: 'table_field', field: 'catalog_kind' },
                        { type: 'table_field', field: 'fsc' },
                        { type: 'table_field', field: 'niin' },
                        { type: 'table_field', field: 'exception_item' },
                        { type: 'table_field', field: 'heraldic_category' },
                        { type: 'table_field', field: 'branch' },
                        { type: 'table_field', field: 'drawing_number' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'catalog_state' },
                        { type: 'table_field', field: 'unit_of_issue' },
                        { type: 'table_field', field: 'cost' },
                        { type: 'table_field', field: 'lead_time_days' },
                        { type: 'table_field', field: 'max_qty_per_request' },
                        { type: 'table_field', field: 'manufacturer' },
                        { type: 'table_field', field: 'approved_vendors' },
                        { type: 'table_field', field: 'reference' },
                    ],
                },
            ],
        },
        {
            caption: 'Description',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'description' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_ses_flag_request = Form({
    table: 'x_cog_mah_native_ses_flag_request',
    view: default_view,
    sections: [
        {
            caption: 'SES flag request',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_number' },
                        { type: 'table_field', field: 'requesting_office' },
                        { type: 'table_field', field: 'dodaac' },
                        { type: 'table_field', field: 'uic' },
                        { type: 'table_field', field: 'executive_name' },
                        { type: 'table_field', field: 'position_title' },
                        { type: 'table_field', field: 'executive_tier' },
                        { type: 'table_field', field: 'appointment_date' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'approval' },
                        { type: 'table_field', field: 'flag_type' },
                        { type: 'table_field', field: 'legacy_flag_type' },
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'poc_email' },
                        { type: 'table_field', field: 'poc_phone' },
                        { type: 'table_field', field: 'opened_at' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Justification and delivery',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'justification' },
                        { type: 'table_field', field: 'ship_to' },
                    ],
                },
            ],
        },
        {
            caption: 'Decision and fulfilment',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'approved_by' },
                        { type: 'table_field', field: 'approved_at' },
                        { type: 'table_field', field: 'rejection_reason' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'company' },
                        { type: 'table_field', field: 'released_to_vendor' },
                        { type: 'table_field', field: 'delivered_at' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'table_field', field: 'comments' },
                    ],
                },
            ],
        },
        {
            caption: 'Legacy record (HAAS)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'legacy_form' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_status_raw' },
                        { type: 'table_field', field: 'legacy_last_modified' },
                    ],
                },
            ],
        },
    ],
})

export const form_status_map = Form({
    table: 'x_cog_mah_native_status_map',
    view: default_view,
    sections: [
        {
            caption: 'Status mapping',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'legacy_form' },
                        { type: 'table_field', field: 'legacy_status' },
                        { type: 'table_field', field: 'seeded' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'target_field' },
                        { type: 'table_field', field: 'target_value' },
                        { type: 'table_field', field: 'match_count' },
                        { type: 'table_field', field: 'active' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'notes' },
                    ],
                },
            ],
        },
    ],
})

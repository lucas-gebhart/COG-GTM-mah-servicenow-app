// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (form sections). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { Form, default_view } from '@servicenow/sdk/core'

export const form_awards_case = Form({
    table: 'x_cog_mah_awards_case',
    view: default_view,
    sections: [
        {
            caption: 'Awards case',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'requester' },
                        { type: 'table_field', field: 'source_agency' },
                        { type: 'table_field', field: 'authorization_file' },
                        { type: 'table_field', field: 'source_record_id' },
                        { type: 'table_field', field: 'authorization_date' },
                        { type: 'table_field', field: 'priority_handling' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'stage' },
                        { type: 'table_field', field: 'aging_flag' },
                        { type: 'table_field', field: 'days_in_stage' },
                        { type: 'table_field', field: 'stage_entered_at' },
                        { type: 'table_field', field: 'assigned_to' },
                        { type: 'table_field', field: 'assignment_group' },
                        { type: 'table_field', field: 'active' },
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
                        { type: 'table_field', field: 'notes' },
                        { type: 'table_field', field: 'work_notes' },
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
    table: 'x_cog_mah_award_line',
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
                        { type: 'table_field', field: 'device' },
                        { type: 'table_field', field: 'device_count' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'stock_on_hand' },
                        { type: 'table_field', field: 'engraving_required' },
                        { type: 'table_field', field: 'engraving_text' },
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

export const form_requester = Form({
    table: 'x_cog_mah_requester',
    view: default_view,
    sections: [
        {
            caption: 'Requester',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'type' },
                        { type: 'table_field', field: 'first_name' },
                        { type: 'table_field', field: 'middle_initial' },
                        { type: 'table_field', field: 'last_name' },
                        { type: 'table_field', field: 'suffix' },
                        { type: 'table_field', field: 'name' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'relationship' },
                        { type: 'table_field', field: 'unit_name' },
                        { type: 'table_field', field: 'service_number_last4' },
                        { type: 'table_field', field: 'dob' },
                        { type: 'table_field', field: 'email' },
                        { type: 'table_field', field: 'phone' },
                        { type: 'table_field', field: 'active' },
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
    table: 'x_cog_mah_authorization_file',
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
                        { type: 'table_field', field: 'source_agency' },
                        { type: 'table_field', field: 'format' },
                        { type: 'table_field', field: 'received' },
                        { type: 'table_field', field: 'intake_channel' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'parse_status' },
                        { type: 'table_field', field: 'record_count' },
                        { type: 'table_field', field: 'accepted_count' },
                        { type: 'table_field', field: 'rejected_count' },
                        { type: 'table_field', field: 'duplicate_count' },
                        { type: 'table_field', field: 'submitted_by' },
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
                        { type: 'table_field', field: 'source_hash' },
                        { type: 'table_field', field: 'parse_log' },
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
    table: 'x_cog_mah_engraving_job',
    view: default_view,
    sections: [
        {
            caption: 'Engraving job',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'awards_case' },
                        { type: 'table_field', field: 'award_line' },
                        { type: 'table_field', field: 'engraver' },
                        { type: 'table_field', field: 'priority_handling' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'font' },
                        { type: 'table_field', field: 'started' },
                        { type: 'table_field', field: 'completed' },
                        { type: 'table_field', field: 'rework_count' },
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
                        { type: 'table_field', field: 'text' },
                        { type: 'table_field', field: 'qc_notes' },
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
    table: 'x_cog_mah_shipment',
    view: default_view,
    sections: [
        {
            caption: 'Shipment',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'awards_case' },
                        { type: 'table_field', field: 'carrier' },
                        { type: 'table_field', field: 'service_level' },
                        { type: 'table_field', field: 'tracking_number' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'pieces' },
                        { type: 'table_field', field: 'weight_oz' },
                        { type: 'table_field', field: 'shipped' },
                        { type: 'table_field', field: 'delivered' },
                        { type: 'table_field', field: 'shipped_by' },
                    ],
                },
            ],
        },
        {
            caption: 'Ship to',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'ship_to' },
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
    table: 'x_cog_mah_heraldry_request',
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
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'required_delivery_date' },
                        { type: 'table_field', field: 'requesting_unit' },
                        { type: 'table_field', field: 'requester_poc' },
                        { type: 'table_field', field: 'requester_poc_email' },
                        { type: 'table_field', field: 'requester_poc_phone' },
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
                        { type: 'table_field', field: 'vendor' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'released_to_vendor' },
                        { type: 'table_field', field: 'released_by' },
                        { type: 'table_field', field: 'vendor_acknowledged' },
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
    table: 'x_cog_mah_request_line',
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
                        { type: 'table_field', field: 'heraldic_item' },
                        { type: 'table_field', field: 'nsn_or_exception' },
                        { type: 'table_field', field: 'nomenclature' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'unit_of_issue' },
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'unit_price' },
                        { type: 'table_field', field: 'extended_price' },
                        { type: 'table_field', field: 'vendor_quantity_shipped' },
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

export const form_heraldic_item = Form({
    table: 'x_cog_mah_heraldic_item',
    view: default_view,
    sections: [
        {
            caption: 'Heraldic item',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'stock_number' },
                        { type: 'table_field', field: 'exception_item' },
                        { type: 'table_field', field: 'nomenclature' },
                        { type: 'table_field', field: 'category' },
                        { type: 'table_field', field: 'drawing_number' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'unit_of_issue' },
                        { type: 'table_field', field: 'unit_price' },
                        { type: 'table_field', field: 'lead_time_days' },
                        { type: 'table_field', field: 'preferred_vendor' },
                        { type: 'table_field', field: 'active' },
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
    table: 'x_cog_mah_ses_flag_request',
    view: default_view,
    sections: [
        {
            caption: 'SES flag request',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'requesting_office' },
                        { type: 'table_field', field: 'executive_name' },
                        { type: 'table_field', field: 'position_title' },
                        { type: 'table_field', field: 'appointment_date' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'flag_type' },
                        { type: 'table_field', field: 'quantity' },
                        { type: 'table_field', field: 'poc_email' },
                        { type: 'table_field', field: 'poc_phone' },
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
                        { type: 'table_field', field: 'justification' },
                        { type: 'table_field', field: 'ship_to' },
                    ],
                },
            ],
        },
        {
            caption: 'Decision',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'approved_by' },
                        { type: 'table_field', field: 'approved_at' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'rejection_reason' },
                        { type: 'table_field', field: 'delivered_at' },
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

export const form_vendor = Form({
    table: 'x_cog_mah_vendor',
    view: default_view,
    sections: [
        {
            caption: 'Vendor',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'name' },
                        { type: 'table_field', field: 'cage_code' },
                        { type: 'table_field', field: 'uei' },
                        { type: 'table_field', field: 'contract_number' },
                        { type: 'table_field', field: 'capabilities' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'poc' },
                        { type: 'table_field', field: 'email' },
                        { type: 'table_field', field: 'phone' },
                        { type: 'table_field', field: 'active' },
                        { type: 'table_field', field: 'state' },
                    ],
                },
            ],
        },
        {
            caption: 'Portal access (replaces Readers fields)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'portal_user' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'user_group' },
                    ],
                },
            ],
        },
        {
            caption: 'Address',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'address' },
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

export const form_case_note = Form({
    table: 'x_cog_mah_case_note',
    view: default_view,
    sections: [
        {
            caption: 'Case note',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'awards_case' },
                        { type: 'table_field', field: 'heraldry_request' },
                        { type: 'table_field', field: 'note_type' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'noted_at' },
                        { type: 'table_field', field: 'author' },
                        { type: 'table_field', field: 'legacy_author' },
                        { type: 'table_field', field: 'customer_visible' },
                    ],
                },
            ],
        },
        {
            caption: 'Note',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'body' },
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
    table: 'x_cog_mah_status_map',
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

export const form_migration_exception = Form({
    table: 'x_cog_mah_migration_exception',
    view: default_view,
    sections: [
        {
            caption: 'Migration exception',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'exception_type' },
                        { type: 'table_field', field: 'state' },
                        { type: 'table_field', field: 'batch_id' },
                        { type: 'table_field', field: 'import_set' },
                        { type: 'table_field', field: 'source_table' },
                        { type: 'table_field', field: 'source_row' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'legacy_form' },
                        { type: 'table_field', field: 'legacy_unid' },
                        { type: 'table_field', field: 'parent_unid' },
                        { type: 'table_field', field: 'target_table' },
                        { type: 'table_field', field: 'target_sys_id' },
                        { type: 'table_field', field: 'field_name' },
                    ],
                },
            ],
        },
        {
            caption: 'Detail',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'message' },
                        { type: 'table_field', field: 'raw_value' },
                    ],
                },
            ],
        },
        {
            caption: 'Resolution',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'resolution' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'resolved_by' },
                        { type: 'table_field', field: 'resolved_at' },
                    ],
                },
            ],
        },
    ],
})

// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (list columns). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { List, default_view } from '@servicenow/sdk/core'

// x_cog_mah_awards_case — replaces legacy view(s): Cases\By Stage, Cases\Aging, Cases\By Requester, Cases\All
List({
    table: 'x_cog_mah_awards_case',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'veteran_last_name' },
        { element: 'requester' },
        { element: 'stage' },
        { element: 'aging_flag' },
        { element: 'days_in_stage' },
        { element: 'priority' },
        { element: 'source_agency' },
        { element: 'authorization_date' },
        { element: 'assigned_to' },
        { element: 'line_count', sum: true },
        { element: 'total_quantity', sum: true },
        { element: 'sys_updated_on' },
    ],
})

// x_cog_mah_award_line — replaces legacy view(s): Lines\By Case, Lines\Engraving Queue
List({
    table: 'x_cog_mah_award_line',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'awards_case' },
        { element: 'line_number' },
        { element: 'award_name' },
        { element: 'device' },
        { element: 'device_count' },
        { element: 'quantity', sum: true },
        { element: 'engraving_required' },
        { element: 'engraving_text' },
        { element: 'status' },
        { element: 'stock_on_hand' },
    ],
})

// x_cog_mah_requester — replaces legacy view(s): Requesters\By Name, Requesters\Duplicates
List({
    table: 'x_cog_mah_requester',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'name' },
        { element: 'type' },
        { element: 'service_number_last4' },
        { element: 'city' },
        { element: 'address_state' },
        { element: 'zip' },
        { element: 'case_count' },
        { element: 'merged_into' },
        { element: 'sys_updated_on' },
    ],
})

// x_cog_mah_authorization_file — replaces legacy view(s): Intake\Authorization Files
List({
    table: 'x_cog_mah_authorization_file',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'file_name' },
        { element: 'source_agency' },
        { element: 'format' },
        { element: 'received' },
        { element: 'record_count', sum: true },
        { element: 'accepted_count', sum: true },
        { element: 'rejected_count', sum: true },
        { element: 'duplicate_count', sum: true },
        { element: 'parse_status' },
    ],
})

// x_cog_mah_engraving_job — replaces legacy view(s): Engraving\Queue, Engraving\By Engraver
List({
    table: 'x_cog_mah_engraving_job',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'awards_case' },
        { element: 'award_line' },
        { element: 'engraver' },
        { element: 'machine' },
        { element: 'font' },
        { element: 'text' },
        { element: 'status' },
        { element: 'priority' },
        { element: 'queued' },
        { element: 'started' },
        { element: 'completed' },
        { element: 'rework_count' },
    ],
})

// x_cog_mah_shipment — replaces legacy view(s): Warehouse\Shipments
List({
    table: 'x_cog_mah_shipment',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'awards_case' },
        { element: 'carrier' },
        { element: 'service_level' },
        { element: 'tracking_number' },
        { element: 'pieces' },
        { element: 'partial' },
        { element: 'picked' },
        { element: 'shipped' },
        { element: 'delivered' },
        { element: 'status' },
    ],
})

// x_cog_mah_heraldry_request — replaces legacy view(s): Requests\By State, Requests\By Vendor, Requests\Released, Requests\All
List({
    table: 'x_cog_mah_heraldry_request',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'document_number' },
        { element: 'dodaac' },
        { element: 'uic' },
        { element: 'requisition_priority' },
        { element: 'request_type' },
        { element: 'requesting_unit' },
        { element: 'state' },
        { element: 'vendor' },
        { element: 'released_to_vendor' },
        { element: 'required_delivery_date' },
        { element: 'line_count', sum: true },
        { element: 'total_extended_price', sum: true },
    ],
})

// x_cog_mah_request_line — replaces legacy view(s): Lines\By Request
List({
    table: 'x_cog_mah_request_line',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'heraldry_request' },
        { element: 'line_number' },
        { element: 'heraldic_item' },
        { element: 'nsn_or_exception' },
        { element: 'nomenclature' },
        { element: 'unit_of_issue' },
        { element: 'quantity', sum: true },
        { element: 'unit_price' },
        { element: 'extended_price', sum: true },
        { element: 'status' },
    ],
})

// x_cog_mah_heraldic_item — replaces legacy view(s): Catalog\Heraldic Items, Catalog\By Category
List({
    table: 'x_cog_mah_heraldic_item',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'stock_number' },
        { element: 'nomenclature' },
        { element: 'category' },
        { element: 'unit_of_issue' },
        { element: 'unit_price' },
        { element: 'lead_time_days' },
        { element: 'preferred_vendor' },
        { element: 'exception_item' },
        { element: 'active' },
    ],
})

// x_cog_mah_ses_flag_request — replaces legacy view(s): SES\Pending, SES\All
List({
    table: 'x_cog_mah_ses_flag_request',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'requesting_office' },
        { element: 'executive_name' },
        { element: 'position_title' },
        { element: 'executive_tier' },
        { element: 'flag_type' },
        { element: 'quantity', sum: true },
        { element: 'state' },
        { element: 'vendor' },
        { element: 'approved_at' },
        { element: 'delivered_at' },
    ],
})

// x_cog_mah_vendor — replaces legacy view(s): Vendors\Active
List({
    table: 'x_cog_mah_vendor',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'name' },
        { element: 'cage_code' },
        { element: 'uei' },
        { element: 'contract_number' },
        { element: 'poc' },
        { element: 'email' },
        { element: 'lead_time_days' },
        { element: 'portal_user' },
        { element: 'user_group' },
        { element: 'active' },
    ],
})

// x_cog_mah_case_note — replaces legacy view(s): Notes\By Case
List({
    table: 'x_cog_mah_case_note',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'awards_case' },
        { element: 'heraldry_request' },
        { element: 'note_type' },
        { element: 'summary' },
        { element: 'noted_at' },
        { element: 'author' },
        { element: 'legacy_author' },
        { element: 'customer_visible' },
        { element: 'follow_up_date' },
        { element: 'follow_up_done' },
    ],
})

// x_cog_mah_status_map — replaces legacy view(s): n/a (new in target)
List({
    table: 'x_cog_mah_status_map',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_form' },
        { element: 'legacy_status' },
        { element: 'target_field' },
        { element: 'target_value' },
        { element: 'match_count', sum: true },
        { element: 'seeded' },
        { element: 'active' },
    ],
})

// x_cog_mah_migration_exception — replaces legacy view(s): n/a (new in target)
List({
    table: 'x_cog_mah_migration_exception',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'exception_type' },
        { element: 'legacy_form' },
        { element: 'source_table' },
        { element: 'source_row' },
        { element: 'legacy_unid' },
        { element: 'parent_unid' },
        { element: 'field_name' },
        { element: 'message' },
        { element: 'state' },
        { element: 'batch_id' },
    ],
})

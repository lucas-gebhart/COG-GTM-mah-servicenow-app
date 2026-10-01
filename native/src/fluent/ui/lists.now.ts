// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (list columns). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { List, default_view } from '@servicenow/sdk/core'

// x_cog_mah_native_awards_case — replaces legacy view(s): Cases\By Stage, Cases\Aging, Cases\By Requester, Cases\All
List({
    table: 'x_cog_mah_native_awards_case',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'veteran_last_name' },
        { element: 'requester' },
        { element: 'stage' },
        { element: 'state' },
        { element: 'priority' },
        { element: 'source_agency' },
        { element: 'authorization_date' },
        { element: 'opened_at' },
        { element: 'assigned_to' },
        { element: 'line_count', sum: true },
        { element: 'total_quantity', sum: true },
        { element: 'sys_updated_on' },
    ],
})

// x_cog_mah_native_award_line — replaces legacy view(s): Lines\By Case, Lines\Engraving Queue
List({
    table: 'x_cog_mah_native_award_line',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'awards_case' },
        { element: 'line_number' },
        { element: 'award_name' },
        { element: 'award_model' },
        { element: 'device' },
        { element: 'device_count' },
        { element: 'quantity', sum: true },
        { element: 'engraving_required' },
        { element: 'engraving_text' },
        { element: 'status' },
        { element: 'stock_on_hand' },
    ],
})

// x_cog_mah_native_requester — replaces legacy view(s): Requesters\By Name, Requesters\Duplicates
List({
    table: 'x_cog_mah_native_requester',
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

// x_cog_mah_native_authorization_file — replaces legacy view(s): Intake\Authorization Files
List({
    table: 'x_cog_mah_native_authorization_file',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'file_name' },
        { element: 'source_agency' },
        { element: 'format' },
        { element: 'opened_at' },
        { element: 'record_count', sum: true },
        { element: 'accepted_count', sum: true },
        { element: 'rejected_count', sum: true },
        { element: 'duplicate_count', sum: true },
        { element: 'stage' },
        { element: 'state' },
        { element: 'import_set' },
    ],
})

// x_cog_mah_native_engraving_job — replaces legacy view(s): Engraving\Queue, Engraving\By Engraver
List({
    table: 'x_cog_mah_native_engraving_job',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'parent' },
        { element: 'award_line' },
        { element: 'assigned_to' },
        { element: 'machine' },
        { element: 'font' },
        { element: 'text' },
        { element: 'stage' },
        { element: 'state' },
        { element: 'priority' },
        { element: 'queued' },
        { element: 'started' },
        { element: 'completed' },
        { element: 'rework_count' },
    ],
})

// x_cog_mah_native_shipment — replaces legacy view(s): Warehouse\Shipments
List({
    table: 'x_cog_mah_native_shipment',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'legacy_number' },
        { element: 'parent' },
        { element: 'carrier' },
        { element: 'service_level' },
        { element: 'tracking_number' },
        { element: 'pieces' },
        { element: 'partial' },
        { element: 'picked' },
        { element: 'shipped' },
        { element: 'delivered' },
        { element: 'stage' },
        { element: 'state' },
    ],
})

// x_cog_mah_native_heraldry_request — replaces legacy view(s): Requests\By State, Requests\By Vendor, Requests\Released, Requests\All
List({
    table: 'x_cog_mah_native_heraldry_request',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'document_number' },
        { element: 'dodaac' },
        { element: 'uic' },
        { element: 'requisition_priority' },
        { element: 'request_type' },
        { element: 'requesting_unit' },
        { element: 'stage' },
        { element: 'state' },
        { element: 'approval' },
        { element: 'company' },
        { element: 'released_to_vendor' },
        { element: 'required_delivery_date' },
        { element: 'line_count', sum: true },
        { element: 'total_extended_price', sum: true },
    ],
})

// x_cog_mah_native_request_line — replaces legacy view(s): Lines\By Request
List({
    table: 'x_cog_mah_native_request_line',
    view: default_view,
    columns: [
        { element: 'number' },
        { element: 'heraldry_request' },
        { element: 'line_number' },
        { element: 'model' },
        { element: 'nsn_or_exception' },
        { element: 'nomenclature' },
        { element: 'unit_of_issue' },
        { element: 'quantity', sum: true },
        { element: 'unit_price' },
        { element: 'extended_price', sum: true },
        { element: 'status' },
    ],
})

// x_cog_mah_native_catalog_item — replaces legacy view(s): Catalog\Heraldic Items, Catalog\By Category
List({
    table: 'x_cog_mah_native_catalog_item',
    view: default_view,
    columns: [
        { element: 'model_number' },
        { element: 'name' },
        { element: 'catalog_kind' },
        { element: 'heraldic_category' },
        { element: 'unit_of_issue' },
        { element: 'cost' },
        { element: 'lead_time_days' },
        { element: 'manufacturer' },
        { element: 'exception_item' },
        { element: 'catalog_state' },
    ],
})

// x_cog_mah_native_ses_flag_request — replaces legacy view(s): SES\Pending, SES\All
List({
    table: 'x_cog_mah_native_ses_flag_request',
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
        { element: 'stage' },
        { element: 'state' },
        { element: 'approval' },
        { element: 'company' },
        { element: 'approved_at' },
        { element: 'delivered_at' },
    ],
})

// x_cog_mah_native_status_map — replaces legacy view(s): n/a (new in target)
List({
    table: 'x_cog_mah_native_status_map',
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

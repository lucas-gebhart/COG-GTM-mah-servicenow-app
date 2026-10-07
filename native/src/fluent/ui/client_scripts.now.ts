/**
 * Client scripts and UI policies — the browser-side behaviours that replace the XPages
 * onchange handlers and computed-for-display fields on the DD Form 1348-6 and awards-case forms.
 * All of them are convenience only; the before business rules remain authoritative.
 *
 * Differences from v1: lifecycle field is `stage`, the vendor is the inherited `company`, request
 * lines reference a catalog `model` (cmdb_model) and the awards-case aging banner is gone — the
 * 60/75-day timers are task_sla rows rendered by the platform on the form.
 */
import '@servicenow/sdk/global'
import { ClientScript, UiPolicy } from '@servicenow/sdk/core'

// ------------------------------------------------------------------ DD Form 1348-6 (heraldry request)
export const csDd1348Load = ClientScript({
    $id: Now.ID['cs_dd1348_onload'],
    name: 'MAH Native DD1348-6: header hints and release lock',
    table: 'x_cog_mah_native_heraldry_request',
    type: 'onLoad',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'Shows the release-lock message and marks fields read-only once released_to_vendor is set; hints on new records.',
    script: Now.include('../../client/dd1348_header.client.js'),
})

export const csDd1348Dodaac = ClientScript({
    $id: Now.ID['cs_dd1348_dodaac'],
    name: 'MAH Native DD1348-6: DODAAC format',
    table: 'x_cog_mah_native_heraldry_request',
    type: 'onChange',
    field: 'dodaac',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'Uppercases and validates the 6-character DODAAC and its service designator; cross-checks the document number.',
    script: Now.include('../../client/dd1348_dodaac.client.js'),
})

export const csDd1348DocNo = ClientScript({
    $id: Now.ID['cs_dd1348_document_number'],
    name: 'MAH Native DD1348-6: document number format',
    table: 'x_cog_mah_native_heraldry_request',
    type: 'onChange',
    field: 'document_number',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'Validates DODAAC(6)+Julian(4)+serial(4) and auto-fills the DODAAC field from the document number.',
    script: Now.include('../../client/dd1348_document_number.client.js'),
})

export const csDd1348Uic = ClientScript({
    $id: Now.ID['cs_dd1348_uic'],
    name: 'MAH Native DD1348-6: UIC format',
    table: 'x_cog_mah_native_heraldry_request',
    type: 'onChange',
    field: 'uic',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'Uppercases and validates the W+5 unit identification code.',
    script: Now.include('../../client/dd1348_uic.client.js'),
})

export const csDd1348Priority = ClientScript({
    $id: Now.ID['cs_dd1348_priority'],
    name: 'MAH Native DD1348-6: requisition priority guidance',
    table: 'x_cog_mah_native_heraldry_request',
    type: 'onChange',
    field: 'requisition_priority',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'IPG I (01–03) makes required delivery date mandatory and shows the review-target hint.',
    script: Now.include('../../client/dd1348_priority.client.js'),
})

export const upDd1348Released = UiPolicy({
    $id: Now.ID['up_dd1348_released'],
    table: 'x_cog_mah_native_heraldry_request',
    shortDescription: 'MAH Native DD1348-6: lock header after release to vendor',
    description: 'Once released_to_vendor is set the header, lines and vendor fields are read-only (server rule enforces the same).',
    conditions: 'released_to_vendorISNOTEMPTY',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 100,
    actions: [
        { field: 'document_number', readOnly: true },
        { field: 'dodaac', readOnly: true },
        { field: 'uic', readOnly: true },
        { field: 'requisition_priority', readOnly: true },
        { field: 'project_code', readOnly: true },
        { field: 'fund_code', readOnly: true },
        { field: 'signal_code', readOnly: true },
        { field: 'required_delivery_date', readOnly: true },
        { field: 'requesting_unit', readOnly: true },
        { field: 'requester_poc', readOnly: true },
        { field: 'requester_poc_email', readOnly: true },
        { field: 'requester_poc_phone', readOnly: true },
        { field: 'ship_to', readOnly: true },
        { field: 'justification', readOnly: true },
        { field: 'company', readOnly: true },
    ],
})

export const upDd1348Submit = UiPolicy({
    $id: Now.ID['up_dd1348_submit_mandatory'],
    table: 'x_cog_mah_native_heraldry_request',
    shortDescription: 'MAH Native DD1348-6: header fields mandatory once out of Draft',
    conditions: 'stage!=draft^stage!=unmapped',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 110,
    actions: [
        { field: 'document_number', mandatory: true },
        { field: 'dodaac', mandatory: true },
        { field: 'uic', mandatory: true },
        { field: 'requisition_priority', mandatory: true },
        { field: 'requester_poc', mandatory: true },
        { field: 'ship_to', mandatory: true },
        { field: 'justification', mandatory: true },
    ],
})

export const upDd1348VendorSection = UiPolicy({
    $id: Now.ID['up_dd1348_vendor_fields'],
    table: 'x_cog_mah_native_heraldry_request',
    shortDescription: 'MAH Native DD1348-6: vendor fulfilment fields visible only after release',
    conditions: 'stageINreleased_to_vendor,in_production,shipped,complete',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 120,
    actions: [
        { field: 'vendor_acknowledged', visible: true },
        { field: 'vendor_ship_date', visible: true },
        { field: 'vendor_tracking_number', visible: true },
        { field: 'vendor_notes', visible: true },
    ],
})

export const upDd1348Cancelled = UiPolicy({
    $id: Now.ID['up_dd1348_cancel_reason'],
    table: 'x_cog_mah_native_heraldry_request',
    shortDescription: 'MAH Native DD1348-6: cancel reason mandatory and visible when cancelled',
    conditions: 'stage=cancelled',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 130,
    actions: [{ field: 'cancel_reason', visible: true, mandatory: true }],
})

// ------------------------------------------------------------------ Request line
export const csLinePrice = ClientScript({
    $id: Now.ID['cs_line_price_qty'],
    name: 'MAH Native request line: extended price (quantity)',
    table: 'x_cog_mah_native_request_line',
    type: 'onChange',
    field: 'quantity',
    uiType: 'all',
    global: true,
    isolateScript: true,
    script: Now.include('../../client/request_line_price.client.js'),
})
export const csLinePriceUnit = ClientScript({
    $id: Now.ID['cs_line_price_unit'],
    name: 'MAH Native request line: extended price (unit price)',
    table: 'x_cog_mah_native_request_line',
    type: 'onChange',
    field: 'unit_price',
    uiType: 'all',
    global: true,
    isolateScript: true,
    script: Now.include('../../client/request_line_price.client.js'),
})
export const csLineItem = ClientScript({
    $id: Now.ID['cs_line_item_lookup'],
    name: 'MAH Native request line: fill from catalog model',
    table: 'x_cog_mah_native_request_line',
    type: 'onChange',
    field: 'model',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'Copies NSN (model_number), nomenclature, unit of issue and catalog price (cost) from the selected catalog model.',
    script: Now.include('../../client/request_line_item.client.js'),
})
export const upLineReadonlyPrice = UiPolicy({
    $id: Now.ID['up_line_extended_price_ro'],
    table: 'x_cog_mah_native_request_line',
    shortDescription: 'MAH Native request line: extended price is computed',
    conditions: 'sys_idISNOTEMPTY^ORsys_idISEMPTY',
    global: true,
    onLoad: true,
    order: 100,
    actions: [{ field: 'extended_price', readOnly: true }],
})

// ------------------------------------------------------------------ Award line
export const csEngravingText = ClientScript({
    $id: Now.ID['cs_award_line_engraving'],
    name: 'MAH Native award line: engraving text whitelist',
    table: 'x_cog_mah_native_award_line',
    type: 'onChange',
    field: 'engraving_text',
    uiType: 'all',
    global: true,
    isolateScript: true,
    script: Now.include('../../client/award_line_engraving.client.js'),
})
export const upEngravingRequired = UiPolicy({
    $id: Now.ID['up_award_line_engraving'],
    table: 'x_cog_mah_native_award_line',
    shortDescription: 'MAH Native award line: engraving text only when engraving is required',
    conditions: 'engraving_required=true',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 100,
    actions: [{ field: 'engraving_text', visible: true, mandatory: true }],
})

// ------------------------------------------------------------------ Awards case
export const csCaseLoad = ClientScript({
    $id: Now.ID['cs_awards_case_onload'],
    name: 'MAH Native awards case: hold banner and terminal lock',
    table: 'x_cog_mah_native_awards_case',
    type: 'onLoad',
    uiType: 'all',
    global: true,
    isolateScript: true,
    description: 'On-hold banner (SLA clock paused) and read-only stage on closed/cancelled cases; aging itself is the Task SLA related list.',
    script: Now.include('../../client/awards_case_stage.client.js'),
})
export const upCaseComputed = UiPolicy({
    $id: Now.ID['up_awards_case_computed'],
    table: 'x_cog_mah_native_awards_case',
    shortDescription: 'MAH Native awards case: computed fields are read-only',
    conditions: 'sys_idISNOTEMPTY^ORsys_idISEMPTY',
    global: true,
    onLoad: true,
    order: 100,
    actions: [
        { field: 'stage_entered_at', readOnly: true },
        { field: 'line_count', readOnly: true },
        { field: 'total_quantity', readOnly: true },
    ],
})
export const upCaseCancelled = UiPolicy({
    $id: Now.ID['up_awards_case_cancel_reason'],
    table: 'x_cog_mah_native_awards_case',
    shortDescription: 'MAH Native awards case: cancel reason mandatory when cancelled',
    conditions: 'stage=cancelled',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 110,
    actions: [{ field: 'cancel_reason', visible: true, mandatory: true }],
})

// ------------------------------------------------------------------ SES flag request
export const upSesRejected = UiPolicy({
    $id: Now.ID['up_ses_rejection_reason'],
    table: 'x_cog_mah_native_ses_flag_request',
    shortDescription: 'MAH Native SES flag: rejection reason mandatory when rejected',
    conditions: 'stage=rejected',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 100,
    actions: [{ field: 'rejection_reason', visible: true, mandatory: true }],
})

// ------------------------------------------------------------------ Requester
export const upRequesterMerged = UiPolicy({
    $id: Now.ID['up_requester_merged'],
    table: 'x_cog_mah_native_requester',
    shortDescription: 'MAH Native requester: merged duplicates are read-only',
    conditions: 'merged_intoISNOTEMPTY',
    global: true,
    onLoad: true,
    reverseIfFalse: true,
    order: 100,
    actions: [
        { field: 'first_name', readOnly: true },
        { field: 'last_name', readOnly: true },
        { field: 'service_number_last4', readOnly: true },
        { field: 'dob', readOnly: true },
        { field: 'email', readOnly: true },
        { field: 'phone', readOnly: true },
        { field: 'address_1', readOnly: true },
        { field: 'zip', readOnly: true },
        { field: 'merge_target', readOnly: true },
    ],
})

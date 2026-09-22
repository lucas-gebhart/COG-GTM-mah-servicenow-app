// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (related lists). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const rl_awards_case = Record({
    $id: Now.ID['rl_awards_case'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_awards_case', view: 'Default view' },
})
export const rl_awards_case_award_line_awards_case = Record({
    $id: Now.ID['rl_awards_case_award_line_awards_case'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_award_line.awards_case',
        position: 0,
        order_by: 'line_number',
    },
})
export const rl_awards_case_engraving_job_awards_case = Record({
    $id: Now.ID['rl_awards_case_engraving_job_awards_case'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_engraving_job.awards_case',
        position: 1,
        order_by: 'sys_created_on',
    },
})
export const rl_awards_case_shipment_awards_case = Record({
    $id: Now.ID['rl_awards_case_shipment_awards_case'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_shipment.awards_case',
        position: 2,
        order_by: 'shipped',
    },
})
export const rl_awards_case_case_note_awards_case = Record({
    $id: Now.ID['rl_awards_case_case_note_awards_case'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_case_note.awards_case',
        position: 3,
        order_by: 'noted_at',
    },
})

export const rl_award_line = Record({
    $id: Now.ID['rl_award_line'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_award_line', view: 'Default view' },
})
export const rl_award_line_engraving_job_award_line = Record({
    $id: Now.ID['rl_award_line_engraving_job_award_line'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_award_line,
        related_list: 'x_cog_mah_engraving_job.award_line',
        position: 0,
    },
})

export const rl_requester = Record({
    $id: Now.ID['rl_requester'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_requester', view: 'Default view' },
})
export const rl_requester_awards_case_requester = Record({
    $id: Now.ID['rl_requester_awards_case_requester'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_requester,
        related_list: 'x_cog_mah_awards_case.requester',
        position: 0,
        order_by: 'authorization_date',
    },
})

export const rl_authorization_file = Record({
    $id: Now.ID['rl_authorization_file'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_authorization_file', view: 'Default view' },
})
export const rl_authorization_file_awards_case_authorization_file = Record({
    $id: Now.ID['rl_authorization_file_awards_case_authorization_file'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_authorization_file,
        related_list: 'x_cog_mah_awards_case.authorization_file',
        position: 0,
        order_by: 'number',
    },
})

export const rl_heraldry_request = Record({
    $id: Now.ID['rl_heraldry_request'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_heraldry_request', view: 'Default view' },
})
export const rl_heraldry_request_request_line_heraldry_request = Record({
    $id: Now.ID['rl_heraldry_request_request_line_heraldry_request'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldry_request,
        related_list: 'x_cog_mah_request_line.heraldry_request',
        position: 0,
        order_by: 'line_number',
    },
})
export const rl_heraldry_request_case_note_heraldry_request = Record({
    $id: Now.ID['rl_heraldry_request_case_note_heraldry_request'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldry_request,
        related_list: 'x_cog_mah_case_note.heraldry_request',
        position: 1,
        order_by: 'noted_at',
    },
})

export const rl_heraldic_item = Record({
    $id: Now.ID['rl_heraldic_item'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_heraldic_item', view: 'Default view' },
})
export const rl_heraldic_item_request_line_heraldic_item = Record({
    $id: Now.ID['rl_heraldic_item_request_line_heraldic_item'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldic_item,
        related_list: 'x_cog_mah_request_line.heraldic_item',
        position: 0,
    },
})

export const rl_vendor = Record({
    $id: Now.ID['rl_vendor'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_vendor', view: 'Default view' },
})
export const rl_vendor_heraldry_request_vendor = Record({
    $id: Now.ID['rl_vendor_heraldry_request_vendor'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_vendor,
        related_list: 'x_cog_mah_heraldry_request.vendor',
        position: 0,
        order_by: 'released_to_vendor',
    },
})
export const rl_vendor_heraldic_item_preferred_vendor = Record({
    $id: Now.ID['rl_vendor_heraldic_item_preferred_vendor'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_vendor,
        related_list: 'x_cog_mah_heraldic_item.preferred_vendor',
        position: 1,
    },
})

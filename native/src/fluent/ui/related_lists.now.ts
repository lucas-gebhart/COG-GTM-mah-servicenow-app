// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/uiLayout.ts (related lists). Regenerate with `npm run gen:ui`.
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const rl_awards_case = Record({
    $id: Now.ID['rl_awards_case'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_awards_case', view: 'Default view' },
})
export const rl_awards_case_award_line_awards_case = Record({
    $id: Now.ID['rl_awards_case_award_line_awards_case'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_native_award_line.awards_case',
        position: 0,
        order_by: 'line_number',
    },
})
export const rl_awards_case_engraving_job_parent = Record({
    $id: Now.ID['rl_awards_case_engraving_job_parent'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_native_engraving_job.parent',
        position: 1,
        order_by: 'sys_created_on',
    },
})
export const rl_awards_case_shipment_parent = Record({
    $id: Now.ID['rl_awards_case_shipment_parent'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'x_cog_mah_native_shipment.parent',
        position: 2,
        order_by: 'shipped',
    },
})
export const rl_awards_case_task_sla_task = Record({
    $id: Now.ID['rl_awards_case_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'task_sla.task',
        position: 3,
    },
})
export const rl_awards_case_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_awards_case_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_awards_case,
        related_list: 'sysapproval_approver.sysapproval',
        position: 4,
    },
})

export const rl_award_line = Record({
    $id: Now.ID['rl_award_line'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_award_line', view: 'Default view' },
})
export const rl_award_line_engraving_job_award_line = Record({
    $id: Now.ID['rl_award_line_engraving_job_award_line'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_award_line,
        related_list: 'x_cog_mah_native_engraving_job.award_line',
        position: 0,
    },
})

export const rl_requester = Record({
    $id: Now.ID['rl_requester'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_requester', view: 'Default view' },
})
export const rl_requester_awards_case_requester = Record({
    $id: Now.ID['rl_requester_awards_case_requester'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_requester,
        related_list: 'x_cog_mah_native_awards_case.requester',
        position: 0,
        order_by: 'authorization_date',
    },
})
export const rl_requester_heraldry_request_requester = Record({
    $id: Now.ID['rl_requester_heraldry_request_requester'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_requester,
        related_list: 'x_cog_mah_native_heraldry_request.requester',
        position: 1,
        order_by: 'opened_at',
    },
})

export const rl_authorization_file = Record({
    $id: Now.ID['rl_authorization_file'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_authorization_file', view: 'Default view' },
})
export const rl_authorization_file_awards_case_authorization_file_task = Record({
    $id: Now.ID['rl_authorization_file_awards_case_authorization_file_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_authorization_file,
        related_list: 'x_cog_mah_native_awards_case.authorization_file_task',
        position: 0,
        order_by: 'number',
    },
})
export const rl_authorization_file_task_sla_task = Record({
    $id: Now.ID['rl_authorization_file_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_authorization_file,
        related_list: 'task_sla.task',
        position: 1,
    },
})
export const rl_authorization_file_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_authorization_file_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_authorization_file,
        related_list: 'sysapproval_approver.sysapproval',
        position: 2,
    },
})

export const rl_engraving_job = Record({
    $id: Now.ID['rl_engraving_job'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_engraving_job', view: 'Default view' },
})
export const rl_engraving_job_task_sla_task = Record({
    $id: Now.ID['rl_engraving_job_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_engraving_job,
        related_list: 'task_sla.task',
        position: 0,
    },
})
export const rl_engraving_job_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_engraving_job_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_engraving_job,
        related_list: 'sysapproval_approver.sysapproval',
        position: 1,
    },
})

export const rl_shipment = Record({
    $id: Now.ID['rl_shipment'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_shipment', view: 'Default view' },
})
export const rl_shipment_task_sla_task = Record({
    $id: Now.ID['rl_shipment_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_shipment,
        related_list: 'task_sla.task',
        position: 0,
    },
})
export const rl_shipment_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_shipment_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_shipment,
        related_list: 'sysapproval_approver.sysapproval',
        position: 1,
    },
})

export const rl_heraldry_request = Record({
    $id: Now.ID['rl_heraldry_request'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_heraldry_request', view: 'Default view' },
})
export const rl_heraldry_request_request_line_heraldry_request = Record({
    $id: Now.ID['rl_heraldry_request_request_line_heraldry_request'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldry_request,
        related_list: 'x_cog_mah_native_request_line.heraldry_request',
        position: 0,
        order_by: 'line_number',
    },
})
export const rl_heraldry_request_task_sla_task = Record({
    $id: Now.ID['rl_heraldry_request_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldry_request,
        related_list: 'task_sla.task',
        position: 1,
    },
})
export const rl_heraldry_request_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_heraldry_request_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_heraldry_request,
        related_list: 'sysapproval_approver.sysapproval',
        position: 2,
    },
})

export const rl_catalog_item = Record({
    $id: Now.ID['rl_catalog_item'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_catalog_item', view: 'Default view' },
})
export const rl_catalog_item_request_line_model = Record({
    $id: Now.ID['rl_catalog_item_request_line_model'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_catalog_item,
        related_list: 'x_cog_mah_native_request_line.model',
        position: 0,
    },
})
export const rl_catalog_item_award_line_award_model = Record({
    $id: Now.ID['rl_catalog_item_award_line_award_model'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_catalog_item,
        related_list: 'x_cog_mah_native_award_line.award_model',
        position: 1,
    },
})

export const rl_ses_flag_request = Record({
    $id: Now.ID['rl_ses_flag_request'],
    table: 'sys_ui_related_list',
    data: { name: 'x_cog_mah_native_ses_flag_request', view: 'Default view' },
})
export const rl_ses_flag_request_task_sla_task = Record({
    $id: Now.ID['rl_ses_flag_request_task_sla_task'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_ses_flag_request,
        related_list: 'task_sla.task',
        position: 0,
    },
})
export const rl_ses_flag_request_sysapproval_approver_sysapproval = Record({
    $id: Now.ID['rl_ses_flag_request_sysapproval_approver_sysapproval'],
    table: 'sys_ui_related_list_entry',
    data: {
        list_id: rl_ses_flag_request,
        related_list: 'sysapproval_approver.sysapproval',
        position: 1,
    },
})

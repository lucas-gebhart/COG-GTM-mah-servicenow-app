/**
 * UI Actions — the operator buttons that replace the XPages action bar and the Domino
 * `Submit` / `Release` / `Cancel` / `Advance` / `Merge` agents. Every server script requires
 * the tested handler module (src/server/services/actions.ts) and redirects back to the form;
 * the before-business-rules remain the guard rails so no button can bypass validation.
 * Each action also gets sys_ux_form_action / layout-item records so it shows in the
 * `MAH Operations` configurable workspace.
 */
import '@servicenow/sdk/global'
import { Record, UiAction } from '@servicenow/sdk/core'
import { admin, assembler, csr, dla, engraver, tacomStaff, vendor, warehouse } from '../security/roles.now'


// ---------------------------------------------------------------------------------------------
// Awards case
// ---------------------------------------------------------------------------------------------
export const advanceCaseStageAction = UiAction({
    $id: Now.ID['ua_case_advance'],
    table: 'x_cog_mah_awards_case',
    name: 'Advance stage',
    actionName: 'mah_advance_stage',
    hint: 'Move the case to the next lifecycle stage (Authorized → Engraving → Assembly/QC → Warehouse → Shipped → Closed).',
    showUpdate: true,
    order: 100,
    condition: "current.active && ['authorized','engraving','assembly_qc','warehouse','shipped'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, csr, engraver, assembler, warehouse, admin],
    form: { showButton: true, style: 'primary' },
    list: { showContextMenu: true, showButton: false, showLink: false, showListChoice: false, showBannerButton: false, showSaveWithFormButton: false },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { advanceCaseStage } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nadvanceCaseStage(current, []);\naction.setRedirectURL(current);",
})

export const cancelCaseAction = UiAction({
    $id: Now.ID['ua_case_cancel'],
    table: 'x_cog_mah_awards_case',
    name: 'Cancel case',
    actionName: 'mah_cancel_case',
    hint: 'Cancel this awards case. Requires a cancel reason.',
    showUpdate: true,
    order: 900,
    condition: "current.active && ['authorized','engraving','assembly_qc','warehouse'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, csr, admin],
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormMenuButtonV2: true },
    script: "const { cancelCase } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\ncancelCase(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// Heraldry request (DD Form 1348-6)
// ---------------------------------------------------------------------------------------------
export const submitRequestAction = UiAction({
    $id: Now.ID['ua_req_submit'],
    table: 'x_cog_mah_heraldry_request',
    name: 'Submit request',
    actionName: 'mah_submit_request',
    hint: 'Validate the DD Form 1348-6 header and submit the request for TACOM review.',
    showUpdate: true,
    order: 100,
    condition: "current.state == 'draft'",
    roles: [tacomStaff, csr, dla, admin],
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { submitRequest } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nsubmitRequest(current, []);\naction.setRedirectURL(current);",
})

export const startReviewAction = UiAction({
    $id: Now.ID['ua_req_review'],
    table: 'x_cog_mah_heraldry_request',
    name: 'Start review',
    actionName: 'mah_start_review',
    hint: 'Take the request into TACOM review.',
    showUpdate: true,
    order: 110,
    condition: "current.state == 'submitted'",
    roles: [tacomStaff, dla, admin],
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { startRequestReview } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nstartRequestReview(current, []);\naction.setRedirectURL(current);",
})

export const releaseToVendorAction = UiAction({
    $id: Now.ID['ua_req_release'],
    table: 'x_cog_mah_heraldry_request',
    name: 'Release to vendor',
    actionName: 'mah_release_to_vendor',
    hint: 'Release the request to the selected vendor. After release the request is locked.',
    showUpdate: true,
    order: 120,
    condition: "current.state == 'in_review' && !current.vendor.nil()",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { releaseRequestToVendor } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nreleaseRequestToVendor(current, []);\naction.setRedirectURL(current);",
})

export const advanceRequestAction = UiAction({
    $id: Now.ID['ua_req_advance'],
    table: 'x_cog_mah_heraldry_request',
    name: 'Advance state',
    actionName: 'mah_advance_request',
    hint: 'Released → In production → Shipped → Complete.',
    showUpdate: true,
    order: 130,
    condition: "['released_to_vendor','in_production','shipped'].indexOf(String(current.state)) >= 0",
    roles: [tacomStaff, vendor, admin],
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { advanceRequestState } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nadvanceRequestState(current, []);\naction.setRedirectURL(current);",
})

export const cancelRequestAction = UiAction({
    $id: Now.ID['ua_req_cancel'],
    table: 'x_cog_mah_heraldry_request',
    name: 'Cancel request',
    actionName: 'mah_cancel_request',
    hint: 'Cancel the request before it is released to a vendor.',
    showUpdate: true,
    order: 900,
    condition: "['draft','submitted','in_review'].indexOf(String(current.state)) >= 0",
    roles: [tacomStaff, csr, dla, admin],
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormMenuButtonV2: true },
    script: "const { cancelRequest } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\ncancelRequest(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// SES flag request
// ---------------------------------------------------------------------------------------------
export const approveSesAction = UiAction({
    $id: Now.ID['ua_ses_approve'],
    table: 'x_cog_mah_ses_flag_request',
    name: 'Approve',
    actionName: 'mah_ses_approve',
    hint: 'Approve the SES positional flag request (AR 840-10).',
    showUpdate: true,
    order: 100,
    condition: "current.state == 'submitted'",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { approveSesRequest } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\napproveSesRequest(current, []);\naction.setRedirectURL(current);",
})

export const rejectSesAction = UiAction({
    $id: Now.ID['ua_ses_reject'],
    table: 'x_cog_mah_ses_flag_request',
    name: 'Reject',
    actionName: 'mah_ses_reject',
    hint: 'Reject the request. Requires a rejection reason.',
    showUpdate: true,
    order: 110,
    condition: "current.state == 'submitted'",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormMenuButtonV2: true },
    script: "const { rejectSesRequest } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nrejectSesRequest(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// Requester
// ---------------------------------------------------------------------------------------------
export const mergeRequesterAction = UiAction({
    $id: Now.ID['ua_requester_merge'],
    table: 'x_cog_mah_requester',
    name: 'Merge requester',
    actionName: 'mah_merge_requester',
    hint: 'Merge this duplicate into the requester chosen in "Merge into (survivor)". Cases repoint to the survivor.',
    showUpdate: true,
    order: 100,
    condition: "current.merged_into.nil() && !current.merge_target.nil()",
    roles: [tacomStaff, csr, admin],
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    script: "const { mergeRequester } = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/actions.ts');\nmergeRequester(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// Workspace integration (sys_ux_form_action + layout item per action)
// ---------------------------------------------------------------------------------------------
export const wsCaseAdvance = Record({
    $id: Now.ID['ws_fa_case_advance'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_awards_case', ui_action: Now.ID['ua_case_advance'], action_type: 'ui_action', active: true, name: 'mah_advance_stage' },
})
export const wsCaseAdvanceItem = Record({
    $id: Now.ID['ws_li_case_advance'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_awards_case', name: 'mah_advance_stage_item', label: 'Advance stage', color: 'primary', overflow: false, order: 100, active: true, item_type: 'action', action: Now.ID['ws_fa_case_advance'] },
})
export const wsCaseCancel = Record({
    $id: Now.ID['ws_fa_case_cancel'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_awards_case', ui_action: Now.ID['ua_case_cancel'], action_type: 'ui_action', active: true, name: 'mah_cancel_case' },
})
export const wsCaseCancelItem = Record({
    $id: Now.ID['ws_li_case_cancel'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_awards_case', name: 'mah_cancel_case_item', label: 'Cancel case', color: 'destructive', overflow: true, order: 900, active: true, item_type: 'action', action: Now.ID['ws_fa_case_cancel'] },
})
export const wsReqSubmit = Record({
    $id: Now.ID['ws_fa_req_submit'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_heraldry_request', ui_action: Now.ID['ua_req_submit'], action_type: 'ui_action', active: true, name: 'mah_submit_request' },
})
export const wsReqSubmitItem = Record({
    $id: Now.ID['ws_li_req_submit'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_heraldry_request', name: 'mah_submit_request_item', label: 'Submit request', color: 'primary', overflow: false, order: 100, active: true, item_type: 'action', action: Now.ID['ws_fa_req_submit'] },
})
export const wsReqReview = Record({
    $id: Now.ID['ws_fa_req_review'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_heraldry_request', ui_action: Now.ID['ua_req_review'], action_type: 'ui_action', active: true, name: 'mah_start_review' },
})
export const wsReqReviewItem = Record({
    $id: Now.ID['ws_li_req_review'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_heraldry_request', name: 'mah_start_review_item', label: 'Start review', color: 'secondary', overflow: false, order: 110, active: true, item_type: 'action', action: Now.ID['ws_fa_req_review'] },
})
export const wsReqRelease = Record({
    $id: Now.ID['ws_fa_req_release'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_heraldry_request', ui_action: Now.ID['ua_req_release'], action_type: 'ui_action', active: true, name: 'mah_release_to_vendor' },
})
export const wsReqReleaseItem = Record({
    $id: Now.ID['ws_li_req_release'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_heraldry_request', name: 'mah_release_to_vendor_item', label: 'Release to vendor', color: 'primary', overflow: false, order: 120, active: true, item_type: 'action', action: Now.ID['ws_fa_req_release'] },
})
export const wsReqAdvance = Record({
    $id: Now.ID['ws_fa_req_advance'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_heraldry_request', ui_action: Now.ID['ua_req_advance'], action_type: 'ui_action', active: true, name: 'mah_advance_request' },
})
export const wsReqAdvanceItem = Record({
    $id: Now.ID['ws_li_req_advance'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_heraldry_request', name: 'mah_advance_request_item', label: 'Advance state', color: 'secondary', overflow: false, order: 130, active: true, item_type: 'action', action: Now.ID['ws_fa_req_advance'] },
})
export const wsReqCancel = Record({
    $id: Now.ID['ws_fa_req_cancel'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_heraldry_request', ui_action: Now.ID['ua_req_cancel'], action_type: 'ui_action', active: true, name: 'mah_cancel_request' },
})
export const wsReqCancelItem = Record({
    $id: Now.ID['ws_li_req_cancel'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_heraldry_request', name: 'mah_cancel_request_item', label: 'Cancel request', color: 'destructive', overflow: true, order: 900, active: true, item_type: 'action', action: Now.ID['ws_fa_req_cancel'] },
})
export const wsSesApprove = Record({
    $id: Now.ID['ws_fa_ses_approve'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_ses_flag_request', ui_action: Now.ID['ua_ses_approve'], action_type: 'ui_action', active: true, name: 'mah_ses_approve' },
})
export const wsSesApproveItem = Record({
    $id: Now.ID['ws_li_ses_approve'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_ses_flag_request', name: 'mah_ses_approve_item', label: 'Approve', color: 'primary', overflow: false, order: 100, active: true, item_type: 'action', action: Now.ID['ws_fa_ses_approve'] },
})
export const wsSesReject = Record({
    $id: Now.ID['ws_fa_ses_reject'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_ses_flag_request', ui_action: Now.ID['ua_ses_reject'], action_type: 'ui_action', active: true, name: 'mah_ses_reject' },
})
export const wsSesRejectItem = Record({
    $id: Now.ID['ws_li_ses_reject'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_ses_flag_request', name: 'mah_ses_reject_item', label: 'Reject', color: 'destructive', overflow: true, order: 110, active: true, item_type: 'action', action: Now.ID['ws_fa_ses_reject'] },
})
export const wsRequesterMerge = Record({
    $id: Now.ID['ws_fa_requester_merge'],
    table: 'sys_ux_form_action',
    data: { table: 'x_cog_mah_requester', ui_action: Now.ID['ua_requester_merge'], action_type: 'ui_action', active: true, name: 'mah_merge_requester' },
})
export const wsRequesterMergeItem = Record({
    $id: Now.ID['ws_li_requester_merge'],
    table: 'sys_ux_form_action_layout_item',
    data: { table: 'x_cog_mah_requester', name: 'mah_merge_requester_item', label: 'Merge requester', color: 'primary', overflow: false, order: 100, active: true, item_type: 'action', action: Now.ID['ws_fa_requester_merge'] },
})

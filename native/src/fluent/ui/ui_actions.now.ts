/**
 * UI Actions — the operator buttons that replace the XPages action bar and the Domino
 * `Submit` / `Release` / `Cancel` / `Advance` / `Merge` agents. Every server script requires
 * the tested handler module (src/server/services/actions.ts) and redirects back to the form;
 * the before-business-rules remain the guard rails so no button can bypass validation.
 *
 * Differences from v1: the lifecycle field is `stage` (native `state` follows it), the vendor is
 * the inherited `company`, and "Release to vendor" additionally requires the native approval
 * (`approval == approved`, set by the review flow's Ask for Approval step). No workspace
 * form-action records: v2 uses the standard task forms, Visual Task Boards and dashboards.
 */
import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'
import { admin, assembler, csr, dla, engraver, tacomStaff, vendor, warehouse } from '../security/roles.now'


// ---------------------------------------------------------------------------------------------
// Awards case
// ---------------------------------------------------------------------------------------------
export const advanceCaseStageAction = UiAction({
    $id: Now.ID['ua_case_advance'],
    table: 'x_cog_mah_native_awards_case',
    name: 'Advance stage',
    actionName: 'mah_native_advance_stage',
    hint: 'Move the case to the next lifecycle stage (Authorized → Engraving → Assembly/QC → Warehouse → Shipped → Closed).',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 100,
    condition: "current.active && ['authorized','engraving','assembly_qc','warehouse','shipped'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, csr, engraver, assembler, warehouse, admin],
    form: { showButton: true, style: 'primary' },
    list: { showContextMenu: true, showButton: false, showLink: false, showListChoice: false, showBannerButton: false, showSaveWithFormButton: false },
    script: "const { advanceCaseStage } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nadvanceCaseStage(current, []);\naction.setRedirectURL(current);",
})

export const cancelCaseAction = UiAction({
    $id: Now.ID['ua_case_cancel'],
    table: 'x_cog_mah_native_awards_case',
    name: 'Cancel case',
    actionName: 'mah_native_cancel_case',
    hint: 'Cancel this awards case. Requires a cancel reason.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 900,
    condition: "current.active && ['authorized','engraving','assembly_qc','warehouse'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, csr, admin],
    form: { showButton: true, style: 'destructive' },
    script: "const { cancelCase } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\ncancelCase(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// Heraldry request (DD Form 1348-6)
// ---------------------------------------------------------------------------------------------
export const submitRequestAction = UiAction({
    $id: Now.ID['ua_req_submit'],
    table: 'x_cog_mah_native_heraldry_request',
    name: 'Submit request',
    actionName: 'mah_native_submit_request',
    hint: 'Validate the DD Form 1348-6 header and submit the request for TACOM review.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 100,
    condition: "current.stage == 'draft'",
    roles: [tacomStaff, csr, dla, admin],
    form: { showButton: true, style: 'primary' },
    script: "const { submitRequest } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nsubmitRequest(current, []);\naction.setRedirectURL(current);",
})

export const startReviewAction = UiAction({
    $id: Now.ID['ua_req_review'],
    table: 'x_cog_mah_native_heraldry_request',
    name: 'Start review',
    actionName: 'mah_native_start_review',
    hint: 'Take the request into TACOM review.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 110,
    condition: "current.stage == 'submitted'",
    roles: [tacomStaff, dla, admin],
    form: { showButton: true, style: 'unstyled' },
    script: "const { startRequestReview } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nstartRequestReview(current, []);\naction.setRedirectURL(current);",
})

export const releaseToVendorAction = UiAction({
    $id: Now.ID['ua_req_release'],
    table: 'x_cog_mah_native_heraldry_request',
    name: 'Release to vendor',
    actionName: 'mah_native_release_to_vendor',
    hint: 'Release the request to the selected vendor. After release the request is locked.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 120,
    condition: "current.stage == 'in_review' && !current.company.nil() && current.approval == 'approved'",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'primary' },
    script: "const { releaseRequestToVendor } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nreleaseRequestToVendor(current, []);\naction.setRedirectURL(current);",
})

export const advanceRequestAction = UiAction({
    $id: Now.ID['ua_req_advance'],
    table: 'x_cog_mah_native_heraldry_request',
    name: 'Advance state',
    actionName: 'mah_native_advance_request',
    hint: 'Released → In production → Shipped → Complete.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 130,
    condition: "['released_to_vendor','in_production','shipped'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, vendor, admin],
    form: { showButton: true, style: 'unstyled' },
    script: "const { advanceRequestState } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nadvanceRequestState(current, []);\naction.setRedirectURL(current);",
})

export const cancelRequestAction = UiAction({
    $id: Now.ID['ua_req_cancel'],
    table: 'x_cog_mah_native_heraldry_request',
    name: 'Cancel request',
    actionName: 'mah_native_cancel_request',
    hint: 'Cancel the request before it is released to a vendor.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 900,
    condition: "['draft','submitted','in_review'].indexOf(String(current.stage)) >= 0",
    roles: [tacomStaff, csr, dla, admin],
    form: { showButton: true, style: 'destructive' },
    script: "const { cancelRequest } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\ncancelRequest(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// SES flag request
// ---------------------------------------------------------------------------------------------
export const approveSesAction = UiAction({
    $id: Now.ID['ua_ses_approve'],
    table: 'x_cog_mah_native_ses_flag_request',
    name: 'Approve',
    actionName: 'mah_native_ses_approve',
    hint: 'Approve the SES positional flag request (AR 840-10).',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 100,
    condition: "current.stage == 'submitted'",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'primary' },
    script: "const { approveSesRequest } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\napproveSesRequest(current, []);\naction.setRedirectURL(current);",
})

export const rejectSesAction = UiAction({
    $id: Now.ID['ua_ses_reject'],
    table: 'x_cog_mah_native_ses_flag_request',
    name: 'Reject',
    actionName: 'mah_native_ses_reject',
    hint: 'Reject the request. Requires a rejection reason.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 110,
    condition: "current.stage == 'submitted'",
    roles: [tacomStaff, admin],
    form: { showButton: true, style: 'destructive' },
    script: "const { rejectSesRequest } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nrejectSesRequest(current, []);\naction.setRedirectURL(current);",
})

// ---------------------------------------------------------------------------------------------
// Requester
// ---------------------------------------------------------------------------------------------
export const mergeRequesterAction = UiAction({
    $id: Now.ID['ua_requester_merge'],
    table: 'x_cog_mah_native_requester',
    name: 'Merge requester',
    actionName: 'mah_native_merge_requester',
    hint: 'Merge this duplicate into the requester chosen in "Merge into (survivor)". Cases repoint to the survivor.',
    showUpdate: true,
    showInsert: false, // stage transitions need a saved record: on an unsaved form the redirect lands on "Record not found"
    order: 100,
    condition: "current.merged_into.nil() && !current.merge_target.nil()",
    roles: [tacomStaff, csr, admin],
    form: { showButton: true, style: 'primary' },
    script: "const { mergeRequester } = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/actions.ts');\nmergeRequester(current, []);\naction.setRedirectURL(current);",
})

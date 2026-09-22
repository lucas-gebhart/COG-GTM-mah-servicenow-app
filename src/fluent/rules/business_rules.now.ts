import { BusinessRule } from '@servicenow/sdk/core'
import { awardLineAfter, awardLineBefore } from '../../server/rules/awardLine'
import { awardsCaseAfter, awardsCaseBefore } from '../../server/rules/awardsCase'
import {
    caseNoteBefore,
    engravingJobAfter,
    engravingJobBefore,
    sesFlagRequestAfter,
    sesFlagRequestBefore,
    shipmentAfter,
    shipmentBefore,
} from '../../server/rules/fulfilment'
import { heraldryRequestAfter, heraldryRequestBefore } from '../../server/rules/heraldryRequest'
import { requestLineAfter, requestLineBefore } from '../../server/rules/requestLine'
import { requesterAfter, requesterBefore } from '../../server/rules/requester'
import { authorizationFileBefore, heraldicItemBefore, vendorBefore } from '../../server/rules/reference'
import {
    caseNoteVendorQuery,
    heraldryRequestVendorQuery,
    requestLineVendorQuery,
    vendorSelfQuery,
} from '../../server/rules/vendorIsolation'

// ------------------------------------------------------------------ awards case

BusinessRule({
    $id: Now.ID['br_awards_case_before'],
    name: 'MAH Awards case - validate and stage guard rails',
    table: 'x_cog_mah_awards_case',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    description:
        'Replaces the AwardsCase QuerySave / PostSave agents: validates ship-to and notes, enforces stage transitions per role, stamps stage_entered_at / closed_at and recomputes days_in_stage and aging_flag.',
    script: awardsCaseBefore,
})

BusinessRule({
    $id: Now.ID['br_awards_case_after'],
    name: 'MAH Awards case - cascade and notify on stage change',
    table: 'x_cog_mah_awards_case',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    description:
        'Fires x_cog_mah.case.stage_changed, cascades Closed / Cancelled to award lines and engraving jobs, and writes a case note (replaces SendStatusMail).',
    script: awardsCaseAfter,
})

// ------------------------------------------------------------------ award line

BusinessRule({
    $id: Now.ID['br_award_line_before'],
    name: 'MAH Award line - validate quantity and engraving',
    table: 'x_cog_mah_award_line',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: awardLineBefore,
})

BusinessRule({
    $id: Now.ID['br_award_line_after'],
    name: 'MAH Award line - roll up to case and queue engraving',
    table: 'x_cog_mah_award_line',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    order: 100,
    script: awardLineAfter,
})

// ------------------------------------------------------------------ requester

BusinessRule({
    $id: Now.ID['br_requester_before'],
    name: 'MAH Requester - validate, display name and dedupe key',
    table: 'x_cog_mah_requester',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: requesterBefore,
})

BusinessRule({
    $id: Now.ID['br_requester_after'],
    name: 'MAH Requester - merge duplicates into survivor',
    table: 'x_cog_mah_requester',
    when: 'after',
    action: ['update'],
    order: 100,
    filterCondition: 'merged_intoISNOTEMPTY^merged_intoCHANGES^EQ',
    script: requesterAfter,
})

// ------------------------------------------------------------------ heraldry request

BusinessRule({
    $id: Now.ID['br_heraldry_request_before'],
    name: 'MAH Heraldry request - DD 1348-6 validation and release lock',
    table: 'x_cog_mah_heraldry_request',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    description:
        'Replaces the Request form @Formula validation and the "released to vendor" QuerySave lock. Validates DODAAC / UIC / document number / priority, enforces the request state machine and blocks header edits once released_to_vendor is set.',
    script: heraldryRequestBefore,
})

BusinessRule({
    $id: Now.ID['br_heraldry_request_after'],
    name: 'MAH Heraldry request - cascade lines and fire events',
    table: 'x_cog_mah_heraldry_request',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: heraldryRequestAfter,
})

BusinessRule({
    $id: Now.ID['br_heraldry_request_vendor_query'],
    name: 'MAH Heraldry request - vendor isolation',
    table: 'x_cog_mah_heraldry_request',
    when: 'before',
    action: ['query'],
    order: 50,
    description:
        'Replaces the Domino Readers field: an external vendor session only sees released requests assigned to a vendor whose portal_user is the session user or whose user_group contains the user.',
    script: heraldryRequestVendorQuery,
})

// ------------------------------------------------------------------ request line

BusinessRule({
    $id: Now.ID['br_request_line_before'],
    name: 'MAH Request line - catalog copy-down and extended price',
    table: 'x_cog_mah_request_line',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: requestLineBefore,
})

BusinessRule({
    $id: Now.ID['br_request_line_after'],
    name: 'MAH Request line - roll up request totals',
    table: 'x_cog_mah_request_line',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    order: 100,
    script: requestLineAfter,
})

BusinessRule({
    $id: Now.ID['br_request_line_vendor_query'],
    name: 'MAH Request line - vendor isolation',
    table: 'x_cog_mah_request_line',
    when: 'before',
    action: ['query'],
    order: 50,
    script: requestLineVendorQuery,
})

// ------------------------------------------------------------------ fulfilment

BusinessRule({
    $id: Now.ID['br_engraving_job_before'],
    name: 'MAH Engraving job - stamp started / completed',
    table: 'x_cog_mah_engraving_job',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: engravingJobBefore,
})

BusinessRule({
    $id: Now.ID['br_engraving_job_after'],
    name: 'MAH Engraving job - advance case to Assembly/QC',
    table: 'x_cog_mah_engraving_job',
    when: 'after',
    action: ['update'],
    order: 100,
    filterCondition: 'statusCHANGESTOcomplete^EQ',
    script: engravingJobAfter,
})

BusinessRule({
    $id: Now.ID['br_shipment_before'],
    name: 'MAH Shipment - validate tracking and stamp dates',
    table: 'x_cog_mah_shipment',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: shipmentBefore,
})

BusinessRule({
    $id: Now.ID['br_shipment_after'],
    name: 'MAH Shipment - advance case to Shipped / Closed',
    table: 'x_cog_mah_shipment',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: shipmentAfter,
})

BusinessRule({
    $id: Now.ID['br_ses_flag_before'],
    name: 'MAH SES flag request - validate and approval guard rails',
    table: 'x_cog_mah_ses_flag_request',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: sesFlagRequestBefore,
})

BusinessRule({
    $id: Now.ID['br_ses_flag_after'],
    name: 'MAH SES flag request - log and notify',
    table: 'x_cog_mah_ses_flag_request',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: sesFlagRequestAfter,
})

BusinessRule({
    $id: Now.ID['br_case_note_before'],
    name: 'MAH Case note - validate and stamp author',
    table: 'x_cog_mah_case_note',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: caseNoteBefore,
})

BusinessRule({
    $id: Now.ID['br_case_note_vendor_query'],
    name: 'MAH Case note - vendor isolation',
    table: 'x_cog_mah_case_note',
    when: 'before',
    action: ['query'],
    order: 50,
    script: caseNoteVendorQuery,
})

// ------------------------------------------------------------------ reference / intake tables

BusinessRule({
    $id: Now.ID['br_authorization_file_before'],
    name: 'MAH Authorization file - validate',
    table: 'x_cog_mah_authorization_file',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: authorizationFileBefore,
})

BusinessRule({
    $id: Now.ID['br_heraldic_item_before'],
    name: 'MAH Heraldic item - validate catalog entry',
    table: 'x_cog_mah_heraldic_item',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: heraldicItemBefore,
})

BusinessRule({
    $id: Now.ID['br_vendor_before'],
    name: 'MAH Vendor - validate CAGE code and contacts',
    table: 'x_cog_mah_vendor',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: vendorBefore,
})

BusinessRule({
    $id: Now.ID['br_vendor_query'],
    name: 'MAH Vendor - vendor sees own record only',
    table: 'x_cog_mah_vendor',
    when: 'before',
    action: ['query'],
    order: 50,
    script: vendorSelfQuery,
})

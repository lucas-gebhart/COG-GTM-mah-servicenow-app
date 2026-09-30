/**
 * Guard-rail business rules. Compared with v1 this file is shorter by design: no CaseNote,
 * HeraldicItem or Vendor rules (journals, cmdb_model and core_company are platform tables), no
 * aging recomputation (Task SLA) and no per-table `state` / `active` bookkeeping beyond the
 * one-line mapping from business stage to native task state.
 */
import { BusinessRule } from '@servicenow/sdk/core'
import { awardLineAfter, awardLineBefore } from '../../server/rules/awardLine'
import { awardsCaseAfter, awardsCaseBefore } from '../../server/rules/awardsCase'
import { engravingJobAfter, engravingJobBefore, sesFlagRequestAfter, sesFlagRequestBefore, shipmentAfter, shipmentBefore } from '../../server/rules/fulfilment'
import { heraldryRequestAfter, heraldryRequestBefore } from '../../server/rules/heraldryRequest'
import { authorizationFileBefore, catalogItemBefore, companyBefore } from '../../server/rules/reference'
import { requestLineAfter, requestLineBefore } from '../../server/rules/requestLine'
import { requesterAfter, requesterBefore } from '../../server/rules/requester'
import { companySelfQuery, heraldryRequestVendorQuery, requestLineVendorQuery, sesFlagRequestVendorQuery } from '../../server/rules/vendorIsolation'

// ------------------------------------------------------------------ awards case (task)

BusinessRule({
    $id: Now.ID['nbr_awards_case_before'],
    name: 'MAH Native Awards case - validate and stage guard rails',
    table: 'x_cog_mah_native_awards_case',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    description: 'Validates ship-to text, enforces forward-only stage transitions per role, stamps stage_entered_at and maps the MAH stage onto native task state / active / priority. Aging is the Task SLA engine, not this rule.',
    script: awardsCaseBefore,
})

BusinessRule({
    $id: Now.ID['nbr_awards_case_after'],
    name: 'MAH Native Awards case - cascade and notify on stage change',
    table: 'x_cog_mah_native_awards_case',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    description: 'Fires x_cog_mah_native.case.stage_changed, cascades Closed / Cancelled to award lines and writes the stage change to the activity stream (comments).',
    script: awardsCaseAfter,
})

// ------------------------------------------------------------------ award line

BusinessRule({
    $id: Now.ID['nbr_award_line_before'],
    name: 'MAH Native Award line - validate quantity and engraving',
    table: 'x_cog_mah_native_award_line',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: awardLineBefore,
})

BusinessRule({
    $id: Now.ID['nbr_award_line_after'],
    name: 'MAH Native Award line - roll up to case and queue engraving task',
    table: 'x_cog_mah_native_award_line',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    order: 100,
    script: awardLineAfter,
})

// ------------------------------------------------------------------ requester

BusinessRule({
    $id: Now.ID['nbr_requester_before'],
    name: 'MAH Native Requester - validate, display name and dedupe key',
    table: 'x_cog_mah_native_requester',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: requesterBefore,
})

BusinessRule({
    $id: Now.ID['nbr_requester_after'],
    name: 'MAH Native Requester - merge duplicates into survivor',
    table: 'x_cog_mah_native_requester',
    when: 'after',
    action: ['update'],
    order: 100,
    filterCondition: 'merged_intoISNOTEMPTY^merged_intoCHANGES^EQ',
    script: requesterAfter,
})

// ------------------------------------------------------------------ heraldry request (task)

BusinessRule({
    $id: Now.ID['nbr_heraldry_request_before'],
    name: 'MAH Native Heraldry request - DD 1348-6 validation and release lock',
    table: 'x_cog_mah_native_heraldry_request',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    description: 'Validates DODAAC / UIC / document number / priority, enforces the request state machine, requires the native approval before release and blocks header edits once released_to_vendor is set.',
    script: heraldryRequestBefore,
})

BusinessRule({
    $id: Now.ID['nbr_heraldry_request_after'],
    name: 'MAH Native Heraldry request - cascade lines and fire events',
    table: 'x_cog_mah_native_heraldry_request',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: heraldryRequestAfter,
})

BusinessRule({
    $id: Now.ID['nbr_heraldry_request_vendor_query'],
    name: 'MAH Native Heraldry request - vendor isolation by company',
    table: 'x_cog_mah_native_heraldry_request',
    when: 'before',
    action: ['query'],
    order: 50,
    description: 'An external vendor session (x_cog_mah_native.vendor without an internal role) sees only released requests whose task.company is the session user\'s sys_user.company.',
    script: heraldryRequestVendorQuery,
})

// ------------------------------------------------------------------ request line

BusinessRule({
    $id: Now.ID['nbr_request_line_before'],
    name: 'MAH Native Request line - catalog copy-down and extended price',
    table: 'x_cog_mah_native_request_line',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: requestLineBefore,
})

BusinessRule({
    $id: Now.ID['nbr_request_line_after'],
    name: 'MAH Native Request line - roll up request totals',
    table: 'x_cog_mah_native_request_line',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    order: 100,
    script: requestLineAfter,
})

BusinessRule({
    $id: Now.ID['nbr_request_line_vendor_query'],
    name: 'MAH Native Request line - vendor isolation by company',
    table: 'x_cog_mah_native_request_line',
    when: 'before',
    action: ['query'],
    order: 50,
    script: requestLineVendorQuery,
})

// ------------------------------------------------------------------ fulfilment tasks

BusinessRule({
    $id: Now.ID['nbr_engraving_job_before'],
    name: 'MAH Native Engraving job - stamp started / completed',
    table: 'x_cog_mah_native_engraving_job',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: engravingJobBefore,
})

BusinessRule({
    $id: Now.ID['nbr_engraving_job_after'],
    name: 'MAH Native Engraving job - advance case to Assembly/QC',
    table: 'x_cog_mah_native_engraving_job',
    when: 'after',
    action: ['update'],
    order: 100,
    filterCondition: 'stageCHANGESTOcomplete^EQ',
    script: engravingJobAfter,
})

BusinessRule({
    $id: Now.ID['nbr_shipment_before'],
    name: 'MAH Native Shipment - validate tracking and stamp dates',
    table: 'x_cog_mah_native_shipment',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: shipmentBefore,
})

BusinessRule({
    $id: Now.ID['nbr_shipment_after'],
    name: 'MAH Native Shipment - advance case to Shipped / Closed',
    table: 'x_cog_mah_native_shipment',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: shipmentAfter,
})

BusinessRule({
    $id: Now.ID['nbr_ses_flag_before'],
    name: 'MAH Native SES flag request - validate and approval guard rails',
    table: 'x_cog_mah_native_ses_flag_request',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: sesFlagRequestBefore,
})

BusinessRule({
    $id: Now.ID['nbr_ses_flag_after'],
    name: 'MAH Native SES flag request - log and notify',
    table: 'x_cog_mah_native_ses_flag_request',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    script: sesFlagRequestAfter,
})

BusinessRule({
    $id: Now.ID['nbr_ses_flag_vendor_query'],
    name: 'MAH Native SES flag request - vendor isolation by company',
    table: 'x_cog_mah_native_ses_flag_request',
    when: 'before',
    action: ['query'],
    order: 50,
    script: sesFlagRequestVendorQuery,
})

// ------------------------------------------------------------------ intake / catalog / company

BusinessRule({
    $id: Now.ID['nbr_authorization_file_before'],
    name: 'MAH Native Authorization file - validate',
    table: 'x_cog_mah_native_authorization_file',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: authorizationFileBefore,
})

BusinessRule({
    $id: Now.ID['nbr_catalog_item_before'],
    name: 'MAH Native Catalog model - validate NSN, price and lead time',
    table: 'x_cog_mah_native_catalog_item',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    script: catalogItemBefore,
})

BusinessRule({
    $id: Now.ID['nbr_company_before'],
    name: 'MAH Native Company - validate CAGE code and MAH contact columns',
    table: 'core_company',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    filterCondition: 'x_cog_mah_native_cage_codeISNOTEMPTY^ORx_cog_mah_native_legacy_unidISNOTEMPTY^ORx_cog_mah_native_agency_codeISNOTEMPTY^EQ',
    description: 'Only companies that carry the scoped MAH columns (vendors and source agencies) are validated; other companies are untouched.',
    script: companyBefore,
})

BusinessRule({
    $id: Now.ID['nbr_company_vendor_query'],
    name: 'MAH Native Company - vendor sees own company only',
    table: 'core_company',
    when: 'before',
    action: ['query'],
    order: 50,
    script: companySelfQuery,
})

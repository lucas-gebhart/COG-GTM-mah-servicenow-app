/**
 * Scripted REST API `/api/x_cog_mah/authorization_intake` — replaces the legacy
 * `ImportAuthorizationFile` agent (HRC / NPRC authorization files dropped into a Notes mail-in
 * database). POST is the intake; the GET resources expose reconciliation and status for
 * CSR tooling. Every route requires authentication, an application role (checked again inside
 * the handler) and the REST-endpoint ACL below.
 */
import '@servicenow/sdk/global'
import { Acl, RestApi } from '@servicenow/sdk/core'
import { authorizationIntake } from '../../server/rest/authorizationIntake'
import { caseStatus, health, migrationFinalize, reconciliationReport } from '../../server/rest/operations'
import { admin, csr, dla, tacomStaff } from '../security/roles.now'

export const intakeEndpointAcl = Acl({
    $id: Now.ID['acl_rest_intake'],
    name: 'authorization_intake',
    type: 'rest_endpoint',
    operation: 'execute',
    roles: [tacomStaff, csr, dla, admin],
    securityAttribute: 'user_is_authenticated',
    description: 'Only MAH staff, CSRs, DLA and application admins may call the intake / operations API.',
})

export const authorizationIntakeApi = RestApi({
    $id: Now.ID['rest_authorization_intake'],
    name: 'MAH Authorization Intake',
    serviceId: 'authorization_intake',
    shortDescription: 'HRC / NPRC authorization-file intake and MAH operations (reconciliation, case status, health).',
    consumes: 'application/json,text/csv,text/plain',
    produces: 'application/json',
    enforceAcl: [intakeEndpointAcl],
    active: true,
    versions: [
        {
            $id: Now.ID['rest_intake_v1'],
            version: 1,
            active: true,
            isDefault: true,
            shortDescription: 'Initial contract: JSON body or delimited text, idempotent on source record id and file hash.',
        },
    ],
    routes: [
        {
            $id: Now.ID['rest_intake_post'],
            name: 'Submit authorization file',
            method: 'POST',
            path: '/',
            version: 1,
            authentication: true,
            authorization: true,
            consumes: 'application/json,text/csv,text/plain',
            produces: 'application/json',
            enforceAcl: [intakeEndpointAcl],
            shortDescription: 'Validate an HRC/NPRC authorization file and create authorization_file + awards_case + award_line records (idempotent).',
            headers: [
                {
                    $id: Now.ID['rest_intake_hdr_file_name'],
                    name: 'X-File-Name',
                    required: false,
                    exampleValue: 'HRC_AUTH_2026-09-15.json',
                    shortDescription: 'Original file name (letters, digits, dot, dash, underscore, space; max 120).',
                },
            ],
            parameters: [
                {
                    $id: Now.ID['rest_intake_param_file_name'],
                    name: 'file_name',
                    required: false,
                    exampleValue: 'NPRC_BATCH_0917.txt',
                    shortDescription: 'Alternative to X-File-Name for clients that cannot set headers.',
                },
            ],
            requestExample:
                '{"source_agency":"HRC","file_name":"HRC_AUTH_2026-09-15.json","records":[{"source_record_id":"HRC-2026-000123","requester":{"type":"veteran","first_name":"Ada","last_name":"Lovelace","service_number_last4":"1234","zip":"48397"},"authorization_date":"2026-09-10","awards":[{"award":"army_commendation_medal","quantity":1,"engraving_text":"A. LOVELACE"}]}]}',
            script: authorizationIntake,
        },
        {
            $id: Now.ID['rest_reconciliation_get'],
            name: 'Reconciliation report',
            method: 'GET',
            path: '/reconciliation',
            version: 1,
            authentication: true,
            authorization: true,
            produces: 'application/json',
            enforceAcl: [intakeEndpointAcl],
            shortDescription: 'Target-side counts per table, award-line quantity total, orphans, merges, unmapped statuses, queue depths.',
            script: reconciliationReport,
        },
        {
            $id: Now.ID['rest_case_status_get'],
            name: 'Case status',
            method: 'GET',
            path: '/status/{number}',
            version: 1,
            authentication: true,
            authorization: true,
            produces: 'application/json',
            enforceAcl: [intakeEndpointAcl],
            shortDescription: 'Stage / aging / latest customer-visible note for one awards case (requires last4 or zip query parameter).',
            parameters: [
                {
                    $id: Now.ID['rest_status_param_last4'],
                    name: 'last4',
                    required: false,
                    exampleValue: '1234',
                    shortDescription: 'Last four digits of the service number.',
                },
                {
                    $id: Now.ID['rest_status_param_zip'],
                    name: 'zip',
                    required: false,
                    exampleValue: '48397',
                    shortDescription: 'Requester mailing ZIP (5 digits).',
                },
            ],
            script: caseStatus,
        },
        {
            $id: Now.ID['rest_migration_finalize_post'],
            name: 'Finalize migration batch',
            method: 'POST',
            path: '/migration/finalize',
            version: 1,
            authentication: true,
            authorization: true,
            consumes: 'application/json',
            produces: 'application/json',
            enforceAcl: [intakeEndpointAcl],
            shortDescription: 'After the staging loads of one batch: merge duplicate requesters by dedupe_key, recompute aging, return exception counts by type.',
            requestExample: '{"batch_id":"20260921-export"}',
            script: migrationFinalize,
        },
        {
            $id: Now.ID['rest_health_get'],
            name: 'Health',
            method: 'GET',
            path: '/health',
            version: 1,
            authentication: true,
            authorization: true,
            produces: 'application/json',
            enforceAcl: [intakeEndpointAcl],
            shortDescription: 'Liveness plus the last MAH Nightly Aging run summary.',
            script: health,
        },
    ],
})

/**
 * Scripted REST API `/api/x_cog_mah_native/mah_operations` — the only custom REST surface in v2.
 * Intake is the native Import Set API; this API exists for the two aggregate operations the
 * migration tooling needs (reconciliation counts, end-of-batch requester coalescing).
 */
import '@servicenow/sdk/global'
import { Acl, RestApi } from '@servicenow/sdk/core'
import { migrationFinalize, reconciliationReport } from '../../server/rest/operations'
import { admin, dla, tacomStaff } from '../security/roles.now'

export const opsEndpointAcl = Acl({
    $id: Now.ID['acl_rest_operations'],
    name: 'mah_operations',
    type: 'rest_endpoint',
    operation: 'execute',
    roles: [tacomStaff, dla, admin],
    securityAttribute: 'user_is_authenticated',
    description: 'Only MAH staff, DLA and application admins may call the operations API (reconciliation, migration finalize).',
})

export const operationsApi = RestApi({
    $id: Now.ID['rest_operations'],
    name: 'MAH Native Operations',
    serviceId: 'mah_operations',
    shortDescription: 'Migration reconciliation counts and end-of-batch requester coalescing for MAH Case Management (Native). Intake uses the Import Set API.',
    consumes: 'application/json',
    produces: 'application/json',
    enforceAcl: [opsEndpointAcl],
    active: true,
    versions: [
        {
            $id: Now.ID['rest_operations_v1'],
            version: 1,
            active: true,
            isDefault: true,
            shortDescription: 'Initial contract.',
        },
    ],
    routes: [
        {
            $id: Now.ID['rest_reconciliation_get'],
            name: 'Reconciliation report',
            method: 'GET',
            path: '/reconciliation',
            version: 1,
            authentication: true,
            authorization: true,
            produces: 'application/json',
            enforceAcl: [opsEndpointAcl],
            shortDescription: 'Target-side counts per table, award-line quantity and request-line price totals, orphans, merges, unmapped statuses, cases by stage / task state.',
            script: reconciliationReport,
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
            enforceAcl: [opsEndpointAcl],
            shortDescription: 'Coalesce duplicate requesters loaded by one batch (merged_into) and re-point their cases. Body: {"batch_id":"..."}.',
            requestExample: '{"batch_id":"20260930-full"}',
            script: migrationFinalize,
        },
    ],
})

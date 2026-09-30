/**
 * The one Scripted REST API v2 keeps (documented in NATIVE-VS-CUSTOM.md): two operational
 * resources that cannot be expressed as a Table / Import Set API call.
 *
 *   GET  /api/x_cog_mah_native/mah_operations/reconciliation      — target-side migration counts
 *   POST /api/x_cog_mah_native/mah_operations/migration/finalize  — end-of-batch requester
 *        coalescing (called by tools/migrate.ts). No aging recompute: the Task SLA engine owns aging.
 *
 * Intake itself is the native Import Set API (`POST /api/now/import/x_cog_mah_native_stg_authorization_line`),
 * case status is the record producer / Table API, health is the platform's own. Both resources
 * require an internal MAH role, answer with security headers and log data access as JSON.
 */
import { gs } from '@servicenow/glide'
import { coalesceRequesterTable } from '../migration/transformEngine.ts'
import { hasAnyRole, securityLog } from '../rules/glideSupport.ts'
import { RECONCILIATION_ROLES, buildReconciliationReport } from '../services/reconciliation.ts'
import { securityHeaders as headers, type RestResponse, writeError, writeJson } from './respond.ts'

export interface OpsRequest {
    body?: { dataString?: string }
    headers?: Record<string, string>
    queryParams?: Record<string, string[] | string>
    pathParams?: Record<string, string>
}
export type OpsResponse = RestResponse

const BATCH_ID_PATTERN = /^[A-Za-z0-9._-]{1,40}$/

function deny(response: OpsResponse, source: string, reference: string): void {
    securityLog({ event: 'authorization_failure', source, outcome: 'failure', reason: 'missing_role', details: { reference } })
    writeError(response, 403, reference)
}

export function reconciliationReport(_request: OpsRequest, response: OpsResponse): void {
    const reference = gs.generateGUID()
    headers(response)
    if (!hasAnyRole(RECONCILIATION_ROLES)) {
        deny(response, 'rest:reconciliation', reference)
        return
    }
    try {
        const report = buildReconciliationReport()
        securityLog({ event: 'data_access', source: 'rest:reconciliation', outcome: 'success', details: { reference, tables: report.tables.length } })
        writeJson(response, 200, report)
    } catch (err) {
        securityLog({ event: 'error', source: 'rest:reconciliation', outcome: 'failure', reason: String(err), details: { reference } })
        writeError(response, 500, reference)
    }
}

/** Parse and whitelist the batch id from a small JSON body; anything unexpected yields ''. */
export function parseBatchId(raw: string | undefined): string {
    const text = raw ?? ''
    if (text.length > 1024) return ''
    try {
        const parsed: unknown = text ? JSON.parse(text) : {}
        if (typeof parsed !== 'object' || parsed === null || !('batch_id' in parsed)) return ''
        const id = String((parsed as { batch_id: unknown }).batch_id)
        return BATCH_ID_PATTERN.test(id) ? id : ''
    } catch {
        return ''
    }
}

export function migrationFinalize(request: OpsRequest, response: OpsResponse): void {
    const reference = gs.generateGUID()
    headers(response)
    if (!hasAnyRole(['tacom_staff', 'admin'])) {
        deny(response, 'rest:migration_finalize', reference)
        return
    }
    const batchId = parseBatchId(request.body?.dataString)
    if (!batchId) {
        securityLog({ event: 'validation_failure', source: 'rest:migration_finalize', outcome: 'failure', reason: 'invalid_batch_id', details: { reference } })
        writeError(response, 400, reference)
        return
    }
    try {
        const merge = coalesceRequesterTable(batchId)
        securityLog({ event: 'admin_action', source: 'rest:migration_finalize', outcome: 'success', details: { reference, batchId, ...merge } })
        writeJson(response, 200, { batch_id: batchId, requesters: merge, reference })
    } catch (err) {
        securityLog({ event: 'error', source: 'rest:migration_finalize', outcome: 'failure', reason: String(err), details: { reference, batchId } })
        writeError(response, 500, reference)
    }
}

/**
 * Read-only operational endpoints on the same Scripted REST API as the authorization intake:
 *
 *   GET /api/x_cog_mah/authorization_intake/reconciliation  — target-side migration counts
 *   GET /api/x_cog_mah/authorization_intake/status/{number} — case status for CSR tooling
 *   GET /api/x_cog_mah/authorization_intake/health          — liveness + last aging run
 *
 * All three require an internal MAH role, answer with the same security headers as the
 * intake, and log data access as JSON.
 */
import { gs } from '@servicenow/glide'
import { hasAnyRole, securityLog } from '../rules/glideSupport'
import { buildReconciliationReport } from '../services/reconciliation'
import { lookupCaseStatus } from '../services/statusInquiry'
import type { IntakeRequest, IntakeResponse } from './authorizationIntake'

const GENERIC_ERROR = 'The request could not be processed.'

function headers(response: IntakeResponse): void {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', "default-src 'none'")
}

function pathParam(request: IntakeRequest, name: string): string {
    const v = request.pathParams?.[name]
    return v === undefined ? '' : String(v)
}

function queryParam(request: IntakeRequest, name: string): string {
    const v = request.queryParams?.[name]
    if (Array.isArray(v)) return String(v[0] ?? '')
    return v === undefined ? '' : String(v)
}

function deny(response: IntakeResponse, source: string, reference: string): void {
    securityLog({ event: 'authorization_failure', source, outcome: 'failure', reason: 'missing_role', details: { reference } })
    response.setStatus(403)
    response.setBody({ error: GENERIC_ERROR, reference })
}

export function reconciliationReport(_request: IntakeRequest, response: IntakeResponse): void {
    const reference = gs.generateGUID()
    headers(response)
    if (!hasAnyRole(['tacom_staff', 'dla', 'admin'])) {
        deny(response, 'rest:reconciliation', reference)
        return
    }
    try {
        const report = buildReconciliationReport()
        securityLog({ event: 'data_access', source: 'rest:reconciliation', outcome: 'success', details: { reference, tables: report.tables.length } })
        response.setStatus(200)
        response.setBody(report)
    } catch (err) {
        securityLog({ event: 'error', source: 'rest:reconciliation', outcome: 'failure', reason: String(err), details: { reference } })
        response.setStatus(500)
        response.setBody({ error: GENERIC_ERROR, reference })
    }
}

export function caseStatus(request: IntakeRequest, response: IntakeResponse): void {
    const reference = gs.generateGUID()
    headers(response)
    if (!hasAnyRole(['tacom_staff', 'csr', 'admin'])) {
        deny(response, 'rest:case_status', reference)
        return
    }
    const result = lookupCaseStatus({
        case_number: pathParam(request, 'number'),
        service_number_last4: queryParam(request, 'last4'),
        zip: queryParam(request, 'zip'),
    })
    response.setStatus(result.found ? 200 : 404)
    response.setBody({ ...result, reference })
}

export function health(_request: IntakeRequest, response: IntakeResponse): void {
    headers(response)
    if (!hasAnyRole(['tacom_staff', 'csr', 'dla', 'admin'])) {
        deny(response, 'rest:health', gs.generateGUID())
        return
    }
    response.setStatus(200)
    response.setBody({
        status: 'ok',
        aging_last_run: gs.getProperty('x_cog_mah.aging.last_run', ''),
        aging_last_summary: gs.getProperty('x_cog_mah.aging.last_summary', ''),
        amber_days: Number(gs.getProperty('x_cog_mah.aging.amber_days', '60')),
        red_days: Number(gs.getProperty('x_cog_mah.aging.red_days', '75')),
    })
}

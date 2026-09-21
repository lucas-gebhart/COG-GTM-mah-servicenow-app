/**
 * Structured (JSON) security/audit event formatting.
 *
 * Every authentication, authorization-failure, data-change and admin event is written
 * through `formatSecurityEvent` so log lines are machine-parseable and never contain
 * secrets, stack traces or raw user input. Values are truncated and stripped of control
 * characters before serialization.
 */

export type SecurityEventType =
    | 'authentication_success'
    | 'authentication_failure'
    | 'authorization_failure'
    | 'validation_failure'
    | 'data_access'
    | 'data_change'
    | 'data_change_blocked'
    | 'admin_action'
    | 'job_run'
    | 'intake_received'
    | 'intake_rejected'
    | 'intake_completed'
    | 'migration_exception'

export interface SecurityEvent {
    event: SecurityEventType
    timestamp: string
    app: 'x_cog_mah'
    user?: string
    source?: string
    table?: string
    record?: string
    outcome?: 'success' | 'failure' | 'blocked'
    reason?: string
    details?: Record<string, string | number | boolean | null>
}

const MAX_VALUE_LENGTH = 200
const SECRET_KEY = /pass(word|wd)?|secret|token|authorization|cookie|credential|api[-_]?key/i

/** Remove control characters and clamp length so log injection / log flooding is not possible. */
export function sanitizeLogValue(value: unknown, max = MAX_VALUE_LENGTH): string {
    const s = typeof value === 'string' ? value : value === undefined || value === null ? '' : JSON.stringify(value)
    // eslint-disable-next-line no-control-regex
    const clean = s.replace(/[\u0000-\u001f\u007f]/g, ' ')
    return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

export function redactDetails(details: Record<string, unknown> | undefined): Record<string, string | number | boolean | null> | undefined {
    if (!details) return undefined
    const out: Record<string, string | number | boolean | null> = {}
    for (const [k, v] of Object.entries(details)) {
        if (SECRET_KEY.test(k)) {
            out[k] = '[REDACTED]'
        } else if (typeof v === 'number' || typeof v === 'boolean' || v === null) {
            out[k] = v
        } else {
            out[k] = sanitizeLogValue(v)
        }
    }
    return out
}

export interface SecurityEventInput {
    event: SecurityEventType
    user?: string
    source?: string
    table?: string
    record?: string
    outcome?: SecurityEvent['outcome']
    reason?: string
    details?: Record<string, unknown>
}

export function buildSecurityEvent(input: SecurityEventInput, now: Date = new Date()): SecurityEvent {
    const ev: SecurityEvent = { event: input.event, timestamp: now.toISOString(), app: 'x_cog_mah' }
    if (input.user !== undefined) ev.user = sanitizeLogValue(input.user, 80)
    if (input.source !== undefined) ev.source = sanitizeLogValue(input.source, 80)
    if (input.table !== undefined) ev.table = sanitizeLogValue(input.table, 80)
    if (input.record !== undefined) ev.record = sanitizeLogValue(input.record, 40)
    if (input.outcome !== undefined) ev.outcome = input.outcome
    if (input.reason !== undefined) ev.reason = sanitizeLogValue(input.reason)
    const details = redactDetails(input.details)
    if (details) ev.details = details
    return ev
}

/** One-line JSON suitable for `gs.info` / `gs.warn`. */
export function formatSecurityEvent(input: SecurityEventInput, now: Date = new Date()): string {
    return JSON.stringify(buildSecurityEvent(input, now))
}

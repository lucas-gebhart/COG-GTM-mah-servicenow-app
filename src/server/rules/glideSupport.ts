/**
 * Thin Glide-aware helpers shared by business rules, jobs and REST handlers.
 *
 * Everything here is deliberately small: the decision logic lives in `../lib` (pure,
 * unit-tested) and this file only adapts GlideRecord / gs to those functions.
 */
import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { ROLES, type RoleKey } from '../lib/domain.ts'
import { formatSecurityEvent, type SecurityEventInput } from '../lib/logging.ts'
import { GENERIC_VALIDATION_MESSAGE, toSafeMultiline, type ValidationResult } from '../lib/validators.ts'

export type AnyRecord = GlideRecord<string>

export function nowValue(): string {
    return new GlideDateTime().getValue()
}

/** Role keys held by the session user (platform `admin` collapses to the app admin key). */
export function currentRoleKeys(): RoleKey[] {
    const keys: RoleKey[] = []
    for (const key of Object.keys(ROLES) as RoleKey[]) {
        if (gs.hasRole(ROLES[key])) keys.push(key)
    }
    if (gs.hasRole('admin') && !keys.includes('admin')) keys.push('admin')
    return keys
}

export function hasAnyRole(keys: readonly RoleKey[]): boolean {
    if (gs.hasRole('admin')) return true
    return keys.some((k) => gs.hasRole(ROLES[k]))
}

/** Emit a structured JSON security/audit event through gs.info (never raw input, never secrets). */
export function securityLog(input: SecurityEventInput): void {
    const withUser: SecurityEventInput = { ...input }
    if (withUser.user === undefined) withUser.user = gs.getUserName()
    gs.info(formatSecurityEvent(withUser))
}

/** Field names among `fields` whose value differs between current and previous. */
export function changedFields(current: AnyRecord, previous: AnyRecord | null | undefined, fields: readonly string[]): string[] {
    const out: string[] = []
    for (const f of fields) {
        const el = current.getElement(f)
        if (!el) continue
        if (previous === null || previous === undefined) {
            if (!el.nil()) out.push(f)
        } else if (el.changes()) {
            out.push(f)
        }
    }
    return out
}

export function setIfEmpty(gr: AnyRecord, field: string, value: string): void {
    const el = gr.getElement(field)
    if (el && el.nil()) gr.setValue(field, value)
}

export function str(gr: AnyRecord, field: string): string {
    const v = gr.getValue(field)
    return v === null || v === undefined ? '' : String(v)
}

export function int(gr: AnyRecord, field: string): number {
    const n = Number.parseInt(str(gr, field), 10)
    return Number.isFinite(n) ? n : 0
}

export function bool(gr: AnyRecord, field: string): boolean {
    return str(gr, field) === 'true' || str(gr, field) === '1'
}

/**
 * Abort the current operation with the generic user-facing message and a structured
 * log line carrying the field-level detail (detail never reaches the caller).
 */
export function abortWithValidation(current: AnyRecord, result: ValidationResult, table: string): void {
    for (const issue of result.issues) {
        const el = current.getElement(issue.field)
        if (el) el.setError(issue.message)
    }
    gs.addErrorMessage(GENERIC_VALIDATION_MESSAGE)
    securityLog({
        event: 'validation_failure',
        table,
        record: current.getUniqueValue(),
        outcome: 'blocked',
        details: {
            issueCount: result.issues.length,
            fields: result.issues.map((i) => i.field).join(','),
        },
    })
    current.setAbortAction(true)
}

export function abortWithMessage(current: AnyRecord, message: string, table: string, reason: string): void {
    gs.addErrorMessage(message)
    securityLog({ event: 'data_change_blocked', table, record: current.getUniqueValue(), outcome: 'blocked', reason })
    current.setAbortAction(true)
}

/** Parameterized count of child rows (never builds an encoded query from user input). */
export function countChildren(table: string, parentField: string, parentSysId: string, extra?: { field: string; operator: string; value: string }): number {
    const gr = new GlideRecord(table)
    gr.addQuery(parentField, parentSysId)
    if (extra) gr.addQuery(extra.field, extra.operator, extra.value)
    gr.query()
    return gr.getRowCount()
}

export function insertCaseNote(fields: { awards_case?: string; heraldry_request?: string; note_type: string; body: string; customer_visible?: boolean }): void {
    const note = new GlideRecord('x_cog_mah_case_note')
    note.initialize()
    if (fields.awards_case) note.setValue('awards_case', fields.awards_case)
    if (fields.heraldry_request) note.setValue('heraldry_request', fields.heraldry_request)
    note.setValue('note_type', fields.note_type)
    note.setValue('noted_at', nowValue())
    note.setValue('author', gs.getUserID())
    note.setValue('body', toSafeMultiline(fields.body, 4000))
    note.setValue('customer_visible', fields.customer_visible === true ? 'true' : 'false')
    note.setValue('state', 'open')
    if (!note.insert()) {
        securityLog({
            event: 'data_change_blocked',
            source: 'insertCaseNote',
            reason: 'system_note_rejected',
            outcome: 'failure',
            table: 'x_cog_mah_case_note',
            record: fields.awards_case ?? fields.heraldry_request ?? '',
            details: { note_type: fields.note_type },
        })
    }
}

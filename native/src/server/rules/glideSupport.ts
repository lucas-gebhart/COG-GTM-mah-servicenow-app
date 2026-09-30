/**
 * Thin Glide-aware helpers shared by business rules and UI-action handlers.
 *
 * Everything here is deliberately small: the decision logic lives in `../lib` (pure,
 * unit-tested) and this file only adapts GlideRecord / gs to those functions. The v1
 * `insertCaseNote` helper is gone: notes are native task journal entries (`work_notes` /
 * `comments`) written straight onto the task record.
 */
import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { MIGRATION_SESSION_FLAG, ROLES, TASK_PRIORITIES, TASK_PRIORITY_BY_HANDLING, taskStateForStage, type CasePriority, type RoleKey, type TaskTableKey } from '../lib/domain.ts'
import { formatSecurityEvent, type SecurityEventInput } from '../lib/logging.ts'
import { GENERIC_VALIDATION_MESSAGE, toSafeMultiline, type ValidationResult } from '../lib/validators.ts'

export type AnyRecord = GlideRecord<string>

/** True while the Import Set transform is loading legacy rows: guard rails step aside, platform engines still run. */
export function isMigrationImport(): boolean {
    return gs.getSession().getClientData(MIGRATION_SESSION_FLAG) === 'true'
}

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

/**
 * Native task lifecycle: derive `state`, `active` and (when the table carries one) `opened_at`
 * from the business `stage`. Replaces the per-table `state` / `active` choice bookkeeping in v1.
 */
export function applyTaskState(current: AnyRecord, table: TaskTableKey, stage: string): void {
    const s = taskStateForStage(table, stage)
    current.setValue('state', String(s.state))
    current.setValue('active', s.active ? 'true' : 'false')
    if (current.isNewRecord()) setIfEmpty(current, 'opened_at', nowValue())
    if (!s.active) setIfEmpty(current, 'closed_at', nowValue())
    else current.setValue('closed_at', '')
}

/** Native task priority (1-5) from the MAH handling priority choice. */
export function applyTaskPriority(current: AnyRecord, handlingField = 'handling_priority'): void {
    const handling = str(current, handlingField) as CasePriority
    const priority = TASK_PRIORITY_BY_HANDLING[handling] ?? TASK_PRIORITIES.moderate
    current.setValue('priority', String(priority))
}

export type JournalField = 'work_notes' | 'comments'

/** Write a journal entry onto the task being saved (before rules) — the native replacement for a CaseNote. */
export function journal(current: AnyRecord, field: JournalField, text: string): void {
    current.setValue(field, toSafeMultiline(text, 4000))
}

/** Write a journal entry onto another task by sys_id (after rules / cascades). */
export function journalOnTask(table: string, sysId: string, field: JournalField, text: string): void {
    if (!sysId) return
    const gr = new GlideRecord(table)
    if (!gr.get(sysId)) return
    gr.setValue(field, toSafeMultiline(text, 4000))
    gr.setWorkflow(false)
    gr.update()
}

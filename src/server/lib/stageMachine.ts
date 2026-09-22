/**
 * Guard rails for awards-case stage transitions and heraldry-request state transitions.
 *
 * Replaces the `QuerySave` LotusScript on the `AwardsCase` and `Request` forms and the
 * hidden `AllowedNext` computed-for-display fields on the XPages.
 */
import { CASE_STAGE_ORDER, RELEASED_TO_VENDOR_MESSAGE, REQUEST_STATE_ORDER, ROLES, TERMINAL_CASE_STAGES, TERMINAL_REQUEST_STATES, type CaseStage, type RequestState, type RoleKey } from './domain.ts'

export interface TransitionDecision {
    allowed: boolean
    reason?: string
}

const CASE_TERMINAL: ReadonlySet<CaseStage> = new Set<CaseStage>(TERMINAL_CASE_STAGES)

/** Roles permitted to move a case *into* a given stage. Admin and TACOM staff may do anything. */
export const CASE_STAGE_ROLES: Readonly<Record<CaseStage, readonly RoleKey[]>> = {
    authorized: ['csr', 'tacom_staff', 'admin'],
    engraving: ['csr', 'engraver', 'tacom_staff', 'admin'],
    assembly_qc: ['engraver', 'assembler', 'tacom_staff', 'admin'],
    warehouse: ['assembler', 'warehouse', 'tacom_staff', 'admin'],
    shipped: ['warehouse', 'tacom_staff', 'admin'],
    closed: ['warehouse', 'csr', 'tacom_staff', 'admin'],
    cancelled: ['csr', 'tacom_staff', 'admin'],
    unmapped: ['admin'],
}

export function nextCaseStage(stage: CaseStage): CaseStage | null {
    const i = CASE_STAGE_ORDER.indexOf(stage)
    if (i < 0 || i + 1 >= CASE_STAGE_ORDER.length) return null
    return CASE_STAGE_ORDER[i + 1] ?? null
}

export interface CaseTransitionContext {
    from: CaseStage
    to: CaseStage
    roles: readonly RoleKey[]
    /** Number of award lines not yet complete; a case cannot ship while lines are open. */
    openLines?: number
    hasShipment?: boolean
}

export function canTransitionCase(ctx: CaseTransitionContext): TransitionDecision {
    const { from, to } = ctx
    if (from === to) return { allowed: true }
    if (CASE_TERMINAL.has(from) && !ctx.roles.includes('admin')) {
        return { allowed: false, reason: `Case is ${from} and may only be reopened by an administrator` }
    }
    if (to === 'unmapped') return { allowed: false, reason: 'Unmapped is reserved for migration' }
    const allowedRoles = CASE_STAGE_ROLES[to]
    if (!ctx.roles.some((r) => allowedRoles.includes(r))) {
        return { allowed: false, reason: `Your role may not move a case to ${to}` }
    }
    if (to === 'cancelled' || ctx.roles.includes('admin')) return { allowed: true }
    if (from === 'unmapped') {
        // Migration repair: admins/TACOM may place an unmapped case anywhere.
        return ctx.roles.includes('admin') || ctx.roles.includes('tacom_staff')
            ? { allowed: true }
            : { allowed: false, reason: 'Unmapped cases are repaired by TACOM staff' }
    }
    const fromIdx = CASE_STAGE_ORDER.indexOf(from)
    const toIdx = CASE_STAGE_ORDER.indexOf(to)
    if (toIdx === fromIdx + 1) {
        if (to === 'shipped' && (ctx.openLines ?? 0) > 0) {
            return { allowed: false, reason: 'All award lines must be complete before the case can ship' }
        }
        if (to === 'closed' && ctx.hasShipment === false) {
            return { allowed: false, reason: 'A shipment record is required before closing' }
        }
        return { allowed: true }
    }
    if (toIdx === fromIdx - 1 && (ctx.roles.includes('tacom_staff') || ctx.roles.includes('admin'))) {
        return { allowed: true } // one-step rollback by supervisors (rework)
    }
    return { allowed: false, reason: `Cases advance one stage at a time (${from} → ${to} is not permitted)` }
}

// ---------------------------------------------------------------------------------------

const REQUEST_TERMINAL: ReadonlySet<RequestState> = new Set<RequestState>(TERMINAL_REQUEST_STATES)

/** Fields that stay editable after release (everything else is frozen). */
export const POST_RELEASE_EDITABLE_FIELDS: ReadonlySet<string> = new Set([
    'state',
    'work_notes',
    'vendor_notes',
    'tracking_number',
    'shipped',
    'delivered',
    'sys_updated_on',
    'sys_updated_by',
    'sys_mod_count',
])

export interface RequestTransitionContext {
    from: RequestState
    to: RequestState
    roles: readonly RoleKey[]
    lineCount?: number
    headerValid?: boolean
    hasVendor?: boolean
}

export const REQUEST_STATE_ROLES: Readonly<Record<RequestState, readonly RoleKey[]>> = {
    draft: ['csr', 'tacom_staff', 'dla', 'admin'],
    submitted: ['csr', 'tacom_staff', 'dla', 'admin'],
    in_review: ['tacom_staff', 'dla', 'admin'],
    released_to_vendor: ['tacom_staff', 'dla', 'admin'],
    in_production: ['vendor', 'tacom_staff', 'admin'],
    shipped: ['vendor', 'tacom_staff', 'admin'],
    complete: ['tacom_staff', 'dla', 'admin'],
    cancelled: ['csr', 'tacom_staff', 'dla', 'admin'],
    unmapped: ['admin'],
}

export function canTransitionRequest(ctx: RequestTransitionContext): TransitionDecision {
    const { from, to } = ctx
    if (from === to) return { allowed: true }
    if (REQUEST_TERMINAL.has(from) && !ctx.roles.includes('admin')) {
        return { allowed: false, reason: `Request is ${from} and may not be changed` }
    }
    if (to === 'unmapped') return { allowed: false, reason: 'Unmapped is reserved for migration' }
    if (!ctx.roles.some((r) => REQUEST_STATE_ROLES[to].includes(r))) {
        return { allowed: false, reason: `Your role may not move a request to ${to}` }
    }
    if (to === 'cancelled') {
        const fromIdx = REQUEST_STATE_ORDER.indexOf(from)
        if (fromIdx >= REQUEST_STATE_ORDER.indexOf('released_to_vendor') && !ctx.roles.includes('admin') && !ctx.roles.includes('dla')) {
            return { allowed: false, reason: RELEASED_TO_VENDOR_MESSAGE }
        }
        return { allowed: true }
    }
    if (from === 'unmapped') {
        return ctx.roles.includes('admin') || ctx.roles.includes('tacom_staff') ? { allowed: true } : { allowed: false, reason: 'Unmapped requests are repaired by TACOM staff' }
    }
    const fromIdx = REQUEST_STATE_ORDER.indexOf(from)
    const toIdx = REQUEST_STATE_ORDER.indexOf(to)
    if (toIdx !== fromIdx + 1) {
        if (to === 'draft' && from === 'submitted') return { allowed: true } // return to requester
        if (to === 'submitted' && from === 'in_review') return { allowed: true } // reviewer sends back
        return { allowed: false, reason: `Requests advance one state at a time (${from} → ${to} is not permitted)` }
    }
    if (to === 'submitted') {
        if (ctx.headerValid === false) return { allowed: false, reason: 'DD Form 1348-6 header is incomplete or invalid' }
        if ((ctx.lineCount ?? 0) < 1) return { allowed: false, reason: 'At least one request line is required before submitting' }
    }
    if (to === 'released_to_vendor' && ctx.hasVendor === false) {
        return { allowed: false, reason: 'A vendor must be selected before release' }
    }
    return { allowed: true }
}

/** Given the set of changed field names on a released request, return the offending fields. */
export function blockedPostReleaseEdits(changedFields: readonly string[]): string[] {
    return changedFields.filter((f) => !POST_RELEASE_EDITABLE_FIELDS.has(f))
}

/** Role keys from the role names a user holds (e.g. from gs.hasRole checks). */
export function roleKeysFromNames(names: readonly string[]): RoleKey[] {
    const out: RoleKey[] = []
    for (const [key, name] of Object.entries(ROLES) as [RoleKey, string][]) {
        if (names.includes(name)) out.push(key)
    }
    if (names.includes('admin') && !out.includes('admin')) out.push('admin')
    return out
}

/**
 * Requester deduplication key.
 *
 * The legacy database accumulated duplicate `Requester` documents because the XPage
 * created a new one on every status inquiry. The key below coalesces records that
 * describe the same person or unit: normalized last name + first initial + last 4 of
 * the service number + DOB, falling back to normalized e-mail, then unit name + ZIP.
 */

export interface RequesterIdentity {
    type?: string | null
    first_name?: string | null
    last_name?: string | null
    unit_name?: string | null
    service_number_last4?: string | null
    dob?: string | null
    email?: string | null
    zip?: string | null
}

const collapse = (v: string | null | undefined): string =>
    (v ?? '')
        .toUpperCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '')

const digits = (v: string | null | undefined): string => (v ?? '').replace(/\D/g, '')

/** Normalize DOB to YYYYMMDD digits regardless of source format. */
function normalizeDob(v: string | null | undefined): string {
    if (!v) return ''
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
    if (iso) return `${iso[1]}${iso[2]}${iso[3]}`
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(v)
    if (us) return `${us[3]}${(us[1] ?? '').padStart(2, '0')}${(us[2] ?? '').padStart(2, '0')}`
    return digits(v)
}

/**
 * Returns a stable key (max 100 chars) or '' when there is not enough identifying data.
 * Keys are prefixed with the strategy so a "unit" key can never collide with a "person" key.
 */
export function computeDedupeKey(r: RequesterIdentity): string {
    const type = collapse(r.type)
    if (type === 'UNIT') {
        const unit = collapse(r.unit_name)
        const zip = digits(r.zip).slice(0, 5)
        return unit ? `U:${unit}:${zip}` : ''
    }
    const last = collapse(r.last_name)
    const firstInitial = collapse(r.first_name).charAt(0)
    const last4 = digits(r.service_number_last4).slice(-4)
    const dob = normalizeDob(r.dob)
    if (last && (last4 || dob)) {
        return `P:${last}:${firstInitial}:${last4}:${dob}`
    }
    const email = (r.email ?? '').trim().toLowerCase()
    if (email) return `E:${email}`
    if (last && firstInitial && digits(r.zip)) return `Z:${last}:${firstInitial}:${digits(r.zip).slice(0, 5)}`
    return ''
}

export interface DedupeCandidate<T> {
    unid: string
    key: string
    /** Sort key: the survivor is the record with the greatest lastModified (ties → lowest UNID). */
    lastModified: string
    record: T
}

export interface DedupeResult<T> {
    survivors: DedupeCandidate<T>[]
    /** Duplicate → survivor UNID */
    mergedInto: Map<string, string>
}

/** Deterministic coalescing: newest record survives, all others point at it via `merged_into`. */
export function coalesceRequesters<T>(candidates: DedupeCandidate<T>[]): DedupeResult<T> {
    const groups = new Map<string, DedupeCandidate<T>[]>()
    const survivors: DedupeCandidate<T>[] = []
    for (const c of candidates) {
        if (!c.key) {
            survivors.push(c)
            continue
        }
        const g = groups.get(c.key)
        if (g) g.push(c)
        else groups.set(c.key, [c])
    }
    const mergedInto = new Map<string, string>()
    for (const g of groups.values()) {
        g.sort((a, b) => (a.lastModified === b.lastModified ? a.unid.localeCompare(b.unid) : a.lastModified < b.lastModified ? 1 : -1))
        const survivor = g[0]
        if (!survivor) continue
        survivors.push(survivor)
        for (const dup of g.slice(1)) mergedInto.set(dup.unid, survivor.unid)
    }
    return { survivors, mergedInto }
}

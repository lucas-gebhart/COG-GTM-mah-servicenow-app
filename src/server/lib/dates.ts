/**
 * Normalization of the mixed date formats found in the legacy Domino export.
 *
 * The HAAS export writes dates as whatever the Notes item held: ISO strings, US
 * `MM/DD/YYYY`, Notes `DD-MMM-YYYY`, `YYYYMMDD`, or `@Text(@Now)` style
 * `MM/DD/YYYY HH:MM:SS AM`. Everything is normalized to `YYYY-MM-DD` (date) or
 * `YYYY-MM-DD HH:mm:ss` (date/time, UTC) which is what glide_date / glide_date_time accept.
 */

const MONTHS: Readonly<Record<string, number>> = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    SEPT: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
}

export interface NormalizedDate {
    /** YYYY-MM-DD */
    date: string
    /** YYYY-MM-DD HH:mm:ss, always present (00:00:00 when the source carried no time) */
    dateTime: string
    /** Which input pattern matched; useful for reconciliation statistics. */
    pattern: 'iso' | 'iso_datetime' | 'us' | 'us_datetime' | 'notes' | 'compact' | 'epoch_ms'
}

const pad = (n: number, w = 2): string => String(n).padStart(w, '0')

function daysInMonth(y: number, m: number): number {
    return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

function build(y: number, m: number, d: number, hh: number, mm: number, ss: number, pattern: NormalizedDate['pattern']): NormalizedDate | null {
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) return null
    const date = `${pad(y, 4)}-${pad(m)}-${pad(d)}`
    return { date, dateTime: `${date} ${pad(hh)}:${pad(mm)}:${pad(ss)}`, pattern }
}

function parseTime(t: string | undefined, ampm: string | undefined): [number, number, number] | null {
    if (!t) return [0, 0, 0]
    const parts = t.split(':').map(Number)
    let hh = parts[0] ?? 0
    const mm = parts[1] ?? 0
    const ss = parts[2] ?? 0
    if (parts.some((p) => Number.isNaN(p))) return null
    if (ampm) {
        const up = ampm.toUpperCase()
        if (hh < 1 || hh > 12) return null
        if (up === 'PM' && hh !== 12) hh += 12
        if (up === 'AM' && hh === 12) hh = 0
    }
    return [hh, mm, ss]
}

/**
 * Returns `null` when the value cannot be interpreted; callers route those rows to the
 * migration exception table rather than guessing.
 */
export function normalizeLegacyDate(raw: unknown): NormalizedDate | null {
    if (raw === null || raw === undefined) return null
    if (typeof raw === 'number') {
        if (!Number.isFinite(raw) || raw < 0) return null
        const d = new Date(raw)
        return build(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 'epoch_ms')
    }
    if (typeof raw !== 'string') return null
    const s = raw.trim()
    if (s === '') return null

    // ISO date or date-time: 2024-03-07, 2024-03-07T14:05:00Z, 2024-03-07 14:05:00
    let m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(s)
    if (m) {
        const time = parseTime(m[4], undefined)
        if (!time) return null
        const hasTime = m[4] !== undefined
        if (hasTime && m[5] && m[5] !== 'Z') {
            // Offset supplied: convert to UTC via Date.
            const d = new Date(s)
            if (Number.isNaN(d.getTime())) return null
            return build(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 'iso_datetime')
        }
        return build(Number(m[1]), Number(m[2]), Number(m[3]), time[0], time[1], time[2], hasTime ? 'iso_datetime' : 'iso')
    }

    // US: 03/07/2024, 3/7/24, 03/07/2024 02:05:00 PM
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM|am|pm)?)?$/.exec(s)
    if (m) {
        let y = Number(m[3])
        if (y < 100) y += y >= 70 ? 1900 : 2000
        const time = parseTime(m[4], m[5])
        if (!time) return null
        return build(y, Number(m[1]), Number(m[2]), time[0], time[1], time[2], m[4] ? 'us_datetime' : 'us')
    }

    // Notes: 07-Mar-2024, 07-MAR-2024 14:05:00, 7 Mar 2024
    m = /^(\d{1,2})[- ]([A-Za-z]{3,4})[- ](\d{4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM|am|pm)?)?$/.exec(s)
    if (m) {
        const mon = MONTHS[(m[2] ?? '').toUpperCase()]
        if (!mon) return null
        const time = parseTime(m[4], m[5])
        if (!time) return null
        return build(Number(m[3]), mon, Number(m[1]), time[0], time[1], time[2], 'notes')
    }

    // Compact: 20240307 or 20240307140500
    m = /^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2}))?$/.exec(s)
    if (m) {
        return build(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0), 'compact')
    }

    return null
}

/** Whole days between two YYYY-MM-DD[ HH:mm:ss] strings (b - a), floored; never negative. */
export function daysBetween(a: string, b: string): number {
    const da = Date.parse(a.replace(' ', 'T') + (a.length === 10 ? 'T00:00:00Z' : 'Z'))
    const db = Date.parse(b.replace(' ', 'T') + (b.length === 10 ? 'T00:00:00Z' : 'Z'))
    if (Number.isNaN(da) || Number.isNaN(db)) return 0
    return Math.max(0, Math.floor((db - da) / 86_400_000))
}

/** Julian date (YDDD) for a given YYYY-MM-DD, as used in MILSTRIP document numbers. */
export function toJulianDate(isoDate: string): string {
    const d = new Date(`${isoDate}T00:00:00Z`)
    const start = Date.UTC(d.getUTCFullYear(), 0, 0)
    const doy = Math.floor((d.getTime() - start) / 86_400_000)
    return `${String(d.getUTCFullYear()).slice(-1)}${pad(doy, 3)}`
}

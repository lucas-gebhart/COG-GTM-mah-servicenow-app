/**
 * Request-line pricing. Replaces the `ExtendedPrice` computed field
 * (`@Round(Quantity * UnitPrice; 0.01)`) on the legacy `RequestLine` form.
 */

/** Extended price rounded half-up to cents; 0 for missing or non-finite inputs. */
export function computeExtendedPrice(quantity: unknown, unitPrice: unknown): number {
    const q = toNumber(quantity)
    const p = toNumber(unitPrice)
    if (q === null || p === null || q < 0 || p < 0) return 0
    return Math.round((q * p + Number.EPSILON) * 100) / 100
}

export function toNumber(v: unknown): number | null {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    if (typeof v === 'string') {
        const s = v.replace(/[$,\s]/g, '')
        if (s === '') return null
        const n = Number(s)
        return Number.isFinite(n) ? n : null
    }
    return null
}

export interface RequestTotals {
    lineCount: number
    totalQuantity: number
    totalExtended: number
}

export function totalRequestLines(lines: readonly { quantity: unknown; unit_price: unknown }[]): RequestTotals {
    let totalQuantity = 0
    let totalExtended = 0
    for (const l of lines) {
        totalQuantity += toNumber(l.quantity) ?? 0
        totalExtended += computeExtendedPrice(l.quantity, l.unit_price)
    }
    return { lineCount: lines.length, totalQuantity, totalExtended: Math.round(totalExtended * 100) / 100 }
}

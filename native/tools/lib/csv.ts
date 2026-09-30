/**
 * Minimal RFC 4180 CSV reader/writer with no dependencies. Handles quoted fields, doubled
 * quotes, embedded CR/LF inside quotes, CRLF/LF line endings and a UTF-8 BOM. Rows are kept
 * positional so repeated header names (see `sourceKey` in legacyContract.ts) are preserved.
 */

export interface ParsedCsv {
    header: string[]
    rows: string[][]
}

export function parseCsv(text: string): ParsedCsv {
    const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
    const rows: string[][] = []
    let row: string[] = []
    let field = ''
    let i = 0
    let quoted = false
    const n = src.length
    while (i < n) {
        const ch = src[i] as string
        if (quoted) {
            if (ch === '"') {
                if (src[i + 1] === '"') {
                    field += '"'
                    i += 2
                    continue
                }
                quoted = false
                i++
                continue
            }
            field += ch
            i++
            continue
        }
        if (ch === '"') {
            quoted = true
            i++
            continue
        }
        if (ch === ',') {
            row.push(field)
            field = ''
            i++
            continue
        }
        if (ch === '\r' || ch === '\n') {
            row.push(field)
            field = ''
            rows.push(row)
            row = []
            if (ch === '\r' && src[i + 1] === '\n') i++
            i++
            continue
        }
        field += ch
        i++
    }
    if (quoted) throw new Error('CSV ends inside a quoted field')
    if (field !== '' || row.length > 0) {
        row.push(field)
        rows.push(row)
    }
    const header = rows.shift() ?? []
    return { header, rows: rows.filter((r) => !(r.length === 1 && r[0] === '')) }
}

export function csvEscape(value: string): string {
    if (value === '') return ''
    if (/[",\r\n]/.test(value) || value !== value.trim()) return `"${value.replace(/"/g, '""')}"`
    return value
}

export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
    const lines = [header.map(csvEscape).join(',')]
    for (const r of rows) lines.push(r.map(csvEscape).join(','))
    return lines.join('\r\n') + '\r\n'
}

/** Positional row → object keyed by the (disambiguated) keys given, e.g. from `stagingColumnMap`. */
export function rowToObject(keys: readonly string[], row: readonly string[]): Record<string, string> {
    const out: Record<string, string> = {}
    keys.forEach((k, idx) => {
        out[k] = row[idx] ?? ''
    })
    return out
}

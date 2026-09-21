import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TABLES } from '../src/server/lib/domain'
import { LEGACY_FORMS, LOAD_ORDER, csvHeader, stagingColumnMap, type LegacyFormName } from '../src/server/lib/legacyContract'
import { compareReports, renderComparison, type TargetReport } from '../src/server/migration/compare'
import { dryRun } from '../src/server/migration/dryRun'
import { transformRow, type SourceRow } from '../src/server/migration/rowTransforms'
import { VALUE_MAPS, mapAwardName, mapRequisitionPriority } from '../src/server/migration/valueMaps'
import { parseCsv, rowToObject, toCsv } from '../tools/lib/csv'
import { MIGRATION_FILES, renderAll } from '../tools/generate-fluent-migration'
import { headerMismatch } from '../tools/lib/sourceExport'
import { parseArgs, stagingPayload } from '../tools/migrate'

const NOW = '2026-09-21 12:00:00'

/** Build a source row for `form` from a partial map; unspecified columns are ''. */
function row(form: LegacyFormName, values: Record<string, string>): SourceRow {
    const out: Record<string, string> = {}
    for (const c of stagingColumnMap(form)) out[c.key] = values[c.key] ?? ''
    for (const k of Object.keys(values)) if (!(k in out)) throw new Error(`${form}: unknown column ${k}`)
    return out
}

const UNID = (n: number): string => n.toString(16).toUpperCase().padStart(32, '0')

describe('value maps', () => {
    it('every declared choice is reachable from a legacy spelling or explicitly target-only (bidirectional)', () => {
        for (const m of VALUE_MAPS) {
            const choices = new Set(Object.keys(m.choices))
            const covered = new Set([...m.aliasTargets, ...m.targetOnly])
            expect([...choices].sort(), `${m.name}: choices without alias`).toEqual([...covered].sort())
            expect(m.aliasTargets.filter((t) => m.targetOnly.includes(t)), `${m.name}: targetOnly with alias`).toEqual([])
            for (const [alias, target] of m.aliases) expect(m.map(alias).value).toBe(target)
        }
    })

    it('unknown spellings are reported unmapped and fall back deterministically', () => {
        for (const m of VALUE_MAPS) {
            const r = m.map('zzz-not-a-legacy-value')
            expect(r.mapped).toBe(false)
            expect(r.value).toBe(m.fallback)
        }
    })

    it('RPD accepts 1..15 in any spelling and rejects the rest', () => {
        expect(mapRequisitionPriority('3')).toMatchObject({ value: '03', mapped: true })
        expect(mapRequisitionPriority('PD 12')).toMatchObject({ value: '12', mapped: true })
        expect(mapRequisitionPriority('16')).toMatchObject({ value: '', mapped: false })
    })

    it('award names map by HRC code, then by catalog label, then to other', () => {
        expect(mapAwardName('PH', '')).toMatchObject({ value: 'purple_heart', mapped: true })
        expect(mapAwardName('', 'Purple Heart')).toMatchObject({ value: 'purple_heart', mapped: true })
        expect(mapAwardName('XX', 'Unknown Ribbon')).toMatchObject({ value: 'other', mapped: false })
    })
})

describe('csv', () => {
    it('round-trips RFC 4180 quoting, CRLF, BOM and duplicate headers positionally', () => {
        const header = ['UNID', 'ParentUNID', 'Text', 'ParentUNID']
        const rows = [
            ['A', 'P1', 'plain', 'P1'],
            ['B', 'P2', 'has "quotes", commas\r\nand a newline', 'P3'],
            ['C', '', ' leading space', ''],
        ]
        const text = '\uFEFF' + toCsv(header, rows)
        const parsed = parseCsv(text)
        expect(parsed.header).toEqual(header)
        expect(parsed.rows).toEqual(rows)
        const keys = stagingColumnMap('AwardLine').map((c) => c.key)
        expect(keys).toContain('ParentUNID')
        expect(keys).toContain('ParentUNID_2')
        const obj = rowToObject(['UNID', 'ParentUNID', 'Text', 'ParentUNID_2'], rows[1] ?? [])
        expect(obj['ParentUNID']).toBe('P2')
        expect(obj['ParentUNID_2']).toBe('P3')
    })

    it('rejects a file that ends inside a quoted field', () => {
        expect(() => parseCsv('a,b\r\n"open,1')).toThrow(/quoted/)
    })

    it('header check names the first drifted column', () => {
        expect(headerMismatch('Vendor', csvHeader('Vendor'))).toBeNull()
        const drifted = [...csvHeader('Vendor')]
        drifted[8] = 'VendorLabel'
        expect(headerMismatch('Vendor', drifted)).toMatch(/column 9 is "VendorLabel", contract expects "VendorName"/)
        expect(headerMismatch('Vendor', drifted.slice(0, 5))).toMatch(/5 columns/)
    })
})

describe('row transforms', () => {
    it('flags disagreeing envelope / form ParentUNID on AwardLine and uses the envelope value', () => {
        const agree = transformRow('AwardLine', row('AwardLine', { UNID: UNID(1), ParentUNID: UNID(9), ParentUNID_2: UNID(9), LineStatus: 'Open', Quantity: '1', LineNumber: '1' }), { now: NOW })
        expect(agree.warnings.filter((w) => w.type === 'contradictory_source')).toEqual([])
        const disagree = transformRow('AwardLine', row('AwardLine', { UNID: UNID(2), ParentUNID: UNID(9), ParentUNID_2: UNID(8), LineStatus: 'Open', Quantity: '1', LineNumber: '1' }), { now: NOW })
        const w = disagree.warnings.filter((x) => x.type === 'contradictory_source')
        expect(w).toHaveLength(1)
        expect(w[0]?.field).toBe('awards_case')
        const parent = disagree.lookups.find((l) => l.field === 'awards_case')
        expect(parent).toMatchObject({ table: TABLES.awards_case, value: UNID(9), required: true })
    })

    it('preserves the raw status, maps it to the choice, and buckets unknown text as unmapped', () => {
        const mapped = transformRow('AwardsCase', row('AwardsCase', { UNID: UNID(3), CaseNumber: 'C-1', Stage: ' Assembly / QC ', EnteredDate: '2026-01-01' }), { now: NOW })
        expect(mapped.fields.legacy_status_raw).toBe('Assembly / QC')
        expect(mapped.fields.stage).toBe('assembly_qc')
        expect(mapped.statusMapped).toBe(true)
        const unknown = transformRow('AwardsCase', row('AwardsCase', { UNID: UNID(4), CaseNumber: 'C-2', Stage: 'Sent to Bob', EnteredDate: '2026-01-01' }), { now: NOW })
        expect(unknown.fields.stage).toBe('unmapped')
        expect(unknown.statusMapped).toBe(false)
        expect(unknown.warnings.map((w) => w.type)).toContain('unmapped_status')
    })

    it('recomputes request-line extended price from quantity × unit price and normalizes NIIN', () => {
        const line = transformRow('RequestLine', row('RequestLine', { UNID: UNID(5), ParentDocNumber: 'W81XYZ60010001', Quantity: '3', UnitPrice: '12.50', ExtendedPrice: '99.99', LineStatus: 'Open', ItemKey: 'HI-001', NSN: '8345-00-350-1669' }), { now: NOW })
        expect(line.fields.extended_price).toBe('37.50')
        expect(line.warnings.some((w) => w.type === 'contradictory_source' && w.field === 'extended_price')).toBe(true)
        const item = transformRow('HeraldicItem', row('HeraldicItem', { UNID: UNID(6), StockNumber: 'HI-001', ItemName: 'Guidon', Category: 'Guidon', UnitOfIssue: 'EA', UnitPrice: '10', Active: 'Yes', NIIN: '00-350-1669' }), { now: NOW })
        expect(item.fields.niin).toBe('003501669')
    })

    it('every transform reads only contract columns and writes legacy identity fields', () => {
        for (const form of LOAD_ORDER) {
            const t = transformRow(form, row(form, { UNID: UNID(7) }), { now: NOW })
            const known = new Set(stagingColumnMap(form).map((c) => c.key))
            for (const h of t.headersRead) expect(known.has(h), `${form} reads ${h}`).toBe(true)
            expect(t.fields.legacy_unid).toBe(UNID(7))
            expect(t.fields.legacy_form).toBe(LEGACY_FORMS[form].legacyForm)
            expect(t.targetTable).toBe(LEGACY_FORMS[form].targetTable)
        }
    })
})

describe('dry run + comparison', () => {
    const sources = {
        Vendor: [row('Vendor', { UNID: UNID(10), VendorKey: '1ABC5', VendorName: 'Flag Works', Active: 'Yes', VendorUsers: 'vendor.flagworks' })],
        Requester: [
            row('Requester', { UNID: UNID(20), RequesterID: 'R-1', FirstName: 'Ann', LastName: 'Lee', Email: 'ann@example.mil', Relationship: 'Veteran', Modified: '2026-01-02' }),
            row('Requester', { UNID: UNID(21), RequesterID: 'R-2', FirstName: 'Ann', LastName: 'Lee', Email: 'ANN@example.mil', Relationship: 'Veteran', Modified: '2026-01-05' }),
            row('Requester', { UNID: UNID(22), RequesterID: 'R-3', FirstName: 'Bo', LastName: 'Cruz', Email: 'bo@example.mil', Relationship: 'Next of Kin', Modified: '2026-01-05' }),
        ],
        AwardsCase: [
            row('AwardsCase', { UNID: UNID(30), CaseNumber: 'C-1', Stage: 'Engraving', EnteredDate: '2026-01-01', RequesterKey: 'R-1' }),
            row('AwardsCase', { UNID: UNID(31), CaseNumber: 'C-1', Stage: 'Closed', ClosedDate: '2026-02-01', EnteredDate: '2026-01-01', RequesterKey: 'R-9' }),
            row('AwardsCase', { UNID: UNID(32), CaseNumber: 'C-3', Stage: 'Lost in mail', EnteredDate: '2026-01-01' }),
        ],
        AwardLine: [
            row('AwardLine', { UNID: UNID(40), ParentUNID: UNID(30), ParentUNID_2: UNID(30), Quantity: '2', LineStatus: 'Open', LineNumber: '1' }),
            row('AwardLine', { UNID: UNID(41), ParentUNID: UNID(30), ParentUNID_2: UNID(31), Quantity: '3', LineStatus: 'Open', LineNumber: '2' }),
            row('AwardLine', { UNID: UNID(42), ParentUNID: UNID(99), ParentUNID_2: UNID(99), Quantity: '5', LineStatus: 'Open', LineNumber: '1' }),
        ],
    }

    it('replays the engine decisions: orphans, duplicate keys, merges, unmapped statuses, totals', () => {
        const r = dryRun({ sources, now: NOW })
        expect(r.source_rows).toBe(10)
        expect(r.expected.tables).toEqual({
            [TABLES.vendor]: 1,
            [TABLES.requester]: 3,
            [TABLES.awards_case]: 3,
            [TABLES.award_line]: 2,
        })
        expect(r.expected.orphan_count).toBe(1)
        expect(r.expected.award_line_quantity_total).toBe(5)
        expect(r.expected.duplicate_merge_count).toBe(1)
        expect(r.expected.unmapped_status_count).toBe(1)
        expect(r.expected.exception_counts['duplicate_business_key']).toBe(1)
        expect(r.expected.exception_counts['contradictory_source']).toBe(1)
        expect(r.expected.exception_counts['invalid_reference']).toBe(1) // C-1 #2 → requester R-9
        expect(r.expected.cases_by_stage).toMatchObject({ engraving: 1, closed: 1, unmapped: 1 })
        const lines = r.forms.find((f) => f.form === 'AwardLine')
        expect(lines).toMatchObject({ rows: 3, loaded: 2, quarantined: 1 })
    })

    it('comparison passes on an identical target and names each differing check', () => {
        const r = dryRun({ sources, now: NOW })
        const target: TargetReport = {
            tables: Object.entries(r.expected.tables).map(([table, rows]) => ({ table, rows })),
            award_line_quantity_total: r.expected.award_line_quantity_total,
            request_line_extended_price_total: r.expected.request_line_extended_price_total,
            orphan_count: r.expected.orphan_count,
            duplicate_merge_count: r.expected.duplicate_merge_count,
            unmapped_status_count: r.expected.unmapped_status_count,
            exception_counts: r.expected.exception_counts,
            cases_by_stage: r.expected.cases_by_stage,
            requests_by_state: r.expected.requests_by_state,
        }
        expect(compareReports(r.expected, target).ok).toBe(true)
        const broken = { ...target, orphan_count: 0, tables: target.tables.map((t) => (t.table === TABLES.award_line ? { ...t, rows: 3 } : t)) }
        const cmp = compareReports(r.expected, broken)
        expect(cmp.ok).toBe(false)
        expect(cmp.checks.filter((c) => !c.ok).map((c) => c.check)).toEqual([`rows:${TABLES.award_line}`, 'orphan_count'])
        expect(renderComparison(cmp)).toMatch(/2 of \d+ checks differ/)
    })
})

describe('migrate CLI', () => {
    it('builds the Import Set payload from staging columns plus batch traceability', () => {
        const file = { form: 'AwardLine' as const, file: LEGACY_FORMS.AwardLine.csvFile, path: '/x', rows: [] }
        const payload = stagingPayload(file, row('AwardLine', { UNID: UNID(1), ParentUNID: UNID(9), ParentUNID_2: UNID(8) }), 2, 'b-1')
        expect(payload['unid']).toBe(UNID(1))
        expect(payload['parent_unid']).toBe(UNID(9))
        expect(payload['parent_unid_2']).toBe(UNID(8))
        expect(payload).toMatchObject({ mah_batch_id: 'b-1', mah_source_row: '2', mah_source_file: 'vetmedals-AwardLine.csv' })
    })

    it('validates batch id, chunk size and form names', () => {
        expect(() => parseArgs(['--batch-id', 'bad id'])).toThrow(/batch-id/)
        expect(() => parseArgs(['--chunk', '5000'])).toThrow(/chunk/)
        expect(() => parseArgs(['--forms', 'Nope'])).toThrow(/unknown legacy form/)
        expect(parseArgs(['--batch-id', 'b.1', '--forms', 'Vendor,Request']).forms).toEqual(['Vendor', 'Request'])
    })
})

describe('generated Fluent migration metadata', () => {
    it('is in sync with the contract (run `npm run gen:migration` after changing legacyContract/statusMap/rowTransforms)', () => {
        const rendered = renderAll()
        for (const [key, path] of Object.entries(MIGRATION_FILES) as [keyof typeof MIGRATION_FILES, string][]) {
            expect(readFileSync(path, 'utf8'), path).toBe(rendered[key])
        }
    })

    it('declares one staging table, data source and transform map per legacy form', () => {
        const staging = readFileSync(MIGRATION_FILES.stagingTables, 'utf8')
        const maps = readFileSync(MIGRATION_FILES.transformMaps, 'utf8')
        for (const form of LOAD_ORDER) {
            const c = LEGACY_FORMS[form]
            expect(staging).toContain(`name: '${c.stagingTable}'`)
            expect(maps).toContain(`sourceTable: '${c.stagingTable}'`)
            expect(maps).toContain(`targetTable: '${c.targetTable}'`)
            expect(maps).toContain(`onBefore('${form}'`)
        }
    })
})

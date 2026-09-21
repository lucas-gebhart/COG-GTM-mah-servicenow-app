import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    auditSampleData,
    DEFAULT_CLOCK,
    DEFAULT_SEED,
    generate,
    parseSampleFiles,
    README_FILE,
    renderReadme,
    SAMPLE_DIR,
    dateColumns,
} from '../tools/generate-sample-data'
import { parseCsv, rowToObject } from '../tools/lib/csv'
import { csvHeader, LEGACY_FORMS, LOAD_ORDER, sourceKey, stagingColumnMap, type LegacyFormName } from '../src/server/lib/legacyContract'
import { mapLegacyStatus } from '../src/server/lib/statusMap'
import { daysBetween, normalizeLegacyDate } from '../src/server/lib/dates'
import { computeDedupeKey } from '../src/server/lib/dedupe'
import { computeAgingFlag, TERMINAL_STAGES } from '../src/server/lib/aging'
import { LIMITS, type CaseStage } from '../src/server/lib/domain'

/** Exact row count per file. Change deliberately when the generator changes. */
const CONTROL_TOTALS: Record<LegacyFormName, number> = {
    AwardsCase: 50,
    AwardLine: 120,
    Requester: 45,
    AuthorizationFile: 4,
    EngravingJob: 15,
    ShipmentRecord: 40,
    CaseNote: 30,
    Request: 30,
    RequestLine: 75,
    HeraldicItem: 15,
    Vendor: 6,
    SESFlagRequest: 5,
    HeraldryRequester: 20,
}

/** Exact number of rows per status-bearing form whose status is NOT in DEFAULT_STATUS_MAP. */
const UNMAPPED_STATUS_ROWS: Partial<Record<LegacyFormName, number>> = {
    AuthorizationFile: 1,
    AwardsCase: 3,
    AwardLine: 2,
    EngravingJob: 2,
    ShipmentRecord: 2,
    Request: 2,
    RequestLine: 2,
    SESFlagRequest: 1,
}

/** Exact orphan rows per child form (parent reference that does not resolve). */
const ORPHANS: Record<string, number> = {
    AwardLine: 3,
    EngravingJob: 1,
    ShipmentRecord: 1,
    CaseNote: 0,
    RequestLine: 2,
}

const UNID_RE = /^[0-9A-F]{32}$/

type Keyed = Record<string, string>
interface Parsed {
    header: string[]
    rows: Keyed[]
}

const files = generate()
const clockIso = new Date(DEFAULT_CLOCK).toISOString().slice(0, 19).replace('T', ' ')

/** Independent re-read: contract keys + shared RFC 4180 parser, no generator bookkeeping. */
function reread(form: LegacyFormName): Parsed {
    const text = files[LEGACY_FORMS[form].csvFile]
    if (text === undefined) throw new Error(`missing ${LEGACY_FORMS[form].csvFile}`)
    const parsed = parseCsv(text)
    const keys = stagingColumnMap(form).map((c) => c.key)
    return { header: parsed.header, rows: parsed.rows.map((r) => rowToObject(keys, r)) }
}
const data = Object.fromEntries(LOAD_ORDER.map((f) => [f, reread(f)])) as Record<LegacyFormName, Parsed>
const cell = (r: Keyed, k: string): string => r[k] ?? ''

describe('sample-data file set', () => {
    it('generate() returns exactly one CSV per LEGACY_FORMS entry', () => {
        const expected = LOAD_ORDER.map((f) => LEGACY_FORMS[f].csvFile).sort()
        expect(Object.keys(files).sort()).toEqual(expected)
        expect(expected).toHaveLength(13)
    })

    it('sample-data/ on disk has every contract file, the README, and nothing else', () => {
        const onDisk = readdirSync(SAMPLE_DIR).sort()
        const expected = [...LOAD_ORDER.map((f) => LEGACY_FORMS[f].csvFile), README_FILE].sort()
        expect(onDisk).toEqual(expected)
    })

    it('files on disk are byte-identical to a fresh generation (run npm run gen:sample-data)', () => {
        for (const form of LOAD_ORDER) {
            const name = LEGACY_FORMS[form].csvFile
            expect(readFileSync(join(SAMPLE_DIR, name), 'utf8'), name).toBe(files[name])
        }
        expect(readFileSync(join(SAMPLE_DIR, README_FILE), 'utf8')).toBe(renderReadme(auditSampleData(files)))
    })

    it('every header equals csvHeader(form) exactly, including the repeated ParentUNID', () => {
        for (const form of LOAD_ORDER) {
            expect(data[form].header, form).toEqual([...csvHeader(form)])
        }
        const dup = (form: LegacyFormName): number => data[form].header.filter((h) => h === 'ParentUNID').length
        expect(dup('AwardLine')).toBe(2)
        expect(dup('CaseNote')).toBe(2)
        expect(dup('RequestLine')).toBe(1)
    })

    it('every row has exactly as many cells as the header', () => {
        for (const form of LOAD_ORDER) {
            const text = files[LEGACY_FORMS[form].csvFile] ?? ''
            const parsed = parseCsv(text)
            for (const row of parsed.rows) expect(row, form).toHaveLength(parsed.header.length)
        }
    })

    it('control totals match the literal table', () => {
        const actual = Object.fromEntries(LOAD_ORDER.map((f) => [f, data[f].rows.length]))
        expect(actual).toEqual(CONTROL_TOTALS)
    })
})

describe('identifiers and references', () => {
    it('every UNID is 32 uppercase hex and unique across the whole set', () => {
        const all = LOAD_ORDER.flatMap((f) => data[f].rows.map((r) => cell(r, 'UNID')))
        expect(all).toHaveLength(Object.values(CONTROL_TOTALS).reduce((a, b) => a + b, 0))
        for (const u of all) expect(u).toMatch(UNID_RE)
        expect(new Set(all).size).toBe(all.length)
    })

    it('NoteIDs, LastUpdatedBy and ACL role lists follow the Notes conventions', () => {
        for (const form of LOAD_ORDER) {
            for (const r of data[form].rows) {
                expect(cell(r, 'NoteID'), form).toMatch(/^NT\d{6}$/)
                expect(cell(r, 'LastUpdatedBy'), form).toMatch(/^CN=([A-Z][a-z]+ [A-Z][A-Za-z'-]+\/OU=(CHPSID\/O=TACOM|Units\/O=Army)|[A-Za-z0-9-]+\/OU=Agents\/O=TACOM)$/)
                for (const col of ['DocReaders', 'DocAuthors']) {
                    if (!(col in r) || cell(r, col) === '') continue
                    for (const t of cell(r, col).split(';')) expect(t, `${form}.${col}`).toMatch(/^(\[[A-Za-z_]+\]|[A-Za-z0-9][A-Za-z0-9-]*|CN=[^/]+\/(OU=[^/]+\/)?O=[^/]+)$/)
                }
            }
        }
    })

    it('domain identifiers are realistic: award codes, NSNs, DODAACs, UICs, document numbers, CAGE codes', () => {
        const awardCodes = new Set(data.AwardLine.rows.map((r) => cell(r, 'AwardCode')))
        expect(awardCodes.size).toBeGreaterThanOrEqual(10)
        for (const r of data.HeraldicItem.rows) {
            expect(cell(r, 'StockNumber')).toMatch(/^8345-\d{2}-\d{3}-\d{4}$/)
            expect(cell(r, 'StockNumber')).toBe(`${cell(r, 'FSC')}-${cell(r, 'NIIN')}`)
        }
        for (const r of data.RequestLine.rows) expect(cell(r, 'NSN')).toMatch(/^8345-\d{2}-\d{3}-\d{4}$/)
        for (const r of data.HeraldryRequester.rows) {
            expect(cell(r, 'DODAAC')).toMatch(/^W[A-Z0-9]{5}$/)
            expect(cell(r, 'UIC')).toMatch(/^W[A-Z0-9]{5}$/)
        }
        for (const r of data.Request.rows) {
            const doc = cell(r, 'DocumentNumber')
            if (doc !== '') expect(doc).toMatch(/^W[A-Z0-9]{5}\d{4}\d{4}$/)
        }
        for (const r of data.Vendor.rows) expect(cell(r, 'VendorKey'), 'VendorKey is the CAGE code').toMatch(/^[A-Z0-9]{5}$/)
    })

    it('non-orphan parent references resolve, orphan counts are exact', () => {
        const orphans: Record<string, number> = {}
        for (const form of LOAD_ORDER) {
            const parent = LEGACY_FORMS[form].parent
            if (!parent) continue
            const parentKey = parent.by === 'unid' ? 'UNID' : (LEGACY_FORMS[parent.parentForm].businessKey ?? 'UNID')
            const parents = new Set(data[parent.parentForm].rows.map((p) => cell(p, parentKey)))
            const missing = data[form].rows.filter((r) => !parents.has(cell(r, parent.column)))
            orphans[form] = missing.length
            for (const r of missing) expect(cell(r, parent.column), `${form} orphan must still carry a reference`).not.toBe('')
        }
        expect(orphans).toEqual(ORPHANS)
    })

    it('business-key references (case numbers, items, requesters) resolve for non-orphans', () => {
        const caseByUnid = new Map(data.AwardsCase.rows.map((c) => [cell(c, 'UNID'), c]))
        for (const l of data.AwardLine.rows) {
            const c = caseByUnid.get(cell(l, 'ParentUNID'))
            if (c) expect(cell(l, 'ParentCaseNumber')).toBe(cell(c, 'CaseNumber'))
        }
        const itemKeys = new Set(data.HeraldicItem.rows.map((i) => cell(i, 'StockNumber')))
        for (const l of data.RequestLine.rows) expect(itemKeys.has(cell(l, 'ItemKey')), cell(l, 'ItemKey')).toBe(true)
        const requesterIds = new Set(data.Requester.rows.map((r) => cell(r, 'RequesterID')))
        for (const c of data.AwardsCase.rows) expect(requesterIds.has(cell(c, 'RequesterKey')), cell(c, 'CaseNumber')).toBe(true)
        for (const r of data.Requester.rows) {
            const merged = cell(r, 'MergedInto')
            if (merged !== '') expect(requesterIds.has(merged)).toBe(true)
        }
    })

    it('exactly 2 AwardLine rows disagree between the envelope and form ParentUNID columns; CaseNote rows agree', () => {
        const second = sourceKey('ParentUNID', 2)
        const disagree = (form: LegacyFormName): Keyed[] => data[form].rows.filter((r) => cell(r, second) !== cell(r, 'ParentUNID'))
        const lines = disagree('AwardLine')
        expect(lines).toHaveLength(2)
        const caseUnids = new Set(data.AwardsCase.rows.map((c) => cell(c, 'UNID')))
        for (const l of lines) {
            expect(caseUnids.has(cell(l, 'ParentUNID'))).toBe(true)
            expect(caseUnids.has(cell(l, second))).toBe(true)
        }
        expect(disagree('CaseNote')).toHaveLength(0)
        for (const r of data.CaseNote.rows) expect(cell(r, second)).toMatch(UNID_RE)
    })

    it('duplicate business keys: one CaseNumber and one LineKey are each shared by two rows', () => {
        const dupes = (form: LegacyFormName): [string, number][] => {
            const col = LEGACY_FORMS[form].businessKey
            if (col === undefined) throw new Error(`${form} has no business key`)
            const seen = new Map<string, number>()
            for (const r of data[form].rows) seen.set(cell(r, col), (seen.get(cell(r, col)) ?? 0) + 1)
            return [...seen.entries()].filter(([, n]) => n > 1)
        }
        expect(dupes('AwardsCase')).toEqual([['VMA-2013-000001', 2]])
        expect(dupes('AwardLine')).toEqual([['VMA-2024-000001|01', 2]])
        const dupCases = data.AwardsCase.rows.filter((c) => cell(c, 'CaseNumber') === 'VMA-2013-000001')
        expect(new Set(dupCases.map((c) => cell(c, 'UNID'))).size).toBe(2)
        for (const form of ['Requester', 'HeraldryRequester', 'Request', 'RequestLine', 'HeraldicItem', 'Vendor', 'AuthorizationFile', 'EngravingJob', 'ShipmentRecord', 'SESFlagRequest'] as const) {
            if (LEGACY_FORMS[form].businessKey !== undefined) expect(dupes(form), form).toEqual([])
        }
    })

    it('one VendorKey used by a Request and its lines is absent from the Vendor file', () => {
        const vendors = new Set(data.Vendor.rows.map((v) => cell(v, 'VendorKey')))
        const missingReq = data.Request.rows.filter((r) => cell(r, 'VendorKey') !== '' && !vendors.has(cell(r, 'VendorKey')))
        const missingLine = data.RequestLine.rows.filter((r) => cell(r, 'VendorKey') !== '' && !vendors.has(cell(r, 'VendorKey')))
        expect(missingReq).toHaveLength(1)
        expect(missingLine).toHaveLength(4)
        expect(new Set([...missingReq, ...missingLine].map((r) => cell(r, 'VendorKey')))).toEqual(new Set(['1K7Q3']))
        for (const r of data.SESFlagRequest.rows) if (cell(r, 'VendorKey') !== '') expect(vendors.has(cell(r, 'VendorKey'))).toBe(true)
        const unknownApproved = data.HeraldicItem.rows.flatMap((r) => cell(r, 'ApprovedVendors').split(';').filter((v) => v !== '' && !vendors.has(v)))
        expect(unknownApproved).toEqual(['1K7Q3'])
    })
})

describe('status values (mapLegacyStatus)', () => {
    it('unmapped-status row counts per form are exact', () => {
        const actual: Partial<Record<LegacyFormName, number>> = {}
        for (const form of LOAD_ORDER) {
            const col = LEGACY_FORMS[form].statusColumn
            if (col === undefined) continue
            actual[form] = data[form].rows.filter((r) => !mapLegacyStatus(form, cell(r, col)).mapped).length
        }
        expect(actual).toEqual(UNMAPPED_STATUS_ROWS)
    })

    it('the mixed spellings the status map is built for all appear and map', () => {
        const stages = new Set(data.AwardsCase.rows.map((r) => cell(r, 'Stage')))
        for (const s of ['Closed', 'CLOSED', 'closed ', 'Assembly/QC', 'Assembly - QC', 'AUTH', 'In Engraving', 'Ready to Ship', 'CXL']) {
            expect(stages.has(s), s).toBe(true)
            expect(mapLegacyStatus('AwardsCase', s).mapped, s).toBe(true)
        }
        expect(mapLegacyStatus('AwardsCase', 'Closed').value).toBe(mapLegacyStatus('AwardsCase', 'closed ').value)
        expect(stages.has('Assy-QC')).toBe(true)
        const statuses = new Set(data.Request.rows.map((r) => cell(r, 'Status')))
        for (const s of ['Under Review', 'In Review', 'Draft', 'Released to Vendor', 'COMPLETE', 'Complete ']) {
            expect(statuses.has(s), s).toBe(true)
            expect(mapLegacyStatus('Request', s).mapped, s).toBe(true)
        }
        expect(mapLegacyStatus('Request', 'Under Review').value).toBe(mapLegacyStatus('Request', 'In Review').value)
    })

    it('every major status-bearing form has at least 2 unmapped rows and 5 distinct spellings', () => {
        for (const form of ['AwardsCase', 'AwardLine', 'EngravingJob', 'ShipmentRecord', 'Request', 'RequestLine'] as const) {
            expect(UNMAPPED_STATUS_ROWS[form] ?? 0, form).toBeGreaterThanOrEqual(2)
            const col = LEGACY_FORMS[form].statusColumn ?? ''
            expect(new Set(data[form].rows.map((r) => cell(r, col))).size, form).toBeGreaterThanOrEqual(5)
        }
    })
})

describe('dates (normalizeLegacyDate)', () => {
    const observed = (): { patterns: Record<string, number>; bad: string[] } => {
        const patterns: Record<string, number> = {}
        const bad: string[] = []
        for (const form of LOAD_ORDER) {
            for (const r of data[form].rows) {
                for (const col of dateColumns(form)) {
                    const v = cell(r, col)
                    if (v === '') continue
                    const n = normalizeLegacyDate(v)
                    if (n === null) bad.push(`${form}.${col}=${v}`)
                    else patterns[n.pattern] = (patterns[n.pattern] ?? 0) + 1
                }
            }
        }
        return { patterns, bad }
    }

    it('exactly 3 unparseable dates, including 13/45/2026 and N/A', () => {
        const { bad } = observed()
        expect(bad.sort()).toEqual([
            'AwardsCase.AuthorizationDate=13/45/2026',
            'Request.RequiredDeliveryDate=2026-02-30',
            'ShipmentRecord.ShippedDate=N/A',
        ])
    })

    it('all five legacy date styles are present', () => {
        const { patterns } = observed()
        for (const p of ['us', 'us_datetime', 'iso', 'compact', 'notes']) expect(patterns[p] ?? 0, p).toBeGreaterThan(10)
        const raw = LOAD_ORDER.flatMap((f) => data[f].rows.flatMap((r) => dateColumns(f).map((c) => cell(r, c))))
        expect(raw.some((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v))).toBe(true)
        expect(raw.some((v) => /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(v))).toBe(true)
        expect(raw.some((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))).toBe(true)
        expect(raw.some((v) => /^\d{8}$/.test(v))).toBe(true)
        expect(raw.some((v) => /^\d{2} [A-Z]{3} \d{2}$/.test(v))).toBe(true)
    })
})

describe('duplicate requesters (computeDedupeKey)', () => {
    it('exactly 4 duplicate groups, each with distinct UNIDs and RequesterIDs, some already MergedInto', () => {
        const groups = new Map<string, Keyed[]>()
        for (const r of data.Requester.rows) {
            const key = computeDedupeKey({ first_name: cell(r, 'FirstName'), last_name: cell(r, 'LastName'), email: cell(r, 'Email'), zip: cell(r, 'ZIP') })
            if (key === '') continue
            groups.set(key, [...(groups.get(key) ?? []), r])
        }
        const dupes = [...groups.values()].filter((g) => g.length > 1)
        expect(dupes).toHaveLength(4)
        expect(dupes.map((g) => g.length).sort()).toEqual([2, 2, 2, 3])
        let merged = 0
        for (const g of dupes) {
            expect(new Set(g.map((r) => cell(r, 'UNID'))).size).toBe(g.length)
            expect(new Set(g.map((r) => cell(r, 'RequesterID'))).size).toBe(g.length)
            merged += g.filter((r) => cell(r, 'MergedInto') !== '').length
        }
        expect(merged).toBe(2)
        expect(dupes.filter((g) => g.every((r) => cell(r, 'MergedInto') === ''))).toHaveLength(2)
    })
})

describe('contradictions and limits', () => {
    it('Stage=Closed with empty ClosedDate: exactly 1', () => {
        const rows = data.AwardsCase.rows.filter((r) => mapLegacyStatus('AwardsCase', cell(r, 'Stage')).value === 'closed' && cell(r, 'ClosedDate') === '')
        expect(rows).toHaveLength(1)
    })

    it('ShipStatus=Delivered with empty DeliveredDate: exactly 1; Returned shipment: exactly 1', () => {
        const status = (r: Keyed): string => mapLegacyStatus('ShipmentRecord', cell(r, 'ShipStatus')).value
        expect(data.ShipmentRecord.rows.filter((r) => status(r) === 'delivered' && cell(r, 'DeliveredDate') === '')).toHaveLength(1)
        expect(data.ShipmentRecord.rows.filter((r) => status(r) === 'returned')).toHaveLength(1)
    })

    it('RequestLine ExtendedPrice != Quantity x UnitPrice: exactly 1', () => {
        const bad = data.RequestLine.rows.filter((r) => Math.abs(Number(cell(r, 'Quantity')) * Number(cell(r, 'UnitPrice')) - Number(cell(r, 'ExtendedPrice'))) > 0.005)
        expect(bad).toHaveLength(1)
    })

    it('Request Status=Draft with ReleasedDate set: exactly 1', () => {
        const bad = data.Request.rows.filter((r) => mapLegacyStatus('Request', cell(r, 'Status')).value === 'draft' && cell(r, 'ReleasedDate') !== '')
        expect(bad).toHaveLength(1)
    })

    it(`AwardLine Quantity above ${LIMITS.maxQuantity}: exactly 1; non-uppercase EngravingText: exactly 2`, () => {
        expect(data.AwardLine.rows.filter((r) => Number(cell(r, 'Quantity')) > LIMITS.maxQuantity)).toHaveLength(1)
        const lower = data.AwardLine.rows.filter((r) => cell(r, 'EngravingText') !== '' && cell(r, 'EngravingText') !== cell(r, 'EngravingText').toUpperCase())
        expect(lower).toHaveLength(2)
    })

    it('open cases at the fixed clock spread across green, amber and red', () => {
        const stageDate: Record<string, string> = { authorized: 'EnteredDate', engraving: 'EngravingDate', assembly_qc: 'AssemblyDate', warehouse: 'WarehouseDate', shipped: 'ShippedDate' }
        const spread = { green: 0, amber: 0, red: 0 }
        for (const r of data.AwardsCase.rows) {
            const m = mapLegacyStatus('AwardsCase', cell(r, 'Stage'))
            if (!m.mapped) continue
            const stage = m.value as CaseStage
            if (TERMINAL_STAGES.has(stage)) continue
            const entered = normalizeLegacyDate(cell(r, stageDate[stage] ?? ''))
            expect(entered, `${cell(r, 'CaseNumber')} ${stage}`).not.toBeNull()
            spread[computeAgingFlag(daysBetween(entered?.dateTime ?? clockIso, clockIso), stage)] += 1
        }
        expect(spread).toEqual({ green: 8, amber: 6, red: 6 })
    })
})

describe('CSV fidelity', () => {
    it('multi-line, quoted and comma-bearing cells round-trip through the RFC 4180 parser', () => {
        let newline = 0
        let quote = 0
        let comma = 0
        for (const form of LOAD_ORDER) {
            for (const r of data[form].rows) {
                for (const v of Object.values(r)) {
                    if (v.includes('\n')) newline += 1
                    if (v.includes('"')) quote += 1
                    if (v.includes(',')) comma += 1
                }
            }
        }
        expect(newline).toBeGreaterThanOrEqual(10)
        expect(quote).toBeGreaterThanOrEqual(10)
        expect(comma).toBeGreaterThanOrEqual(100)
        const note = data.CaseNote.rows.find((r) => cell(r, 'Body').includes('\n') && cell(r, 'Body').includes('"'))
        expect(note).toBeDefined()
        const history = data.AwardsCase.rows.filter((r) => cell(r, 'StatusHistory').includes('\n'))
        expect(history.length).toBeGreaterThan(0)
    })

    it('the audit the README is rendered from agrees with these independent counts', () => {
        const audit = auditSampleData(files)
        expect(audit.rowCounts).toEqual(CONTROL_TOTALS)
        expect(Object.fromEntries(Object.entries(audit.unmappedStatuses).map(([f, v]) => [f, v.count]))).toEqual(UNMAPPED_STATUS_ROWS)
        expect(audit.orphans).toEqual(ORPHANS)
        expect(audit.unparseableDates).toHaveLength(3)
        expect(audit.duplicateRequesterGroups).toHaveLength(4)
        expect(audit.parentUnidDisagreements).toEqual({ AwardLine: 2, CaseNote: 0 })
        expect(audit.contradictions).toEqual({
            closedWithoutClosedDate: 1,
            deliveredWithoutDeliveredDate: 1,
            extendedPriceMismatch: 1,
            draftWithReleasedDate: 1,
            quantityOverMax: 1,
            nonUppercaseEngraving: 2,
            returnedShipments: 1,
        })
        expect(audit.aging).toEqual({ green: 8, amber: 6, red: 6 })
        expect(audit.unids).toEqual({ total: 455, distinct: 455, malformed: 0 })
        const readme = renderReadme(audit)
        expect(readme).toContain('modernization reference application')
        expect(readme.toLowerCase()).not.toContain('demo')
        expect(readme).toContain('| vetmedals-AwardLine.csv | AwardLine | 120 |')
    })
})

describe('determinism', () => {
    it('generate() twice with the default seed/clock is byte-identical', () => {
        const a = generate(DEFAULT_SEED, DEFAULT_CLOCK)
        const b = generate(DEFAULT_SEED, DEFAULT_CLOCK)
        expect(Object.keys(a)).toEqual(Object.keys(b))
        for (const k of Object.keys(a)) expect(a[k], k).toBe(b[k])
    })

    it('a different seed changes the content but not the shape', () => {
        const other = generate(DEFAULT_SEED + 1, DEFAULT_CLOCK)
        expect(Object.keys(other).sort()).toEqual(Object.keys(files).sort())
        expect(other['vetmedals-AwardsCase.csv']).not.toBe(files['vetmedals-AwardsCase.csv'])
        const parsed = parseSampleFiles(other)
        for (const form of LOAD_ORDER) expect(parsed[form].header, form).toEqual([...csvHeader(form)])
    })
})

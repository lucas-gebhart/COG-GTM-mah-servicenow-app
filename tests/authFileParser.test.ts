import { describe, expect, it } from 'vitest'
import { detectDelimiter, formatParseLog, intakeCaseDescription, parseAuthorizationDelimited, parseAuthorizationFile, parseAuthorizationJson, splitDelimited, summarizeParse } from '../src/server/lib/authFileParser'
import { LIMITS } from '../src/server/lib/domain'
import { validateFileName, validateMultiline, validateSafeText } from '../src/server/lib/validators'

const validRecord = {
    source_record_id: 'HRC-2024-000123',
    source_agency: 'HRC',
    authorization_date: '03/07/2024',
    requester: {
        type: 'Veteran',
        first_name: 'Jordan',
        last_name: 'Alvarez',
        service_number_last4: '1234',
        dob: '12-Apr-1961',
        email: 'Jordan.Alvarez@example.mil',
        phone: '(586) 282-1234',
        address_1: '6501 E 11 Mile Rd',
        city: 'Warren',
        state: 'mi',
        zip: '48397',
    },
    ship_to: '6501 E 11 Mile Rd, Warren MI 48397',
    awards: [
        { award_name: 'Bronze Star Medal', device: 'V device', quantity: 1, engraving_text: 'SFC JORDAN ALVAREZ', engraving_required: true },
        { award_name: 'army_commendation_medal', device: 'Bronze oak leaf cluster', quantity: 2 },
    ],
}

describe('JSON authorization files', () => {
    it('parses and normalizes a valid record', () => {
        const p = parseAuthorizationJson({ file_name: 'HRC_20240307.json', source_agency: 'HRC', records: [validRecord] })
        expect(p.fileIssues).toEqual([])
        expect(p.rejected).toEqual([])
        expect(p.records).toHaveLength(1)
        const r = p.records[0]
        if (!r) throw new Error('expected one record')
        expect(r.authorization_date).toBe('2024-03-07')
        expect(r.requester.dob).toBe('1961-04-12')
        expect(r.requester.email).toBe('jordan.alvarez@example.mil')
        expect(r.requester.state).toBe('MI')
        expect(r.awards[0]).toEqual({ award_name: 'bronze_star_medal', device: 'v_device', quantity: 1, engraving_text: 'SFC JORDAN ALVAREZ', engraving_required: true })
        expect(r.awards[1]).toEqual({ award_name: 'army_commendation_medal', device: 'bronze_oak_leaf_cluster', quantity: 2, engraving_text: '', engraving_required: false })
        expect(summarizeParse(p)).toEqual({ records: 1, awardLines: 2, rejected: 0, fileIssues: 0 })
    })

    it('writes values the table rules accept: agency-style file names and the case short description', () => {
        const p = parseAuthorizationJson({ file_name: 'HRC_AWD_20260615_7.txt', source_agency: 'HRC', records: [validRecord] })
        expect(p.fileIssues).toEqual([])
        expect(validateFileName('file_name', p.file_name, true).valid).toBe(true)
        expect(parseAuthorizationJson({ file_name: '../etc/passwd', records: [validRecord] }).fileIssues[0]?.field).toBe('file_name')
        const record = p.records[0]
        if (!record) throw new Error('expected one record')
        const description = intakeCaseDescription(record)
        expect(description).toBe('HRC authorization HRC-2024-000123 - 2 award line(s)')
        expect(validateSafeText('short_description', description, 160).valid).toBe(true)
    })

    it('parse log passes the parse_log table rule even when it carries field paths, ids and issue codes', () => {
        const p = parseAuthorizationJson({
            file_name: 'NPRC_AWD_20260921_2.json',
            records: [
                validRecord,
                { ...validRecord, source_record_id: 'HRC-2', awards: [{ award_name: 'Medal of Awesomeness', quantity: 1 }] },
                { ...validRecord, source_record_id: 'HRC-3', requester: { ...validRecord.requester, last_name: 'Alvarez<script>' } },
            ],
            unexpected_top_level: '<b>x</b>',
        })
        const log = formatParseLog(p, 4096, [
            { kind: 'accepted', source_record_id: 'HRC-2024-000123', case_number: 'MAH0001153' },
            { kind: 'duplicate', source_record_id: 'HRC-2024-000123', case_number: 'MAH0001153' },
            { kind: 'failed', source_record_id: 'HRC-9', table: 'x_cog_mah_awards_case' },
        ])
        expect(log.split('\n')[0]).toBe('bytes: 4096; format: json; records: 1; rejected: 2')
        expect(log).toContain('rejected HRC-2: awards(0).award_name (whitelist)')
        expect(log).toContain('failed HRC-9: x_cog_mah_awards_case insert refused by table rule')
        expect(validateMultiline('parse_log', log, 8000).valid).toBe(true)
        expect(formatParseLog(p, 1, [], 40).length).toBeLessThanOrEqual(40)
    })

    it('rejects records with unknown awards, bad ids and injection attempts', () => {
        const p = parseAuthorizationJson({
            records: [
                { ...validRecord, source_record_id: 'HRC-2', awards: [{ award_name: 'Medal of Awesomeness', quantity: 1 }] },
                { ...validRecord, source_record_id: 'bad id!' },
                { ...validRecord, source_record_id: 'HRC-3', requester: { ...validRecord.requester, last_name: 'Alvarez<script>' } },
                { ...validRecord, source_record_id: 'HRC-4', awards: [] },
                { ...validRecord, source_record_id: 'HRC-5', awards: [{ award_name: 'Purple Heart', quantity: 0 }] },
            ],
        })
        expect(p.records).toEqual([])
        expect(p.rejected.map((r) => r.issues[0]?.field)).toEqual(['awards[0].award_name', 'source_record_id', 'requester.last_name', 'awards', 'awards[0].quantity'])
    })

    it('is idempotent within a file: duplicate source ids are rejected', () => {
        const p = parseAuthorizationJson({ records: [validRecord, validRecord] })
        expect(p.records).toHaveLength(1)
        expect(p.rejected[0]?.issues[0]?.code).toBe('duplicate')
    })

    it('rejects malformed bodies and oversize files at the file level', () => {
        expect(parseAuthorizationJson([]).fileIssues[0]?.code).toBe('format')
        expect(parseAuthorizationJson({ records: 'nope' }).fileIssues[0]?.field).toBe('records')
        expect(parseAuthorizationJson({ records: new Array(LIMITS.maxAuthorizationRecords + 1).fill({}) }).fileIssues[0]?.code).toBe('range')
        expect(parseAuthorizationJson({ file_name: '../../etc/passwd', records: [] }).fileIssues[0]?.field).toBe('file_name')
        expect(parseAuthorizationFile('{not json', 'application/json').fileIssues[0]?.message).toMatch(/valid JSON/)
    })

    it('inherits the file-level agency when a record omits it', () => {
        const noAgency: Record<string, unknown> = { ...validRecord }
        delete noAgency['source_agency']
        const p = parseAuthorizationJson({ source_agency: 'nprc', records: [noAgency] })
        expect(p.records[0]?.source_agency).toBe('nprc')
    })
})

describe('delimited authorization files', () => {
    const header = 'RecordId|Agency|AuthDate|Type|LastName|FirstName|SvcLast4|DOB|Email|Phone|Address1|City|State|Zip|Award|Device|Qty|Engraving|Engrave'
    const rows = [
        'NPRC-77|NPRC|20240307|Next of kin|Lee|Min|4321|1945-11-02|m.lee@example.org|586-555-0100|1 Main St|Warren|MI|48397|Purple Heart||1|PFC ROBERT LEE|Y',
        'NPRC-77|NPRC|20240307|Next of kin|Lee|Min|4321|1945-11-02|m.lee@example.org|586-555-0100|1 Main St|Warren|MI|48397|World War II Victory Medal||1||N',
        'NPRC-78|NPRC|07-Mar-2024|Unit||||||||Fort Riley|KS|66442|Meritorious Unit Commendation||12||N',
    ]

    it('detects the delimiter and groups rows into records', () => {
        expect(detectDelimiter(header)).toBe('|')
        expect(detectDelimiter('a,b,c')).toBe(',')
        expect(detectDelimiter('a\tb\tc')).toBe('\t')
        const p = parseAuthorizationDelimited([header, ...rows].join('\n'), 'NPRC_20240307.txt')
        expect(p.format).toBe('delimited')
        expect(p.records.map((r) => r.source_record_id)).toEqual(['NPRC-77'])
        expect(p.records[0]?.awards).toHaveLength(2)
        expect(p.records[0]?.awards[0]?.engraving_required).toBe(true)
        // NPRC-78 is a Unit record without a unit name → rejected
        expect(p.rejected[0]).toMatchObject({ source_record_id: 'NPRC-78' })
        expect(p.rejected[0]?.issues.map((i) => i.field)).toContain('requester.unit_name')
    })

    it('handles quoted fields and CRLF', () => {
        const csv = 'record_id,agency,last_name,award_name,quantity,engraving_text\r\n"HRC-9","HRC","O\'Brien, Jr.","Silver Star",1,"CPT R. OBRIEN, JR."\r\n'
        const p = parseAuthorizationDelimited(csv, 'x.csv')
        expect(p.fileIssues).toEqual([])
        expect(p.rejected).toEqual([])
        expect(p.records[0]?.requester.last_name).toBe("O'Brien, Jr.")
        expect(p.records[0]?.awards[0]?.engraving_text).toBe('CPT R. OBRIEN, JR.')
        expect(splitDelimited('a,"b,c",d', ',')).toEqual(['a', 'b,c', 'd'])
        expect(splitDelimited('"say ""hi""",x', ',')).toEqual(['say "hi"', 'x'])
    })

    it('fails fast on a header missing required columns', () => {
        const p = parseAuthorizationDelimited('foo|bar\n1|2', 'x.txt')
        expect(p.records).toEqual([])
        expect(p.fileIssues.filter((i) => i.code === 'missing_column').map((i) => i.message)).toEqual(
            expect.arrayContaining([expect.stringContaining('record_id'), expect.stringContaining('award_name')]),
        )
    })

    it('rejects empty and oversize bodies', () => {
        expect(parseAuthorizationDelimited('', 'x.txt').fileIssues[0]?.code).toBe('required')
        expect(parseAuthorizationDelimited('x'.repeat(LIMITS.maxIntakeBodyBytes + 1), 'x.txt').fileIssues[0]?.code).toBe('range')
    })

    it('dispatches on content type', () => {
        expect(parseAuthorizationFile(JSON.stringify({ records: [validRecord] }), 'application/json').records).toHaveLength(1)
        expect(parseAuthorizationFile([header, rows[0]].join('\n'), 'text/plain').records).toHaveLength(1)
    })
})

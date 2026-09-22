import { describe, expect, it } from 'vitest'
import { daysBetween, normalizeLegacyDate, toJulianDate } from '../src/server/lib/dates'
import { DEFAULT_STATUS_MAP, STATUS_TARGET_CHOICES, buildStatusLookup, mapLegacyStatus, normalizeStatusText } from '../src/server/lib/statusMap'
import { coalesceRequesters, computeDedupeKey } from '../src/server/lib/dedupe'
import { LEGACY_FORMS } from '../src/server/lib/domain'

describe('legacy date normalization', () => {
    it.each([
        ['2024-03-07', '2024-03-07', '2024-03-07 00:00:00', 'iso'],
        ['2024-03-07T14:05:09Z', '2024-03-07', '2024-03-07 14:05:09', 'iso_datetime'],
        ['2024-03-07 14:05:09', '2024-03-07', '2024-03-07 14:05:09', 'iso_datetime'],
        ['2024-03-07T10:05:09-04:00', '2024-03-07', '2024-03-07 14:05:09', 'iso_datetime'],
        ['03/07/2024', '2024-03-07', '2024-03-07 00:00:00', 'us'],
        ['3/7/24', '2024-03-07', '2024-03-07 00:00:00', 'us'],
        ['12/31/99', '1999-12-31', '1999-12-31 00:00:00', 'us'],
        ['03/07/2024 02:05:09 PM', '2024-03-07', '2024-03-07 14:05:09', 'us_datetime'],
        ['03/07/2024 12:05 AM', '2024-03-07', '2024-03-07 00:05:00', 'us_datetime'],
        ['07-Mar-2024', '2024-03-07', '2024-03-07 00:00:00', 'notes'],
        ['07-MAR-2024 14:05:09', '2024-03-07', '2024-03-07 14:05:09', 'notes'],
        ['7 Sept 2024', '2024-09-07', '2024-09-07 00:00:00', 'notes'],
        ['20240307', '2024-03-07', '2024-03-07 00:00:00', 'compact'],
        ['20240307140509', '2024-03-07', '2024-03-07 14:05:09', 'compact'],
    ])('normalizes %s', (input, date, dateTime, pattern) => {
        const r = normalizeLegacyDate(input)
        expect(r).not.toBeNull()
        expect(r?.date).toBe(date)
        expect(r?.dateTime).toBe(dateTime)
        expect(r?.pattern).toBe(pattern)
    })

    it('rejects garbage and impossible dates instead of guessing', () => {
        expect(normalizeLegacyDate('')).toBeNull()
        expect(normalizeLegacyDate(null)).toBeNull()
        expect(normalizeLegacyDate('yesterday')).toBeNull()
        expect(normalizeLegacyDate('2024-02-30')).toBeNull()
        expect(normalizeLegacyDate('13/45/2024')).toBeNull()
        expect(normalizeLegacyDate('07-Foo-2024')).toBeNull()
        expect(normalizeLegacyDate('03/07/2024 13:05 PM')).toBeNull()
    })

    it('handles epoch milliseconds', () => {
        expect(normalizeLegacyDate(Date.UTC(2024, 2, 7, 14, 5, 9))?.dateTime).toBe('2024-03-07 14:05:09')
    })

    it('computes day differences and Julian dates', () => {
        expect(daysBetween('2024-01-01', '2024-03-07')).toBe(66)
        expect(daysBetween('2024-03-07 23:00:00', '2024-03-08 01:00:00')).toBe(0)
        expect(daysBetween('2024-03-08', '2024-03-07')).toBe(0)
        expect(toJulianDate('2024-01-01')).toBe('4001')
        expect(toJulianDate('2024-12-31')).toBe('4366')
        expect(toJulianDate('2023-12-31')).toBe('3365')
    })
})

describe('legacy status mapping', () => {
    it('normalizes casing, whitespace and punctuation', () => {
        expect(normalizeStatusText('  assembly / qc ')).toBe('ASSEMBLY/QC')
        expect(normalizeStatusText('Assembly-QC')).toBe('ASSEMBLY QC')
        expect(normalizeStatusText('Closed – Complete')).toBe('CLOSED COMPLETE')
        expect(normalizeStatusText(null)).toBe('')
    })

    it('maps known variants and buckets unknown values as unmapped', () => {
        expect(mapLegacyStatus(LEGACY_FORMS.awards_case, 'In Engraving')).toMatchObject({ value: 'engraving', mapped: true })
        expect(mapLegacyStatus(LEGACY_FORMS.awards_case, 'ASSEMBLY / QC')).toMatchObject({ value: 'assembly_qc', mapped: true })
        expect(mapLegacyStatus(LEGACY_FORMS.awards_case, 'Canceled')).toMatchObject({ value: 'cancelled', mapped: true })
        expect(mapLegacyStatus(LEGACY_FORMS.heraldry_request, 'Released - Vendor')).toMatchObject({ value: 'released_to_vendor' })
        expect(mapLegacyStatus(LEGACY_FORMS.awards_case, 'Lost in mail')).toEqual({ value: 'unmapped', mapped: false, normalized: 'LOST IN MAIL' })
        expect(mapLegacyStatus('NotAForm', 'Closed').mapped).toBe(false)
    })

    it('seed map only targets choices that exist on the target table (bidirectional)', () => {
        for (const e of DEFAULT_STATUS_MAP) {
            const choices = STATUS_TARGET_CHOICES[e.legacyForm]
            expect(Object.keys(choices), `${e.legacyForm}:${e.legacyStatus}`).toContain(e.targetValue)
        }
        // every non-unmapped choice of every form has at least one legacy spelling
        for (const [form, choices] of Object.entries(STATUS_TARGET_CHOICES)) {
            for (const key of Object.keys(choices)) {
                if (key === 'unmapped') continue
                expect(DEFAULT_STATUS_MAP.some((e) => e.legacyForm === form && e.targetValue === key), `${form}.${key} has no legacy spelling`).toBe(true)
            }
        }
    })

    it('has no conflicting duplicate keys in the seed map', () => {
        const seen = new Map<string, string>()
        for (const e of DEFAULT_STATUS_MAP) {
            const k = `${e.legacyForm}|${e.legacyStatus}`
            const prev = seen.get(k)
            expect(prev === undefined || prev === e.targetValue, `${k} maps to both ${prev} and ${e.targetValue}`).toBe(true)
            seen.set(k, e.targetValue)
        }
    })

    it('supports lookups built from instance rows', () => {
        const lookup = buildStatusLookup([{ legacyForm: 'AwardsCase', legacyStatus: 'LOST IN MAIL', targetValue: 'shipped', targetField: 'stage' }])
        expect(mapLegacyStatus('AwardsCase', 'lost in mail', lookup).value).toBe('shipped')
    })
})

describe('requester dedupe', () => {
    it('produces the same key for the same person regardless of formatting', () => {
        const a = computeDedupeKey({ type: 'Veteran', first_name: 'Jordan', last_name: "O'Brien", service_number_last4: '1234', dob: '1961-04-12' })
        const b = computeDedupeKey({ type: 'veteran', first_name: 'J.', last_name: 'OBRIEN ', service_number_last4: '***-**-1234', dob: '04/12/1961' })
        expect(a).toBe('P:OBRIEN:J:1234:19610412')
        expect(b).toBe(a)
    })

    it('uses unit-scoped keys for units and e-mail fallback for thin records', () => {
        expect(computeDedupeKey({ type: 'Unit', unit_name: '1st Bn, 16th Inf Regt', zip: '66442-1234' })).toBe('U:1STBN16THINFREGT:66442')
        expect(computeDedupeKey({ type: 'Next of kin', last_name: 'Lee', email: 'M.Lee@Example.org' })).toBe('E:m.lee@example.org')
        expect(computeDedupeKey({ type: 'Veteran', last_name: 'Lee', first_name: 'Min', zip: '48397' })).toBe('Z:LEE:M:48397')
        expect(computeDedupeKey({ type: 'Veteran', last_name: 'Lee' })).toBe('')
    })

    it('coalesces duplicates deterministically onto the newest record', () => {
        const r = coalesceRequesters([
            { unid: 'A', key: 'k1', lastModified: '2023-01-01 00:00:00', record: 1 },
            { unid: 'B', key: 'k1', lastModified: '2024-01-01 00:00:00', record: 2 },
            { unid: 'C', key: 'k1', lastModified: '2024-01-01 00:00:00', record: 3 },
            { unid: 'D', key: '', lastModified: '2020-01-01 00:00:00', record: 4 },
            { unid: 'E', key: 'k2', lastModified: '2020-01-01 00:00:00', record: 5 },
        ])
        expect(r.survivors.map((s) => s.unid).sort()).toEqual(['B', 'D', 'E'])
        expect(Object.fromEntries(r.mergedInto)).toEqual({ A: 'B', C: 'B' })
    })
})

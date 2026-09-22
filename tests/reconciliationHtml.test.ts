import { describe, expect, it } from 'vitest'
import { deniedHtml, escapeHtml, GENERIC_PAGE_DENIED, reconciliationHtml } from '../src/server/lib/reconciliationHtml'
import type { ReconciliationReport } from '../src/server/services/reconciliation'

const REPORT: ReconciliationReport = {
    generated_at: '2026-09-01 12:00:00',
    tables: [
        { table: 'x_cog_mah_awards_case', legacyForm: 'AwardsCase', rows: 50, withLegacyUnid: 50, unmappedStatus: 3 },
        { table: 'x_cog_mah_award_line', legacyForm: 'AwardLine', rows: 117, withLegacyUnid: 117, unmappedStatus: 0 },
        { table: 'x_cog_mah_requester', legacyForm: 'Requester', rows: 65, withLegacyUnid: 65, unmappedStatus: 0 },
    ],
    award_line_quantity_total: 1125,
    request_line_extended_price_total: '69880.50',
    orphan_count: 7,
    duplicate_merge_count: 14,
    unmapped_status_count: 13,
    exception_counts: { orphan_parent: 7, duplicate_business_key: 2 },
    cases_by_stage: { authorized: 10, engraving: 8, closed: 20 },
    cases_by_aging_flag: { green: 30, amber: 3, red: 17 },
    requests_by_state: { draft: 2, released_to_vendor: 5, '<script>': 1 },
    queues: { engraving_open: 8, assembly_qc: 4, warehouse: 6, vendor_in_production: 3, ses_pending: 2 },
}

describe('reconciliation UI page renderer', () => {
    it('escapes every HTML-significant character', () => {
        expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;')
        expect(escapeHtml(null)).toBe('')
        expect(escapeHtml(1125)).toBe('1125')
    })

    it('renders the reconciliation totals, per-table rows and queues in the page', () => {
        const html = reconciliationHtml(REPORT)
        for (const expected of ['1125', '69880.50', '>7<', '>14<', '>13<', 'x_cog_mah_awards_case', 'AwardLine', 'engraving_open', 'released_to_vendor', '2026-09-01 12:00:00']) {
            expect(html).toContain(expected)
        }
        // total rows / total legacy-UNID rows across the reconciled tables
        expect(html).toContain('<b>232</b>Target rows')
        expect(html).toContain('<b>232</b>Rows carrying a legacy UNID')
        expect(html).toMatch(/<tfoot>.*>232<.*>232<.*>13<.*<\/tfoot>/)
        expect(html.match(/class="card warn"/g)).toHaveLength(2)
    })

    it('never emits report values unescaped and ships no scripts or external assets', () => {
        const html = reconciliationHtml(REPORT)
        expect(html).not.toContain('<script>')
        expect(html).toContain('&lt;script&gt;')
        expect(html).not.toMatch(/<script[\s>]/i)
        expect(html).not.toMatch(/\son[a-z]+=/i)
        expect(html).not.toMatch(/(src|href)=["']?https?:/i)
        expect(html).not.toContain('<link')
    })

    it('is well-formed XHTML without a DOCTYPE, as the Jelly <g:no_escape> output is re-parsed as XML', () => {
        for (const html of [reconciliationHtml(REPORT), deniedHtml('ref')]) {
            expect(html).not.toMatch(/<!DOCTYPE/i)
            expect(html.startsWith('<html>')).toBe(true)
            const opens = new Map<string, number>()
            for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9]*)[^>]*?(\/?)>/g)) {
                const [, close, tag, selfClose] = m
                if (selfClose || !tag) continue
                opens.set(tag, (opens.get(tag) ?? 0) + (close ? -1 : 1))
            }
            expect([...opens.entries()].filter(([, n]) => n !== 0)).toEqual([])
            expect(html).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#39;)/)
        }
    })

    it('renders a generic denial page with only a correlation reference', () => {
        const html = deniedHtml('abc123')
        expect(html).toContain(GENERIC_PAGE_DENIED)
        expect(html).toContain('Reference abc123')
        expect(html).not.toMatch(/role|x_cog_mah\.|GlideAggregate/)
    })
})

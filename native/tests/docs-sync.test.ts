import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inventory, renderMarkdown } from '../tools/inventory'

const read = (p: string): string => readFileSync(p, 'utf8')

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((n) => {
        if (n === 'node_modules' || n === 'dist' || n === 'target' || n === '.now' || n === 'out') return []
        const p = join(dir, n)
        return statSync(p).isDirectory() ? walk(p) : [p]
    })
}

/** Every `"quoted title"` in the Proven by column of the v2 matrix must be a real `it(...)` title in tests/. */
function quotedTitles(md: string): string[] {
    const out: string[] = []
    for (const line of md.split('\n')) {
        if (!line.startsWith('|')) continue
        const cells = line.split('|').map((c) => c.trim())
        const proven = cells[cells.length - 2] ?? ''
        for (const m of proven.matchAll(/"([^"]+)"/g)) out.push(m[1] ?? '')
    }
    return out
}

describe('native docs stay in sync with the code', () => {
    const tests = readdirSync('tests').filter((f) => f.endsWith('.test.ts') && f !== 'docs-sync.test.ts').map((f) => read(join('tests', f))).join('\n')

    it('every test title quoted in docs/EQUIVALENCE-MATRIX.md exists in tests/ (titles ending in … are prefixes)', () => {
        const titles = quotedTitles(read('docs/EQUIVALENCE-MATRIX.md'))
        expect(titles.length).toBeGreaterThan(40)
        const missing = titles.filter((t) => {
            const needle = t.endsWith('…') ? t.slice(0, -1).trim() : t
            return !tests.includes(needle)
        })
        expect(missing).toEqual([])
    })

    it('the numbers table in docs/NATIVE-VS-CUSTOM.md is what tools/inventory.ts prints today', () => {
        const md = read('docs/NATIVE-VS-CUSTOM.md')
        const expected = renderMarkdown(inventory('v1'), inventory('v2'))
            .split('\n')
            .slice(2)
            .map((l) => l.replace(' | 2 | 2 | 0 |', ' | 2 (inert) | 2 (running) | 0 |'))
        for (const row of expected) expect(md, row).toContain(row)
    })

    it('README and docs cross-link only files that exist and name the four native docs', () => {
        for (const doc of ['README.md', 'docs/NATIVE-VS-CUSTOM.md', 'docs/EQUIVALENCE-MATRIX.md', 'docs/MIGRATION-RUNBOOK.md']) {
            const md = read(doc)
            for (const m of md.matchAll(/`((?:src|tools|tests|docs)\/[A-Za-z0-9_./-]+)`/g)) {
                const p = m[1] ?? ''
                if (p.endsWith('/')) expect(statSync(p).isDirectory(), `${doc} → ${p}`).toBe(true)
                else expect(() => statSync(p), `${doc} → ${p}`).not.toThrow()
            }
        }
        const readme = read('README.md')
        for (const d of ['docs/NATIVE-VS-CUSTOM.md', 'docs/EQUIVALENCE-MATRIX.md', 'docs/MIGRATION-RUNBOOK.md', 'docs/SCREENS.md']) expect(readme).toContain(d)
        expect(read('../README.md')).toContain('native/docs/NATIVE-VS-CUSTOM.md')
    })

    it('every claim section is labelled repository-derived, verified on the PDI or proposed', () => {
        for (const doc of ['README.md', 'docs/NATIVE-VS-CUSTOM.md', 'docs/EQUIVALENCE-MATRIX.md', 'docs/MIGRATION-RUNBOOK.md']) {
            const md = read(doc)
            expect(md, doc).toMatch(/\[repository-derived\]/)
            expect(md, doc).toMatch(/\[proposed\]|\[verified on the PDI\]/)
        }
    })

    it('the native tree never mentions v1 production-only concepts as v2 metadata', () => {
        const fluent = walk('src/fluent').filter((f) => f.endsWith('.now.ts'))
        for (const f of fluent) {
            const body = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
            expect(body, f).not.toMatch(/x_cog_mah_(?!native)/)
            expect(body, f).not.toMatch(/x_cog_mah_native_(case_note|vendor|heraldic_item|migration_exception)\b/)
            if (!f.includes('/migration/')) expect(body, f).not.toMatch(/\b(days_in_stage|aging_flag)\b/)
        }
    })
})

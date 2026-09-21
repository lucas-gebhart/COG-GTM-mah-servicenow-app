import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LEGACY_ROLE_MAP, TABLES, type DomainTableKey } from '../src/server/lib/domain'
import { DOMINO_MAPPING, EQUIVALENCE_MATRIX, TABLE_ORDER } from '../tools/lib/docs-catalog'
import { BLOCKS, catalogProblems, DOC_FILES, renderFile } from '../tools/generate-docs'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const TESTS_DIR = `${ROOT}tests/`

/**
 * Test files that exercise tooling / generator synchronization rather than a legacy behaviour.
 * Their cases are not required to appear in the equivalence matrix.
 */
const NON_BEHAVIOUR_TEST_FILES = new Set(['operations-sync.test.ts', 'docs-sync.test.ts'])

function testTitles(): Map<string, Set<string>> {
    const out = new Map<string, Set<string>>()
    for (const file of readdirSync(TESTS_DIR)) {
        if (!file.endsWith('.test.ts')) continue
        const titles = new Set<string>()
        for (const m of readFileSync(TESTS_DIR + file, 'utf8').matchAll(/^\s*(?:it|test)\(\s*(['"`])(.*?)\1/gm)) {
            if (m[2] !== undefined) titles.add(m[2])
        }
        out.set(file, titles)
    }
    return out
}

describe('docs catalog', () => {
    it('references only files and paths that exist', () => {
        expect(catalogProblems()).toEqual([])
    })

    it('references only test titles that exist, and every behaviour test is referenced (bidirectional)', () => {
        const byFile = testTitles()
        const all = new Set([...byFile.values()].flatMap((s) => [...s]))
        const referenced = new Set(EQUIVALENCE_MATRIX.flatMap((r) => r.tests))

        const missing = [...referenced].filter((t) => !all.has(t))
        expect(missing, 'catalog references tests that do not exist').toEqual([])

        const unreferenced: string[] = []
        for (const [file, titles] of byFile) {
            if (NON_BEHAVIOUR_TEST_FILES.has(file)) continue
            for (const t of titles) if (!referenced.has(t)) unreferenced.push(`${file}: ${t}`)
        }
        expect(unreferenced, 'behaviour tests not mapped to a legacy behaviour in the equivalence matrix').toEqual([])
    })

    it('covers every legacy behaviour kind and every legacy ACL role', () => {
        const kinds = new Set(EQUIVALENCE_MATRIX.map((r) => r.kind))
        expect([...kinds].sort()).toEqual(['agent', 'export', 'form', 'role', 'rule', 'validation', 'view', 'xpage'])
        const roleRow = EQUIVALENCE_MATRIX.find((r) => r.legacy.startsWith('ACL roles'))
        expect(roleRow).toBeDefined()
        for (const legacy of Object.keys(LEGACY_ROLE_MAP)) expect(roleRow?.legacy).toContain(legacy)
        expect(EQUIVALENCE_MATRIX.map((r) => r.legacy)).toEqual([...new Set(EQUIVALENCE_MATRIX.map((r) => r.legacy))])
    })

    it('TABLE_ORDER is a permutation of the domain tables (both directions)', () => {
        const domain = Object.keys(TABLES) as DomainTableKey[]
        expect([...TABLE_ORDER].sort()).toEqual([...domain].sort())
        expect(new Set(TABLE_ORDER).size).toBe(TABLE_ORDER.length)
    })

    it('Domino mapping covers the design element families named in the task', () => {
        const dominos = DOMINO_MAPPING.map((m) => m.domino.toLowerCase())
        for (const family of ['form', 'view', 'agent', 'acl', 'readers', 'xpages', 'dxl']) {
            expect(dominos.some((d) => d.includes(family)), family).toBe(true)
        }
    })
})

describe('generated documentation', () => {
    it('every generated block renders and is used by at least one document', () => {
        const used = new Set<string>()
        for (const file of DOC_FILES) {
            const src = readFileSync(`${ROOT}${file}`, 'utf8')
            for (const m of src.matchAll(/<!-- gen:([a-z-]+) -->/g)) if (m[1]) used.add(m[1])
        }
        expect([...used].sort()).toEqual(Object.keys(BLOCKS).sort())
        for (const [name, block] of Object.entries(BLOCKS)) expect(block().length, name).toBeGreaterThan(20)
    })

    it.each(DOC_FILES)('%s is in sync (run `npm run gen:docs` after changing the domain or catalog)', (file) => {
        const { current, rendered } = renderFile(file)
        expect(current).toBe(rendered)
    })

    it('documents cross-link only to files that exist', () => {
        for (const file of DOC_FILES) {
            const src = readFileSync(`${ROOT}${file}`, 'utf8')
            const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : ''
            for (const m of src.matchAll(/\]\((?!https?:)([^)#]+)\)/g)) {
                const target = m[1] ?? ''
                expect(existsSync(`${ROOT}${dir}${target}`) || existsSync(`${ROOT}${target}`), `${file} → ${target}`).toBe(true)
            }
        }
    })

    it('never uses the excluded word in README or docs', () => {
        for (const file of DOC_FILES) {
            const src = readFileSync(`${ROOT}${file}`, 'utf8').toLowerCase()
            expect(src.includes('demo'), file).toBe(false)
        }
    })
})

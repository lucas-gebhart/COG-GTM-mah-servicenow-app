/**
 * Renders the code-derived sections of README.md, docs/MIGRATION-RUNBOOK.md and
 * docs/EQUIVALENCE-MATRIX.md between `<!-- gen:NAME -->` … `<!-- /gen:NAME -->` markers.
 * Prose outside the markers is hand-written; everything inside is regenerated from the domain
 * registries, the legacy contract, the Fluent table files and the docs catalog so counts,
 * names and thresholds cannot drift from the code.
 *
 *   npm run gen:docs            # rewrite the generated blocks
 *   npm run gen:docs -- --check # exit 1 if any block is stale (used by tests/docs-sync.test.ts)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
    AGING_THRESHOLDS,
    CASE_STAGE_ORDER,
    CASE_STAGES,
    EVENTS,
    LEGACY_ROLE_MAP,
    MIGRATION_EXCEPTION_STATES,
    MIGRATION_EXCEPTION_TYPES,
    NUMBER_PREFIXES,
    REQUEST_STATES,
    REQUEST_STATE_ORDER,
    REST_INTAKE_PATH,
    ROLES,
    SCHEDULED_JOB_NAME,
    TABLES,
    TARGET_STATUS_FIELD,
    type DomainTableKey,
    type RoleKey,
} from '../src/server/lib/domain'
import {
    dataSourceName,
    EXTRA_STAGING_COLUMNS,
    LEGACY_FORMS,
    LOAD_ORDER,
    TARGET_BUSINESS_KEY_FIELD,
    transformMapName,
} from '../src/server/lib/legacyContract'
import { FIELD_ACCESS, TABLE_ACCESS, type Operation } from '../src/server/lib/security'
import { UI_LAYOUT } from '../src/server/lib/uiLayout'
import { compareReports, type ComparisonReport } from '../src/server/migration/compare'
import type { ExpectedTargets } from '../src/server/migration/dryRun'
import { DOMINO_MAPPING, EQUIVALENCE_MATRIX, TABLE_ORDER, type EquivalenceRow } from './lib/docs-catalog'
import { declaredColumns, referenceColumns } from './lib/tableColumns'

const ROOT = fileURLToPath(new URL('../', import.meta.url))

export const DOC_FILES = ['README.md', 'docs/MIGRATION-RUNBOOK.md', 'docs/EQUIVALENCE-MATRIX.md'] as const
export type DocFile = (typeof DOC_FILES)[number]

// ------------------------------------------------------------------ helpers

function md(cell: string): string {
    return cell.replace(/\|/g, '\\|')
}

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
    const line = (cells: readonly string[]) => `| ${cells.map(md).join(' | ')} |`
    return [line(header), `| ${header.map(() => '---').join(' | ')} |`, ...rows.map(line)].join('\n')
}

function code(s: string): string {
    return `\`${s}\``
}

function roleList(keys: readonly RoleKey[]): string {
    return keys.map((k) => ROLES[k].replace('x_cog_mah.', '')).join(', ')
}

const OPERATIONS: readonly Operation[] = ['read', 'create', 'write', 'delete']

// ------------------------------------------------------------------ blocks

function tablesBlock(): string {
    const cols = declaredColumns()
    const formByTarget = new Map<string, string>()
    for (const c of Object.values(LEGACY_FORMS)) {
        const prev = formByTarget.get(c.targetTable)
        const label = c.csvFile.replace(/\.csv$/, '')
        formByTarget.set(c.targetTable, prev ? `${prev}, ${label}` : label)
    }
    const rows = TABLE_ORDER.map((key) => [
        code(TABLES[key]),
        code(NUMBER_PREFIXES[key]),
        formByTarget.get(TABLES[key]) ?? '—',
        code(TARGET_STATUS_FIELD[key]),
        String(cols[key].size),
        UI_LAYOUT[key].legacyViews.join(', ') || '—',
    ])
    return table(['Table', 'Prefix', 'Legacy form(s)', 'Status field', 'Columns', 'Replaces legacy view(s)'], rows)
}

function erdBlock(): string {
    const lines = ['```mermaid', 'erDiagram']
    const seen = new Set<string>()
    for (const e of referenceColumns()) {
        const child = TABLES[e.table]
        if (!e.referenceTable.startsWith('x_cog_mah_')) continue
        const key = `${child}.${e.column}`
        if (seen.has(key)) continue
        seen.add(key)
        const parent = e.referenceTable
        const label = e.column
        if (parent === child) lines.push(`    ${parent} ||--o{ ${child} : "${label} (self)"`)
        else lines.push(`    ${parent} ||--o{ ${child} : "${label}"`)
    }
    lines.push('```')
    return lines.join('\n')
}

function platformRefsBlock(): string {
    const rows: string[][] = []
    for (const e of referenceColumns()) {
        if (e.referenceTable.startsWith('x_cog_mah_')) continue
        rows.push([code(TABLES[e.table]), code(e.column), code(e.referenceTable)])
    }
    return table(['Table', 'Column', 'Platform table'], rows)
}

function mappingBlock(): string {
    return table(
        ['Domino design element', 'ServiceNow artefact', 'Where'],
        DOMINO_MAPPING.map((m) => [m.domino, m.servicenow, m.where]),
    )
}

function rolesBlock(): string {
    const rows = (Object.entries(LEGACY_ROLE_MAP) as [string, string][]).map(([legacy, role]) => {
        const key = (Object.keys(ROLES) as RoleKey[]).find((k) => ROLES[k] === role)
        const reads = key ? (Object.keys(TABLE_ACCESS) as DomainTableKey[]).filter((t) => TABLE_ACCESS[t].read.includes(key)).length : 0
        const writes = key ? (Object.keys(TABLE_ACCESS) as DomainTableKey[]).filter((t) => TABLE_ACCESS[t].write.includes(key)).length : 0
        return [code(legacy), code(role), `${reads} tables`, `${writes} tables`]
    })
    return table(['Legacy ACL role', 'ServiceNow role', 'Read', 'Write'], rows)
}

function accessMatrixBlock(): string {
    const rows = TABLE_ORDER.map((key) => [code(TABLES[key]), ...OPERATIONS.map((op) => roleList(TABLE_ACCESS[key][op]))])
    return table(['Table', ...OPERATIONS], rows)
}

function fieldAccessBlock(): string {
    return table(
        ['Table', 'Field', 'Operation', 'Roles', 'Why'],
        FIELD_ACCESS.map((f) => [code(TABLES[f.table]), code(f.field), f.operation, roleList(f.roles), f.reason]),
    )
}

function lifecycleBlock(): string {
    const stages = CASE_STAGE_ORDER.map((s) => CASE_STAGES[s]).join(' → ')
    const states = REQUEST_STATE_ORDER.map((s) => REQUEST_STATES[s]).join(' → ')
    return [
        `- Awards case stages: ${stages} (plus ${CASE_STAGES.cancelled}, ${CASE_STAGES.unmapped}).`,
        `- Heraldry request states: ${states} (plus ${REQUEST_STATES.cancelled}, ${REQUEST_STATES.unmapped}).`,
        `- Aging: amber at ${AGING_THRESHOLDS.amberDays} days in stage, red at ${AGING_THRESHOLDS.redDays}; recomputed by the ${code(SCHEDULED_JOB_NAME)} scheduled job.`,
        `- Events: ${Object.values(EVENTS).map(code).join(', ')}.`,
    ].join('\n')
}

function restBlock(): string {
    const src = readFileSync(`${ROOT}src/fluent/rest/authorization_intake.now.ts`, 'utf8')
    const rows: string[][] = []
    for (const m of src.matchAll(/name: '([^']+)',\s*method: '([A-Z]+)',\s*path: '([^']+)'/g)) {
        const name = m[1] ?? ''
        const method = m[2] ?? ''
        const path = (m[3] ?? '').replace(/^\/$/, '')
        rows.push([code(method), code(`${REST_INTAKE_PATH}${path}`), name])
    }
    if (rows.length === 0) throw new Error('no REST routes parsed from authorization_intake.now.ts')
    return table(['Method', 'Path', 'Purpose'], rows)
}

function scriptsBlock(): string {
    const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8')) as { scripts: Record<string, string> }
    return table(
        ['Script', 'Runs'],
        Object.entries(pkg.scripts).map(([k, v]) => [code(`npm run ${k}`), code(v)]),
    )
}

function loadOrderBlock(): string {
    const rows = LOAD_ORDER.map((form, i) => {
        const c = LEGACY_FORMS[form]
        const parent = c.parent ? `${c.parent.column} → ${c.parent.parentForm} (${c.parent.by})` : '—'
        return [
            String(i + 1),
            code(c.csvFile),
            code(c.stagingTable),
            code(c.targetTable),
            c.businessKey ? `${code(c.businessKey)} → ${code(TARGET_BUSINESS_KEY_FIELD[form] ?? '')}` : '—',
            c.statusColumn ? code(c.statusColumn) : '—',
            parent,
        ]
    })
    return table(['#', 'Source CSV', 'Staging table', 'Target table', 'Business key', 'Status column', 'Parent'], rows)
}

function migrationArtefactsBlock(): string {
    const rows = LOAD_ORDER.map((form) => [form, code(dataSourceName(form)), code(transformMapName(form))])
    return [
        table(['Legacy form', 'Data source', 'Transform map'], rows),
        '',
        `Every staging table also carries ${EXTRA_STAGING_COLUMNS.map(code).join(', ')} so each target record and exception can be traced to the batch, file and physical CSV line it came from.`,
    ].join('\n')
}

function exceptionsBlock(): string {
    const types = table(
        ['Type', 'Meaning'],
        Object.entries(MIGRATION_EXCEPTION_TYPES).map(([k, v]) => [code(k), v]),
    )
    const states = Object.entries(MIGRATION_EXCEPTION_STATES)
        .map(([k, v]) => `${code(k)} (${v})`)
        .join(' → ')
    return `${types}\n\nException states: ${states}.`
}

function reconciliationChecksBlock(): string {
    const zero: ExpectedTargets = {
        tables: Object.fromEntries(TABLE_ORDER.filter((k) => k !== 'status_map' && k !== 'migration_exception').map((k) => [TABLES[k], 0])),
        award_line_quantity_total: 0,
        request_line_extended_price_total: '0.00',
        orphan_count: 0,
        duplicate_merge_count: 0,
        unmapped_status_count: 0,
        exception_counts: Object.fromEntries(Object.keys(MIGRATION_EXCEPTION_TYPES).map((k) => [k, 0])),
        cases_by_stage: Object.fromEntries(Object.keys(CASE_STAGES).map((k) => [k, 0])),
        cases_by_aging_flag: {},
        requests_by_state: Object.fromEntries(Object.keys(REQUEST_STATES).map((k) => [k, 0])),
    }
    const report: ComparisonReport = compareReports(zero, {
        tables: [],
        award_line_quantity_total: 0,
        request_line_extended_price_total: '0.00',
        orphan_count: 0,
        duplicate_merge_count: 0,
        unmapped_status_count: 0,
        exception_counts: {},
        cases_by_stage: {},
        requests_by_state: {},
    })
    const names = report.checks.map((c) => c.check)
    const groups = new Map<string, string[]>()
    for (const n of names) {
        const [prefix, rest] = n.includes(':') ? [n.slice(0, n.indexOf(':')), n.slice(n.indexOf(':') + 1)] : [n, '']
        const list = groups.get(prefix) ?? []
        if (rest) list.push(rest)
        groups.set(prefix, list)
    }
    const lines = [...groups.entries()].map(([prefix, members]) =>
        members.length ? `- ${code(prefix + ':*')} — ${members.map(code).join(', ')}` : `- ${code(prefix)}`,
    )
    return `${names.length} checks, each reported as \`OK\` or \`DIFF\` with source and target values:\n\n${lines.join('\n')}`
}

function equivalenceBlock(): string {
    const kinds: Record<EquivalenceRow['kind'], string> = {
        validation: 'Validation (@Formula input translation / QuerySave checks)',
        rule: 'Rules (computed items, QuerySave / PostSave agents)',
        agent: 'Agents (scheduled, web-service, mail)',
        role: 'Roles and Readers fields',
        view: 'Views',
        form: 'Forms',
        xpage: 'XPages',
        export: 'Export / migration',
    }
    const out: string[] = []
    for (const kind of Object.keys(kinds) as EquivalenceRow['kind'][]) {
        const rows = EQUIVALENCE_MATRIX.filter((r) => r.kind === kind)
        if (rows.length === 0) continue
        out.push(`### ${kinds[kind]}`, '')
        out.push(
            table(
                ['Legacy behaviour', 'What it does', 'Implementation', 'Instance artefact(s)', 'Proven by'],
                rows.map((r) => [
                    r.legacy,
                    r.behaviour,
                    r.files.map(code).join('<br>'),
                    r.artefacts.join('<br>'),
                    r.tests.length ? r.tests.map((t) => `"${t}"`).join('<br>') : 'metadata only — verified by `now-sdk build` and on-instance screenshots',
                ]),
            ),
            '',
        )
    }
    const testCount = new Set(EQUIVALENCE_MATRIX.flatMap((r) => r.tests)).size
    out.push(`${EQUIVALENCE_MATRIX.length} legacy behaviours mapped; ${testCount} distinct Vitest cases referenced.`)
    return out.join('\n')
}

// ------------------------------------------------------------------ assembly

export const BLOCKS: Readonly<Record<string, () => string>> = {
    tables: tablesBlock,
    erd: erdBlock,
    'platform-refs': platformRefsBlock,
    mapping: mappingBlock,
    roles: rolesBlock,
    'access-matrix': accessMatrixBlock,
    'field-access': fieldAccessBlock,
    lifecycle: lifecycleBlock,
    rest: restBlock,
    scripts: scriptsBlock,
    'load-order': loadOrderBlock,
    'migration-artefacts': migrationArtefactsBlock,
    exceptions: exceptionsBlock,
    'reconciliation-checks': reconciliationChecksBlock,
    equivalence: equivalenceBlock,
}

const MARKER = /<!-- gen:([a-z-]+) -->[\s\S]*?<!-- \/gen:\1 -->/g

/** Returns the document with every generated block re-rendered. */
export function render(source: string, file: string): string {
    const used = new Set<string>()
    const out = source.replace(MARKER, (_m, name: string) => {
        const block = BLOCKS[name]
        if (!block) throw new Error(`${file}: unknown generated block "${name}"`)
        used.add(name)
        return `<!-- gen:${name} -->\n${block()}\n<!-- /gen:${name} -->`
    })
    if (used.size === 0) throw new Error(`${file}: no generated blocks found`)
    return out
}

export function renderFile(file: DocFile): { current: string; rendered: string } {
    const path = `${ROOT}${file}`
    const current = readFileSync(path, 'utf8')
    return { current, rendered: render(current, file) }
}

/** Referenced files / tests in the docs catalog must exist (both directions are checked in the test). */
export function catalogProblems(): string[] {
    const problems: string[] = []
    for (const row of EQUIVALENCE_MATRIX) {
        for (const f of row.files) {
            if (!existsSync(`${ROOT}${f}`)) problems.push(`${row.legacy}: missing file ${f}`)
        }
    }
    for (const m of DOMINO_MAPPING) {
        for (const w of m.where.split(',').map((s) => s.trim())) {
            const dir = w.includes('*') ? w.slice(0, w.lastIndexOf('/') + 1) : w
            if (!existsSync(`${ROOT}${dir}`)) problems.push(`mapping "${m.domino}": missing path ${w}`)
        }
    }
    return problems
}

function main(argv: readonly string[]): number {
    const check = argv.includes('--check')
    const problems = catalogProblems()
    let stale = 0
    for (const file of DOC_FILES) {
        const { current, rendered } = renderFile(file)
        if (current === rendered) continue
        stale++
        if (check) console.error(`stale: ${file}`)
        else {
            writeFileSync(`${ROOT}${file}`, rendered)
            console.log(`updated ${file}`)
        }
    }
    for (const p of problems) console.error(`catalog: ${p}`)
    if (problems.length) return 1
    if (check && stale) {
        console.error('run `npm run gen:docs`')
        return 1
    }
    if (!stale) console.log('docs up to date')
    return 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    process.exit(main(process.argv.slice(2)))
}

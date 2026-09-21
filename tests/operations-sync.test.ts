import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    AGING_FLAGS,
    AGING_THRESHOLDS,
    CASE_STAGES,
    ROLES,
    TABLES,
    TERMINAL_CASE_STAGES,
    WORKSPACE_TITLE,
    type RoleKey,
} from '../src/server/lib/domain'
import { TERMINAL_STAGES } from '../src/server/lib/aging'
import { TABLE_ACCESS } from '../src/server/lib/security'
import { choiceColumns, OUTPUT_FILES, ROLE_EXPORTS, renderAll, reportFields, validateCatalog, type OutputKey } from '../tools/generate-fluent-operations'
import { declaredColumns } from '../tools/generate-fluent-ui'
import {
    baseQuery,
    DASHBOARD_CHARTS,
    DASHBOARD_COUNTERS,
    moduleRoles,
    OPERATIONS_MODULES,
    OPERATIONS_REPORTS,
    PARTITIONS,
    reportByKey,
    reportRoles,
    SLA_CONDITIONS,
    SLA_DEFINITIONS,
    SLA_START_STAGE,
    SLA_STOP_STAGES,
    STAGE_PARTITION,
    WORKSPACE_LIST_CATEGORIES,
    WORKSPACE_ROUTE,
} from '../tools/lib/operations-catalog'

const REQUIRED_MODULE_TITLES = [
    'Operations dashboard',
    'Aging — red',
    'Aging — amber',
    'Engraving queue',
    'Assembly/QC queue',
    'Warehouse queue',
    'Vendor work',
    'DD 1348-6 review queue',
    'SES flags pending decision',
    'Migration exceptions',
]

const REQUIRED_REPORT_CONCEPTS = [
    'cases_by_stage',
    'aging_distribution',
    'aging_red_cases',
    'engraving_by_status',
    'assembly_qc_queue',
    'warehouse_queue',
    'vendor_work_by_vendor',
    'unmapped_legacy_statuses',
    'migration_exceptions_by_type',
]

const sorted = (xs: Iterable<string>): string[] => [...xs].sort()

describe('operations catalog partitions cover the domain choice sets', () => {
    for (const [name, partition] of Object.entries(PARTITIONS)) {
        it(`${name}: buckets are a disjoint cover of the choice set (both directions)`, () => {
            const choiceKeys = sorted(Object.keys(partition.choices))
            const bucketed = Object.values(partition.buckets).flat()
            expect(sorted(bucketed)).toEqual(choiceKeys)
            expect(new Set(bucketed).size).toBe(bucketed.length)
            for (const value of bucketed) expect(choiceKeys).toContain(value)
        })
    }

    it('control totals', () => {
        expect(Object.keys(CASE_STAGES)).toHaveLength(8)
        expect(STAGE_PARTITION.buckets.in_work).toHaveLength(4)
        expect(STAGE_PARTITION.buckets.shipped).toEqual(['shipped'])
        expect(STAGE_PARTITION.buckets.terminal).toHaveLength(2)
        expect(Object.keys(PARTITIONS)).toHaveLength(5)
    })

    it('terminal stages are the domain definition (TERMINAL_CASE_STAGES), so shipped cases stay active and keep aging', () => {
        expect(sorted(STAGE_PARTITION.buckets.terminal ?? [])).toEqual(sorted(TERMINAL_STAGES))
        expect(STAGE_PARTITION.buckets.terminal).not.toContain('shipped')
        // Every consumer derives the terminal set from domain.ts; no file may re-declare the literal.
        expect(sorted(TERMINAL_CASE_STAGES)).toEqual(sorted(TERMINAL_STAGES))
        const caseLiteral = /\[\s*'closed'\s*,\s*'cancelled'\s*\]|'closed,cancelled'/
        const requestLiteral = /\[\s*'complete'\s*,\s*'cancelled'\s*\]/
        const serverFiles = readdirSync('src/server', { recursive: true, withFileTypes: true })
            .filter((e) => e.isFile() && e.name.endsWith('.ts') && e.name !== 'domain.ts')
            .map((e) => join(e.parentPath, e.name))
        expect(serverFiles.length).toBeGreaterThan(10)
        for (const file of serverFiles) {
            const src = readFileSync(file, 'utf8')
            expect(src, file).not.toMatch(caseLiteral)
            expect(src, file).not.toMatch(requestLiteral)
        }
        expect(readFileSync('tools/lib/operations-catalog.ts', 'utf8')).not.toMatch(caseLiteral)
    })
})

describe('SLA definitions derive from the aging thresholds', () => {
    it('one SLA per non-green aging flag with the matching threshold', () => {
        const flags = sorted(Object.keys(AGING_FLAGS).filter((f) => f !== 'green'))
        expect(sorted(SLA_DEFINITIONS.map((s) => s.flag))).toEqual(flags)
        const byFlag = new Map(SLA_DEFINITIONS.map((s) => [s.flag, s]))
        expect(byFlag.get('amber')?.days).toBe(AGING_THRESHOLDS.amberDays)
        expect(byFlag.get('red')?.days).toBe(AGING_THRESHOLDS.redDays)
        expect(byFlag.get('amber')?.name).toBe(`MAH awards case — amber (${AGING_THRESHOLDS.amberDays}d)`)
        expect(byFlag.get('red')?.name).toBe(`MAH awards case — red (${AGING_THRESHOLDS.redDays}d)`)
        expect(SLA_DEFINITIONS).toHaveLength(2)
    })

    it('start / pause / stop conditions follow the stage partition; the clock stops at shipment and at the terminal stages', () => {
        expect(STAGE_PARTITION.buckets.in_work?.[0]).toBe(SLA_START_STAGE)
        expect(SLA_CONDITIONS.start).toBe(`active=true^stage=${SLA_START_STAGE}`)
        expect(SLA_CONDITIONS.pause).toBe('on_hold=true')
        expect(sorted(SLA_STOP_STAGES)).toEqual(sorted([...(STAGE_PARTITION.buckets.shipped ?? []), ...TERMINAL_STAGES]))
        expect(SLA_CONDITIONS.stop).toBe(`stageIN${SLA_STOP_STAGES.join(',')}`)
        const declared = declaredColumns().awards_case
        for (const field of ['stage', 'on_hold', 'active']) expect(declared.has(field)).toBe(true)
    })

    it('rendered SLA file carries the thresholds and conditions literally', () => {
        const sla = renderAll().sla
        expect(sla).toContain(`Duration({ days: ${AGING_THRESHOLDS.amberDays} })`)
        expect(sla).toContain(`Duration({ days: ${AGING_THRESHOLDS.redDays} })`)
        expect(sla).toContain(`table: '${TABLES.awards_case}'`)
        expect(sla).toContain(`start: '${SLA_CONDITIONS.start}'`)
        expect(sla).toContain(`pause: '${SLA_CONDITIONS.pause}'`)
        expect(sla).toContain(`stop: '${SLA_CONDITIONS.stop}'`)
        expect(sla).toContain(`scheduleSource: 'no_schedule'`)
        expect(sla.match(/= Sla\(/g)).toHaveLength(2)
    })
})

describe('operations reports', () => {
    it('catalog validates (declared columns, widget/report type agreement, grid bounds)', () => {
        expect(() => validateCatalog()).not.toThrow()
    })

    it('every requested report concept exists and every report is one of the tracked concepts or a queue variant', () => {
        const keys = OPERATIONS_REPORTS.map((r) => r.key)
        for (const concept of REQUIRED_REPORT_CONCEPTS) expect(keys).toContain(concept)
        expect(new Set(keys).size).toBe(keys.length)
        expect(keys).toHaveLength(14)
    })

    it('every referenced column is declared on the report table (both directions per table are checked by validateCatalog)', () => {
        const declared = declaredColumns()
        for (const report of OPERATIONS_REPORTS) {
            for (const field of reportFields(report)) expect(declared[report.table].has(field), `${report.key}.${field}`).toBe(true)
        }
    })

    it('report roles equal the read matrix of the report table', () => {
        for (const report of OPERATIONS_REPORTS) {
            expect(sorted(reportRoles(report))).toEqual(sorted(TABLE_ACCESS[report.table].read))
        }
    })

    it('reports span exactly the four operational tables', () => {
        expect(sorted(new Set(OPERATIONS_REPORTS.map((r) => r.table)))).toEqual(sorted(['awards_case', 'engraving_job', 'heraldry_request', 'migration_exception']))
    })

    it('aging views use the aging job population (active cases, any stage) and say "days in stage"; nothing is published by default', () => {
        for (const key of ['aging_red_cases', 'aging_amber_cases'] as const) {
            const report = reportByKey(key)
            expect(baseQuery(report.filter).split('^')).toEqual(['active=true', `aging_flag=${key === 'aging_red_cases' ? 'red' : 'amber'}`])
            expect(report.title).toContain('days in stage')
        }
        expect(baseQuery(reportByKey('cases_by_stage').filter)).toBe('active=true')
        const rendered = renderAll().reports
        expect(rendered.match(/is_published: false/g)).toHaveLength(OPERATIONS_REPORTS.length)
        expect(rendered).not.toContain('is_published: true')
    })
})

describe('dashboard', () => {
    it('counters and charts bind to catalog reports and share their filters', () => {
        for (const counter of DASHBOARD_COUNTERS) expect(reportByKey(counter.report)).toBeDefined()
        for (const chart of DASHBOARD_CHARTS) expect(reportByKey(chart.report)).toBeDefined()
        const rendered = renderAll().workspace
        for (const counter of DASHBOARD_COUNTERS) expect(rendered).toContain(`filterQuery: '${baseQuery(reportByKey(counter.report).filter)}'`)
        for (const chart of DASHBOARD_CHARTS) {
            const report = reportByKey(chart.report)
            expect(rendered).toContain(chart.component === 'list-simple' ? `query: '${report.filter}'` : `filterQuery: '${baseQuery(report.filter)}'`)
        }
        expect(rendered).toContain(`name: '${WORKSPACE_TITLE}'`)
        expect(rendered).toContain(`title: '${WORKSPACE_TITLE}'`)
    })

    it('widget data wiring follows the SDK dashboard guide and keeps every report grouping (both dimensions of stacked reports)', () => {
        const rendered = renderAll().workspace
        const choice = choiceColumns()
        expect(rendered.match(/component: 'single-score'/g)).toHaveLength(DASHBOARD_COUNTERS.length)
        expect(rendered.match(/showZero: true/g)?.length).toBeGreaterThanOrEqual(DASHBOARD_COUNTERS.length)
        expect(rendered).not.toMatch(/aggregate: 'COUNT'|\{ field: '/)
        for (const chart of DASHBOARD_CHARTS) {
            const report = reportByKey(chart.report)
            if (chart.component === 'list-simple') continue
            for (const field of [report.groupBy, report.stackBy].flatMap((f) => (f ? [f] : []))) {
                expect(rendered).toContain(`groupByField: '${field}', isChoice: ${choice[report.table].has(field)}`)
            }
            if (report.stackBy) expect(chart.component).toBe('pivot-table')
        }
        const stacked = OPERATIONS_REPORTS.filter((r) => r.stackBy).map((r) => r.key)
        expect(stacked).toEqual(['vendor_work_by_vendor'])
        expect(rendered.match(/component: 'pivot-table'/g)).toHaveLength(stacked.length)
    })

    it('counter row fills the 48-column grid; control totals', () => {
        expect(48 % DASHBOARD_COUNTERS.length).toBe(0)
        expect(DASHBOARD_COUNTERS).toHaveLength(8)
        expect(DASHBOARD_CHARTS).toHaveLength(10)
        const lists = WORKSPACE_LIST_CATEGORIES.flatMap((c) => c.reports)
        expect(new Set(lists).size).toBe(lists.length)
        expect(lists).toHaveLength(9)
        expect(sorted(lists)).toEqual(sorted(OPERATIONS_REPORTS.filter((r) => r.type === 'list').map((r) => r.key)))
    })
})

describe('application modules', () => {
    it('module titles match the required set exactly (both directions)', () => {
        expect(sorted(OPERATIONS_MODULES.map((m) => m.title))).toEqual(sorted(REQUIRED_MODULE_TITLES))
        expect(OPERATIONS_MODULES).toHaveLength(10)
    })

    it('module roles are domain roles, every domain role is used, and vendor sees only "Vendor work"', () => {
        const roleKeys = sorted(Object.keys(ROLES))
        const used = new Set<RoleKey>()
        for (const mod of OPERATIONS_MODULES) {
            for (const role of moduleRoles(mod)) {
                expect(roleKeys).toContain(role)
                used.add(role)
            }
        }
        expect(sorted(used)).toEqual(roleKeys)
        const vendorModules = OPERATIONS_MODULES.filter((m) => moduleRoles(m).includes('vendor')).map((m) => m.title)
        expect(vendorModules).toEqual(['Vendor work'])
    })

    it('operations modules are defined exactly once: no navigator destination or title is duplicated across app_menu.now.ts and the generated file', () => {
        const appMenu = readFileSync('src/fluent/ui/app_menu.now.ts', 'utf8')
        const generated = renderAll().modules
        expect(generated).toContain(`query: '${WORKSPACE_ROUTE}'`)
        expect(appMenu).not.toContain(WORKSPACE_ROUTE)
        const destinations = (src: string): string[] => {
            const out: string[] = []
            for (const m of src.matchAll(/table: 'sys_app_module',\s*data: \{([\s\S]*?)\n\s*\},?\n\s*\}\)/g)) {
                const body = m[1] ?? ''
                const title = /title: '([^']+)'/.exec(body)?.[1] ?? ''
                const link = /link_type: '([^']+)'/.exec(body)?.[1] ?? ''
                const name = /\bname: '([^']+)'/.exec(body)?.[1] ?? ''
                const filter = /filter: '([^']*)'/.exec(body)?.[1] ?? ''
                const query = /query: '([^']*)'/.exec(body)?.[1] ?? ''
                const report = /report: (\w+)/.exec(body)?.[1] ?? ''
                out.push(`title:${title}`)
                if (link !== 'SEPARATOR') out.push(`${link}|${name}|${filter}|${query}|${report}`)
            }
            return out
        }
        const all = [...destinations(appMenu), ...destinations(generated)]
        expect(all.length).toBeGreaterThan(OPERATIONS_MODULES.length + 10)
        const dupes = all.filter((d, i) => all.indexOf(d) !== i)
        expect(dupes).toEqual([])
    })

    it('docs/WORKSPACE.md module table lists exactly the catalog modules (both directions)', () => {
        const doc = readFileSync('docs/WORKSPACE.md', 'utf8')
        const section = doc.slice(doc.indexOf('### Application modules'), doc.indexOf('## What remains manual'))
        const documented = [...section.matchAll(/^\| ([^|]+?) \| (?:report|list|`now)/gm)].map((m) => m[1] ?? '')
        expect(sorted(documented)).toEqual(sorted(OPERATIONS_MODULES.map((m) => m.title)))
        expect(doc).toContain(`${OPERATIONS_MODULES.length} modules`.replace(/^\d+/, (n) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][Number(n)] ?? n))
    })

    it('role exports referenced by the workspace file exist in roles.now.ts with the domain role names', () => {
        const roles = readFileSync('src/fluent/security/roles.now.ts', 'utf8')
        for (const key of Object.keys(ROLE_EXPORTS) as RoleKey[]) {
            const exportName = ROLE_EXPORTS[key]
            const block = new RegExp(`export const ${exportName} = Role\\(\\{[^}]*name: '${ROLES[key].replace('.', '\\.')}'`)
            expect(roles, exportName).toMatch(block)
        }
        expect(sorted(Object.keys(ROLE_EXPORTS))).toEqual(sorted(Object.keys(ROLES)))
    })
})

describe('generated Fluent files are in sync with the catalog', () => {
    const rendered = renderAll()
    for (const key of Object.keys(OUTPUT_FILES) as OutputKey[]) {
        it(`${OUTPUT_FILES[key]} matches the generator output`, () => {
            expect(readFileSync(OUTPUT_FILES[key], 'utf8')).toBe(rendered[key])
        })
    }

    it('generated files avoid Fluent parser gotchas (no spread, satisfies or helper functions)', () => {
        for (const text of Object.values(rendered)) {
            expect(text).not.toMatch(/\.\.\./)
            expect(text).not.toMatch(/\bsatisfies\b/)
            expect(text).not.toMatch(/\bfunction\b|=>/)
        }
    })
})

describe('flow action inputs', () => {
    it('vendor-release flow references the release notification by the sys_id pinned in generated/keys.ts', () => {
        // action.core.sendNotification takes a sysevent_email_action reference; handing it the Fluent object
        // serialises the whole record into the flow snapshot and activation fails on the instance.
        const keys = readFileSync('src/fluent/generated/keys.ts', 'utf8')
        const pinned = /ntf_request_released:\s*\{\s*table: 'sysevent_email_action'\s*id: '([0-9a-f]{32})'/.exec(keys)?.[1]
        expect(pinned).toBeTruthy()
        const flow = readFileSync('src/fluent/workflows/vendor_release.now.ts', 'utf8')
        expect(flow).toMatch(new RegExp(`notification: '${pinned}'`))
        expect(flow).not.toMatch(/notifications\.now/)
    })
})

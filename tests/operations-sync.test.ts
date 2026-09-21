import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
    AGING_FLAGS,
    AGING_THRESHOLDS,
    CASE_STAGES,
    ROLES,
    TABLES,
    WORKSPACE_TITLE,
    type RoleKey,
} from '../src/server/lib/domain'
import { TABLE_ACCESS } from '../src/server/lib/security'
import { OUTPUT_FILES, ROLE_EXPORTS, renderAll, reportFields, validateCatalog, type OutputKey } from '../tools/generate-fluent-operations'
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
        expect(STAGE_PARTITION.buckets.open).toHaveLength(4)
        expect(STAGE_PARTITION.buckets.terminal).toHaveLength(3)
        expect(Object.keys(PARTITIONS)).toHaveLength(5)
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

    it('start / pause / stop conditions follow the stage partition', () => {
        expect(STAGE_PARTITION.buckets.open?.[0]).toBe(SLA_START_STAGE)
        expect(SLA_CONDITIONS.start).toBe(`active=true^stage=${SLA_START_STAGE}`)
        expect(SLA_CONDITIONS.pause).toBe('on_hold=true')
        expect(SLA_CONDITIONS.stop).toBe(`stageIN${STAGE_PARTITION.buckets.terminal?.join(',')}`)
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
        expect(OPERATIONS_MODULES).toHaveLength(8)
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

    it('dashboard module links to the same workspace route as the existing application menu', () => {
        const appMenu = readFileSync('src/fluent/ui/app_menu.now.ts', 'utf8')
        expect(appMenu).toContain(`'${WORKSPACE_ROUTE}'`)
        expect(renderAll().modules).toContain(`query: '${WORKSPACE_ROUTE}'`)
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

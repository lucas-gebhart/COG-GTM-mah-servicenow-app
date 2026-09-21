/**
 * Renders the "MAH Operations" catalog (tools/lib/operations-catalog.ts) into Fluent metadata:
 *
 *   src/fluent/sla/awards_case_sla.now.ts            contract_sla: 60-day amber / 75-day red awards SLAs
 *   src/fluent/reports/operations_reports.now.ts     sys_report_source + sys_report records
 *   src/fluent/workspace/mah_operations_workspace.now.ts  Applicability, UxListMenuConfig, Workspace, ux_route ACL, Dashboard
 *   src/fluent/ui/operations_modules.now.ts          sys_app_module records under the existing application menu
 *
 * The generated files contain literal strings only (no helpers, spread or `satisfies`) because
 * the Fluent parser rejects those constructs. Run `npx tsx tools/generate-fluent-operations.ts`
 * to regenerate, or `--check` to fail when the files on disk are stale.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { TABLES, WORKSPACE_TITLE, type DomainTableKey, type RoleKey } from '../src/server/lib/domain'
import { declaredColumns } from './generate-fluent-ui'
import {
    baseQuery,
    COUNTER_ROW_HEIGHT,
    DASHBOARD_CHARTS,
    DASHBOARD_COUNTERS,
    dashboardRoles,
    moduleRoles,
    OPERATIONS_MODULES,
    OPERATIONS_REPORTS,
    queryFields,
    reportByKey,
    reportRoles,
    reportSourceKey,
    reportSourceName,
    reportTables,
    roleNames,
    separatorRoles,
    tableReadRoles,
    SLA_CONDITIONS,
    SLA_DEFINITIONS,
    WORKSPACE_LANDING,
    WORKSPACE_LIST_CATEGORIES,
    WORKSPACE_PATH,
    WORKSPACE_ROUTE,
    type OperationsReport,
} from './lib/operations-catalog'

const HEADER = [
    '// GENERATED FILE - do not edit by hand.',
    '// Source of truth: tools/lib/operations-catalog.ts (derived from src/server/lib/domain.ts, security.ts, uiLayout.ts).',
    '// Regenerate with `npx tsx tools/generate-fluent-operations.ts`; tests/operations-sync.test.ts fails when stale.',
].join('\n')

/** Fluent export names of the Role() records in src/fluent/security/roles.now.ts, by domain role key. */
export const ROLE_EXPORTS: Readonly<Record<RoleKey, string>> = {
    tacom_staff: 'tacomStaff',
    csr: 'csr',
    engraver: 'engraver',
    assembler: 'assembler',
    warehouse: 'warehouse',
    vendor: 'vendor',
    dla: 'dla',
    admin: 'admin',
}

export const OUTPUT_FILES = {
    sla: 'src/fluent/sla/awards_case_sla.now.ts',
    reports: 'src/fluent/reports/operations_reports.now.ts',
    workspace: 'src/fluent/workspace/mah_operations_workspace.now.ts',
    modules: 'src/fluent/ui/operations_modules.now.ts',
} as const

export type OutputKey = keyof typeof OUTPUT_FILES

// ------------------------------------------------------------------ helpers

const q = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const arr = (items: readonly string[]): string => `[${items.map(q).join(', ')}]`
const rolesLiteral = (keys: readonly RoleKey[]): string => arr(roleNames(keys))
const reportExport = (key: string): string => `opsReport_${key}`
const reportId = (key: string): string => `ops_report_${key}`
const applicabilityExport = (table: DomainTableKey): string => `opsApplicability_${table}`

const TABLES_DIR = fileURLToPath(new URL('../src/fluent/tables/', import.meta.url))

/** Choice columns per table, parsed from the Fluent table files (drives `isChoice` on dashboard groupings). */
export function choiceColumns(): Record<DomainTableKey, Set<string>> {
    const out = {} as Record<DomainTableKey, Set<string>>
    for (const file of readdirSync(TABLES_DIR)) {
        if (!file.endsWith('.now.ts')) continue
        const key = file.replace('.now.ts', '') as DomainTableKey
        const src = readFileSync(TABLES_DIR + file, 'utf8')
        out[key] = new Set([...src.matchAll(/^ {8}([a-z0-9_]+): ChoiceColumn\(/gm)].flatMap((m) => (m[1] === undefined ? [] : [m[1]])))
    }
    return out
}

export function reportColumns(report: OperationsReport): readonly string[] {
    if (report.type !== 'list') return []
    return report.columns ?? []
}

/** Every column a report touches (filter terms, group-by, stack-by, list columns). */
export function reportFields(report: OperationsReport): string[] {
    const fields = new Set<string>(queryFields(report.filter))
    if (report.groupBy) fields.add(report.groupBy)
    if (report.stackBy) fields.add(report.stackBy)
    reportColumns(report).forEach((c) => fields.add(c))
    return [...fields]
}

export function validateCatalog(): void {
    const seen = new Set<string>()
    const declared = declaredColumns()
    for (const report of OPERATIONS_REPORTS) {
        if (seen.has(report.key)) throw new Error(`duplicate report key ${report.key}`)
        seen.add(report.key)
        if (report.type === 'list' && (!report.columns || report.columns.length === 0)) {
            throw new Error(`list report ${report.key} has no columns`)
        }
        if (report.type !== 'list' && !report.groupBy) throw new Error(`chart report ${report.key} has no groupBy`)
        if (report.stackBy && report.type !== 'bar') throw new Error(`report ${report.key}: stackBy is only valid on bar reports`)
        for (const field of reportFields(report)) {
            if (!declared[report.table].has(field)) throw new Error(`report ${report.key}: ${TABLES[report.table]}.${field} is not a declared column`)
        }
    }
    for (const counter of DASHBOARD_COUNTERS) reportByKey(counter.report)
    for (const chart of DASHBOARD_CHARTS) {
        const report = reportByKey(chart.report)
        if (chart.component === 'list-simple' && report.type !== 'list') throw new Error(`chart ${chart.report}: list widget bound to a chart report`)
        if (chart.component !== 'list-simple' && report.type === 'list') throw new Error(`chart ${chart.report}: chart widget bound to a list report`)
        if (chart.component === 'pivot-table' && !report.stackBy) throw new Error(`chart ${chart.report}: pivot-table needs a stackBy column`)
        if (chart.component !== 'pivot-table' && report.stackBy) throw new Error(`chart ${chart.report}: stacked report must render as a pivot-table (second grouping would be dropped)`)
        if (chart.x + chart.width > 48) throw new Error(`chart ${chart.report} overflows the 48-column grid`)
    }
    for (const category of WORKSPACE_LIST_CATEGORIES) {
        for (const key of category.reports) {
            if (reportByKey(key).type !== 'list') throw new Error(`workspace list ${key} must be a list report`)
        }
    }
    for (const mod of OPERATIONS_MODULES) {
        if (mod.target.kind === 'report') reportByKey(mod.target.report)
    }
}

// ------------------------------------------------------------------ SLA

export function renderSla(): string {
    const lines: string[] = [
        HEADER,
        `import '@servicenow/sdk/global'`,
        `import { Sla } from '@servicenow/sdk/core'`,
        '',
        `// Timers start when an awards case enters the first open stage, pause while the case is on hold and stop`,
        `// when the case reaches a terminal stage. scheduleSource 'no_schedule' = 24x7 wall-clock, no instance schedule.`,
    ]
    for (const sla of SLA_DEFINITIONS) {
        lines.push(
            '',
            `export const sla_${sla.key} = Sla({`,
            `    $id: Now.ID[${q(`sla_${sla.key}`)}],`,
            `    name: ${q(sla.name)},`,
            `    table: ${q(TABLES.awards_case)},`,
            `    active: true,`,
            `    type: 'SLA',`,
            `    duration: Duration({ days: ${sla.days} }),`,
            `    scheduleSource: 'no_schedule',`,
            `    conditions: {`,
            `        start: ${q(SLA_CONDITIONS.start)},`,
            `        pause: ${q(SLA_CONDITIONS.pause)},`,
            `        stop: ${q(SLA_CONDITIONS.stop)},`,
            `    },`,
            `})`,
        )
    }
    return lines.join('\n') + '\n'
}

// ------------------------------------------------------------------ reports

function reportType(report: OperationsReport): string {
    return report.type
}

export function renderReports(): string {
    const lines: string[] = [
        HEADER,
        `import '@servicenow/sdk/global'`,
        `import { Record } from '@servicenow/sdk/core'`,
        '',
        `// Report sources are table-scoped on the platform, so "${WORKSPACE_TITLE}" is one source per operational table.`,
    ]
    for (const table of reportTables()) {
        lines.push(
            '',
            `export const ${reportSourceKey(table)} = Record({`,
            `    $id: Now.ID[${q(reportSourceKey(table))}],`,
            `    table: 'sys_report_source',`,
            `    data: {`,
            `        name: ${q(reportSourceName(table))},`,
            `        table: ${q(TABLES[table])},`,
            `        filter: 'active=true',`,
            `        description: ${q(`${WORKSPACE_TITLE} reports over ${TABLES[table]} (modernization reference application).`)},`,
            `    },`,
            `})`,
        )
    }
    for (const report of OPERATIONS_REPORTS) {
        lines.push(
            '',
            `export const ${reportExport(report.key)} = Record({`,
            `    $id: Now.ID[${q(reportId(report.key))}],`,
            `    table: 'sys_report',`,
            `    data: {`,
            `        title: ${q(report.title)},`,
            `        description: ${q(report.description)},`,
            `        table: ${q(TABLES[report.table])},`,
            `        report_source: ${reportSourceKey(report.table)},`,
            `        type: ${q(reportType(report))},`,
            `        filter: ${q(report.filter)},`,
        )
        if (report.type === 'list') {
            lines.push(`        field_list: ${q(reportColumns(report).join(','))},`)
        } else {
            lines.push(`        aggregate: 'COUNT',`, `        field: ${q(report.groupBy ?? '')},`)
            if (report.stackBy) lines.push(`        additional_groupby: ${q(report.stackBy)},`)
            lines.push(`        chart_size: 'large',`, `        display_grid: true,`, `        others: 'no',`)
        }
        lines.push(
            `        roles: ${rolesLiteral(reportRoles(report))},`,
            `        is_published: false,`,
            `    },`,
            `})`,
        )
    }
    return lines.join('\n') + '\n'
}

// ------------------------------------------------------------------ workspace + dashboard

function widgetId(prefix: string, key: string): string {
    return `ops_widget_${prefix}_${key}`
}

// Widget componentProps follow the Platform Analytics data-wiring contract documented in
// node_modules/@servicenow/sdk/docs/guides/dashboard-guide.md: a table data source with an id, metrics
// bound to that id, and (for category charts) groupBy entries naming the data source and field.
const DS = 'ds_1'

function dataSourceLines(report: OperationsReport, extra = ''): string[] {
    return [
        `                        dataSources: [`,
        `                            { sourceType: 'table', tableOrViewName: ${q(TABLES[report.table])}, filterQuery: ${q(baseQuery(report.filter))}, id: ${q(DS)}${extra} },`,
        `                        ],`,
    ]
}

function groupByEntry(field: string, isChoice: boolean, extra: string): string {
    return `                            { groupBy: [{ dataSource: ${q(DS)}, groupByField: ${q(field)}, isChoice: ${isChoice} }], ${extra} },`
}

function renderCounterWidget(index: number, key: string, label: string, report: OperationsReport): string[] {
    const width = 48 / DASHBOARD_COUNTERS.length
    return [
        `                {`,
        `                    $id: Now.ID[${q(widgetId('count', key))}],`,
        `                    component: 'single-score',`,
        `                    componentProps: {`,
        `                        headerTitle: ${q(label)},`,
        `                        showZero: true,`,
        ...dataSourceLines(report),
        `                        metrics: [{ dataSource: ${q(DS)}, aggregateFunction: 'COUNT', axisId: 'primary' }],`,
        `                    },`,
        `                    width: ${width},`,
        `                    height: ${COUNTER_ROW_HEIGHT},`,
        `                    position: { x: ${index * width}, y: 0 },`,
        `                },`,
    ]
}

function renderChartWidget(chart: (typeof DASHBOARD_CHARTS)[number], choice: Record<DomainTableKey, Set<string>>): string[] {
    const report = reportByKey(chart.report)
    const isChoice = (field: string): boolean => choice[report.table].has(field)
    const lines = [
        `                {`,
        `                    $id: Now.ID[${q(widgetId('chart', chart.report))}],`,
        `                    component: ${q(chart.component)},`,
        `                    componentProps: {`,
    ]
    if (chart.component === 'list-simple') {
        lines.push(
            `                        listTitle: ${q(report.title)},`,
            `                        table: ${q(TABLES[report.table])},`,
            `                        query: ${q(report.filter)},`,
            `                        fixedQuery: '',`,
            `                        columns: ${q(reportColumns(report).join(','))},`,
            `                        limit: ${chart.limit ?? 15},`,
            `                        showBorder: true,`,
        )
    } else if (chart.component === 'pivot-table') {
        const groupBy = report.groupBy ?? ''
        const stackBy = report.stackBy ?? ''
        lines.push(
            `                        headerTitle: ${q(report.title)},`,
            `                        newReporting: true,`,
            `                        dataCategory: 'group',`,
            `                        showZero: true,`,
            `                        showFirstGroupAggregate: true,`,
            `                        showSecondGroupAggregate: true,`,
            `                        showTotalAggregate: true,`,
            ...dataSourceLines(report, `, dataCategories: ['trend', 'group', 'simple']`),
            `                        groupBy: [`,
            groupByEntry(groupBy, isChoice(groupBy), `categoryIndex: 0, maxNumberOfGroups: 'ALL', numberOfGroupsBasedOn: 'NO_OF_GROUP_BASED_ON_PER_METRIC'`),
            groupByEntry(stackBy, isChoice(stackBy), `categoryIndex: 1, maxNumberOfGroups: 'ALL', numberOfGroupsBasedOn: 'NO_OF_GROUP_BASED_ON_PER_METRIC'`),
            `                        ],`,
            `                        metrics: [{ dataSource: ${q(DS)}, aggregateFunction: 'COUNT', axisId: 'primary', id: 'metric_1', numberFormat: { customFormat: false } }],`,
        )
    } else {
        const groupBy = report.groupBy ?? ''
        lines.push(
            `                        headerTitle: ${q(report.title)},`,
            `                        showDataLabels: true,`,
            `                        showLegend: ${chart.component === 'donut'},`,
            ...dataSourceLines(report),
            `                        groupBy: [`,
            groupByEntry(groupBy, isChoice(groupBy), `maxNumberOfGroups: 'ALL', sortBy: 'value', sortByOrder: 'desc'`),
            `                        ],`,
            `                        metrics: [{ dataSource: ${q(DS)}, aggregateFunction: 'COUNT', axisId: 'primary' }],`,
        )
    }
    lines.push(
        `                    },`,
        `                    width: ${chart.width},`,
        `                    height: ${chart.height},`,
        `                    position: { x: ${chart.x}, y: ${chart.y} },`,
        `                },`,
    )
    return lines
}

export function renderWorkspace(): string {
    const roleExports = (Object.keys(ROLE_EXPORTS) as RoleKey[]).map((k) => ROLE_EXPORTS[k])
    const listTables = [...new Set(WORKSPACE_LIST_CATEGORIES.flatMap((c) => c.reports.map((r) => reportByKey(r).table)))]
    const lines: string[] = [
        HEADER,
        `import '@servicenow/sdk/global'`,
        `import { Acl, Applicability, Dashboard, UxListMenuConfig, Workspace } from '@servicenow/sdk/core'`,
        `import { ${roleExports.join(', ')} } from '../security/roles.now'`,
        '',
        `// Workspace list applicabilities mirror the read matrix of each table (src/server/lib/security.ts).`,
    ]
    for (const table of listTables) {
        const roles = tableReadRoles(table)
        lines.push(
            '',
            `export const ${applicabilityExport(table)} = Applicability({`,
            `    $id: Now.ID[${q(`ops_applicability_${table}`)}],`,
            `    name: ${q(`${WORKSPACE_TITLE}: ${TABLES[table]} readers`)},`,
            `    description: ${q(`Roles that may read ${TABLES[table]}; drives which ${WORKSPACE_TITLE} lists a user sees.`)},`,
            `    active: true,`,
            `    roles: [${roles.map((r) => ROLE_EXPORTS[r]).join(', ')}],`,
            `})`,
        )
    }

    lines.push(
        '',
        `export const opsListMenu = UxListMenuConfig({`,
        `    $id: Now.ID['ops_list_menu'],`,
        `    name: ${q(`${WORKSPACE_TITLE} lists`)},`,
        `    active: true,`,
        `    description: ${q(`Operational queues for the ${WORKSPACE_TITLE} workspace.`)},`,
        `    categories: [`,
    )
    WORKSPACE_LIST_CATEGORIES.forEach((category, ci) => {
        lines.push(
            `        {`,
            `            $id: Now.ID[${q(`ops_list_category_${category.key}`)}],`,
            `            title: ${q(category.title)},`,
            `            active: true,`,
            `            order: ${(ci + 1) * 100},`,
            `            lists: [`,
        )
        category.reports.forEach((key, li) => {
            const report = reportByKey(key)
            lines.push(
                `                {`,
                `                    $id: Now.ID[${q(`ops_list_${key}`)}],`,
                `                    title: ${q(report.title)},`,
                `                    table: ${q(TABLES[report.table])},`,
                `                    condition: ${q(report.filter)},`,
                `                    columns: ${q(reportColumns(report).join(','))},`,
                `                    active: true,`,
                `                    order: ${(li + 1) * 100},`,
                `                    applicabilities: [{ $id: Now.ID[${q(`ops_list_applicability_${key}`)}], applicability: ${applicabilityExport(report.table)} }],`,
                `                },`,
            )
        })
        lines.push(`            ],`, `        },`)
    })
    lines.push(`    ],`, `})`)

    const workspaceTables = (Object.keys(TABLES) as DomainTableKey[]).map((k) => TABLES[k])
    lines.push(
        '',
        `export const opsWorkspace = Workspace({`,
        `    $id: Now.ID['ops_workspace'],`,
        `    title: ${q(WORKSPACE_TITLE)},`,
        `    path: ${q(WORKSPACE_PATH)},`,
        `    landingPath: ${q(WORKSPACE_LANDING)},`,
        `    active: true,`,
        `    listConfig: opsListMenu,`,
        `    tables: ${arr(workspaceTables)},`,
        `})`,
        '',
        `// Route ACL: who may open /${WORKSPACE_ROUTE}. Record-level ACLs are owned by src/fluent/security/acls.now.ts.`,
        `export const opsWorkspaceRouteAcl = Acl({`,
        `    $id: Now.ID['ops_workspace_route_acl'],`,
        `    localOrExisting: 'Existing',`,
        `    type: 'ux_route',`,
        `    operation: 'read',`,
        `    roles: ${rolesLiteral(dashboardRoles())},`,
        `    name: ${q(`now.${WORKSPACE_PATH}.*`)},`,
        `})`,
        '',
        `export const opsDashboard = Dashboard({`,
        `    $id: Now.ID['ops_dashboard'],`,
        `    name: ${q(WORKSPACE_TITLE)},`,
        `    active: true,`,
        `    description: ${q(`Stage / aging counters, fulfilment queues, vendor work and migration exceptions for the ${WORKSPACE_TITLE} workspace.`)},`,
        `    tabs: [`,
        `        {`,
        `            $id: Now.ID['ops_dashboard_tab_operations'],`,
        `            name: 'Operations',`,
        `            active: true,`,
        `            widgets: [`,
    )
    DASHBOARD_COUNTERS.forEach((counter, i) => {
        lines.push(...renderCounterWidget(i, counter.key, counter.label, reportByKey(counter.report)))
    })
    const choice = choiceColumns()
    for (const chart of DASHBOARD_CHARTS) lines.push(...renderChartWidget(chart, choice))
    lines.push(
        `            ],`,
        `        },`,
        `    ],`,
        `    visibilities: [{ $id: Now.ID['ops_dashboard_visibility'], experience: opsWorkspace }],`,
        `})`,
    )
    return lines.join('\n') + '\n'
}

// ------------------------------------------------------------------ application modules

export function renderModules(): string {
    const lines: string[] = [
        HEADER,
        `import '@servicenow/sdk/global'`,
        `import { Record } from '@servicenow/sdk/core'`,
        `import { mahMenu } from './app_menu.now'`,
    ]
    const reportImports = OPERATIONS_MODULES.flatMap((m) => (m.target.kind === 'report' ? [reportExport(m.target.report)] : []))
    lines.push(`import { ${reportImports.join(', ')} } from '../reports/operations_reports.now'`, '')
    lines.push(
        `export const opsModSeparator = Record({`,
        `    $id: Now.ID['ops_mod_separator'],`,
        `    table: 'sys_app_module',`,
        `    data: {`,
        `        title: ${q(WORKSPACE_TITLE)},`,
        `        application: mahMenu,`,
        `        link_type: 'SEPARATOR',`,
        `        active: true,`,
        `        order: ${OPERATIONS_MODULES.reduce((min, m) => Math.min(min, m.order), Number.MAX_SAFE_INTEGER) - 1},`,
        `        roles: ${rolesLiteral(separatorRoles())},`,
        `    },`,
        `})`,
    )
    for (const mod of OPERATIONS_MODULES) {
        lines.push(
            '',
            `export const opsMod_${mod.key} = Record({`,
            `    $id: Now.ID[${q(`ops_mod_${mod.key}`)}],`,
            `    table: 'sys_app_module',`,
            `    data: {`,
            `        title: ${q(mod.title)},`,
            `        application: mahMenu,`,
        )
        if (mod.target.kind === 'dashboard') {
            lines.push(`        link_type: 'DIRECT',`, `        query: ${q(WORKSPACE_ROUTE)},`)
        } else {
            lines.push(`        link_type: 'REPORT',`, `        report: ${reportExport(mod.target.report)},`)
        }
        lines.push(
            `        hint: ${q(mod.hint)},`,
            `        active: true,`,
            `        order: ${mod.order},`,
            `        roles: ${rolesLiteral(moduleRoles(mod))},`,
            `    },`,
            `})`,
        )
    }
    return lines.join('\n') + '\n'
}

// ------------------------------------------------------------------ entry point

export function renderAll(): Record<OutputKey, string> {
    validateCatalog()
    return {
        sla: renderSla(),
        reports: renderReports(),
        workspace: renderWorkspace(),
        modules: renderModules(),
    }
}

export function main(argv: readonly string[]): number {
    const check = argv.includes('--check')
    const rendered = renderAll()
    let stale = 0
    for (const key of Object.keys(rendered) as OutputKey[]) {
        const path = OUTPUT_FILES[key]
        const next = rendered[key]
        let current: string | undefined
        try {
            current = readFileSync(path, 'utf8')
        } catch {
            current = undefined
        }
        if (current === next) continue
        stale++
        if (check) {
            console.error(`stale: ${path}`)
        } else {
            writeFileSync(path, next)
            console.log(`wrote ${path}`)
        }
    }
    if (check && stale > 0) return 1
    if (stale === 0) console.log('operations metadata up to date')
    return 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    process.exitCode = main(process.argv.slice(2))
}

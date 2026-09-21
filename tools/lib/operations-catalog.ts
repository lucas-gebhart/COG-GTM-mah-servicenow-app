/**
 * "MAH Operations" catalog: the single source of truth for the operator-facing reporting layer
 * (report sources, reports, dashboard widgets, workspace lists, application modules and the
 * awards-case SLA definitions).
 *
 * Every choice value, threshold, role and column referenced here is derived from
 * src/server/lib/domain.ts, src/server/lib/security.ts and src/server/lib/uiLayout.ts —
 * nothing is hand-copied. `tools/generate-fluent-operations.ts` renders this catalog into
 * Fluent `.now.ts` files and `tests/operations-sync.test.ts` fails when the rendered files,
 * this catalog and the domain registry drift apart.
 */
import {
    AGING_FLAGS,
    AGING_THRESHOLDS,
    CASE_STAGES,
    ENGRAVING_STATUSES,
    MIGRATION_EXCEPTION_STATES,
    MIGRATION_EXCEPTION_TYPES,
    REQUEST_STATES,
    ROLES,
    WORKSPACE_TITLE,
    type AgingFlag,
    type CaseStage,
    type DomainTableKey,
    type MigrationExceptionType,
    type RequestState,
    type RoleKey,
} from '../../src/server/lib/domain'
import { TABLE_ACCESS } from '../../src/server/lib/security'
import { UI_LAYOUT } from '../../src/server/lib/uiLayout'

// ------------------------------------------------------------------ workspace identity

/** URL segment of the workspace: `/now/<path>/<landing>`; app_menu.now.ts links to the same route. */
export const WORKSPACE_PATH = 'mah-operations'
export const WORKSPACE_LANDING = 'home'
export const WORKSPACE_ROUTE = `now/${WORKSPACE_PATH}/${WORKSPACE_LANDING}`

// ------------------------------------------------------------------ choice partitions
//
// Each partition splits a domain choice set into the operational buckets the queues use. The
// sync test asserts every partition is a disjoint cover of its choice set, so adding a stage /
// status to domain.ts without deciding which bucket it belongs to fails the build.

type EngravingStatus = keyof typeof ENGRAVING_STATUSES
type MigrationExceptionState = keyof typeof MIGRATION_EXCEPTION_STATES

export interface Partition<K extends string> {
    readonly choices: Readonly<Record<K, string>>
    readonly buckets: Readonly<Record<string, readonly K[]>>
}

export const STAGE_PARTITION: Partition<CaseStage> = {
    choices: CASE_STAGES,
    buckets: {
        open: ['authorized', 'engraving', 'assembly_qc', 'warehouse'],
        terminal: ['shipped', 'closed', 'cancelled'],
        exception: ['unmapped'],
    },
}

export const ENGRAVING_PARTITION: Partition<EngravingStatus> = {
    choices: ENGRAVING_STATUSES,
    buckets: {
        open: ['queued', 'in_progress', 'qc_hold', 'rework'],
        terminal: ['complete', 'cancelled'],
        exception: ['unmapped'],
    },
}

export const REQUEST_PARTITION: Partition<RequestState> = {
    choices: REQUEST_STATES,
    buckets: {
        internal: ['draft', 'submitted', 'in_review'],
        vendor: ['released_to_vendor', 'in_production', 'shipped'],
        terminal: ['complete', 'cancelled'],
        exception: ['unmapped'],
    },
}

export const EXCEPTION_STATE_PARTITION: Partition<MigrationExceptionState> = {
    choices: MIGRATION_EXCEPTION_STATES,
    buckets: {
        open: ['open', 'triaged'],
        closed: ['resolved', 'accepted'],
    },
}

export const EXCEPTION_TYPE_PARTITION: Partition<MigrationExceptionType> = {
    choices: MIGRATION_EXCEPTION_TYPES,
    buckets: {
        unmapped_status: ['unmapped_status', 'unmapped_value'],
        structural: ['orphan_parent', 'invalid_reference', 'duplicate_requester', 'duplicate_business_key'],
        data_quality: ['invalid_date', 'validation', 'rejected_row', 'contradictory_source'],
    },
}

export const PARTITIONS: Readonly<Record<string, Partition<string>>> = {
    stage: STAGE_PARTITION,
    engraving_status: ENGRAVING_PARTITION,
    request_state: REQUEST_PARTITION,
    exception_state: EXCEPTION_STATE_PARTITION,
    exception_type: EXCEPTION_TYPE_PARTITION,
}

function bucket<K extends string>(p: Partition<K>, name: string): readonly K[] {
    const values = p.buckets[name]
    if (!values) throw new Error(`unknown bucket ${name}`)
    return values
}

// ------------------------------------------------------------------ encoded-query helpers

export function inQuery(field: string, values: readonly string[]): string {
    return values.length === 1 ? `${field}=${values[0]}` : `${field}IN${values.join(',')}`
}

/** Strips ORDERBY terms so a list filter can double as a counter / chart filter. */
export function baseQuery(filter: string): string {
    return filter
        .split('^')
        .filter((term) => !term.startsWith('ORDERBY'))
        .join('^')
}

/** Field names referenced by an encoded query (left-hand side of each term, ORDERBY targets included). */
export function queryFields(filter: string): string[] {
    const fields: string[] = []
    for (const term of filter.split('^')) {
        if (term === '') continue
        const m = /^(?:ORDERBY(?:DESC)?)?([a-z0-9_]+)/.exec(term)
        if (m?.[1]) fields.push(m[1])
    }
    return fields
}

const OPEN_STAGES = bucket(STAGE_PARTITION, 'open')
const TERMINAL_STAGES = bucket(STAGE_PARTITION, 'terminal')
const OPEN_ENGRAVING = bucket(ENGRAVING_PARTITION, 'open')
const VENDOR_STATES = bucket(REQUEST_PARTITION, 'vendor')
const OPEN_EXCEPTIONS = bucket(EXCEPTION_STATE_PARTITION, 'open')
const UNMAPPED_EXCEPTION_TYPES = bucket(EXCEPTION_TYPE_PARTITION, 'unmapped_status')

const openCases = `active=true^${inQuery('stage', OPEN_STAGES)}`
const agingFlag = (flag: AgingFlag): string => `${openCases}^aging_flag=${flag}`

// ------------------------------------------------------------------ SLA definitions

export interface SlaDefinition {
    readonly key: string
    readonly name: string
    readonly flag: AgingFlag
    readonly days: number
    readonly description: string
}

const slaName = (flag: AgingFlag, days: number): string => `MAH awards case — ${AGING_FLAGS[flag].toLowerCase()} (${days}d)`

/** Stage whose entry starts the awards-case SLA timers (the first open stage). */
export const SLA_START_STAGE: CaseStage = 'authorized'

/** Awards-case SLA conditions; the timer follows the same stage semantics as the nightly aging job. */
export const SLA_CONDITIONS = {
    start: `active=true^stage=${SLA_START_STAGE}`,
    pause: 'on_hold=true',
    stop: inQuery('stage', TERMINAL_STAGES),
} as const

export const SLA_DEFINITIONS: readonly SlaDefinition[] = [
    {
        key: 'awards_case_amber',
        flag: 'amber',
        days: AGING_THRESHOLDS.amberDays,
        name: slaName('amber', AGING_THRESHOLDS.amberDays),
        description: `Wall-clock ${AGING_THRESHOLDS.amberDays}-day target from authorization to shipment; mirrors the ${AGING_FLAGS.amber} aging flag set by the nightly aging job.`,
    },
    {
        key: 'awards_case_red',
        flag: 'red',
        days: AGING_THRESHOLDS.redDays,
        name: slaName('red', AGING_THRESHOLDS.redDays),
        description: `Wall-clock ${AGING_THRESHOLDS.redDays}-day breach threshold from authorization to shipment; mirrors the ${AGING_FLAGS.red} aging flag set by the nightly aging job.`,
    },
]

// ------------------------------------------------------------------ reports

export type ReportType = 'bar' | 'horizontal_bar' | 'donut' | 'list'

export interface OperationsReport {
    readonly key: string
    readonly title: string
    readonly description: string
    readonly table: DomainTableKey
    readonly type: ReportType
    /** Encoded query, ORDERBY terms allowed (lists only). */
    readonly filter: string
    /** Group-by column (charts). */
    readonly groupBy?: string
    /** Stack-by column (bar charts). */
    readonly stackBy?: string
    /** Columns shown (lists); defaults to the table's list layout. */
    readonly columns?: readonly string[]
}

const cols = (table: DomainTableKey): readonly string[] => UI_LAYOUT[table].list

export const OPERATIONS_REPORTS: readonly OperationsReport[] = [
    {
        key: 'cases_by_stage',
        title: 'Open awards cases by stage',
        description: 'Count of open awards cases in each fulfilment stage (authorization through warehouse).',
        table: 'awards_case',
        type: 'bar',
        filter: openCases,
        groupBy: 'stage',
    },
    {
        key: 'aging_distribution',
        title: 'Open awards cases by aging flag',
        description: `Green / ${AGING_FLAGS.amber} (${AGING_THRESHOLDS.amberDays}d) / ${AGING_FLAGS.red} (${AGING_THRESHOLDS.redDays}d) distribution of open awards cases.`,
        table: 'awards_case',
        type: 'donut',
        filter: openCases,
        groupBy: 'aging_flag',
    },
    {
        key: 'aging_red_cases',
        title: `Aging — ${AGING_FLAGS.red.toLowerCase()} (${AGING_THRESHOLDS.redDays}+ days)`,
        description: `Open awards cases past the ${AGING_THRESHOLDS.redDays}-day red threshold, oldest first.`,
        table: 'awards_case',
        type: 'list',
        filter: `${agingFlag('red')}^ORDERBYDESCdays_in_stage`,
        columns: cols('awards_case'),
    },
    {
        key: 'aging_amber_cases',
        title: `Aging — ${AGING_FLAGS.amber.toLowerCase()} (${AGING_THRESHOLDS.amberDays}–${AGING_THRESHOLDS.redDays - 1} days)`,
        description: `Open awards cases between the ${AGING_THRESHOLDS.amberDays}-day amber and ${AGING_THRESHOLDS.redDays}-day red thresholds, oldest first.`,
        table: 'awards_case',
        type: 'list',
        filter: `${agingFlag('amber')}^ORDERBYDESCdays_in_stage`,
        columns: cols('awards_case'),
    },
    {
        key: 'cases_on_hold',
        title: 'Awards cases on hold',
        description: 'Open awards cases with the on-hold flag set (SLA timers paused), oldest first.',
        table: 'awards_case',
        type: 'list',
        filter: `${openCases}^on_hold=true^ORDERBYDESCdays_in_stage`,
        columns: cols('awards_case'),
    },
    {
        key: 'engraving_by_status',
        title: 'Engraving queue by status',
        description: 'Open engraving jobs grouped by status (queued, in progress, QC hold, rework).',
        table: 'engraving_job',
        type: 'bar',
        filter: `active=true^${inQuery('status', OPEN_ENGRAVING)}`,
        groupBy: 'status',
    },
    {
        key: 'engraving_queue',
        title: 'Engraving queue',
        description: 'Open engraving jobs in work order: priority handling first, then queue time.',
        table: 'engraving_job',
        type: 'list',
        filter: `active=true^${inQuery('status', OPEN_ENGRAVING)}^ORDERBYDESCpriority_handling^ORDERBYqueued`,
        columns: cols('engraving_job'),
    },
    {
        key: 'assembly_qc_queue',
        title: 'Assembly / QC queue',
        description: 'Awards cases in the assembly / QC stage, priority handling first, then time in stage.',
        table: 'awards_case',
        type: 'list',
        filter: `active=true^stage=assembly_qc^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at`,
        columns: cols('awards_case'),
    },
    {
        key: 'warehouse_queue',
        title: 'Warehouse ready-to-ship queue',
        description: 'Awards cases in the warehouse stage that are not on hold, priority handling first.',
        table: 'awards_case',
        type: 'list',
        filter: `active=true^stage=warehouse^on_hold=false^ORDERBYDESCpriority_handling^ORDERBYstage_entered_at`,
        columns: cols('awards_case'),
    },
    {
        key: 'vendor_work_by_vendor',
        title: 'Vendor work by vendor and state',
        description: 'Heraldry requests released to vendors, grouped by vendor and stacked by request state.',
        table: 'heraldry_request',
        type: 'bar',
        filter: `active=true^${inQuery('state', VENDOR_STATES)}`,
        groupBy: 'vendor',
        stackBy: 'state',
    },
    {
        key: 'vendor_work',
        title: 'Vendor work',
        description: 'Heraldry requests released to vendors (released, in production, shipped), by vendor and required delivery date.',
        table: 'heraldry_request',
        type: 'list',
        filter: `active=true^${inQuery('state', VENDOR_STATES)}^ORDERBYvendor^ORDERBYrequired_delivery_date`,
        columns: cols('heraldry_request'),
    },
    {
        key: 'unmapped_stage_cases',
        title: 'Awards cases with unmapped legacy status',
        description: 'Migrated awards cases whose legacy status did not map to a target stage; the raw legacy status is shown for triage.',
        table: 'awards_case',
        type: 'list',
        filter: `${inQuery('stage', bucket(STAGE_PARTITION, 'exception'))}^ORDERBYlegacy_form^ORDERBYlegacy_status_raw`,
        columns: ['number', 'legacy_number', 'legacy_form', 'legacy_status_raw', 'stage', 'legacy_last_modified', 'sys_updated_on'],
    },
    {
        key: 'unmapped_legacy_statuses',
        title: 'Unmapped legacy statuses',
        description: 'Open migration exceptions raised for legacy status / choice values with no target mapping.',
        table: 'migration_exception',
        type: 'list',
        filter: `${inQuery('exception_type', UNMAPPED_EXCEPTION_TYPES)}^${inQuery('state', OPEN_EXCEPTIONS)}^ORDERBYlegacy_form^ORDERBYlegacy_status_raw`,
        columns: ['number', 'exception_type', 'legacy_form', 'source_table', 'legacy_status_raw', 'raw_value', 'field_name', 'message', 'state'],
    },
    {
        key: 'migration_exceptions_by_type',
        title: 'Open migration exceptions by type',
        description: 'Open (not yet resolved or accepted) migration exceptions grouped by exception type.',
        table: 'migration_exception',
        type: 'horizontal_bar',
        filter: inQuery('state', OPEN_EXCEPTIONS),
        groupBy: 'exception_type',
    },
]

export function reportByKey(key: string): OperationsReport {
    const r = OPERATIONS_REPORTS.find((x) => x.key === key)
    if (!r) throw new Error(`unknown report ${key}`)
    return r
}

export function tableReadRoles(table: DomainTableKey): readonly RoleKey[] {
    return TABLE_ACCESS[table].read
}

/** Roles allowed to run a report: exactly the roles that may read its table. */
export function reportRoles(report: OperationsReport): readonly RoleKey[] {
    return tableReadRoles(report.table)
}

export function roleNames(keys: readonly RoleKey[]): string[] {
    return keys.map((k) => ROLES[k])
}

export function reportTables(): DomainTableKey[] {
    return [...new Set(OPERATIONS_REPORTS.map((r) => r.table))]
}

export function reportSourceKey(table: DomainTableKey): string {
    return `ops_source_${table}`
}

export function reportSourceName(table: DomainTableKey): string {
    return `${WORKSPACE_TITLE} — ${table.replace(/_/g, ' ')}`
}

// ------------------------------------------------------------------ dashboard layout (48-column grid)

export interface DashboardCounter {
    readonly key: string
    readonly label: string
    readonly report: string
}

export interface DashboardChart {
    readonly report: string
    readonly component: 'vertical-bar' | 'horizontal-bar' | 'donut' | 'list-simple'
    readonly width: number
    readonly height: number
    readonly x: number
    readonly y: number
    readonly limit?: number
}

export const DASHBOARD_COUNTERS: readonly DashboardCounter[] = [
    { key: 'open_cases', label: 'Open awards cases', report: 'cases_by_stage' },
    { key: 'red', label: `${AGING_FLAGS.red} (${AGING_THRESHOLDS.redDays}+ days)`, report: 'aging_red_cases' },
    { key: 'amber', label: `${AGING_FLAGS.amber} (${AGING_THRESHOLDS.amberDays}+ days)`, report: 'aging_amber_cases' },
    { key: 'on_hold', label: 'On hold', report: 'cases_on_hold' },
    { key: 'engraving', label: 'Engraving jobs open', report: 'engraving_queue' },
    { key: 'vendor', label: 'Requests at vendors', report: 'vendor_work' },
    { key: 'exceptions', label: 'Open migration exceptions', report: 'migration_exceptions_by_type' },
    { key: 'unmapped', label: 'Unmapped legacy statuses', report: 'unmapped_legacy_statuses' },
]

export const COUNTER_ROW_HEIGHT = 7

export const DASHBOARD_CHARTS: readonly DashboardChart[] = [
    { report: 'cases_by_stage', component: 'vertical-bar', width: 16, height: 14, x: 0, y: 7 },
    { report: 'aging_distribution', component: 'donut', width: 16, height: 14, x: 16, y: 7 },
    { report: 'engraving_by_status', component: 'vertical-bar', width: 16, height: 14, x: 32, y: 7 },
    { report: 'aging_red_cases', component: 'list-simple', width: 24, height: 14, x: 0, y: 21, limit: 15 },
    { report: 'assembly_qc_queue', component: 'list-simple', width: 24, height: 14, x: 24, y: 21, limit: 15 },
    { report: 'warehouse_queue', component: 'list-simple', width: 24, height: 14, x: 0, y: 35, limit: 15 },
    { report: 'vendor_work', component: 'list-simple', width: 24, height: 14, x: 24, y: 35, limit: 15 },
    { report: 'vendor_work_by_vendor', component: 'vertical-bar', width: 16, height: 14, x: 0, y: 49 },
    { report: 'migration_exceptions_by_type', component: 'horizontal-bar', width: 16, height: 14, x: 16, y: 49 },
    { report: 'unmapped_legacy_statuses', component: 'list-simple', width: 16, height: 14, x: 32, y: 49, limit: 15 },
]

/** Dashboard readers: the roles that may read awards cases, the dashboard's primary table. */
export function dashboardRoles(): readonly RoleKey[] {
    return TABLE_ACCESS.awards_case.read
}

// ------------------------------------------------------------------ workspace lists

export interface WorkspaceListCategory {
    readonly key: string
    readonly title: string
    readonly reports: readonly string[]
}

export const WORKSPACE_LIST_CATEGORIES: readonly WorkspaceListCategory[] = [
    { key: 'awards', title: 'Awards cases', reports: ['aging_red_cases', 'aging_amber_cases', 'cases_on_hold', 'assembly_qc_queue', 'warehouse_queue', 'unmapped_stage_cases'] },
    { key: 'engraving', title: 'Engraving', reports: ['engraving_queue'] },
    { key: 'heraldry', title: 'Heraldry', reports: ['vendor_work'] },
    { key: 'migration', title: 'Migration', reports: ['unmapped_legacy_statuses'] },
]

// ------------------------------------------------------------------ application modules

export interface OperationsModule {
    readonly key: string
    readonly title: string
    readonly hint: string
    readonly order: number
    /** Either the dashboard route or a report key. */
    readonly target: { readonly kind: 'dashboard' } | { readonly kind: 'report'; readonly report: string }
}

export const MODULE_ORDER_BASE = 500

export const OPERATIONS_MODULES: readonly OperationsModule[] = [
    { key: 'ops_dashboard', title: 'Operations dashboard', hint: `${WORKSPACE_TITLE} workspace landing page: stage / aging counters, queues and vendor work`, order: MODULE_ORDER_BASE + 10, target: { kind: 'dashboard' } },
    { key: 'aging_red', title: `Aging — ${AGING_FLAGS.red.toLowerCase()}`, hint: `Open awards cases past the ${AGING_THRESHOLDS.redDays}-day red threshold`, order: MODULE_ORDER_BASE + 20, target: { kind: 'report', report: 'aging_red_cases' } },
    { key: 'aging_amber', title: `Aging — ${AGING_FLAGS.amber.toLowerCase()}`, hint: `Open awards cases past the ${AGING_THRESHOLDS.amberDays}-day amber threshold`, order: MODULE_ORDER_BASE + 30, target: { kind: 'report', report: 'aging_amber_cases' } },
    { key: 'engraving_queue', title: 'Engraving queue', hint: 'Open engraving jobs in work order', order: MODULE_ORDER_BASE + 40, target: { kind: 'report', report: 'engraving_queue' } },
    { key: 'assembly_qc_queue', title: 'Assembly/QC queue', hint: 'Awards cases waiting for assembly and quality control', order: MODULE_ORDER_BASE + 50, target: { kind: 'report', report: 'assembly_qc_queue' } },
    { key: 'warehouse_queue', title: 'Warehouse queue', hint: 'Awards cases ready to pick, pack and ship', order: MODULE_ORDER_BASE + 60, target: { kind: 'report', report: 'warehouse_queue' } },
    { key: 'vendor_work', title: 'Vendor work', hint: 'Heraldry requests released to vendors, in production or shipped', order: MODULE_ORDER_BASE + 70, target: { kind: 'report', report: 'vendor_work' } },
    { key: 'migration_exceptions', title: 'Migration exceptions', hint: 'Open migration exceptions by type', order: MODULE_ORDER_BASE + 80, target: { kind: 'report', report: 'migration_exceptions_by_type' } },
]

/** Module visibility follows the read matrix of the underlying table; the dashboard follows awards cases. */
export function moduleRoles(mod: OperationsModule): readonly RoleKey[] {
    return mod.target.kind === 'dashboard' ? dashboardRoles() : reportRoles(reportByKey(mod.target.report))
}

/** Union of all module roles, in ROLES declaration order (used for the navigator separator). */
export function separatorRoles(): RoleKey[] {
    const used = new Set<RoleKey>()
    for (const mod of OPERATIONS_MODULES) moduleRoles(mod).forEach((r) => used.add(r))
    return (Object.keys(ROLES) as RoleKey[]).filter((r) => used.has(r))
}

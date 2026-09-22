/**
 * Grant the synthetic test users their roles and group memberships after `now-sdk install`.
 *
 *   npm run grant-roles              # apply (idempotent: existing grants are left alone)
 *   npm run grant-roles -- --plan    # print the plan derived from the registry, call nothing
 *
 * `sys_user_has_role`, `sys_group_has_role` and `sys_user_grmember` are not application-file
 * tables, so the application installer refuses the rows ("permission denied") even though the
 * `sys_user` / `sys_user_group` records install. This tool applies the same registry
 * (src/server/lib/testUsers.ts) through the Table API, then points each vendor row named in the
 * registry (by CAGE code) at its portal user / group so the vendor isolation rules have a
 * principal to isolate — `portal_user` / `user_group` are cut-over settings that the legacy
 * export never carries. Credentials come from the environment only (see .env.example).
 */
import { fileURLToPath } from 'node:url'
import { QUERYABLE_VALUE, roleGrantPlan, type RoleGrantPlan } from '../src/server/lib/testUsers'
import { callInstance, type InstanceConfig, instanceFromEnv } from './lib/instance'

interface TableRow {
    sys_id: string
    [field: string]: string | { value: string; link?: string }
}
interface TableResponse {
    result: TableRow[]
}

const SAFE_VALUE = QUERYABLE_VALUE

function encodedQuery(pairs: readonly (readonly [string, string])[]): string {
    for (const [field, value] of pairs) {
        if (!/^[a-z_.]+$/.test(field) || !SAFE_VALUE.test(value)) throw new Error(`refusing to query with unexpected value for ${field}`)
    }
    return encodeURIComponent(pairs.map(([f, v]) => `${f}=${v}`).join('^'))
}

async function lookupSysId(cfg: InstanceConfig, table: string, field: string, value: string): Promise<string> {
    const res = await callInstance<TableResponse>(cfg, {
        method: 'GET',
        path: `/api/now/table/${table}?sysparm_fields=sys_id&sysparm_limit=2&sysparm_query=${encodedQuery([[field, value]])}`,
    })
    const first = res.result[0]
    if (!first || res.result.length !== 1) throw new Error(`${table}.${field}=${value}: expected exactly one record, found ${res.result.length}`)
    return first.sys_id
}

async function exists(cfg: InstanceConfig, table: string, pairs: readonly (readonly [string, string])[]): Promise<boolean> {
    const res = await callInstance<TableResponse>(cfg, {
        method: 'GET',
        path: `/api/now/table/${table}?sysparm_fields=sys_id&sysparm_limit=1&sysparm_query=${encodedQuery(pairs)}`,
    })
    return res.result.length > 0
}

export interface GrantSummary {
    created: number
    skipped: number
}

export async function applyPlan(cfg: InstanceConfig, plan: RoleGrantPlan, log: (s: string) => void): Promise<GrantSummary> {
    const summary: GrantSummary = { created: 0, skipped: 0 }
    const ids = new Map<string, string>()
    const id = async (table: string, field: string, value: string): Promise<string> => {
        const k = `${table}|${value}`
        const cached = ids.get(k)
        if (cached) return cached
        const v = await lookupSysId(cfg, table, field, value)
        ids.set(k, v)
        return v
    }
    const grant = async (table: string, pairs: readonly (readonly [string, string])[], label: string): Promise<void> => {
        if (await exists(cfg, table, pairs)) {
            summary.skipped++
            log(`  = ${label} (already present)`)
            return
        }
        await callInstance(cfg, { method: 'POST', path: `/api/now/table/${table}?sysparm_fields=sys_id`, body: Object.fromEntries(pairs) })
        summary.created++
        log(`  + ${label}`)
    }

    log('group roles')
    for (const g of plan.groupRoles) {
        const [group, role] = await Promise.all([id('sys_user_group', 'name', g.group), id('sys_user_role', 'name', g.role)])
        await grant('sys_group_has_role', [['group', group], ['role', role]], `${g.group} -> ${g.role}`)
    }
    log('user roles')
    for (const u of plan.userRoles) {
        const [user, role] = await Promise.all([id('sys_user', 'user_name', u.userName), id('sys_user_role', 'name', u.role)])
        await grant('sys_user_has_role', [['user', user], ['role', role]], `${u.userName} -> ${u.role}`)
    }
    log('group memberships')
    for (const m of plan.memberships) {
        const [user, group] = await Promise.all([id('sys_user', 'user_name', m.userName), id('sys_user_group', 'name', m.group)])
        await grant('sys_user_grmember', [['user', user], ['group', group]], `${m.userName} in ${m.group}`)
    }
    log('vendor portal links')
    for (const link of plan.vendorLinks) {
        const vendor = await id('x_cog_mah_vendor', 'cage_code', link.cageCode)
        const patch: Record<string, string> = {}
        if (link.userName !== undefined) patch.portal_user = await id('sys_user', 'user_name', link.userName)
        if (link.group !== undefined) patch.user_group = await id('sys_user_group', 'name', link.group)
        const current = await callInstance<{ result: TableRow }>(cfg, {
            method: 'GET',
            path: `/api/now/table/x_cog_mah_vendor/${vendor}?sysparm_fields=portal_user,user_group&sysparm_display_value=false`,
        })
        const row = current.result
        const stale = Object.entries(patch).filter(([field, value]) => refValue(row[field]) !== value)
        if (stale.length === 0) {
            summary.skipped++
            log(`  = vendor ${link.cageCode} already linked`)
            continue
        }
        await callInstance(cfg, { method: 'PATCH', path: `/api/now/table/x_cog_mah_vendor/${vendor}?sysparm_fields=sys_id`, body: Object.fromEntries(stale) })
        summary.created++
        log(`  + vendor ${link.cageCode} -> ${stale.map(([f]) => f).join(', ')}`)
    }
    return summary
}

/** Reference fields come back as `{ value, link }` objects or plain strings depending on sysparm options. */
function refValue(v: TableRow[string] | undefined): string {
    if (v === undefined) return ''
    if (typeof v === 'string') return v
    return v.value
}

export async function main(argv: readonly string[], log: (s: string) => void = console.log): Promise<number> {
    const plan = roleGrantPlan()
    if (argv.includes('--plan')) {
        log(JSON.stringify(plan, null, 2))
        return 0
    }
    const summary = await applyPlan(instanceFromEnv(), plan, log)
    log(`created ${summary.created}, already present ${summary.skipped}`)
    return 0
}

const invokedDirectly = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    main(process.argv.slice(2)).then(
        (code) => process.exit(code),
        (err: unknown) => {
            console.error(err instanceof Error ? err.message : String(err))
            process.exit(2)
        }
    )
}

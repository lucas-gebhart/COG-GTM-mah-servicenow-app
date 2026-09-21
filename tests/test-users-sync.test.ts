import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ROLES, type RoleKey } from '../src/server/lib/domain'
import { roleGrantPlan, TEST_GROUPS, TEST_USERS } from '../src/server/lib/testUsers'
import { renderTestUsers, TEST_USERS_FILE } from '../tools/generate-fluent-security'
import { parseCsv } from '../tools/lib/csv'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const FLUENT = readFileSync(TEST_USERS_FILE, 'utf8')
const README = readFileSync(`${ROOT}README.md`, 'utf8')
const RUNBOOK = readFileSync(`${ROOT}docs/MIGRATION-RUNBOOK.md`, 'utf8')

describe('test user registry', () => {
    it('has one user per application role, unique user names and known groups', () => {
        const roleKeys = Object.keys(ROLES) as RoleKey[]
        const granted = new Set(TEST_USERS.flatMap((u) => u.roles))
        expect([...granted].sort()).toEqual([...roleKeys].sort())
        expect(new Set(TEST_USERS.map((u) => u.userName)).size).toBe(TEST_USERS.length)
        const groupKeys = new Set(TEST_GROUPS.map((g) => g.key))
        for (const u of TEST_USERS) for (const g of u.groups) expect(groupKeys.has(g)).toBe(true)
    })

    it('fluent file is the rendered registry (bidirectional) and ships no membership rows', () => {
        expect(FLUENT).toBe(renderTestUsers())
        const fluentUserNames = [...FLUENT.matchAll(/user_name: '([^']+)'/g)].map((m) => m[1])
        const fluentGroupNames = [...FLUENT.matchAll(/^\s+name: '([^']+)'/gm)].map((m) => m[1])
        expect([...fluentUserNames].sort()).toEqual(TEST_USERS.map((u) => u.userName).sort())
        expect([...fluentGroupNames].sort()).toEqual(TEST_GROUPS.map((g) => g.name).sort())
        for (const u of TEST_USERS) expect(FLUENT).toContain(`Now.ID['user_${u.key}']`)
        for (const g of TEST_GROUPS) expect(FLUENT).toContain(`Now.ID['group_${g.key}']`)
        for (const table of ['sys_user_has_role', 'sys_group_has_role', 'sys_user_grmember']) {
            expect(FLUENT).not.toMatch(new RegExp(`table:\\s*'${table}'`))
        }
    })

    it('grant plan resolves every role to its x_cog_mah name and every group to its display name', () => {
        const plan = roleGrantPlan()
        expect(plan.userRoles).toHaveLength(TEST_USERS.reduce((n, u) => n + u.roles.length, 0))
        for (const g of plan.userRoles) expect(g.role).toMatch(/^x_cog_mah\./)
        expect(plan.groupRoles).toEqual([{ group: 'MAH Vendor - Clearfield Colors and Regalia', role: 'x_cog_mah.vendor' }])
        expect(plan.memberships).toEqual([{ userName: 'mah.vendor.clearfield', group: 'MAH Vendor - Clearfield Colors and Regalia' }])
        expect(plan.vendorLinks).toEqual([{ cageCode: '1CLR7', userName: 'mah.vendor.clearfield', group: 'MAH Vendor - Clearfield Colors and Regalia' }])
        const [first] = TEST_USERS
        if (!first) throw new Error('registry is empty')
        expect(() => roleGrantPlan([{ ...first, groups: ['nope'] }], TEST_GROUPS)).toThrow(/unknown group/)
        expect(() => roleGrantPlan([...TEST_USERS, { ...first, userName: 'dup', vendorCageCode: '1CLR7' }], TEST_GROUPS)).toThrow(/two test users/)
        const [group] = TEST_GROUPS
        if (!group) throw new Error('no groups')
        expect(() => roleGrantPlan(TEST_USERS, [{ ...group, name: 'Colors & Regalia' }])).toThrow(/not queryable/)
    })

    it('every vendor CAGE the registry links to exists exactly once in the sample legacy export', () => {
        const csv = parseCsv(readFileSync(`${ROOT}sample-data/heraldry-Vendor.csv`, 'utf8'))
        const cageIdx = csv.header.indexOf('VendorKey')
        expect(cageIdx).toBeGreaterThanOrEqual(0)
        const cages = csv.rows.map((r) => r[cageIdx])
        const linked = roleGrantPlan().vendorLinks.map((l) => l.cageCode)
        expect(linked.length).toBeGreaterThan(0)
        for (const cage of linked) {
            expect(cage).toMatch(/^[0-9A-HJ-NP-Z]{5}$/)
            expect(cages.filter((c) => c === cage), cage).toHaveLength(1)
        }
    })

    it('documentation lists every test user and the grant-roles step', () => {
        for (const u of TEST_USERS) expect(README).toContain(`\`${u.userName}\``)
        for (const doc of [README, RUNBOOK]) expect(doc).toContain('npm run grant-roles')
    })
})

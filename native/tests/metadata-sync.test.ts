import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AGING_THRESHOLDS, GROUPS, NUMBER_PREFIXES, ROLES, SLA_DEFINITIONS, TABLES, V1_NUMBER_PREFIXES, type RoleKey } from '../src/server/lib/domain'
import { MIGRATION_FILES, renderAll as renderMigration } from '../tools/generate-fluent-migration'
import { ACL_FILE, TEST_USERS_FILE, renderAcls, renderTestUsers } from '../tools/generate-fluent-security'
import { UI_FILES, renderAll as renderUi, validateLayout } from '../tools/generate-fluent-ui'

const SCOPE_MODULE_PATH = 'x_cog_mah_native/mah-case-management-native/0.1.0/src/server/'

function fluentFiles(): string[] {
    return readdirSync('src/fluent', { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.now.ts'))
        .map((e) => join(e.parentPath, e.name))
}

describe('generated Fluent files are in sync with the registries', () => {
    const ui = renderUi()
    for (const key of Object.keys(UI_FILES) as (keyof typeof UI_FILES)[]) {
        it(`${UI_FILES[key]} matches the UI generator output`, () => {
            expect(validateLayout()).toEqual([])
            expect(readFileSync(UI_FILES[key], 'utf8')).toBe(ui[key])
        })
    }
    const migration = renderMigration()
    for (const key of Object.keys(MIGRATION_FILES) as (keyof typeof MIGRATION_FILES)[]) {
        it(`${MIGRATION_FILES[key]} matches the migration generator output`, () => {
            expect(readFileSync(MIGRATION_FILES[key], 'utf8')).toBe(migration[key])
        })
    }
    it('acls.now.ts and test_users.now.ts match the security generator output', () => {
        expect(readFileSync(ACL_FILE, 'utf8')).toBe(renderAcls())
        expect(readFileSync(TEST_USERS_FILE, 'utf8')).toBe(renderTestUsers())
    })
    it('generated files avoid Fluent parser gotchas (no spread, satisfies or helper functions)', () => {
        // Transform-map scripts are embedded server JavaScript strings, so only the TypeScript outside string literals is checked.
        const stripStrings = (text: string): string => text.replace(/"(?:[^"\\]|\\.)*"/g, '""')
        for (const text of [...Object.values(ui), ...Object.values(migration), renderAcls(), renderTestUsers()].map(stripStrings)) {
            expect(text).not.toMatch(/\.\.\./)
            expect(text).not.toMatch(/\bsatisfies\b/)
            expect(text).not.toMatch(/\bfunction\b|=>/)
        }
    })
})

describe('Fluent metadata targets only v2 tables and modules', () => {
    it('every MAH table reference is in the x_cog_mah_native scope (no v1 table leaks)', () => {
        for (const file of fluentFiles()) {
            const code = readFileSync(file, 'utf8')
                .split('\n')
                .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
                .join('\n')
            const v1 = code.match(/x_cog_mah_(?!native)[a-z_]+/g) ?? []
            expect(v1, file).toEqual([])
        }
    })
    it('server-side require() paths point at this application bundle', () => {
        const files = [...fluentFiles(), ...readdirSync('src/producers').map((f) => join('src/producers', f))]
        const paths = files.flatMap((f) => readFileSync(f, 'utf8').match(/require\('([^']+)'\)/g) ?? [])
        expect(paths.length).toBeGreaterThan(10)
        for (const p of paths) expect(p).toContain(SCOPE_MODULE_PATH)
        expect(paths.some((p) => p.includes('x_cog_mah_native_native'))).toBe(false)
    })
    it('Now.ID[...] appears only as $id (as a data value it installs the literal key string)', () => {
        const files = fluentFiles()
        expect(files.length).toBeGreaterThan(20)
        for (const file of files) {
            const offenders = readFileSync(file, 'utf8')
                .split('\n')
                .filter((line) => /\bNow\.ID\[/.test(line.replace(/\/\/.*$/, '')) && !/(^\s*|[{,]\s*)\$id:\s*Now\.ID\[/.test(line))
            expect(offenders, file).toEqual([])
        }
    })
    it('retired v1 concepts (case_note, migration_exception, aging columns, vendor table) do not exist as production metadata', () => {
        const tables = readdirSync('src/fluent/tables')
            .map((f) => readFileSync(join('src/fluent/tables', f), 'utf8'))
            .join('\n')
            .split('\n')
            .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
            .join('\n')
        for (const stale of ['case_note', 'migration_exception', 'days_in_stage', 'aging_flag', 'x_cog_mah_native_vendor', 'heraldic_item']) {
            expect(tables, stale).not.toContain(stale)
        }
        expect(Object.keys(TABLES)).not.toContain('case_note')
        expect(Object.keys(TABLES)).not.toContain('migration_exception')
        expect(Object.keys(TABLES)).not.toContain('vendor')
    })
})

describe('Task SLA definitions derive from the aging thresholds', () => {
    const sla = readFileSync('src/fluent/sla/awards_case_sla.now.ts', 'utf8')
    it('one contract_sla per non-green aging flag with the matching threshold in days', () => {
        expect(SLA_DEFINITIONS.amber.days).toBe(AGING_THRESHOLDS.amberDays)
        expect(SLA_DEFINITIONS.red.days).toBe(AGING_THRESHOLDS.redDays)
        for (const def of Object.values(SLA_DEFINITIONS)) {
            expect(sla).toContain(`name: '${def.name}'`)
            expect(sla).toContain(`duration: Duration({ days: ${def.days} })`)
        }
        expect(sla).toContain(`table: '${TABLES.awards_case}'`)
    })
    it('the clock pauses on hold and stops at shipment and at the terminal stages; no persisted aging column is referenced', () => {
        expect(sla).toMatch(/pause: 'on_hold=true/)
        expect(sla).toMatch(/stop: 'stageIN[a-z_,]*shipped/)
        expect(sla).toMatch(/stop: 'stageIN[a-z_,]*closed/)
        expect(sla).toMatch(/stop: 'stageIN[a-z_,]*cancelled/)
        const code = sla.split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n')
        expect(code).not.toMatch(/days_in_stage|aging_flag/)
    })
})

describe('assignment rules and approval flow reference the v2 groups', () => {
    const groups = readFileSync('src/fluent/security/groups.now.ts', 'utf8')
    const rules = readFileSync('src/fluent/security/assignment_rules.now.ts', 'utf8')
    it('every operational group is defined once and used by at least one assignment rule', () => {
        for (const key of ['tacom', 'engraving', 'assembly', 'warehouse'] as const) {
            const name = GROUPS[key]
            expect(groups.match(new RegExp(`name: '${name}'`, 'g'))?.length, name).toBe(1)
            expect(groups, name).toContain(`Now.ID['group_${key}']`)
            expect(rules, name).toMatch(new RegExp(`group: group_${key}\\b`))
        }
    })
    it('assignment rules cover the three shop-floor queues on their task tables', () => {
        expect(rules).toContain(`table: '${TABLES.engraving_job}'`)
        expect(rules).toContain(`table: '${TABLES.shipment}'`)
        expect(rules).toMatch(/stage=assembly_qc/)
        expect(rules).toMatch(/stage=warehouse/)
    })
    it('the review flow asks the TACOM group for approval through the native approval engine', () => {
        const flow = readFileSync('src/fluent/workflows/request_review.now.ts', 'utf8')
        expect(flow).toContain('action.core.askForApproval')
        const keys = readFileSync('src/fluent/generated/keys.ts', 'utf8')
        const tacom = /group_tacom:\s*\{\s*table: 'sys_user_group'\s*id: '([0-9a-f]{32})'/.exec(keys)?.[1]
        expect(tacom).toBeTruthy()
        expect(flow).toContain(`groups: ['${tacom}']`)
    })
})

describe('Scripted REST handlers answer through the shared JSON writer', () => {
    it('no handler calls response.setBody (platform serializer renders integers as doubles)', () => {
        const restFiles = readdirSync('src/server/rest').filter((f) => f.endsWith('.ts')).map((f) => join('src/server/rest', f))
        expect(restFiles.length).toBeGreaterThanOrEqual(2)
        for (const file of restFiles) {
            const src = readFileSync(file, 'utf8')
            if (file.endsWith('respond.ts')) continue
            expect(src, file).not.toMatch(/\.setBody\(/)
            expect(src, file).toMatch(/from '\.\/respond(\.ts)?'/)
        }
    })
})

describe('numbering', () => {
    it('v2 number prefixes are unique and disjoint from every v1 prefix, so both apps coexist on one instance', () => {
        const v2 = Object.values(NUMBER_PREFIXES)
        expect(new Set(v2).size).toBe(v2.length)
        for (const p of v2) {
            expect(p).toMatch(/^N[A-Z]{3}$/)
            expect(V1_NUMBER_PREFIXES as readonly string[]).not.toContain(p)
        }
        const tables = readdirSync('src/fluent/tables').map((f) => readFileSync(join('src/fluent/tables', f), 'utf8')).join('\n')
        for (const p of v2) expect(tables).toContain(`'${p}'`)
    })
})

describe('roles', () => {
    it('roles.now.ts declares exactly the eight domain roles in the v2 scope', () => {
        const roles = readFileSync('src/fluent/security/roles.now.ts', 'utf8')
        const keys = Object.keys(ROLES) as RoleKey[]
        expect(keys).toHaveLength(8)
        for (const k of keys) {
            expect(ROLES[k]).toBe(`x_cog_mah_native.${k}`)
            expect(roles).toContain(`name: '${ROLES[k]}'`)
        }
        expect(roles).not.toMatch(/name: 'x_cog_mah\./)
    })
})

/**
 * Renders the access matrix in src/server/lib/security.ts into Fluent ACL metadata, and the
 * synthetic principal registry in src/server/lib/testUsers.ts into sys_user / sys_user_group records.
 *
 *   npx tsx tools/generate-fluent-security.ts          # write src/fluent/security/{acls,test_users}.now.ts
 *   npx tsx tools/generate-fluent-security.ts --check  # exit 1 if either file is stale
 *
 * The Fluent compiler only accepts literal property assignments in .now.ts files (no loops
 * or helpers), so the matrix is expanded here instead of at compile time.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ROLES, TABLES, type DomainTableKey, type RoleKey } from '../src/server/lib/domain'
import { FIELD_ACCESS, TABLE_ACCESS, type Operation } from '../src/server/lib/security'
import { TEST_GROUPS, TEST_USERS } from '../src/server/lib/testUsers'

export const ACL_FILE = fileURLToPath(new URL('../src/fluent/security/acls.now.ts', import.meta.url))
export const TEST_USERS_FILE = fileURLToPath(new URL('../src/fluent/security/test_users.now.ts', import.meta.url))

function lit(s: string): string {
    return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

export function renderTestUsers(): string {
    const out: string[] = [
        '// GENERATED FILE - do not edit by hand.',
        '// Source of truth: src/server/lib/testUsers.ts. Regenerate with `npm run gen:security`.',
        '//',
        '// Synthetic test users, one per application role, plus the vendor group used by the vendor',
        '// isolation rules. Only sys_user / sys_user_group rows ship with the application: role grants and',
        '// group memberships (sys_user_has_role, sys_group_has_role, sys_user_grmember) are not application',
        '// files and are skipped by the installer, so they are applied post-install by `npm run grant-roles`',
        '// (tools/grant-test-roles.ts) from the same registry. No passwords are shipped: sign in as an',
        '// administrator and use "Impersonate user", or set a password on the instance.',
        "import { Record } from '@servicenow/sdk/core'",
        '',
    ]
    for (const u of TEST_USERS) {
        out.push(
            `export const user_${u.key} = Record({`,
            `    $id: Now.ID['user_${u.key}'],`,
            "    table: 'sys_user',",
            '    data: {',
            `        user_name: ${lit(u.userName)},`,
            `        first_name: ${lit(u.firstName)},`,
            `        last_name: ${lit(u.lastName)},`,
            `        title: ${lit(u.title)},`,
            `        email: ${lit(u.email)},`,
            '        active: true,',
            '    },',
            '})',
            ''
        )
    }
    for (const g of TEST_GROUPS) {
        out.push(
            `export const group_${g.key} = Record({`,
            `    $id: Now.ID['group_${g.key}'],`,
            "    table: 'sys_user_group',",
            '    data: {',
            `        name: ${lit(g.name)},`,
            `        description: ${lit(g.description)},`,
            '        active: true,',
            '    },',
            '})',
            ''
        )
    }
    return out.join('\n')
}

const OPERATIONS: readonly Operation[] = ['create', 'read', 'write', 'delete']

function roleList(keys: readonly RoleKey[]): string {
    return keys.map((k) => `'${ROLES[k]}'`).join(', ')
}

function aclBlock(id: string, table: DomainTableKey, operation: Operation, roles: readonly RoleKey[], field: string | null, description: string): string {
    return [
        'Acl({',
        `    $id: Now.ID['${id}'],`,
        "    type: 'record',",
        `    table: '${TABLES[table]}',`,
        ...(field === null ? [] : [`    field: '${field}',`]),
        `    operation: '${operation}',`,
        `    roles: [${roleList(roles)}],`,
        `    description: '${description.replace(/'/g, "\\'")}',`,
        '})',
        '',
    ].join('\n')
}

export function renderAcls(): string {
    const out: string[] = [
        '// GENERATED FILE - do not edit by hand.',
        '// Source of truth: src/server/lib/security.ts. Regenerate with `npm run gen:security`.',
        "import { Acl } from '@servicenow/sdk/core'",
        '',
        '// ---------------------------------------------------------------- table-level ACLs',
        '',
    ]
    for (const table of Object.keys(TABLE_ACCESS) as DomainTableKey[]) {
        const access = TABLE_ACCESS[table]
        for (const operation of OPERATIONS) {
            const description = `${TABLES[table]} ${operation}: ${access[operation].join(', ')}`
            out.push(aclBlock(`acl_${table}_${operation}`, table, operation, access[operation], null, description))
            out.push(aclBlock(`acl_${table}_all_fields_${operation}`, table, operation, access[operation], '*', `${description} (all fields)`))
        }
    }
    out.push('// ---------------------------------------------------------------- field-level ACLs', '')
    for (const fa of FIELD_ACCESS) {
        out.push(aclBlock(`acl_${fa.table}_${fa.field}_${fa.operation}`, fa.table, fa.operation, fa.roles, fa.field, fa.reason))
    }
    return out.join('\n')
}

const invokedDirectly = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    const outputs: readonly [string, string][] = [
        [ACL_FILE, renderAcls()],
        [TEST_USERS_FILE, renderTestUsers()],
    ]
    if (process.argv.includes('--check')) {
        let stale = false
        for (const [file, rendered] of outputs) {
            if (readFileSync(file, 'utf8') !== rendered) {
                console.error(`${file} is stale; run npm run gen:security`)
                stale = true
            }
        }
        if (stale) process.exit(1)
        console.log('acls.now.ts and test_users.now.ts are in sync')
    } else {
        for (const [file, rendered] of outputs) {
            writeFileSync(file, rendered)
            console.log(`wrote ${file}`)
        }
    }
}

/**
 * Renders the access matrix in src/server/lib/security.ts into Fluent ACL metadata.
 *
 *   npx tsx tools/generate-fluent-security.ts          # write src/fluent/security/acls.now.ts
 *   npx tsx tools/generate-fluent-security.ts --check  # exit 1 if the file is stale
 *
 * The Fluent compiler only accepts literal property assignments in .now.ts files (no loops
 * or helpers), so the matrix is expanded here instead of at compile time.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ROLES, TABLES, type DomainTableKey, type RoleKey } from '../src/server/lib/domain'
import { FIELD_ACCESS, TABLE_ACCESS, type Operation } from '../src/server/lib/security'

export const ACL_FILE = fileURLToPath(new URL('../src/fluent/security/acls.now.ts', import.meta.url))

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
    const rendered = renderAcls()
    if (process.argv.includes('--check')) {
        const current = readFileSync(ACL_FILE, 'utf8')
        if (current !== rendered) {
            console.error(`${ACL_FILE} is stale; run npm run gen:security`)
            process.exit(1)
        }
        console.log('acls.now.ts is in sync')
    } else {
        writeFileSync(ACL_FILE, rendered)
        console.log(`wrote ${ACL_FILE}`)
    }
}

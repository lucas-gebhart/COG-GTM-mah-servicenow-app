/**
 * Column names declared in each Fluent table file (regex over `        name: XColumn(`), plus the
 * platform fields every table inherits. Shared by the UI, security and migration generators and
 * by the contract-coverage tests so a renamed column fails offline instead of on the instance.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { DomainTableKey } from '../../src/server/lib/domain'
import { PLATFORM_FIELDS } from '../../src/server/lib/uiLayout'

const TABLES_DIR = fileURLToPath(new URL('../../src/fluent/tables/', import.meta.url))

export function declaredColumns(): Record<DomainTableKey, Set<string>> {
    const out = {} as Record<DomainTableKey, Set<string>>
    for (const file of readdirSync(TABLES_DIR)) {
        if (!file.endsWith('.now.ts')) continue
        const key = file.replace('.now.ts', '') as DomainTableKey
        const src = readFileSync(TABLES_DIR + file, 'utf8')
        const cols = new Set<string>(PLATFORM_FIELDS)
        for (const m of src.matchAll(/^ {8}([a-z0-9_]+): [A-Za-z]+Column\(/gm)) {
            const col = m[1]
            if (col !== undefined) cols.add(col)
        }
        out[key] = cols
    }
    return out
}

/** `x_cog_mah_awards_case` → `awards_case`. */
export function tableKey(table: string): DomainTableKey {
    return table.replace(/^x_cog_mah_/, '') as DomainTableKey
}

/**
 * Column names declared in each Fluent table file (regex over `        name: XColumn(`), plus the
 * platform fields every table inherits and — for task / cmdb_model extensions — the inherited
 * parent columns layouts may reference. Shared by the UI and security generators and the
 * contract-coverage tests so a renamed column fails offline instead of on the instance.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { TASK_TABLE_KEYS, type DomainTableKey } from '../../src/server/lib/domain'
import { MODEL_FIELDS, PLATFORM_FIELDS, TASK_FIELDS } from '../../src/server/lib/uiLayout'

const TABLES_DIR = fileURLToPath(new URL('../../src/fluent/tables/', import.meta.url))

/** Table files that augment platform tables rather than define an app table. */
const AUGMENT_FILES: ReadonlySet<string> = new Set(['core_company_augment.now.ts'])

export function isTaskTable(key: DomainTableKey): boolean {
    return (TASK_TABLE_KEYS as readonly string[]).includes(key)
}

/** Columns the app itself declares per table (no inherited columns). */
export function ownColumns(): Record<DomainTableKey, Set<string>> {
    const out = {} as Record<DomainTableKey, Set<string>>
    for (const file of readdirSync(TABLES_DIR)) {
        if (!file.endsWith('.now.ts') || AUGMENT_FILES.has(file)) continue
        const key = file.replace('.now.ts', '') as DomainTableKey
        const src = readFileSync(TABLES_DIR + file, 'utf8')
        const cols = new Set<string>()
        for (const m of src.matchAll(/^ {8}([a-z0-9_]+): [A-Za-z]+Column\(/gm)) {
            const col = m[1]
            if (col !== undefined) cols.add(col)
        }
        out[key] = cols
    }
    return out
}

/** Own columns plus platform / inherited columns a layout may reference. */
export function declaredColumns(): Record<DomainTableKey, Set<string>> {
    const own = ownColumns()
    const out = {} as Record<DomainTableKey, Set<string>>
    for (const key of Object.keys(own) as DomainTableKey[]) {
        const cols = new Set<string>([...PLATFORM_FIELDS, ...(own[key] ?? [])])
        if (isTaskTable(key)) for (const f of TASK_FIELDS) cols.add(f)
        if (key === 'catalog_item') for (const f of MODEL_FIELDS) cols.add(f)
        out[key] = cols
    }
    return out
}

/** Scoped columns the app adds to core_company (the augmentation file). */
export function companyAugmentColumns(): string[] {
    const src = readFileSync(`${TABLES_DIR}core_company_augment.now.ts`, 'utf8')
    return [...src.matchAll(/^ {8}(x_cog_mah_native_[a-z0-9_]+): [A-Za-z]+Column\(/gm)].map((m) => m[1] as string)
}

export interface ReferenceEdge {
    table: DomainTableKey
    column: string
    referenceTable: string
}

/** Every `ReferenceColumn` declared in the Fluent table files, in file order. */
export function referenceColumns(): ReferenceEdge[] {
    const out: ReferenceEdge[] = []
    for (const file of readdirSync(TABLES_DIR).sort()) {
        if (!file.endsWith('.now.ts') || AUGMENT_FILES.has(file)) continue
        const table = file.replace('.now.ts', '') as DomainTableKey
        const src = readFileSync(TABLES_DIR + file, 'utf8')
        for (const m of src.matchAll(/^ {8}([a-z0-9_]+): ReferenceColumn\(\{[\s\S]*?referenceTable: '([a-z0-9_]+)'/gm)) {
            const column = m[1]
            const referenceTable = m[2]
            if (column !== undefined && referenceTable !== undefined) out.push({ table, column, referenceTable })
        }
    }
    return out
}

/** `x_cog_mah_native_awards_case` → `awards_case`. */
export function tableKey(table: string): DomainTableKey {
    return table.replace(/^x_cog_mah_native_/, '') as DomainTableKey
}

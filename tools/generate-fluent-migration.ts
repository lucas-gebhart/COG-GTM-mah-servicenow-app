/**
 * Renders the legacy contract (src/server/lib/legacyContract.ts) into the Fluent metadata of
 * the Import Set migration path, one file per component of the SDK's three-component pattern:
 *
 *   src/fluent/migration/staging_tables.now.ts   — one table per legacy form extending sys_import_set_row
 *   src/fluent/migration/data_sources.now.ts     — one sys_data_source per staging table (CSV attachment)
 *   src/fluent/migration/transform_maps.now.ts   — one ImportSet per form: coalesce on legacy_unid,
 *                                                   direct field maps, onStart/onBefore/onAfter/onComplete
 *                                                   scripts that call the MAHMigration Script Include
 *   src/fluent/migration/status_map_seed.now.ts  — DEFAULT_STATUS_MAP rows for x_cog_mah_status_map
 *
 *   npx tsx tools/generate-fluent-migration.ts          # write the files
 *   npx tsx tools/generate-fluent-migration.ts --check  # exit 1 if any file is stale
 *
 * The Fluent parser only accepts literal property values in .now.ts files, so the expansion
 * happens here. Nothing in the output is hand-typed: every table name, column, header, label
 * and status alias comes from the contract or the status map.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
    dataSourceName,
    EXTRA_STAGING_COLUMNS,
    LEGACY_FORMS,
    LOAD_ORDER,
    stagingColumnMap,
    stagingColumnName,
    transformMapName,
    type LegacyFormName,
} from '../src/server/lib/legacyContract'
import { DEFAULT_STATUS_MAP, type StatusMapEntry } from '../src/server/lib/statusMap'
import { DIRECT_FIELD_MAPS } from '../src/server/migration/rowTransforms'

const OUT_DIR = fileURLToPath(new URL('../src/fluent/migration/', import.meta.url))

export const MIGRATION_FILES = {
    stagingTables: `${OUT_DIR}staging_tables.now.ts`,
    dataSources: `${OUT_DIR}data_sources.now.ts`,
    transformMaps: `${OUT_DIR}transform_maps.now.ts`,
    statusMapSeed: `${OUT_DIR}status_map_seed.now.ts`,
} as const

const HEADER = '// GENERATED FILE - do not edit by hand.\n// Source of truth: src/server/lib/legacyContract.ts (+ statusMap.ts, rowTransforms.ts). Regenerate with `npm run gen:migration`.'

/** Script Include the transform scripts call; qualified so the map works when invoked from another scope. */
export const BRIDGE = 'x_cog_mah.MAHMigration'

function q(s: string): string {
    return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function snake(form: LegacyFormName): string {
    return LEGACY_FORMS[form].stagingTable.replace(/^x_cog_mah_stg_/, '')
}

/** Label shown on the staging table / data source. */
export function stagingLabel(form: LegacyFormName): string {
    const c = LEGACY_FORMS[form]
    return `MAH Staging: ${c.database} ${c.legacyForm}`
}

// ---------------------------------------------------------------------------------------------
// staging tables
// ---------------------------------------------------------------------------------------------

export function renderStagingTables(): string {
    const out: string[] = [HEADER, "import { Table, StringColumn } from '@servicenow/sdk/core'", '']
    for (const form of LOAD_ORDER) {
        const c = LEGACY_FORMS[form]
        out.push(`/** ${c.csvFile} → ${c.targetTable} (load order ${c.loadOrder}). */`)
        out.push(`export const ${c.stagingTable} = Table({`)
        out.push(`    name: ${q(c.stagingTable)},`)
        out.push(`    label: ${q(stagingLabel(form))},`)
        out.push("    extends: 'sys_import_set_row',")
        out.push('    schema: {')
        for (const col of stagingColumnMap(form)) {
            out.push(`        ${col.column}: StringColumn({ label: ${q(col.header + (col.key === col.header ? '' : ` (${col.key})`))}, maxLength: ${col.length} }),`)
        }
        for (const extra of EXTRA_STAGING_COLUMNS) {
            out.push(`        ${extra}: StringColumn({ label: ${q(extra)}, maxLength: 255 }),`)
        }
        out.push('    },')
        out.push('    allowWebServiceAccess: true,')
        out.push('})')
        out.push('')
    }
    return out.join('\n')
}

// ---------------------------------------------------------------------------------------------
// data sources
// ---------------------------------------------------------------------------------------------

export function renderDataSources(): string {
    const out: string[] = [HEADER, "import { Record } from '@servicenow/sdk/core'", '']
    for (const form of LOAD_ORDER) {
        const c = LEGACY_FORMS[form]
        out.push(`export const ds_${snake(form)} = Record({`)
        out.push(`    $id: Now.ID[${q(`ds_${snake(form)}`)}],`)
        out.push("    table: 'sys_data_source',")
        out.push('    data: {')
        out.push(`        name: ${q(dataSourceName(form))},`)
        out.push("        type: 'File',")
        out.push("        format: 'CSV',")
        out.push("        file_retrieval_method: 'Attachment',")
        out.push("        csv_delimiter: ',',")
        out.push('        header_row: 1,')
        out.push(`        import_set_table_name: ${q(c.stagingTable)},`)
        out.push(`        import_set_table_label: ${q(stagingLabel(form))},`)
        out.push('        batch_size: 500,')
        out.push('    },')
        out.push('})')
        out.push('')
    }
    return out.join('\n')
}

// ---------------------------------------------------------------------------------------------
// transform maps
// ---------------------------------------------------------------------------------------------

function hookScript(form: LegacyFormName, when: 'onStart' | 'onBefore' | 'onAfter' | 'onComplete'): string {
    switch (when) {
        case 'onStart':
            return `(function runTransformScript(source, map, log, target) {\n    new ${BRIDGE}().onStart(${q(form)}, import_set);\n})(source, map, log, target);`
        case 'onBefore':
            return [
                '(function runTransformScript(source, map, log, target) {',
                `    var r = new ${BRIDGE}().onBefore(${q(form)}, source, target, action);`,
                '    if (r.ignore) { ignore = true; }',
                '    if (r.statusMessage) { status_message = r.statusMessage; }',
                '})(source, map, log, target);',
            ].join('\n')
        case 'onAfter':
            return `(function runTransformScript(source, map, log, target) {\n    new ${BRIDGE}().onAfter(${q(form)}, source, target);\n})(source, map, log, target);`
        case 'onComplete':
            return `(function runTransformScript(source, map, log, target) {\n    new ${BRIDGE}().onComplete(${q(form)}, import_set);\n})(source, map, log, target);`
    }
}

/** Header → staging column for headers that appear once (direct maps never point at a repeated header). */
function stagingColumnFor(form: LegacyFormName, header: string): string {
    const matches = stagingColumnMap(form).filter((c) => c.header === header)
    const first = matches[0]
    if (first === undefined) throw new Error(`${form}: DIRECT_FIELD_MAPS references header "${header}" that is not in csvHeader(${form})`)
    return first.column
}

export function renderTransformMaps(): string {
    const out: string[] = [HEADER, "import { ImportSet } from '@servicenow/sdk/core'", '']
    for (const form of LOAD_ORDER) {
        const c = LEGACY_FORMS[form]
        const key = snake(form)
        out.push(`export const tm_${key} = ImportSet({`)
        out.push(`    $id: Now.ID[${q(`tm_${key}`)}],`)
        out.push(`    name: ${q(transformMapName(form))},`)
        out.push(`    sourceTable: ${q(c.stagingTable)},`)
        out.push(`    targetTable: ${q(c.targetTable)},`)
        out.push('    active: true,')
        out.push(`    order: ${c.loadOrder},`)
        out.push('    runBusinessRules: false,')
        out.push("    enforceMandatoryFields: 'no',")
        out.push('    copyEmptyFields: false,')
        out.push('    createOnEmptyCoalesce: true,')
        out.push('    fields: {')
        out.push(`        legacy_unid: { sourceField: ${q(stagingColumnName('UNID'))}, coalesce: true, coalesceCaseSensitive: false },`)
        for (const [target, header] of Object.entries(DIRECT_FIELD_MAPS[form])) {
            out.push(`        ${target}: { sourceField: ${q(stagingColumnFor(form, header))} },`)
        }
        out.push('    },')
        out.push('    runScript: false,')
        out.push('    scripts: [')
        for (const [i, when] of (['onStart', 'onBefore', 'onAfter', 'onComplete'] as const).entries()) {
            out.push('        {')
            out.push(`            $id: Now.ID[${q(`tm_${key}_${when}`)}],`)
            out.push(`            when: ${q(when)},`)
            out.push(`            order: ${(i + 1) * 100},`)
            out.push('            active: true,')
            out.push(`            script: ${JSON.stringify(hookScript(form, when))},`)
            out.push('        },')
        }
        out.push('    ],')
        out.push('})')
        out.push('')
    }
    return out.join('\n')
}

// ---------------------------------------------------------------------------------------------
// status map seed
// ---------------------------------------------------------------------------------------------

/** Deterministic 32-hex pseudo-UNID so seeded rows satisfy the unique legacy_unid index. */
export function seedUnid(e: StatusMapEntry): string {
    return createHash('sha256').update(`status_map|${e.legacyForm}|${e.legacyStatus}`).digest('hex').slice(0, 32).toUpperCase()
}

export function seedId(e: StatusMapEntry): string {
    const slug = e.legacyStatus.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'empty'
    // "ASSEMBLY/QC" and "ASSEMBLY QC" share a slug; the hash suffix keeps ids unique and stable.
    return `smap_${e.legacyForm.toLowerCase()}_${slug}_${seedUnid(e).slice(0, 6).toLowerCase()}`
}

export function renderStatusMapSeed(): string {
    const out: string[] = [
        HEADER,
        `// ${DEFAULT_STATUS_MAP.length} legacy status aliases across ${new Set(DEFAULT_STATUS_MAP.map((e) => e.legacyForm)).size} legacy forms.`,
        "import { Record } from '@servicenow/sdk/core'",
        '',
    ]
    const ids = new Set<string>()
    for (const e of DEFAULT_STATUS_MAP) {
        const id = seedId(e)
        if (ids.has(id)) throw new Error(`duplicate status map seed id ${id}`)
        ids.add(id)
        out.push(`export const ${id} = Record({`)
        out.push(`    $id: Now.ID[${q(id)}],`)
        out.push("    table: 'x_cog_mah_status_map',")
        out.push('    data: {')
        out.push(`        legacy_unid: ${q(seedUnid(e))},`)
        out.push(`        legacy_form: ${q(e.legacyForm)},`)
        out.push(`        legacy_status: ${q(e.legacyStatus)},`)
        out.push(`        legacy_status_raw: ${q(e.legacyStatus)},`)
        out.push(`        target_field: ${q(e.targetField)},`)
        out.push(`        target_value: ${q(e.targetValue)},`)
        out.push('        seeded: true,')
        out.push('        active: true,')
        out.push("        state: 'open',")
        out.push('    },')
        out.push('})')
        out.push('')
    }
    return out.join('\n')
}

// ---------------------------------------------------------------------------------------------

export function renderAll(): Record<keyof typeof MIGRATION_FILES, string> {
    return {
        stagingTables: renderStagingTables(),
        dataSources: renderDataSources(),
        transformMaps: renderTransformMaps(),
        statusMapSeed: renderStatusMapSeed(),
    }
}

const invokedDirectly = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    const rendered = renderAll()
    const check = process.argv.includes('--check')
    let stale = 0
    for (const key of Object.keys(MIGRATION_FILES) as (keyof typeof MIGRATION_FILES)[]) {
        const file = MIGRATION_FILES[key]
        if (check) {
            let current = ''
            try {
                current = readFileSync(file, 'utf8')
            } catch {
                current = ''
            }
            if (current !== rendered[key]) {
                console.error(`${file} is stale; run npm run gen:migration`)
                stale++
            }
        } else {
            mkdirSync(OUT_DIR, { recursive: true })
            writeFileSync(file, rendered[key])
            console.log(`wrote ${file}`)
        }
    }
    if (check) {
        if (stale > 0) process.exit(1)
        console.log('src/fluent/migration is in sync')
    }
}

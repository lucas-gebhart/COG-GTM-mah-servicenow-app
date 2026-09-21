/**
 * Renders src/server/lib/uiLayout.ts into Fluent list / form / related-list metadata.
 *
 *   npx tsx tools/generate-fluent-ui.ts          # write src/fluent/ui/{lists,forms,related_lists}.now.ts
 *   npx tsx tools/generate-fluent-ui.ts --check  # exit 1 if any file is stale
 *
 * Every field referenced by a layout is validated against the column names declared in
 * src/fluent/tables/<table>.now.ts, so a renamed column fails generation instead of producing
 * a blank list cell on the instance.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { TABLES, type DomainTableKey } from '../src/server/lib/domain'
import { PLATFORM_FIELDS, UI_LAYOUT } from '../src/server/lib/uiLayout'

const TABLES_DIR = fileURLToPath(new URL('../src/fluent/tables/', import.meta.url))
const UI_DIR = fileURLToPath(new URL('../src/fluent/ui/', import.meta.url))

export const UI_FILES = {
    lists: `${UI_DIR}lists.now.ts`,
    forms: `${UI_DIR}forms.now.ts`,
    relatedLists: `${UI_DIR}related_lists.now.ts`,
} as const

const HEADER = (what: string): string =>
    [
        '// GENERATED FILE - do not edit by hand.',
        `// Source of truth: src/server/lib/uiLayout.ts (${what}). Regenerate with \`npm run gen:ui\`.`,
        "import '@servicenow/sdk/global'",
    ].join('\n')

/** Column names declared in each Fluent table file (regex over `        name: XColumn(`). */
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

export function validateLayout(): string[] {
    const cols = declaredColumns()
    const problems: string[] = []
    for (const key of Object.keys(UI_LAYOUT) as DomainTableKey[]) {
        const layout = UI_LAYOUT[key]
        const known = cols[key]
        if (!known) {
            problems.push(`${key}: no table file src/fluent/tables/${key}.now.ts`)
            continue
        }
        const check = (field: string, where: string): void => {
            if (!known.has(field)) problems.push(`${key}.${field} referenced in ${where} is not a declared column`)
        }
        layout.list.forEach((f) => check(f, 'list'))
        ;(layout.listSums ?? []).forEach((f) => {
            check(f, 'listSums')
            if (!layout.list.includes(f)) problems.push(`${key}.${f} in listSums but not in list`)
        })
        const seen = new Set<string>()
        for (const section of layout.sections) {
            for (const f of [...section.left, ...(section.right ?? [])]) {
                check(f, `form section "${section.caption}"`)
                if (seen.has(f)) problems.push(`${key}.${f} appears twice on the form`)
                seen.add(f)
            }
        }
        for (const rl of layout.relatedLists) {
            const childCols = cols[rl.child]
            if (!childCols?.has(rl.field)) problems.push(`${key}: related list ${rl.child}.${rl.field} — field not declared on child`)
            if (rl.orderBy && !childCols?.has(rl.orderBy)) problems.push(`${key}: related list ${rl.child} orderBy ${rl.orderBy} not declared`)
        }
    }
    for (const key of Object.keys(TABLES) as DomainTableKey[]) {
        if (!(key in UI_LAYOUT)) problems.push(`${key}: no UI layout defined`)
    }
    return problems
}

function q(s: string): string {
    return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

export function renderLists(): string {
    const out = [HEADER('list columns'), "import { List, default_view } from '@servicenow/sdk/core'", '']
    for (const key of Object.keys(UI_LAYOUT) as DomainTableKey[]) {
        const layout = UI_LAYOUT[key]
        const sums = new Set(layout.listSums ?? [])
        out.push(`// ${TABLES[key]} — replaces legacy view(s): ${layout.legacyViews.length ? layout.legacyViews.join(', ') : 'n/a (new in target)'}`)
        out.push('List({')
        out.push(`    table: ${q(TABLES[key])},`)
        out.push('    view: default_view,')
        out.push('    columns: [')
        for (const col of layout.list) {
            out.push(sums.has(col) ? `        { element: ${q(col)}, sum: true },` : `        { element: ${q(col)} },`)
        }
        out.push('    ],', '})', '')
    }
    return out.join('\n')
}

function fieldElements(fields: readonly string[], indent: string): string[] {
    return fields.map((f) => `${indent}{ type: 'table_field', field: ${q(f)} },`)
}

export function renderForms(): string {
    const out = [HEADER('form sections'), "import { Form, default_view } from '@servicenow/sdk/core'", '']
    for (const key of Object.keys(UI_LAYOUT) as DomainTableKey[]) {
        const layout = UI_LAYOUT[key]
        out.push(`export const form_${key} = Form({`)
        out.push(`    table: ${q(TABLES[key])},`)
        out.push('    view: default_view,')
        out.push('    sections: [')
        for (const section of layout.sections) {
            out.push('        {')
            out.push(`            caption: ${q(section.caption)},`)
            out.push('            content: [')
            if (section.right && section.right.length > 0) {
                out.push('                {')
                out.push("                    layout: 'two-column',")
                out.push('                    leftElements: [')
                out.push(...fieldElements(section.left, '                        '))
                out.push('                    ],')
                out.push('                    rightElements: [')
                out.push(...fieldElements(section.right, '                        '))
                out.push('                    ],')
                out.push('                },')
            } else {
                out.push('                {')
                out.push("                    layout: 'one-column',")
                out.push('                    elements: [')
                out.push(...fieldElements(section.left, '                        '))
                out.push('                    ],')
                out.push('                },')
            }
            out.push('            ],')
            out.push('        },')
        }
        out.push('    ],', '})', '')
    }
    return out.join('\n')
}

export function renderRelatedLists(): string {
    const out = [HEADER('related lists'), "import { Record } from '@servicenow/sdk/core'", '']
    for (const key of Object.keys(UI_LAYOUT) as DomainTableKey[]) {
        const layout = UI_LAYOUT[key]
        if (layout.relatedLists.length === 0) continue
        out.push(`export const rl_${key} = Record({`)
        out.push(`    $id: Now.ID['rl_${key}'],`)
        out.push("    table: 'sys_ui_related_list',")
        out.push(`    data: { name: ${q(TABLES[key])}, view: 'Default view' },`)
        out.push('})')
        layout.relatedLists.forEach((rl, i) => {
            out.push(`export const rl_${key}_${rl.child}_${rl.field} = Record({`)
            out.push(`    $id: Now.ID['rl_${key}_${rl.child}_${rl.field}'],`)
            out.push("    table: 'sys_ui_related_list_entry',")
            out.push('    data: {')
            out.push(`        list_id: Now.ID['rl_${key}'],`)
            out.push(`        related_list: ${q(`${TABLES[rl.child]}.${rl.field}`)},`)
            out.push(`        position: ${i},`)
            if (rl.orderBy) out.push(`        order_by: ${q(rl.orderBy)},`)
            out.push('    },')
            out.push('})')
        })
        out.push('')
    }
    return out.join('\n')
}

export function renderAll(): Record<keyof typeof UI_FILES, string> {
    return { lists: renderLists(), forms: renderForms(), relatedLists: renderRelatedLists() }
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
    const problems = validateLayout()
    if (problems.length) {
        console.error(problems.join('\n'))
        process.exit(1)
    }
    const rendered = renderAll()
    const check = process.argv.includes('--check')
    let stale = false
    for (const k of Object.keys(rendered) as (keyof typeof UI_FILES)[]) {
        const path = UI_FILES[k]
        if (check) {
            let current = ''
            try {
                current = readFileSync(path, 'utf8')
            } catch {
                current = ''
            }
            if (current !== rendered[k]) {
                console.error(`${path} is stale — run npm run gen:ui`)
                stale = true
            }
        } else {
            writeFileSync(path, rendered[k])
            console.log(`wrote ${path}`)
        }
    }
    if (stale) process.exit(1)
}

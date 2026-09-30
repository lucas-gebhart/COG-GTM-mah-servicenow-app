/**
 * Reproducible "how much custom is left" inventory for the NATIVE-VS-CUSTOM comparison.
 *
 *   npx tsx tools/inventory.ts            # markdown table (stdout)
 *   npx tsx tools/inventory.ts --json     # machine-readable
 *
 * Both trees are scanned with the same rules, so the numbers are comparable:
 *  - custom tables      = `Table({` definitions under src/fluent/tables that create a table
 *                         (augmentations of platform tables are listed separately)
 *  - custom columns     = `*Column(` calls in those files — only columns this app defines, never the
 *                         ~70 inherited from `task` / `cmdb_model`; augmentation columns are counted
 *                         separately because they live on platform tables
 *  - staging tables/columns = Import Set staging tables (migration surface, identical in both trees)
 *  - business rules / script includes / client scripts / UI policies / UI actions / ACLs / flows /
 *    scheduled jobs / SLAs / REST APIs = Fluent record constructors anywhere under src/fluent
 *  - server-side script = lines of TypeScript under src/server (+ src/includes / src/producers), and
 *    client-side script = src/client
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
export const TREES = {
    v1: { label: 'v1 custom-table build (`x_cog_mah`)', root: join(HERE, '..', '..') },
    v2: { label: 'v2 platform-native build (`x_cog_mah_native`)', root: join(HERE, '..') },
} as const
export type TreeKey = keyof typeof TREES

export interface Inventory {
    custom_tables: number
    platform_table_augmentations: number
    task_extensions: number
    custom_columns: number
    augmentation_columns: number
    staging_tables: number
    staging_columns: number
    business_rules: number
    script_includes: number
    client_scripts: number
    ui_policies: number
    ui_actions: number
    acls: number
    flows: number
    scheduled_jobs: number
    sla_definitions: number
    scripted_rest_apis: number
    workspaces: number
    ui_pages: number
    server_script_lines: number
    server_script_files: number
    client_script_lines: number
}

const METRIC_LABELS: Record<keyof Inventory, string> = {
    custom_tables: 'Custom tables (created by the app)',
    platform_table_augmentations: 'Platform tables augmented (`core_company`)',
    task_extensions: '… of which extend `task`',
    custom_columns: 'Custom columns defined on those tables',
    augmentation_columns: 'Scoped columns added to platform tables',
    staging_tables: 'Import Set staging tables (migration only)',
    staging_columns: 'Import Set staging columns (migration only)',
    business_rules: 'Business rules',
    script_includes: 'Script includes',
    client_scripts: 'Client scripts',
    ui_policies: 'UI policies',
    ui_actions: 'UI actions',
    acls: 'ACLs',
    flows: 'Flow Designer flows',
    scheduled_jobs: 'Scheduled jobs',
    sla_definitions: 'SLA definitions (`contract_sla`)',
    scripted_rest_apis: 'Scripted REST APIs',
    workspaces: 'UI Builder workspaces',
    ui_pages: 'UI pages',
    server_script_lines: 'Lines of server-side script (TypeScript + JS producers/includes)',
    server_script_files: 'Server-side script files',
    client_script_lines: 'Lines of client-side script',
}

function walk(dir: string, pred: (f: string) => boolean): string[] {
    let out: string[] = []
    let entries: string[]
    try {
        entries = readdirSync(dir)
    } catch {
        return out
    }
    for (const name of entries) {
        const p = join(dir, name)
        if (statSync(p).isDirectory()) out = out.concat(walk(p, pred))
        else if (pred(p)) out.push(p)
    }
    return out
}

const read = (files: string[]): string => files.map((f) => readFileSync(f, 'utf8')).join('\n')
const count = (text: string, re: RegExp): number => (text.match(re) ?? []).length
const lines = (files: string[]): number => files.reduce((n, f) => n + readFileSync(f, 'utf8').split('\n').length, 0)

/** Strip block and line comments so documentation about v1 concepts is not counted as metadata. */
function stripComments(text: string): string {
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

export function inventory(tree: TreeKey): Inventory {
    const root = TREES[tree].root
    const fluent = walk(join(root, 'src', 'fluent'), (f) => f.endsWith('.now.ts'))
    const tables = fluent.filter((f) => f.includes(`${join('src', 'fluent', 'tables')}/`))
    const staging = fluent.filter((f) => f.includes(`${join('src', 'fluent', 'migration')}/`))
    const other = stripComments(read(fluent))
    const tableText = stripComments(read(tables))
    const stagingText = stripComments(read(staging))
    const server = walk(join(root, 'src', 'server'), (f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
        .concat(walk(join(root, 'src', 'includes'), (f) => f.endsWith('.js')))
        .concat(walk(join(root, 'src', 'producers'), (f) => f.endsWith('.js')))
    const client = walk(join(root, 'src', 'client'), (f) => f.endsWith('.js'))
    const tableDefs = count(tableText, /= Table\(\{/g)
    const augmentations = count(tableText, /^\s*augments:\s*'/gm)
    const augmentFiles = tables.filter((f) => /augments:\s*'/.test(readFileSync(f, 'utf8')))
    const augmentColumns = count(stripComments(read(augmentFiles)), /\b[A-Za-z]+Column\(/g)
    return {
        custom_tables: tableDefs - augmentations,
        platform_table_augmentations: augmentations,
        task_extensions: count(tableText, /^\s*extends:\s*'task'/gm),
        custom_columns: count(tableText, /\b[A-Za-z]+Column\(/g) - augmentColumns,
        augmentation_columns: augmentColumns,
        staging_tables: count(stagingText, /= Table\(\{/g),
        staging_columns: count(stagingText, /\b[A-Za-z]+Column\(/g),
        business_rules: count(other, /\bBusinessRule\(\{/g),
        script_includes: count(other, /\bScriptInclude\(\{/g),
        client_scripts: count(other, /\bClientScript\(\{/g),
        ui_policies: count(other, /\bUiPolicy\(\{/g),
        ui_actions: count(other, /\bUiAction\(\{/g),
        acls: count(other, /\bAcl\(\{/g),
        flows: count(other, /\bFlow\(\s*\{/g),
        scheduled_jobs: count(other, /\bScheduledScript\(\{/g),
        sla_definitions: count(other, /\bSla\(\{/g),
        scripted_rest_apis: count(other, /\bRestApi\(\{/g),
        workspaces: count(other, /\bWorkspace\(\{/g),
        ui_pages: count(other, /\bUiPage\(\{/g),
        server_script_lines: lines(server),
        server_script_files: server.length,
        client_script_lines: lines(client),
    }
}

export function renderMarkdown(v1: Inventory, v2: Inventory): string {
    const rows = (Object.keys(METRIC_LABELS) as (keyof Inventory)[]).map((k) => {
        const a = v1[k]
        const b = v2[k]
        const delta = b - a
        const sign = delta > 0 ? `+${delta}` : `${delta}`
        return `| ${METRIC_LABELS[k]} | ${a} | ${b} | ${sign} |`
    })
    return ['| Metric | v1 `x_cog_mah` | v2 `x_cog_mah_native` | Δ |', '| --- | ---: | ---: | ---: |', ...rows].join('\n')
}

function main(): void {
    const v1 = inventory('v1')
    const v2 = inventory('v2')
    if (process.argv.includes('--json')) {
        console.log(JSON.stringify({ generated_from: { v1: relative(process.cwd(), TREES.v1.root) || '.', v2: relative(process.cwd(), TREES.v2.root) || '.' }, v1, v2 }, null, 2))
        return
    }
    console.log(renderMarkdown(v1, v2))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()

/**
 * Reads a legacy export directory (the HAAS `export/csv/` folder or `sample-data/csv/`) into
 * per-form rows keyed exactly like the staging tables. The header of every file is checked
 * against the contract so a drifted export fails loudly instead of loading shifted columns.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { csvHeader, LEGACY_FORMS, LOAD_ORDER, stagingColumnMap, type LegacyFormName } from '../../src/server/lib/legacyContract'
import type { SourceRow } from '../../src/server/migration/rowTransforms'
import { parseCsv, rowToObject } from './csv'

export interface SourceFile {
    form: LegacyFormName
    file: string
    path: string
    rows: SourceRow[]
}

export interface SourceExport {
    dir: string
    files: SourceFile[]
    /** Files in the directory that no contract form claims. */
    unexpectedFiles: string[]
    /** Contract forms with no file present. */
    missingForms: LegacyFormName[]
}

export function headerMismatch(form: LegacyFormName, header: readonly string[]): string | null {
    const expected = csvHeader(form)
    if (header.length !== expected.length) return `${LEGACY_FORMS[form].csvFile}: ${header.length} columns, contract has ${expected.length}`
    for (let i = 0; i < expected.length; i++) {
        if (header[i] !== expected[i]) return `${LEGACY_FORMS[form].csvFile}: column ${i + 1} is "${header[i]}", contract expects "${expected[i]}"`
    }
    return null
}

export function readSourceFile(form: LegacyFormName, path: string): SourceFile {
    const parsed = parseCsv(readFileSync(path, 'utf8'))
    const mismatch = headerMismatch(form, parsed.header)
    if (mismatch) throw new Error(mismatch)
    const keys = stagingColumnMap(form).map((c) => c.key)
    return {
        form,
        file: LEGACY_FORMS[form].csvFile,
        path,
        rows: parsed.rows.map((r) => rowToObject(keys, r)),
    }
}

export function readSourceExport(dir: string): SourceExport {
    if (!existsSync(dir)) throw new Error(`source directory not found: ${dir}`)
    const present = new Set(readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.csv')))
    const files: SourceFile[] = []
    const missingForms: LegacyFormName[] = []
    for (const form of LOAD_ORDER) {
        const name = LEGACY_FORMS[form].csvFile
        if (!present.has(name)) {
            missingForms.push(form)
            continue
        }
        present.delete(name)
        files.push(readSourceFile(form, join(dir, name)))
    }
    return { dir, files, unexpectedFiles: [...present].sort(), missingForms }
}

/** `dryRun()` input from a read export. */
export function sourcesByForm(exp: SourceExport): Partial<Record<LegacyFormName, SourceRow[]>> {
    const out: Partial<Record<LegacyFormName, SourceRow[]>> = {}
    for (const f of exp.files) out[f.form] = f.rows
    return out
}

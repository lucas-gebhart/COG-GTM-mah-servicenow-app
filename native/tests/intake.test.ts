import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DELIMITED_COLUMNS } from '../src/server/lib/authFileParser'
import { INTAKE_IMPORT_PATH, INTAKE_STAGING_TABLE, TABLES } from '../src/server/lib/domain'
import { INTAKE_COLUMNS, INTAKE_DUPLICATE_MESSAGE, INTAKE_REJECTED_MESSAGE, classifyPendingRow, intakeParseLog, intakeStage, rowToDelimited, validateIntakeRow, type IntakeRow } from '../src/server/intake/importSetIntake'

const good: IntakeRow = {
    file_name: 'hrc-2026-09-30.txt',
    record_id: 'HRC-2026-000123',
    agency: 'HRC',
    authorization_date: '2026-09-15',
    requester_type: 'Veteran',
    last_name: 'Doe',
    first_name: 'Jane',
    unit_name: '',
    service_number_last4: '1234',
    dob: '1950-01-02',
    email: 'jane.doe@example.com',
    phone: '555-123-4567',
    address_1: '1 Main St',
    address_2: '',
    city: 'Louisville',
    state: 'KY',
    zip: '40202',
    ship_to: '',
    award_name: 'Army Commendation Medal',
    device: 'none',
    quantity: '1',
    engraving_text: 'J. DOE',
    engraving_required: 'true',
}

describe('Import Set API intake (x_cog_mah_native_stg_authorization_line)', () => {
    it('staging columns are the v1 delimited feed columns plus file_name', () => {
        expect(INTAKE_COLUMNS).toEqual(['file_name', ...DELIMITED_COLUMNS])
        expect(INTAKE_IMPORT_PATH).toBe(`/api/now/import/${INTAKE_STAGING_TABLE}`)
    })

    it('re-serialises a staging row as a one-record tab-delimited file, flattening tabs and newlines', () => {
        const text = rowToDelimited({ ...good, engraving_text: 'J.\tDOE\nJR' })
        const [header, row, extra] = text.split('\n')
        expect(header).toBe(DELIMITED_COLUMNS.join('\t'))
        expect(row?.split('\t')).toHaveLength(DELIMITED_COLUMNS.length)
        expect(row).toContain('J. DOE JR')
        expect(extra).toBeUndefined()
    })

    it('accepts a valid row through the ported v1 parser (award key, device, agency, requester normalised)', () => {
        const v = validateIntakeRow(good)
        expect(v.issues).toEqual([])
        expect(v.fileName).toBe('hrc-2026-09-30.txt')
        expect(v.record?.source_agency).toBe('hrc')
        expect(v.record?.source_record_id).toBe('HRC-2026-000123')
        expect(v.record?.requester.type).toBe('veteran')
        expect(v.record?.requester.email).toBe('jane.doe@example.com')
        expect(v.record?.awards).toEqual([{ award_name: 'army_commendation_medal', device: 'none', quantity: 1, engraving_text: 'J. DOE', engraving_required: true }])
    })

    it('rejects a row with a bad quantity, unknown award, unknown agency or oversized engraving text', () => {
        expect(validateIntakeRow({ ...good, quantity: '0' }).issues.join(' ')).toMatch(/quantity/)
        expect(validateIntakeRow({ ...good, quantity: '1000' }).issues.join(' ')).toMatch(/quantity/)
        expect(validateIntakeRow({ ...good, award_name: 'Golden Fleece' }).issues.join(' ')).toMatch(/award_name.*not in the catalog/)
        expect(validateIntakeRow({ ...good, agency: 'FBI' }).issues.join(' ')).toMatch(/source_agency/)
        expect(validateIntakeRow({ ...good, engraving_text: 'X'.repeat(200) }).issues.join(' ')).toMatch(/engraving_text/)
        expect(validateIntakeRow({ ...good, record_id: 'bad id!' }).issues.join(' ')).toMatch(/source_record_id/)
        expect(validateIntakeRow({ ...good, zip: '1234' }).issues.join(' ')).toMatch(/zip/i)
        expect(validateIntakeRow({}).record).toBeUndefined()
    })

    it('requires the agency on the row and a permitted file name', () => {
        expect(validateIntakeRow({ ...good, agency: '' }).issues.join(' ')).toMatch(/source_agency/)
        const bad = validateIntakeRow({ ...good, file_name: '../etc/passwd' })
        expect(bad.record).toBeUndefined()
        expect(bad.issues.join(' ')).toMatch(/file_name/)
        expect(validateIntakeRow({ ...good, file_name: '' }).fileName).toBe('import-set-intake.txt')
    })

    it('derives the authorization-file parse stage from the Import Set row states', () => {
        expect(classifyPendingRow(`${INTAKE_REJECTED_MESSAGE}: requester.dob: DOB is not a recognized date`)).toBe('error')
        expect(classifyPendingRow(`${INTAKE_DUPLICATE_MESSAGE}: X already loaded as NMAH0001001`)).toBe('ignored')
        expect(classifyPendingRow('Additional award line for NMAH0001001')).toBe('ignored')
        expect(classifyPendingRow('')).toBe('inserted')
        expect(intakeStage({ inserted: 2, updated: 1, error: 0 })).toBe('parsed')
        expect(intakeStage({ inserted: 2, updated: 0, error: 1 })).toBe('partial')
        expect(intakeStage({ inserted: 0, updated: 0, error: 3 })).toBe('failed')
        expect(intakeStage({ inserted: 0, updated: 0, error: 0 })).toBe('parsed')
        expect(intakeParseLog('f.txt', { total: 4, inserted: 2, updated: 1, ignored: 0, error: 1 }, 2, 3)).toMatch(/4 staging row\(s\)[\s\S]*accepted 3[\s\S]*rejected 1[\s\S]*cases linked 2, award lines 3/)
    })

    it('Fluent metadata declares the staging table and a transform map onto the awards case coalescing on the source record id', () => {
        const fluent = readFileSync('src/fluent/migration/intake.now.ts', 'utf8')
        expect(fluent).toContain(`name: '${INTAKE_STAGING_TABLE}'`)
        expect(fluent).toContain("extends: 'sys_import_set_row'")
        for (const c of INTAKE_COLUMNS) expect(fluent, c).toContain(`${c}: StringColumn(`)
        expect(fluent).toContain(`sourceTable: '${INTAKE_STAGING_TABLE}'`)
        expect(fluent).toContain(`targetTable: '${TABLES.awards_case}'`)
        expect(fluent).toContain("source_record_id: { sourceField: 'record_id', coalesce: true")
        expect(fluent).toContain('runBusinessRules: true')
        expect(fluent).toContain('intakeBefore(source, target, !target.isNewRecord())')
        expect(fluent).toContain('intakeAfter(source, target)')
        expect(fluent).toContain('intakeComplete(import_set)')
        const bridge = readFileSync('src/includes/MAHNativeMigration.js', 'utf8')
        for (const m of ['intakeBefore', 'intakeAfter', 'intakeComplete']) expect(bridge).toContain(`${m}: function`)
        expect(bridge).toContain('src/server/intake/importSetIntake.ts')
    })
})

import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { LEGACY_FORMS, LIMITS, MIGRATION_EXCEPTION_STATES, MIGRATION_EXCEPTION_TYPES } from '../../server/lib/domain'

/**
 * Quarantine for rows the transform maps could not load cleanly: orphaned lines
 * (parent UNID missing), unmapped statuses, unparseable dates, duplicate requesters,
 * validation failures. Every exception keeps the raw value so nothing is silently lost.
 */
export const x_cog_mah_migration_exception = Table({
    name: 'x_cog_mah_migration_exception',
    label: 'Migration Exception',
    audit: true,
    display: 'number',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID (offending row)', maxLength: LIMITS.legacyUnid }),
        legacy_form: ChoiceColumn({ label: 'Legacy form', choices: LEGACY_FORMS, dropdown: 'dropdown_with_none' }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: MIGRATION_EXCEPTION_STATES, default: 'open', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        exception_type: ChoiceColumn({ label: 'Exception type', choices: MIGRATION_EXCEPTION_TYPES, mandatory: true, dropdown: 'dropdown_with_none' }),
        batch_id: StringColumn({ label: 'Migration batch', maxLength: 40 }),
        import_set: StringColumn({ label: 'Import set', maxLength: 40 }),
        source_table: StringColumn({ label: 'Staging table', maxLength: 80 }),
        source_row: IntegerColumn({ label: 'Source row', default: 0 }),
        parent_unid: StringColumn({ label: 'Parent UNID (expected)', maxLength: LIMITS.legacyUnid }),
        target_table: StringColumn({ label: 'Target table', maxLength: 80 }),
        target_sys_id: StringColumn({ label: 'Target record sys_id', maxLength: 32 }),
        field_name: StringColumn({ label: 'Field', maxLength: 80 }),
        raw_value: MultiLineTextColumn({ label: 'Raw value', maxLength: 4000 }),
        message: StringColumn({ label: 'Message', maxLength: 255, mandatory: true }),
        resolution: StringColumn({ label: 'Resolution', maxLength: 255 }),
        resolved_by: ReferenceColumn({ label: 'Resolved by', referenceTable: 'sys_user' }),
        resolved_at: DateTimeColumn({ label: 'Resolved' }),
    },
    index: [
        { name: 'idx_mmx_type_state', unique: false, element: ['exception_type', 'state'] },
        { name: 'idx_mmx_legacy_unid', unique: false, element: 'legacy_unid' },
        { name: 'idx_mmx_batch', unique: false, element: 'batch_id' },
    ],
    autoNumber: { prefix: 'MMX', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

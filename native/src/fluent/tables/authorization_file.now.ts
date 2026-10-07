import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, IntegerColumn, MultiLineTextColumn, ReferenceColumn, DateColumn } from '@servicenow/sdk/core'
import { FILE_FORMATS, LIMITS, PARSE_STATUSES } from '../../server/lib/domain'

/**
 * Replaces the Domino `AuthorizationFile` form as a **task extension**: the intake work item for one
 * HRC / NPRC authorization batch. The file itself is a native attachment on this task; `stage`
 * (parse status) is mirrored into task state; `import_set` links the Import Set run that created it.
 */
export const x_cog_mah_native_authorization_file = Table({
    name: 'x_cog_mah_native_authorization_file',
    label: 'Authorization File (Native)',
    extends: 'task',
    audit: true,
    display: 'number',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        legacy_number: StringColumn({ label: 'Legacy file key', maxLength: 255 }),
        stage: ChoiceColumn({ label: 'Parse stage', choices: PARSE_STATUSES, default: 'received', dropdown: 'dropdown_without_none' }),

        file_name: StringColumn({ label: 'File name', maxLength: 255, mandatory: true }),
        source_agency: ReferenceColumn({
            label: 'Source agency (company)',
            referenceTable: 'core_company',
            cascadeRule: 'clear',
            useReferenceQualifier: 'simple',
            referenceQual: 'x_cog_mah_native_agency_codeISNOTEMPTY',
        }),
        format: ChoiceColumn({ label: 'Format', choices: FILE_FORMATS, default: 'json', dropdown: 'dropdown_without_none' }),
        record_count: IntegerColumn({ label: 'Record count', default: 0 }),
        accepted_count: IntegerColumn({ label: 'Accepted', default: 0, readOnly: true }),
        rejected_count: IntegerColumn({ label: 'Rejected', default: 0, readOnly: true }),
        duplicate_count: IntegerColumn({ label: 'Already present (idempotent skip)', default: 0, readOnly: true }),
        parse_log: MultiLineTextColumn({ label: 'Parse log', maxLength: 8000, readOnly: true }),
        source_hash: StringColumn({ label: 'Source hash (SHA-256)', maxLength: 64, readOnly: true }),
        submitted_by: ReferenceColumn({ label: 'Submitted by', referenceTable: 'sys_user' }),
        intake_channel: StringColumn({ label: 'Intake channel', maxLength: 40, default: 'manual' }),
        import_set: ReferenceColumn({ label: 'Import set', referenceTable: 'sys_import_set', cascadeRule: 'clear' }),
        layout: StringColumn({ label: 'Layout', maxLength: 20 }),
        transmission_date: DateColumn({ label: 'Transmission date' }),
        authorization_date: DateColumn({ label: 'Authorization date' }),
        imported_at: DateTimeColumn({ label: 'Imported' }),
        cases_created: IntegerColumn({ label: 'Cases created', default: 0 }),
        lines_created: IntegerColumn({ label: 'Lines created', default: 0 }),
        requesters_created: IntegerColumn({ label: 'Requesters created', default: 0 }),
        requesters_matched: IntegerColumn({ label: 'Requesters matched', default: 0 }),
        checksum_match: BooleanColumn({ label: 'Trailer checksum matched', default: true }),
    },
    index: [
        { name: 'idx_nfile_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_nfile_source_hash', unique: false, element: 'source_hash' },
    ],
    autoNumber: { prefix: 'NMAF', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

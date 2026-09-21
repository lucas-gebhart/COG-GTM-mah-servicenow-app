import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    DateColumn,
} from '@servicenow/sdk/core'
import { FILE_FORMATS, LIFECYCLE_STATES, LIMITS, PARSE_STATUSES, SOURCE_AGENCIES } from '../../server/lib/domain'

/**
 * Replaces the Domino `AuthorizationFile` form: one row per HRC / NPRC authorization
 * batch. The raw file is stored as a standard attachment (sys_attachment) on this row;
 * `source_hash` makes REST intake idempotent when the same file is re-sent.
 */
export const x_cog_mah_authorization_file = Table({
    name: 'x_cog_mah_authorization_file',
    label: 'Authorization File',
    audit: true,
    display: 'file_name',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:global.getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: LIFECYCLE_STATES, default: 'open', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        file_name: StringColumn({ label: 'File name', maxLength: 255, mandatory: true }),
        received: DateTimeColumn({ label: 'Received' }),
        source_agency: ChoiceColumn({ label: 'Source agency', choices: SOURCE_AGENCIES, default: 'hrc', dropdown: 'dropdown_without_none' }),
        format: ChoiceColumn({ label: 'Format', choices: FILE_FORMATS, default: 'json', dropdown: 'dropdown_without_none' }),
        record_count: IntegerColumn({ label: 'Record count', default: 0 }),
        accepted_count: IntegerColumn({ label: 'Accepted', default: 0, readOnly: true }),
        rejected_count: IntegerColumn({ label: 'Rejected', default: 0, readOnly: true }),
        duplicate_count: IntegerColumn({ label: 'Already present (idempotent skip)', default: 0, readOnly: true }),
        parse_status: ChoiceColumn({ label: 'Parse status', choices: PARSE_STATUSES, default: 'received', dropdown: 'dropdown_without_none' }),
        parse_log: MultiLineTextColumn({ label: 'Parse log', maxLength: 8000, readOnly: true }),
        source_hash: StringColumn({ label: 'Source hash (SHA-256)', maxLength: 64, readOnly: true }),
        submitted_by: ReferenceColumn({ label: 'Submitted by', referenceTable: 'sys_user' }),
        intake_channel: StringColumn({ label: 'Intake channel', maxLength: 40, default: 'manual' }),
        legacy_number: StringColumn({ label: 'Legacy file key', maxLength: 255 }),
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
        { name: 'idx_file_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_file_source_hash', unique: false, element: 'source_hash' },
    ],
    autoNumber: { prefix: 'MAF', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

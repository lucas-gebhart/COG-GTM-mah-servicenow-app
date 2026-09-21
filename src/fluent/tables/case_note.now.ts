import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    MultiLineTextColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { LIFECYCLE_STATES, LIMITS, NOTE_TYPES } from '../../server/lib/domain'

/**
 * Migrated Domino `CaseNote` response documents (rich-text notes attached to a case or
 * request). New notes on the platform go into the journal fields on the parent record;
 * this table preserves legacy authorship and timestamps verbatim for audit.
 */
export const x_cog_mah_case_note = Table({
    name: 'x_cog_mah_case_note',
    label: 'Case Note',
    audit: true,
    display: 'number',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: LIFECYCLE_STATES, default: 'open', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        awards_case: ReferenceColumn({ label: 'Awards case', referenceTable: 'x_cog_mah_awards_case', cascadeRule: 'delete' }),
        heraldry_request: ReferenceColumn({ label: 'Heraldry request', referenceTable: 'x_cog_mah_heraldry_request', cascadeRule: 'delete' }),
        note_type: ChoiceColumn({ label: 'Note type', choices: NOTE_TYPES, default: 'internal', dropdown: 'dropdown_without_none' }),
        noted_at: DateTimeColumn({ label: 'Noted at', default: 'javascript:gs.nowDateTime();' }),
        author: ReferenceColumn({ label: 'Author', referenceTable: 'sys_user' }),
        legacy_author: StringColumn({ label: 'Legacy author (Notes name)', maxLength: 160 }),
        body: MultiLineTextColumn({ label: 'Note', maxLength: LIMITS.justification, mandatory: true }),
        customer_visible: BooleanColumn({ label: 'Customer visible', default: false }),
    },
    index: [
        { name: 'idx_note_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_note_case', unique: false, element: 'awards_case' },
        { name: 'idx_note_request', unique: false, element: 'heraldry_request' },
    ],
    autoNumber: { prefix: 'MCN', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

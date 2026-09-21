import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DateColumn,
    IntegerColumn,
    ReferenceColumn,
    GenericColumn,
} from '@servicenow/sdk/core'
import { AGING_FLAGS, CASE_STAGES, LIFECYCLE_STATES, LIMITS, SOURCE_AGENCIES } from '../../server/lib/domain'

/**
 * Replaces the Domino `AwardsCase` form. One case per authorization record received
 * from HRC / NPRC; award lines, engraving jobs, shipments and notes hang off it.
 */
export const x_cog_mah_awards_case = Table({
    name: 'x_cog_mah_awards_case',
    label: 'Awards Case',
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

        short_description: StringColumn({ label: 'Short description', maxLength: 160 }),
        requester: ReferenceColumn({ label: 'Requester', referenceTable: 'x_cog_mah_requester', cascadeRule: 'restrict' }),
        authorization_file: ReferenceColumn({ label: 'Authorization file', referenceTable: 'x_cog_mah_authorization_file', cascadeRule: 'clear' }),
        source_agency: ChoiceColumn({ label: 'Source agency', choices: SOURCE_AGENCIES, default: 'hrc', dropdown: 'dropdown_without_none' }),
        source_record_id: StringColumn({ label: 'Source record ID', maxLength: 64 }),
        authorization_date: DateColumn({ label: 'Authorization date' }),

        stage: ChoiceColumn({ label: 'Stage', choices: CASE_STAGES, default: 'authorized', dropdown: 'dropdown_without_none' }),
        stage_entered_at: DateTimeColumn({ label: 'Stage entered' }),
        days_in_stage: IntegerColumn({ label: 'Days in stage', default: 0, readOnly: true }),
        aging_flag: ChoiceColumn({ label: 'Aging flag', choices: AGING_FLAGS, default: 'green', dropdown: 'dropdown_without_none' }),
        assigned_to: ReferenceColumn({
            label: 'Assigned to',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah.tacom_staff',
        }),
        assignment_group: ReferenceColumn({ label: 'Assignment group', referenceTable: 'sys_user_group' }),
        priority_handling: BooleanColumn({ label: 'Priority handling (congressional / funeral)', default: false }),

        ship_to_name: StringColumn({ label: 'Ship to name', maxLength: LIMITS.name }),
        ship_to_address_1: StringColumn({ label: 'Ship to address 1', maxLength: 100 }),
        ship_to_address_2: StringColumn({ label: 'Ship to address 2', maxLength: 100 }),
        ship_to_city: StringColumn({ label: 'Ship to city', maxLength: 60 }),
        ship_to_state: StringColumn({ label: 'Ship to state', maxLength: 2 }),
        ship_to_zip: StringColumn({ label: 'Ship to ZIP', maxLength: 10 }),
        ship_to_country: StringColumn({ label: 'Ship to country', maxLength: 2, default: 'US' }),

        line_count: IntegerColumn({ label: 'Award lines', default: 0, readOnly: true }),
        total_quantity: IntegerColumn({ label: 'Total quantity', default: 0, readOnly: true }),
        closed_at: DateTimeColumn({ label: 'Closed' }),
        cancel_reason: StringColumn({ label: 'Cancel reason', maxLength: 255 }),

        notes: GenericColumn({ label: 'Notes (customer visible)', columnType: 'journal_input' }),
        work_notes: GenericColumn({ label: 'Work notes', columnType: 'journal_input' }),
    },
    index: [
        { name: 'idx_case_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_case_source_record', unique: false, element: ['source_agency', 'source_record_id'] },
        { name: 'idx_case_stage_aging', unique: false, element: ['stage', 'aging_flag'] },
    ],
    autoNumber: { prefix: 'MAH', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

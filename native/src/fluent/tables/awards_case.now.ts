import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, DateColumn, IntegerColumn, ReferenceColumn } from '@servicenow/sdk/core'
import { CASE_PRIORITIES, CASE_STAGES, LIMITS, NOK_RELATIONSHIPS, QC_RESULTS, SERVICE_COMPONENTS, SERVICE_ERAS } from '../../server/lib/domain'

/**
 * Replaces the Domino `AwardsCase` form as a **task extension**. Number, state, active, priority,
 * short_description, assigned_to / assignment_group, work_notes / comments (activity stream),
 * attachments, approvals, Task SLA and Visual Task Boards are inherited from `task`; the columns
 * below are the mission-specific remainder. `stage` keeps the MAH vocabulary and is mirrored into
 * `state` (see TASK_STATE_BY_STAGE). No days_in_stage / aging_flag: Task SLA measures age.
 */
export const x_cog_mah_native_awards_case = Table({
    name: 'x_cog_mah_native_awards_case',
    label: 'Awards Case (Native)',
    extends: 'task',
    audit: true,
    display: 'number',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        legacy_number: StringColumn({ label: 'Legacy case number', maxLength: 40 }),

        requester: ReferenceColumn({ label: 'Requester', referenceTable: 'x_cog_mah_native_requester', cascadeRule: 'restrict' }),
        requester_relationship: ChoiceColumn({ label: 'Requester relationship', choices: NOK_RELATIONSHIPS, dropdown: 'dropdown_with_none' }),
        authorization_file: ReferenceColumn({ label: 'Authorization file', referenceTable: 'x_cog_mah_native_authorization_file', cascadeRule: 'clear' }),
        authorization_file_line: IntegerColumn({ label: 'Authorization file line' }),
        source_agency: ReferenceColumn({
            label: 'Source agency (company)',
            referenceTable: 'core_company',
            cascadeRule: 'clear',
            useReferenceQualifier: 'simple',
            referenceQual: 'x_cog_mah_native_agency_codeISNOTEMPTY',
        }),
        source_record_id: StringColumn({ label: 'Source record ID', maxLength: 100 }),
        authorization_date: DateColumn({ label: 'Authorization date' }),

        veteran_last_name: StringColumn({ label: 'Veteran last name', maxLength: LIMITS.name }),
        veteran_first_name: StringColumn({ label: 'Veteran first name', maxLength: LIMITS.name }),
        veteran_middle_initial: StringColumn({ label: 'Veteran middle initial', maxLength: 1 }),
        veteran_rank: StringColumn({ label: 'Veteran rank', maxLength: 10 }),
        service_number_last4: StringColumn({ label: 'Service number (last 4)', maxLength: 4 }),
        service_component: ChoiceColumn({ label: 'Component', choices: SERVICE_COMPONENTS, dropdown: 'dropdown_with_none' }),
        service_era: ChoiceColumn({ label: 'Era', choices: SERVICE_ERAS, dropdown: 'dropdown_with_none' }),
        service_from: DateColumn({ label: 'Service from' }),
        service_to: DateColumn({ label: 'Service to' }),
        veteran_deceased: BooleanColumn({ label: 'Veteran deceased', default: false }),

        stage: ChoiceColumn({ label: 'Stage', choices: CASE_STAGES, default: 'authorized', dropdown: 'dropdown_without_none' }),
        stage_entered_at: DateTimeColumn({ label: 'Stage entered' }),
        handling_priority: ChoiceColumn({ label: 'Handling priority', choices: CASE_PRIORITIES, default: 'routine', dropdown: 'dropdown_without_none' }),
        priority_handling: BooleanColumn({ label: 'Priority handling (congressional / funeral)', default: false }),
        on_hold: BooleanColumn({ label: 'On hold', default: false }),
        hold_reason: StringColumn({ label: 'Hold reason', maxLength: 255 }),
        engraving_required: BooleanColumn({ label: 'Engraving required', default: false }),
        qc_result: ChoiceColumn({ label: 'QC result', choices: QC_RESULTS, default: 'pending', dropdown: 'dropdown_without_none' }),
        pick_bin: StringColumn({ label: 'Warehouse pick bin', maxLength: 20 }),

        ship_to_name: StringColumn({ label: 'Ship to name', maxLength: LIMITS.name }),
        ship_to_address_1: StringColumn({ label: 'Ship to address 1', maxLength: 100 }),
        ship_to_address_2: StringColumn({ label: 'Ship to address 2', maxLength: 100 }),
        ship_to_city: StringColumn({ label: 'Ship to city', maxLength: 60 }),
        ship_to_state: StringColumn({ label: 'Ship to state', maxLength: 2 }),
        ship_to_zip: StringColumn({ label: 'Ship to ZIP', maxLength: 10 }),
        ship_to_country: StringColumn({ label: 'Ship to country', maxLength: 2, default: 'US' }),

        line_count: IntegerColumn({ label: 'Award lines', default: 0, readOnly: true }),
        total_quantity: IntegerColumn({ label: 'Total quantity', default: 0, readOnly: true }),
        cancel_reason: StringColumn({ label: 'Cancel reason', maxLength: 255 }),
    },
    index: [
        { name: 'idx_ncase_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_ncase_source_record', unique: false, element: ['source_agency', 'source_record_id'] },
        { name: 'idx_ncase_stage', unique: false, element: 'stage' },
        { name: 'idx_ncase_legacy_number', unique: false, element: 'legacy_number' },
    ],
    autoNumber: { prefix: 'NMAH', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

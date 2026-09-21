import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DateColumn,
    EmailColumn,
    IntegerColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { LIMITS, REQUESTER_STATES, REQUESTER_TYPES } from '../../server/lib/domain'

/**
 * Replaces the Domino `Requester` form (veteran, next of kin or unit). Legacy data had
 * heavy duplication, so `dedupe_key` + `merged_into` carry the coalescing result.
 * All personal data in this application is synthetic.
 */
export const x_cog_mah_requester = Table({
    name: 'x_cog_mah_requester',
    label: 'Requester',
    audit: true,
    display: 'name',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: REQUESTER_STATES, default: 'active', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        name: StringColumn({ label: 'Display name', maxLength: 160, readOnly: true }),
        type: ChoiceColumn({ label: 'Requester type', choices: REQUESTER_TYPES, default: 'veteran', mandatory: true, dropdown: 'dropdown_without_none' }),
        first_name: StringColumn({ label: 'First name', maxLength: LIMITS.name }),
        middle_initial: StringColumn({ label: 'Middle initial', maxLength: 1 }),
        last_name: StringColumn({ label: 'Last name', maxLength: LIMITS.name }),
        suffix: StringColumn({ label: 'Suffix', maxLength: 10 }),
        relationship: StringColumn({ label: 'Relationship to service member', maxLength: 40 }),
        unit_name: StringColumn({ label: 'Unit name', maxLength: LIMITS.name }),
        service_number_last4: StringColumn({ label: 'Service number (last 4)', maxLength: 4 }),
        dob: DateColumn({ label: 'Date of birth (synthetic)' }),
        email: EmailColumn({ label: 'Email', maxLength: LIMITS.email }),
        phone: StringColumn({ label: 'Phone', maxLength: LIMITS.phone }),
        address_1: StringColumn({ label: 'Address 1', maxLength: 100 }),
        address_2: StringColumn({ label: 'Address 2', maxLength: 100 }),
        city: StringColumn({ label: 'City', maxLength: 60 }),
        address_state: StringColumn({ label: 'State / province', maxLength: 2 }),
        zip: StringColumn({ label: 'ZIP', maxLength: 10 }),
        country: StringColumn({ label: 'Country', maxLength: 2, default: 'US' }),

        dedupe_key: StringColumn({ label: 'Dedupe key', maxLength: 120, readOnly: true }),
        merged_into: ReferenceColumn({ label: 'Merged into', referenceTable: 'x_cog_mah_requester', cascadeRule: 'clear' }),
        merge_target: ReferenceColumn({ label: 'Merge into (survivor)', referenceTable: 'x_cog_mah_requester', cascadeRule: 'clear' }),
        duplicate_count: IntegerColumn({ label: 'Duplicates merged', default: 0, readOnly: true }),
        case_count: IntegerColumn({ label: 'Open cases', default: 0, readOnly: true }),
    },
    index: [
        { name: 'idx_req_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_req_dedupe_key', unique: false, element: 'dedupe_key' },
        { name: 'idx_req_last_first', unique: false, element: ['last_name', 'first_name'] },
    ],
    autoNumber: { prefix: 'MAR', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

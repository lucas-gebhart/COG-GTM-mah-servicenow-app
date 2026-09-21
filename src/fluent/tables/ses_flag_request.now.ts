import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DateColumn,
    EmailColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { LIMITS, SES_FLAG_STATES, SES_FLAG_TYPES } from '../../server/lib/domain'

/**
 * Replaces the Domino `SESFlagRequest` form: positional flags for Senior Executive
 * Service members (indoor, outdoor, automobile, boat) authorized under AR 840-10.
 */
export const x_cog_mah_ses_flag_request = Table({
    name: 'x_cog_mah_ses_flag_request',
    label: 'SES Flag Request',
    audit: true,
    display: 'number',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: SES_FLAG_STATES, default: 'draft', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        requesting_office: StringColumn({ label: 'Requesting office', maxLength: LIMITS.name, mandatory: true }),
        executive_name: StringColumn({ label: 'Executive name', maxLength: LIMITS.name, mandatory: true }),
        position_title: StringColumn({ label: 'Position title', maxLength: 160, mandatory: true }),
        appointment_date: DateColumn({ label: 'SES appointment date' }),
        flag_type: ChoiceColumn({ label: 'Flag type', choices: SES_FLAG_TYPES, default: 'indoor', mandatory: true, dropdown: 'dropdown_without_none' }),
        quantity: IntegerColumn({ label: 'Quantity', default: 1, mandatory: true }),
        justification: MultiLineTextColumn({ label: 'Justification', maxLength: LIMITS.justification, mandatory: true }),
        poc_email: EmailColumn({ label: 'POC email', maxLength: LIMITS.email }),
        poc_phone: StringColumn({ label: 'POC phone', maxLength: LIMITS.phone }),
        ship_to: MultiLineTextColumn({ label: 'Ship to', maxLength: 400 }),
        approved_by: ReferenceColumn({ label: 'Approved by', referenceTable: 'sys_user' }),
        approved_at: DateTimeColumn({ label: 'Approved' }),
        rejection_reason: StringColumn({ label: 'Rejection reason', maxLength: 255 }),
        delivered_at: DateTimeColumn({ label: 'Delivered' }),
    },
    index: [
        { name: 'idx_ses_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_ses_state', unique: false, element: 'state' },
    ],
    autoNumber: { prefix: 'SES', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

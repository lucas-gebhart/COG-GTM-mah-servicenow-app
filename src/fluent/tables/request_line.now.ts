import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DecimalColumn,
    IntegerColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { LIFECYCLE_STATES, LIMITS, LINE_STATUSES, UNITS_OF_ISSUE } from '../../server/lib/domain'

/** Replaces the Domino `RequestLine` response document: one heraldic item per DD 1348-6 line. */
export const x_cog_mah_request_line = Table({
    name: 'x_cog_mah_request_line',
    label: 'Request Line',
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

        heraldry_request: ReferenceColumn({ label: 'Heraldry request', referenceTable: 'x_cog_mah_heraldry_request', mandatory: true, cascadeRule: 'delete' }),
        line_number: IntegerColumn({ label: 'Line', default: 1 }),
        heraldic_item: ReferenceColumn({
            label: 'Heraldic item',
            referenceTable: 'x_cog_mah_heraldic_item',
            cascadeRule: 'restrict',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true',
        }),
        nsn_or_exception: StringColumn({ label: 'NSN or exception', maxLength: LIMITS.stockNumber }),
        nomenclature: StringColumn({ label: 'Nomenclature (snapshot)', maxLength: LIMITS.name }),
        unit_of_issue: ChoiceColumn({ label: 'Unit of issue', choices: UNITS_OF_ISSUE, default: 'EA', dropdown: 'dropdown_without_none' }),
        quantity: IntegerColumn({ label: 'Quantity', default: 1, mandatory: true }),
        unit_price: DecimalColumn({ label: 'Unit price', scale: 2, default: 0 }),
        extended_price: DecimalColumn({ label: 'Extended price', scale: 2, default: 0, readOnly: true }),
        status: ChoiceColumn({ label: 'Status', choices: LINE_STATUSES, default: 'pending', dropdown: 'dropdown_without_none' }),
        vendor_quantity_shipped: IntegerColumn({ label: 'Quantity shipped by vendor', default: 0 }),
    },
    index: [
        { name: 'idx_rl_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_rl_request', unique: false, element: 'heraldry_request' },
    ],
    autoNumber: { prefix: 'HRL', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

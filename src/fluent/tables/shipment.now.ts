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
import { CARRIERS, LIFECYCLE_STATES, LIMITS, SHIPMENT_STATUSES } from '../../server/lib/domain'

/** Replaces the Domino `ShipmentRecord` form: outbound parcel for an awards case. */
export const x_cog_mah_shipment = Table({
    name: 'x_cog_mah_shipment',
    label: 'Shipment',
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

        awards_case: ReferenceColumn({ label: 'Awards case', referenceTable: 'x_cog_mah_awards_case', mandatory: true, cascadeRule: 'delete' }),
        carrier: ChoiceColumn({ label: 'Carrier', choices: CARRIERS, default: 'usps', dropdown: 'dropdown_without_none' }),
        service_level: StringColumn({ label: 'Service level', maxLength: 40 }),
        tracking_number: StringColumn({ label: 'Tracking number', maxLength: 40 }),
        pieces: IntegerColumn({ label: 'Pieces', default: 1 }),
        weight_oz: IntegerColumn({ label: 'Weight (oz)', default: 0 }),
        ship_to: MultiLineTextColumn({ label: 'Ship to (snapshot)', maxLength: 400 }),
        shipped: DateTimeColumn({ label: 'Shipped' }),
        delivered: DateTimeColumn({ label: 'Delivered' }),
        status: ChoiceColumn({ label: 'Status', choices: SHIPMENT_STATUSES, default: 'pending', dropdown: 'dropdown_without_none' }),
        shipped_by: ReferenceColumn({
            label: 'Shipped by',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah.warehouse',
        }),
    },
    index: [
        { name: 'idx_ship_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_ship_tracking', unique: false, element: 'tracking_number' },
    ],
    autoNumber: { prefix: 'MSH', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

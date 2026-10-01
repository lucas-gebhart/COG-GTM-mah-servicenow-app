import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, IntegerColumn, MultiLineTextColumn, ReferenceColumn } from '@servicenow/sdk/core'
import { CARRIERS, LIMITS, SHIPMENT_STATUSES } from '../../server/lib/domain'

/** Replaces the Domino `ShipmentRecord` form as a **task extension**: outbound parcel; `parent` is the awards case. */
export const x_cog_mah_native_shipment = Table({
    name: 'x_cog_mah_native_shipment',
    label: 'Shipment (Native)',
    extends: 'task',
    audit: true,
    display: 'number',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        legacy_number: StringColumn({ label: 'Legacy shipment number', maxLength: 40 }),
        stage: ChoiceColumn({ label: 'Stage', choices: SHIPMENT_STATUSES, default: 'pending', dropdown: 'dropdown_without_none' }),

        partial: BooleanColumn({ label: 'Partial shipment', default: false }),
        contents: StringColumn({ label: 'Contents', maxLength: 255 }),
        carrier: ChoiceColumn({ label: 'Carrier', choices: CARRIERS, default: 'usps', dropdown: 'dropdown_without_none' }),
        service_level: StringColumn({ label: 'Service level', maxLength: 40 }),
        tracking_number: StringColumn({ label: 'Tracking number', maxLength: 40 }),
        pieces: IntegerColumn({ label: 'Pieces', default: 1 }),
        weight_oz: IntegerColumn({ label: 'Weight (oz)', default: 0 }),
        ship_to: MultiLineTextColumn({ label: 'Ship to (snapshot)', maxLength: 400 }),
        shipped: DateTimeColumn({ label: 'Shipped' }),
        delivered: DateTimeColumn({ label: 'Delivered' }),
        picked: DateTimeColumn({ label: 'Picked' }),
        exception_note: StringColumn({ label: 'Exception note', maxLength: 255 }),
        shipped_by: ReferenceColumn({
            label: 'Shipped by',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah_native.warehouse',
        }),
    },
    index: [
        { name: 'idx_nship_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_nship_tracking', unique: false, element: 'tracking_number' },
    ],
    autoNumber: { prefix: 'NMSH', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

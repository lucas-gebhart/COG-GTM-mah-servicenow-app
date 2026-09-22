import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DecimalColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'
import { CATALOG_STATES, HERALDIC_CATEGORIES, LIMITS, UNITS_OF_ISSUE } from '../../server/lib/domain'

/**
 * Replaces the Domino `HeraldicItem` keyword catalog: guidons, distinguishing flags,
 * streamers, organizational colors, insignia and related items orderable on a DD 1348-6.
 */
export const x_cog_mah_heraldic_item = Table({
    name: 'x_cog_mah_heraldic_item',
    label: 'Heraldic Item',
    audit: true,
    display: 'nomenclature',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:global.getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: CATALOG_STATES, default: 'active', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        stock_number: StringColumn({ label: 'Stock number (NSN)', maxLength: LIMITS.stockNumber }),
        exception_item: BooleanColumn({ label: 'Exception item (no NSN)', default: false }),
        nomenclature: StringColumn({ label: 'Nomenclature', maxLength: LIMITS.name, mandatory: true }),
        category: ChoiceColumn({ label: 'Category', choices: HERALDIC_CATEGORIES, mandatory: true, dropdown: 'dropdown_with_none' }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 1000 }),
        unit_of_issue: ChoiceColumn({ label: 'Unit of issue', choices: UNITS_OF_ISSUE, default: 'EA', dropdown: 'dropdown_without_none' }),
        unit_price: DecimalColumn({ label: 'Unit price', scale: 2, default: 0 }),
        lead_time_days: IntegerColumn({ label: 'Lead time (days)', default: 30 }),
        preferred_vendor: ReferenceColumn({ label: 'Preferred vendor', referenceTable: 'x_cog_mah_vendor', cascadeRule: 'clear' }),
        drawing_number: StringColumn({ label: 'TIOH drawing number', maxLength: 40 }),
        branch: StringColumn({ label: 'Branch / regiment', maxLength: 60 }),
        fsc: StringColumn({ label: 'Federal supply class', maxLength: 4 }),
        niin: StringColumn({ label: 'NIIN', maxLength: 11 }),
        max_qty_per_request: IntegerColumn({ label: 'Max quantity per request', default: 0 }),
        approved_vendors: StringColumn({ label: 'Approved vendor CAGE codes', maxLength: 255 }),
        reference: StringColumn({ label: 'Regulatory reference', maxLength: 60 }),
    },
    index: [
        { name: 'idx_item_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_item_stock_number', unique: false, element: 'stock_number' },
    ],
    autoNumber: { prefix: 'HIT', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

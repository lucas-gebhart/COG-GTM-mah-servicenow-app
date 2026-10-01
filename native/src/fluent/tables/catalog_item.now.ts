import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, IntegerColumn } from '@servicenow/sdk/core'
import { CATALOG_KINDS, CATALOG_STATES, HERALDIC_CATEGORIES, LIMITS, UNITS_OF_ISSUE } from '../../server/lib/domain'

/**
 * Replaces the Domino `HeraldicItem` keyword catalog and v1's award choice list as an extension of
 * the Product Catalog model table (`cmdb_model`): `model_number` = NSN / stock number (or award key),
 * `name` = nomenclature, `cost` = unit price, `manufacturer` = vendor company. `catalog_kind`
 * separates DD 1348-6 heraldic items from the medal / device catalog award lines reference.
 */
export const x_cog_mah_native_catalog_item = Table({
    name: 'x_cog_mah_native_catalog_item',
    label: 'MAH Catalog Model (Native)',
    extends: 'cmdb_model',
    audit: true,
    display: 'name',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),

        catalog_kind: ChoiceColumn({ label: 'Catalog kind', choices: CATALOG_KINDS, default: 'heraldic', mandatory: true, dropdown: 'dropdown_without_none' }),
        catalog_state: ChoiceColumn({ label: 'Catalog state', choices: CATALOG_STATES, default: 'active', dropdown: 'dropdown_without_none' }),
        exception_item: BooleanColumn({ label: 'Exception item (no NSN)', default: false }),
        heraldic_category: ChoiceColumn({ label: 'Heraldic category', choices: HERALDIC_CATEGORIES, dropdown: 'dropdown_with_none' }),
        unit_of_issue: ChoiceColumn({ label: 'Unit of issue', choices: UNITS_OF_ISSUE, default: 'EA', dropdown: 'dropdown_without_none' }),
        lead_time_days: IntegerColumn({ label: 'Lead time (days)', default: 30 }),
        drawing_number: StringColumn({ label: 'TIOH drawing number', maxLength: 40 }),
        branch: StringColumn({ label: 'Branch / regiment', maxLength: 60 }),
        fsc: StringColumn({ label: 'Federal supply class', maxLength: 4 }),
        niin: StringColumn({ label: 'NIIN', maxLength: 11 }),
        max_qty_per_request: IntegerColumn({ label: 'Max quantity per request', default: 0 }),
        approved_vendors: StringColumn({ label: 'Approved vendor CAGE codes', maxLength: 255 }),
        reference: StringColumn({ label: 'Regulatory reference', maxLength: 120 }),
    },
    index: [
        { name: 'idx_ncat_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_ncat_model_number', unique: false, element: 'catalog_kind' },
    ],
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    EmailColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    IntegerColumn,
} from '@servicenow/sdk/core'
import { CATALOG_STATES, LIMITS } from '../../server/lib/domain'

/**
 * Replaces the Domino `Vendor` form. `portal_user` / `user_group` drive vendor isolation:
 * a vendor-role user only sees heraldry requests whose vendor points back at them
 * (replaces the Domino Readers field on `Request` documents).
 */
export const x_cog_mah_vendor = Table({
    name: 'x_cog_mah_vendor',
    label: 'Vendor',
    audit: true,
    display: 'name',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: CATALOG_STATES, default: 'active', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        name: StringColumn({ label: 'Name', maxLength: LIMITS.name, mandatory: true }),
        cage_code: StringColumn({ label: 'CAGE code', maxLength: LIMITS.cageCode, mandatory: true }),
        uei: StringColumn({ label: 'Unique Entity ID (SAM)', maxLength: 12 }),
        contract_number: StringColumn({ label: 'Contract number', maxLength: 20 }),
        poc: StringColumn({ label: 'Point of contact', maxLength: LIMITS.name }),
        email: EmailColumn({ label: 'Email', maxLength: LIMITS.email }),
        phone: StringColumn({ label: 'Phone', maxLength: LIMITS.phone }),
        address: MultiLineTextColumn({ label: 'Address', maxLength: 400 }),
        portal_user: ReferenceColumn({
            label: 'Portal user',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah.vendor',
        }),
        user_group: ReferenceColumn({ label: 'User group', referenceTable: 'sys_user_group' }),
        capabilities: StringColumn({ label: 'Capabilities', maxLength: 255 }),
        lead_time_days: IntegerColumn({ label: 'Lead time (days)', default: 30 }),
        legacy_user_group: StringColumn({ label: 'Legacy vendor group name', maxLength: 60 }),
        legacy_vendor_users: StringColumn({ label: 'Legacy vendor users (Notes names)', maxLength: 255 }),
    },
    index: [
        { name: 'idx_vnd_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_vnd_cage_code', unique: false, element: 'cage_code' },
        { name: 'idx_vnd_portal_user', unique: false, element: 'portal_user' },
    ],
    autoNumber: { prefix: 'VND', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

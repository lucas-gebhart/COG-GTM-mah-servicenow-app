import { Table, StringColumn, EmailColumn, IntegerColumn } from '@servicenow/sdk/core'
import { LIMITS } from '../../server/lib/domain'

/**
 * Vendors (v1 `x_cog_mah_vendor`) and source agencies (v1 choice list) are native `core_company`
 * rows: vendors carry `vendor=true` + a CAGE code, agencies carry an agency code. Only the few
 * MAH-specific columns are added here, scope-prefixed as the platform requires for augmentation.
 * Vendor login = `sys_user.company` → the vendor role's query rule matches `task.company`.
 */
export const core_company = Table({
    augments: 'core_company',
    schema: {
        x_cog_mah_native_cage_code: StringColumn({ label: 'CAGE code (MAH)', maxLength: LIMITS.cageCode }),
        x_cog_mah_native_legacy_unid: StringColumn({ label: 'Legacy UNID (MAH)', maxLength: LIMITS.legacyUnid }),
        x_cog_mah_native_legacy_status_raw: StringColumn({ label: 'Legacy status raw (MAH)', maxLength: 100 }),
        x_cog_mah_native_contract_number: StringColumn({ label: 'Contract number (MAH)', maxLength: 40 }),
        x_cog_mah_native_lead_time_days: IntegerColumn({ label: 'Lead time days (MAH)', default: 0 }),
        x_cog_mah_native_poc: StringColumn({ label: 'Point of contact (MAH)', maxLength: LIMITS.name }),
        x_cog_mah_native_poc_email: EmailColumn({ label: 'POC email (MAH)', maxLength: LIMITS.email }),
        x_cog_mah_native_agency_code: StringColumn({ label: 'Source agency code (MAH)', maxLength: 10 }),
        x_cog_mah_native_capabilities: StringColumn({ label: 'Capabilities / products (MAH)', maxLength: 255 }),
    },
})

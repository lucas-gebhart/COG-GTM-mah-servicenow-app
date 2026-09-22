import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    IntegerColumn,
} from '@servicenow/sdk/core'
import { LEGACY_FORM_CHOICES, LIFECYCLE_STATES, LIMITS } from '../../server/lib/domain'

const TARGET_FIELDS = {
    stage: 'stage',
    state: 'state',
    status: 'status',
    parse_status: 'parse_status',
} as const

/**
 * Free-text Domino status → controlled choice. Seeded from `DEFAULT_STATUS_MAP`
 * (src/server/lib/statusMap.ts) via the generated records file; operators can add rows
 * during migration when the reconciliation report shows unmapped values.
 */
export const x_cog_mah_status_map = Table({
    name: 'x_cog_mah_status_map',
    label: 'Legacy Status Map',
    audit: true,
    display: 'legacy_status',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:global.getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: ChoiceColumn({ label: 'Legacy form', choices: LEGACY_FORM_CHOICES, mandatory: true, dropdown: 'dropdown_with_none' }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (example raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: LIFECYCLE_STATES, default: 'open', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        legacy_status: StringColumn({ label: 'Legacy status (normalized)', maxLength: 100, mandatory: true }),
        target_field: ChoiceColumn({ label: 'Target field', choices: TARGET_FIELDS, default: 'state', mandatory: true, dropdown: 'dropdown_without_none' }),
        target_value: StringColumn({ label: 'Target choice value', maxLength: 40, mandatory: true }),
        match_count: IntegerColumn({ label: 'Rows matched (last migration)', default: 0, readOnly: true }),
        seeded: BooleanColumn({ label: 'Seeded from code', default: false }),
        notes: StringColumn({ label: 'Notes', maxLength: 255 }),
    },
    index: [
        { name: 'idx_smap_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_smap_form_status', unique: true, element: ['legacy_form', 'legacy_status'] },
    ],
    autoNumber: { prefix: 'MSM', number: 2000, numberOfDigits: 7 }, // MSM0001000–MSM0001999 reserved for seeded rows (generate-fluent-migration.ts)
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

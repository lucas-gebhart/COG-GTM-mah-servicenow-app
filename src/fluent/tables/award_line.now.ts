import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    IntegerColumn,
    ReferenceColumn,
    DateColumn,
} from '@servicenow/sdk/core'
import { AWARD_CATALOG, AWARD_DEVICES, LIFECYCLE_STATES, LIMITS, LINE_STATUSES } from '../../server/lib/domain'

/** Replaces the Domino `AwardLine` response document: one decoration / device row per case. */
export const x_cog_mah_award_line = Table({
    name: 'x_cog_mah_award_line',
    label: 'Award Line',
    audit: true,
    display: 'number',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:global.getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: LIFECYCLE_STATES, default: 'open', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        awards_case: ReferenceColumn({ label: 'Awards case', referenceTable: 'x_cog_mah_awards_case', mandatory: true, cascadeRule: 'delete' }),
        line_number: IntegerColumn({ label: 'Line', default: 1 }),
        award_name: ChoiceColumn({ label: 'Award', choices: AWARD_CATALOG, mandatory: true, dropdown: 'dropdown_with_none' }),
        legacy_award_name: StringColumn({ label: 'Legacy award name', maxLength: 100 }),
        legacy_award_code: StringColumn({ label: 'Legacy award code', maxLength: 12 }),
        set_type: StringColumn({ label: 'Set type', maxLength: 40 }),
        stock_number: StringColumn({ label: 'Stock number', maxLength: LIMITS.stockNumber }),
        authority: StringColumn({ label: 'Authority', maxLength: 100 }),
        backorder_eta: DateColumn({ label: 'Backorder ETA' }),
        device: ChoiceColumn({ label: 'Device / appurtenance', choices: AWARD_DEVICES, default: 'none', dropdown: 'dropdown_without_none' }),
        device_count: IntegerColumn({ label: 'Device count', default: 0 }),
        quantity: IntegerColumn({ label: 'Quantity', default: 1, mandatory: true }),
        engraving_required: BooleanColumn({ label: 'Engraving required', default: false }),
        engraving_text: StringColumn({ label: 'Engraving text', maxLength: LIMITS.engravingText }),
        status: ChoiceColumn({ label: 'Status', choices: LINE_STATUSES, default: 'pending', dropdown: 'dropdown_without_none' }),
        stock_on_hand: BooleanColumn({ label: 'Stock on hand', default: true }),
    },
    index: [
        { name: 'idx_line_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_line_case', unique: false, element: 'awards_case' },
    ],
    autoNumber: { prefix: 'MAL', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

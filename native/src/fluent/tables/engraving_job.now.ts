import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, IntegerColumn, MultiLineTextColumn, ReferenceColumn } from '@servicenow/sdk/core'
import { CASE_PRIORITIES, ENGRAVING_FONTS, ENGRAVING_STATUSES, LIMITS } from '../../server/lib/domain'

/**
 * Replaces the Domino `EngravingJob` form as a **task extension**: the shop-floor work item for one
 * award line. `parent` (inherited) is the awards case, `assigned_to` the engraver (v1 `engraver`),
 * `work_notes` the QC notes; the engraver assignment rule and the Visual Task Board use the inherited
 * assignment_group / state.
 */
export const x_cog_mah_native_engraving_job = Table({
    name: 'x_cog_mah_native_engraving_job',
    label: 'Engraving Job (Native)',
    extends: 'task',
    audit: true,
    display: 'number',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        legacy_number: StringColumn({ label: 'Legacy job number', maxLength: 40 }),
        stage: ChoiceColumn({ label: 'Stage', choices: ENGRAVING_STATUSES, default: 'queued', dropdown: 'dropdown_without_none' }),

        award_line: ReferenceColumn({ label: 'Award line', referenceTable: 'x_cog_mah_native_award_line', cascadeRule: 'delete' }),
        font: ChoiceColumn({ label: 'Font', choices: ENGRAVING_FONTS, default: 'roman_block', dropdown: 'dropdown_without_none' }),
        text: StringColumn({ label: 'Engraving text', maxLength: LIMITS.engravingText, mandatory: true }),
        items: MultiLineTextColumn({ label: 'Items (award :: text)', maxLength: 1000 }),
        machine: StringColumn({ label: 'Machine', maxLength: 40 }),
        proof_checked: BooleanColumn({ label: 'Proof checked', default: false }),
        queued: DateTimeColumn({ label: 'Queued' }),
        handling_priority: ChoiceColumn({ label: 'Handling priority', choices: CASE_PRIORITIES, default: 'routine', dropdown: 'dropdown_without_none' }),
        priority_handling: BooleanColumn({ label: 'Priority handling', default: false }),
        started: DateTimeColumn({ label: 'Started' }),
        completed: DateTimeColumn({ label: 'Completed' }),
        rework_count: IntegerColumn({ label: 'Rework count', default: 0 }),
    },
    index: [
        { name: 'idx_nengr_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_nengr_stage_assigned', unique: false, element: 'stage' },
    ],
    autoNumber: { prefix: 'NMEJ', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

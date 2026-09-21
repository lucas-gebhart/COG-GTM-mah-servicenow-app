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
import { CASE_PRIORITIES, ENGRAVING_FONTS, ENGRAVING_STATUSES, LIFECYCLE_STATES, LIMITS } from '../../server/lib/domain'

/** Replaces the Domino `EngravingJob` form: the engraver's work queue for one award line. */
export const x_cog_mah_engraving_job = Table({
    name: 'x_cog_mah_engraving_job',
    label: 'Engraving Job',
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

        legacy_number: StringColumn({ label: 'Legacy job number', maxLength: 40 }),
        award_line: ReferenceColumn({ label: 'Award line', referenceTable: 'x_cog_mah_award_line', cascadeRule: 'delete' }),
        awards_case: ReferenceColumn({ label: 'Awards case', referenceTable: 'x_cog_mah_awards_case', cascadeRule: 'delete' }),
        engraver: ReferenceColumn({
            label: 'Engraver',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah.engraver',
        }),
        font: ChoiceColumn({ label: 'Font', choices: ENGRAVING_FONTS, default: 'roman_block', dropdown: 'dropdown_without_none' }),
        text: StringColumn({ label: 'Engraving text', maxLength: LIMITS.engravingText, mandatory: true }),
        items: MultiLineTextColumn({ label: 'Items (award :: text)', maxLength: 1000 }),
        machine: StringColumn({ label: 'Machine', maxLength: 20 }),
        proof_checked: BooleanColumn({ label: 'Proof checked', default: false }),
        queued: DateTimeColumn({ label: 'Queued' }),
        status: ChoiceColumn({ label: 'Status', choices: ENGRAVING_STATUSES, default: 'queued', dropdown: 'dropdown_without_none' }),
        priority: ChoiceColumn({ label: 'Priority', choices: CASE_PRIORITIES, default: 'routine', dropdown: 'dropdown_without_none' }),
        priority_handling: BooleanColumn({ label: 'Priority handling', default: false }),
        started: DateTimeColumn({ label: 'Started' }),
        completed: DateTimeColumn({ label: 'Completed' }),
        rework_count: IntegerColumn({ label: 'Rework count', default: 0 }),
        qc_notes: MultiLineTextColumn({ label: 'QC notes', maxLength: 1000 }),
    },
    index: [
        { name: 'idx_engr_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_engr_status_engraver', unique: false, element: ['status', 'engraver'] },
    ],
    autoNumber: { prefix: 'MEJ', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

import { Table, StringColumn, ChoiceColumn, BooleanColumn, DateTimeColumn, DateColumn, DecimalColumn, EmailColumn, IntegerColumn, MultiLineTextColumn, ReferenceColumn, GenericColumn } from '@servicenow/sdk/core'
import { CASE_PRIORITIES, LIMITS, REQUEST_STATES, REQUISITION_PRIORITIES } from '../../server/lib/domain'

/**
 * Replaces the Domino `Request` form (DD Form 1348-6 header) as a **task extension**. The vendor is
 * the inherited `company` reference (core_company, vendor=true) which drives the vendor role's
 * query rule; `approval` / `sysapproval_approver` carry the DLA review; `work_notes` / `comments`
 * are the native journal. Once `released_to_vendor` is set the header is frozen.
 */
export const x_cog_mah_native_heraldry_request = Table({
    name: 'x_cog_mah_native_heraldry_request',
    label: 'Heraldry Request (Native, DD 1348-6)',
    extends: 'task',
    audit: true,
    display: 'number',
    schema: {
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        stage: ChoiceColumn({ label: 'Stage', choices: REQUEST_STATES, default: 'draft', dropdown: 'dropdown_without_none' }),

        document_number: StringColumn({ label: 'Document number (DODAAC + Julian date + serial)', maxLength: LIMITS.documentNumber }),
        dodaac: StringColumn({ label: 'DODAAC', maxLength: LIMITS.dodaac, mandatory: true }),
        uic: StringColumn({ label: 'UIC', maxLength: LIMITS.uic, mandatory: true }),
        requisition_priority: ChoiceColumn({ label: 'Requisition priority (PD)', choices: REQUISITION_PRIORITIES, default: '13', mandatory: true, dropdown: 'dropdown_without_none' }),
        project_code: StringColumn({ label: 'Project code', maxLength: LIMITS.projectCode }),
        fund_code: StringColumn({ label: 'Fund code', maxLength: LIMITS.fundCode }),
        signal_code: StringColumn({ label: 'Signal code', maxLength: 1, default: 'A' }),
        required_delivery_date: DateColumn({ label: 'Required delivery date' }),

        request_type: StringColumn({ label: 'Request type', maxLength: 40 }),
        handling_priority: ChoiceColumn({ label: 'Handling priority', choices: CASE_PRIORITIES, default: 'routine', dropdown: 'dropdown_without_none' }),
        priority_handling: BooleanColumn({ label: 'Expedite', default: false }),
        supplementary_address: StringColumn({ label: 'Supplementary address', maxLength: LIMITS.dodaac }),
        ship_to_dodaac: StringColumn({ label: 'Ship-to DODAAC', maxLength: LIMITS.dodaac }),
        requesting_unit: StringColumn({ label: 'Requesting unit', maxLength: LIMITS.name }),
        requester: ReferenceColumn({ label: 'Requester (unit POC)', referenceTable: 'x_cog_mah_native_requester', cascadeRule: 'clear' }),
        requester_poc: StringColumn({ label: 'Requester POC', maxLength: LIMITS.name, mandatory: true }),
        requester_poc_email: EmailColumn({ label: 'POC email', maxLength: LIMITS.email }),
        requester_poc_phone: StringColumn({ label: 'POC phone', maxLength: LIMITS.phone }),
        ship_to: MultiLineTextColumn({ label: 'Ship to', maxLength: 400, mandatory: true }),
        justification: MultiLineTextColumn({ label: 'Justification', maxLength: LIMITS.justification }),

        released_to_vendor: DateColumn({ label: 'Released to vendor' }),
        released_by: ReferenceColumn({ label: 'Released by', referenceTable: 'sys_user' }),
        approved_at: DateTimeColumn({ label: 'Approved' }),
        estimated_ship_date: DateColumn({ label: 'Estimated ship date' }),
        legacy_vendor_key: StringColumn({ label: 'Legacy vendor key (CAGE)', maxLength: 20 }),
        submitted_at: DateTimeColumn({ label: 'Submitted' }),
        submitted_by: ReferenceColumn({ label: 'Submitted by', referenceTable: 'sys_user' }),
        reviewer: ReferenceColumn({
            label: 'DLA reviewer',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah_native.dla',
        }),
        vendor_acknowledged: DateTimeColumn({ label: 'Vendor acknowledged' }),
        vendor_ship_date: DateColumn({ label: 'Vendor ship date' }),
        vendor_tracking_number: StringColumn({ label: 'Vendor tracking number', maxLength: 40 }),

        line_count: IntegerColumn({ label: 'Lines', default: 0, readOnly: true }),
        total_extended_price: DecimalColumn({ label: 'Total extended price', scale: 2, default: 0, readOnly: true }),
        cancel_reason: StringColumn({ label: 'Cancel reason', maxLength: 255 }),
        vendor_notes: GenericColumn({ label: 'Vendor notes (shared with vendor)', columnType: 'journal_input' }),
    },
    index: [
        { name: 'idx_nhrq_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_nhrq_document_number', unique: false, element: 'document_number' },
        { name: 'idx_nhrq_company_stage', unique: false, element: 'stage' },
    ],
    autoNumber: { prefix: 'NHRQ', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

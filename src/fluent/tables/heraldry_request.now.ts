import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    DateTimeColumn,
    DateColumn,
    DecimalColumn,
    EmailColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    GenericColumn,
} from '@servicenow/sdk/core'
import { LIMITS, REQUEST_STATES, REQUISITION_PRIORITIES } from '../../server/lib/domain'

/**
 * Replaces the Domino `Request` form: a DD Form 1348-6 (DoD Single Line Item
 * Requisition System Document) header for heraldic items ordered through the vendor.
 * Once `released_to_vendor` is set the header is frozen (see the post-release guard rule).
 */
export const x_cog_mah_heraldry_request = Table({
    name: 'x_cog_mah_heraldry_request',
    label: 'Heraldry Request (DD 1348-6)',
    audit: true,
    display: 'number',
    schema: {
        number: StringColumn({ label: 'Number', maxLength: 40, default: 'javascript:getNextObjNumberPadded();', readOnly: true }),
        legacy_unid: StringColumn({ label: 'Legacy UNID', maxLength: LIMITS.legacyUnid, unique: true }),
        legacy_form: StringColumn({ label: 'Legacy form', maxLength: 40 }),
        legacy_status_raw: StringColumn({ label: 'Legacy status (raw)', maxLength: 100 }),
        legacy_last_modified: DateTimeColumn({ label: 'Legacy last modified' }),
        state: ChoiceColumn({ label: 'State', choices: REQUEST_STATES, default: 'draft', dropdown: 'dropdown_without_none' }),
        active: BooleanColumn({ label: 'Active', default: true }),

        document_number: StringColumn({ label: 'Document number (DODAAC + Julian date + serial)', maxLength: LIMITS.documentNumber }),
        dodaac: StringColumn({ label: 'DODAAC', maxLength: LIMITS.dodaac, mandatory: true }),
        uic: StringColumn({ label: 'UIC', maxLength: LIMITS.uic, mandatory: true }),
        requisition_priority: ChoiceColumn({
            label: 'Requisition priority (PD)',
            choices: REQUISITION_PRIORITIES,
            default: '13',
            mandatory: true,
            dropdown: 'dropdown_without_none',
        }),
        project_code: StringColumn({ label: 'Project code', maxLength: LIMITS.projectCode }),
        fund_code: StringColumn({ label: 'Fund code', maxLength: LIMITS.fundCode }),
        signal_code: StringColumn({ label: 'Signal code', maxLength: 1, default: 'A' }),
        required_delivery_date: DateColumn({ label: 'Required delivery date' }),

        request_type: StringColumn({ label: 'Request type', maxLength: 40 }),
        priority_handling: BooleanColumn({ label: 'Expedite', default: false }),
        supplementary_address: StringColumn({ label: 'Supplementary address', maxLength: LIMITS.dodaac }),
        ship_to_dodaac: StringColumn({ label: 'Ship-to DODAAC', maxLength: LIMITS.dodaac }),
        requesting_unit: StringColumn({ label: 'Requesting unit', maxLength: LIMITS.name }),
        requester: ReferenceColumn({ label: 'Requester (unit POC)', referenceTable: 'x_cog_mah_requester', cascadeRule: 'clear' }),
        requester_poc: StringColumn({ label: 'Requester POC', maxLength: LIMITS.name, mandatory: true }),
        requester_poc_email: EmailColumn({ label: 'POC email', maxLength: LIMITS.email }),
        requester_poc_phone: StringColumn({ label: 'POC phone', maxLength: LIMITS.phone }),
        ship_to: MultiLineTextColumn({ label: 'Ship to', maxLength: 400, mandatory: true }),
        justification: MultiLineTextColumn({ label: 'Justification', maxLength: LIMITS.justification }),

        vendor: ReferenceColumn({ label: 'Vendor', referenceTable: 'x_cog_mah_vendor', cascadeRule: 'restrict' }),
        released_to_vendor: DateColumn({ label: 'Released to vendor' }),
        released_by: ReferenceColumn({ label: 'Released by', referenceTable: 'sys_user' }),
        approved_at: DateTimeColumn({ label: 'Approved' }),
        estimated_ship_date: DateColumn({ label: 'Estimated ship date' }),
        legacy_vendor_key: StringColumn({ label: 'Legacy vendor key', maxLength: LIMITS.cageCode }),
        submitted_at: DateTimeColumn({ label: 'Submitted' }),
        submitted_by: ReferenceColumn({ label: 'Submitted by', referenceTable: 'sys_user' }),
        reviewer: ReferenceColumn({
            label: 'DLA reviewer',
            referenceTable: 'sys_user',
            useReferenceQualifier: 'simple',
            referenceQual: 'active=true^roles=x_cog_mah.dla',
        }),
        vendor_acknowledged: DateTimeColumn({ label: 'Vendor acknowledged' }),
        vendor_ship_date: DateColumn({ label: 'Vendor ship date' }),
        vendor_tracking_number: StringColumn({ label: 'Vendor tracking number', maxLength: 40 }),

        line_count: IntegerColumn({ label: 'Lines', default: 0, readOnly: true }),
        total_extended_price: DecimalColumn({ label: 'Total extended price', scale: 2, default: 0, readOnly: true }),
        cancel_reason: StringColumn({ label: 'Cancel reason', maxLength: 255 }),

        work_notes: GenericColumn({ label: 'Work notes (internal)', columnType: 'journal_input' }),
        vendor_notes: GenericColumn({ label: 'Vendor notes (shared with vendor)', columnType: 'journal_input' }),
    },
    index: [
        { name: 'idx_hrq_legacy_unid', unique: true, element: 'legacy_unid' },
        { name: 'idx_hrq_document_number', unique: false, element: 'document_number' },
        { name: 'idx_hrq_vendor_state', unique: false, element: ['vendor', 'state'] },
    ],
    autoNumber: { prefix: 'HRQ', number: 1000, numberOfDigits: 7 },
    allowWebServiceAccess: true,
    actions: { read: true, create: true, update: true, delete: true },
})

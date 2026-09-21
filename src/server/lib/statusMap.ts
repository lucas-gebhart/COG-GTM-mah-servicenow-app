/**
 * Legacy free-text status → ServiceNow choice mapping.
 *
 * The Domino `Status` item was a free-text field edited through many years of
 * @Formula keyword lists, so the same state appears with different casing, spacing,
 * abbreviations and typos. `DEFAULT_STATUS_MAP` seeds `x_cog_mah_status_map`
 * (see src/fluent/records/status-map.now.ts); anything without a match lands in the
 * `unmapped` bucket and is recorded as a migration exception.
 */
import {
    CASE_STAGES,
    CATALOG_STATES,
    ENGRAVING_STATUSES,
    LEGACY_FORMS,
    LINE_STATUSES,
    PARSE_STATUSES,
    REQUESTER_STATES,
    REQUEST_STATES,
    SES_FLAG_STATES,
    SHIPMENT_STATUSES,
    type LegacyForm,
} from './domain'

export const UNMAPPED = 'unmapped' as const

export interface StatusMapEntry {
    legacyForm: LegacyForm
    /** Normalized legacy text (see `normalizeStatusText`). */
    legacyStatus: string
    /** Choice value in the target table. */
    targetValue: string
    /** Target field the choice belongs to. */
    targetField: 'stage' | 'state' | 'status' | 'parse_status'
}

/**
 * Canonical form used for lookups: trim, collapse whitespace, upper-case, strip
 * punctuation other than slash so "Assembly / QC", "ASSEMBLY-QC" and "assembly/qc" agree.
 */
export function normalizeStatusText(raw: unknown): string {
    if (raw === null || raw === undefined) return ''
    return String(raw)
        .toUpperCase()
        .replace(/[^A-Z0-9/ ]+/g, ' ')
        .replace(/\s*\/\s*/g, '/')
        .replace(/\s+/g, ' ')
        .trim()
}

function entries(form: LegacyForm, field: StatusMapEntry['targetField'], map: Record<string, string[]>): StatusMapEntry[] {
    const out: StatusMapEntry[] = []
    for (const [targetValue, variants] of Object.entries(map)) {
        for (const v of variants) out.push({ legacyForm: form, legacyStatus: normalizeStatusText(v), targetValue, targetField: field })
    }
    return out
}

/** Choice keys of each choice set, used to sanity-check the seed table in tests. */
export const STATUS_TARGET_CHOICES: Readonly<Record<LegacyForm, Readonly<Record<string, string>>>> = {
    AwardsCase: CASE_STAGES,
    AwardLine: LINE_STATUSES,
    Requester: REQUESTER_STATES,
    AuthorizationFile: PARSE_STATUSES,
    EngravingJob: ENGRAVING_STATUSES,
    ShipmentRecord: SHIPMENT_STATUSES,
    Request: REQUEST_STATES,
    RequestLine: LINE_STATUSES,
    HeraldicItem: CATALOG_STATES,
    SESFlagRequest: SES_FLAG_STATES,
    Vendor: CATALOG_STATES,
}

export const DEFAULT_STATUS_MAP: readonly StatusMapEntry[] = [
    ...entries(LEGACY_FORMS.awards_case, 'stage', {
        authorized: ['Authorized', 'AUTH', 'Authorised', 'New', 'Open', 'Received', 'Pending Engraving'],
        engraving: ['Engraving', 'In Engraving', 'At Engraver', 'ENGRAVE', 'Engraving Queue'],
        assembly_qc: ['Assembly/QC', 'Assembly', 'QC', 'Assembly - QC', 'Assembly & QC', 'In Assembly', 'Quality Check'],
        warehouse: ['Warehouse', 'At Warehouse', 'Ready to Ship', 'WHSE', 'Packed'],
        shipped: ['Shipped', 'Mailed', 'In Transit', 'Sent'],
        closed: ['Closed', 'Complete', 'Completed', 'Closed - Complete', 'Delivered', 'Done'],
        cancelled: ['Cancelled', 'Canceled', 'Cancel', 'Void', 'Withdrawn', 'Closed - Cancelled'],
    }),
    ...entries(LEGACY_FORMS.award_line, 'status', {
        pending: ['Pending', 'New', 'Open', 'Authorized'],
        in_progress: ['In Progress', 'Engraving', 'Assembly', 'Working'],
        complete: ['Complete', 'Completed', 'Done', 'Shipped', 'Closed'],
        cancelled: ['Cancelled', 'Canceled', 'Void'],
    }),
    ...entries(LEGACY_FORMS.requester, 'state', {
        active: ['Active', 'Current', 'Open', ''],
        merged: ['Merged', 'Duplicate', 'Dup'],
        inactive: ['Inactive', 'Deceased', 'Archived', 'Closed'],
    }),
    ...entries(LEGACY_FORMS.authorization_file, 'parse_status', {
        received: ['Received', 'New', 'Uploaded'],
        parsing: ['Parsing', 'Processing', 'In Progress'],
        parsed: ['Parsed', 'Imported', 'Complete', 'Completed', 'Loaded'],
        partial: ['Parsed with errors', 'Partial', 'Imported with errors', 'Warnings'],
        failed: ['Failed', 'Error', 'Rejected'],
    }),
    ...entries(LEGACY_FORMS.engraving_job, 'status', {
        queued: ['Queued', 'New', 'Pending', 'Waiting'],
        in_progress: ['In Progress', 'Engraving', 'Started', 'Working'],
        qc_hold: ['QC Hold', 'Hold', 'On Hold', 'QC'],
        complete: ['Complete', 'Completed', 'Done', 'Finished'],
        rework: ['Rework', 'Redo', 'Re-engrave', 'Rejected'],
        cancelled: ['Cancelled', 'Canceled', 'Void'],
    }),
    ...entries(LEGACY_FORMS.shipment, 'status', {
        pending: ['Pending', 'New', 'Not Shipped'],
        label_created: ['Label Created', 'Labelled', 'Labeled', 'Manifested'],
        in_transit: ['In Transit', 'Shipped', 'Sent', 'Mailed'],
        delivered: ['Delivered', 'Complete', 'Completed', 'Received'],
        returned: ['Returned', 'Returned to Sender', 'RTS', 'Undeliverable'],
        lost: ['Lost', 'Claim Filed', 'Missing'],
    }),
    ...entries(LEGACY_FORMS.heraldry_request, 'state', {
        draft: ['Draft', 'New', 'Open', 'Not Submitted'],
        submitted: ['Submitted', 'Pending', 'Pending Review', 'Received'],
        in_review: ['In Review', 'Under Review', 'Review', 'Reviewing', 'DLA Review'],
        released_to_vendor: ['Released to Vendor', 'Released', 'Vendor', 'Sent to Vendor', 'Released - Vendor', 'At Vendor'],
        in_production: ['In Production', 'Production', 'Manufacturing', 'Being Made'],
        shipped: ['Shipped', 'In Transit', 'Sent'],
        complete: ['Complete', 'Completed', 'Closed', 'Delivered', 'Done'],
        cancelled: ['Cancelled', 'Canceled', 'Cancel', 'Void', 'Withdrawn'],
    }),
    ...entries(LEGACY_FORMS.request_line, 'status', {
        pending: ['Pending', 'New', 'Open', 'Draft'],
        in_progress: ['In Progress', 'Released', 'Production', 'In Production', 'Ordered'],
        complete: ['Complete', 'Completed', 'Shipped', 'Delivered', 'Closed'],
        cancelled: ['Cancelled', 'Canceled', 'Void'],
    }),
    ...entries(LEGACY_FORMS.heraldic_item, 'state', {
        active: ['Active', 'Available', 'Current', 'Yes', ''],
        inactive: ['Inactive', 'Discontinued', 'Obsolete', 'No', 'Retired'],
    }),
    ...entries(LEGACY_FORMS.ses_flag_request, 'state', {
        draft: ['Draft', 'New', 'Open'],
        submitted: ['Submitted', 'Pending', 'Received'],
        approved: ['Approved', 'Authorized', 'Validated'],
        in_production: ['In Production', 'Production', 'Ordered'],
        delivered: ['Delivered', 'Complete', 'Completed', 'Closed', 'Shipped'],
        rejected: ['Rejected', 'Denied', 'Not Approved'],
        cancelled: ['Cancelled', 'Canceled', 'Withdrawn', 'Void'],
    }),
    ...entries(LEGACY_FORMS.vendor, 'state', {
        active: ['Active', 'Approved', 'Current', 'Yes', ''],
        inactive: ['Inactive', 'Suspended', 'Debarred', 'No', 'Terminated'],
    }),
]

export type StatusLookup = (legacyForm: string, normalizedStatus: string) => string | undefined

/** Build a lookup function from entries (the seed list or rows read from `x_cog_mah_status_map`). */
export function buildStatusLookup(map: readonly StatusMapEntry[] = DEFAULT_STATUS_MAP): StatusLookup {
    const index = new Map<string, string>()
    for (const e of map) index.set(`${e.legacyForm}\u0000${e.legacyStatus}`, e.targetValue)
    return (legacyForm, normalizedStatus) => index.get(`${legacyForm}\u0000${normalizedStatus}`)
}

export interface MappedStatus {
    value: string
    mapped: boolean
    normalized: string
}

/**
 * Map a raw legacy status for a given legacy form. Unknown values fall to `unmapped`
 * so the row still loads and shows up on the reconciliation report.
 */
export function mapLegacyStatus(legacyForm: string, raw: unknown, lookup: StatusLookup = buildStatusLookup()): MappedStatus {
    const normalized = normalizeStatusText(raw)
    const value = lookup(legacyForm, normalized)
    if (value !== undefined) return { value, mapped: true, normalized }
    return { value: UNMAPPED, mapped: false, normalized }
}

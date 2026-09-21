/**
 * Pure, per-form row transforms for the legacy export → x_cog_mah tables.
 *
 * `transformRow()` takes one parsed source row (keyed by the CSV header, see `sourceKey`)
 * and returns the target field values, the reference lookups the Glide layer must resolve,
 * and every warning that should become an `x_cog_mah_migration_exception` row. Nothing here
 * touches GlideRecord, so the whole mapping is unit-tested against synthetic rows and the
 * same code runs inside the Transform Map (via src/server/migration/transformEngine.ts).
 *
 * Rules the transform enforces:
 *   - free-text status → choice through the status map, `unmapped` when nothing matches;
 *   - mixed date formats → ISO, unparseable values leave the field empty + `invalid_date`;
 *   - `legacy_unid`, `legacy_form`, `legacy_status_raw`, `legacy_last_modified` on every row;
 *   - contradictory source rows (terminal stage without a closing date, released request
 *     without a vendor, quantity × price ≠ extended price, ...) load but are flagged;
 *   - children carry a required parent lookup; a missing parent is an orphan and the row is
 *     quarantined instead of inserted.
 */
import { computeAging } from '../lib/aging'
import { normalizeLegacyDate } from '../lib/dates'
import { computeDedupeKey } from '../lib/dedupe'
import { CASE_STAGES, LEGACY_FORMS as LEGACY_FORM_KEYS, LIMITS, TABLES, type CaseStage, type MigrationExceptionType } from '../lib/domain'
import { LEGACY_FORMS, type LegacyFormName } from '../lib/legacyContract'
import { computeExtendedPrice, toNumber } from '../lib/pricing'
import { buildStatusLookup, mapLegacyStatus, type StatusLookup, UNMAPPED } from '../lib/statusMap'
import {
    isSafeText,
    validateCageCode,
    validateDocumentNumber,
    validateDodaac,
    validateEmail,
    validateEngravingText,
    validateLegacyUnid,
    validatePhone,
    validateQuantity,
    validateUic,
} from '../lib/validators'
import {
    AWARD_DEVICE_MAP,
    CARRIER_MAP,
    CASE_PRIORITY_MAP,
    ENGRAVING_FONT_MAP,
    FILE_FORMAT_MAP,
    HERALDIC_CATEGORY_MAP,
    mapAwardName,
    mapRequisitionPriority,
    NOTE_TYPE_MAP,
    parseLegacyBoolean,
    QC_RESULT_MAP,
    RELATIONSHIP_MAP,
    REQUESTER_TYPE_MAP,
    SERVICE_COMPONENT_MAP,
    SERVICE_ERA_MAP,
    SES_FLAG_TYPE_MAP,
    SOURCE_AGENCY_MAP,
    UNIT_OF_ISSUE_MAP,
    type ValueMap,
} from './valueMaps'

export type SourceRow = Readonly<Record<string, string | undefined>>

export interface RowWarning {
    type: MigrationExceptionType
    field: string
    rawValue: string
    message: string
}

export interface ReferenceLookup {
    /** Target field that receives the resolved sys_id. */
    field: string
    /** Table to search. */
    table: string
    /** Fields tried in order with an exact match on `value`. */
    matchFields: readonly string[]
    value: string
    /** `true` → missing parent quarantines the row (orphan); `false` → `invalid_reference` warning only. */
    required: boolean
}

export interface RowTransform {
    form: LegacyFormName
    targetTable: string
    fields: Record<string, string>
    lookups: ReferenceLookup[]
    warnings: RowWarning[]
    /** Normalized status text that was looked up (for status_map match counting). */
    statusNormalized: string
    statusMapped: boolean
    /** Source headers the transform consulted (contract-coverage tests). */
    headersRead: string[]
    /** Requester identity for post-insert dedupe (requester forms only). */
    dedupeKey?: string
}

export interface TransformContext {
    /** Current date-time `YYYY-MM-DD HH:mm:ss` (aging is computed against it). */
    now: string
    statusLookup?: StatusLookup
}

const MAX_STRING = 255

class RowBuilder {
    readonly fields: Record<string, string> = {}
    readonly warnings: RowWarning[] = []
    readonly lookups: ReferenceLookup[] = []
    readonly headersRead = new Set<string>()

    constructor(private readonly src: SourceRow) {}

    get(header: string): string {
        this.headersRead.add(header)
        const v = this.src[header]
        return v === undefined || v === null ? '' : String(v).trim()
    }

    warn(type: MigrationExceptionType, field: string, rawValue: string, message: string): void {
        this.warnings.push({ type, field, rawValue: rawValue.slice(0, 1000), message })
    }

    set(field: string, value: string | number | boolean | null | undefined): void {
        if (value === null || value === undefined) return
        if (typeof value === 'boolean') {
            this.fields[field] = value ? 'true' : 'false'
            return
        }
        this.fields[field] = String(value)
    }

    /** Copy a string column, trimming to the dictionary length and flagging unsafe text. */
    text(field: string, header: string, max = MAX_STRING): void {
        const v = this.get(header)
        if (!v) return
        if (v.length > max) this.warn('validation', field, v, `Value exceeds ${max} characters and was truncated`)
        this.fields[field] = v.slice(0, max)
    }

    /** Multi-line text: no truncation warning below 4000. */
    long(field: string, header: string, max = 4000): void {
        const v = this.get(header)
        if (!v) return
        if (v.length > max) this.warn('validation', field, v.slice(0, 200), `Value exceeds ${max} characters and was truncated`)
        this.fields[field] = v.slice(0, max)
    }

    date(field: string, header: string, kind: 'date' | 'datetime' = 'date'): string {
        const raw = this.get(header)
        if (!raw) return ''
        const n = normalizeLegacyDate(raw)
        if (!n) {
            this.warn('invalid_date', field, raw, `Unparseable legacy date in ${header}`)
            return ''
        }
        const v = kind === 'date' ? n.date : n.dateTime
        this.fields[field] = v
        return v
    }

    int(field: string, header: string, opts: { min?: number; max?: number } = {}): number | null {
        const raw = this.get(header)
        if (!raw) return null
        const n = Number.parseInt(raw.replace(/,/g, ''), 10)
        if (!Number.isFinite(n) || String(n) !== raw.replace(/,/g, '').replace(/^\+/, '')) {
            this.warn('validation', field, raw, `Non-integer value in ${header}`)
            return null
        }
        if ((opts.min !== undefined && n < opts.min) || (opts.max !== undefined && n > opts.max)) {
            this.warn('validation', field, raw, `${header} outside ${opts.min ?? '-∞'}..${opts.max ?? '∞'}`)
        }
        this.fields[field] = String(n)
        return n
    }

    decimal(field: string, header: string): number | null {
        const raw = this.get(header)
        if (!raw) return null
        const n = toNumber(raw.replace(/[$,]/g, ''))
        if (n === null) {
            this.warn('validation', field, raw, `Non-numeric value in ${header}`)
            return null
        }
        this.fields[field] = n.toFixed(2)
        return n
    }

    bool(field: string, header: string): boolean | null {
        const raw = this.get(header)
        const b = parseLegacyBoolean(raw)
        if (raw && b === null) this.warn('unmapped_value', field, raw, `${header} is not a recognised Yes/No value`)
        if (b !== null) this.fields[field] = b ? 'true' : 'false'
        return b
    }

    choice(field: string, header: string, map: ValueMap): string {
        const raw = this.get(header)
        const m = map.map(raw)
        if (!m.mapped) this.warn('unmapped_value', field, raw, `${header} "${raw}" has no ${map.name} choice; stored ${m.value || '(empty)'}`)
        if (m.value) this.fields[field] = m.value
        return m.value
    }

    email(field: string, header: string): void {
        const raw = this.get(header)
        if (!raw) return
        const r = validateEmail(raw, field)
        if (!r.valid) {
            this.warn('validation', field, raw, `Invalid e-mail address in ${header}`)
            return
        }
        this.fields[field] = raw.toLowerCase()
    }

    phone(field: string, header: string): void {
        const raw = this.get(header)
        if (!raw) return
        const r = validatePhone(raw, field)
        if (!r.valid) this.warn('validation', field, raw, `Invalid phone number in ${header}`)
        this.fields[field] = raw.slice(0, LIMITS.phone)
    }

    lookup(field: string, table: string, matchFields: readonly string[], value: string, required: boolean): void {
        if (!value) {
            if (required) this.warn('orphan_parent', field, '', `Parent key column is empty`)
            return
        }
        this.lookups.push({ field, table, matchFields, value, required })
    }

    joinLines(...parts: string[]): string {
        return parts.filter((p) => p.trim() !== '').join('\n')
    }
}

/** Domino canonical name `CN=Jane Doe/OU=CHPSID/O=TACOM` → `Jane Doe`. */
export function notesCommonName(raw: string): string {
    const m = /CN=([^/]+)/i.exec(raw)
    return (m?.[1] ?? raw).trim()
}

/** Legacy Readers/Authors item `[TACOM];[CSR];CN=...` → list of role tokens. */
export function legacyRoleTokens(raw: string): string[] {
    return raw
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter((s) => s !== '')
}

function lifecycleFromTerminal(status: string, closed: readonly string[], cancelled: readonly string[]): { state: string; active: boolean } {
    if (status === UNMAPPED) return { state: UNMAPPED, active: true }
    if (closed.includes(status)) return { state: 'closed', active: false }
    if (cancelled.includes(status)) return { state: 'cancelled', active: false }
    return { state: 'open', active: true }
}

function applyCommon(b: RowBuilder, form: LegacyFormName, statusRaw: string): void {
    const contract = LEGACY_FORMS[form]
    const unid = b.get('UNID').toUpperCase()
    const unidCheck = validateLegacyUnid(unid)
    if (!unidCheck.valid) b.warn('validation', 'legacy_unid', unid, 'UNID is not a 32-character hexadecimal Domino UNID')
    b.set('legacy_unid', unid.slice(0, LIMITS.legacyUnid))
    b.set('legacy_form', contract.legacyForm)
    b.set('legacy_status_raw', statusRaw.slice(0, 100))
    const hasLastModified = (contract.columns as readonly string[]).includes('LastModifiedDate')
    const modified = (hasLastModified ? b.get('LastModifiedDate') : '') || b.get('Modified') || b.get('Created')
    if (modified) {
        const n = normalizeLegacyDate(modified)
        if (n) b.set('legacy_last_modified', n.dateTime)
        else b.warn('invalid_date', 'legacy_last_modified', modified, 'Unparseable legacy Modified timestamp')
    }
}

function mapStatus(b: RowBuilder, form: LegacyFormName, raw: string, targetField: string, lookup: StatusLookup): { value: string; normalized: string; mapped: boolean } {
    const m = mapLegacyStatus(LEGACY_FORMS[form].legacyForm, raw, lookup)
    b.set(targetField, m.value)
    if (!m.mapped) b.warn('unmapped_status', targetField, raw, `Legacy status "${raw}" has no mapping for ${LEGACY_FORMS[form].legacyForm}; stored as unmapped`)
    return m
}

// ---------------------------------------------------------------------------------------------
// vetmedals.nsf
// ---------------------------------------------------------------------------------------------

function stageEnteredAt(b: RowBuilder, stage: string): string {
    const pick = (header: string): string => {
        const raw = b.get(header)
        if (!raw) return ''
        const n = normalizeLegacyDate(raw)
        return n ? n.dateTime : ''
    }
    switch (stage as CaseStage) {
        case 'closed':
            return pick('ClosedDate') || pick('ShippedDate') || pick('LastModifiedDate') || pick('Modified')
        case 'cancelled':
            return pick('ClosedDate') || pick('LastModifiedDate') || pick('Modified')
        case 'shipped':
            return pick('ShippedDate') || pick('Modified')
        case 'warehouse':
            return pick('WarehouseDate') || pick('Modified')
        case 'assembly_qc':
            return pick('AssemblyDate') || pick('Modified')
        case 'engraving':
            return pick('EngravingDate') || pick('Modified')
        case 'authorized':
            return pick('EnteredDate') || pick('AuthorizationDate') || pick('Created')
        default:
            return pick('Modified') || pick('Created')
    }
}

function awardsCase(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'AwardsCase'
    const stageRaw = b.get('Stage')
    applyCommon(b, form, stageRaw)

    // "On Hold" is a hold flag in the target, not a stage: restore the stage the hold interrupted.
    const holdReason = b.get('HoldReason')
    const stageBeforeHold = b.get('StageBeforeHold')
    const onHold = /^ON[ -]?HOLD$/i.test(stageRaw) || (holdReason !== '' && stageBeforeHold !== '')
    const effectiveStageRaw = /^ON[ -]?HOLD$/i.test(stageRaw) ? stageBeforeHold || stageRaw : stageRaw
    const status = mapStatus(b, form, effectiveStageRaw, 'stage', ctx.statusLookup)
    if (/^ON[ -]?HOLD$/i.test(stageRaw) && !stageBeforeHold) {
        b.warn('contradictory_source', 'stage', stageRaw, 'Case is On Hold but StageBeforeHold is empty; stage stored as unmapped')
    }
    b.set('on_hold', onHold)
    b.text('hold_reason', 'HoldReason')

    b.text('legacy_number', 'CaseNumber', 40)
    b.set('source_record_id', (b.get('LookupKey') || b.get('CaseNumber')).slice(0, 100))
    b.choice('source_agency', 'Source', SOURCE_AGENCY_MAP)
    b.date('authorization_date', 'AuthorizationDate')
    b.int('authorization_file_line', 'AuthFileLine', { min: 0 })
    b.text('veteran_last_name', 'VeteranLastName', LIMITS.name)
    b.text('veteran_first_name', 'VeteranFirstName', LIMITS.name)
    b.text('veteran_middle_initial', 'VeteranMI', 5)
    b.text('veteran_rank', 'VeteranRank', 20)
    const svc = b.get('ServiceNumber').replace(/\D/g, '')
    if (svc) b.set('service_number_last4', svc.slice(-4))
    b.choice('service_component', 'Branch', SERVICE_COMPONENT_MAP)
    b.choice('service_era', 'Era', SERVICE_ERA_MAP)
    const from = b.date('service_from', 'ServiceFrom')
    const to = b.date('service_to', 'ServiceTo')
    if (from && to && to < from) b.warn('contradictory_source', 'service_to', `${from}..${to}`, 'ServiceTo precedes ServiceFrom')
    const deceased = b.bool('veteran_deceased', 'Deceased')
    const relationship = b.choice('requester_relationship', 'Relationship', RELATIONSHIP_MAP)
    if (deceased === true && relationship === 'self') {
        b.warn('contradictory_source', 'requester_relationship', b.get('Relationship'), 'Requester is the veteran but Deceased=Yes')
    }

    const entered = stageEnteredAt(b, status.value)
    if (entered) b.set('stage_entered_at', entered)
    const isTerminal = status.value === 'closed' || status.value === 'cancelled'
    if (status.value === 'closed' && !b.get('ClosedDate')) b.warn('contradictory_source', 'closed_at', stageRaw, 'Stage is Closed but ClosedDate is empty')
    if (status.value === 'shipped' && !b.get('ShippedDate') && !b.get('TrackingNumber')) {
        b.warn('contradictory_source', 'stage', stageRaw, 'Stage is Shipped but neither ShippedDate nor TrackingNumber is present')
    }
    if (status.value !== UNMAPPED) {
        const aging = computeAging({ stage: status.value as CaseStage, stage_entered_at: entered || null }, ctx.now)
        b.set('days_in_stage', aging.days_in_stage)
        b.set('aging_flag', aging.aging_flag)
    }
    const lifecycle = lifecycleFromTerminal(status.value, ['closed'], ['cancelled'])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    if (isTerminal) {
        const closedAt = b.date('closed_at', 'ClosedDate', 'datetime')
        if (!closedAt && entered) b.set('closed_at', entered)
    }
    if (status.value === 'cancelled') b.set('cancel_reason', (holdReason || 'Cancelled in legacy system').slice(0, MAX_STRING))

    const priority = b.choice('priority', 'Priority', CASE_PRIORITY_MAP)
    b.set('priority_handling', priority !== 'routine')
    b.bool('engraving_required', 'EngravingRequired')
    b.choice('qc_result', 'QCResult', QC_RESULT_MAP)
    b.text('pick_bin', 'PickBin', 20)
    b.text('ship_to_name', 'ShipToName', LIMITS.name)
    b.text('ship_to_address_1', 'ShipToStreet', 100)
    b.text('ship_to_city', 'ShipToCity', 60)
    b.text('ship_to_state', 'ShipToState', 2)
    b.text('ship_to_zip', 'ShipToZIP', 10)
    b.set('ship_to_country', 'US')
    b.int('line_count', 'LineCount', { min: 0 })

    const vet = [b.get('VeteranRank'), b.get('VeteranFirstName'), b.get('VeteranMI'), b.get('VeteranLastName')].filter(Boolean).join(' ')
    const lines = b.get('LineCount')
    b.set('short_description', `${vet || 'Veteran'} - ${lines || '?'} award line(s) (${b.get('CaseNumber')})`.slice(0, 160))

    const workNotes = b.joinLines(
        `[Migrated] Legacy case ${b.get('CaseNumber')} entered ${b.get('EnteredDate')} by ${notesCommonName(b.get('EnteredBy'))}; CSR ${notesCommonName(b.get('AssignedCSR')) || 'unassigned'}.`,
        b.get('Remarks') ? `Remarks: ${b.get('Remarks')}` : '',
        b.get('StatusHistory') ? `Status history:\n${b.get('StatusHistory').replace(/;\s*/g, '\n')}` : '',
    )
    b.set('work_notes', workNotes.slice(0, 4000))

    b.lookup('requester', TABLES.requester, ['legacy_number', 'legacy_unid'], b.get('RequesterKey'), false)
    b.lookup('authorization_file', TABLES.authorization_file, ['file_name', 'legacy_number'], b.get('AuthFileName'), false)

    return finish(b, form, status)
}

function awardLine(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'AwardLine'
    const statusRaw = b.get('LineStatus')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'status', ctx.statusLookup)

    const parent = b.get('ParentUNID').toUpperCase()
    const parent2 = b.get('ParentUNID_2').toUpperCase()
    if (parent && parent2 && parent !== parent2) {
        b.warn('contradictory_source', 'awards_case', `${parent} / ${parent2}`, 'Envelope ParentUNID and form ParentUNID disagree; envelope value used')
    }
    b.lookup('awards_case', TABLES.awards_case, ['legacy_unid'], parent || parent2, true)

    b.int('line_number', 'LineNumber', { min: 1 })
    const award = mapAwardName(b.get('AwardCode'), b.get('AwardName'))
    b.set('award_name', award.value)
    if (!award.mapped) b.warn('unmapped_value', 'award_name', `${b.get('AwardCode')} / ${b.get('AwardName')}`, 'Award code/name not in catalog; stored as other')
    b.text('legacy_award_name', 'AwardName', 120)
    b.text('legacy_award_code', 'AwardCode', 20)
    b.text('set_type', 'SetType', 60)
    b.text('stock_number', 'StockNumber', LIMITS.stockNumber)
    b.text('authority', 'Authority', 120)
    b.date('backorder_eta', 'BackorderETA')
    b.choice('device', 'Devices', AWARD_DEVICE_MAP)
    b.int('device_count', 'DeviceCount', { min: 0, max: 20 })
    const qty = b.int('quantity', 'Quantity')
    if (qty !== null) {
        const q = validateQuantity(qty)
        if (!q.valid) b.warn('validation', 'quantity', String(qty), `Quantity outside 1..${LIMITS.maxQuantity}`)
    }
    const engrave = b.bool('engraving_required', 'Engrave')
    const text = b.get('EngravingText')
    if (text) {
        const r = validateEngravingText(text)
        if (!r.valid) b.warn('validation', 'engraving_text', text, `Engraving text fails the ${LIMITS.engravingText}-character/character-set rule`)
        b.set('engraving_text', text.slice(0, LIMITS.engravingText))
    }
    if (engrave === true && !text) b.warn('contradictory_source', 'engraving_text', b.get('Engrave'), 'Engrave=Yes but EngravingText is empty')
    if (engrave === false && text) b.warn('contradictory_source', 'engraving_required', text, 'Engrave=No but EngravingText is present')
    if (status.value === 'backordered' && !b.get('BackorderETA')) b.warn('contradictory_source', 'backorder_eta', statusRaw, 'Line is Backordered without a BackorderETA')
    b.set('stock_on_hand', status.value !== 'backordered')

    const lifecycle = lifecycleFromTerminal(status.value, ['complete'], ['cancelled'])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    return finish(b, form, status)
}

function requesterCommon(b: RowBuilder, keyHeader: string): void {
    b.text('legacy_number', keyHeader, 40)
    b.phone('phone', 'Phone')
    b.email('email', 'Email')
}

function requester(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'Requester'
    const mergedInto = b.get('MergedInto')
    const statusRaw = mergedInto ? 'Merged' : 'Active'
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'state', ctx.statusLookup)
    b.set('active', status.value === 'active')
    requesterCommon(b, 'RequesterID')

    const relationshipRaw = b.get('Relationship')
    const type = REQUESTER_TYPE_MAP.map(relationshipRaw)
    b.set('type', type.value)
    if (!type.mapped) b.warn('unmapped_value', 'type', relationshipRaw, 'Relationship does not indicate veteran / next of kin / unit; stored as next_of_kin')
    b.text('relationship', 'Relationship', 40)
    b.text('first_name', 'FirstName', LIMITS.name)
    b.text('middle_initial', 'MI', 5)
    b.text('last_name', 'LastName', LIMITS.name)
    b.text('suffix', 'Suffix', 10)
    b.text('veteran_name', 'VeteranName', 120)
    b.text('preferred_contact', 'PreferredContact', 20)
    b.text('address_1', 'Street', 100)
    b.text('city', 'City', 60)
    b.text('address_state', 'State', 2)
    b.text('zip', 'ZIP', 10)
    b.set('country', 'US')
    const display = b.get('DisplayName') || [b.get('FirstName'), b.get('MI'), b.get('LastName'), b.get('Suffix')].filter(Boolean).join(' ')
    b.set('name', display.slice(0, LIMITS.name))
    if (!isSafeText(display, LIMITS.name)) b.warn('validation', 'name', display, 'Requester display name contains characters outside the allowed set')

    const key = computeDedupeKey({
        type: type.value,
        first_name: b.get('FirstName'),
        last_name: b.get('LastName'),
        email: b.get('Email'),
        zip: b.get('ZIP'),
    })
    b.set('dedupe_key', key)
    if (mergedInto) b.lookup('merged_into', TABLES.requester, ['legacy_number', 'legacy_unid'], mergedInto, false)

    const t = finish(b, form, status)
    t.dedupeKey = key
    return t
}

function heraldryRequester(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'HeraldryRequester'
    applyCommon(b, form, 'Active')
    const status = mapStatus(b, form, 'Active', 'state', ctx.statusLookup)
    b.set('active', true)
    requesterCommon(b, 'RequesterKey')
    b.set('type', 'unit')
    b.text('name', 'Name', LIMITS.name)
    b.text('rank', 'Rank', 20)
    b.text('role_title', 'Role', 60)
    b.text('unit_name', 'UnitName', 120)
    const dodaac = b.get('DODAAC')
    if (dodaac) {
        if (!validateDodaac(dodaac).valid) b.warn('validation', 'dodaac', dodaac, 'DODAAC is not 6 alphanumeric characters')
        b.set('dodaac', dodaac.toUpperCase().slice(0, LIMITS.dodaac))
    }
    const uic = b.get('UIC')
    if (uic) {
        if (!validateUic(uic).valid) b.warn('validation', 'uic', uic, 'UIC is not W + 5 alphanumerics')
        b.set('uic', uic.toUpperCase().slice(0, LIMITS.uic))
    }
    b.set('relationship', 'Unit')
    const key = computeDedupeKey({ type: 'unit', unit_name: b.get('UnitName') || b.get('UIC'), zip: '' })
    b.set('dedupe_key', key)
    const t = finish(b, form, status)
    t.dedupeKey = key
    return t
}

function authorizationFile(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'AuthorizationFile'
    const statusRaw = b.get('ImportStatus')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'parse_status', ctx.statusLookup)
    b.text('file_name', 'FileName', 200)
    b.text('legacy_number', 'FileKey', 40)
    b.date('received', 'ReceivedDate', 'datetime')
    b.choice('source_agency', 'SourceAgency', SOURCE_AGENCY_MAP)
    b.choice('format', 'Layout', FILE_FORMAT_MAP)
    b.text('layout', 'Layout', 40)
    b.date('transmission_date', 'TransmissionDate')
    b.date('authorization_date', 'AuthorizationDate')
    b.date('imported_at', 'ImportedDate', 'datetime')
    const records = b.int('record_count', 'RecordCount', { min: 0 })
    const cases = b.int('cases_created', 'CasesCreated', { min: 0 })
    b.int('lines_created', 'LinesCreated', { min: 0 })
    b.int('requesters_created', 'RequestersCreated', { min: 0 })
    b.int('requesters_matched', 'RequestersMatched', { min: 0 })
    const rejected = b.int('rejected_count', 'RecordsRejected', { min: 0 })
    if (records !== null && cases !== null && rejected !== null && cases + rejected > records) {
        b.warn('contradictory_source', 'record_count', `${records}/${cases}/${rejected}`, 'CasesCreated + RecordsRejected exceeds RecordCount')
    }
    if (cases !== null) b.set('accepted_count', cases)
    b.long('parse_log', 'ImportLog')
    b.text('source_hash', 'TrailerChecksum', 64)
    b.bool('checksum_match', 'ChecksumMatch')
    b.set('intake_channel', 'legacy_import')
    const lifecycle = status.value === 'received' || status.value === 'parsing' ? { state: 'open', active: true } : lifecycleFromTerminal(status.value, ['parsed', 'partial', 'failed'], [])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    return finish(b, form, status)
}

function engravingJob(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'EngravingJob'
    const statusRaw = b.get('JobStatus')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'status', ctx.statusLookup)
    b.text('legacy_number', 'JobNumber', 40)
    b.lookup('awards_case', TABLES.awards_case, ['legacy_number'], b.get('CaseNumber'), true)
    b.choice('font', 'Font', ENGRAVING_FONT_MAP)
    const text = b.get('EngravingText')
    if (text) {
        if (!validateEngravingText(text).valid) b.warn('validation', 'text', text, `Engraving text fails the ${LIMITS.engravingText}-character/character-set rule`)
        b.set('text', text.slice(0, LIMITS.engravingText))
    }
    b.long('items', 'Items')
    b.text('machine', 'Machine', 40)
    const proofRaw = b.get('ProofChecked')
    const proof = parseLegacyBoolean(proofRaw)
    b.set('proof_checked', proof ?? proofRaw !== '')
    b.date('queued', 'QueuedDate', 'datetime')
    const started = b.date('started', 'StartedDate', 'datetime')
    const completed = b.date('completed', 'CompletedDate', 'datetime')
    if (started && completed && completed < started) b.warn('contradictory_source', 'completed', `${started}..${completed}`, 'CompletedDate precedes StartedDate')
    if (status.value === 'complete' && !completed) b.warn('contradictory_source', 'completed', statusRaw, 'Job is Complete without a CompletedDate')
    const priority = b.choice('priority', 'Priority', CASE_PRIORITY_MAP)
    b.set('priority_handling', priority !== 'routine')
    b.int('rework_count', 'ReworkCount', { min: 0 })
    const qc = b.joinLines(
        b.get('Engraver') ? `Legacy engraver: ${notesCommonName(b.get('Engraver'))}` : '',
        proof === null && proofRaw ? `Proof check: ${proofRaw.replace(/;\s*/g, '; ')}` : '',
        b.get('Notes'),
    )
    if (qc) b.set('qc_notes', qc.slice(0, 4000))
    const lifecycle = lifecycleFromTerminal(status.value, ['complete'], ['cancelled'])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    return finish(b, form, status)
}

function shipment(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'ShipmentRecord'
    const statusRaw = b.get('ShipStatus')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'status', ctx.statusLookup)
    b.text('legacy_number', 'ShipmentNumber', 40)
    b.lookup('awards_case', TABLES.awards_case, ['legacy_number'], b.get('CaseNumber'), true)
    b.bool('partial', 'Partial')
    b.text('contents', 'Contents', MAX_STRING)
    const carrierRaw = b.get('Carrier')
    b.choice('carrier', 'Carrier', CARRIER_MAP)
    const level = carrierRaw.replace(/^(USPS|UPS|FedEx|Fed Ex|DHL)\s*/i, '').trim()
    if (level && level.toUpperCase() !== carrierRaw.toUpperCase()) b.set('service_level', level.slice(0, 40))
    b.text('tracking_number', 'TrackingNumber', 40)
    b.int('pieces', 'PieceCount', { min: 0 })
    b.int('weight_oz', 'WeightOz', { min: 0 })
    const shipTo = b.joinLines(b.get('ShipToName'), b.get('ShipToStreet'), [b.get('ShipToCity'), b.get('ShipToState'), b.get('ShipToZIP')].filter(Boolean).join(' '))
    if (shipTo) b.set('ship_to', shipTo)
    b.date('picked', 'PickedDate', 'datetime')
    let shipped = b.date('shipped', 'ShippedDate', 'datetime')
    if (!shipped && b.get('ShipDateText')) shipped = b.date('shipped', 'ShipDateText', 'datetime')
    const delivered = b.date('delivered', 'DeliveredDate', 'datetime')
    if (shipped && delivered && delivered < shipped) b.warn('contradictory_source', 'delivered', `${shipped}..${delivered}`, 'DeliveredDate precedes ShippedDate')
    if (status.value === 'delivered' && !delivered) b.warn('contradictory_source', 'delivered', statusRaw, 'Shipment is Delivered without a DeliveredDate')
    if ((status.value === 'in_transit' || status.value === 'delivered') && !b.get('TrackingNumber')) {
        b.warn('contradictory_source', 'tracking_number', statusRaw, 'Shipment left the warehouse without a tracking number')
    }
    b.text('exception_note', 'ExceptionNote', MAX_STRING)
    if (status.value === 'returned' && !b.get('ExceptionNote')) b.set('exception_note', 'Returned to sender (legacy status)')
    const lifecycle = lifecycleFromTerminal(status.value, ['delivered'], [])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    return finish(b, form, status)
}

function caseNote(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'CaseNote'
    const doneRaw = b.get('FollowUpDone')
    applyCommon(b, form, doneRaw)
    const status = mapStatus(b, form, doneRaw, 'state', ctx.statusLookup)
    b.set('active', status.value === 'open')
    const parent = b.get('ParentUNID').toUpperCase()
    const parent2 = b.get('ParentUNID_2').toUpperCase()
    if (parent && parent2 && parent !== parent2) {
        b.warn('contradictory_source', 'awards_case', `${parent} / ${parent2}`, 'Envelope ParentUNID and form ParentUNID disagree; envelope value used')
    }
    b.lookup('awards_case', TABLES.awards_case, ['legacy_unid'], parent || parent2, true)
    const noteType = b.choice('note_type', 'NoteType', NOTE_TYPE_MAP)
    b.text('legacy_note_type', 'NoteType', 60)
    b.date('noted_at', 'NoteDate', 'datetime')
    b.set('legacy_author', notesCommonName(b.get('NoteAuthor')).slice(0, LIMITS.name))
    b.long('body', 'Body')
    b.text('summary', 'Summary', 160)
    b.text('contact_name', 'ContactName', LIMITS.name)
    b.phone('contact_phone', 'ContactPhone')
    const followUp = b.date('follow_up_date', 'FollowUpDate')
    const done = parseLegacyBoolean(doneRaw)
    b.set('follow_up_done', done ?? false)
    if (done === true && !followUp && !b.get('Body')) b.warn('contradictory_source', 'follow_up_done', doneRaw, 'Follow-up marked done on a note without body or follow-up date')
    b.set('customer_visible', noteType === 'customer_contact')
    return finish(b, form, status)
}

// ---------------------------------------------------------------------------------------------
// heraldry.nsf
// ---------------------------------------------------------------------------------------------

const RELEASED_OR_LATER = new Set(['released_to_vendor', 'in_production', 'shipped', 'complete'])

function heraldryRequest(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'Request'
    const statusRaw = b.get('Status')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'state', ctx.statusLookup)
    b.set('active', !(status.value === 'complete' || status.value === 'cancelled'))

    const dodaac = b.get('DODAAC').toUpperCase()
    const docNo = b.get('DocumentNumber').toUpperCase()
    if (dodaac && !validateDodaac(dodaac).valid) b.warn('validation', 'dodaac', dodaac, 'DODAAC is not 6 alphanumeric characters')
    if (docNo && !validateDocumentNumber(docNo, dodaac || undefined).valid) b.warn('validation', 'document_number', docNo, 'Document number is not DODAAC + Julian date + serial')
    b.set('document_number', docNo.slice(0, LIMITS.documentNumber))
    b.set('dodaac', dodaac.slice(0, LIMITS.dodaac))
    const uic = b.get('UIC').toUpperCase()
    if (uic) {
        if (!validateUic(uic).valid) b.warn('validation', 'uic', uic, 'UIC is not W + 5 alphanumerics')
        b.set('uic', uic.slice(0, LIMITS.uic))
    }
    const rpd = mapRequisitionPriority(b.get('RPD'))
    if (rpd.value) b.set('requisition_priority', rpd.value)
    if (!rpd.mapped) b.warn('unmapped_value', 'requisition_priority', b.get('RPD'), 'RPD is not a MILSTRIP priority designator 01-15')
    b.text('project_code', 'ProjectCode', LIMITS.projectCode)
    b.text('fund_code', 'FundCode', LIMITS.fundCode)
    b.text('signal_code', 'SignalCode', 1)
    b.date('required_delivery_date', 'RequiredDeliveryDate')
    b.text('request_type', 'RequestType', 40)
    b.set('priority_handling', CASE_PRIORITY_MAP.map(b.get('Priority')).value !== 'routine')
    b.text('supplementary_address', 'SupplementaryAddress', LIMITS.dodaac)
    b.text('ship_to_dodaac', 'ShipToDODAAC', LIMITS.dodaac)
    b.text('requesting_unit', 'UnitName', 120)
    const poc = [b.get('RequesterRank'), b.get('RequesterName')].filter(Boolean).join(' ') + (b.get('RequesterRole') ? ` (${b.get('RequesterRole')})` : '')
    if (poc.trim()) b.set('requester_poc', poc.slice(0, LIMITS.name))
    b.email('requester_poc_email', 'RequesterEmail')
    b.phone('requester_poc_phone', 'RequesterPhone')
    const shipTo = b.joinLines(
        b.get('ShipToName'),
        b.get('ShipToAddress1'),
        b.get('ShipToAddress2'),
        [b.get('ShipToCity'), b.get('ShipToState'), b.get('ShipToZIP')].filter(Boolean).join(' '),
        b.get('ShipToDODAAC') ? `DODAAC ${b.get('ShipToDODAAC')}` : '',
    )
    if (shipTo) b.set('ship_to', shipTo)
    const justification = b.joinLines(b.get('Justification'), b.get('JustificationText'))
    if (justification) b.set('justification', justification.slice(0, LIMITS.justification))

    const vendorKey = b.get('VendorKey').toUpperCase()
    b.set('legacy_vendor_key', vendorKey.slice(0, 20))
    if (vendorKey) b.lookup('vendor', TABLES.vendor, ['cage_code'], vendorKey, false)
    const released = b.date('released_to_vendor', 'ReleasedDate')
    b.date('approved_at', 'ApprovedDate', 'datetime')
    b.date('estimated_ship_date', 'EstimatedShipDate')
    const submitted = b.date('submitted_at', 'SubmittedDate', 'datetime')
    if (released && submitted && released < submitted.slice(0, 10)) b.warn('contradictory_source', 'released_to_vendor', `${submitted}..${released}`, 'ReleasedDate precedes SubmittedDate')
    if (RELEASED_OR_LATER.has(status.value) && !vendorKey) b.warn('contradictory_source', 'vendor', statusRaw, `Status "${statusRaw}" implies a vendor but VendorKey is empty`)
    if (RELEASED_OR_LATER.has(status.value) && !released) b.warn('contradictory_source', 'released_to_vendor', statusRaw, `Status "${statusRaw}" implies release but ReleasedDate is empty`)
    if (released && (status.value === 'draft' || status.value === 'submitted' || status.value === 'in_review')) {
        b.warn('contradictory_source', 'state', statusRaw, `ReleasedDate is set but status is still "${statusRaw}"`)
    }
    if (status.value === 'cancelled' && !b.get('CancelReason')) b.warn('contradictory_source', 'cancel_reason', statusRaw, 'Request is Cancelled without a CancelReason')
    b.int('line_count', 'LineCount', { min: 0 })
    b.decimal('total_extended_price', 'TotalValue')
    b.text('cancel_reason', 'CancelReason', MAX_STRING)
    const workNotes = b.joinLines(
        `[Migrated] Legacy document ${docNo} entered ${b.get('EnteredDate')} by ${notesCommonName(b.get('EnteredBy'))}.`,
        b.get('ReviewedBy') ? `Reviewed by ${notesCommonName(b.get('ReviewedBy'))} ${b.get('ApprovedDate')}`.trim() : '',
        b.get('ReleasedBy') ? `Released by ${notesCommonName(b.get('ReleasedBy'))} ${b.get('ReleasedDate')} to ${b.get('VendorName') || vendorKey}`.trim() : '',
        b.get('CancelledBy') ? `Cancelled by ${notesCommonName(b.get('CancelledBy'))} ${b.get('CancelledDate')}: ${b.get('CancelReason')}`.trim() : '',
        b.get('StatusHistory') ? `Status history:\n${b.get('StatusHistory').replace(/;\s*/g, '\n')}` : '',
    )
    b.set('work_notes', workNotes.slice(0, 4000))
    return finish(b, form, status)
}

function requestLine(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'RequestLine'
    const statusRaw = b.get('LineStatus')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'status', ctx.statusLookup)
    b.lookup('heraldry_request', TABLES.heraldry_request, ['legacy_unid'], b.get('ParentUNID').toUpperCase(), true)
    b.int('line_number', 'LineNumber', { min: 1 })
    const nsn = b.get('NSN')
    const itemKey = b.get('ItemKey')
    const exception = b.get('ExceptionData')
    if (nsn || itemKey) b.lookup('heraldic_item', TABLES.heraldic_item, ['stock_number'], nsn || itemKey, false)
    if (!nsn && !exception) b.warn('contradictory_source', 'nsn_or_exception', '', 'Line has neither an NSN nor exception data')
    b.set('nsn_or_exception', (nsn || exception).slice(0, 100))
    b.text('nomenclature', 'ItemDescription', 200)
    b.text('line_document_number', 'LineDocNumber', 20)
    b.long('exception_data', 'ExceptionData', 1000)
    b.date('vendor_ship_date', 'VendorShipDate')
    b.choice('unit_of_issue', 'UnitOfIssue', UNIT_OF_ISSUE_MAP)
    const qty = b.int('quantity', 'Quantity')
    if (qty !== null && !validateQuantity(qty, 'quantity', LIMITS.maxLineQuantity).valid) b.warn('validation', 'quantity', String(qty), `Quantity outside 1..${LIMITS.maxLineQuantity}`)
    const price = b.decimal('unit_price', 'UnitPrice')
    if (price !== null && price < 0) b.warn('validation', 'unit_price', String(price), 'Negative unit price')
    const computed = computeExtendedPrice(qty ?? 0, price ?? 0)
    b.set('extended_price', computed.toFixed(2))
    const sourceExtended = toNumber(b.get('ExtendedPrice').replace(/[$,]/g, ''))
    if (sourceExtended !== null && Math.abs(sourceExtended - computed) > 0.005) {
        b.warn('contradictory_source', 'extended_price', b.get('ExtendedPrice'), `Legacy ExtendedPrice ${sourceExtended.toFixed(2)} ≠ quantity × unit price ${computed.toFixed(2)}; recomputed`)
    }
    if (status.value === 'complete' && qty !== null) b.set('vendor_quantity_shipped', qty)
    const lifecycle = lifecycleFromTerminal(status.value, ['complete'], ['cancelled'])
    b.set('state', lifecycle.state)
    b.set('active', lifecycle.active)
    return finish(b, form, status)
}

function heraldicItem(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'HeraldicItem'
    const activeRaw = b.get('Active')
    applyCommon(b, form, activeRaw)
    const status = mapStatus(b, form, activeRaw, 'state', ctx.statusLookup)
    b.set('active', status.value === 'active')
    const stock = b.get('StockNumber')
    b.set('stock_number', stock.slice(0, LIMITS.stockNumber))
    b.set('exception_item', stock === '')
    b.text('nomenclature', 'ItemName', 200)
    b.choice('category', 'Category', HERALDIC_CATEGORY_MAP)
    b.long('description', 'Description')
    b.choice('unit_of_issue', 'UnitOfIssue', UNIT_OF_ISSUE_MAP)
    const price = b.decimal('unit_price', 'UnitPrice')
    if (price !== null && price <= 0) b.warn('validation', 'unit_price', String(price), 'Catalog unit price must be positive')
    b.int('lead_time_days', 'LeadTimeDays', { min: 0, max: 730 })
    b.int('max_qty_per_request', 'MaxQtyPerRequest', { min: 1 })
    b.text('branch', 'Branch', 60)
    b.text('fsc', 'FSC', 4)
    const niinRaw = b.get('NIIN').replace(/-/g, '')
    if (niinRaw) {
        if (!/^\d{9}$/.test(niinRaw)) b.warn('validation', 'niin', b.get('NIIN'), 'NIIN is not 9 digits')
        b.set('niin', niinRaw.slice(0, 9))
    }
    b.text('approved_vendors', 'ApprovedVendors', MAX_STRING)
    b.text('reference', 'Reference', 120)
    const fsc = b.get('FSC')
    const niin = b.get('NIIN')
    if (stock && fsc && niin && stock.replace(/-/g, '') !== `${fsc}${niin}`.replace(/-/g, '')) {
        b.warn('contradictory_source', 'stock_number', `${stock} vs ${fsc}-${niin}`, 'StockNumber does not equal FSC + NIIN')
    }
    const firstVendor = b.get('ApprovedVendors').split(/[;,]/)[0]?.trim().toUpperCase() ?? ''
    if (firstVendor) b.lookup('preferred_vendor', TABLES.vendor, ['cage_code'], firstVendor, false)
    return finish(b, form, status)
}

function sesFlagRequest(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'SESFlagRequest'
    const statusRaw = b.get('Status')
    applyCommon(b, form, statusRaw)
    const status = mapStatus(b, form, statusRaw, 'state', ctx.statusLookup)
    b.set('active', !(status.value === 'delivered' || status.value === 'rejected' || status.value === 'cancelled'))
    b.text('legacy_number', 'SESFlagNumber', 40)
    b.text('requesting_office', 'Organization', 160)
    b.text('executive_tier', 'ExecutiveTier', 20)
    const dodaac = b.get('DODAAC').toUpperCase()
    if (dodaac) {
        if (!validateDodaac(dodaac).valid) b.warn('validation', 'dodaac', dodaac, 'DODAAC is not 6 alphanumeric characters')
        b.set('dodaac', dodaac.slice(0, LIMITS.dodaac))
    }
    const uic = b.get('UIC').toUpperCase()
    if (uic) {
        if (!validateUic(uic).valid) b.warn('validation', 'uic', uic, 'UIC is not W + 5 alphanumerics')
        b.set('uic', uic.slice(0, LIMITS.uic))
    }
    b.text('legacy_flag_type', 'FlagType', 80)
    const flag = SES_FLAG_TYPE_MAP.map(b.get('FlagType'))
    if (flag.value) b.set('flag_type', flag.value)
    else {
        // flag_type is mandatory; accessories such as replacement fringe/cord have no flag type of their own.
        b.set('flag_type', 'indoor')
        b.warn('unmapped_value', 'flag_type', b.get('FlagType'), 'FlagType is not an SES flag type; defaulted to indoor (see legacy_flag_type)')
    }
    const vendorKey = b.get('VendorKey').toUpperCase()
    if (vendorKey) b.lookup('vendor', TABLES.vendor, ['cage_code'], vendorKey, false)
    const released = b.date('released_to_vendor', 'ReleasedDate')
    if ((status.value === 'in_production' || status.value === 'delivered') && !vendorKey) b.warn('contradictory_source', 'vendor', statusRaw, `Status "${statusRaw}" implies a vendor but VendorKey is empty`)
    if (released && (status.value === 'draft' || status.value === 'submitted')) b.warn('contradictory_source', 'state', statusRaw, 'ReleasedDate is set but the request has not been approved')
    b.text('executive_name', 'ExecutiveName', LIMITS.name)
    b.text('position_title', 'ExecutiveTitle', 160)
    const qty = b.int('quantity', 'Quantity')
    if (qty !== null && !validateQuantity(qty, 'quantity', 50).valid) b.warn('validation', 'quantity', String(qty), 'Quantity outside 1..50')
    b.long('justification', 'Justification', LIMITS.justification)
    b.long('ship_to', 'ShipToAddress', 1000)
    b.date('approved_at', 'ApprovalDate', 'datetime')
    b.text('rejection_reason', 'ReturnReason', MAX_STRING)
    if (status.value === 'rejected' && !b.get('ReturnReason')) b.warn('contradictory_source', 'rejection_reason', statusRaw, 'Request was returned without a ReturnReason')
    if (status.value === 'delivered') {
        const approved = b.get('ApprovalDate')
        if (!approved) b.warn('contradictory_source', 'approved_at', statusRaw, 'Delivered SES flag request has no ApprovalDate')
    }
    return finish(b, form, status)
}

function vendor(b: RowBuilder, ctx: Required<TransformContext>): RowTransform {
    const form: LegacyFormName = 'Vendor'
    const activeRaw = b.get('Active')
    applyCommon(b, form, activeRaw)
    const status = mapStatus(b, form, activeRaw, 'state', ctx.statusLookup)
    b.set('active', status.value === 'active')
    b.text('name', 'VendorName', LIMITS.name)
    const cage = b.get('VendorKey').toUpperCase()
    if (cage) {
        if (!validateCageCode(cage).valid) b.warn('validation', 'cage_code', cage, 'VendorKey is not a 5-character CAGE code')
        b.set('cage_code', cage.slice(0, LIMITS.cageCode))
    }
    b.text('contract_number', 'ContractNumber', 40)
    b.text('poc', 'POC', LIMITS.name)
    b.email('email', 'Email')
    b.phone('phone', 'Phone')
    const address = b.joinLines(b.get('Address'), [b.get('City'), b.get('State'), b.get('ZIP')].filter(Boolean).join(' '))
    if (address) b.set('address', address)
    b.text('capabilities', 'Products', MAX_STRING)
    b.int('lead_time_days', 'LeadTimeDays', { min: 0, max: 730 })
    b.text('legacy_user_group', 'VendorGroup', LIMITS.name)
    b.long('legacy_vendor_users', 'VendorUsers', 1000)
    if (status.value === 'active' && !b.get('VendorUsers')) b.warn('contradictory_source', 'legacy_vendor_users', activeRaw, 'Active vendor has no portal users in VendorUsers')
    return finish(b, form, status)
}

function finish(b: RowBuilder, form: LegacyFormName, status: { value: string; normalized: string; mapped: boolean }): RowTransform {
    return {
        form,
        targetTable: LEGACY_FORMS[form].targetTable,
        fields: b.fields,
        lookups: b.lookups,
        warnings: b.warnings,
        statusNormalized: status.normalized,
        statusMapped: status.mapped,
        headersRead: [...b.headersRead],
    }
}

type FormTransform = (b: RowBuilder, ctx: Required<TransformContext>) => RowTransform

const TRANSFORMS: Readonly<Record<LegacyFormName, FormTransform>> = {
    AwardsCase: awardsCase,
    AwardLine: awardLine,
    Requester: requester,
    HeraldryRequester: heraldryRequester,
    AuthorizationFile: authorizationFile,
    EngravingJob: engravingJob,
    ShipmentRecord: shipment,
    CaseNote: caseNote,
    Request: heraldryRequest,
    RequestLine: requestLine,
    HeraldicItem: heraldicItem,
    SESFlagRequest: sesFlagRequest,
    Vendor: vendor,
}

/** Transform one source row. Never throws on bad data — problems come back as warnings. */
export function transformRow(form: LegacyFormName, source: SourceRow, ctx: TransformContext): RowTransform {
    const fn = TRANSFORMS[form]
    const full: Required<TransformContext> = { now: ctx.now, statusLookup: ctx.statusLookup ?? buildStatusLookup() }
    return fn(new RowBuilder(source), full)
}

/** Field on each target table that receives the mapped legacy status. */
export const STATUS_TARGET_FIELD: Readonly<Record<LegacyFormName, string>> = {
    AwardsCase: 'stage',
    AwardLine: 'status',
    Requester: 'state',
    HeraldryRequester: 'state',
    AuthorizationFile: 'parse_status',
    EngravingJob: 'status',
    ShipmentRecord: 'status',
    CaseNote: 'state',
    Request: 'state',
    RequestLine: 'status',
    HeraldicItem: 'state',
    SESFlagRequest: 'state',
    Vendor: 'state',
}

/** Legacy form literal stored in `legacy_form` on rows produced by each contract form. */
export const LEGACY_FORM_LITERAL: Readonly<Record<LegacyFormName, string>> = {
    AwardsCase: LEGACY_FORM_KEYS.awards_case,
    AwardLine: LEGACY_FORM_KEYS.award_line,
    Requester: LEGACY_FORM_KEYS.requester,
    HeraldryRequester: LEGACY_FORM_KEYS.requester,
    AuthorizationFile: LEGACY_FORM_KEYS.authorization_file,
    EngravingJob: LEGACY_FORM_KEYS.engraving_job,
    ShipmentRecord: LEGACY_FORM_KEYS.shipment,
    CaseNote: LEGACY_FORM_KEYS.case_note,
    Request: LEGACY_FORM_KEYS.heraldry_request,
    RequestLine: LEGACY_FORM_KEYS.request_line,
    HeraldicItem: LEGACY_FORM_KEYS.heraldic_item,
    SESFlagRequest: LEGACY_FORM_KEYS.ses_flag_request,
    Vendor: LEGACY_FORM_KEYS.vendor,
}

/** Direct header → target-field copies expressed as Transform Map field maps (documentation + coalesce). */
export const DIRECT_FIELD_MAPS: Readonly<Record<LegacyFormName, Readonly<Record<string, string>>>> = {
    AwardsCase: { legacy_number: 'CaseNumber', veteran_last_name: 'VeteranLastName', veteran_first_name: 'VeteranFirstName', pick_bin: 'PickBin', ship_to_name: 'ShipToName', ship_to_city: 'ShipToCity', ship_to_zip: 'ShipToZIP' },
    AwardLine: { legacy_award_name: 'AwardName', legacy_award_code: 'AwardCode', set_type: 'SetType', stock_number: 'StockNumber', authority: 'Authority' },
    Requester: { legacy_number: 'RequesterID', first_name: 'FirstName', last_name: 'LastName', city: 'City', zip: 'ZIP' },
    HeraldryRequester: { legacy_number: 'RequesterKey', name: 'Name', unit_name: 'UnitName', rank: 'Rank' },
    AuthorizationFile: { file_name: 'FileName', legacy_number: 'FileKey', layout: 'Layout', source_hash: 'TrailerChecksum' },
    EngravingJob: { legacy_number: 'JobNumber', machine: 'Machine' },
    ShipmentRecord: { legacy_number: 'ShipmentNumber', tracking_number: 'TrackingNumber', contents: 'Contents' },
    CaseNote: { legacy_note_type: 'NoteType', summary: 'Summary', contact_name: 'ContactName' },
    Request: { document_number: 'DocumentNumber', dodaac: 'DODAAC', uic: 'UIC', project_code: 'ProjectCode', fund_code: 'FundCode', signal_code: 'SignalCode', requesting_unit: 'UnitName', request_type: 'RequestType' },
    RequestLine: { nomenclature: 'ItemDescription', line_document_number: 'LineDocNumber' },
    HeraldicItem: { stock_number: 'StockNumber', nomenclature: 'ItemName', fsc: 'FSC', niin: 'NIIN', branch: 'Branch', reference: 'Reference' },
    SESFlagRequest: { legacy_number: 'SESFlagNumber', executive_name: 'ExecutiveName', position_title: 'ExecutiveTitle', requesting_office: 'Organization', legacy_flag_type: 'FlagType' },
    Vendor: { name: 'VendorName', cage_code: 'VendorKey', contract_number: 'ContractNumber', poc: 'POC' },
}

export { CASE_STAGES }

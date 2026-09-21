/**
 * Legacy keyword-list values → target choice values for the non-status choice fields.
 *
 * The Domino forms used @Formula keyword lists that drifted over two decades (e.g. `Branch`
 * carries "Regular Army", "RA", "Army of the United States", "AUS", ...). Each map below
 * declares the aliases for every target choice; anything else falls to the map's `fallback`
 * and the transform records an `unmapped_value` exception so the row still loads and the
 * value shows up on the reconciliation report instead of disappearing.
 *
 * Every map is registered in `VALUE_MAPS` so tests can assert bidirectionally that each alias
 * targets a declared choice and that every choice is reachable (or explicitly listed as
 * "no legacy spelling").
 */
import {
    AWARD_CATALOG,
    AWARD_CODE_MAP,
    AWARD_DEVICES,
    CARRIERS,
    CASE_PRIORITIES,
    ENGRAVING_FONTS,
    FILE_FORMATS,
    HERALDIC_CATEGORIES,
    NOK_RELATIONSHIPS,
    NOTE_TYPES,
    QC_RESULTS,
    REQUESTER_TYPES,
    REQUISITION_PRIORITIES,
    SERVICE_COMPONENTS,
    SERVICE_ERAS,
    SES_FLAG_TYPES,
    SOURCE_AGENCIES,
    UNITS_OF_ISSUE,
} from '../lib/domain'
import { normalizeStatusText } from '../lib/statusMap'

export interface MappedValue {
    value: string
    mapped: boolean
    normalized: string
}

export interface ValueMap {
    name: string
    choices: Readonly<Record<string, string>>
    /** Choice keys that have no legacy spelling by design (new in ServiceNow). */
    targetOnly: readonly string[]
    /** Choice key used when the legacy text has no alias; '' leaves the field empty. */
    fallback: string
    /** Legacy spellings that legitimately mean "no value" and do not raise an exception. */
    blankAliases: readonly string[]
    map: (raw: unknown) => MappedValue
    aliasCount: number
    /** Choice keys reachable from at least one legacy spelling. */
    aliasTargets: readonly string[]
    /** Every normalized legacy spelling → choice key (for documentation generators). */
    aliases: ReadonlyMap<string, string>
}

interface ValueMapSpec {
    name: string
    choices: Readonly<Record<string, string>>
    aliases: Readonly<Record<string, readonly string[]>>
    fallback?: string
    targetOnly?: readonly string[]
    blankAliases?: readonly string[]
    /** Optional pre-normalization (e.g. carrier "USPS Priority Mail" → "USPS"). */
    prepare?: (normalized: string) => string
}

function defineValueMap(spec: ValueMapSpec): ValueMap {
    const index = new Map<string, string>()
    let aliasCount = 0
    for (const [target, variants] of Object.entries(spec.aliases)) {
        if (!(target in spec.choices)) throw new Error(`${spec.name}: alias target "${target}" is not a declared choice`)
        for (const v of variants) {
            const key = normalizeStatusText(v)
            const existing = index.get(key)
            if (existing !== undefined && existing !== target) {
                throw new Error(`${spec.name}: alias "${v}" maps to both ${existing} and ${target}`)
            }
            index.set(key, target)
            aliasCount++
        }
    }
    const blank = new Set((spec.blankAliases ?? ['']).map(normalizeStatusText))
    const fallback = spec.fallback ?? ''
    return {
        name: spec.name,
        choices: spec.choices,
        targetOnly: spec.targetOnly ?? [],
        fallback,
        blankAliases: spec.blankAliases ?? [''],
        aliasCount,
        aliasTargets: [...new Set(index.values())],
        aliases: index,
        map(raw: unknown): MappedValue {
            let normalized = normalizeStatusText(raw)
            if (spec.prepare) normalized = spec.prepare(normalized)
            if (blank.has(normalized)) return { value: fallback, mapped: true, normalized }
            const hit = index.get(normalized)
            if (hit !== undefined) return { value: hit, mapped: true, normalized }
            return { value: fallback, mapped: false, normalized }
        },
    }
}

/** Yes/No/True/False/1/0/Y/N → boolean; unknown text → null so callers can flag it. */
export function parseLegacyBoolean(raw: unknown): boolean | null {
    const n = normalizeStatusText(raw)
    if (n === '') return null
    if (['YES', 'Y', 'TRUE', 'T', '1', 'X', 'CHECKED', 'ON'].includes(n)) return true
    if (['NO', 'N', 'FALSE', 'F', '0', 'UNCHECKED', 'OFF', 'N/A', 'NA'].includes(n)) return false
    return null
}

export const SOURCE_AGENCY_MAP = defineValueMap({
    name: 'source_agency',
    choices: SOURCE_AGENCIES,
    fallback: 'other',
    aliases: {
        hrc: ['HRC', 'AHRC', 'Human Resources Command', 'US Army Human Resources Command', 'HRC Fort Knox', 'Fort Knox'],
        nprc: ['NPRC', 'National Personnel Records Center', 'NARA', 'St. Louis', 'St Louis', 'NPRC St. Louis'],
        congressional: ['Congressional', 'Congressional Inquiry', 'Congressional Liaison', 'OCLL', 'Member Inquiry'],
        manual: ['Manual', 'Manual Entry', 'Walk-in', 'Phone', 'Direct'],
        other: ['Other', 'Unknown', 'Misc'],
    },
})

export const CASE_PRIORITY_MAP = defineValueMap({
    name: 'case_priority',
    choices: CASE_PRIORITIES,
    fallback: 'routine',
    aliases: {
        routine: ['Routine', 'Normal', 'Standard', 'Std', 'R'],
        expedite: ['Expedite', 'Expedited', 'Rush', 'Priority', 'Urgent', 'E'],
        congressional: ['Congressional', 'Congressional Inquiry', 'CI', 'Cong'],
    },
})

export const SERVICE_COMPONENT_MAP = defineValueMap({
    name: 'service_component',
    choices: SERVICE_COMPONENTS,
    fallback: 'other',
    aliases: {
        regular_army: ['Regular Army', 'RA', 'USA', 'Army', 'Active Army', 'Active Duty'],
        army_of_the_united_states: ['Army of the United States', 'AUS', 'Draftee', 'US Army (AUS)'],
        army_reserve: ['Army Reserve', 'USAR', 'US Army Reserve', 'Reserve', 'Reserves'],
        army_national_guard: ['Army National Guard', 'ARNG', 'National Guard', 'NG', 'Guard', 'ARNGUS'],
        army_air_forces: ['Army Air Forces', 'AAF', 'USAAF', 'Air Corps', 'Army Air Corps'],
        womens_army_corps: ["Women's Army Corps", 'WAC', 'Womens Army Corps', 'WAAC'],
        other: ['Other', 'Unknown'],
    },
})

export const SERVICE_ERA_MAP = defineValueMap({
    name: 'service_era',
    choices: SERVICE_ERAS,
    fallback: 'other',
    aliases: {
        world_war_ii: ['World War II', 'WWII', 'WW2', 'WW II', 'World War 2', 'World War Two'],
        korea: ['Korea', 'Korean War', 'Korean Conflict', 'Korea 1950-53'],
        cold_war: ['Cold War', 'Post-Korea', 'Peacetime (Cold War)', 'Cold War Era'],
        vietnam: ['Vietnam', 'Vietnam War', 'Viet Nam', 'RVN', 'Vietnam Era', 'SEA'],
        gulf_war: ['Gulf War', 'Desert Storm', 'Desert Shield', 'Desert Shield/Storm', 'Persian Gulf', 'SWA'],
        global_war_on_terrorism: ['Global War on Terrorism', 'GWOT', 'OEF', 'OIF', 'OND', 'OEF/OIF', 'Iraq/Afghanistan', 'Post-9/11'],
        peacetime: ['Peacetime', 'Peace Time', 'Interwar'],
        other: ['Other', 'Unknown', 'Multiple'],
    },
})

export const RELATIONSHIP_MAP = defineValueMap({
    name: 'requester_relationship',
    choices: NOK_RELATIONSHIPS,
    fallback: 'other_nok',
    aliases: {
        self: ['Self', 'Veteran', 'Self (veteran)', 'Service Member', 'Retiree'],
        spouse: ['Spouse', 'Wife', 'Husband', 'Widow', 'Widower', 'Surviving Spouse'],
        son: ['Son', 'Stepson', 'Son-in-law'],
        daughter: ['Daughter', 'Stepdaughter', 'Daughter-in-law'],
        parent: ['Parent', 'Mother', 'Father', 'Mom', 'Dad'],
        sibling: ['Sibling', 'Brother', 'Sister'],
        grandchild: ['Grandchild', 'Grandson', 'Granddaughter', 'Great-grandson', 'Great-granddaughter'],
        other_nok: ['Other', 'Other NOK', 'Next of Kin', 'NOK', 'Niece', 'Nephew', 'Cousin', 'Executor', 'Estate', 'Friend', 'Researcher', 'Historian'],
        unit: ['Unit', 'Organization', 'Unit / organization', 'Museum', 'VSO', 'Veterans Service Organization'],
    },
})

export const REQUESTER_TYPE_MAP = defineValueMap({
    name: 'requester_type',
    choices: REQUESTER_TYPES,
    fallback: 'next_of_kin',
    aliases: {
        veteran: ['Veteran', 'Self', 'Service Member', 'Retiree', 'Vet'],
        next_of_kin: ['Next of kin', 'NOK', 'Other NOK', 'Family', 'Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Grandchild', 'Other'],
        unit: ['Unit', 'Organization', 'Museum', 'VSO'],
    },
})

const RELATIONSHIP_TO_TYPE: Readonly<Record<string, string>> = { self: 'veteran', unit: 'unit' }

/**
 * Requester type from the free-text Relationship item. The relationship vocabulary is the richer one
 * (Widow, Nephew, Executor, Grandson …), so it is consulted first and collapsed to veteran / unit /
 * next of kin; the direct type spellings are the fallback. `mapped` is false only when neither knows the text.
 */
export function mapRequesterType(relationshipRaw: unknown): MappedValue {
    const rel = RELATIONSHIP_MAP.map(relationshipRaw)
    if (rel.mapped && rel.normalized !== '') {
        return { value: RELATIONSHIP_TO_TYPE[rel.value] ?? 'next_of_kin', mapped: true, normalized: rel.normalized }
    }
    return REQUESTER_TYPE_MAP.map(relationshipRaw)
}

export const QC_RESULT_MAP = defineValueMap({
    name: 'qc_result',
    choices: QC_RESULTS,
    fallback: 'pending',
    aliases: {
        pending: ['Pending', 'Not Checked', 'Awaiting QC', 'In QC'],
        pass: ['Pass', 'Passed', 'OK', 'Good', 'Accepted', 'P'],
        fail_rework: ['Fail', 'Failed', 'Fail - rework', 'Fail/Rework', 'Rework', 'Rejected', 'F'],
    },
})

export const AWARD_DEVICE_MAP = defineValueMap({
    name: 'award_device',
    choices: AWARD_DEVICES,
    fallback: 'none',
    aliases: {
        none: ['None', 'N/A', 'No Device', '-'],
        bronze_oak_leaf_cluster: ['Bronze oak leaf cluster', 'OLC', 'Oak Leaf Cluster', 'BOLC', '1 OLC', '2 OLC', '3 OLC', 'Bronze OLC', 'Oak Leaf Cluster (bronze)'],
        silver_oak_leaf_cluster: ['Silver oak leaf cluster', 'SOLC', 'Silver OLC', 'Oak Leaf Cluster (silver)'],
        v_device: ['"V" device', 'V Device', 'V', 'Valor Device', 'w/V', 'with V'],
        c_device: ['"C" device', 'C Device', 'C', 'Combat Device'],
        r_device: ['"R" device', 'R Device', 'R', 'Remote Device'],
        bronze_service_star: ['Bronze service star', 'Bronze Star (device)', 'BSS', 'Service Star', 'Campaign Star', '1 BSS', '2 BSS', '3 BSS'],
        silver_service_star: ['Silver service star', 'SSS', 'Silver Star (device)'],
        arrowhead: ['Arrowhead', 'Arrowhead Device', 'AH'],
        numeral: ['Numeral', 'Numerals', 'Numeral 2', 'Numeral 3', 'Numeral 4', 'Award Numeral'],
        hourglass: ['Hourglass', 'Hourglass Device', 'Bronze Hourglass', 'Silver Hourglass', 'Gold Hourglass'],
        m_device: ['"M" device', 'M Device', 'M', 'Mobilization Device'],
        clasp: ['Clasp', 'Germany Clasp', 'Japan Clasp', 'Foreign Service Clasp', 'Bar'],
        ten_year_device: ['Ten-year device', '10-year device', '10 Year Device', 'Ten Year Device'],
    },
})

export const ENGRAVING_FONT_MAP = defineValueMap({
    name: 'engraving_font',
    choices: ENGRAVING_FONTS,
    fallback: 'military_block',
    aliases: {
        roman_block: ['Roman block', 'Roman', 'Times', 'Serif Block', 'Roman Caps'],
        script: ['Script', 'Cursive', 'Italic Script', 'Engravers Script'],
        gothic: ['Gothic', 'Old English', 'Blackletter', 'Gothic Caps'],
        military_block: ['Military block', 'Block', 'Standard', 'Std Block', 'Default', 'Mil Block', 'Sans Block'],
    },
})

export const CARRIER_MAP = defineValueMap({
    name: 'carrier',
    choices: CARRIERS,
    fallback: '',
    aliases: {
        usps: ['USPS', 'US Postal Service', 'Postal', 'Priority Mail', 'First Class', 'Registered Mail', 'Certified Mail', 'US Mail', 'Mail'],
        ups: ['UPS', 'United Parcel Service', 'UPS Ground', 'UPS 2nd Day', 'UPS Next Day'],
        fedex: ['FedEx', 'Federal Express', 'FedEx Ground', 'FedEx Express', 'FedEx 2Day', 'FDX'],
        dhl: ['DHL', 'DHL Express'],
        military_courier: ['Military courier', 'Courier', 'Hand Carry', 'Hand Carried', 'Hand Delivered', 'Walk-in Pickup', 'Pickup', 'Picked Up'],
    },
    prepare: (n) => {
        if (n.startsWith('USPS')) return 'USPS'
        if (n.startsWith('UPS')) return 'UPS'
        if (n.startsWith('FEDEX') || n.startsWith('FED EX')) return 'FEDEX'
        if (n.startsWith('DHL')) return 'DHL'
        return n
    },
})

export const NOTE_TYPE_MAP = defineValueMap({
    name: 'note_type',
    choices: NOTE_TYPES,
    fallback: 'migrated',
    aliases: {
        customer_contact: [
            'Customer contact', 'Phone Call - Inbound', 'Phone Call - Outbound', 'Phone Call', 'Phone', 'Call', 'E-mail', 'Email', 'Letter',
            'Congressional Inquiry', 'Congressional', 'NOK Documentation', 'Walk-in', 'Fax', 'Correspondence',
        ],
        internal: ['Internal', 'NPRC Query', 'HRC Query', 'Backorder', 'General', 'Research', 'QC', 'QC Rework', 'Address Correction', 'Engraving', 'Warehouse', 'Supervisor', 'Note'],
        system: ['System', 'Agent', 'Auto', 'Automated', 'Status Change', 'Stage Change'],
        migrated: ['Migrated from legacy', 'Migrated', 'Legacy'],
    },
})

export const HERALDIC_CATEGORY_MAP = defineValueMap({
    name: 'heraldic_category',
    choices: HERALDIC_CATEGORIES,
    fallback: 'accessory',
    aliases: {
        guidon: ['Guidon', 'Guidons', 'Company Guidon', 'Battery Guidon', 'Troop Guidon', 'Detachment Guidon'],
        distinguishing_flag: ['Distinguishing flag', 'Distinguishing Flags', 'Dist Flag', 'General Officer Flag', 'GO Flag', 'Individual Flag'],
        positional_color: ['Positional color', 'Positional Colors', 'Positional Flag', 'Secretary Flag', 'Chief of Staff Flag'],
        organizational_color: ['Organizational color', 'Organizational Colors', 'Org Color', 'Org Colors', 'Colors', 'Regimental Color', 'Battalion Color', 'National Color', 'Unit Colors'],
        streamer: ['Streamer', 'Streamers', 'Campaign Streamer', 'War Service Streamer', 'Unit Decoration Streamer'],
        insignia: ['Insignia', 'Distinctive Unit Insignia', 'DUI', 'SSI', 'Shoulder Sleeve Insignia', 'Crest', 'Unit Crest', 'Badge'],
        automobile_flag: ['Automobile flag', 'Automobile Flags', 'Auto Flag', 'Car Flag', 'Vehicle Flag'],
        tabard: ['Tabard / drape', 'Tabard', 'Drape', 'Tabards', 'Drapes', 'Trumpet Banner'],
        accessory: ['Accessory (finial, cord, tassel, case)', 'Accessory', 'Accessories', 'Appurtenance', 'Appurtenances', 'Finial', 'Cord and Tassel', 'Cord', 'Tassel', 'Case', 'Staff', 'Flagstaff', 'Fringe', 'Other'],
    },
})

export const SES_FLAG_TYPE_MAP = defineValueMap({
    name: 'ses_flag_type',
    choices: SES_FLAG_TYPES,
    fallback: '',
    aliases: {
        indoor: ['Indoor SES flag (4 ft 4 in x 5 ft 6 in)', 'Indoor', 'Indoor Flag', 'Indoor SES Flag', 'Office Flag', 'Indoor 4x6'],
        outdoor: ['Outdoor SES flag (3 ft x 4 ft)', 'Outdoor', 'Outdoor Flag', 'Outdoor SES Flag', 'Outdoor 3x4'],
        automobile: ['Automobile SES flag (12 in x 18 in)', 'Automobile', 'Auto', 'Automobile Flag', 'Auto Flag', 'Car Flag', 'Vehicle'],
        boat: ['Boat SES flag (12 in x 18 in)', 'Boat', 'Boat Flag', 'Watercraft'],
        desk: ['Desk set miniature SES flag', 'Desk', 'Desk Set', 'Desk Flag', 'Miniature', 'Desk Miniature'],
    },
    prepare: (n) => {
        if (n.includes('INDOOR')) return 'INDOOR'
        if (n.includes('OUTDOOR')) return 'OUTDOOR'
        if (n.includes('AUTO') || n.includes('CAR FLAG') || n.includes('VEHICLE')) return 'AUTOMOBILE'
        if (n.includes('BOAT')) return 'BOAT'
        if (n.includes('DESK') || n.includes('MINIATURE')) return 'DESK'
        return n
    },
})

export const UNIT_OF_ISSUE_MAP = defineValueMap({
    name: 'unit_of_issue',
    choices: UNITS_OF_ISSUE,
    fallback: 'EA',
    aliases: {
        EA: ['EA', 'Each', 'Ea.', 'E'],
        PR: ['PR', 'Pair', 'Pairs', 'Pr.'],
        SE: ['SE', 'Set', 'Sets', 'ST'],
        KT: ['KT', 'Kit', 'Kits'],
        PG: ['PG', 'Package', 'Pkg', 'Pk', 'PKG'],
        BX: ['BX', 'Box', 'Boxes'],
        RL: ['RL', 'Roll', 'Rolls'],
    },
})

export const FILE_FORMAT_MAP = defineValueMap({
    name: 'file_format',
    choices: FILE_FORMATS,
    fallback: 'delimited',
    aliases: {
        json: ['JSON'],
        delimited: ['Delimited text', 'Delimited', 'Fixed', 'Fixed Width', 'Fixed-width', 'CSV', 'TXT', 'Text', 'Pipe', 'Tab', 'HRC-FIXED-80', 'NPRC-PIPE', 'HRC Fixed 80', 'NPRC Pipe'],
        dxl: ['Domino DXL', 'DXL', 'Notes'],
    },
    prepare: (n) => {
        if (n.includes('FIXED') || n.includes('DELIM') || n.includes('PIPE') || n.includes('CSV') || n.includes('TAB')) return 'DELIMITED'
        return n
    },
})

/** Legacy `RPD` (requisition priority designator) → two-digit PD 01–15. */
export function mapRequisitionPriority(raw: unknown): MappedValue {
    const normalized = normalizeStatusText(raw)
    if (normalized === '') return { value: '', mapped: true, normalized }
    const digits = normalized.replace(/[^0-9]/g, '')
    const padded = digits.length === 1 ? `0${digits}` : digits
    if (padded in REQUISITION_PRIORITIES) return { value: padded, mapped: true, normalized }
    return { value: '', mapped: false, normalized }
}

/**
 * Legacy `AwardCode` (HRC/NPRC abbreviation) → catalog key. Falls back to matching the
 * award name text against catalog labels, then to `other` (the legacy name is kept on
 * `legacy_award_name` so nothing is lost).
 */
export function mapAwardName(code: unknown, name: unknown): MappedValue {
    const codeText = String(code ?? '').trim().toUpperCase()
    if (codeText) {
        const byCode = AWARD_CODE_MAP[codeText]
        if (byCode) return { value: byCode, mapped: true, normalized: codeText }
    }
    const nameNorm = normalizeStatusText(name)
    if (nameNorm) {
        for (const [key, label] of Object.entries(AWARD_CATALOG)) {
            if (normalizeStatusText(label) === nameNorm) return { value: key, mapped: true, normalized: nameNorm }
        }
    }
    return { value: 'other', mapped: nameNorm === '' && codeText === '', normalized: codeText || nameNorm }
}

/** Registry used by tests and documentation generators. */
export const VALUE_MAPS: readonly ValueMap[] = [
    SOURCE_AGENCY_MAP,
    CASE_PRIORITY_MAP,
    SERVICE_COMPONENT_MAP,
    SERVICE_ERA_MAP,
    RELATIONSHIP_MAP,
    REQUESTER_TYPE_MAP,
    QC_RESULT_MAP,
    AWARD_DEVICE_MAP,
    ENGRAVING_FONT_MAP,
    CARRIER_MAP,
    NOTE_TYPE_MAP,
    HERALDIC_CATEGORY_MAP,
    SES_FLAG_TYPE_MAP,
    UNIT_OF_ISSUE_MAP,
    FILE_FORMAT_MAP,
]

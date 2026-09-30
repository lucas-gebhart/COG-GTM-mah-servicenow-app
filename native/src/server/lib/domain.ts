/**
 * Single source of truth for the MAH *native* (v2) domain vocabularies.
 *
 * v2 keeps v1's business vocabulary (stages, choice lists, thresholds, limits) but maps it onto
 * platform tables: the six work-item tables extend `task`, vendors and source agencies are
 * `core_company` rows, the heraldic / award catalog extends `cmdb_model`, and case notes,
 * migration exceptions and the persisted aging columns are retired in favour of the task
 * journal, Import Set row states and Task SLA.
 *
 * Fluent table definitions, business-rule modules, transform helpers, tooling and documentation
 * generators all import from here so that choice lists, thresholds and prefixes never drift.
 *
 * All data in this application is synthetic; no real personnel, awards or shipments are represented.
 */

export const SCOPE = 'x_cog_mah_native' as const
export const APP_NAME = 'MAH Case Management (Native)' as const

/** Custom tables owned by the native scope. Everything else the app touches is a platform table. */
export const TABLES = {
    awards_case: 'x_cog_mah_native_awards_case',
    award_line: 'x_cog_mah_native_award_line',
    requester: 'x_cog_mah_native_requester',
    authorization_file: 'x_cog_mah_native_authorization_file',
    engraving_job: 'x_cog_mah_native_engraving_job',
    shipment: 'x_cog_mah_native_shipment',
    heraldry_request: 'x_cog_mah_native_heraldry_request',
    request_line: 'x_cog_mah_native_request_line',
    catalog_item: 'x_cog_mah_native_catalog_item',
    ses_flag_request: 'x_cog_mah_native_ses_flag_request',
    status_map: 'x_cog_mah_native_status_map',
} as const

export type DomainTableKey = keyof typeof TABLES
export type DomainTableName = (typeof TABLES)[DomainTableKey]

/** Platform tables the native build reuses instead of defining its own. */
export const PLATFORM_TABLES = {
    task: 'task',
    company: 'core_company',
    model: 'cmdb_model',
    task_sla: 'task_sla',
    contract_sla: 'contract_sla',
    approval: 'sysapproval_approver',
    import_set_row: 'sys_import_set_row',
    import_set: 'sys_import_set',
    import_log: 'import_log',
    attachment: 'sys_attachment',
    journal: 'sys_journal_field',
    user: 'sys_user',
    group: 'sys_user_group',
    board: 'vtb_board',
} as const

/** Custom tables that extend `task` and therefore inherit number / state / active / assignment / journals / SLA / approvals. */
export const TASK_TABLE_KEYS = ['awards_case', 'heraldry_request', 'ses_flag_request', 'engraving_job', 'shipment', 'authorization_file'] as const satisfies readonly DomainTableKey[]
export type TaskTableKey = (typeof TASK_TABLE_KEYS)[number]
export function isTaskTable(key: DomainTableKey): key is TaskTableKey {
    return (TASK_TABLE_KEYS as readonly string[]).includes(key)
}

/** Base table of every custom table (`task`, `cmdb_model`, or standalone). */
export const TABLE_EXTENDS: Readonly<Record<DomainTableKey, string | null>> = {
    awards_case: 'task',
    heraldry_request: 'task',
    ses_flag_request: 'task',
    engraving_job: 'task',
    shipment: 'task',
    authorization_file: 'task',
    award_line: null,
    request_line: null,
    requester: null,
    catalog_item: 'cmdb_model',
    status_map: null,
}

/**
 * v1 artefacts that have no table in v2 and what replaces them. Kept as data so the equivalence
 * matrix, the inventory script and the migration tool agree on the retirement list.
 */
export const RETIRED_V1_TABLES = {
    vendor: { v1: 'x_cog_mah_vendor', replacement: 'core_company (vendor=true) + scoped columns' },
    heraldic_item: { v1: 'x_cog_mah_heraldic_item', replacement: 'x_cog_mah_native_catalog_item extends cmdb_model' },
    case_note: { v1: 'x_cog_mah_case_note', replacement: 'task.work_notes / task.comments (sys_journal_field)' },
    migration_exception: { v1: 'x_cog_mah_migration_exception', replacement: 'sys_import_set_row.state=error|ignored + sys_import_state_comment + import_log' },
} as const

/**
 * Scoped columns added to `core_company` (Table augments). The platform requires the scope
 * prefix on every augmented column, so the logical name is kept here once.
 */
export const COMPANY_FIELDS = {
    cage_code: 'x_cog_mah_native_cage_code',
    legacy_unid: 'x_cog_mah_native_legacy_unid',
    contract_number: 'x_cog_mah_native_contract_number',
    lead_time_days: 'x_cog_mah_native_lead_time_days',
    poc: 'x_cog_mah_native_poc',
    poc_email: 'x_cog_mah_native_poc_email',
    agency_code: 'x_cog_mah_native_agency_code',
    capabilities: 'x_cog_mah_native_capabilities',
    legacy_status_raw: 'x_cog_mah_native_legacy_status_raw',
} as const
export type CompanyFieldKey = keyof typeof COMPANY_FIELDS

/** Field that receives the mapped legacy status on each table (`unmapped` lands here too). */
export const TARGET_STATUS_FIELD: Readonly<Record<DomainTableKey, string>> = {
    awards_case: 'stage',
    award_line: 'status',
    requester: 'state',
    authorization_file: 'stage',
    engraving_job: 'stage',
    shipment: 'stage',
    heraldry_request: 'stage',
    request_line: 'status',
    catalog_item: 'catalog_state',
    ses_flag_request: 'stage',
    status_map: 'state',
}

/**
 * Auto-number prefixes. Task extensions get theirs through the inherited `task.number` /
 * `sys_number` mechanism; the standalone child tables keep a small counter of their own.
 * None of these collide with v1 (MAH, MAL, MAR, MAF, MEJ, MSH, HRQ, HRL, HIT, SES, VND, MSM).
 */
export const NUMBER_PREFIXES = {
    awards_case: 'NMAH',
    award_line: 'NMAL',
    requester: 'NMAR',
    authorization_file: 'NMAF',
    engraving_job: 'NMEJ',
    shipment: 'NMSH',
    heraldry_request: 'NHRQ',
    request_line: 'NHRL',
    ses_flag_request: 'NSES',
    status_map: 'NMSM',
} as const
export const V1_NUMBER_PREFIXES = ['MAH', 'MAL', 'MAR', 'MAF', 'MEJ', 'MSH', 'HRQ', 'HRL', 'HIT', 'SES', 'VND', 'MSM', 'MCN', 'MMX'] as const

/** Legacy Domino form names (the `Form` item on every Notes document). */
export const LEGACY_FORMS = {
    awards_case: 'AwardsCase',
    award_line: 'AwardLine',
    requester: 'Requester',
    authorization_file: 'AuthorizationFile',
    engraving_job: 'EngravingJob',
    shipment: 'ShipmentRecord',
    heraldry_request: 'Request',
    request_line: 'RequestLine',
    catalog_item: 'HeraldicItem',
    ses_flag_request: 'SESFlagRequest',
    vendor: 'Vendor',
    case_note: 'CaseNote',
} as const

export type LegacyForm = (typeof LEGACY_FORMS)[keyof typeof LEGACY_FORMS]

/** Choice list keyed by the legacy form name itself, so `legacy_form` stores the same literal on every table. */
export const LEGACY_FORM_CHOICES = {
    AwardsCase: 'AwardsCase',
    AwardLine: 'AwardLine',
    Requester: 'Requester',
    AuthorizationFile: 'AuthorizationFile',
    EngravingJob: 'EngravingJob',
    ShipmentRecord: 'ShipmentRecord',
    Request: 'Request',
    RequestLine: 'RequestLine',
    HeraldicItem: 'HeraldicItem',
    SESFlagRequest: 'SESFlagRequest',
    Vendor: 'Vendor',
    CaseNote: 'CaseNote',
} as const

// Compile-time shape checks kept out of the object literals so the Fluent parser can resolve them.
const _numberPrefixesCheck: Readonly<Record<Exclude<DomainTableKey, 'catalog_item'>, string>> = NUMBER_PREFIXES
const _legacyFormChoicesCheck: Readonly<Record<LegacyForm, LegacyForm>> = LEGACY_FORM_CHOICES
void _numberPrefixesCheck
void _legacyFormChoicesCheck

/**
 * Native `task.state` values (platform choice list on task). Business stages map onto these so
 * the platform's own `active` handling, "My Work" filters, VTB lanes and task reports work
 * without any custom code: 3/4/7 are the platform close states that flip `active=false`.
 */
export const TASK_STATES = {
    pending: -5,
    open: 1,
    work_in_progress: 2,
    closed_complete: 3,
    closed_incomplete: 4,
    closed_skipped: 7,
} as const
export type TaskStateKey = keyof typeof TASK_STATES

/** Native `task.priority` values used for the legacy Routine / Expedite / Congressional handling priority. */
export const TASK_PRIORITIES = { critical: 1, high: 2, moderate: 3, low: 4, planning: 5 } as const


/** Coarse lifecycle state shared by every domain table. */
export const LIFECYCLE_STATES = {
    open: 'Open',
    closed: 'Closed',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const

/** Requester lifecycle: survivors stay active, coalesced duplicates become merged. */
export const REQUESTER_STATES = {
    active: 'Active',
    merged: 'Merged',
    inactive: 'Inactive',
    unmapped: 'Unmapped',
} as const

/** Catalog-style tables (heraldic items, vendors). */
export const CATALOG_STATES = {
    active: 'Active',
    inactive: 'Inactive',
    unmapped: 'Unmapped',
} as const

export const CASE_STAGES = {
    authorized: 'Authorized',
    engraving: 'Engraving',
    assembly_qc: 'Assembly/QC',
    warehouse: 'Warehouse',
    shipped: 'Shipped',
    closed: 'Closed',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const
export type CaseStage = keyof typeof CASE_STAGES

/** Forward path for an awards case. Cancelled is reachable from any non-terminal stage. */
export const CASE_STAGE_ORDER: readonly CaseStage[] = [
    'authorized',
    'engraving',
    'assembly_qc',
    'warehouse',
    'shipped',
    'closed',
]

/** Stages where a case is finished: `active=false`, aging and SLA clocks stop, no forward transition. */
export const TERMINAL_CASE_STAGES: readonly CaseStage[] = ['closed', 'cancelled']
export function isTerminalCaseStage(stage: string): boolean {
    return (TERMINAL_CASE_STAGES as readonly string[]).includes(stage)
}


/** 60/75-day awards target (amber at 60 days, red at 75 days). In v2 these are Task SLA durations, not persisted columns. */
export const AGING_THRESHOLDS = { amberDays: 60, redDays: 75 } as const

export const SOURCE_AGENCIES = {
    hrc: 'HRC',
    nprc: 'NPRC',
    congressional: 'Congressional inquiry',
    manual: 'Manual entry',
    other: 'Other',
} as const

/** Case handling priority (legacy `Priority` item on AwardsCase / EngravingJob). */
export const CASE_PRIORITIES = {
    routine: 'Routine',
    expedite: 'Expedite',
    congressional: 'Congressional',
} as const
export type CasePriority = keyof typeof CASE_PRIORITIES

/** Veteran component of service (legacy `Branch` item). */
export const SERVICE_COMPONENTS = {
    regular_army: 'Regular Army',
    army_of_the_united_states: 'Army of the United States',
    army_reserve: 'Army Reserve',
    army_national_guard: 'Army National Guard',
    army_air_forces: 'Army Air Forces',
    womens_army_corps: "Women's Army Corps",
    other: 'Other',
} as const

export const SERVICE_ERAS = {
    world_war_ii: 'World War II',
    korea: 'Korea',
    cold_war: 'Cold War',
    vietnam: 'Vietnam',
    gulf_war: 'Gulf War',
    global_war_on_terrorism: 'Global War on Terrorism',
    peacetime: 'Peacetime',
    other: 'Other',
} as const

export const NOK_RELATIONSHIPS = {
    self: 'Self (veteran)',
    spouse: 'Spouse',
    son: 'Son',
    daughter: 'Daughter',
    parent: 'Parent',
    sibling: 'Sibling',
    grandchild: 'Grandchild',
    other_nok: 'Other next of kin',
    unit: 'Unit / organization',
} as const

export const QC_RESULTS = {
    pending: 'Pending',
    pass: 'Pass',
    fail_rework: 'Fail - rework',
} as const
export type SourceAgency = keyof typeof SOURCE_AGENCIES

export const REQUESTER_TYPES = {
    veteran: 'Veteran',
    next_of_kin: 'Next of kin',
    unit: 'Unit',
} as const
export type RequesterType = keyof typeof REQUESTER_TYPES

export const PARSE_STATUSES = {
    received: 'Received',
    parsing: 'Parsing',
    parsed: 'Parsed',
    partial: 'Parsed with errors',
    failed: 'Failed',
    unmapped: 'Unmapped',
} as const

export const FILE_FORMATS = {
    json: 'JSON',
    delimited: 'Delimited text',
    dxl: 'Domino DXL',
} as const

export const NOTE_TYPES = {
    customer_contact: 'Customer contact',
    internal: 'Internal',
    system: 'System',
    migrated: 'Migrated from legacy',
} as const

export const LINE_STATUSES = {
    pending: 'Pending',
    in_progress: 'In progress',
    backordered: 'Backordered',
    complete: 'Complete',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const

export const ENGRAVING_STATUSES = {
    queued: 'Queued',
    in_progress: 'In progress',
    qc_hold: 'QC hold',
    complete: 'Complete',
    rework: 'Rework',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const

export const ENGRAVING_FONTS = {
    roman_block: 'Roman block',
    script: 'Script',
    gothic: 'Gothic',
    military_block: 'Military block',
} as const

export const SHIPMENT_STATUSES = {
    pending: 'Pending',
    label_created: 'Label created',
    in_transit: 'In transit',
    delivered: 'Delivered',
    returned: 'Returned to sender',
    lost: 'Lost / claim filed',
    unmapped: 'Unmapped',
} as const

export const CARRIERS = {
    usps: 'USPS',
    ups: 'UPS',
    fedex: 'FedEx',
    dhl: 'DHL',
    military_courier: 'Military courier',
} as const

export const REQUEST_STATES = {
    draft: 'Draft',
    submitted: 'Submitted',
    in_review: 'In Review',
    released_to_vendor: 'Released to Vendor',
    in_production: 'In Production',
    shipped: 'Shipped',
    complete: 'Complete',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const
export type RequestState = keyof typeof REQUEST_STATES

export const REQUEST_STATE_ORDER: readonly RequestState[] = [
    'draft',
    'submitted',
    'in_review',
    'released_to_vendor',
    'in_production',
    'shipped',
    'complete',
]

/** States where a heraldry request is finished: `active=false`, no forward transition. */
export const TERMINAL_REQUEST_STATES: readonly RequestState[] = ['complete', 'cancelled']
export function isTerminalRequestState(state: string): boolean {
    return (TERMINAL_REQUEST_STATES as readonly string[]).includes(state)
}

export const SES_FLAG_STATES = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    in_production: 'In Production',
    delivered: 'Delivered',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    unmapped: 'Unmapped',
} as const

export const SES_FLAG_TYPES = {
    indoor: 'Indoor SES flag (4 ft 4 in x 5 ft 6 in)',
    outdoor: 'Outdoor SES flag (3 ft x 4 ft)',
    automobile: 'Automobile SES flag (12 in x 18 in)',
    boat: 'Boat SES flag (12 in x 18 in)',
    desk: 'Desk set miniature SES flag',
} as const

/**
 * MILSTRIP priority designators (PD 01-15) as the Force/Activity Designator (F/AD I-V)
 * crossed with the Urgency of Need Designator (UND A/B/C) per DoD 4140.01 / DLM 4000.25.
 */
export const REQUISITION_PRIORITIES = {
    '01': '01 - F/AD I, UND A',
    '02': '02 - F/AD II, UND A',
    '03': '03 - F/AD III, UND A',
    '04': '04 - F/AD I, UND B',
    '05': '05 - F/AD II, UND B',
    '06': '06 - F/AD III, UND B',
    '07': '07 - F/AD IV, UND A',
    '08': '08 - F/AD V, UND A',
    '09': '09 - F/AD IV, UND B',
    '10': '10 - F/AD V, UND B',
    '11': '11 - F/AD I, UND C',
    '12': '12 - F/AD II, UND C',
    '13': '13 - F/AD III, UND C',
    '14': '14 - F/AD IV, UND C',
    '15': '15 - F/AD V, UND C',
} as const

export const HERALDIC_CATEGORIES = {
    guidon: 'Guidon',
    distinguishing_flag: 'Distinguishing flag',
    positional_color: 'Positional color',
    organizational_color: 'Organizational color',
    streamer: 'Streamer',
    insignia: 'Insignia',
    automobile_flag: 'Automobile flag',
    tabard: 'Tabard / drape',
    accessory: 'Accessory (finial, cord, tassel, case)',
} as const

export const UNITS_OF_ISSUE = {
    EA: 'Each',
    PR: 'Pair',
    SE: 'Set',
    KT: 'Kit',
    PG: 'Package',
    BX: 'Box',
    RL: 'Roll',
} as const
export type UnitOfIssue = keyof typeof UNITS_OF_ISSUE

/** Realistic Army decorations, service medals and badges handled by the awards line. */
export const AWARD_CATALOG = {
    distinguished_service_cross: 'Distinguished Service Cross',
    silver_star: 'Silver Star',
    legion_of_merit: 'Legion of Merit',
    distinguished_flying_cross: 'Distinguished Flying Cross',
    soldiers_medal: "Soldier's Medal",
    bronze_star_medal: 'Bronze Star Medal',
    purple_heart: 'Purple Heart',
    meritorious_service_medal: 'Meritorious Service Medal',
    air_medal: 'Air Medal',
    army_commendation_medal: 'Army Commendation Medal',
    army_achievement_medal: 'Army Achievement Medal',
    prisoner_of_war_medal: 'Prisoner of War Medal',
    army_good_conduct_medal: 'Army Good Conduct Medal',
    army_reserve_components_achievement_medal: 'Army Reserve Components Achievement Medal',
    national_defense_service_medal: 'National Defense Service Medal',
    korean_service_medal: 'Korean Service Medal',
    vietnam_service_medal: 'Vietnam Service Medal',
    southwest_asia_service_medal: 'Southwest Asia Service Medal',
    kosovo_campaign_medal: 'Kosovo Campaign Medal',
    afghanistan_campaign_medal: 'Afghanistan Campaign Medal',
    iraq_campaign_medal: 'Iraq Campaign Medal',
    inherent_resolve_campaign_medal: 'Inherent Resolve Campaign Medal',
    global_war_on_terrorism_expeditionary_medal: 'Global War on Terrorism Expeditionary Medal',
    global_war_on_terrorism_service_medal: 'Global War on Terrorism Service Medal',
    korea_defense_service_medal: 'Korea Defense Service Medal',
    armed_forces_service_medal: 'Armed Forces Service Medal',
    humanitarian_service_medal: 'Humanitarian Service Medal',
    military_outstanding_volunteer_service_medal: 'Military Outstanding Volunteer Service Medal',
    armed_forces_reserve_medal: 'Armed Forces Reserve Medal',
    noncommissioned_officer_professional_development_ribbon: 'NCO Professional Development Ribbon',
    army_service_ribbon: 'Army Service Ribbon',
    overseas_service_ribbon: 'Overseas Service Ribbon',
    american_campaign_medal: 'American Campaign Medal',
    asiatic_pacific_campaign_medal: 'Asiatic-Pacific Campaign Medal',
    european_african_middle_eastern_campaign_medal: 'European-African-Middle Eastern Campaign Medal',
    world_war_ii_victory_medal: 'World War II Victory Medal',
    army_of_occupation_medal: 'Army of Occupation Medal',
    combat_infantryman_badge: 'Combat Infantryman Badge',
    combat_medical_badge: 'Combat Medical Badge',
    combat_action_badge: 'Combat Action Badge',
    expert_infantryman_badge: 'Expert Infantryman Badge',
    parachutist_badge: 'Parachutist Badge',
    presidential_unit_citation: 'Presidential Unit Citation (Army)',
    meritorious_unit_commendation: 'Meritorious Unit Commendation',
    medal_of_honor: 'Medal of Honor',
    distinguished_service_medal: 'Distinguished Service Medal',
    american_defense_service_medal: 'American Defense Service Medal',
    armed_forces_expeditionary_medal: 'Armed Forces Expeditionary Medal',
    republic_of_vietnam_campaign_medal: 'Republic of Vietnam Campaign Medal',
    republic_of_vietnam_gallantry_cross_unit_citation: 'Republic of Vietnam Gallantry Cross Unit Citation',
    republic_of_korea_war_service_medal: 'Republic of Korea War Service Medal',
    united_nations_service_medal_korea: 'United Nations Service Medal (Korea)',
    philippine_liberation_medal: 'Philippine Liberation Medal',
    honorable_service_lapel_button: 'Honorable Service Lapel Button',
    gold_star_lapel_button: 'Gold Star Lapel Button',
    other: 'Other (see legacy award name)',
} as const
export type AwardKey = keyof typeof AWARD_CATALOG

/** Legacy `AwardCode` item → catalog key. Codes are the HRC/NPRC authorization-file abbreviations. */
export const AWARD_CODE_MAP: Readonly<Record<string, AwardKey>> = {
    MOH: 'medal_of_honor',
    DSC: 'distinguished_service_cross',
    DSM: 'distinguished_service_medal',
    SS: 'silver_star',
    LM: 'legion_of_merit',
    DFC: 'distinguished_flying_cross',
    SM: 'soldiers_medal',
    BSM: 'bronze_star_medal',
    PH: 'purple_heart',
    MSM: 'meritorious_service_medal',
    AM: 'air_medal',
    ARCOM: 'army_commendation_medal',
    AAM: 'army_achievement_medal',
    POW: 'prisoner_of_war_medal',
    GCM: 'army_good_conduct_medal',
    ARCAM: 'army_reserve_components_achievement_medal',
    NDSM: 'national_defense_service_medal',
    KSM: 'korean_service_medal',
    VSM: 'vietnam_service_medal',
    SWASM: 'southwest_asia_service_medal',
    KCM: 'kosovo_campaign_medal',
    'ACM-A': 'afghanistan_campaign_medal',
    ICM: 'iraq_campaign_medal',
    GWOTEM: 'global_war_on_terrorism_expeditionary_medal',
    GWOTSM: 'global_war_on_terrorism_service_medal',
    KDSM: 'korea_defense_service_medal',
    AFSM: 'armed_forces_service_medal',
    HSM: 'humanitarian_service_medal',
    MOVSM: 'military_outstanding_volunteer_service_medal',
    AFRM: 'armed_forces_reserve_medal',
    NCOPDR: 'noncommissioned_officer_professional_development_ribbon',
    ASR: 'army_service_ribbon',
    OSR: 'overseas_service_ribbon',
    ACM: 'american_campaign_medal',
    APCM: 'asiatic_pacific_campaign_medal',
    EAMECM: 'european_african_middle_eastern_campaign_medal',
    WWIIVM: 'world_war_ii_victory_medal',
    AOM: 'army_of_occupation_medal',
    CIB: 'combat_infantryman_badge',
    CMB: 'combat_medical_badge',
    CAB: 'combat_action_badge',
    EIB: 'expert_infantryman_badge',
    PB: 'parachutist_badge',
    PUC: 'presidential_unit_citation',
    MUC: 'meritorious_unit_commendation',
    ADSM: 'american_defense_service_medal',
    AFEM: 'armed_forces_expeditionary_medal',
    RVNCM: 'republic_of_vietnam_campaign_medal',
    RVNGC: 'republic_of_vietnam_gallantry_cross_unit_citation',
    ROKWSM: 'republic_of_korea_war_service_medal',
    UNSMK: 'united_nations_service_medal_korea',
    PLM: 'philippine_liberation_medal',
    HSLB: 'honorable_service_lapel_button',
    GSLB: 'gold_star_lapel_button',
}

/** Appurtenances / devices worn on the suspension or service ribbon. */
export const AWARD_DEVICES = {
    none: 'None',
    bronze_oak_leaf_cluster: 'Bronze oak leaf cluster',
    silver_oak_leaf_cluster: 'Silver oak leaf cluster',
    v_device: '"V" device',
    c_device: '"C" device',
    r_device: '"R" device',
    bronze_service_star: 'Bronze service star',
    silver_service_star: 'Silver service star',
    arrowhead: 'Arrowhead',
    numeral: 'Numeral',
    hourglass: 'Hourglass',
    m_device: '"M" device',
    clasp: 'Clasp',
    ten_year_device: 'Ten-year device',
} as const

/**
 * Classification vocabulary for Import Set row problems. In v1 every one of these became a row
 * in a custom `migration_exception` table; in v2 they are written as `sys_import_set_row`
 * `state=error|ignored` plus `sys_import_state_comment` / import_log, and this list is the
 * controlled prefix the comment starts with so the import-set reports can group by it.
 */
export const MIGRATION_EXCEPTION_TYPES = {
    orphan_parent: 'Orphaned line (parent UNID not found)',
    unmapped_status: 'Unmapped legacy status',
    invalid_date: 'Unparseable legacy date',
    duplicate_requester: 'Duplicate requester merged',
    invalid_reference: 'Unresolvable reference',
    validation: 'Contract validation failure',
    rejected_row: 'Row rejected by transform',
    unmapped_value: 'Legacy value has no target choice',
    contradictory_source: 'Contradictory legacy source data',
    duplicate_business_key: 'Duplicate legacy business key',
} as const
export type MigrationExceptionType = keyof typeof MIGRATION_EXCEPTION_TYPES

/** Import Set row states the transform scripts leave behind (platform values on sys_import_set_row.state). */
export const IMPORT_ROW_STATES = {
    inserted: 'inserted',
    updated: 'updated',
    ignored: 'ignored',
    error: 'error',
} as const

/** Event registry names (max 40 chars each); fired by business rules, consumed by notifications. SLA breach uses the platform task_sla events. */
export const EVENTS = {
    case_stage_changed: 'x_cog_mah_native.case.stage_changed',
    request_submitted: 'x_cog_mah_native.request.submitted',
    request_released: 'x_cog_mah_native.request.released',
    ses_submitted: 'x_cog_mah_native.ses.submitted',
} as const

export const ROLES = {
    tacom_staff: 'x_cog_mah_native.tacom_staff',
    csr: 'x_cog_mah_native.csr',
    engraver: 'x_cog_mah_native.engraver',
    assembler: 'x_cog_mah_native.assembler',
    warehouse: 'x_cog_mah_native.warehouse',
    vendor: 'x_cog_mah_native.vendor',
    dla: 'x_cog_mah_native.dla',
    admin: 'x_cog_mah_native.admin',
} as const
export type RoleKey = keyof typeof ROLES

/** Legacy Domino ACL role → ServiceNow role. */
export const LEGACY_ROLE_MAP = {
    '[TACOM]': ROLES.tacom_staff,
    '[CSR]': ROLES.csr,
    '[Engraver]': ROLES.engraver,
    '[Assembler]': ROLES.assembler,
    '[Warehouse]': ROLES.warehouse,
    '[Vendor]': ROLES.vendor,
    '[DLA]': ROLES.dla,
    '[Admin]': ROLES.admin,
} as const

/** Assignment groups (sys_user_group) the assignment rules and approvals route to. */
export const GROUPS = {
    tacom: 'MAH Native - TACOM Awards Staff',
    engraving: 'MAH Native - Engraving Shop',
    assembly: 'MAH Native - Assembly and QC',
    warehouse: 'MAH Native - Warehouse',
    vendor_clearfield: 'MAH Native - Vendor Clearfield Colors and Regalia',
} as const
export type GroupKey = keyof typeof GROUPS

/** Field length limits enforced in dictionary, validators and the Import Set intake. */
export const LIMITS = {
    legacyUnid: 32,
    engravingText: 60,
    documentNumber: 14,
    dodaac: 6,
    uic: 6,
    projectCode: 3,
    fundCode: 2,
    justification: 4000,
    name: 100,
    email: 254,
    phone: 25,
    cageCode: 5,
    stockNumber: 16,
    maxQuantity: 999,
    maxLineQuantity: 10_000,
    maxAuthorizationRecords: 5_000,
    maxIntakeBodyBytes: 5242880,
} as const

/** Legacy status text exactly as the released-to-vendor guard reports it to users. */
export const RELEASED_TO_VENDOR_MESSAGE = 'Request has been released to vendor and may not be modified'

/** Task SLA definitions (contract_sla) that replace v1's nightly aging job and its persisted days_in_stage / aging_flag columns. */
export const SLA_DEFINITIONS = {
    amber: { name: 'MAH Native awards case - amber (60d)', days: AGING_THRESHOLDS.amberDays, stage: 'amber' },
    red: { name: 'MAH Native awards case - red (75d)', days: AGING_THRESHOLDS.redDays, stage: 'red' },
} as const
export type SlaKey = keyof typeof SLA_DEFINITIONS

/** Native Import Set API endpoint that replaces v1's Scripted REST intake. */
export const IMPORT_SET_API_BASE = '/api/now/import' as const
export const STAGING_TABLE_PREFIX = 'x_cog_mah_native_stg_' as const
export const INTAKE_STAGING_TABLE = `${STAGING_TABLE_PREFIX}authorization_line` as const
export const INTAKE_IMPORT_PATH = `${IMPORT_SET_API_BASE}/${INTAKE_STAGING_TABLE}` as const

export const DASHBOARD_TITLE = 'MAH Operations (Native)'
export const ENGRAVING_BOARD_TITLE = 'MAH Native - Engraving queue'

/**
 * Business stage → native `task.state`. The stage column keeps the mission vocabulary (and the
 * v1 status map keeps working); the platform state drives `active`, "My Work", VTB lanes and
 * every out-of-the-box task report. `unmapped` stays open so migration repair can find it.
 */
export const TASK_STATE_BY_STAGE: Readonly<Record<TaskTableKey, Readonly<Record<string, TaskStateKey>>>> = {
    awards_case: { authorized: 'open', engraving: 'work_in_progress', assembly_qc: 'work_in_progress', warehouse: 'work_in_progress', shipped: 'work_in_progress', closed: 'closed_complete', cancelled: 'closed_incomplete', unmapped: 'open' },
    heraldry_request: { draft: 'open', submitted: 'pending', in_review: 'pending', released_to_vendor: 'work_in_progress', in_production: 'work_in_progress', shipped: 'work_in_progress', complete: 'closed_complete', cancelled: 'closed_incomplete', unmapped: 'open' },
    ses_flag_request: { draft: 'open', submitted: 'pending', approved: 'work_in_progress', in_production: 'work_in_progress', delivered: 'closed_complete', rejected: 'closed_incomplete', cancelled: 'closed_skipped', unmapped: 'open' },
    engraving_job: { queued: 'open', in_progress: 'work_in_progress', qc_hold: 'pending', rework: 'work_in_progress', complete: 'closed_complete', cancelled: 'closed_incomplete', unmapped: 'open' },
    shipment: { pending: 'open', label_created: 'work_in_progress', in_transit: 'work_in_progress', delivered: 'closed_complete', returned: 'closed_incomplete', lost: 'closed_incomplete', unmapped: 'open' },
    authorization_file: { received: 'open', parsing: 'work_in_progress', parsed: 'closed_complete', partial: 'closed_incomplete', failed: 'closed_incomplete', unmapped: 'open' },
}

/** Native task state (integer) and `active` for a business stage on a task-derived table. */
export function taskStateForStage(table: TaskTableKey, stage: string): { state: number; active: boolean } {
    const key = TASK_STATE_BY_STAGE[table][stage] ?? 'open'
    const state = TASK_STATES[key]
    return { state, active: !(key === 'closed_complete' || key === 'closed_incomplete' || key === 'closed_skipped') }
}

/** Legacy handling priority (Routine / Expedite / Congressional) → native `task.priority`. */
export const TASK_PRIORITY_BY_HANDLING: Readonly<Record<keyof typeof CASE_PRIORITIES, number>> = {
    routine: TASK_PRIORITIES.low,
    expedite: TASK_PRIORITIES.high,
    congressional: TASK_PRIORITIES.critical,
}

/** Kinds of `cmdb_model` rows the catalog extension carries (heraldic items and the award/device catalog). */
export const CATALOG_KINDS = {
    heraldic: 'Heraldic item (DD 1348-6)',
    award: 'Award / decoration',
} as const
export type CatalogKind = keyof typeof CATALOG_KINDS

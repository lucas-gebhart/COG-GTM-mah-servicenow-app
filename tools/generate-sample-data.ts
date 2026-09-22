/**
 * Deterministic miniature of the legacy Domino (HAAS) CSV export used by the migration tooling.
 *
 *   npm run gen:sample-data             # write sample-data/<csvFile> for every LEGACY_FORMS entry + README.md
 *   npm run gen:sample-data -- --check  # exit 1 if any file on disk differs from a fresh generation
 *
 * `generate(seed, clock)` is pure: a seeded PRNG and a fixed clock drive every value, so the same
 * inputs always yield byte-identical files. Headers come from `csvHeader(form)` (including the
 * repeated `ParentUNID` header on AwardLine / CaseNote) and rows are written through the shared
 * RFC 4180 writer in tools/lib/csv.ts.
 *
 * `auditSampleData(files)` re-reads the generated CSV text with the same pure helpers the transform
 * uses (`mapLegacyStatus`, `normalizeLegacyDate`, `computeDedupeKey`, `computeAgingFlag`) and counts
 * every intentional defect. tests/sampleData.test.ts asserts those counts and the README table is
 * rendered from the same audit, so no count is ever hand-typed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseCsv, rowToObject, toCsv } from './lib/csv'
import { csvHeader, LEGACY_FORMS, LOAD_ORDER, sourceKey, stagingColumnMap, type LegacyFormName } from '../src/server/lib/legacyContract'
import { AWARD_CATALOG, AWARD_CODE_MAP, CASE_STAGE_ORDER, LIMITS, type CaseStage } from '../src/server/lib/domain'
import { daysBetween, normalizeLegacyDate, toJulianDate, type NormalizedDate } from '../src/server/lib/dates'
import { computeDedupeKey } from '../src/server/lib/dedupe'
import { mapLegacyStatus } from '../src/server/lib/statusMap'
import { computeAgingFlag, TERMINAL_STAGES } from '../src/server/lib/aging'

export const DEFAULT_SEED = 20260901
export const DEFAULT_CLOCK = '2026-09-01T12:00:00Z'
export const SAMPLE_DIR = fileURLToPath(new URL('../sample-data/', import.meta.url))
export const README_FILE = 'README.md'

export type SampleFiles = Readonly<Record<string, string>>
type Row = Record<string, string>

// ---------------------------------------------------------------------------------------------
// Seeded PRNG (mulberry32) and small helpers
// ---------------------------------------------------------------------------------------------

class Rng {
    private state: number
    constructor(seed: number) {
        this.state = seed >>> 0
    }
    next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0
        let t = this.state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    int(min: number, max: number): number {
        return min + Math.floor(this.next() * (max - min + 1))
    }
    pick<T>(items: readonly T[]): T {
        const v = items[this.int(0, items.length - 1)]
        if (v === undefined) throw new Error('pick() from empty list')
        return v
    }
    chance(p: number): boolean {
        return this.next() < p
    }
    chars(alphabet: string, n: number): string {
        let out = ''
        for (let i = 0; i < n; i++) out += alphabet.charAt(this.int(0, alphabet.length - 1))
        return out
    }
    digits(n: number): string {
        return this.chars('0123456789', n)
    }
    alnum(n: number): string {
        return this.chars('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', n)
    }
}

const at = <T>(items: readonly T[], i: number): T => {
    const v = items[i]
    if (v === undefined) throw new Error(`index ${i} out of range`)
    return v
}

const pad = (n: number, w = 2): string => String(n).padStart(w, '0')
const DAY = 86_400_000
const HOUR = 3_600_000
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const

type DateStyle = 'us' | 'us_dt' | 'iso' | 'compact' | 'notes'

/** Format a UTC instant the way the Notes export writes the given item style. */
function fmt(ms: number, style: DateStyle): string {
    const d = new Date(ms)
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth() + 1
    const day = d.getUTCDate()
    switch (style) {
        case 'us':
            return `${pad(m)}/${pad(day)}/${y}`
        case 'us_dt':
            return `${pad(m)}/${pad(day)}/${y} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
        case 'iso':
            return `${y}-${pad(m)}-${pad(day)}`
        case 'compact':
            return `${y}${pad(m)}${pad(day)}`
        case 'notes':
            return `${pad(day)} ${at(MON, m - 1)} ${String(y).slice(-2)}`
    }
}

const isoDateTime = (ms: number): string => new Date(ms).toISOString().slice(0, 19).replace('T', ' ')
const utc = (y: number, m: number, d: number, hh = 0, mi = 0, ss = 0): number => Date.UTC(y, m - 1, d, hh, mi, ss)
const year = (ms: number): number => new Date(ms).getUTCFullYear()

/** Mixed date styles as they occur in the export: mostly US, with ISO / compact / Notes strays. */
function mixedStyle(rng: Rng): DateStyle {
    const r = rng.next()
    if (r < 0.7) return 'us'
    if (r < 0.82) return 'iso'
    if (r < 0.92) return 'compact'
    return 'notes'
}

/** "MM/DD/YYYY HH:MM | From -> To | Actor" entries the StatusHistory item accumulates. */
function historyEntry(ms: number, from: string, to: string, actor: string): string {
    const d = new Date(ms)
    return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} | ${from} -> ${to} | ${actor}`
}

// ---------------------------------------------------------------------------------------------
// Synthetic vocabularies (no real persons)
// ---------------------------------------------------------------------------------------------

const STAFF = [
    'Lorraine Whitcombe',
    'Dwayne Petrakis',
    'Ret Hamlin',
    'Oswaldo Ferreira-Lund',
    'Cletus Marchbanks',
    'Renata Vasquez-Holm',
    'Yolanda Strickland-Oby',
    'Benedetta Kowalczyk',
    'Ignatius Pardo',
] as const
const cn = (name: string): string => `CN=${name}/OU=CHPSID/O=TACOM`
const AGENT_HRC = 'CN=HRC-Transfer/OU=Agents/O=TACOM'
const AGENT_APP = 'CN=HAAS-APP01/OU=Agents/O=TACOM'
const AGENT_AGING = 'NightlyAging'
const unitCn = (name: string): string => `CN=${name}/OU=Units/O=Army`

const FIRST = [
    'Margaret', 'Jeffrey', 'Tyler', 'Charles', 'Betty', 'John', 'Carol', 'Dolores', 'Raymond', 'Harold', 'Eugene', 'Wanda',
    'Clarence', 'Patricia', 'Walter', 'Gloria', 'Leonard', 'Bernice', 'Marcus', 'Theresa', 'Vernon', 'Lucille', 'Alvin', 'Rosalind',
    'Darnell', 'Yvonne', 'Emmett', 'Marisol', 'Roderick', 'Cassandra', 'Lamont', 'Priscilla', 'Terrence', 'Ines',
] as const
const LAST = [
    'Pettiford', 'Delgadillo', 'Ostrowski', 'Underhill-Voss', 'Nakashima', 'Kirkbride', 'Northway', 'Abernathy', 'Bledsoe', 'Castellanos',
    'Dunmore', 'Ellsworth', 'Fairweather', 'Gutierrez-Lane', 'Hollingsworth', 'Ivester', 'Jarrell', 'Kowalski', 'Lindqvist', 'Marchetti',
    'Nordstrom', 'Okonkwo', 'Pemberton', 'Quintanilla', 'Rasmussen', 'Stroud', 'Thibodeaux', 'Umstead', 'Villarreal', 'Wentworth',
    'Yarbrough', 'Zielinski', 'Brannigan', 'Cotswold', 'Devereaux', 'Fenwick', 'Galloway', 'Haverford', 'Ingersoll', 'Kettering',
    'Lockridge', 'Mabry', 'Oyelaran', 'Prentiss', 'Ruggiero', 'Sandoval', 'Treadwell', 'Vanterpool', 'Whitlock', 'Ybarra',
] as const
const RANKS = ['PVT', 'PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG', 'SFC', 'MSG', '1SG', 'SGM', 'CSM', 'WO1', 'CW2', 'CW3', '2LT', '1LT', 'CPT', 'MAJ', 'LTC', 'COL'] as const
const PLACES: readonly (readonly [string, string, string])[] = [
    ['Columbia', 'SC', '29206'], ['Lawton', 'OK', '73507'], ['Manchester', 'NH', '03104'], ['Killeen', 'TX', '76541'],
    ['Clarksville', 'TN', '37040'], ['Fayetteville', 'NC', '28301'], ['Colorado Springs', 'CO', '80913'], ['Tacoma', 'WA', '98433'],
    ['Warren', 'MI', '48397'], ['Savannah', 'GA', '31405'], ['El Paso', 'TX', '79916'], ['Junction City', 'KS', '66441'],
    ['Hinesville', 'GA', '31313'], ['Watertown', 'NY', '13601'], ['Leesville', 'LA', '71446'], ['Radcliff', 'KY', '40160'],
]
const STREETS = ['Pershing St', 'Armory St', 'Washington St', 'Bradley Ave', 'Sheridan Rd', 'Patton Dr', 'Liberty Ln', 'Eisenhower Blvd', 'Grant Ave', 'Marshall Ct', 'Old Post Rd', 'Cantonment Way'] as const
const RELATIONSHIPS = ['Self', 'Self', 'Self', 'Spouse', 'Widow', 'Son', 'Daughter', 'Grandson', 'Granddaughter', 'Sibling', 'Nephew', 'Executor'] as const
const REQUESTER_SOURCES = ['Web', 'Mail', 'Congressional', 'Phone', 'HRC Transfer', 'Walk-in'] as const
const CONTACT = ['Mail', 'Mail', 'Email', 'Phone'] as const

interface Era {
    name: string
    from: [number, number]
    branches: readonly string[]
    codes: readonly string[]
}
const ERAS: readonly Era[] = [
    { name: 'World War II', from: [1941, 1945], branches: ['Army of the United States', 'Army Air Forces', "Women's Army Corps"], codes: ['ACM', 'APCM', 'EAMECM', 'WWIIVM', 'PH', 'BSM', 'CIB', 'AOM', 'ADSM', 'PLM', 'HSLB'] },
    { name: 'Korean War', from: [1950, 1953], branches: ['Regular Army', 'Army of the United States'], codes: ['KSM', 'NDSM', 'UNSMK', 'ROKWSM', 'PH', 'CIB', 'BSM', 'CMB', 'GCM'] },
    { name: 'Vietnam', from: [1965, 1972], branches: ['Regular Army', 'Army of the United States', 'Army Reserve'], codes: ['VSM', 'NDSM', 'RVNCM', 'RVNGC', 'PH', 'BSM', 'ARCOM', 'AM', 'CIB', 'CMB', 'GCM', 'PB'] },
    { name: 'Cold War', from: [1975, 1989], branches: ['Regular Army', 'Army National Guard', 'Army Reserve'], codes: ['NDSM', 'GCM', 'ARCOM', 'AAM', 'AOM', 'ASR', 'OSR', 'PB', 'EIB', 'NCOPDR', 'ARCAM', 'AFRM', 'HSM'] },
    { name: 'Gulf War', from: [1990, 1991], branches: ['Regular Army', 'Army National Guard', 'Army Reserve'], codes: ['SWASM', 'NDSM', 'ARCOM', 'AAM', 'GCM', 'ASR', 'OSR', 'AFEM', 'BSM', 'MSM'] },
    { name: 'Global War on Terrorism', from: [2002, 2012], branches: ['Regular Army', 'Army National Guard', 'Army Reserve'], codes: ['GWOTSM', 'GWOTEM', 'ICM', 'ACM-A', 'AFSM', 'ARCOM', 'AAM', 'CAB', 'CIB', 'PH', 'BSM', 'MSM', 'KCM', 'KDSM', 'MOVSM'] },
]

const BADGES = new Set(['CIB', 'CMB', 'CAB', 'EIB', 'PB'])
const RIBBONS = new Set(['NCOPDR', 'ASR', 'OSR'])
const UNIT_AWARDS = new Set(['PUC', 'MUC', 'RVNGC'])
const LAPEL = new Set(['HSLB', 'GSLB'])
function awardCategory(code: string): string {
    if (BADGES.has(code)) return 'Badge'
    if (RIBBONS.has(code)) return 'Ribbon'
    if (UNIT_AWARDS.has(code)) return 'Unit Award'
    if (LAPEL.has(code)) return 'Lapel Button'
    return 'Medal'
}
function awardName(code: string): string {
    const key = AWARD_CODE_MAP[code]
    if (key === undefined) throw new Error(`award code ${code} is not in AWARD_CODE_MAP`)
    return AWARD_CATALOG[key]
}
const DEVICES: readonly (readonly [string, number])[] = [['', 0], ['', 0], ['', 0], ['Bronze oak leaf cluster', 1], ['"V" device', 1], ['Bronze service star', 2], ['Arrowhead', 1]]
const SET_TYPES = ['Full Size', 'Full Size', 'Full Size', 'Miniature', 'Full Size + Miniature', 'Ribbon Only'] as const
const AUTHORITIES = ['DD Form 214, block 13', 'DD Form 214, block 24', 'WD AGO Form 53-55', 'NA Form 13038', 'HRC Awards and Decorations Branch letter', 'Permanent Orders 118-04'] as const

const CSR_ROLES = '[TACOM];[CSR];[Admin];[ReadOnlyAudit];LocalDomainServers'
const CSR_AUTHORS = '[TACOM];[CSR];[Admin]'
const HERALDRY_ROLES = '[TACOM];[Admin];[ReadOnlyAudit];LocalDomainServers'

interface Unit {
    name: string
    dodaac: string
    uic: string
    post: string
    city: string
    state: string
    zip: string
}
const UNITS: readonly Unit[] = [
    { name: '3rd Brigade Combat Team, 82nd Airborne Division', dodaac: 'WEKX1S', uic: 'W9LMPA', post: 'Fort Bragg', city: 'Fort Bragg', state: 'NC', zip: '28310' },
    { name: '35th Air Defense Artillery Brigade', dodaac: 'WJMJXA', uic: 'W4RSJA', post: 'Fort Bliss', city: 'El Paso', state: 'TX', zip: '79916' },
    { name: '2nd Battalion, 7th Cavalry Regiment', dodaac: 'W45QBP', uic: 'WAF6AA', post: 'Fort Hood', city: 'Fort Hood', state: 'TX', zip: '76544' },
    { name: '101st Combat Aviation Brigade', dodaac: 'WFTYWM', uic: 'WCE7AA', post: 'Fort Campbell', city: 'Fort Campbell', state: 'KY', zip: '42223' },
    { name: '10th Mountain Division Sustainment Brigade', dodaac: 'WK4GJR', uic: 'W6VDAA', post: 'Fort Drum', city: 'Fort Drum', state: 'NY', zip: '13602' },
    { name: '1st Battalion, 3rd Infantry Regiment (The Old Guard)', dodaac: 'W8ND2A', uic: 'WAAKAA', post: 'Fort Myer', city: 'Arlington', state: 'VA', zip: '22211' },
    { name: '81st Readiness Division (Army Reserve)', dodaac: 'WB8QWH', uic: 'W3TWRA', post: 'Fort Jackson', city: 'Columbia', state: 'SC', zip: '29207' },
    { name: '278th Armored Cavalry Regiment (Tennessee ARNG)', dodaac: 'W7PN3T', uic: 'WPUXAA', post: 'Knoxville Armory', city: 'Knoxville', state: 'TN', zip: '37914' },
    { name: 'U.S. Army Garrison Fort Leonard Wood', dodaac: 'W0YZ6H', uic: 'W2FLAA', post: 'Fort Leonard Wood', city: 'Fort Leonard Wood', state: 'MO', zip: '65473' },
    { name: '7th Infantry Division Headquarters', dodaac: 'W2H7KM', uic: 'WABTAA', post: 'Joint Base Lewis-McChord', city: 'Tacoma', state: 'WA', zip: '98433' },
    { name: '4th Infantry Division Artillery', dodaac: 'W3RC9V', uic: 'WAP2AA', post: 'Fort Carson', city: 'Colorado Springs', state: 'CO', zip: '80913' },
    { name: '1st Cavalry Division Band', dodaac: 'W5TDX4', uic: 'WAFRAA', post: 'Fort Hood', city: 'Fort Hood', state: 'TX', zip: '76544' },
]
const UNIT_ROLES = ['S4 / Supply', 'Property Book Officer', 'Protocol Officer', 'Unit Commander', 'Executive Officer', 'Other'] as const

interface VendorSeed {
    key: string
    name: string
    city: string
    state: string
    poc: string
    products: string
    active: string
}
const VENDORS: readonly VendorSeed[] = [
    { key: '1CLR7', name: 'Clearfield Colors & Regalia, Inc.', city: 'Harrisburg', state: 'PA', poc: 'Richard Quarterman', products: 'Organizational Colors;Positional Colors;Streamers', active: 'Yes' },
    { key: '3SRF2', name: 'Surf City Flag Works LLC', city: 'Wilmington', state: 'NC', poc: 'Dana Whitlock', products: 'Guidons;Organizational Colors', active: 'Yes' },
    { key: '5KSB9', name: 'Keystone Standards & Banners', city: 'Reading', state: 'PA', poc: 'Miriam Ostrander', products: 'Guidons;Distinguishing Flags;Automobile Flags', active: 'Yes' },
    { key: '7GRN1', name: 'Green Mountain Embroidery Co.', city: 'Burlington', state: 'VT', poc: 'Anders Lindqvist', products: 'Insignia;Streamers', active: 'Yes' },
    { key: '8BLU5', name: 'Bluegrass Heraldic Supply', city: 'Lexington', state: 'KY', poc: 'Felicia Mabry', products: 'Positional Colors;Distinguishing Flags;Accessories', active: 'Yes' },
    { key: '1PRQ2', name: 'Prairie Quartermaster Textiles', city: 'Omaha', state: 'NE', poc: 'Gordon Treadwell', products: 'Guidons;Accessories', active: 'No' },
]
/** Referenced by requests, lines and one catalog item but deleted from the Vendor view years ago. */
export const MISSING_VENDOR_KEY = '1K7Q3'

interface ItemSeed {
    nsn: string
    name: string
    category: string
    branch: string
    uoi: string
    cents: number
    maxQty: number
    lead: number
    active: string
}
const ITEMS: readonly ItemSeed[] = [
    { nsn: '8345-01-324-8329', name: 'Guidon, Air Defense Artillery, 20 in x 27-3/4 in, scarlet', category: 'Guidon', branch: 'Air Defense Artillery', uoi: 'EA', cents: 12738, maxQty: 4, lead: 45, active: 'Yes' },
    { nsn: '8345-00-916-5301', name: 'Color, Organizational, Signal Battalion, 3 ft x 4 ft, embroidered', category: 'Organizational Color', branch: 'Signal Corps', uoi: 'EA', cents: 195954, maxQty: 2, lead: 120, active: 'Yes' },
    { nsn: '8345-00-782-3116', name: 'Guidon, Infantry, 20 in x 27-3/4 in, national flag blue', category: 'Guidon', branch: 'Infantry', uoi: 'EA', cents: 11895, maxQty: 6, lead: 45, active: 'Yes' },
    { nsn: '8345-01-118-2274', name: 'Color, Positional, Brigade Command, 3 ft x 4 ft', category: 'Positional Color', branch: 'General', uoi: 'EA', cents: 228726, maxQty: 1, lead: 150, active: 'Yes' },
    { nsn: '8345-00-540-7719', name: 'Streamer, Campaign, Global War on Terrorism, 2-3/4 in x 4 ft', category: 'Streamer', branch: 'General', uoi: 'EA', cents: 6412, maxQty: 12, lead: 30, active: 'Yes' },
    { nsn: '8345-00-541-0032', name: 'Streamer, Campaign, Vietnam, embroidered lettering', category: 'Streamer', branch: 'General', uoi: 'EA', cents: 7180, maxQty: 12, lead: 30, active: 'Yes' },
    { nsn: '8345-01-402-6650', name: 'Flag, Distinguishing, General Officer (Major General), 3 ft x 4 ft', category: 'Distinguishing Flag', branch: 'General', uoi: 'EA', cents: 30223, maxQty: 2, lead: 60, active: 'Yes' },
    { nsn: '8345-01-402-6651', name: 'Flag, Automobile, General Officer (Brigadier General), 12 in x 18 in', category: 'Automobile Flag', branch: 'General', uoi: 'EA', cents: 20475, maxQty: 2, lead: 60, active: 'Yes' },
    { nsn: '8345-00-263-0741', name: 'Guidon, Field Artillery, 20 in x 27-3/4 in, scarlet with crossed cannons', category: 'Guidon', branch: 'Field Artillery', uoi: 'EA', cents: 12115, maxQty: 6, lead: 45, active: 'Yes' },
    { nsn: '8345-00-263-0802', name: 'Guidon, Armor, 20 in x 27-3/4 in, yellow', category: 'Guidon', branch: 'Armor', uoi: 'EA', cents: 12115, maxQty: 6, lead: 45, active: 'Yes' },
    { nsn: '8345-00-118-0445', name: 'Color, Organizational, Aviation Brigade, 3 ft x 4 ft, ultramarine blue and golden orange', category: 'Organizational Color', branch: 'Aviation', uoi: 'EA', cents: 201900, maxQty: 2, lead: 120, active: 'Yes' },
    { nsn: '8345-00-118-0446', name: 'Color, National, 3 ft x 4 ft, embroidered stars, rayon', category: 'Organizational Color', branch: 'General', uoi: 'EA', cents: 84950, maxQty: 2, lead: 90, active: 'Yes' },
    { nsn: '8345-00-753-1106', name: 'Cord and Tassel, Organizational Color, 8 ft 6 in, scarlet and gold', category: 'Accessory', branch: 'General', uoi: 'SE', cents: 9825, maxQty: 4, lead: 30, active: 'Yes' },
    { nsn: '8345-00-753-1210', name: 'Finial, Eagle, Spread, Metal, for 9 ft 6 in staff', category: 'Accessory', branch: 'General', uoi: 'EA', cents: 15640, maxQty: 4, lead: 30, active: 'No' },
    { nsn: '8345-01-077-9938', name: 'Guidon, Military Police, 20 in x 27-3/4 in, green (superseded pattern)', category: 'Guidon', branch: 'Military Police', uoi: 'EA', cents: 11895, maxQty: 6, lead: 45, active: 'No' },
]

// ---------------------------------------------------------------------------------------------
// Generation context
// ---------------------------------------------------------------------------------------------

class Ctx {
    readonly rng: Rng
    readonly clock: number
    private readonly unids = new Set<string>()
    private noteSeq = 0
    constructor(seed: number, clock: string) {
        this.rng = new Rng(seed)
        this.clock = Date.parse(clock)
        if (Number.isNaN(this.clock)) throw new Error(`invalid clock ${clock}`)
    }
    unid(): string {
        for (;;) {
            const u = this.rng.chars('0123456789ABCDEF', LIMITS.legacyUnid)
            if (!this.unids.has(u)) {
                this.unids.add(u)
                return u
            }
        }
    }
    noteId(): string {
        this.noteSeq += 1
        return `NT${pad(this.noteSeq, 6)}`
    }
    staff(): string {
        return cn(this.rng.pick(STAFF))
    }
    /** Common Notes envelope columns shared by every form. */
    envelope(created: number, modified: number, updatedBy: string, parentUnid = '', attachments = ''): Row {
        return {
            UNID: this.unid(),
            NoteID: this.noteId(),
            ParentUNID: parentUnid,
            Created: fmt(created, 'us_dt'),
            Modified: fmt(modified, 'us_dt'),
            LastUpdatedBy: updatedBy,
            Attachments: attachments,
        }
    }
    phone(): string {
        return `(${this.rng.pick(['703', '502', '910', '254', '931', '719', '253', '586', '912', '915', '785', '315'])}) 555-${this.rng.digits(4)}`
    }
    /** A random instant inside [from, to] (UTC ms), on a working hour. */
    when(from: number, to: number): number {
        const day = Math.floor(from / DAY) + this.rng.int(0, Math.max(0, Math.floor((to - from) / DAY)))
        return day * DAY + this.rng.int(7, 17) * HOUR + this.rng.int(0, 59) * 60_000 + this.rng.int(0, 59) * 1000
    }
}

/** Requester identity fields the dedupe helper reads, straight from a keyed CSV row. */
function requesterIdentity(r: Readonly<Row>): { first_name: string; last_name: string; email: string; zip: string } {
    return { first_name: r['FirstName'] ?? '', last_name: r['LastName'] ?? '', email: r['Email'] ?? '', zip: r['ZIP'] ?? '' }
}

/** Positional row for `toCsv` from a keyed row; every key must be a known (disambiguated) header key. */
function positional(form: LegacyFormName, row: Row): string[] {
    const map = stagingColumnMap(form)
    const known = new Set(map.map((c) => c.key))
    for (const k of Object.keys(row)) {
        if (!known.has(k)) throw new Error(`${form}: unknown column ${k}`)
    }
    return map.map((c) => row[c.key] ?? '')
}

// ---------------------------------------------------------------------------------------------
// Domain builders
// ---------------------------------------------------------------------------------------------

interface Person {
    first: string
    last: string
    mi: string
}
function person(ctx: Ctx): Person {
    return { first: ctx.rng.pick(FIRST), last: ctx.rng.pick(LAST), mi: ctx.rng.chance(0.7) ? ctx.rng.chars('ABCDEFGHJKLMNPRSTW', 1) : '' }
}

interface Requester {
    row: Row
    id: string
    person: Person
    relationship: string
    street: string
    city: string
    state: string
    zip: string
}

function buildRequesters(ctx: Ctx): Requester[] {
    const out: Requester[] = []
    const seenKeys = new Set<string>()
    const seenNames = new Set<string>()
    const base = 40
    let seq = 0
    const make = (p: Person, opts: { email?: string; zip?: string; relationship?: string; place?: readonly [string, string, string]; street?: string; mergedInto?: string; suffix?: string; source?: string; created?: number; lastOverride?: string; firstOverride?: string }): Requester => {
        seq += 1
        const id = `RQ${pad(seq, 6)}`
        const place = opts.place ?? ctx.rng.pick(PLACES)
        const zip = opts.zip ?? at(place, 2)
        const created = opts.created ?? ctx.when(utc(2004, 1, 5), ctx.clock - 3 * DAY)
        const relationship = opts.relationship ?? ctx.rng.pick(RELATIONSHIPS)
        const street = opts.street ?? `${ctx.rng.int(100, 9899)} ${ctx.rng.pick(STREETS)}${ctx.rng.chance(0.2) ? ` Apt ${ctx.rng.int(1, 40)}${ctx.rng.chars('ABCD', 1)}` : ''}`
        const first = opts.firstOverride ?? p.first
        const last = opts.lastOverride ?? p.last
        const veteran = relationship === 'Self' ? `${p.first} ${p.mi ? `${p.mi} ` : ''}${p.last}` : `${ctx.rng.pick(FIRST)} ${p.last}`
        const verified = ctx.rng.chance(0.75)
        const row: Row = {
            ...ctx.envelope(created, created + ctx.rng.int(0, 400) * DAY, ctx.staff()),
            RequesterID: id,
            LastName: last,
            Suffix: opts.suffix ?? (ctx.rng.chance(0.08) ? ctx.rng.pick(['Jr.', 'Sr.', 'III']) : ''),
            FirstName: first,
            MI: p.mi,
            Relationship: relationship,
            VeteranName: veteran,
            Street: street,
            City: at(place, 0),
            State: at(place, 1),
            ZIP: zip,
            Phone: ctx.rng.chance(0.85) ? ctx.phone() : '',
            Email: opts.email ?? '',
            PreferredContact: ctx.rng.pick(CONTACT),
            Source: opts.source ?? ctx.rng.pick(REQUESTER_SOURCES),
            CreatedDate: fmt(created, mixedStyle(ctx.rng)),
            AddressVerified: verified ? 'Yes' : 'No',
            AddressVerifiedDate: verified ? fmt(created + ctx.rng.int(0, 5) * DAY, 'us') : '',
            LookupKey: `${last.toUpperCase()}|${first.toUpperCase()}|${zip.slice(0, 5)}`,
            DisplayName: `${last}, ${first}${p.mi ? ` ${p.mi}` : ''}`,
            DocReaders: CSR_ROLES,
            MergedInto: opts.mergedInto ?? '',
        }
        return { row, id, person: { first, last, mi: p.mi }, relationship, street, city: at(place, 0), state: at(place, 1), zip }
    }
    const emailFor = (p: Person): string => `${p.first}.${p.last.replace(/[^A-Za-z]/g, '')}@example.com`.toLowerCase()

    while (out.length < base) {
        const p = person(ctx)
        const nameKey = `${p.first}|${p.last}`
        if (seenNames.has(nameKey)) continue
        const hasEmail = ctx.rng.chance(0.7)
        const r = make(p, hasEmail ? { email: emailFor(p) } : {})
        const key = computeDedupeKey(requesterIdentity(r.row))
        if (key === '' || seenKeys.has(key)) continue
        seenKeys.add(key)
        seenNames.add(nameKey)
        out.push(r)
    }

    // Duplicate groups: the XPage created a new Requester document on every status inquiry.
    const g1 = at(out, 0) // same e-mail, three spellings, one already merged
    const g1Place: readonly [string, string, string] = [g1.city, g1.state, g1.zip]
    const g1Email = emailFor(g1.person)
    g1.row['Email'] = g1Email
    out.push(make(g1.person, { email: g1Email, place: g1Place, zip: `${g1.zip}-${ctx.rng.digits(4)}`, lastOverride: g1.person.last.toUpperCase(), relationship: g1.relationship, source: 'Web', mergedInto: g1.id }))
    out.push(make(g1.person, { email: g1Email, place: g1Place, firstOverride: g1.person.first.slice(0, 4), relationship: g1.relationship, source: 'Web' }))

    const g2 = at(out, 1) // no e-mail on either row; same last name / first initial / ZIP5
    g2.row['Email'] = ''
    out.push(make(g2.person, { place: [g2.city, g2.state, g2.zip], zip: `${g2.zip}-${ctx.rng.digits(4)}`, street: g2.street, relationship: g2.relationship, source: 'Phone', mergedInto: g2.id }))

    const g3 = at(out, 2) // no e-mail; lower-case surname, initial-only first name, different suffix handling
    g3.row['Email'] = ''
    out.push(make(g3.person, { place: [g3.city, g3.state, g3.zip], lastOverride: g3.person.last.toLowerCase(), firstOverride: `${g3.person.first.charAt(0)}.`, suffix: 'Jr.', relationship: g3.relationship, source: 'Mail' }))

    const g4 = at(out, 3) // same e-mail after a move (different ZIP), not yet merged
    const g4Email = emailFor(g4.person)
    g4.row['Email'] = g4Email
    out.push(make(g4.person, { email: g4Email, relationship: g4.relationship, source: 'Congressional' }))

    // Deterministic order independent of construction: sort by RequesterID.
    return out.sort((a, b) => a.id.localeCompare(b.id))
}

interface AuthFile {
    row: Row
    name: string
    agency: string
    date: number
}

function buildAuthFiles(ctx: Ctx): AuthFile[] {
    const specs: readonly { name: string; agency: string; layout: string; date: number; status: string; records: number; cases: number; lines: number; rejected: number; checksum: string; match: string; multiline: boolean }[] = [
        { name: 'HRC_AWD_20260615_7.txt', agency: 'HRC', layout: 'HRC-FIXED-80', date: utc(2026, 6, 15, 5, 12, 40), status: 'Imported with Errors', records: 61, cases: 18, lines: 41, rejected: 2, checksum: '00000061', match: 'No', multiline: false },
        { name: 'nprc_awd_20260701_b30.dat', agency: 'NPRC', layout: 'NPRC-PIPE', date: utc(2026, 7, 1, 6, 2, 11), status: 'Imported with Errors', records: 44, cases: 14, lines: 29, rejected: 1, checksum: 'N/A', match: 'N/A', multiline: true },
        { name: 'HRC_AWD_20260706_2.txt', agency: 'HRC', layout: 'HRC-FIXED-80', date: utc(2026, 7, 6, 5, 9, 3), status: 'Imported', records: 27, cases: 9, lines: 18, rejected: 0, checksum: '00000027', match: 'Yes', multiline: false },
        { name: 'nprc_awd_20260720_b47.dat', agency: 'NPRC', layout: 'NPRC-PIPE', date: utc(2026, 7, 20, 6, 4, 58), status: 'Loaded - Manual', records: 12, cases: 5, lines: 7, rejected: 0, checksum: 'N/A', match: 'N/A', multiline: false },
    ]
    return specs.map((s) => {
        const imported = s.date + 57 * 60_000
        const importedBy = s.status === 'Loaded - Manual' ? cn('Dwayne Petrakis') : AGENT_HRC
        const logLines = [
            `${fmt(s.date, 'us_dt').slice(0, 16)} Import started by ${importedBy}`,
            `${fmt(imported, 'us_dt').slice(0, 16)} ${s.cases} case record(s), ${s.lines} award record(s)`,
            ...(s.rejected ? [`${fmt(imported, 'us_dt').slice(0, 16)} ${s.rejected} record(s) rejected - see ImportLog detail: "SVC_NBR blank, line 17", "award code 'XX' not in table"`] : []),
            `${fmt(imported, 'us_dt').slice(0, 16)} Import finished: ${s.status}`,
        ]
        const row: Row = {
            ...ctx.envelope(s.date, imported, importedBy, '', s.name),
            FileName: s.name,
            SourceAgency: s.agency,
            Layout: s.layout,
            TransmissionDate: fmt(s.date, s.agency === 'NPRC' ? 'iso' : 'us'),
            ReceivedDate: fmt(s.date, 'us_dt'),
            AuthorizationDate: fmt(s.date - ctx.rng.int(2, 6) * DAY, 'us'),
            ImportStatus: s.status,
            ImportedDate: fmt(imported, 'us_dt'),
            ImportedBy: importedBy,
            RecordCount: String(s.records),
            CasesCreated: String(s.cases),
            LinesCreated: String(s.lines),
            RequestersCreated: String(Math.floor(s.cases / 4)),
            RequestersMatched: String(s.cases - Math.floor(s.cases / 4)),
            RecordsRejected: String(s.rejected),
            TrailerChecksum: s.checksum,
            ChecksumMatch: s.match,
            ImportLog: logLines.join(s.multiline ? '\n' : ';'),
            DocReaders: '[Importer];[Admin];[TACOM];[ReadOnlyAudit];LocalDomainServers',
            FileKey: s.name.toUpperCase(),
        }
        return { row, name: s.name, agency: s.agency, date: s.date }
    })
}

type OpenStage = Exclude<CaseStage, 'closed' | 'cancelled' | 'unmapped'>
const STAGE_LABEL: Readonly<Record<OpenStage, string>> = { authorized: 'Authorized', engraving: 'Engraving', assembly_qc: 'Assembly/QC', warehouse: 'Warehouse', shipped: 'Shipped' }
const STAGE_DATE_COLUMN: Readonly<Record<OpenStage, string>> = { authorized: 'EnteredDate', engraving: 'EngravingDate', assembly_qc: 'AssemblyDate', warehouse: 'WarehouseDate', shipped: 'ShippedDate' }
const OPEN_STAGES: readonly OpenStage[] = CASE_STAGE_ORDER.filter((s): s is OpenStage => !TERMINAL_STAGES.has(s))

interface CaseSpec {
    /** Raw Stage text as written by the legacy application. */
    stage: string
    /** Stage the raw text represents for date/line coherence; null for hold/unknown text. */
    mapped: CaseStage | null
    /** Days in current stage at the clock (open cases only). */
    ageDays?: number
    closedWithoutDate?: boolean
    duplicateOf?: number
    multilineHistory?: boolean
    multilineRemarks?: boolean
}

const CLOSED_TEXT = ['Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'Closed', 'CLOSED', 'CLOSED', 'CLOSED', 'closed ', 'closed ', 'closed ', 'Complete', 'Complete', 'closed', 'closed'] as const
const OPEN_TEXT: readonly (readonly [string, OpenStage])[] = [
    ['Authorized', 'authorized'], ['Authorized', 'authorized'], ['Authorized', 'authorized'], ['Authorized', 'authorized'], ['AUTH', 'authorized'],
    ['Engraving', 'engraving'], ['Engraving', 'engraving'], ['Engraving', 'engraving'], ['In Engraving', 'engraving'],
    ['Assembly/QC', 'assembly_qc'], ['Assembly/QC', 'assembly_qc'], ['Assembly/QC', 'assembly_qc'], ['Assembly - QC', 'assembly_qc'],
    ['Warehouse', 'warehouse'], ['Warehouse', 'warehouse'], ['Ready to Ship', 'warehouse'],
    ['Shipped', 'shipped'], ['Shipped', 'shipped'], ['Shipped', 'shipped'], ['Mailed', 'shipped'],
]
/** Days-in-stage for the 20 open cases: 8 green (<60), 6 amber (60-74), 6 red (>=75) at the clock. */
const OPEN_AGES = [3, 11, 19, 27, 35, 44, 52, 58, 60, 63, 66, 69, 72, 74, 75, 82, 97, 118, 140, 203] as const

function caseSpecs(rng: Rng): CaseSpec[] {
    const specs: CaseSpec[] = CLOSED_TEXT.map((stage) => ({ stage, mapped: 'closed' as const }))
    at(specs, 5).closedWithoutDate = true
    specs.push({ stage: 'Cancelled', mapped: 'cancelled' }, { stage: 'CXL', mapped: 'cancelled' })
    const ages = [...OPEN_AGES]
    // Shuffle the ages deterministically so aging buckets are not correlated with stage.
    for (let i = ages.length - 1; i > 0; i--) {
        const j = rng.int(0, i)
        const tmp = at(ages, i)
        ages[i] = at(ages, j)
        ages[j] = tmp
    }
    OPEN_TEXT.forEach(([stage, mapped], i) => specs.push({ stage, mapped, ageDays: at(ages, i) }))
    specs.push({ stage: 'On Hold', mapped: null, ageDays: 41 }, { stage: 'On Hold', mapped: null, ageDays: 88 }, { stage: 'Assy-QC', mapped: null, ageDays: 22 })
    specs.push({ stage: 'Closed', mapped: 'closed', duplicateOf: 7 })
    for (const i of [2, 9, 16, 30]) at(specs, i).multilineHistory = true
    for (const i of [4, 12, 33]) at(specs, i).multilineRemarks = true
    return specs
}

interface AwardsCase {
    row: Row
    unid: string
    caseNumber: string
    stage: CaseStage | null
    veteran: Person
    era: Era
    requester: Requester
    entered: number
    stageEntered: number
    shipped: number | null
    closed: number | null
    engravingRequired: boolean
}

function buildCases(ctx: Ctx, requesters: Requester[], authFiles: AuthFile[]): AwardsCase[] {
    const specs = caseSpecs(ctx.rng)
    const cases: AwardsCase[] = []
    const perYear = new Map<number, number>()
    const nextCaseNumber = (y: number): string => {
        const n = (perYear.get(y) ?? 0) + 1
        perYear.set(y, n)
        return `VMA-${y}-${pad(n, 6)}`
    }

    for (const spec of specs) {
        if (spec.duplicateOf !== undefined) {
            // Same CaseNumber saved twice (replication conflict); second document has its own UNID.
            const orig = at(cases, spec.duplicateOf)
            const row: Row = { ...orig.row, ...ctx.envelope(orig.entered + HOUR, orig.entered + 2 * HOUR, AGENT_APP) }
            row['Remarks'] = 'Replication/save conflict copy - see original document'
            row['LineCount'] = '0'
            cases.push({ ...orig, row, unid: row['UNID'] ?? '', stage: 'closed' })
            continue
        }
        const requester = ctx.rng.pick(requesters)
        const era = ctx.rng.pick(ERAS)
        const veteran: Person = requester.relationship === 'Self' ? requester.person : { first: ctx.rng.pick(FIRST), last: requester.person.last, mi: ctx.rng.chance(0.7) ? ctx.rng.chars('ABCDEFGHJKLMNPRSTW', 1) : '' }
        const deceased = requester.relationship !== 'Self' && ctx.rng.chance(0.8)
        const isOpen = spec.ageDays !== undefined
        const stage: CaseStage | null = spec.mapped
        const effectiveStage: OpenStage = stage !== null && !TERMINAL_STAGES.has(stage) && stage !== 'unmapped' ? (stage as OpenStage) : stage === null ? ctx.rng.pick(['engraving', 'assembly_qc'] as const) : 'shipped'

        // Stage progression instants.
        const gaps: Record<OpenStage, number> = { authorized: 0, engraving: ctx.rng.int(2, 9), assembly_qc: ctx.rng.int(3, 12), warehouse: ctx.rng.int(1, 5), shipped: ctx.rng.int(1, 4) }
        const dates: Partial<Record<OpenStage, number>> = {}
        let engravingRequired = ctx.rng.chance(0.45)
        let entered: number
        let stageEntered: number
        if (isOpen) {
            stageEntered = ctx.clock - (spec.ageDays ?? 0) * DAY - ctx.rng.int(0, 3) * HOUR - ctx.rng.int(0, 59) * 60_000
            let t = stageEntered
            const idx = OPEN_STAGES.indexOf(effectiveStage)
            for (let i = idx; i >= 0; i--) {
                const s = at(OPEN_STAGES, i)
                dates[s] = t
                t -= (i > 0 ? gaps[s] || 1 : 0) * DAY + ctx.rng.int(1, 6) * HOUR
            }
            entered = dates.authorized ?? stageEntered
            if (effectiveStage !== 'authorized' && effectiveStage !== 'engraving' && dates.engraving !== undefined && !engravingRequired) delete dates.engraving
            if (effectiveStage === 'engraving') engravingRequired = true
        } else {
            entered = ctx.when(utc(2004, 2, 1), utc(2026, 5, 20))
            let t = entered
            for (const s of OPEN_STAGES) {
                if (s !== 'authorized') t += gaps[s] * DAY + ctx.rng.int(1, 6) * HOUR
                dates[s] = t
            }
            if (!engravingRequired) delete dates.engraving
            stageEntered = t
        }
        const isClosed = stage === 'closed'
        const isCancelled = stage === 'cancelled'
        const closed = isClosed ? stageEntered + ctx.rng.int(5, 14) * DAY : isCancelled ? entered + ctx.rng.int(2, 20) * DAY : null
        if (isCancelled) {
            delete dates.engraving
            delete dates.assembly_qc
            delete dates.warehouse
            delete dates.shipped
        }
        const y = year(entered)
        const caseNumber = nextCaseNumber(y)
        const source = y >= 2026 && ctx.rng.chance(0.85) ? ctx.rng.pick(authFiles) : null
        const authFileName = source ? source.name : ctx.rng.chance(0.85) ? `${ctx.rng.chance(0.5) ? 'HRC_AWD' : 'nprc_awd'}_${fmt(entered - ctx.rng.int(3, 30) * DAY, 'compact')}_${ctx.rng.int(1, 9)}.${ctx.rng.chance(0.5) ? 'txt' : 'dat'}` : ''
        const agency = source ? source.agency : authFileName ? (authFileName.startsWith('HRC') ? 'HRC' : 'NPRC') : ctx.rng.pick(['Congressional', 'Manual Entry'])
        const authDate = entered - ctx.rng.int(1, 45) * DAY
        const serviceFrom = utc(era.from[0], ctx.rng.int(1, 12), ctx.rng.int(1, 28))
        const serviceTo = serviceFrom + ctx.rng.int(2, 6) * 365 * DAY
        const csr = ctx.staff()
        const finalStageText = isClosed ? 'Closed' : isCancelled ? 'Cancelled' : spec.stage

        const history: string[] = [historyEntry(entered, '(new)', 'Authorized', agency === 'HRC' || agency === 'NPRC' ? 'HRC-Transfer' : ctx.rng.pick(STAFF))]
        let prev = 'Authorized'
        for (const s of OPEN_STAGES) {
            if (s === 'authorized') continue
            const d = dates[s]
            if (d === undefined) continue
            if (!isOpen || OPEN_STAGES.indexOf(s) <= OPEN_STAGES.indexOf(effectiveStage)) {
                history.push(historyEntry(d, prev, STAGE_LABEL[s], ctx.rng.pick(STAFF)))
                prev = STAGE_LABEL[s]
            }
        }
        if (closed !== null) history.push(historyEntry(closed, prev, finalStageText, ctx.rng.pick(STAFF)))
        if (stage === null) history.push(historyEntry(stageEntered, prev, spec.stage, ctx.rng.pick(STAFF)))
        const daysInStage = isOpen ? daysBetween(isoDateTime(stageEntered), isoDateTime(ctx.clock)) : 0
        const agingFlag = isOpen && stage !== null ? computeAgingFlag(daysInStage, stage) : 'green'
        if (isOpen && agingFlag !== 'green') history.push(historyEntry(ctx.clock - 9.5 * HOUR, 'AgingFlag', `${agingFlag === 'red' ? 'Red' : 'Amber'} (${daysInStage} days)`, AGENT_AGING))
        const modified = closed ?? (isOpen ? stageEntered : entered)
        const remarks = spec.multilineRemarks
            ? `Requester called ${fmt(stageEntered - 2 * DAY, 'us')}: "Where is my father's ${awardName(at(era.codes, 0))}?"\nAdvised 60-day service target, case currently ${finalStageText}.\nPer CSR: "will call back Monday", see CaseNote.`
            : ctx.rng.chance(0.2)
              ? ctx.rng.pick(['Replacement set - original lost in house fire', 'Congressional interest - Rep. staffer follow-up', 'Ship to NOK address, not veteran address of record', 'Verify spelling against DD 214 before engraving'])
              : ''
        const shipTo = requester
        const row: Row = {
            ...ctx.envelope(entered, modified, isOpen ? AGENT_APP : ctx.staff(), '', ctx.rng.chance(0.15) ? 'DD214_redacted.pdf' : ''),
            CaseNumber: caseNumber,
            Stage: spec.stage,
            Source: agency,
            AuthFileName: authFileName,
            AuthFileLine: authFileName ? String(ctx.rng.int(1, 240)) : '',
            AuthorizationDate: fmt(authDate, mixedStyle(ctx.rng)),
            EnteredDate: fmt(entered, 'us'),
            EnteredBy: agency === 'HRC' || agency === 'NPRC' ? AGENT_HRC : csr,
            Priority: ctx.rng.chance(0.8) ? 'Routine' : ctx.rng.pick(['Expedite', 'Congressional']),
            ServiceNumber: `***-**-${ctx.rng.digits(4)}`,
            VeteranLastName: veteran.last,
            VeteranFirstName: veteran.first,
            VeteranMI: veteran.mi,
            VeteranRank: ctx.rng.pick(RANKS),
            Branch: ctx.rng.pick(era.branches),
            ServiceFrom: fmt(serviceFrom, ctx.rng.chance(0.8) ? 'us' : 'notes'),
            ServiceTo: fmt(serviceTo, ctx.rng.chance(0.8) ? 'us' : 'notes'),
            Era: era.name,
            Deceased: deceased ? 'Yes' : 'No',
            RequesterKey: requester.id,
            RequesterName: `${requester.person.first} ${requester.person.last}`,
            Relationship: requester.relationship,
            AssignedCSR: csr,
            LineCount: '0',
            EngravingRequired: engravingRequired ? 'Yes' : 'No',
            EngravingDate: dates.engraving !== undefined ? fmt(dates.engraving, 'us_dt') : '',
            EngravingJobNumber: '',
            AssemblyDate: dates.assembly_qc !== undefined ? fmt(dates.assembly_qc, 'us_dt') : '',
            QCResult: dates.assembly_qc !== undefined ? (dates.warehouse !== undefined ? 'Pass' : ctx.rng.pick(['Pending', 'Pass', 'Fail - rework'])) : '',
            WarehouseDate: dates.warehouse !== undefined ? fmt(dates.warehouse, 'us_dt') : '',
            PickBin: dates.warehouse !== undefined ? `${ctx.rng.chars('ABCDEFG', 1)}${ctx.rng.int(1, 24)}-${ctx.rng.int(1, 6)}` : '',
            ShippedDate: dates.shipped !== undefined ? fmt(dates.shipped, 'us_dt') : '',
            TrackingNumber: dates.shipped !== undefined ? `9405 5${ctx.rng.digits(3)} ${ctx.rng.digits(4)} ${ctx.rng.digits(4)} ${ctx.rng.digits(4)} ${ctx.rng.digits(2)}` : '',
            ClosedDate: closed !== null && !spec.closedWithoutDate ? fmt(closed, 'us_dt') : '',
            DaysOpen: String(daysBetween(isoDateTime(entered), isoDateTime(closed ?? ctx.clock))),
            AgingFlag: agingFlag === 'green' ? '' : agingFlag === 'amber' ? 'Amber' : 'Red',
            HoldReason: spec.stage === 'On Hold' ? ctx.rng.pick(['Award eligibility query sent to HRC', 'Backorder - Purple Heart full-size out of stock']) : '',
            StageBeforeHold: spec.stage === 'On Hold' ? STAGE_LABEL[effectiveStage] : '',
            ShipToName: `${shipTo.person.first} ${shipTo.person.last}`,
            ShipToStreet: shipTo.street,
            ShipToCity: shipTo.city,
            ShipToState: shipTo.state,
            ShipToZIP: shipTo.zip,
            Remarks: remarks,
            StatusHistory: history.join(spec.multilineHistory ? '\n' : ';'),
            DocReaders: `${CSR_ROLES};${csr}`,
            DocAuthors: CSR_AUTHORS,
            LookupKey: `${veteran.last.toUpperCase()}|${veteran.first.toUpperCase()}|${shipTo.zip.slice(0, 5)}`,
            DaysInStage: String(daysInStage),
            LastModifiedBy: ctx.staff(),
            LastModifiedDate: fmt(modified, 'us_dt'),
            AgingLastEval: isOpen ? fmt(ctx.clock - 9.5 * HOUR, 'us_dt') : '',
        }
        cases.push({ row, unid: row['UNID'] ?? '', caseNumber, stage, veteran, era, requester, entered, stageEntered, shipped: dates.shipped ?? null, closed, engravingRequired })
    }
    // One authorization date the Notes agent could never have produced.
    at(cases, 21).row['AuthorizationDate'] = '13/45/2026'
    return cases
}

interface AwardLine {
    row: Row
    parent: AwardsCase | null
}

function lineStatusFor(ctx: Ctx, c: AwardsCase): string {
    switch (c.stage) {
        case 'closed':
            return ctx.rng.pick(['Shipped', 'Shipped', 'Complete', 'COMPLETE', 'Closed'])
        case 'cancelled':
            return ctx.rng.pick(['Cancelled', 'Void'])
        case 'authorized':
            return ctx.rng.pick(['Authorized', 'Pending', 'Open'])
        case 'engraving':
            return ctx.rng.pick(['Engraving', 'In Progress'])
        case 'assembly_qc':
            return ctx.rng.pick(['Assembly', 'Picked'])
        case 'warehouse':
            return 'Picked'
        case 'shipped':
            return 'Shipped'
        default:
            return 'In Progress'
    }
}

function buildLines(ctx: Ctx, cases: AwardsCase[]): AwardLine[] {
    const lines: AwardLine[] = []
    const distinct = cases.filter((c, i) => cases.findIndex((o) => o.caseNumber === c.caseNumber) === i)
    const perCase = new Map<AwardsCase, number>(distinct.map((c) => [c, 1]))
    let extra = 116 - distinct.length
    while (extra > 0) {
        const c = ctx.rng.pick(distinct)
        const n = perCase.get(c) ?? 1
        if (n >= 5) continue
        perCase.set(c, n + 1)
        extra -= 1
    }
    const engraveText = (c: AwardsCase): string => `${c.veteran.first.charAt(0)}. ${c.veteran.mi ? `${c.veteran.mi}. ` : ''}${c.veteran.last}`.toUpperCase()

    const makeLine = (c: AwardsCase, lineNo: number, code: string, opts: { status?: string; qty?: number; engraving?: string; parentUnid?: string; parentUnid2?: string } = {}): AwardLine => {
        const status = opts.status ?? lineStatusFor(ctx, c)
        const engrave = c.engravingRequired && !BADGES.has(code) && !RIBBONS.has(code) && ctx.rng.chance(0.7)
        const [device, deviceCount] = ctx.rng.pick(DEVICES)
        const backordered = mapLegacyStatus('AwardLine', status).value === 'backordered'
        const modified = c.closed ?? c.stageEntered
        const parentUnid = opts.parentUnid ?? c.unid
        const row: Row = {
            ...ctx.envelope(c.entered + ctx.rng.int(1, 30) * 60_000, modified, ctx.staff(), parentUnid),
            ParentCaseNumber: c.caseNumber,
            [sourceKey('ParentUNID', 2)]: opts.parentUnid2 ?? parentUnid,
            VeteranName: `${c.veteran.last}, ${c.veteran.first}`,
            LineNumber: String(lineNo),
            AwardName: awardName(code),
            AwardCode: code,
            AwardCategory: awardCategory(code),
            Quantity: String(opts.qty ?? (ctx.rng.chance(0.9) ? 1 : 2)),
            SetType: ctx.rng.pick(SET_TYPES),
            Devices: device,
            DeviceCount: String(deviceCount),
            Engrave: engrave || opts.engraving !== undefined ? 'Yes' : 'No',
            EngravingText: opts.engraving ?? (engrave ? engraveText(c) : ''),
            StockNumber: `8455-${ctx.rng.chance(0.7) ? '00' : '01'}-${ctx.rng.digits(3)}-${ctx.rng.digits(4)}`,
            LineStatus: status,
            BackorderETA: backordered ? fmt(ctx.clock + ctx.rng.int(10, 60) * DAY, 'us') : '',
            Authority: ctx.rng.pick(AUTHORITIES),
            DocReaders: `${CSR_ROLES};${ctx.staff()}`,
            LineKey: `${c.caseNumber}|${pad(lineNo)}`,
        }
        return { row, parent: c }
    }

    for (const c of distinct) {
        const n = perCase.get(c) ?? 1
        const codes = [...c.era.codes]
        for (let i = 1; i <= n; i++) {
            const idx = ctx.rng.int(0, codes.length - 1)
            const code = at(codes, idx)
            codes.splice(idx, 1)
            lines.push(makeLine(c, i, code))
        }
        c.row['LineCount'] = String(n)
    }
    const open = distinct.filter((c) => c.stage !== null && !TERMINAL_STAGES.has(c.stage))
    const openWithLines = (min: number): AwardsCase[] => open.filter((c) => (perCase.get(c) ?? 0) >= min)

    // Backorders on three open lines.
    for (const c of openWithLines(2).slice(0, 3)) {
        const l = lines.find((x) => x.parent === c)
        if (l) {
            l.row['LineStatus'] = ctx.rng.pick(['Backordered', 'B/O'])
            l.row['BackorderETA'] = fmt(ctx.clock + ctx.rng.int(10, 60) * DAY, 'us')
        }
    }
    // Two statuses the status map has never seen.
    const unmappedTargets = openWithLines(3).slice(0, 2)
    const u0 = lines.filter((x) => x.parent === at(unmappedTargets, 0))
    const u1 = lines.filter((x) => x.parent === at(unmappedTargets, 1))
    at(u0, 1).row['LineStatus'] = 'Pending Pick'
    at(u1, 1).row['LineStatus'] = 'Hold'
    for (const l of [at(u0, 1), at(u1, 1)]) l.row['BackorderETA'] = ''
    // Quantity above the allowed maximum (typed 1000 instead of 1).
    at(u0, 0).row['Quantity'] = String(LIMITS.maxQuantity + 1)
    // Engraving text keyed in mixed case on two lines.
    const engraved = lines.filter((x) => x.row['Engrave'] === 'Yes' && x.parent?.stage === 'engraving')
    const lowerTargets = engraved.length >= 2 ? engraved.slice(0, 2) : lines.filter((x) => x.row['Engrave'] === 'Yes').slice(0, 2)
    for (const l of lowerTargets) {
        const c = l.parent
        if (c) l.row['EngravingText'] = `${c.veteran.first.charAt(0)}. ${c.veteran.mi ? `${c.veteran.mi.toLowerCase()}. ` : ''}${c.veteran.last}`
    }
    // Envelope ParentUNID and the form's own ParentUNID item disagree on two lines.
    const closedCases = distinct.filter((c) => c.stage === 'closed')
    for (const [i, c] of closedCases.slice(0, 2).entries()) {
        const l = lines.find((x) => x.parent === c)
        if (l) l.row[sourceKey('ParentUNID', 2)] = at(closedCases, 10 + i).unid
    }
    // Same LineKey saved twice (second document, same key).
    const dupSource = at(lines.filter((x) => x.parent?.stage === 'closed'), 5)
    const dupParent = dupSource.parent
    if (dupParent) {
        const copy = makeLine(dupParent, Number(dupSource.row['LineNumber']), dupSource.row['AwardCode'] ?? 'BSM', { status: dupSource.row['LineStatus'] ?? 'Shipped' })
        copy.row['Engrave'] = dupSource.row['Engrave'] ?? 'No'
        copy.row['EngravingText'] = dupSource.row['EngravingText'] ?? ''
        copy.row['Quantity'] = dupSource.row['Quantity'] ?? '1'
        lines.push(copy)
    }
    // Orphans: parent case documents were purged by the yearly archive agent.
    for (const [i, yr] of [2011, 2014, 2018].entries()) {
        const ghost: AwardsCase = {
            ...at(closedCases, i),
            unid: ctx.unid(),
            caseNumber: `VMA-${yr}-${pad(400 + i * 7, 6)}`,
            veteran: person(ctx),
        }
        lines.push({ ...makeLine(ghost, 1, ctx.rng.pick(ghost.era.codes), { status: 'Shipped' }), parent: null })
    }
    return lines
}

function buildEngravingJobs(ctx: Ctx, cases: AwardsCase[], lines: AwardLine[]): Row[] {
    const jobs: Row[] = []
    const candidates = cases.filter((c, i) => c.engravingRequired && cases.findIndex((o) => o.caseNumber === c.caseNumber) === i)
    const statuses = ['Complete', 'Complete', 'Complete', 'Complete', 'Complete', 'Completed', 'Done', 'Complete', 'Queued', 'In Progress', 'Rework', 'QC Hold', 'Awaiting Proof', 'Machine Down'] as const
    const perYear = new Map<number, number>()
    const jobNumber = (y: number): string => {
        const n = (perYear.get(y) ?? 0) + 1
        perYear.set(y, n)
        return `ENG-${y}-${pad(n, 5)}`
    }
    const openFirst = [...candidates].sort((a, b) => Number(a.closed === null ? 0 : 1) - Number(b.closed === null ? 0 : 1))
    const make = (c: AwardsCase, status: string, orphan: boolean): Row => {
        const mapped = mapLegacyStatus('EngravingJob', status).value
        const queued = c.row['EngravingDate'] ? c.stageEntered - ctx.rng.int(0, 3) * DAY : c.entered + 2 * DAY
        const started = mapped === 'queued' ? null : queued + ctx.rng.int(1, 4) * DAY
        const completed = mapped === 'complete' ? (started ?? queued) + ctx.rng.int(1, 9) * DAY : null
        const items = lines.filter((l) => l.parent === c && l.row['Engrave'] === 'Yes').map((l) => `${l.row['AwardName']} :: ${l.row['EngravingText']}`)
        const text = items.length ? (at(items, 0).split(' :: ')[1] ?? '') : `${c.veteran.first.charAt(0)}. ${c.veteran.last}`.toUpperCase()
        const engraver = ctx.staff()
        const number = jobNumber(year(queued))
        if (!orphan) c.row['EngravingJobNumber'] = number
        const notes = status === 'Rework'
            ? `Proof rejected by QC: "DELGADILLO" spelled "DELGADILO", line 2.\nRe-cut on Laser-2, second proof attached.`
            : status === 'Machine Down'
              ? 'Laser-1 controller fault, awaiting field service'
              : ''
        return {
            ...ctx.envelope(queued, completed ?? started ?? queued, engraver),
            JobNumber: number,
            CaseNumber: orphan ? `VMA-2018-000412` : c.caseNumber,
            VeteranName: `${c.veteran.last}, ${c.veteran.first}`,
            JobStatus: status,
            Priority: c.row['Priority'] ?? 'Routine',
            Items: items.length ? items.join(';') : `${awardName(at(c.era.codes, 0))} :: ${text}`,
            EngravingText: text,
            Font: ctx.rng.pick(['Block', 'Block', 'Roman', 'Script']),
            Machine: ctx.rng.pick(['Laser-1', 'Laser-2', 'Rotary-A']),
            ProofChecked: mapped === 'queued' ? '' : 'Spelling verified against authorization record;Award matches line item',
            QueuedDate: fmt(queued, 'us_dt'),
            StartedDate: started !== null ? fmt(started, 'us_dt') : '',
            CompletedDate: completed !== null ? fmt(completed, 'us_dt') : '',
            Engraver: engraver,
            ReworkCount: status === 'Rework' ? '1' : '0',
            Notes: notes,
            DocReaders: CSR_ROLES,
            DaysInQueue: String(daysBetween(isoDateTime(queued), isoDateTime(started ?? ctx.clock))),
        }
    }
    statuses.forEach((status, i) => {
        const mapped = mapLegacyStatus('EngravingJob', status).value
        const pool = mapped === 'complete' ? openFirst.filter((c) => c.closed !== null || c.stage === 'assembly_qc' || c.stage === 'warehouse' || c.stage === 'shipped') : openFirst.filter((c) => c.stage === 'engraving' || c.stage === null)
        const c = at(pool.length ? pool : openFirst, i % Math.max(1, pool.length))
        jobs.push(make(c, status, false))
    })
    jobs.push(make(at(openFirst, openFirst.length - 1), 'Complete', true))
    return jobs
}

function buildShipments(ctx: Ctx, cases: AwardsCase[], lines: AwardLine[]): Row[] {
    const shipped = cases.filter((c, i) => c.shipped !== null && (c.stage === 'closed' || c.stage === 'shipped') && cases.findIndex((o) => o.caseNumber === c.caseNumber) === i)
    const statuses: string[] = [
        ...Array<string>(27).fill('Delivered'), 'DELIVERED', 'DELIVERED', 'Complete', 'Complete', 'In Transit', 'In Transit', 'Shipped', 'Shipped', 'Returned', 'Label Created', 'Out for Delivery', 'Awaiting Pickup',
    ]
    const perYear = new Map<number, number>()
    const shipmentNumber = (y: number): string => {
        const n = (perYear.get(y) ?? 0) + 1
        perYear.set(y, n)
        return `SHP-${y}-${pad(n, 6)}`
    }
    const out: Row[] = []
    const make = (c: AwardsCase, status: string, partial: boolean, opts: { orphan?: boolean; noDelivered?: boolean; badShipDate?: boolean } = {}): Row => {
        const mapped = mapLegacyStatus('ShipmentRecord', status).value
        const shippedAt = (c.shipped ?? c.stageEntered) + (partial ? ctx.rng.int(3, 20) * DAY : 0)
        const picked = shippedAt - ctx.rng.int(1, 2) * DAY
        const delivered = mapped === 'delivered' || mapped === 'returned' ? shippedAt + ctx.rng.int(3, 9) * DAY : null
        const lineCount = lines.filter((l) => l.parent === c).length
        const notesStyle = ctx.rng.chance(0.15)
        const shipper = ctx.staff()
        const carrier = ctx.rng.pick(['USPS Priority', 'USPS Priority', 'USPS Priority', 'USPS Registered Mail', 'FedEx Ground', 'UPS Ground'])
        return {
            ...ctx.envelope(picked, delivered ?? shippedAt, shipper),
            ShipmentNumber: shipmentNumber(year(shippedAt)),
            CaseNumber: opts.orphan ? 'VMA-2016-000094' : c.caseNumber,
            Partial: partial ? 'Yes' : 'No',
            ShipToName: c.row['ShipToName'] ?? '',
            ShipToStreet: c.row['ShipToStreet'] ?? '',
            ShipToCity: c.row['ShipToCity'] ?? '',
            ShipToState: c.row['ShipToState'] ?? '',
            ShipToZIP: c.row['ShipToZIP'] ?? '',
            Carrier: carrier,
            TrackingNumber: mapped === 'pending' ? '' : carrier.startsWith('USPS') ? `9405 5${ctx.rng.digits(3)} ${ctx.rng.digits(4)} ${ctx.rng.digits(4)} ${ctx.rng.digits(4)} ${ctx.rng.digits(2)}` : `1Z${ctx.rng.alnum(16)}`,
            ShipStatus: status,
            PickedDate: fmt(picked, 'us_dt'),
            ShippedDate: opts.badShipDate ? 'N/A' : fmt(shippedAt, notesStyle ? 'notes' : 'us_dt'),
            DeliveredDate: delivered !== null && !opts.noDelivered ? fmt(delivered, 'us_dt') : '',
            Contents: `${partial ? 1 : Math.max(1, lineCount)} award line(s) for case ${opts.orphan ? 'VMA-2016-000094' : c.caseNumber}`,
            PieceCount: '1',
            WeightOz: String(ctx.rng.int(6, 40)),
            ShippedBy: shipper,
            Postage: (ctx.rng.int(485, 2460) / 100).toFixed(2),
            ExceptionNote: mapped === 'returned' ? 'Returned to sender - addressee unknown, forwarding order expired' : status === 'Awaiting Pickup' ? 'Held at post office per requester' : '',
            DocReaders: CSR_ROLES,
            ShipDateText: notesStyle && !opts.badShipDate ? fmt(shippedAt, 'notes') : '',
        }
    }
    statuses.forEach((status, i) => {
        const c = at(shipped, i % shipped.length)
        const partial = i >= shipped.length
        out.push(make(c, status, partial, { noDelivered: i === 3, badShipDate: i === 32 }))
    })
    out.push(make(at(shipped, 0), 'Delivered', false, { orphan: true }))
    return out
}

function buildCaseNotes(ctx: Ctx, cases: AwardsCase[]): Row[] {
    const distinct = cases.filter((c, i) => cases.findIndex((o) => o.caseNumber === c.caseNumber) === i)
    const types: readonly (readonly [string, string, string])[] = [
        ['Phone Call - Inbound', 'Requester called for status', 'Requester called for status. Advised case is in {stage}; no ETA given.'],
        ['Phone Call - Outbound', 'Left voicemail re: address confirmation', 'Called requester to confirm ship-to address on file; left voicemail.'],
        ['Congressional Inquiry', 'Congressional interest logged', 'Staffer from the member\'s district office requested status. Response due in 5 business days.'],
        ['NOK Documentation', 'Death certificate / relationship proof received', 'Death certificate / relationship proof received. Requester satisfied.'],
        ['HRC Query', 'Eligibility question sent to HRC', 'Eligibility question sent to HRC Awards and Decorations Branch; awaiting reply.'],
        ['Address Correction', 'Ship-to updated', 'Ship-to updated per requester; USPS verified.'],
        ['QC Rework', 'Engraving rework requested', 'QC found engraving misspelling; job returned to engraver.'],
        ['E-mail', 'E-mail exchange with requester', 'Requester e-mailed asking whether miniatures are included; advised full size only per authorization.'],
    ]
    const multiline = new Set([2, 8, 14, 21, 27])
    const out: Row[] = []
    for (let i = 0; i < 30; i++) {
        const c = ctx.rng.pick(distinct)
        const [type, summary, bodyTemplate] = ctx.rng.pick(types)
        const when = ctx.when(c.entered, Math.min(c.closed ?? ctx.clock, ctx.clock) - HOUR)
        const author = ctx.staff()
        const followUp = ctx.rng.chance(0.4)
        const body = multiline.has(i)
            ? `Requester called ${fmt(when, 'us')}. Asked: "Is the Purple Heart, the Bronze Star, or both in this shipment?"\nAdvised: both lines are on the case, "${c.row['Stage']}" as of today.\nRequester's comment, verbatim: "Dad would have been 98 this year, please hurry."`
            : bodyTemplate.replace('{stage}', c.row['Stage'] ?? '')
        out.push({
            ...ctx.envelope(when, when, author, c.unid),
            ParentCaseNumber: c.caseNumber,
            [sourceKey('ParentUNID', 2)]: c.unid,
            NoteType: type,
            ContactName: type.startsWith('Phone') || type === 'E-mail' ? c.row['RequesterName'] ?? '' : '',
            ContactPhone: type.startsWith('Phone') ? ctx.phone() : '',
            Body: body,
            Summary: summary,
            FollowUpDate: followUp ? fmt(when + ctx.rng.int(2, 10) * DAY, 'us') : '',
            FollowUpDone: followUp ? (ctx.rng.chance(0.6) ? 'Yes' : '') : 'Yes',
            NoteAuthor: author,
            NoteDate: fmt(when, 'us_dt'),
            DocReaders: `${CSR_ROLES};${c.row['AssignedCSR'] ?? ''}`,
            DocAuthors: `${author};[Admin]`,
        })
    }
    return out
}

interface Vendor {
    row: Row
    key: string
    name: string
}
function buildVendors(ctx: Ctx): Vendor[] {
    return VENDORS.map((v, i) => {
        const created = ctx.when(utc(2008, 1, 10), utc(2021, 12, 1))
        const row: Row = {
            ...ctx.envelope(created, created + ctx.rng.int(30, 1500) * DAY, ctx.staff()),
            VendorKey: v.key,
            VendorName: v.name,
            Address: `${ctx.rng.int(100, 9899)} Industrial ${ctx.rng.pick(['Blvd', 'Pkwy', 'Dr'])}`,
            City: v.city,
            State: v.state,
            ZIP: ctx.rng.digits(5),
            POC: v.poc,
            Phone: ctx.phone(),
            Email: `${v.poc.replace(' ', '.').toLowerCase()}@${v.name.split(' ')[0]?.toLowerCase() ?? 'vendor'}.example.com`,
            Products: v.products,
            ContractNumber: `W56HZV-${18 + i}-D-${pad(ctx.rng.int(1, 60), 4)}`,
            LeadTimeDays: String(ctx.rng.pick([30, 45, 60, 90])),
            Active: v.active,
            VendorUsers: `CN=${v.poc}/O=${v.name}`,
            VendorGroup: 'Heraldry-Vendors',
            DocReaders: `${HERALDRY_ROLES};[Vendor]`,
        }
        return { row, key: v.key, name: v.name }
    })
}

interface Item {
    row: Row
    seed: ItemSeed
}
function buildItems(ctx: Ctx, vendors: Vendor[]): Item[] {
    return ITEMS.map((it, i) => {
        const approved = vendors.filter(() => ctx.rng.chance(0.5)).map((v) => v.key)
        if (approved.length === 0) approved.push(at(vendors, 0).key)
        if (i === 6) approved.push(MISSING_VENDOR_KEY)
        const created = ctx.when(utc(2009, 3, 1), utc(2016, 12, 1))
        const row: Row = {
            ...ctx.envelope(created, created + ctx.rng.int(100, 3000) * DAY, ctx.staff()),
            StockNumber: it.nsn,
            ItemName: it.name,
            Category: it.category,
            Description: `${it.name}. Manufactured to the Institute of Heraldry drawing; ${it.uoi === 'SE' ? 'issued as a set' : 'issued each'}.`,
            Branch: it.branch,
            UnitOfIssue: it.uoi,
            UnitPrice: (it.cents / 100).toFixed(2),
            MaxQtyPerRequest: String(it.maxQty),
            LeadTimeDays: String(it.lead),
            ApprovedVendors: approved.join(';'),
            Reference: ctx.rng.pick(['AR 840-10', 'AR 840-10', 'AR 840-10, para 5-3', 'TIOH Drawing 5-1-14']),
            Active: it.active,
            FSC: it.nsn.slice(0, 4),
            NIIN: it.nsn.slice(5),
        }
        return { row, seed: it }
    })
}

interface UnitRequester {
    row: Row
    unit: Unit
    name: string
    rank: string
    role: string
    phone: string
    email: string
}
function buildUnitRequesters(ctx: Ctx): UnitRequester[] {
    const out: UnitRequester[] = []
    const seen = new Set<string>()
    while (out.length < 20) {
        const p = person(ctx)
        const unit = ctx.rng.pick(UNITS)
        const key = `${unit.dodaac}~${p.first.charAt(0).toLowerCase()}.${p.last.toLowerCase().replace(/[^a-z]/g, '')}`
        if (seen.has(key)) continue
        seen.add(key)
        const created = ctx.when(utc(2008, 6, 1), utc(2026, 7, 1))
        const name = `${p.first} ${p.last}`
        const rank = ctx.rng.pick(RANKS)
        const role = ctx.rng.pick(UNIT_ROLES)
        const phone = ctx.phone()
        const email = `${p.first}.${p.last.replace(/[^A-Za-z]/g, '')}.mil@example.mil`.toLowerCase()
        const row: Row = {
            ...ctx.envelope(created, created, ctx.staff()),
            RequesterKey: key,
            Name: name,
            Rank: rank,
            DODAAC: unit.dodaac,
            UIC: unit.uic,
            UnitName: unit.name,
            Role: role,
            Phone: phone,
            Email: email,
            CreatedDate: fmt(created, mixedStyle(ctx.rng)),
            LookupKey: key.toUpperCase(),
        }
        out.push({ row, unit, name, rank, role, phone, email })
    }
    return out
}

interface RequestSpec {
    status: string
    vendorKey?: string
    releasedDraft?: boolean
    multilineHistory?: boolean
    multilineJustification?: boolean
    badRdd?: boolean
}
const REQUEST_SPECS: readonly RequestSpec[] = [
    { status: 'Complete' }, { status: 'Complete', multilineHistory: true }, { status: 'Complete' }, { status: 'Complete', vendorKey: MISSING_VENDOR_KEY }, { status: 'Complete' }, { status: 'Complete' },
    { status: 'COMPLETE' }, { status: 'Complete ' }, { status: 'completed', multilineHistory: true }, { status: 'closed' },
    { status: 'Shipped' }, { status: 'Shipped' }, { status: 'shiped' },
    { status: 'In Production' }, { status: 'In Production', multilineJustification: true }, { status: 'Released to Vendor' }, { status: 'Released to Vendor' }, { status: 'Released to Vendor', multilineHistory: true },
    { status: 'Approved' }, { status: 'Under Review' }, { status: 'Under Review', badRdd: true }, { status: 'In Review' }, { status: 'Submitted' }, { status: 'Submitted', multilineJustification: true },
    { status: 'Draft' }, { status: 'Draft', releasedDraft: true }, { status: 'Cancelled' }, { status: 'CXL' },
    { status: 'Awaiting Funds' }, { status: 'Pending Vendor Ack' },
]
const REQUEST_STATE_ORDER_TEXT = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Released to Vendor', 'In Production', 'Shipped', 'Complete'] as const
const REQUEST_TYPES = ['Organizational Color', 'Positional Color', 'Guidon', 'Streamer', 'Distinguishing Flag', 'Insignia'] as const
const JUSTIFICATIONS = ['Reflagging', 'Activation', 'Replacement - unserviceable', 'Ceremony', 'Change of Command', 'Deployment'] as const

interface HeraldryRequest {
    row: Row
    unid: string
    docNumber: string
    status: string
    mapped: string
    vendorKey: string
    unit: Unit
    entered: number
    released: number | null
    requester: UnitRequester
}

function buildRequests(ctx: Ctx, units: UnitRequester[], vendors: Vendor[]): HeraldryRequest[] {
    const out: HeraldryRequest[] = []
    const serials = new Set<string>()
    for (const spec of REQUEST_SPECS) {
        const mapped = mapLegacyStatus('Request', spec.status).value
        const requester = ctx.rng.pick(units)
        const unit = requester.unit
        const entered = mapped === 'complete' || mapped === 'cancelled' ? ctx.when(utc(2005, 1, 10), utc(2026, 4, 1)) : ctx.when(utc(2026, 1, 5), ctx.clock - 20 * DAY)
        let serial: string
        do serial = ctx.rng.digits(4)
        while (serials.has(`${unit.dodaac}${serial}`))
        serials.add(`${unit.dodaac}${serial}`)
        const docNumber = `${unit.dodaac}${toJulianDate(new Date(entered).toISOString().slice(0, 10))}${serial}`
        const reviewer = ctx.staff()
        const stateIdx = REQUEST_STATE_ORDER_TEXT.indexOf(spec.status as (typeof REQUEST_STATE_ORDER_TEXT)[number])
        const reach = mapped === 'complete' ? 7 : mapped === 'shipped' ? 6 : mapped === 'in_production' ? 5 : mapped === 'released_to_vendor' ? 4 : mapped === 'in_review' ? (spec.status === 'Approved' ? 3 : 2) : mapped === 'submitted' ? 1 : mapped === 'draft' ? 0 : mapped === 'cancelled' ? 1 : stateIdx >= 0 ? stateIdx : 3
        const times: number[] = [entered]
        for (let i = 1; i <= reach; i++) times.push(at(times, i - 1) + ctx.rng.int(1, 12) * DAY + ctx.rng.int(1, 8) * HOUR)
        const actorFor = (i: number): string => (i <= 1 ? requester.name : i <= 4 ? reviewer.replace(/^CN=([^/]+).*$/, '$1') : i <= 6 ? 'Vendor Portal' : ctx.rng.pick(STAFF))
        const history = [historyEntry(entered, '(new)', 'Draft', requester.name)]
        for (let i = 1; i <= reach; i++) history.push(historyEntry(at(times, i), at(REQUEST_STATE_ORDER_TEXT, i - 1), at(REQUEST_STATE_ORDER_TEXT, i), actorFor(i)))
        const cancelled = mapped === 'cancelled' ? at(times, reach) + 3 * DAY : null
        if (cancelled !== null) history.push(historyEntry(cancelled, at(REQUEST_STATE_ORDER_TEXT, reach), 'Cancelled', reviewer.replace(/^CN=([^/]+).*$/, '$1')))
        if (mapped === 'unmapped') history.push(historyEntry(at(times, reach) + DAY, at(REQUEST_STATE_ORDER_TEXT, reach), spec.status, reviewer.replace(/^CN=([^/]+).*$/, '$1')))
        const vendor = spec.vendorKey !== undefined ? null : reach >= 3 || spec.releasedDraft ? ctx.rng.pick(vendors.filter((v) => v.key !== '1PRQ2')) : null
        const vendorKey = spec.vendorKey ?? vendor?.key ?? ''
        const vendorName = vendor?.name ?? (spec.vendorKey !== undefined ? 'Keystone Colors & Standards Co.' : '')
        const released = reach >= 4 ? at(times, 4) : spec.releasedDraft ? entered + 6 * DAY : null
        const last = cancelled ?? at(times, reach)
        const rdd = entered + ctx.rng.int(45, 120) * DAY
        const shipToUnit = ctx.rng.chance(0.8) ? unit : ctx.rng.pick(UNITS)
        const justification = ctx.rng.pick(JUSTIFICATIONS)
        const justificationText = spec.multilineJustification
            ? `Unit reflagged effective ${fmt(entered + 60 * DAY, 'us')} per Permanent Orders ${ctx.rng.int(100, 300)}-${pad(ctx.rng.int(1, 30))}.\nExisting colors are unserviceable ("fringe detached, staining on the field"), see attached photos.\nCommander requests delivery before the activation ceremony, 1,200 attendees expected.`
            : `${justification} - ${unit.name}`
        const row: Row = {
            ...ctx.envelope(entered, last, reach >= 2 ? reviewer : unitCn(requester.name)),
            DocumentNumber: docNumber,
            Status: spec.status,
            DODAAC: unit.dodaac,
            UIC: unit.uic,
            UnitName: unit.name,
            RPD: ctx.rng.pick(['02', '03', '05', '12', '13', '15', '15']),
            SignalCode: ctx.rng.pick(['A', 'M', 'J']),
            FundCode: ctx.rng.pick(['2B', '21', 'AR']),
            ProjectCode: ctx.rng.chance(0.3) ? ctx.rng.alnum(3) : '',
            SupplementaryAddress: shipToUnit.dodaac,
            RequestType: ctx.rng.pick(REQUEST_TYPES),
            RequiredDeliveryDate: spec.badRdd ? '2026-02-30' : fmt(rdd, mixedStyle(ctx.rng)),
            ShipToDODAAC: shipToUnit.dodaac,
            ShipToName: shipToUnit.name,
            ShipToAddress1: `Bldg ${ctx.rng.int(100, 9999)}, Property Book Office`,
            ShipToAddress2: shipToUnit.post,
            ShipToCity: shipToUnit.city,
            ShipToState: shipToUnit.state,
            ShipToZIP: shipToUnit.zip,
            Justification: justification,
            JustificationText: justificationText,
            LineCount: '0',
            TotalValue: '0.00',
            EnteredDate: fmt(entered, mixedStyle(ctx.rng)),
            EnteredBy: unitCn(requester.name),
            SubmittedDate: reach >= 1 ? fmt(at(times, 1), 'us_dt') : '',
            ReviewedBy: reach >= 2 ? reviewer : '',
            ApprovedDate: reach >= 3 ? fmt(at(times, 3), 'us_dt') : '',
            VendorKey: vendorKey,
            VendorName: vendorName,
            ReleasedDate: released !== null ? fmt(released, 'us_dt') : '',
            ReleasedBy: released !== null ? reviewer : '',
            EstimatedShipDate: released !== null ? fmt(released + ctx.rng.int(30, 90) * DAY, 'us') : '',
            CancelReason: cancelled !== null ? ctx.rng.pick(['Duplicate requisition', 'Unit deactivated before delivery']) : '',
            CancelledDate: cancelled !== null ? fmt(cancelled, 'us_dt') : '',
            CancelledBy: cancelled !== null ? reviewer : '',
            StatusHistory: history.join(spec.multilineHistory ? '\n' : ';'),
            DocReaders: `${HERALDRY_ROLES};DODAAC-${unit.dodaac};${unitCn(requester.name)}${vendorKey ? `;${vendorKey}` : ''}`,
            DocAuthors: `${unitCn(requester.name)};[TACOM]`,
            Priority: ctx.rng.chance(0.85) ? 'Routine' : 'Expedite',
            LastModifiedBy: reach >= 2 ? reviewer : unitCn(requester.name),
            LastModifiedDate: fmt(last, 'us_dt'),
            StatusInquiryKey: `${docNumber}|${unit.dodaac}|${unit.uic}`,
            RequesterName: requester.name,
            RequesterRank: requester.rank,
            RequesterRole: requester.role,
            RequesterPhone: requester.phone,
            RequesterEmail: requester.email,
        }
        out.push({ row, unid: row['UNID'] ?? '', docNumber, status: spec.status, mapped, vendorKey, unit, entered, released, requester })
    }
    return out
}

function requestLineStatus(ctx: Ctx, r: HeraldryRequest): string {
    switch (r.mapped) {
        case 'complete':
            return ctx.rng.pick(['Complete', 'Complete', 'Shipped', 'Delivered', 'Closed'])
        case 'shipped':
            return 'Shipped'
        case 'in_production':
            return ctx.rng.pick(['In Production', 'Production'])
        case 'released_to_vendor':
            return ctx.rng.pick(['Released', 'Ordered'])
        case 'cancelled':
            return ctx.rng.pick(['Cancelled', 'Void'])
        case 'draft':
            return 'Draft'
        default:
            return ctx.rng.pick(['Open', 'Pending', 'New'])
    }
}

function buildRequestLines(ctx: Ctx, requests: HeraldryRequest[], items: Item[]): Row[] {
    const perRequest = new Map<HeraldryRequest, number>(requests.map((r) => [r, 1]))
    const missingVendorRequest = requests.find((r) => r.vendorKey === MISSING_VENDOR_KEY)
    if (missingVendorRequest) perRequest.set(missingVendorRequest, 3)
    let extra = 73 - [...perRequest.values()].reduce((a, b) => a + b, 0)
    while (extra > 0) {
        const r = ctx.rng.pick(requests)
        const n = perRequest.get(r) ?? 1
        if (n >= 5) continue
        perRequest.set(r, n + 1)
        extra -= 1
    }
    const out: Row[] = []
    const make = (r: HeraldryRequest, lineNo: number, opts: { status?: string; orphan?: boolean; priceMismatch?: boolean } = {}): Row => {
        const item = ctx.rng.pick(items.filter((i) => i.seed.active === 'Yes'))
        const qty = ctx.rng.int(1, Math.max(1, Math.min(4, item.seed.maxQty)))
        const extended = opts.priceMismatch ? item.seed.cents : item.seed.cents * qty
        const status = opts.status ?? requestLineStatus(ctx, r)
        const mapped = mapLegacyStatus('RequestLine', status).value
        const shippedAt = mapped === 'complete' && r.released !== null ? r.released + ctx.rng.int(20, 80) * DAY : null
        const docNumber = opts.orphan ? `${r.unit.dodaac}${toJulianDate(fmt(r.entered - 900 * DAY, 'iso'))}${ctx.rng.digits(4)}` : r.docNumber
        return {
            ...ctx.envelope(r.entered + lineNo * 3 * 60_000, r.released ?? r.entered + lineNo * 3 * 60_000, r.released !== null ? ctx.staff() : unitCn(r.requester.name), opts.orphan ? ctx.unid() : r.unid),
            ParentDocNumber: docNumber,
            LineNumber: String(lineNo),
            LineDocNumber: `${docNumber}-${pad(lineNo)}`,
            NSN: item.seed.nsn,
            ItemKey: item.seed.nsn,
            ItemDescription: item.seed.name,
            ExceptionData: ctx.rng.chance(0.1) ? 'Unit designation: 2-7 CAV, "GARRYOWEN" scroll' : '',
            UnitOfIssue: item.seed.uoi,
            Quantity: String(qty),
            UnitPrice: (item.seed.cents / 100).toFixed(2),
            ExtendedPrice: (extended / 100).toFixed(2),
            LineStatus: status,
            VendorShipDate: shippedAt !== null ? fmt(shippedAt, 'us') : '',
            DocReaders: `${HERALDRY_ROLES};DODAAC-${r.unit.dodaac}${r.vendorKey ? `;${r.vendorKey}` : ''}`,
            VendorKey: r.vendorKey,
            EnteredBy: unitCn(r.requester.name),
            LookupKey: `${docNumber}|${pad(lineNo)}`,
        }
    }
    let totalLines = 0
    for (const r of requests) {
        const n = perRequest.get(r) ?? 1
        let totalCents = 0
        for (let i = 1; i <= n; i++) {
            const row = make(r, i)
            out.push(row)
            totalCents += Math.round(Number(row['ExtendedPrice']) * 100)
        }
        r.row['LineCount'] = String(n)
        r.row['TotalValue'] = (totalCents / 100).toFixed(2)
        totalLines += n
    }
    if (totalLines !== 73) throw new Error(`expected 73 attached request lines, built ${totalLines}`)
    // Line price never recomputed after the quantity was changed.
    const target = out.find((row) => Number(row['Quantity']) > 1)
    if (!target) throw new Error('no multi-quantity request line to break')
    const cents = Math.round(Number(target['UnitPrice']) * 100)
    target['ExtendedPrice'] = (cents / 100).toFixed(2)
    // Two statuses outside the map.
    const inProd = out.filter((row) => mapLegacyStatus('RequestLine', row['LineStatus']).value === 'in_progress')
    at(inProd, 0)['LineStatus'] = 'Awaiting Vendor'
    at(inProd, 1)['LineStatus'] = 'Partial Ship'
    // Orphans: parent request documents deleted by the unit user.
    for (const r of requests.filter((x) => x.mapped === 'complete').slice(0, 2)) out.push(make(r, 1, { status: 'Complete', orphan: true }))
    return out
}

function buildSesFlags(ctx: Ctx, vendors: Vendor[], units: UnitRequester[]): Row[] {
    const specs: readonly { status: string; tier: string; title: string; org: string; flag: string; returnReason?: string }[] = [
        { status: 'Complete', tier: 'Tier 1', title: 'Director, Integrated Logistics Support Center', org: 'Tank-automotive and Armaments Command', flag: 'SES Positional Color (Indoor)' },
        { status: 'Submitted', tier: 'Tier 2', title: 'Deputy to the Commanding General', org: 'Army Materiel Command', flag: 'Indoor SES Flag' },
        { status: 'Returned', tier: 'Tier 1', title: 'Executive Director, Acquisition', org: 'Program Executive Office Ground Combat Systems', flag: 'Automobile Flag', returnReason: 'Tier not supported by SES appointment letter; resubmit with corrected tier' },
        { status: 'Pending Approval', tier: 'Tier 3', title: 'Principal Deputy, Chief Information Officer', org: 'Office of the Chief Information Officer', flag: 'Outdoor 3x4' },
        { status: 'RELEASED', tier: 'Tier 2', title: 'Director, Army Contracting Command - Warren', org: 'Army Contracting Command', flag: 'Desk Set' },
    ]
    return specs.map((s, i) => {
        const requester = at(units, i)
        const entered = ctx.when(utc(2026, 1, 15), utc(2026, 7, 20))
        const mapped = mapLegacyStatus('SESFlagRequest', s.status).value
        const approved = mapped === 'delivered' || mapped === 'in_production' ? entered + ctx.rng.int(3, 10) * DAY : null
        const released = approved !== null ? approved + ctx.rng.int(1, 5) * DAY : null
        const approver = cn('Lorraine Whitcombe')
        const exec = person(ctx)
        return {
            ...ctx.envelope(entered, released ?? approved ?? entered, released !== null ? approver : unitCn(requester.name)),
            SESFlagNumber: `SES-2026-${pad(i + 1, 4)}`,
            Status: s.status,
            ExecutiveName: `${exec.first} ${exec.last}`,
            ExecutiveTitle: s.title,
            ExecutiveTier: s.tier,
            Organization: s.org,
            FlagType: s.flag,
            Quantity: '1',
            DODAAC: requester.unit.dodaac,
            UIC: requester.unit.uic,
            ShipToAddress: `${requester.unit.name}, Bldg ${ctx.rng.int(100, 9999)}, ${requester.unit.post}, ${requester.unit.state}`,
            Justification: ctx.rng.pick(['Ceremony', 'New appointment', 'Replacement - unserviceable', 'Office relocation']),
            EnteredDate: fmt(entered, mixedStyle(ctx.rng)),
            EnteredBy: unitCn(requester.name),
            ApprovalDate: approved !== null ? fmt(approved, 'us_dt') : '',
            ApprovedBy: approved !== null ? approver : '',
            ReturnReason: s.returnReason ?? '',
            VendorKey: released !== null ? at(vendors, 0).key : '',
            ReleasedDate: released !== null ? fmt(released, 'us_dt') : '',
            DocReaders: `${HERALDRY_ROLES};[SESApprover];${unitCn(requester.name)}`,
            DocAuthors: '[TACOM];[SESApprover]',
            StatusInquiryKey: `SES-2026-${pad(i + 1, 4)}|${requester.unit.dodaac}|${requester.unit.uic}`,
        }
    })
}

// ---------------------------------------------------------------------------------------------
// generate()
// ---------------------------------------------------------------------------------------------

/** Build every legacy CSV as text, keyed by `LEGACY_FORMS[form].csvFile`. Pure and deterministic. */
export function generate(seed: number = DEFAULT_SEED, clock: string = DEFAULT_CLOCK): SampleFiles {
    const ctx = new Ctx(seed, clock)
    const vendors = buildVendors(ctx)
    const items = buildItems(ctx, vendors)
    const requesters = buildRequesters(ctx)
    const unitRequesters = buildUnitRequesters(ctx)
    const authFiles = buildAuthFiles(ctx)
    const cases = buildCases(ctx, requesters, authFiles)
    const lines = buildLines(ctx, cases)
    const jobs = buildEngravingJobs(ctx, cases, lines)
    const shipments = buildShipments(ctx, cases, lines)
    const notes = buildCaseNotes(ctx, cases)
    const requests = buildRequests(ctx, unitRequesters, vendors)
    const requestLines = buildRequestLines(ctx, requests, items)
    const sesFlags = buildSesFlags(ctx, vendors, unitRequesters)

    const rowsByForm: Record<LegacyFormName, Row[]> = {
        Vendor: vendors.map((v) => v.row),
        HeraldicItem: items.map((i) => i.row),
        Requester: requesters.map((r) => r.row),
        HeraldryRequester: unitRequesters.map((u) => u.row),
        AuthorizationFile: authFiles.map((a) => a.row),
        AwardsCase: cases.map((c) => c.row),
        AwardLine: lines.map((l) => l.row),
        EngravingJob: jobs,
        ShipmentRecord: shipments,
        CaseNote: notes,
        Request: requests.map((r) => r.row),
        RequestLine: requestLines,
        SESFlagRequest: sesFlags,
    }
    const out: Record<string, string> = {}
    for (const form of LOAD_ORDER) {
        out[LEGACY_FORMS[form].csvFile] = toCsv(csvHeader(form), rowsByForm[form].map((r) => positional(form, r)))
    }
    return out
}

// ---------------------------------------------------------------------------------------------
// Audit: re-read the CSV text with the app's pure helpers and count every defect
// ---------------------------------------------------------------------------------------------

export const STATUS_FORMS: readonly LegacyFormName[] = LOAD_ORDER.filter((f) => LEGACY_FORMS[f].statusColumn !== undefined)
export const CHILD_FORMS: readonly LegacyFormName[] = LOAD_ORDER.filter((f) => LEGACY_FORMS[f].parent !== undefined)
export const KEYED_FORMS: readonly LegacyFormName[] = LOAD_ORDER.filter((f) => LEGACY_FORMS[f].businessKey !== undefined)
/** Forms carrying a `VendorKey` column that must resolve to a Vendor row. */
export const VENDOR_REF_FORMS: readonly LegacyFormName[] = LOAD_ORDER.filter((f) => f !== 'Vendor' && csvHeader(f).includes('VendorKey'))

const DATE_COLUMN = /(Date|^Created|^Modified|ETA|^AgingLastEval|^ServiceFrom|^ServiceTo|^ShipDateText)$/
export function dateColumns(form: LegacyFormName): string[] {
    return stagingColumnMap(form)
        .map((c) => c.key)
        .filter((k) => DATE_COLUMN.test(k))
}

export interface ParsedForm {
    header: string[]
    keys: string[]
    rows: Record<string, string>[]
}

/** Parse every file into keyed rows using the contract's disambiguated column keys. */
export function parseSampleFiles(files: SampleFiles): Record<LegacyFormName, ParsedForm> {
    const out = {} as Record<LegacyFormName, ParsedForm>
    for (const form of LOAD_ORDER) {
        const text = files[LEGACY_FORMS[form].csvFile]
        if (text === undefined) throw new Error(`missing ${LEGACY_FORMS[form].csvFile}`)
        const parsed = parseCsv(text)
        const keys = stagingColumnMap(form).map((c) => c.key)
        out[form] = { header: parsed.header, keys, rows: parsed.rows.map((r) => rowToObject(keys, r)) }
    }
    return out
}

export interface DuplicateRequesterGroup {
    key: string
    requesterIds: string[]
    alreadyMerged: number
}

export interface SampleAudit {
    rowCounts: Record<LegacyFormName, number>
    /** Distinct raw status spellings per status-bearing form. */
    statusSpellings: Partial<Record<LegacyFormName, string[]>>
    unmappedStatuses: Partial<Record<LegacyFormName, { count: number; values: string[] }>>
    datePatterns: Record<NormalizedDate['pattern'], number>
    unparseableDates: { form: LegacyFormName; column: string; value: string }[]
    duplicateRequesterGroups: DuplicateRequesterGroup[]
    orphans: Partial<Record<LegacyFormName, number>>
    parentUnidDisagreements: Partial<Record<LegacyFormName, number>>
    duplicateBusinessKeys: Partial<Record<LegacyFormName, string[]>>
    missingVendorKeys: Partial<Record<LegacyFormName, { count: number; keys: string[] }>>
    contradictions: {
        closedWithoutClosedDate: number
        deliveredWithoutDeliveredDate: number
        extendedPriceMismatch: number
        draftWithReleasedDate: number
        quantityOverMax: number
        nonUppercaseEngraving: number
        returnedShipments: number
    }
    aging: { green: number; amber: number; red: number }
    cells: { withNewline: number; withQuote: number; withComma: number }
    unids: { total: number; distinct: number; malformed: number }
}

export function auditSampleData(files: SampleFiles, clock: string = DEFAULT_CLOCK): SampleAudit {
    const parsed = parseSampleFiles(files)
    const clockIso = new Date(clock).toISOString().slice(0, 19).replace('T', ' ')
    const audit: SampleAudit = {
        rowCounts: {} as Record<LegacyFormName, number>,
        statusSpellings: {},
        unmappedStatuses: {},
        datePatterns: { iso: 0, iso_datetime: 0, us: 0, us_datetime: 0, notes: 0, compact: 0, epoch_ms: 0 },
        unparseableDates: [],
        duplicateRequesterGroups: [],
        orphans: {},
        parentUnidDisagreements: {},
        duplicateBusinessKeys: {},
        missingVendorKeys: {},
        contradictions: { closedWithoutClosedDate: 0, deliveredWithoutDeliveredDate: 0, extendedPriceMismatch: 0, draftWithReleasedDate: 0, quantityOverMax: 0, nonUppercaseEngraving: 0, returnedShipments: 0 },
        aging: { green: 0, amber: 0, red: 0 },
        cells: { withNewline: 0, withQuote: 0, withComma: 0 },
        unids: { total: 0, distinct: 0, malformed: 0 },
    }
    const allUnids: string[] = []
    for (const form of LOAD_ORDER) {
        const { rows, keys } = parsed[form]
        const contract = LEGACY_FORMS[form]
        audit.rowCounts[form] = rows.length
        for (const r of rows) {
            for (const k of keys) {
                const v = r[k] ?? ''
                if (v.includes('\n')) audit.cells.withNewline += 1
                if (v.includes('"')) audit.cells.withQuote += 1
                if (v.includes(',')) audit.cells.withComma += 1
            }
            const unid = r['UNID'] ?? ''
            allUnids.push(unid)
            if (!/^[0-9A-F]{32}$/.test(unid)) audit.unids.malformed += 1
            for (const col of dateColumns(form)) {
                const v = r[col] ?? ''
                if (v === '') continue
                const n = normalizeLegacyDate(v)
                if (n === null) audit.unparseableDates.push({ form, column: col, value: v })
                else audit.datePatterns[n.pattern] += 1
            }
        }
        if (contract.statusColumn !== undefined) {
            const col = contract.statusColumn
            const spellings = new Set<string>()
            const unmapped: string[] = []
            for (const r of rows) {
                const raw = r[col] ?? ''
                spellings.add(raw)
                if (!mapLegacyStatus(form, raw).mapped) unmapped.push(raw)
            }
            audit.statusSpellings[form] = [...spellings].sort()
            audit.unmappedStatuses[form] = { count: unmapped.length, values: [...new Set(unmapped)].sort() }
        }
        if (contract.businessKey !== undefined) {
            const col = contract.businessKey
            const seen = new Map<string, number>()
            for (const r of rows) seen.set(r[col] ?? '', (seen.get(r[col] ?? '') ?? 0) + 1)
            audit.duplicateBusinessKeys[form] = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k).sort()
        }
        if (contract.parent !== undefined) {
            const parentRows = parsed[contract.parent.parentForm].rows
            const parentKey = contract.parent.by === 'unid' ? 'UNID' : (LEGACY_FORMS[contract.parent.parentForm].businessKey ?? 'UNID')
            const parents = new Set(parentRows.map((p) => p[parentKey] ?? ''))
            audit.orphans[form] = rows.filter((r) => !parents.has(r[contract.parent?.column ?? ''] ?? '')).length
            const second = sourceKey('ParentUNID', 2)
            if (keys.includes(second)) {
                audit.parentUnidDisagreements[form] = rows.filter((r) => (r[second] ?? '') !== '' && r[second] !== r['ParentUNID']).length
            }
        }
    }
    audit.unids.total = allUnids.length
    audit.unids.distinct = new Set(allUnids).size

    const vendorKeys = new Set(parsed.Vendor.rows.map((v) => v['VendorKey'] ?? ''))
    for (const form of VENDOR_REF_FORMS) {
        const missing = parsed[form].rows.map((r) => r['VendorKey'] ?? '').filter((k) => k !== '' && !vendorKeys.has(k))
        audit.missingVendorKeys[form] = { count: missing.length, keys: [...new Set(missing)].sort() }
    }

    const groups = new Map<string, { ids: string[]; merged: number }>()
    for (const r of parsed.Requester.rows) {
        const key = computeDedupeKey(requesterIdentity(r))
        if (key === '') continue
        const g = groups.get(key) ?? { ids: [], merged: 0 }
        g.ids.push(r['RequesterID'] ?? '')
        if ((r['MergedInto'] ?? '') !== '') g.merged += 1
        groups.set(key, g)
    }
    audit.duplicateRequesterGroups = [...groups.entries()]
        .filter(([, g]) => g.ids.length > 1)
        .map(([key, g]) => ({ key, requesterIds: g.ids.sort(), alreadyMerged: g.merged }))
        .sort((a, b) => a.key.localeCompare(b.key))

    for (const r of parsed.AwardsCase.rows) {
        const m = mapLegacyStatus('AwardsCase', r['Stage'])
        if (m.value === 'closed' && (r['ClosedDate'] ?? '') === '') audit.contradictions.closedWithoutClosedDate += 1
        if (!m.mapped) continue
        const stage = m.value as CaseStage
        if (TERMINAL_STAGES.has(stage)) continue
        const dateCol = STAGE_DATE_COLUMN[stage as OpenStage]
        const entered = normalizeLegacyDate(r[dateCol])
        const days = entered ? daysBetween(entered.dateTime, clockIso) : 0
        audit.aging[computeAgingFlag(days, stage)] += 1
    }
    for (const r of parsed.ShipmentRecord.rows) {
        const m = mapLegacyStatus('ShipmentRecord', r['ShipStatus'])
        if (m.value === 'delivered' && (r['DeliveredDate'] ?? '') === '') audit.contradictions.deliveredWithoutDeliveredDate += 1
        if (m.value === 'returned') audit.contradictions.returnedShipments += 1
    }
    for (const r of parsed.RequestLine.rows) {
        const expected = Number(r['Quantity']) * Number(r['UnitPrice'])
        if (Math.abs(expected - Number(r['ExtendedPrice'])) > 0.005) audit.contradictions.extendedPriceMismatch += 1
    }
    for (const r of parsed.Request.rows) {
        if (mapLegacyStatus('Request', r['Status']).value === 'draft' && (r['ReleasedDate'] ?? '') !== '') audit.contradictions.draftWithReleasedDate += 1
    }
    for (const r of parsed.AwardLine.rows) {
        if (Number(r['Quantity']) > LIMITS.maxQuantity) audit.contradictions.quantityOverMax += 1
        const text = r['EngravingText'] ?? ''
        if (text !== '' && text !== text.toUpperCase()) audit.contradictions.nonUppercaseEngraving += 1
    }
    return audit
}

// ---------------------------------------------------------------------------------------------
// README rendering (every number comes from the audit)
// ---------------------------------------------------------------------------------------------

const md = (rows: readonly (readonly string[])[], header: readonly string[]): string =>
    [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')
const code = (v: string): string => `\`${v.replace(/\n/g, '\\n')}\``

export function renderReadme(audit: SampleAudit, seed: number = DEFAULT_SEED, clock: string = DEFAULT_CLOCK): string {
    const volumes = LOAD_ORDER.map((f) => [LEGACY_FORMS[f].csvFile, LEGACY_FORMS[f].legacyForm, String(audit.rowCounts[f])])
    const defects: string[][] = []
    for (const f of STATUS_FORMS) {
        const u = audit.unmappedStatuses[f]
        const spellings = audit.statusSpellings[f] ?? []
        if (u) defects.push([`Status spellings not in the status map (${f}.${LEGACY_FORMS[f].statusColumn})`, String(u.count), `${spellings.length} distinct raw spellings; unmapped: ${u.values.map(code).join(', ') || '-'}`])
    }
    defects.push([
        'Mixed date formats (all date columns)',
        String(Object.values(audit.datePatterns).reduce((a, b) => a + b, 0)),
        Object.entries(audit.datePatterns)
            .filter(([, n]) => n > 0)
            .map(([p, n]) => `${p}: ${n}`)
            .join(', '),
    ])
    defects.push(['Unparseable dates', String(audit.unparseableDates.length), audit.unparseableDates.map((d) => `${d.form}.${d.column} = ${code(d.value)}`).join(', ')])
    defects.push([
        'Duplicate requester groups (vetmedals Requester)',
        String(audit.duplicateRequesterGroups.length),
        audit.duplicateRequesterGroups.map((g) => `${g.requesterIds.join('/')} (${g.alreadyMerged} already MergedInto)`).join('; '),
    ])
    for (const f of CHILD_FORMS) {
        const p = LEGACY_FORMS[f].parent
        defects.push([`Orphan rows (${f}.${p?.column} -> ${p?.parentForm})`, String(audit.orphans[f] ?? 0), p?.by === 'unid' ? 'parent UNID not in parent file' : 'parent business key not in parent file'])
    }
    for (const [f, n] of Object.entries(audit.parentUnidDisagreements)) defects.push([`Envelope ParentUNID != form ParentUNID (${f})`, String(n), 'second ParentUNID header carries a different value'])
    for (const f of KEYED_FORMS) {
        const d = audit.duplicateBusinessKeys[f] ?? []
        if (d.length) defects.push([`Duplicate business key (${f}.${LEGACY_FORMS[f].businessKey})`, String(d.length), d.map(code).join(', ')])
    }
    for (const f of VENDOR_REF_FORMS) {
        const m = audit.missingVendorKeys[f]
        if (m && m.count) defects.push([`VendorKey absent from heraldry-Vendor.csv (${f})`, String(m.count), m.keys.map(code).join(', ')])
    }
    const c = audit.contradictions
    defects.push(
        ['Stage=Closed with empty ClosedDate (AwardsCase)', String(c.closedWithoutClosedDate), ''],
        ['ShipStatus=Delivered with empty DeliveredDate (ShipmentRecord)', String(c.deliveredWithoutDeliveredDate), ''],
        ['ExtendedPrice != Quantity x UnitPrice (RequestLine)', String(c.extendedPriceMismatch), ''],
        ['Status=Draft with ReleasedDate set (Request)', String(c.draftWithReleasedDate), ''],
        [`Quantity above ${LIMITS.maxQuantity} (AwardLine)`, String(c.quantityOverMax), ''],
        ['Non-uppercase EngravingText (AwardLine)', String(c.nonUppercaseEngraving), ''],
        ['Returned shipment (ShipmentRecord)', String(c.returnedShipments), ''],
        ['Aging spread of open cases at the clock', String(audit.aging.green + audit.aging.amber + audit.aging.red), `green (<60 days): ${audit.aging.green}, amber (60-74): ${audit.aging.amber}, red (>=75): ${audit.aging.red}`],
        ['Cells with embedded line breaks / quotes / commas', String(audit.cells.withNewline), `newline: ${audit.cells.withNewline}, quote: ${audit.cells.withQuote}, comma: ${audit.cells.withComma}`],
    )
    return [
        '# Sample legacy export set',
        '',
        'A deterministic miniature of the legacy Domino CSV export that feeds the `x_cog_mah` migration for this modernization reference application.',
        'One file per form in `LEGACY_FORMS` (`src/server/lib/legacyContract.ts`), headers exactly as `csvHeader(form)` writes them, RFC 4180 quoting.',
        'All people, units, addresses and identifiers are synthetic.',
        '',
        `Generated with seed \`${seed}\` at fixed clock \`${clock}\`. ${audit.unids.total} documents, ${audit.unids.distinct} distinct UNIDs.`,
        '',
        '## Volumes',
        '',
        md(volumes, ['File', 'Legacy form', 'Rows']),
        '',
        '## Intentional defects',
        '',
        'Counts below are computed by `auditSampleData()` in `tools/generate-sample-data.ts`, which re-reads the CSV text with the same helpers',
        'the transform uses (`mapLegacyStatus`, `normalizeLegacyDate`, `computeDedupeKey`, `computeAgingFlag`). `tests/sampleData.test.ts` asserts the same numbers.',
        '',
        md(defects, ['Defect', 'Count', 'Detail']),
        '',
        '## Regenerate',
        '',
        '```sh',
        'npm run gen:sample-data             # rewrite sample-data/*.csv and this README',
        'npm run gen:sample-data -- --check  # fail if the files on disk are stale',
        '```',
        '',
        'This file is generated - edit `tools/generate-sample-data.ts` instead.',
        '',
    ].join('\n')
}

// ---------------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------------

export function expectedFiles(seed: number = DEFAULT_SEED, clock: string = DEFAULT_CLOCK): Record<string, string> {
    const files = generate(seed, clock)
    return { ...files, [README_FILE]: renderReadme(auditSampleData(files, clock), seed, clock) }
}

export function readSampleDir(dir: string = SAMPLE_DIR): Record<string, string> {
    if (!existsSync(dir)) return {}
    const out: Record<string, string> = {}
    for (const name of readdirSync(dir)) out[name] = readFileSync(dir + name, 'utf8')
    return out
}

function main(argv: readonly string[]): number {
    const check = argv.includes('--check')
    const expected = expectedFiles()
    const actual = readSampleDir()
    const stale = Object.keys(expected).filter((name) => actual[name] !== expected[name])
    const extra = Object.keys(actual).filter((name) => !(name in expected))
    if (check) {
        for (const name of stale) console.error(`stale: sample-data/${name}`)
        for (const name of extra) console.error(`unexpected: sample-data/${name}`)
        if (stale.length || extra.length) return 1
        console.log(`sample-data/ is up to date (${Object.keys(expected).length} files)`)
        return 0
    }
    mkdirSync(SAMPLE_DIR, { recursive: true })
    for (const [name, text] of Object.entries(expected)) writeFileSync(SAMPLE_DIR + name, text)
    console.log(`wrote ${Object.keys(expected).length} files to sample-data/ (${stale.length} changed)`)
    if (extra.length) console.warn(`not generated, left in place: ${extra.join(', ')}`)
    return 0
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main(process.argv.slice(2))
}

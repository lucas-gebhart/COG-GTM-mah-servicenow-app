/**
 * Hand-curated part of the documentation: which legacy behaviour is implemented where, and which
 * test proves it. Everything referenced here (files, test titles, tables, roles) is validated by
 * `tools/generate-docs.ts --check` and `tests/docs-sync.test.ts`, so a renamed file or test title
 * fails offline instead of leaving a stale row in the equivalence matrix.
 */
import type { DomainTableKey } from '../../src/server/lib/domain'

export type LegacyBehaviourKind = 'validation' | 'rule' | 'agent' | 'view' | 'role' | 'form' | 'xpage' | 'export'

export interface EquivalenceRow {
    kind: LegacyBehaviourKind
    /** Legacy artefact as named in the Domino design (form, view, agent, @Formula, ACL role). */
    legacy: string
    /** What it did. */
    behaviour: string
    /** ServiceNow implementation: repository files (relative). */
    files: readonly string[]
    /** Fluent / instance artefact names the reader will find on the instance. */
    artefacts: readonly string[]
    /** Vitest `it()` titles (exact) that prove the behaviour; empty for metadata-only rows. */
    tests: readonly string[]
}

export const EQUIVALENCE_MATRIX: readonly EquivalenceRow[] = [
    // ---------------------------------------------------------------- validation (@Formula / QuerySave)
    {
        kind: 'validation',
        legacy: 'Request form: DODAAC input validation',
        behaviour: '6 alphanumerics, first character a valid service/agency code',
        files: ['src/server/lib/validators.ts', 'src/server/rules/heraldryRequest.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH Heraldry request - DD 1348-6 validation and release lock', 'MAH DD1348-6: DODAAC format'],
        tests: ['accepts a well-formed Army DODAAC and rejects bad ones'],
    },
    {
        kind: 'validation',
        legacy: 'Request form: UIC input validation',
        behaviour: '`W` + 5 alphanumerics',
        files: ['src/server/lib/validators.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH DD1348-6: UIC format'],
        tests: ['requires UIC to be W + 5 alphanumerics'],
    },
    {
        kind: 'validation',
        legacy: 'Request form: requisition priority designator',
        behaviour: 'RPD 01–15, two digits',
        files: ['src/server/lib/validators.ts', 'src/server/migration/valueMaps.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH DD1348-6: requisition priority guidance'],
        tests: ['bounds requisition priority to 01–15', 'RPD accepts 1..15 in any spelling and rejects the rest'],
    },
    {
        kind: 'validation',
        legacy: 'Request form: document number',
        behaviour: '14 characters = DODAAC + 4-digit Julian date + 4-character serial; DODAAC prefix must match',
        files: ['src/server/lib/validators.ts', 'src/server/lib/dates.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH DD1348-6: document number format'],
        tests: ['validates the 14-character document number structure', 'computes day differences and Julian dates'],
    },
    {
        kind: 'validation',
        legacy: 'Request form: project / fund code',
        behaviour: '3-character project code and 2-character fund code when present',
        files: ['src/server/lib/validators.ts'],
        artefacts: ['MAH Heraldry request - DD 1348-6 validation and release lock'],
        tests: ['validates project and fund codes when present'],
    },
    {
        kind: 'validation',
        legacy: 'Request form: header validation summary',
        behaviour: 'All DD 1348-6 header issues reported per field in one pass',
        files: ['src/server/lib/validators.ts', 'src/server/rules/heraldryRequest.ts'],
        artefacts: ['MAH Heraldry request - DD 1348-6 validation and release lock', 'MAH DD1348-6: header hints and release lock'],
        tests: ['aggregates header issues per field'],
    },
    {
        kind: 'validation',
        legacy: 'AwardLine form: engraving text',
        behaviour: '60 engravable characters, whitelist',
        files: ['src/server/lib/validators.ts', 'src/server/rules/awardLine.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH Award line - validate quantity and engraving', 'MAH award line: engraving text whitelist'],
        tests: ['limits engraving text to 60 engravable characters'],
    },
    {
        kind: 'validation',
        legacy: 'AwardLine / RequestLine forms: quantity bounds',
        behaviour: 'Positive integer within the configured maximum',
        files: ['src/server/lib/validators.ts', 'src/server/rules/awardLine.ts', 'src/server/rules/requestLine.ts'],
        artefacts: ['MAH Award line - validate quantity and engraving', 'MAH Request line - catalog copy-down and extended price'],
        tests: ['bounds quantities'],
    },
    {
        kind: 'validation',
        legacy: 'RequestLine form: NSN or exception code',
        behaviour: '13-digit NSN with or without dashes, or an `EXC-` exception code',
        files: ['src/server/lib/validators.ts', 'src/server/rules/requestLine.ts'],
        artefacts: ['MAH Request line - catalog copy-down and extended price'],
        tests: ['accepts NSNs with or without dashes and EXC- exception codes'],
    },
    {
        kind: 'validation',
        legacy: 'Vendor form: CAGE code',
        behaviour: '5 characters, no I or O',
        files: ['src/server/lib/validators.ts', 'src/server/rules/reference.ts'],
        artefacts: ['MAH Vendor - validate CAGE code and contacts'],
        tests: ['validates CAGE codes (no I or O)'],
    },
    {
        kind: 'validation',
        legacy: 'All forms: free-text items',
        behaviour: 'Whitelist characters and length limits on every user-supplied value (UNID, e-mail, phone, names, justification)',
        files: ['src/server/lib/validators.ts', 'src/server/lib/domain.ts'],
        artefacts: ['every `MAH * - validate` business rule'],
        tests: ['rejects dangerous characters in free text', 'validates UNIDs, e-mail, phone'],
    },

    // ---------------------------------------------------------------- rules (@Formula computed items, QuerySave, PostSave)
    {
        kind: 'rule',
        legacy: 'RequestLine: ExtendedPrice computed item',
        behaviour: 'extended_price = quantity × unit_price, rounded to cents; request totals rolled up',
        files: ['src/server/lib/pricing.ts', 'src/server/rules/requestLine.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH Request line - catalog copy-down and extended price', 'MAH Request line - roll up request totals', 'MAH request line: extended price (quantity)', 'MAH request line: extended price (unit price)'],
        tests: ['rounds extended price to cents', 'totals request lines', 'recomputes request-line extended price from quantity × unit price and normalizes NIIN'],
    },
    {
        kind: 'rule',
        legacy: 'Request QuerySave: "Request has been released to vendor and may not be modified"',
        behaviour: 'Once released_to_vendor is set only the vendor fulfilment fields may change; same message text as the legacy agent',
        files: ['src/server/lib/stageMachine.ts', 'src/server/rules/heraldryRequest.ts', 'src/server/lib/domain.ts'],
        artefacts: ['MAH Heraldry request - DD 1348-6 validation and release lock', 'MAH DD1348-6: header hints and release lock'],
        tests: ['identifies frozen fields after release', 'uses the legacy message when cancelling after release'],
    },
    {
        kind: 'rule',
        legacy: 'Request state transitions (Submit / Review / Release / Production / Ship / Complete)',
        behaviour: 'Forward-only state machine with per-role ownership; vendors may only progress production and shipping',
        files: ['src/server/lib/stageMachine.ts', 'src/server/services/actions.ts', 'src/fluent/ui/ui_actions.now.ts', 'src/fluent/workflows/vendor_release.now.ts'],
        artefacts: ['Submit request', 'Start review', 'Release to vendor', 'Advance state', 'Cancel request', 'MAH Heraldry request vendor release'],
        tests: ['requires a valid header and lines to submit, a vendor to release', 'lets vendors progress production and shipping only'],
    },
    {
        kind: 'rule',
        legacy: 'AwardsCase stage transitions (Authorized → Engraving → Assembly/QC → Warehouse → Shipped → Closed)',
        behaviour: 'One stage at a time, role-owned, blocked with open lines / without a shipment; supervisor one-step rollback; cancellation from any open stage',
        files: ['src/server/lib/stageMachine.ts', 'src/server/rules/awardsCase.ts', 'src/server/services/actions.ts', 'src/fluent/ui/ui_actions.now.ts', 'src/fluent/workflows/awards_case_lifecycle.now.ts'],
        artefacts: ['MAH Awards case - validate and stage guard rails', 'Advance stage', 'Cancel case', 'MAH Awards case lifecycle'],
        tests: [
            'walks the forward path one stage at a time',
            'enforces role ownership of each stage',
            'blocks shipping with open lines and closing without a shipment',
            'allows cancellation from any open stage and supervisor one-step rollback',
            'lets TACOM repair unmapped migrated cases',
        ],
    },
    {
        kind: 'rule',
        legacy: 'AwardsCase: DaysInStage / AgingFlag computed items',
        behaviour: 'days_in_stage from stage_entered_at; amber at 60 days, red at 75, never for terminal stages',
        files: ['src/server/lib/aging.ts', 'src/server/rules/awardsCase.ts', 'src/fluent/sla/awards_case_sla.now.ts', 'src/fluent/ui/client_scripts.now.ts'],
        artefacts: ['MAH Awards case - validate and stage guard rails', 'MAH awards case: aging banner', 'SLA definitions (see docs/SLA.md)'],
        tests: ['computes days in stage from the stage-entered timestamp', 'flags amber at 60 and red at 75 days, never for terminal stages', 'one SLA per non-green aging flag with the matching threshold'],
    },
    {
        kind: 'rule',
        legacy: 'Requester: DedupeKey computed item and "merge duplicates" agent',
        behaviour: 'Deterministic dedupe key from normalized name / DOB / last-4 (unit-scoped for units, e-mail fallback); duplicates coalesced onto the newest record and repointed via merged_into',
        files: ['src/server/lib/dedupe.ts', 'src/server/rules/requester.ts', 'src/server/services/actions.ts', 'src/server/migration/transformEngine.ts'],
        artefacts: ['MAH Requester - validate, display name and dedupe key', 'MAH Requester - merge duplicates into survivor', 'Merge requester'],
        tests: [
            'produces the same key for the same person regardless of formatting',
            'uses unit-scoped keys for units and e-mail fallback for thin records',
            'coalesces duplicates deterministically onto the newest record',
        ],
    },
    {
        kind: 'rule',
        legacy: 'EngravingJob / ShipmentRecord PostSave: advance parent case',
        behaviour: 'Completed engraving moves the case to Assembly/QC; a shipment moves it to Shipped and a delivery to Closed',
        files: ['src/server/rules/fulfilment.ts'],
        artefacts: ['MAH Engraving job - advance case to Assembly/QC', 'MAH Shipment - advance case to Shipped / Closed'],
        tests: ['terminal stages are the domain definition (aging.ts), so shipped cases stay active and keep aging'],
    },

    // ---------------------------------------------------------------- agents
    {
        kind: 'agent',
        legacy: 'NightlyAging (LotusScript, scheduled)',
        behaviour: 'Recomputes days_in_stage / aging_flag for every active case, fires the red event once per transition, logs a JSON summary',
        files: ['src/server/jobs/nightlyAging.ts', 'src/fluent/jobs/nightly_aging.now.ts', 'src/includes/MAHAging.js'],
        artefacts: ['MAH Nightly Aging', 'MAHAging'],
        tests: ['reports transitions to red exactly once', 'summarizes by flag and stage'],
    },
    {
        kind: 'agent',
        legacy: 'ImportAuthorizationFile (LotusScript, HRC / NPRC file drop)',
        behaviour: 'Scripted REST intake: JSON or delimited body, whitelist validation, size limit, idempotent on source record id, generic errors, JSON server log',
        files: ['src/server/lib/authFileParser.ts', 'src/server/rest/authorizationIntake.ts', 'src/fluent/rest/authorization_intake.now.ts'],
        artefacts: ['/api/x_cog_mah/authorization_intake'],
        tests: [
            'parses and normalizes a valid record',
            'rejects records with unknown awards, bad ids and injection attempts',
            'is idempotent within a file: duplicate source ids are rejected',
            'rejects malformed bodies and oversize files at the file level',
            'detects the delimiter and groups rows into records',
            'handles quoted fields and CRLF',
            'fails fast on a header missing required columns',
            'dispatches on content type',
            'inherits the file-level agency when a record omits it',
            'rejects empty and oversize bodies',
        ],
    },
    {
        kind: 'agent',
        legacy: 'SendStatusMail (LotusScript)',
        behaviour: 'Event-driven notifications on stage change, request submission / vendor release, red aging and SES submission',
        files: ['src/fluent/notifications/events.now.ts', 'src/fluent/notifications/notifications.now.ts', 'src/server/rules/awardsCase.ts', 'src/server/rules/heraldryRequest.ts'],
        artefacts: ['MAH Awards case stage changed', 'MAH Awards case aging red (75 days)', 'MAH Heraldry request submitted', 'MAH Heraldry request released to vendor', 'MAH SES flag request submitted'],
        tests: [],
    },
    {
        kind: 'agent',
        legacy: 'Security / audit logging (Domino log.nsf entries)',
        behaviour: 'One-line JSON security events for authn / authz failures, data changes and admin actions; secret-looking keys redacted, control characters stripped',
        files: ['src/server/lib/logging.ts', 'src/server/rules/glideSupport.ts'],
        artefacts: ['gs.info one-line JSON events with `app: x_cog_mah`'],
        tests: ['strips control characters and clamps length', 'redacts secret-looking keys and emits one-line JSON'],
    },

    // ---------------------------------------------------------------- roles / readers
    {
        kind: 'role',
        legacy: 'ACL roles [TACOM] [CSR] [Engraver] [Assembler] [Warehouse] [Vendor] [DLA] [Admin]',
        behaviour: 'One `x_cog_mah.*` role per legacy ACL role; table and field ACLs generated from the access matrix',
        files: ['src/server/lib/domain.ts', 'src/server/lib/security.ts', 'src/fluent/security/roles.now.ts', 'src/fluent/security/acls.now.ts', 'tools/generate-fluent-security.ts'],
        artefacts: ['x_cog_mah.tacom_staff … x_cog_mah.admin', 'ACLs on every x_cog_mah_* table'],
        tests: ['maps role names to keys', 'module roles are domain roles, every domain role is used, and vendor sees only "Vendor work"', 'report roles equal the read matrix of the report table'],
    },
    {
        kind: 'role',
        legacy: 'Readers fields (DocReaders / VendorUsers / VendorGroup) on Request, RequestLine, Vendor',
        behaviour: 'Query business rules restrict vendor sessions to requests whose vendor.portal_user is the session user or whose vendor.user_group contains it',
        files: ['src/server/rules/vendorIsolation.ts', 'src/fluent/rules/business_rules.now.ts', 'src/server/lib/security.ts'],
        artefacts: ['MAH Heraldry request - vendor isolation', 'MAH Request line - vendor isolation', 'MAH Case note - vendor isolation', 'MAH Vendor - vendor sees own record only'],
        tests: ['module roles are domain roles, every domain role is used, and vendor sees only "Vendor work"'],
    },

    // ---------------------------------------------------------------- forms
    {
        kind: 'form',
        legacy: 'Domino forms (AwardsCase, AwardLine, Requester, AuthorizationFile, EngravingJob, ShipmentRecord, CaseNote, Request, RequestLine, HeraldicItem, SESFlagRequest, Vendor)',
        behaviour: 'One audited Fluent table per form with the shared legacy identity fields, auto-number prefix, choices, references and journals; keyword items become choice lists',
        files: ['src/fluent/tables/', 'src/server/lib/domain.ts', 'tools/lib/tableColumns.ts'],
        artefacts: ['x_cog_mah_awards_case … x_cog_mah_migration_exception (14 tables)'],
        tests: ['seed map only targets choices that exist on the target table (bidirectional)', 'covers every legacy form and target table (both directions)'],
    },

    // ---------------------------------------------------------------- views / XPages
    {
        kind: 'view',
        legacy: 'Domino views (per form; names listed in `UI_LAYOUT[*].legacyViews`)',
        behaviour: 'Dense list layouts with sum footers, form sections and related lists generated from one layout registry',
        files: ['src/server/lib/uiLayout.ts', 'src/fluent/ui/lists.now.ts', 'src/fluent/ui/forms.now.ts', 'src/fluent/ui/related_lists.now.ts', 'tools/generate-fluent-ui.ts'],
        artefacts: ['List / Form / related list per x_cog_mah_* table'],
        tests: [],
    },
    {
        kind: 'view',
        legacy: 'Operator views: cases by stage, aging, engraving / assembly / warehouse / vendor queues',
        behaviour: 'Reports, dashboard and native workspace derived from one operations catalog',
        files: ['tools/lib/operations-catalog.ts', 'src/fluent/reports/operations_reports.now.ts', 'src/fluent/workspace/mah_operations_workspace.now.ts', 'src/fluent/ui/operations_modules.now.ts'],
        artefacts: ['MAH Operations'],
        tests: [
            'every requested report concept exists and every report is one of the tracked concepts or a queue variant',
            'counters and charts bind to catalog reports and share their filters',
            'module titles match the required set exactly (both directions)',
        ],
    },
    {
        kind: 'xpage',
        legacy: 'XPages: status inquiry, DD 1348-6 request, SES flag request',
        behaviour: 'Record producers on the Service Portal / Employee Center backed by validated server scripts',
        files: ['src/fluent/catalog/record_producers.now.ts', 'src/producers/statusInquiry.producer.js', 'src/producers/dd1348Request.producer.js', 'src/producers/sesFlagRequest.producer.js', 'src/server/services/statusInquiry.ts'],
        artefacts: ['Awards case status inquiry', 'DD Form 1348-6 heraldic item request', 'SES flag request', 'MAHStatusInquiry'],
        tests: [],
    },

    // ---------------------------------------------------------------- export / migration
    {
        kind: 'export',
        legacy: 'DXL / CSV export of every form (13 files)',
        behaviour: 'Import Set staging table + data source + transform map per legacy form, generated from the shared contract',
        files: ['src/server/lib/legacyContract.ts', 'tools/generate-fluent-migration.ts', 'src/fluent/migration/staging_tables.now.ts', 'src/fluent/migration/data_sources.now.ts', 'src/fluent/migration/transform_maps.now.ts', 'tools/generate-sample-data.ts', 'sample-data/'],
        artefacts: ['x_cog_mah_stg_* tables', 'MAH Legacy * data sources', 'MAH * -> x_cog_mah_* transform maps', 'sample-data/*.csv (deterministic miniature of the export)'],
        tests: [
            'every header equals csvHeader(form) exactly, including the repeated ParentUNID',
            'files on disk are byte-identical to a fresh generation (run npm run gen:sample-data)',
            'is in sync with the contract (run `npm run gen:migration` after changing legacyContract/statusMap/rowTransforms)',
            'declares one staging table, data source and transform map per legacy form',
            'header check names the first drifted column',
            'rejects a file that ends inside a quoted field',
            'every transform reads only contract columns and writes legacy identity fields',
            'validates batch id, chunk size and form names',
        ],
    },
    {
        kind: 'export',
        legacy: 'Free-text Status item',
        behaviour: 'Normalized and mapped through x_cog_mah_status_map; unknown text lands in `unmapped` with the raw value preserved',
        files: ['src/server/lib/statusMap.ts', 'src/server/migration/rowTransforms.ts', 'src/fluent/migration/status_map_seed.now.ts', 'src/fluent/tables/status_map.now.ts'],
        artefacts: ['x_cog_mah_status_map seed records'],
        tests: [
            'normalizes casing, whitespace and punctuation',
            'maps known variants and buckets unknown values as unmapped',
            'seed map only targets choices that exist on the target table (bidirectional)',
            'preserves the raw status, maps it to the choice, and buckets unknown text as unmapped',
            'has no conflicting duplicate keys in the seed map',
            'supports lookups built from instance rows',
        ],
    },
    {
        kind: 'export',
        legacy: 'Keyword items (AwardName, Device, Carrier, Category, UnitOfIssue, Type, Font, FlagType …)',
        behaviour: 'Every legacy spelling maps to a target choice through a bidirectional value map; unknown spellings land in `unmapped_value` exceptions with a deterministic fallback',
        files: ['src/server/migration/valueMaps.ts', 'src/server/migration/rowTransforms.ts'],
        artefacts: ['x_cog_mah_migration_exception (unmapped_value)'],
        tests: [
            'every declared choice is reachable from a legacy spelling or explicitly target-only (bidirectional)',
            'unknown spellings are reported unmapped and fall back deterministically',
            'award names map by HRC code, then by catalog label, then to other',
        ],
    },
    {
        kind: 'export',
        legacy: 'Mixed date formats (Notes date/time, US, ISO, epoch)',
        behaviour: 'Normalized to GlideDateTime strings; unparseable values become `invalid_date` exceptions instead of guesses',
        files: ['src/server/lib/dates.ts', 'src/server/migration/rowTransforms.ts'],
        artefacts: ['x_cog_mah_migration_exception (invalid_date)'],
        tests: ['rejects garbage and impossible dates instead of guessing', 'handles epoch milliseconds'],
    },
    {
        kind: 'export',
        legacy: 'Response documents (ParentUNID) and duplicate business keys',
        behaviour: 'Parents resolved by legacy_unid; orphans quarantined; disagreeing envelope / form ParentUNID flagged; duplicate keys recorded',
        files: ['src/server/migration/rowTransforms.ts', 'src/server/migration/transformEngine.ts', 'src/server/migration/dryRun.ts', 'tools/lib/csv.ts'],
        artefacts: ['x_cog_mah_migration_exception (orphan_parent, contradictory_source, duplicate_business_key)'],
        tests: [
            'flags disagreeing envelope / form ParentUNID on AwardLine and uses the envelope value',
            'round-trips RFC 4180 quoting, CRLF, BOM and duplicate headers positionally',
            'replays the engine decisions: orphans, duplicate keys, merges, unmapped statuses, totals',
        ],
    },
    {
        kind: 'export',
        legacy: 'Reconciliation of the export against the target',
        behaviour: 'Source counts / totals computed offline by the dry run and compared check-by-check with the instance report',
        files: ['src/server/migration/compare.ts', 'src/server/services/reconciliation.ts', 'tools/migrate.ts', 'tools/reconcile.ts', 'src/includes/MAHReconciliation.js'],
        artefacts: ['GET /api/x_cog_mah/authorization_intake/reconciliation', 'MAHReconciliation'],
        tests: ['comparison passes on an identical target and names each differing check', 'builds the Import Set payload from staging columns plus batch traceability'],
    },
]

/** Domino design element → ServiceNow artefact, for the README mapping table. */
export const DOMINO_MAPPING: readonly { domino: string; servicenow: string; where: string }[] = [
    { domino: 'Database (vetmedals.nsf, heraldry.nsf)', servicenow: 'Scoped application `x_cog_mah`', where: 'now.config.json, src/fluent/' },
    { domino: 'Form', servicenow: 'Table (`Table` / `*Column`) with choices, references, audit', where: 'src/fluent/tables/*.now.ts' },
    { domino: 'View', servicenow: 'List layout, report, workspace list', where: 'src/fluent/ui/lists.now.ts, src/fluent/reports/' },
    { domino: 'Computed item / @Formula', servicenow: 'Before business rule calling a pure TypeScript module', where: 'src/fluent/rules/business_rules.now.ts, src/server/rules/' },
    { domino: 'QuerySave / PostSave agent', servicenow: 'Before / after business rule', where: 'src/server/rules/*.ts' },
    { domino: 'Scheduled LotusScript agent', servicenow: 'Scheduled script (`ScheduledScript`)', where: 'src/fluent/jobs/nightly_aging.now.ts' },
    { domino: 'Web-service / file-drop agent', servicenow: 'Scripted REST API', where: 'src/fluent/rest/authorization_intake.now.ts' },
    { domino: 'Mail agent (SendStatusMail)', servicenow: 'Event registry + notifications', where: 'src/fluent/notifications/' },
    { domino: 'ACL roles', servicenow: 'Roles + table / field ACLs', where: 'src/fluent/security/' },
    { domino: 'Readers / Authors fields', servicenow: 'Query business rules (vendor isolation)', where: 'src/server/rules/vendorIsolation.ts' },
    { domino: 'Action buttons', servicenow: 'UI actions', where: 'src/fluent/ui/ui_actions.now.ts' },
    { domino: 'Form events / hide-when formulas', servicenow: 'Client scripts / UI policies', where: 'src/fluent/ui/client_scripts.now.ts' },
    { domino: 'XPages', servicenow: 'Record producers (Service Portal) + native workspace', where: 'src/fluent/catalog/, src/fluent/workspace/' },
    { domino: 'DXL / CSV export', servicenow: 'Import Set staging tables, data sources, transform maps', where: 'src/fluent/migration/' },
    { domino: 'Domino log.nsf', servicenow: 'Structured JSON `gs.info` events', where: 'src/server/lib/logging.ts' },
]

/** Tables in the order the README lists them. */
export const TABLE_ORDER: readonly DomainTableKey[] = [
    'awards_case',
    'award_line',
    'requester',
    'authorization_file',
    'engraving_job',
    'shipment',
    'case_note',
    'heraldry_request',
    'request_line',
    'heraldic_item',
    'ses_flag_request',
    'vendor',
    'status_map',
    'migration_exception',
]

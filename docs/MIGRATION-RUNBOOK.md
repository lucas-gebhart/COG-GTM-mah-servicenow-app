# Migration runbook: HAAS (Domino) → MAH Case Management (`x_cog_mah`)

This runbook walks the legacy Domino application through to retirement using only the artefacts in
this repository. Every step names the file, script or instance record involved and the evidence that
gates the next step. Data shown is synthetic.

Phases: **1 Discover → 2 Characterize → 3 Convert → 4 Move data → 5 Validate → 6 Cut over → 7 Stabilize
and retire.** Phases 1–5 are repeatable rehearsals; phase 6 is the one-time event with a rollback path.

---

## 1. Discover

Goal: an inventory of what the legacy application contains, produced from the export itself rather than
from tribal knowledge.

| Step | Do | Artefact |
| --- | --- | --- |
| 1.1 | Pull the legacy export (`export/csv/*.csv`, `export/authorization-files/`, DXL design) from the sibling repository. | `../COG-GTM-haas-domino-legacy/export/` |
| 1.2 | List the forms the export actually contains and validate every header against the contract. Unknown files (e.g. `*-Profile.csv`) are reported and skipped, never silently loaded. | `npm run migrate -- --source <csv dir> --dry-run` → "discovered N files, K unexpected" |
| 1.3 | Record row counts per file; these are the **source control totals** for phase 5. | `out/expected.json` → `source_rows` |
| 1.4 | Confirm the design elements to replace (forms, views, agents, ACL roles, XPages) against the mapping table. | `README.md` → "Domino → ServiceNow mapping", `docs/EQUIVALENCE-MATRIX.md` |

Checkpoint D: every CSV header matches `csvHeader(form)` in `src/server/lib/legacyContract.ts`. A header
mismatch means the export or the contract changed and must be reconciled before any conversion work.

## 2. Characterize

Goal: know the data-quality problems before they become load failures.

The dry run replays the real transform functions (`src/server/migration/rowTransforms.ts`) against the
export in memory and produces the same warnings the instance will raise:

```bash
npm run migrate -- --source ../COG-GTM-haas-domino-legacy/export/csv --dry-run --out out/characterize
```

Read `out/characterize/expected.json`:

| Signal | Field | Action |
| --- | --- | --- |
| Free-text statuses with no mapping | `unmapped_status_count`, `exception_counts.unmapped_status` | Add aliases to `src/server/lib/statusMap.ts`, run `npm run gen:migration`, rerun |
| Lines whose parent is not in the export | `orphan_count` | Expected for a partial export; confirm against the Domino view "Lines\By Case" |
| Requesters duplicated across the two databases | `duplicate_merge_count` | Expected; survivor rule is "newest `legacy_last_modified` wins" (`src/server/lib/dedupe.ts`) |
| Envelope vs form disagreement (duplicate `ParentUNID` headers) | `exception_counts.contradictory_source` | Envelope value is used; each row is logged as an exception |
| Dates the parser cannot read | `exception_counts.invalid_date` | Extend `src/server/lib/dates.ts` only for formats that genuinely occur |
| Business key collisions | `exception_counts.duplicate_business_key` | Later row wins on coalesce; both UNIDs are kept in the exception |

Exception taxonomy (all land in `x_cog_mah_migration_exception`):

<!-- gen:exceptions -->
| Type | Meaning |
| --- | --- |
| `orphan_parent` | Orphaned line (parent UNID not found) |
| `unmapped_status` | Unmapped legacy status |
| `invalid_date` | Unparseable legacy date |
| `duplicate_requester` | Duplicate requester merged |
| `invalid_reference` | Unresolvable reference |
| `validation` | Contract validation failure |
| `rejected_row` | Row rejected by transform |
| `unmapped_value` | Legacy value has no target choice |
| `contradictory_source` | Contradictory legacy source data |
| `duplicate_business_key` | Duplicate legacy business key |

Exception states: `open` (Open) → `triaged` (Triaged) → `resolved` (Resolved) → `accepted` (Accepted as-is).
<!-- /gen:exceptions -->

Checkpoint C: `unmapped_status_count` is 0 (or every remaining raw status has a signed-off decision to
land in the `Unmapped` bucket), and every warning class has an owner.

## 3. Convert

Goal: the ServiceNow application is built, tested and installed on the target instance.

| Step | Do | Evidence |
| --- | --- | --- |
| 3.1 | `npm ci && npm run lint && npm test && npx now-sdk build` | all green |
| 3.2 | Confirm generated metadata is current: `npm run gen:ui -- --check`, `gen:security -- --check`, `gen:migration -- --check`, `gen:operations -- --check`, `gen:docs -- --check` | exit 0 (also enforced by the Vitest sync suites) |
| 3.3 | `npx now-sdk auth --add https://<instance>.service-now.com` then `npx now-sdk install` | application `MAH Case Management` present in *System Applications*, tables and roles listed below exist |
| 3.4 | Grant the synthetic test users (`src/fluent/security/test_users.now.ts`) or real users the roles in `README.md` → "Roles and access" | `sys_user_has_role` |
| 3.5 | Schedule `MAH Nightly Aging` (installed inactive-safe; confirm run time in *System Definition → Scheduled Jobs*) | job record |

Import Set artefacts installed by 3.3, one per legacy form:

<!-- gen:migration-artefacts -->
| Legacy form | Data source | Transform map |
| --- | --- | --- |
| Vendor | `MAH Legacy heraldry Vendor` | `MAH Vendor -> x_cog_mah_vendor` |
| HeraldicItem | `MAH Legacy heraldry HeraldicItem` | `MAH HeraldicItem -> x_cog_mah_heraldic_item` |
| Requester | `MAH Legacy vetmedals Requester` | `MAH Requester -> x_cog_mah_requester` |
| HeraldryRequester | `MAH Legacy heraldry Requester` | `MAH HeraldryRequester -> x_cog_mah_requester` |
| AuthorizationFile | `MAH Legacy vetmedals AuthorizationFile` | `MAH AuthorizationFile -> x_cog_mah_authorization_file` |
| AwardsCase | `MAH Legacy vetmedals AwardsCase` | `MAH AwardsCase -> x_cog_mah_awards_case` |
| AwardLine | `MAH Legacy vetmedals AwardLine` | `MAH AwardLine -> x_cog_mah_award_line` |
| EngravingJob | `MAH Legacy vetmedals EngravingJob` | `MAH EngravingJob -> x_cog_mah_engraving_job` |
| ShipmentRecord | `MAH Legacy vetmedals ShipmentRecord` | `MAH ShipmentRecord -> x_cog_mah_shipment` |
| CaseNote | `MAH Legacy vetmedals CaseNote` | `MAH CaseNote -> x_cog_mah_case_note` |
| Request | `MAH Legacy heraldry Request` | `MAH Request -> x_cog_mah_heraldry_request` |
| RequestLine | `MAH Legacy heraldry RequestLine` | `MAH RequestLine -> x_cog_mah_request_line` |
| SESFlagRequest | `MAH Legacy heraldry SESFlagRequest` | `MAH SESFlagRequest -> x_cog_mah_ses_flag_request` |

Every staging table also carries `mah_batch_id`, `mah_source_row`, `mah_source_file` so each target record and exception can be traced to the batch, file and physical CSV line it came from.
<!-- /gen:migration-artefacts -->

Checkpoint V0: install completed without errors; `GET /api/x_cog_mah/authorization_intake/health` returns
`ok` for an administrator.

## 4. Move data

Goal: load the export in dependency order, with every row traceable to its batch, file and line.

Load order (parents before children; both requester exports before any case or request):

<!-- gen:load-order -->
| # | Source CSV | Staging table | Target table | Business key | Status column | Parent |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `heraldry-Vendor.csv` | `x_cog_mah_stg_vendor` | `x_cog_mah_vendor` | `VendorKey` → `cage_code` | — | — |
| 2 | `heraldry-HeraldicItem.csv` | `x_cog_mah_stg_heraldic_item` | `x_cog_mah_heraldic_item` | `StockNumber` → `stock_number` | — | — |
| 3 | `vetmedals-Requester.csv` | `x_cog_mah_stg_requester` | `x_cog_mah_requester` | `RequesterID` → `legacy_number` | — | — |
| 4 | `heraldry-Requester.csv` | `x_cog_mah_stg_unit_requester` | `x_cog_mah_requester` | `RequesterKey` → `legacy_number` | — | — |
| 5 | `vetmedals-AuthorizationFile.csv` | `x_cog_mah_stg_authorization_file` | `x_cog_mah_authorization_file` | `FileName` → `file_name` | `ImportStatus` | — |
| 6 | `vetmedals-AwardsCase.csv` | `x_cog_mah_stg_awards_case` | `x_cog_mah_awards_case` | `CaseNumber` → `legacy_number` | `Stage` | — |
| 7 | `vetmedals-AwardLine.csv` | `x_cog_mah_stg_award_line` | `x_cog_mah_award_line` | `LineKey` → `` | `LineStatus` | ParentUNID → AwardsCase (unid) |
| 8 | `vetmedals-EngravingJob.csv` | `x_cog_mah_stg_engraving_job` | `x_cog_mah_engraving_job` | `JobNumber` → `legacy_number` | `JobStatus` | CaseNumber → AwardsCase (business_key) |
| 9 | `vetmedals-ShipmentRecord.csv` | `x_cog_mah_stg_shipment` | `x_cog_mah_shipment` | `ShipmentNumber` → `legacy_number` | `ShipStatus` | CaseNumber → AwardsCase (business_key) |
| 10 | `vetmedals-CaseNote.csv` | `x_cog_mah_stg_case_note` | `x_cog_mah_case_note` | — | — | ParentUNID → AwardsCase (unid) |
| 11 | `heraldry-Request.csv` | `x_cog_mah_stg_heraldry_request` | `x_cog_mah_heraldry_request` | `DocumentNumber` → `document_number` | `Status` | — |
| 12 | `heraldry-RequestLine.csv` | `x_cog_mah_stg_request_line` | `x_cog_mah_request_line` | `LookupKey` → `` | `LineStatus` | ParentUNID → Request (unid) |
| 13 | `heraldry-SESFlagRequest.csv` | `x_cog_mah_stg_ses_flag_request` | `x_cog_mah_ses_flag_request` | `SESFlagNumber` → `legacy_number` | `Status` | — |
<!-- /gen:load-order -->

```bash
export SN_INSTANCE_URL=https://<instance>.service-now.com
export SERVICENOW_PDI_USERNAME=…   # never on the command line of a shared shell
export SERVICENOW_PDI_PASSWORD=…
npm run migrate -- --source ../COG-GTM-haas-domino-legacy/export/csv --batch-id <yyyymmdd>-<label> --out out/<batch>
```

What happens, in order:

1. `tools/lib/sourceExport.ts` discovers and header-validates each file; duplicate headers are preserved
   positionally (`ParentUNID`, `ParentUNID_2`).
2. Rows are posted in chunks to `POST /api/now/import/<staging table>/insertMultiple` with
   `mah_batch_id`, `mah_source_file`, `mah_source_row` stamped on each staging row.
3. The transform map for that form runs `MAHMigration.onStart / onBefore / onAfter / onComplete`
   (`src/server/migration/transformEngine.ts`): status → choice via `x_cog_mah_status_map`, date
   normalization, parent resolution, orphan quarantine, business-key coalesce.
4. After all files: `POST /api/x_cog_mah/authorization_intake/migration/finalize` coalesces requesters
   across both source databases (`merged_into`), recomputes aging, and rolls up the batch's exception counts.
5. `GET /api/x_cog_mah/authorization_intake/reconciliation` is fetched and compared with the dry-run
   expectation; `comparison.json` and a human-readable table are written.

Re-running the same batch is safe: every transform coalesces on the legacy UNID (or business key), so a
second pass updates rather than duplicates.

Checkpoint M: `load.json` shows every file accepted with zero HTTP errors, and `finalize.json` shows the
batch id you passed.

## 5. Validate

Goal: prove source = target with numbers, not impressions.

<!-- gen:reconciliation-checks -->
44 checks, each reported as `OK` or `DIFF` with source and target values:

- `rows:*` — `x_cog_mah_authorization_file`, `x_cog_mah_award_line`, `x_cog_mah_awards_case`, `x_cog_mah_case_note`, `x_cog_mah_engraving_job`, `x_cog_mah_heraldic_item`, `x_cog_mah_heraldry_request`, `x_cog_mah_request_line`, `x_cog_mah_requester`, `x_cog_mah_ses_flag_request`, `x_cog_mah_shipment`, `x_cog_mah_vendor`
- `award_line_quantity_total`
- `request_line_extended_price_total`
- `orphan_count`
- `duplicate_merge_count`
- `unmapped_status_count`
- `exceptions:*` — `contradictory_source`, `duplicate_business_key`, `duplicate_requester`, `invalid_date`, `invalid_reference`, `orphan_parent`, `rejected_row`, `unmapped_status`, `unmapped_value`, `validation`
- `cases_by_stage:*` — `authorized`, `engraving`, `assembly_qc`, `warehouse`, `shipped`, `closed`, `cancelled`, `unmapped`
- `requests_by_state:*` — `draft`, `submitted`, `in_review`, `released_to_vendor`, `in_production`, `shipped`, `complete`, `cancelled`, `unmapped`
<!-- /gen:reconciliation-checks -->

```bash
npm run reconcile -- --source ../COG-GTM-haas-domino-legacy/export/csv --strict      # live instance
npm run reconcile -- --source sample-data --target-file out/<batch>/target.json  # offline replay
```

`--strict` exits non-zero on any `DIFF`. Beyond the counts:

| Check | How |
| --- | --- |
| Spot-check 10 cases end to end | Open `MAH Operations → Awards cases → All`, filter `legacy_unid` on a UNID from the CSV, compare stage, requester, lines, shipments with the Domino document |
| Requester merges | `x_cog_mah_requester` where `merged_into` is not empty: survivor has the newest `legacy_last_modified`; both UNIDs present |
| Orphans | `x_cog_mah_migration_exception` type `orphan_parent`: the quoted parent UNID is genuinely absent from the export |
| Status fidelity | `legacy_status_raw` is verbatim on every record; `x_cog_mah_status_map` rows with `seeded=false` are the ones added during characterization |
| Aging | After `MAH Nightly Aging` (run it once manually: *Scheduled Jobs → Execute Now*), `cases_by_aging_flag` matches `expected.json` |
| Security | Impersonate `mah.vendor.liberty`: heraldry request list shows only that vendor's requests; internal tables are inaccessible |

Checkpoint V1 (go / no-go for cut-over): `comparison.json` `ok: true`, spot checks signed off, security
check signed off, aging job ran cleanly, exception queue triaged (every exception `triaged`, `resolved`
or `accepted_as_is`).

## 6. Cut over

Goal: switch users from Domino to ServiceNow with a defined freeze window and a tested rollback.

| Step | Do | Rollback |
| --- | --- | --- |
| 6.1 Freeze | Set the Domino databases read-only (ACL: all roles → Reader). Announce the freeze window. | Restore ACL |
| 6.2 Final export | Run the HAAS DXL / CSV export one last time; note the row counts. | — |
| 6.3 Final load | Phase 4 with a new `--batch-id`. Only deltas change because every transform coalesces on the UNID. Then map `x_cog_mah_vendor.portal_user` / `user_group` for each active vendor (`legacy_vendor_users` holds the Notes canonical name to match). | Delete records where `sys_created_on` ≥ freeze **and** `legacy_unid` is empty, or restore the pre-load update set / clone |
| 6.4 Final validate | Phase 5 in `--strict` mode; compare against the 6.2 counts. | If `DIFF` → stay on Domino, lift freeze, fix, repeat from 6.2 |
| 6.5 Go / no-go | Sign-off from TACOM MAH lead, DLA liaison and the platform owner on: comparison `ok`, exception queue empty of `open`, REST intake tested with a real authorization file, notifications routed. | — |
| 6.6 Switch | Enable the record producers on Employee Center, publish the `MAH Operations` workspace, point the HRC / NPRC file feed at `POST /api/x_cog_mah/authorization_intake`, set `MAH Nightly Aging` active. | Disable producers / workspace; re-point the feed to Domino |
| 6.7 Unfreeze | Domino stays read-only as the historical reference for the stabilization period. | — |

Rollback decision owner: platform owner. Rollback window: until 6.6 is executed and the first
authorization file has been accepted by the new intake; after that, roll forward with fixes.

## 7. Stabilize and retire

| Period | Activity | Artefact |
| --- | --- | --- |
| Week 1 | Daily review of `MAH Operations → Migration exceptions` and the `Aging red` queue; daily `npm run reconcile -- --strict` against the frozen export to confirm no drift in legacy-owned fields | `comparison.json` per day |
| Week 1–2 | Watch the JSON security log (`x_cog_mah` source in *System Logs*) for `authorization_failure` and `data_change_blocked` spikes — they indicate role gaps, not attacks, in the first days | `src/server/lib/logging.ts` events |
| Week 2 | Retire the Domino mail agents (`SendStatusMail`) and the `NightlyAging` agent; confirm the ServiceNow notifications fire on stage change, vendor release and aging red | `src/fluent/notifications/` |
| Week 4 | Archive the Domino databases (read-only NSF + DXL) to records management; remove Domino ACL roles | — |
| Week 6 | Close the migration: mark remaining `accepted_as_is` exceptions, disable the `x_cog_mah_stg_*` data sources, keep staging rows for the audit retention period | `x_cog_mah_migration_exception`, data sources |

Retirement criterion: 30 consecutive days with no lookup into the Domino reference copy and a clean
weekly reconciliation.

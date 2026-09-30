# Migration runbook: HAAS (Domino) → MAH Case Management (Native) (`x_cog_mah_native`)

Same seven gates as v1's runbook (`../docs/MIGRATION-RUNBOOK.md`) — **1 Discover → 2 Characterize →
3 Convert one slice → 4 Move data → 5 Validate → 6 Cut over (go / no-go, rollback) → 7 Stabilize and
retire** — with the native differences called out, plus the **in-instance v1 → v2** option for a customer
that already runs the custom-table build. Labels: **[repository-derived]** / **[verified on the PDI]** /
**[proposed]**. Data is synthetic.

## 1. Discover [repository-derived]

Inputs are unchanged: the 13-file DXL/CSV export (`sample-data/`, or `../COG-GTM-haas-domino-legacy/export/csv`)
and the contract in `src/server/lib/legacyContract.ts` (identical to v1's copy; `tests/` fails on drift).
New in v2: discover the **platform** side too — existing `core_company` rows that may already represent
vendors/agencies (coalesce on name/CAGE rather than create duplicates), existing `cmdb_model` categories,
and the instance's `task` business rules and SLA schedules that will now apply to MAH records.

Checkpoint D: every CSV header validates against `csvHeader(form)`; `npm run migrate -- --dry-run` writes
`expected.json` (row counts, totals, orphan/duplicate/unmapped expectations) with no HTTP call.

## 2. Characterize [repository-derived]

The dry run (`src/server/migration/dryRun.ts`) replays the transform decisions offline. For `sample-data`
it reports 455 UNIDs (all distinct), 8 orphan child rows across 5 forms, 4 duplicate-requester groups, 15
rows with unmapped statuses, 3 unparseable dates and the seeded contradictions (closed without closed date,
extended-price mismatch, quantity over max, non-uppercase engraving, returned shipment). Every one of them
becomes a **native import outcome** instead of a custom exception row:

| Finding | v1 landing place | v2 landing place |
| --- | --- | --- |
| Orphan child (parent UNID unresolved) | `x_cog_mah_migration_exception` (orphan_parent) | staging row state `error`, comment `orphan_parent: Quarantined: parent not found` |
| Unmapped status | exception (unmapped_status) + target `stage=unmapped` | target `stage=unmapped` (task `state=open`), staging comment `unmapped_status: <raw>` on a row in state `inserted` |
| Unparseable date | exception (invalid_date) | staging comment `invalid_date: <column>=<raw>`; column left empty |
| Duplicate requester key | exception (duplicate_key) + `merged_into` | `merged_into` on the requester; staging comment `duplicate_key` |
| Case note | own record | journal entry (`work_notes`) on the parent case, staging row `inserted` with `mah_journal_target` set |

## 3. Convert one slice [repository-derived]

Slice = **vendors + catalog + one awards case with its lines, engraving job and shipment.** Load the first
two files and one case's rows (`--only heraldry-Vendor.csv,heraldry-HeraldicItem.csv,...` or a trimmed CSV
directory) and open the case: number `NMAH…`, `state` derived from `stage`, `opened_at` from `EnteredDate`,
two `task_sla` rows running (or breached, because the start is retroactive), activity stream holding the
migrated notes, child engraving job and shipment in related lists.

Checkpoint C: the slice reconciles (`rows:*` OK for the involved tables) and the SLA related list shows
the 60 d / 75 d definitions with the expected elapsed percentage.

## 4. Move data [repository-derived]

Load order (parents before children; both requester exports before any case or request):

| # | Source CSV | Staging table | Target table | Business key | Status column | Parent |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `heraldry-Vendor.csv` | `x_cog_mah_native_stg_vendor` | `core_company` | `VendorKey` | — | — |
| 2 | `heraldry-HeraldicItem.csv` | `x_cog_mah_native_stg_heraldic_item` | `x_cog_mah_native_catalog_item` | `StockNumber` | — | — |
| 3 | `vetmedals-Requester.csv` | `x_cog_mah_native_stg_requester` | `x_cog_mah_native_requester` | `RequesterID` | — | — |
| 4 | `heraldry-Requester.csv` | `x_cog_mah_native_stg_unit_requester` | `x_cog_mah_native_requester` | `RequesterKey` | — | — |
| 5 | `vetmedals-AuthorizationFile.csv` | `x_cog_mah_native_stg_authorization_file` | `x_cog_mah_native_authorization_file` | `FileName` | `ImportStatus` | — |
| 6 | `vetmedals-AwardsCase.csv` | `x_cog_mah_native_stg_awards_case` | `x_cog_mah_native_awards_case` | `CaseNumber` | `Stage` | — |
| 7 | `vetmedals-AwardLine.csv` | `x_cog_mah_native_stg_award_line` | `x_cog_mah_native_award_line` | `LineKey` | `LineStatus` | ParentUNID → AwardsCase (unid) |
| 8 | `vetmedals-EngravingJob.csv` | `x_cog_mah_native_stg_engraving_job` | `x_cog_mah_native_engraving_job` | `JobNumber` | `JobStatus` | CaseNumber → AwardsCase (business_key) |
| 9 | `vetmedals-ShipmentRecord.csv` | `x_cog_mah_native_stg_shipment` | `x_cog_mah_native_shipment` | `ShipmentNumber` | `ShipStatus` | CaseNumber → AwardsCase (business_key) |
| 10 | `vetmedals-CaseNote.csv` | `x_cog_mah_native_stg_case_note` | `x_cog_mah_native_awards_case` (journal) | — | — | ParentUNID → AwardsCase (unid) |
| 11 | `heraldry-Request.csv` | `x_cog_mah_native_stg_heraldry_request` | `x_cog_mah_native_heraldry_request` | `DocumentNumber` | `Status` | — |
| 12 | `heraldry-RequestLine.csv` | `x_cog_mah_native_stg_request_line` | `x_cog_mah_native_request_line` | `LookupKey` | `LineStatus` | ParentUNID → Request (unid) |
| 13 | `heraldry-SESFlagRequest.csv` | `x_cog_mah_native_stg_ses_flag_request` | `x_cog_mah_native_ses_flag_request` | `SESFlagNumber` | `Status` | — |

```bash
export SN_INSTANCE_URL=https://<instance>.service-now.com
export SERVICENOW_PDI_USERNAME=…   # never on the command line of a shared shell
export SERVICENOW_PDI_PASSWORD=…
npm run migrate -- --batch-id <yyyymmdd>-<label> --out out/<batch>       # --source defaults to ../sample-data
```

What happens, in order:

1. `tools/lib/sourceExport.ts` discovers and header-validates each file (duplicate `ParentUNID` kept positionally).
2. Rows are posted one at a time, in source order, to `POST /api/now/import/<staging table>` with
   `mah_batch_id`, `mah_source_file`, `mah_source_row` stamped on the staging row. The single-row route
   transforms synchronously and returns the per-row outcome.
3. The transform map runs `MAHNativeMigration.onStart / onBefore / onAfter / onComplete`
   (`src/server/migration/transformEngine.ts`): status → `stage` via `x_cog_mah_native_status_map`, `stage` →
   native `state`/`active`/`priority`, date normalisation (`opened_at` from the legacy entered date so SLAs
   start retroactively), parent resolution to `parent` / the case reference, orphan quarantine as row state
   `error`, business-key coalesce. Vendors coalesce into `core_company` on CAGE; heraldic items into the
   `cmdb_model` extension on `model_number`; case notes become journal entries on the parent.
4. After all files: `POST /api/x_cog_mah_native/mah_operations/migration/finalize` coalesces requesters
   across both source databases (`merged_into`). There is **no aging recompute and no exception roll-up**:
   the SLA engine and the Import Set run already hold that state.
5. `GET /api/x_cog_mah_native/mah_operations/reconciliation` is fetched and compared with the dry-run
   expectation; `comparison.json` and a table are written.

Re-running the same batch is safe: every transform coalesces on `legacy_unid` (or business key). The
**Import Set Runs** module shows each batch with inserted / updated / error / ignored counts; **Import Log**
holds the engine's messages.

Checkpoint M: `load.json` shows every file accepted with zero HTTP errors, exactly the expected
`quarantined` count, and the import set run's `error` rows equal the dry-run orphan count.

## 5. Validate [repository-derived]

`npm run reconcile -- --strict` compares, check by check: `rows:<table>` for every reconciled table
(companies with `x_cog_mah_native_legacy_unid` count as the vendor table), `award_line_quantity_total`,
`request_line_extended_price_total`, `orphan_count`, `duplicate_merge_count`, `unmapped_status_count`,
`exceptions:<kind>` (from staging comments), `journal_entries` (case notes), `cases_by_stage:*`,
`cases_by_task_state:*`, `requests_by_stage:*`. The report also carries `import_row_states`, `sla.active` /
`sla.breached` and queue sizes for the dashboard narrative.

In the instance the same evidence is native: **Import Set Runs**, **Import Errors / Ignored**, the
**MAH Native operations** dashboard (cases by stage / task state, SLA breached and at risk, import
exceptions) and the **Task SLA** related list on any migrated case. Nothing custom renders it.

Checkpoint V: `comparison.ok = true` (or every `DIFF` explained and accepted in writing).

## 6. Cut over [proposed]

| Step | Do | Rollback |
| --- | --- | --- |
| 6.1 Freeze | Domino databases read-only; announce the window. | Restore ACL |
| 6.2 Final export | Last DXL/CSV export; record counts. | — |
| 6.3 Final load | Phase 4 with a new `--batch-id` (deltas only, coalesce on UNID). Then `npm run grant-roles` and set `sys_user.company` for every real vendor user (the platform's company link replaces v1's `portal_user`). | Delete records where `sys_created_on` ≥ freeze **and** `legacy_unid` is empty, or restore the pre-load clone |
| 6.4 Final validate | Phase 5 `--strict` against 6.2 counts. | If `DIFF` → stay on Domino, lift freeze, fix, repeat from 6.2 |
| 6.5 Go / no-go | Sign-off from TACOM MAH lead, DLA liaison, platform owner: comparison `ok`, no `error` staging rows left unexplained, Import Set intake tested with a real authorization file, SLAs running (`task_sla` rows present on open cases), approval flow tested end to end, notifications routed. | — |
| 6.6 Switch | Enable the record producers on Employee Center, publish the dashboard and VTB, point the HRC / NPRC feed at `POST /api/now/import/x_cog_mah_native_stg_authorization_line`, activate the flows and SLA definitions. | Disable producers; re-point the feed; deactivate flows |
| 6.7 Unfreeze | Domino stays read-only as the historical reference. | — |

Rollback owner: platform owner. Window: until 6.6 and the first accepted authorization file; afterwards
roll forward.

## 6b. In-instance option: v1 `x_cog_mah` → v2 `x_cog_mah_native` [proposed]

For a customer already on the custom-table build the source is not Domino but the v1 tables on the same
instance. The staging tables and transform maps are reused unchanged because v1 preserved the legacy
contract fields (`legacy_unid`, `legacy_number`, `legacy_status_raw`, dates):

1. **Extract** — Table API `GET /api/now/table/x_cog_mah_<table>?sysparm_fields=<contract columns>` (or
   an export set) per v1 table, in the same `LOAD_ORDER`. `legacy_unid` is the join key; where v1 has no
   legacy value (records created after cut-over) use `sys_id` as the source UNID so lineage still resolves.
2. **Map** — a thin column mapping v1 column → legacy contract column (v1's `UI_LAYOUT`/`legacyContract`
   make this mechanical: v1 stored the legacy names in `legacy_*` fields and normalised values in the
   target columns). Case notes → journal, vendors → `core_company`, heraldic items → `cmdb_model`,
   migration exceptions are **not** carried over (they are v1 operational history, kept read-only).
3. **Load / validate** — phases 4–5 as above. The v1 reconciliation report (`x_cog_mah_reconciliation.do`)
   and v2's JSON must agree on row counts and totals, which is the showcase's "same data, two builds" proof.
4. **Coexist** — both apps stay installed; v1 read-only (ACLs → read) for the stabilisation period. Number
   prefixes are disjoint by design, so no renumbering.
5. **Retire v1** — uninstall `x_cog_mah` only after the retention period; export its `sys_audit` rows first.

## 7. Stabilize and retire [proposed]

| Period | Activity | Artefact |
| --- | --- | --- |
| Week 1 | Daily review of **Import Errors / Ignored** and the **SLA breached** report; daily `npm run reconcile -- --strict` | `comparison.json` per day |
| Week 1–2 | Watch the JSON security log (`x_cog_mah_native` source) for `authorization_failure` / `data_change_blocked` spikes — role gaps, not attacks | `src/server/lib/logging.ts` events |
| Week 2 | Retire the Domino mail agents and `NightlyAging`; confirm the task notifications and the **Task SLA breached** notification fire | `src/fluent/notifications/` |
| Week 4 | Archive the Domino databases; remove Domino ACL roles | — |
| Week 6 | Close the migration: disable the `x_cog_mah_native_stg_*` data sources, keep staging rows and import logs for the audit retention period | Import Set runs |

Retirement criterion: 30 consecutive days with no lookup into the Domino reference copy and a clean
weekly reconciliation.

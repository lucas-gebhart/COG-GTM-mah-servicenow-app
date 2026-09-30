# MAH Case Management (Native) (`x_cog_mah_native`)

Second implementation of the U.S. Army TACOM ILSC **Medals, Awards & Heraldry (MAH)** mission, built
with the same [ServiceNow SDK](https://servicenow.github.io/sdk/) / Fluent toolchain as the custom-table
build in the repository root (`x_cog_mah`, "v1"), but **platform-native wherever the platform has the
capability**: the six operational work-item tables extend `task`, vendors and source agencies are
`core_company`, the heraldic catalog is a `cmdb_model` extension, aging is a running Task SLA, supervisor
review is the native approval engine, intake is the Import Set API, and reporting is native reports, a
responsive dashboard and Visual Task Boards. The two builds install side by side on one instance so the
showcase can compare "custom-heavy" and "platform-native" on the same mission and the same synthetic data.

> All data is **synthetic**. The real Army MAH system's technology stack is not confirmed; the Domino/XPages
> lineage is a public-evidence hypothesis modelled by the sibling `COG-GTM-haas-domino-legacy` export.

Claims in this directory are labelled **[repository-derived]** (provable from the code and tests here),
**[verified on the PDI]** (screenshot in `docs/SCREENS.md`) or **[proposed]** (design intent, not yet exercised).

## Architecture [repository-derived]

```
sample-data/*.csv (v1 legacy export, unchanged)
        │  POST /api/now/import/x_cog_mah_native_stg_<form>      (native Import Set API)
        ▼
x_cog_mah_native_stg_* (13 staging tables)  ──transform maps──►  MAHNativeMigration script include
        │   status_map lookups · date normalisation · requester dedupe · orphan quarantine (row state = error)
        ▼
task ─┬─ x_cog_mah_native_awards_case        ◄── x_cog_mah_native_award_line ──► x_cog_mah_native_catalog_item (cmdb_model)
      ├─ x_cog_mah_native_engraving_job      (parent = case)          x_cog_mah_native_requester (PII, custom)
      ├─ x_cog_mah_native_shipment           (parent = case)          core_company (+ 9 scoped columns: vendors & agencies)
      ├─ x_cog_mah_native_authorization_file (intake work item, file = sys_attachment)
      ├─ x_cog_mah_native_heraldry_request   ◄── x_cog_mah_native_request_line ──► catalog_item
      └─ x_cog_mah_native_ses_flag_request
platform engines: Task SLA (contract_sla 60d amber / 75d red) · approvals (sysapproval_approver) · assignment rules ·
                  journals (work_notes / comments) · attachments · notifications · reports / dashboard · Visual Task Board
```

Server logic that has no native equivalent (DD 1348-6 validators, pricing, authorization-file parser, the
legacy contract, status map, dedupe) is the same pure TypeScript as v1, copied under `src/server/lib/` and
guarded by `tests/` (the ported v1 test titles). Everything the platform does natively — numbering, state,
activity stream, attachments, aging, approvals, assignment, reporting — has **no MAH code**.

## Table map [repository-derived]

| v1 table (standalone) | v2 table | Extends | Number | Notes |
| --- | --- | --- | --- | --- |
| `x_cog_mah_awards_case` | `x_cog_mah_native_awards_case` | `task` | `NMAH` | `stage` choice drives `state`/`active`; Task SLA measures age; `priority` from handling priority |
| `x_cog_mah_award_line` | `x_cog_mah_native_award_line` | — | `NMAL` | child of case; `award_model` → catalog model |
| `x_cog_mah_requester` | `x_cog_mah_native_requester` | — | `NMAR` | veteran / next-of-kin / unit PII, deliberately **not** `sys_user` (see NATIVE-VS-CUSTOM) |
| `x_cog_mah_authorization_file` | `x_cog_mah_native_authorization_file` | `task` | `NMAF` | file is a native attachment; parse status = task state; links to the Import Set run |
| `x_cog_mah_engraving_job` | `x_cog_mah_native_engraving_job` | `task` | `NMEJ` | parent = case; assignment rule → Engraving Shop; Visual Task Board lanes |
| `x_cog_mah_shipment` | `x_cog_mah_native_shipment` | `task` | `NMSH` | parent = case; created by the lifecycle flow on warehouse hand-off |
| `x_cog_mah_case_note` | **retired** | — | — | `work_notes` / `comments` journal on the case (`sys_journal_field`) |
| `x_cog_mah_vendor` | `core_company` (`vendor=true`) | — | — | scoped columns `x_cog_mah_native_cage_code`, `_poc`, `_poc_email`, `_contract_number`, `_lead_time_days`, `_legacy_unid`, … |
| `source_agency` choice | `core_company` (HRC, NPRC, Other) | — | — | one registry for agencies and vendors |
| `x_cog_mah_heraldic_item` | `x_cog_mah_native_catalog_item` | `cmdb_model` | model number | `model_number` = NSN, `cost` = unit price, `manufacturer` = vendor company; also the award / device catalog (`catalog_kind`) |
| `x_cog_mah_heraldry_request` | `x_cog_mah_native_heraldry_request` | `task` | `NHRQ` | `company` = vendor company → vendor isolation; `approval` set by the review flow |
| `x_cog_mah_request_line` | `x_cog_mah_native_request_line` | — | `NHRL` | `model` → catalog model; extended price by business rule |
| `x_cog_mah_ses_flag_request` | `x_cog_mah_native_ses_flag_request` | `task` | `NSES` | |
| `x_cog_mah_status_map` | `x_cog_mah_native_status_map` | — | `NMSM` | transform-map lookup, seeded |
| `x_cog_mah_migration_exception` | **retired** | — | — | `sys_import_set_row` in state `error` / `ignored` with `sys_import_state_comment`, plus `import_log` |
| nightly aging job, `days_in_stage`, `aging_flag` | **retired** | — | — | `contract_sla` × 2 on the case table; `task_sla` rows carry the timers |

Number prefixes are `NUMBER_PREFIXES` in `src/server/lib/domain.ts`; none collide with v1's
(`V1_NUMBER_PREFIXES` is asserted disjoint by `tests/`). Every target table keeps `legacy_unid` (unique) so
Domino lineage survives.

### Lifecycle → task state

`stage` is the business lifecycle (same choice values as v1); `TASK_STATE_BY_STAGE` in `domain.ts` maps it
onto the native integer `state` and `active`, so "My Work", "My Groups Work", Task SLAs, VTB and the
standard task reports all work without MAH code:

| Table | Open | Pending | Work in progress | Closed complete | Closed incomplete |
| --- | --- | --- | --- | --- | --- |
| awards_case | authorized | — | engraving, assembly_qc, warehouse, shipped | closed | cancelled |
| heraldry_request | draft | submitted, in_review | released_to_vendor, in_production, shipped | complete | cancelled |
| ses_flag_request | draft | submitted | approved, in_production | delivered | rejected (cancelled = skipped) |
| engraving_job | queued | qc_hold | in_progress, rework | complete | cancelled |
| shipment | pending | — | label_created, in_transit | delivered | returned, lost |
| authorization_file | received | — | parsing | parsed | partial, failed |

## Platform functionality used instead of code [repository-derived]

| Capability | Native artefact | Where |
| --- | --- | --- |
| Aging 60 d amber / 75 d red | `contract_sla` "MAH Native awards case - amber (60d)" / "- red (75d)"; start `stage=authorized`, pause `on_hold=true`, stop shipped/closed/cancelled, retroactive start on `opened_at` | `src/fluent/sla/awards_case_sla.now.ts` |
| Supervisor review of DD 1348-6 | Flow "MAH Native Heraldry request review approval": submitted → in_review → *Ask for approval* (TACOM Awards Staff group) → approved (stamps `approved_at`) or rejected (back to draft) | `src/fluent/workflows/request_review.now.ts` |
| Warehouse hand-off / shipped follow-through | Flow "MAH Native Awards case lifecycle": child shipment task, customer-facing `comments`, 21-day delivery follow-up note | `src/fluent/workflows/awards_case_lifecycle.now.ts` |
| Vendor release follow-up | Flow "MAH Native Heraldry request vendor release": 5-day acknowledgement chase to `work_notes`, ship date → shipped | `src/fluent/workflows/vendor_release.now.ts` |
| Work routing | `sysrule_assignment` × 7 → Engraving Shop, Assembly and QC, Warehouse, TACOM Awards Staff | `src/fluent/security/assignment_rules.now.ts`, `groups.now.ts` |
| Vendor isolation | query business rules on `task.company == gs.getUser().getCompanyID()` for `x_cog_mah_native.vendor`; child lines through their request; field ACLs | `src/server/rules/vendorIsolation.ts`, `src/fluent/security/acls.now.ts` |
| Intake | `POST /api/now/import/x_cog_mah_native_stg_authorization_line` → transform map creates the authorization-file task, cases and lines, coalescing on the source record id; bad rows stay in state `error` | `src/fluent/migration/`, `src/server/intake/` |
| Reporting | 13 `sys_report` (cases by stage / task state, SLA breached / at risk, queues, released by vendor company, import errors), `par_dashboard` "MAH Native operations", `vtb_board` engraving queue | `src/fluent/reports/operations.now.ts` |
| Notifications | stage changed, request submitted / released, SES submitted (task tables) and Task SLA breached (`task_sla`) | `src/fluent/notifications/` |
| Journals, attachments, approvals, SLAs on forms | standard task form sections + related lists `task_sla.task`, `sysapproval_approver.sysapproval` on every task table | `src/fluent/ui/forms.now.ts`, `related_lists.now.ts` |
| Self-service | record producers: status inquiry, DD 1348-6 request, SES flag request | `src/fluent/catalog/record_producers.now.ts` |

What stayed custom, and why: `requester` (PII of people who are not platform users), `award_line` /
`request_line` (line items with MAH-specific pricing and engraving rules), `status_map` (transform lookup),
the DD 1348-6 / NSN / CAGE validators and the authorization-file parser (mission rules with no platform
equivalent), and one small Scripted REST API (`/api/x_cog_mah_native/mah_operations`) for the
reconciliation report and the post-load requester coalesce, because a browser or `curl` cannot call a
Script Include directly. See `docs/NATIVE-VS-CUSTOM.md` for the trade-offs and the numbers.

## Roles and test users [repository-derived]

Eight roles, `x_cog_mah_native.tacom_staff`, `.csr`, `.engraver`, `.assembler`, `.warehouse`, `.vendor`,
`.dla`, `.admin` — the same matrix as v1 (`src/server/lib/security.ts`), rendered into ACLs by
`npm run gen:security`. The synthetic principals are the **same users v1 creates**: `mah.tacom`, `mah.csr`,
`mah.engraver`, `mah.assembler`, `mah.warehouse`, `mah.dla`, `mah.admin` and the vendor user
`mah.vendor.clearfield` (group `MAH Native - Vendor Clearfield Colors and Regalia`). Role grants, group
membership and the vendor user's `sys_user.company` (→ the Clearfield `core_company`, CAGE `1CLR7`) are not
application files, so run `npm run grant-roles` once after install; it is idempotent and never touches v1's
`x_cog_mah_vendor.portal_user`, so v1's vendor isolation is unaffected. No passwords ship: impersonate from
an admin session.

## Build, test, install

Prerequisites: Node.js 20+, npm 10+. Run everything from this `native/` directory.

```bash
npm ci
npm run lint          # eslint + tsc --noEmit (strict)
npm test              # vitest: ported v1 titles + metadata sync
npx now-sdk build     # compiles and validates the Fluent metadata
```

```bash
npx now-sdk auth --add https://<instance>.service-now.com   # credentials go to the SDK credential store, never this repo
npm run deploy                                               # now-sdk build && now-sdk install: deploys x_cog_mah_native
npm run grant-roles                                          # roles, group membership, vendor user → company
```

`.env.example` lists what the tooling reads (`SN_INSTANCE_URL`, `SERVICENOW_PDI_USERNAME`,
`SERVICENOW_PDI_PASSWORD`); copy it to `.env` (git-ignored) or export in your shell. `now.config.json`
holds only scope, scope id and application name.

### npm scripts

| Script | Runs |
| --- | --- |
| `npm run build` / `deploy` / `transform` / `types` | `now-sdk build` / `build && install` / `transform` / `dependencies` |
| `npm run lint` | `eslint . && tsc -p tsconfig.json --noEmit` |
| `npm test` | `vitest run` |
| `npm run migrate` | `tsx tools/migrate.ts` — Import Set API load of `../sample-data` in dependency order, then finalize + reconcile |
| `npm run reconcile` | `tsx tools/reconcile.ts` — source vs target JSON comparison |
| `npm run grant-roles` | `tsx tools/grant-roles.ts` |
| `npm run inventory` | `tsx tools/inventory.ts [--json]` — the NATIVE-VS-CUSTOM numbers, from both trees |
| `npm run gen:ui` / `gen:security` / `gen:migration` | regenerate lists/forms/related lists, ACLs/test users, staging tables/data sources/transform maps |

## Migration and reconciliation

```bash
npm run migrate -- --dry-run                                 # offline expectation from ../sample-data
npm run migrate -- --batch-id 20260930-sample                # load through POST /api/now/import/<staging>, finalize, reconcile
npm run reconcile -- --strict                                # re-compare any time; JSON written to out/
```

Order: companies → models → requesters → authorization files → cases → lines → engraving → shipments →
(case notes → journal) → requests → request lines → SES. Orphans come back as Import Set `error` rows
("Quarantined: parent not found") and are counted as `quarantined`, not as load failures. The reconciliation
JSON reports source vs target rows per table, award-line quantity and request-line price totals, orphan /
duplicate / unmapped-status counts, `legacy_unid` coverage, journal entries, cases by task state, import row
states and SLA active/breached counts. The in-instance view is the **Import Set Runs / Import Errors /
Import Log** modules plus the operations dashboard — no custom exception table or UI page. The full
procedure, including the in-instance v1 → v2 option, is `docs/MIGRATION-RUNBOOK.md`.

## Documentation

- `docs/NATIVE-VS-CUSTOM.md` — the showcase comparison, capability by capability, with reproducible numbers
- `docs/EQUIVALENCE-MATRIX.md` — v1's behaviour matrix with the v2 native artefact and proving test per row
- `docs/MIGRATION-RUNBOOK.md` — discover → characterize → convert → move → validate → cut over → retire
- `docs/SCREENS.md` — PASS/FAIL evidence table with screenshots under `docs/screens/`

## Security posture [repository-derived]

Same bar as v1: whitelist validation and length limits on every user-supplied value (`validators.ts`),
parameterised GlideRecord queries only, generic user-facing errors, one-line JSON security events
(`logging.ts`, `app: x_cog_mah_native`, secret-looking keys redacted), no hard-coded secrets, table and
field ACLs generated from one access matrix, vendor multi-tenancy through the platform's company model.

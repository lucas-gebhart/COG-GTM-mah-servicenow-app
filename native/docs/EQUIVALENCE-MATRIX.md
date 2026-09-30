# Equivalence matrix: legacy HAAS behaviour → v1 `x_cog_mah` → v2 `x_cog_mah_native`

v1's matrix (`../docs/EQUIVALENCE-MATRIX.md`, generated from `../tools/lib/docs-catalog.ts`) is the behavioural
specification. This file adds, per row, the v2 native artefact and the proving evidence: a Vitest title in
`native/tests/` (exact quote), `now-sdk build` for pure metadata, or a `docs/SCREENS.md` row once verified on
the PDI. Labels: **[repository-derived]** / **[verified on the PDI]** / **[proposed]**.

### Validation (@Formula input translation / QuerySave checks)

| Legacy behaviour | v1 artefact | v2 native artefact | Proven by (v2) |
| --- | --- | --- | --- |
| Request form: DODAAC validation | BR "MAH Heraldry request - DD 1348-6 validation and release lock"; client script | same validator (`src/server/lib/validators.ts`) in BR "MAH Native Heraldry request - DD 1348-6 validation and release lock" and client script "MAH Native DD1348-6: DODAAC format" on `x_cog_mah_native_heraldry_request` | "accepts a well-formed Army DODAAC and rejects bad ones" |
| Request form: UIC validation | as above | as above, "MAH Native DD1348-6: UIC format" | "requires UIC to be W + 5 alphanumerics" |
| Request form: requisition priority designator | as above | as above, "MAH Native DD1348-6: requisition priority guidance"; RPD also drives native `task.priority` | "bounds requisition priority to 01–15"; "RPD accepts 1..15 in any spelling and rejects the rest" |
| Request form: document number | as above | as above, "MAH Native DD1348-6: document number format" | "validates the 14-character document number structure"; "computes day differences and Julian dates" |
| Request form: project / fund code | BR | same BR | "validates project and fund codes when present" |
| Request form: header validation summary | BR + client script | same BR + "MAH Native DD1348-6: header hints and release lock" | "aggregates header issues per field" |
| AwardLine form: engraving text | BR "MAH Award line - validate quantity and engraving"; client script | BR "MAH Native Award line - validate quantity and engraving"; "MAH Native award line: engraving text whitelist" | "limits engraving text to 60 engravable characters" |
| AwardLine / RequestLine: quantity bounds | BRs | same BRs on the v2 line tables | "bounds quantities" |
| RequestLine: NSN or exception code | BR "MAH Request line - catalog copy-down and extended price" | same BR; copy-down reads `cmdb_model.model_number` / `cost` from `x_cog_mah_native_catalog_item` | "accepts NSNs with or without dashes and EXC- exception codes" |
| Vendor form: CAGE code | BR "MAH Vendor - validate CAGE code and contacts" on `x_cog_mah_vendor` | BR on **`core_company`** validating `x_cog_mah_native_cage_code` and setting `vendor=true` (`src/server/rules/reference.ts`) | "validates CAGE codes (no I or O)" |
| All forms: free-text items | validators + LIMITS | identical validators + LIMITS (copied module) | "rejects dangerous characters in free text"; "validates UNIDs, e-mail, phone" |

### Rules (computed items, QuerySave / PostSave agents)

| Legacy behaviour | v1 artefact | v2 native artefact | Proven by (v2) |
| --- | --- | --- | --- |
| RequestLine ExtendedPrice; request totals | `pricing.ts`, BRs, client scripts | same `pricing.ts`, BR "MAH Native Request line - roll up request totals", client scripts "extended price (quantity / unit price)" | "rounds extended price to cents"; "totals request lines" |
| "Request has been released to vendor and may not be modified" | `stageMachine.ts`, BR, client script | same message/fields; UI policy "lock header after release to vendor" now locks inherited `company`; release additionally requires native `approval = approved` | "identifies frozen fields after release"; "uses the legacy message when cancelling after release" |
| Request state transitions | stage machine + UI actions + vendor-release flow | same stage machine on `stage`; native `state` follows (`TASK_STATE_BY_STAGE`); UI actions Submit / Start review / Release / Advance / Cancel; flows "vendor release" and **"review approval"** (Ask for approval → TACOM group) | "requires a valid header and lines to submit, a vendor to release"; "lets vendors progress production and shipping only"; "the review flow asks the TACOM group for approval through the native approval engine" |
| AwardsCase stage transitions | stage machine, BR, UI actions, lifecycle flow | same guards; lifecycle flow creates the child **shipment task** on warehouse hand-off and writes to `comments`/`work_notes` | "walks the forward path one stage at a time"; "enforces role ownership of each stage"; "blocks shipping with open lines and closing without a shipment"; "allows cancellation from any open stage and supervisor one-step rollback"; "lets TACOM repair unmapped migrated cases" |
| AwardsCase DaysInStage / AgingFlag | `aging.ts`, nightly job, 2 columns, banner | **retired** → `contract_sla` × 2 (60 d / 75 d) on `x_cog_mah_native_awards_case`, `task_sla` timers, breach notification; status inquiry reads the SLA band | "one contract_sla per non-green aging flag with the matching threshold in days"; "the clock pauses on hold and stops at shipment and at the terminal stages; no persisted aging column is referenced"; "open cases at the fixed clock spread across the three Task SLA bands (green / amber 60d / red 75d)" |
| Requester DedupeKey / merge duplicates | `dedupe.ts`, BRs, UI action, finalize | identical `dedupe.ts`; finalize via `POST /api/x_cog_mah_native/mah_operations/migration/finalize` (coalesce only — no aging recompute) | "a legacy-merged requester keeps its pointer, counts as a merge, and never competes for survivor"; "produces the same key for the same person regardless of formatting"; "uses unit-scoped keys for units and e-mail fallback for thin records"; "coalesces duplicates deterministically onto the newest record" |
| EngravingJob / ShipmentRecord PostSave advance parent | `fulfilment.ts` BRs | same BRs on the task-derived job/shipment tables; `parent` = case | `now-sdk build` [repository-derived]; SCREENS lifecycle row |

### Agents (scheduled, web-service, mail)

| Legacy behaviour | v1 artefact | v2 native artefact | Proven by (v2) |
| --- | --- | --- | --- |
| NightlyAging (scheduled) | "MAH Nightly Aging" job + `MAHAging` | **no job** — the SLA engine | inventory: scheduled jobs 1 → 0; SLA rows in SCREENS |
| ImportAuthorizationFile (file drop) | Scripted REST `/api/x_cog_mah/authorization_intake` | **Import Set API** `POST /api/now/import/x_cog_mah_native_stg_authorization_line` + transform map → authorization-file task, cases, lines; bad rows → state `error` | "parses and normalizes …" (authFileParser titles); SCREENS intake row |
| SendStatusMail | 5 notifications / 4 events | same events on task tables + "MAH Native awards case Task SLA breached" on `task_sla` | `now-sdk build`; SCREENS notification row |
| Security / audit logging | `logging.ts` (`app: x_cog_mah`) | same module, `app: x_cog_mah_native` | "strips control characters and clamps length"; "redacts secret-looking keys and emits one-line JSON" |

### Roles and Readers fields

| Legacy behaviour | v1 artefact | v2 native artefact | Proven by (v2) |
| --- | --- | --- | --- |
| ACL roles ×8 | `x_cog_mah.*` roles + generated ACLs | `x_cog_mah_native.*` roles + generated ACLs on the v2 tables (task-level ACLs inherited) | "roles.now.ts declares exactly the eight domain roles in the v2 scope"; "acls.now.ts and test_users.now.ts match the security generator output" |
| Named test principals | `test_users.now.ts`, `grant-test-roles.ts` | same users; `tools/grant-roles.ts` also sets `mah.vendor.clearfield.company` → Clearfield `core_company` | "grant plan resolves every role to its x_cog_mah_native name and every group to its display name" |
| Readers fields (vendor visibility) | query BRs on `vendor.portal_user` | query BRs on `task.company == gs.getUser().getCompanyID()`; lines via their request (`src/server/rules/vendorIsolation.ts`) | SCREENS vendor-impersonation row [proposed until verified] |

### Views, Forms, XPages, Export / migration

| Legacy behaviour | v1 artefact | v2 native artefact | Proven by (v2) |
| --- | --- | --- | --- |
| Domino views | generated lists / forms / related lists | generated lists / forms (standard task sections) / related lists incl. `task_sla.task`, `sysapproval_approver.sysapproval` | "every MAH table reference is in the x_cog_mah_native scope (no v1 table leaks)" |
| Operator views (queues, aging) | operations catalog → reports, dashboard, UI Builder workspace | 13 `sys_report`, `par_dashboard` "MAH Native operations", `vtb_board` engraving queue, standard task modules | `now-sdk build`; SCREENS dashboard / VTB rows |
| Domino forms → tables | 14 custom tables | 6 task extensions, 1 `cmdb_model` extension, 4 standalone, `core_company` augmentation | "covers every legacy form and target table (both directions)"; "retired v1 concepts (case_note, migration_exception, aging columns, vendor table) do not exist as production metadata" |
| XPages | 3 record producers | same 3 record producers targeting the v2 task tables | `now-sdk build`; SCREENS producer row |
| DXL / CSV export (13 files) | staging + data source + transform map per form | identical generated set in the v2 scope (`MAHNativeMigration`) | "generated files avoid Fluent parser gotchas (no spread, satisfies or helper functions)"; "every header equals csvHeader(form) exactly, including the repeated ParentUNID" |
| Free-text Status item | `x_cog_mah_status_map` | `x_cog_mah_native_status_map` (seeded) | "normalizes casing, whitespace and punctuation"; "maps …" (statusMap titles) |
| Keyword items, mixed dates, orphans, duplicates | exceptions in `x_cog_mah_migration_exception` | Import Set rows in state `error` / `ignored`, comment prefixed with the exception kind | "replays the engine decisions: orphans, duplicate keys, merges, unmapped statuses, totals" |
| Reconciliation | Scripted REST + UI page | `GET /api/x_cog_mah_native/mah_operations/reconciliation` + `tools/reconcile.ts` JSON; native import-run reports | "comparison passes on an identical target and names each differing check" |

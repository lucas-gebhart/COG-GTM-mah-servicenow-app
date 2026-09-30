# Native vs custom: the same mission, two builds

Comparison artefact for the showcase. `x_cog_mah` (v1, repository root) implements the MAH mission with
fourteen standalone custom tables and hand-written logic; `x_cog_mah_native` (v2, `native/`) delivers the
same capability on ServiceNow's platform tables and engines wherever the platform has them. Both are
installed side by side on the showcase instance and loaded from the same synthetic legacy export.

Labels: **[repository-derived]** = provable from code/tests in this repository; **[verified on the PDI]** =
screenshot in `docs/SCREENS.md`; **[proposed]** = design intent, not exercised on an instance yet.

## Capability by capability [repository-derived unless labelled]

| Capability | v1 approach → artefact | v2 approach → native artefact | Code that disappeared | What was gained | What was given up / trade-off |
| --- | --- | --- | --- | --- | --- |
| **Numbering** | Per-table `number` string column + auto-number per custom table (`MAH…`, `HRQ…`); prefixes managed in `domain.ts` | Task extensions inherit `task.number` through `sys_number` (`NMAH`, `NHRQ`, `NSES`, `NMEJ`, `NMSH`, `NMAF`); only the three non-task children keep an own counter | six `number` column definitions, number-format checks in rules | Global task uniqueness, search by number across "all tasks", number visible in every native task list/board | Prefix family had to change (`N…`) to avoid colliding with v1 on one instance |
| **State** | Custom `stage`/`state` choice per table + hand-written `stageMachine.ts` guard rails, `active` semantics coded per table | `stage` choice kept for the mission vocabulary; `TASK_STATE_BY_STAGE` maps it onto native `state` + `active`; forward-only guards remain light business rules using the ported validators | per-table `active`/`closed_at` bookkeeping, workspace state filters | "My Work"/"My Groups Work", task state reports, closed/active filters, VTB lanes for free | Two lifecycle fields on the record (`stage` and `state`); stage machine still custom because the platform has no MAH-specific transition model |
| **Assignment** | `assigned_to` column per table, no routing; roles only | Inherited `assigned_to`/`assignment_group` + 7 `sysrule_assignment` (Engraving Shop, Assembly and QC, Warehouse, TACOM Awards Staff) + 4 `sys_user_group` | nothing to delete (v1 had no routing); prevents a future custom router | Work routed on insert/stage change; group queues; escalation/reassignment UI | Groups must exist on the instance (shipped as app files) |
| **Journal / activity** | `x_cog_mah_case_note` table (own ACLs, list, form, transform map, 30 sample rows) + `CaseNote` migration | Retired: `work_notes` / `comments` on the task; case notes migrate as journal entries on the parent case | 1 table, its 20+ columns, ACLs, list/form, related list, the note-specific rule; ~250 lines | Activity stream on every task form, journal history, e-mail reply-to-journal, `sys_journal_field` audit | Notes lose their own record identity (`legacy_unid` of a note is not kept as a column; the parent's is) |
| **Attachments** | Authorization file stored as text/metadata columns (`file_name`, `raw_size`, …) | Authorization file is a `sys_attachment` on the authorization-file **task**; parse status = task state | file-content columns, size bookkeeping | Native viewer, virus scan hooks, attachment ACLs, drag-and-drop | Content must be attached, not posted as a column |
| **SLA / aging** | Nightly scheduled job `MAHAging` recomputes `days_in_stage` / `aging_flag`; two SLA definitions declared but **inert** (table did not extend `task`); aging banner client script | 2 `contract_sla` on the case table (60 d amber, 75 d red; start `authorized`, pause `on_hold`, stop shipped/closed/cancelled, retroactive on `opened_at`) — they **actually run**; breach notification on `task_sla`; SLA reports | `aging.ts`, `nightlyAging.ts`, `MAHAging` script include, 2 columns, the scheduled job, aging reports & banner (~400 lines) | Live timers on the form, pause/resume, schedule-aware business time if wanted, SLA repair, breach/at-risk reports, SLA timeline UI | Aging is no longer a stored column you can `GROUP BY` without joining `task_sla`; retroactive start depends on `opened_at` being migrated |
| **Approvals** | Supervisor one-step rollback coded in `stageMachine.ts` / UI action, no approval record | Flow "Heraldry request review approval": *Ask for approval* to TACOM Awards Staff → `sysapproval_approver`; approval result gates "Release to vendor" | rollback branch of the action handler, custom review state bookkeeping | Native My Approvals, e-mail approve/reject, approval history, delegation | An approval is asynchronous: the showcase must approve in My Approvals rather than click one button |
| **Notifications** | 5 notifications + 4 events on custom tables, red-aging event fired by the nightly job | Same business notifications on the task tables + **Task SLA breached** notification on `task_sla` | the aging-red event and its firing code | Breach notifications are engine-driven, exact-time | none |
| **Reporting** | 10 `sys_report` + `par_dashboard` + custom aging/exception reports on custom columns | 13 `sys_report` on task tables, `task_sla` (breached / at risk) and `sys_import_set_row` (exceptions), `par_dashboard`, `sys_report_source` × 5 | aging-flag and migration-exception reports | Standard task reports (by state, assignment group), SLA reports, import run reports all apply | none |
| **Workspace / boards** | UI Builder workspace `MAH Operations` (`/x/cog/mah-operations/home`) with route ACL, list categories, 10 modules; `WORKSPACE.md` | Standard task modules (My Work, My Groups Work, My Approvals, Task SLA), `vtb_board` engraving queue laned by `stage`, dashboard; no custom workspace | 1 workspace, its route ACL, list categories, 220 lines of docs | Visual Task Boards, standard navigator experience, zero workspace maintenance | No bespoke workspace landing page (a Configurable Workspace can be added later without code) |
| **Intake API** | Scripted REST `/api/x_cog_mah/authorization_intake` (JSON or delimited body, custom parser, custom idempotence) | Import Set API `POST /api/now/import/x_cog_mah_native_stg_authorization_line` + transform map creating authorization-file task, cases, lines; coalesce on source record id; parser reused for delimited files attached to the task | intake REST resource, its auth/rate/size handling, custom idempotence keys | Import set runs, import logs, row-level error states, retry from the UI, standard auth | Health/status inquiry still needs a tiny Scripted REST (`/api/x_cog_mah_native/mah_operations`: reconciliation + finalize), documented as unavoidable |
| **Migration exceptions** | `x_cog_mah_migration_exception` table, roll-up in finalize, exception reports, UI page | Retired: staging rows stay in `sys_import_set_row` state `error` / `ignored` with `sys_import_state_comment` (prefixed category), `import_log` entries; modules "Import Errors / Ignored", "Import Log" | 1 table, 15 columns, its rules and reports, the reconciliation UI page + `reconciliationHtml.ts` (~350 lines) | Native import run reports, per-row retry, no second copy of the error | Exception "kinds" live in a comment prefix, not a choice column |
| **Multi-tenancy / vendor isolation** | Query BR on `vendor.portal_user` / `user_group` plus vendor FK on each request table | Vendor = `core_company` (`vendor=true`); vendor user's `sys_user.company`; query BRs on `task.company == gs.getUser().getCompanyID()`, child lines through their request; field ACLs unchanged | vendor table, portal-user mapping logic in grant tool | The platform's standard company-based tenancy; company hierarchy; one registry for vendors and agencies (HRC/NPRC) | `core_company` is global: scoped columns carry the `x_cog_mah_native_` prefix and the CAGE/POC data is visible to anyone with `core_company` read |
| **Audit** | `sys_audit` on custom tables + JSON security log lines | Same `sys_audit` (task tables are audited) + `sys_journal_field` history + `sys_history_line` on forms + approval and SLA history | none removed; the custom "who changed the stage" note-writing | History sets, activity formatter, approval audit for free | none |
| **Catalog / vendors** | `x_cog_mah_heraldic_item` + `x_cog_mah_vendor` custom tables | `x_cog_mah_native_catalog_item` extends `cmdb_model` (`model_number` = NSN, `cost`, `manufacturer` = vendor company); vendors are `core_company` | 2 tables, ~45 columns, their ACLs, list/forms | Product catalog, model categories, manufacturer linkage | `cmdb_model` brings ~35 inherited columns and CMDB semantics that do not all apply |
| **Requester (PII)** | custom `x_cog_mah_requester` | **kept custom** (`x_cog_mah_native_requester`) on purpose | — | — | Veterans / next of kin are not platform users: putting them on `sys_user` would create login-capable identities, expose them to user pickers and HR/ITSM logic, and conflate PII retention with account lifecycle |

## The numbers [repository-derived, `npm run inventory`]

Generated by `tools/inventory.ts` from both trees with the same rules (only columns the app defines are
counted; inherited `task` / `cmdb_model` columns are not).

| Metric | v1 `x_cog_mah` | v2 `x_cog_mah_native` | Δ |
| --- | ---: | ---: | ---: |
| Custom tables (created by the app) | 14 | 11 | -3 |
| Platform tables augmented (`core_company`) | 0 | 1 | +1 |
| … of which extend `task` | 0 | 6 | +6 |
| Custom columns defined on those tables | 380 | 282 | -98 |
| Scoped columns added to platform tables | 0 | 9 | +9 |
| Import Set staging tables (migration only) | 13 | 13 | 0 |
| Import Set staging columns (migration only) | 424 | 424 | 0 |
| Business rules | 24 | 23 | -1 |
| Script includes | 4 | 3 | -1 |
| Client scripts | 10 | 10 | 0 |
| UI policies | 10 | 10 | 0 |
| UI actions | 10 | 10 | 0 |
| ACLs | 132 | 114 | -18 |
| Flow Designer flows | 2 | 3 | +1 |
| Scheduled jobs | 1 | 0 | -1 |
| SLA definitions (`contract_sla`) | 2 (inert) | 2 (running) | 0 |
| Scripted REST APIs | 1 | 1 | 0 |
| UI Builder workspaces | 1 | 0 | -1 |
| UI pages | 1 | 0 | -1 |
| Lines of server-side script (TypeScript + JS producers/includes) | 8101 | 7586 | -515 |
| Server-side script files | 43 | 38 | -5 |
| Lines of client-side script | 155 | 157 | +2 |

Reading the numbers honestly:

- **Tables 14 → 11.** Three tables disappeared (`case_note`, `vendor`, `heraldic_item` → journal, `core_company`,
  `cmdb_model`) and `migration_exception` (counted in v1's 14) went to Import Set rows. The eleven that remain
  include six `task` extensions, one `cmdb_model` extension, and four genuinely standalone tables
  (`award_line`, `request_line`, `requester`, `status_map`).
- **Columns 380 → 282 (+9 on `core_company`).** The drop is the retired tables plus the aging/number/active/
  closed bookkeeping the task family now provides. What is *not* in the v2 count: the ~70 columns each task
  extension inherits (`number`, `state`, `priority`, `assigned_to`, `work_notes`, `sla_due`, …) and the
  ~35 on `cmdb_model`. The mission's own vocabulary (DD 1348-6 header, veteran identity, ship-to, engraving)
  is the same size in both builds — that is the part no platform table models.
- **Server-side lines 8101 → 7586.** Most of the mission's TypeScript is shared pure logic (validators,
  pricing, parser, contract, status map, dedupe, row transforms: ~4 500 lines) and is identical by design.
  The genuine deletions are aging (~300), reconciliation HTML/UI page (~350), intake REST (~250), exception
  roll-up and case-note handling; the additions are the task-state mapping and the SLA-band status inquiry.
- **Business rules 24 → 23, ACLs 132 → 114.** Rules barely move because the guard rails (validation,
  release lock, forward-only) are mission rules, not platform gaps. ACLs shrink with the retired tables;
  task-level ACLs and `core_company` read are inherited and not counted.
- **What v2 added on the platform side**: 7 assignment rules, 4 groups, a VTB board, 5 report sources,
  an approval flow and a Task SLA breach notification — all declarative records, none of them script.
- **Trade-offs**: task inheritance brings columns and Task-level business rules the mission does not need
  (e.g. `cmdb_ci`, `contact_type`); `core_company` and `cmdb_model` are global tables so the MAH columns
  on them carry the scope prefix and are visible to other applications; requester PII stayed custom by
  choice; a small Scripted REST API remains for reconciliation.

## Verified on the PDI

See `docs/SCREENS.md`. Until that table shows PASS for a row, treat the corresponding capability as
**[repository-derived]** (the metadata builds and the tests pass) rather than **[verified on the PDI]**.

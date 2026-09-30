# On-instance evidence (`dev399979`)

PASS/FAIL table for the platform-native build, same shape as v1's `../docs/SCREENS.md`. A row is
**[verified on the PDI]** only when its screenshot exists under `docs/screens/`; until then it is
**PENDING** and the capability is only **[repository-derived]** (metadata builds, tests pass).

| # | Check | Result | Screenshot |
| --- | --- | --- | --- |
| 1 | v1 regression: application menu, Awards Cases list, case form, `MAH Operations` workspace, `x_cog_mah_reconciliation.do` still render with data | PASS | [menu](screens/v1-01-app-menu.png), [list](screens/v1-02-awards-case-list.png), [form](screens/v1-03-awards-case-form.png), [workspace](screens/v1-04-workspace.png), [reconciliation](screens/v1-05-reconciliation.png) |
| 2 | v2 application menu "MAH Case Management (Native)" with standard task modules | PASS | [menu](screens/v2-01-app-menu.png) |
| 3 | Every v2 list (awards cases, lines, requesters, authorization files, engraving jobs, shipments, heraldry requests, request lines, SES flag requests, catalog items, companies, import sets) | PASS | [cases](screens/v2-02-list-awards_case.png), [requests](screens/v2-03-list-heraldry_request.png), [SES](screens/v2-04-list-ses_flag_request.png), [engraving](screens/v2-05-list-engraving_job.png), [shipments](screens/v2-06-list-shipment.png), [award lines](screens/v2-07-list-award_line.png), [request lines](screens/v2-08-list-request_line.png), [requesters](screens/v2-09-list-requester.png), [auth files](screens/v2-10-list-authorization_file.png), [companies](screens/v2-11-list-companies.png), [catalog](screens/v2-12-list-catalog.png), [import sets](screens/v2-13-list-import_sets.png) |
| 4 | Awards case form: activity stream (migrated case notes), Task SLA related list, approvals, attachments | PASS | [form + Task SLAs (2) + Approvers related lists, SLA timeline link](screens/v2-33-case-form-breached-sla.png), [attachment on a case](screens/v2-34-case-form-attachment.png) |
| 5 | Heraldry request lifecycle: Draft → Submit → In Review with a native approval (2 TACOM approvers) → approve → Release to Vendor → edit blocked; reject → back to Submitted | PASS | [released request: banner "Request has been released to vendor and may not be modified", Approval = Approved](screens/v2-30-request-form-released.png), [sysapproval_approver rows Approved / Rejected / No Longer Required](screens/v2-31-approvals-list.png), [rejected request back in Submitted](screens/v2-32-request-form-rejected.png) |
| 6 | Visual Task Board of engraving jobs (lanes = stage) | PASS (after `npm run vtb-sync`) | [board with 5 lanes and cards](screens/v2-21-vtb-engraving.png) |
| 7 | Dashboard "MAH Operations (Native)" (Platform Analytics) | PASS | [dashboard](screens/v2-20-dashboard.png) |
| 8 | Vendor impersonation (`mah.vendor.clearfield`) sees only Clearfield requests via `task.company` | PASS | [impersonated list: 4 of 30 requests, all Clearfield](screens/v2-36-vendor-impersonated-requests.png) |
| 9 | Import Set API intake (`POST /api/now/import/x_cog_mah_native_stg_authorization_line` → authorization-file task + case + lines) and the run/log with a deliberately bad row in `error` | PASS | [import set](screens/v2-26-intake-import-set.png), [staging rows: inserted / ignored (duplicate) / error](screens/v2-27-intake-rows.png), [error rows list](screens/v2-14-list-import_rows_error.png), [exception report](screens/v2-23-report-import-errors.png) |
| 10 | SLA breach: backdated case shows breached `task_sla`; breach notification | PARTIAL | [breached task_sla rows](screens/v2-25-task-sla-list.png), [case with breached SLAs](screens/v2-33-case-form-breached-sla.png); see note 1 |
| 11 | Native report on breached SLAs; released requests by vendor | PASS | [breached SLAs](screens/v2-22-report-breached-sla.png), [released by vendor](screens/v2-24-report-released-by-vendor.png) |
| 12 | Notifications: request submitted / released-to-vendor emails generated on the task tables | PASS (generated, not delivered) | [sys_email rows in state send-ready](screens/v2-35-notifications-sys_email.png); see note 1 |

All rows above are **[verified on the PDI]** on 2026-09-30 against `x_cog_mah_native` installed from this branch;
the lifecycle in row 5 was driven through the Table API (same business rules, flow and approval engine as the UI)
and then inspected in the browser. The v1 rows were captured on the same instance after the v2 install.

## Notes and limits

1. **Email delivery.** `glide.email.smtp.active` is `false` on the PDI, so every notification stops in `sys_email`
   as `send-ready` (row 12). The SLA-breach notification (`MAH Native Awards case SLA breached`, on `task_sla`,
   `has_breached CHANGES TO true` or insert) did **not** produce a `sys_email` row for the backdated cases: their
   `task_sla` rows were created already breached by the SLA engine and the notification's insert trigger was only
   added in the last install. Breached-state and reporting are verified; the breach e-mail itself is **[proposed]**
   until re-tested on a case that crosses 75 days while running.
2. **Visual Task Board cards.** The board and its five lanes ship as metadata (`vtb_board`, `vtb_lane`); on this
   PDI the platform did not generate `vtb_card` rows for existing or newly inserted engraving jobs, so
   `npm run vtb-sync` creates them (idempotent). Cards move lanes with `stage` once they exist (platform behaviour,
   not re-verified here).
3. **`authorization_file_task`.** The case → authorization-file reference is named `authorization_file_task` because
   the PDI never materialised a physical column called `authorization_file` on the task-extending table
   (dictionary row present, `isValidField()` false); any other name worked.
4. **Install prerequisite.** `sn_appauthor.all_company_keys` on the PDI is periodically reset to `2226893` by a
   platform job; `cog` was appended only for the duration of each install and restored immediately afterwards
   (same procedure the v1 install used). v1 was unaffected: its counts and pages were re-checked after every install.
5. **Approval group.** The review flow's "Ask for approval" skips silently when the approver group has no members;
   `npm run grant-roles` now puts `mah.tacom` and `mah.admin` in *MAH Native - TACOM Awards Staff*.

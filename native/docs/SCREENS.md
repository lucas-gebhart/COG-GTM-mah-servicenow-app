# On-instance evidence (`dev399979`)

PASS/FAIL table for the platform-native build, same shape as v1's `../docs/SCREENS.md`. A row is
**[verified on the PDI]** only when its screenshot exists under `docs/screens/`; until then it is
**PENDING** and the capability is only **[repository-derived]** (metadata builds, tests pass).

| # | Check | Result | Screenshot |
| --- | --- | --- | --- |
| 1 | v1 regression: application menu, Awards Cases list, case form, `MAH Operations` workspace, `x_cog_mah_reconciliation.do` still render with data | PENDING | — |
| 2 | v2 application menu "MAH Case Management (Native)" with standard task modules | PENDING | — |
| 3 | Every v2 list (awards cases, lines, requesters, authorization files, engraving jobs, shipments, heraldry requests, request lines, SES flag requests, catalog items, companies) | PENDING | — |
| 4 | Awards case form: activity stream (migrated case notes), Task SLA related list with running 60 d / 75 d timers, approvals, attachments | PENDING | — |
| 5 | Heraldry request lifecycle: validation errors → Draft → Submit → In Review (native approval) → approve → Release to vendor → edit blocked | PENDING | — |
| 6 | Visual Task Board of engraving jobs (lanes = stage) | PENDING | — |
| 7 | Dashboard "MAH Native operations" | PENDING | — |
| 8 | Vendor impersonation (`mah.vendor.clearfield`) sees only Clearfield requests via `task.company` | PENDING | — |
| 9 | Import Set API intake (`curl` → authorization-file task + case + lines) and the run/log with a deliberately bad row in `error` | PENDING | — |
| 10 | SLA breach: backdated case shows breached `task_sla` and the breach notification | PENDING | — |
| 11 | Native report on breached SLAs | PENDING | — |

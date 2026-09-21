# MAH Operations workspace and operational reports

Part of the `x_cog_mah` (MAH Case Management) modernization reference application.

## Purpose

Fulfilment staff, engravers, assemblers, warehouse staff, DLA and vendors each work a queue.
`MAH Operations` gives them one place that answers the operational questions directly — how
many awards cases are open in each stage, how many are past the 60/75-day aging thresholds,
what is waiting for engraving / assembly-QC / shipment, what is at vendors, and which legacy
records still carry statuses the migration could not map — instead of a generic list of
records. Everything in this document is derived from the domain source of truth
(`src/server/lib/domain.ts`, `security.ts`, `uiLayout.ts`); nothing is hand-copied.

## What is Fluent, what is generated, what is raw XML, what is manual

| Layer | Delivery | Location |
|---|---|---|
| 14 operational reports (`sys_report`) + 4 report sources (`sys_report_source`) | Fluent `Record()`, **generated** | `src/fluent/reports/operations_reports.now.ts` |
| `MAH Operations` workspace (`Workspace`, `UxListMenuConfig`, `Applicability`) | Fluent native, **generated** | `src/fluent/workspace/mah_operations_workspace.now.ts` |
| `MAH Operations` dashboard (`Dashboard`, 18 widgets, workspace visibility) | Fluent native, **generated** | same file |
| Workspace route ACL (`ux_route`, `now.mah-operations.*`) | Fluent `Acl()`, **generated** | same file |
| 8 application modules + separator under the existing app menu | Fluent `Record()` on `sys_app_module`, **generated** | `src/fluent/ui/operations_modules.now.ts` |
| Catalog (queries, buckets, columns, layout, roles) | TypeScript source of truth | `tools/lib/operations-catalog.ts` |
| Generator | `npx tsx tools/generate-fluent-operations.ts` (`--check` fails when stale) | `tools/generate-fluent-operations.ts` |
| Drift test | Vitest | `tests/operations-sync.test.ts` |
| Raw XML under `metadata-xml/` | **none** — every record is produced by `now-sdk build` | — |
| Manual steps on the instance | **none** to install; optional tuning listed under "What remains manual" | — |

The four `.now.ts` files are generated rather than hand-written because the Fluent parser only
accepts literals inside metadata calls (no spread, helper functions or `satisfies`). The
catalog imports `CASE_STAGES`, `AGING_FLAGS`, `AGING_THRESHOLDS`, `ENGRAVING_STATUSES`,
`REQUEST_STATES`, `EXCEPTION_TYPES`, `EXCEPTION_STATES`, `ROLES`, `TABLES`, `TABLE_ACCESS` and
the list layouts, partitions every taxonomy into named buckets (for example
`open` / `terminal` / `exception` stages), and renders encoded queries such as
`stageINauthorized,engraving,assembly_qc,warehouse`. The test asserts every partition covers
its taxonomy exactly (both directions), pins control totals, and re-renders the generator in
memory to prove the checked-in files match. Do not edit the generated files by hand.

## Installed metadata

### Reports (`sys_report`)

Report sources are table-scoped on the platform, so "MAH Operations" is one source per
operational table (`MAH Operations — awards case`, `— engraving job`, `— heraldry request`,
`— migration exception`), each filtered to `active=true`. Every report is published, scoped
to the read roles of its table from `TABLE_ACCESS`, and bound to its source.

| Required concept | Report | Type | Table | Query / grouping |
|---|---|---|---|---|
| Cases by stage | Open awards cases by stage | bar | awards case | open stages, group by `stage` |
| Aging distribution | Open awards cases by aging flag | donut | awards case | open stages, group by `aging_flag` |
| Red-aging list | Aging — red (75+ days) | list | awards case | open ^ `aging_flag=red`, newest aging first |
| (companion) | Aging — amber (60–74 days) | list | awards case | open ^ `aging_flag=amber` |
| (companion) | Awards cases on hold | list | awards case | open ^ `on_hold=true` |
| Engraving queue | Engraving queue by status / Engraving queue | bar + list | engraving job | open statuses (`queued,in_progress,qc_hold,rework`), group by `status` |
| Assembly/QC queue | Assembly / QC queue | list | awards case | `stage=assembly_qc` |
| Warehouse ready-to-ship | Warehouse ready-to-ship queue | list | awards case | `stage=warehouse` |
| Vendor work | Vendor work by vendor and state / Vendor work | bar + list | heraldry request | vendor states (`released_to_vendor,in_production,shipped`), group by `vendor`, stacked by `state` |
| Unmapped legacy statuses | Awards cases with unmapped legacy status / Unmapped legacy statuses | list + list | awards case / migration exception | `stage=unmapped`; `exception_typeINunmapped_status,unmapped_value` and open exception states |
| Migration exceptions by type | Open migration exceptions by type | horizontal bar | migration exception | open exception states, group by `exception_type` |

List columns come from the same layouts as the platform list views (`src/server/lib/uiLayout.ts`),
and the generator refuses to emit a report that references a column the Fluent table
definitions do not declare.

### Workspace (`sys_ux_app_config`, `sys_ux_page_registry`, routes, lists)

* Title `MAH Operations`, URL path `/now/mah-operations`, landing route `home`.
* Routes generated by the SDK: `home` (dashboard), `list`, `simplelist`, `record`.
* Four list categories — *Awards cases*, *Engraving*, *Heraldry*, *Migration* — with nine lists
  that reuse the report queries and columns above (`sys_ux_list`, `sys_ux_list_category`).
* Each list carries an applicability whose roles are exactly the read roles of its table
  (`sys_ux_applicability`), so a vendor only sees the *Heraldry* category and an engraver sees
  *Awards cases* and *Engraving*.
* Route ACL `now.mah-operations.*` (type `ux_route`, operation `read`) grants the workspace to
  every role that may read awards cases; the vendor role is intentionally not included (vendors
  use the `Vendor work` module and the heraldry request list view). Record-level ACLs are owned
  by `src/fluent/security/acls.now.ts` and are not duplicated here.

### Dashboard (`par_dashboard`, `par_dashboard_tab`, `par_dashboard_canvas`, `par_dashboard_widget`, `par_dashboard_visibility`)

The SDK's `Dashboard()` API produces a Platform Analytics dashboard (the `par_*` tables) rather
than the legacy Performance Analytics `pa_dashboards` / `sys_grid_canvas` set; it is bound to
the workspace by a `par_dashboard_visibility` record, which is why `now/mah-operations/home`
opens it. The grid is 48 columns wide. One tab, *Operations*:

| Row (y) | Widgets |
|---|---|
| 0 | 8 counters (`single-score`, 6 columns each): Open awards cases, Red (75+ days), Amber (60+ days), On hold, Engraving jobs open, Requests at vendors, Open migration exceptions, Unmapped legacy statuses |
| 7 | Open awards cases by stage (vertical bar), Open awards cases by aging flag (donut), Engraving queue by status (vertical bar) |
| 21 | Aging — red list, Assembly / QC queue list (`list-simple`, 15 rows each) |
| 35 | Warehouse ready-to-ship list, Vendor work list |
| 49 | Vendor work by vendor and state (vertical bar), Open migration exceptions by type (horizontal bar), Unmapped legacy statuses list |

Every widget's data source is the same table + encoded query as the report it mirrors; the test
asserts that binding and that no widget exceeds the 48-column grid.

### Application modules (`sys_app_module`)

Added under the existing `MAH Case Management` application menu after a `MAH Operations`
separator, without editing `src/fluent/ui/app_menu.now.ts`:

| Module | Link | Roles |
|---|---|---|
| Operations dashboard | `now/mah-operations/home` | awards-case readers (tacom_staff, csr, engraver, assembler, warehouse, dla, admin) |
| Aging — red | report *Aging — red (75+ days)* | awards-case readers |
| Aging — amber | report *Aging — amber (60–74 days)* | awards-case readers |
| Engraving queue | report *Engraving queue* | engraving-job readers (tacom_staff, csr, engraver, assembler, admin) |
| Assembly/QC queue | report *Assembly / QC queue* | awards-case readers |
| Warehouse queue | report *Warehouse ready-to-ship queue* | awards-case readers |
| Vendor work | report *Vendor work* | heraldry-request readers (tacom_staff, csr, dla, **vendor**, admin) |
| Migration exceptions | report *Open migration exceptions by type* | migration-exception readers (tacom_staff, admin) |

`tests/operations-sync.test.ts` asserts the exact module titles and that the vendor role sees
only `Vendor work`.

## What remains manual, and why

Nothing is required to install or open the workspace. The following are deliberately left to
instance administrators because they need instance data or design judgement:

1. **Colour and drill-down tuning of dashboard widgets.** Widget props are the SDK defaults plus
   a label, data source and metric; palette and click-through targets are chosen in the
   dashboard editor on the instance.
2. **Home-page components beyond the dashboard.** The `home` route renders the dashboard. Extra
   UI Builder components (for example an "Assign to me" action on a queue) would be authored in
   UI Builder against the generated page (*Now Experience Framework > UI Builder > MAH
   Operations*), because UI Builder component trees carry instance-generated identifiers.
3. **Report schedules and e-mail distribution** (`sysauto_report`) need recipients, which are
   instance data.

## Installation

The reports, workspace, dashboard, ACL and modules are part of the scoped application; there is
no separate import and no XML to load.

```bash
npm ci
npm run lint && npm test && npx now-sdk build
npx now-sdk install   # requires instance credentials (now-sdk auth); not run in this repository
```

## Verification

Offline (no instance):

```bash
npx tsx tools/generate-fluent-operations.ts --check
npx vitest run tests/operations-sync.test.ts
npx now-sdk build
ls dist/app/update | sed 's/_[0-9a-f]\{32\}\.xml//' | sort | uniq -c | grep -E 'sys_report|par_dashboard|sys_ux_|sys_app_module'
```

Expected from the build: 14 `sys_report`, 4 `sys_report_source`, 1 `par_dashboard`,
1 `par_dashboard_tab`, 1 `par_dashboard_canvas`, 18 `par_dashboard_widget`,
1 `par_dashboard_visibility`, 1 `sys_ux_app_config`, 1 `sys_ux_page_registry` (path
`mah-operations`, title `MAH Operations`), 4 `sys_ux_app_route`, 1 `sys_ux_list_menu_config`,
4 `sys_ux_list_category`, 9 `sys_ux_list`, 4 `sys_ux_applicability`, and the
`now.mah-operations.*` `sys_security_acl`.

On an instance after `now-sdk install`, as a `x_cog_mah.tacom_staff` user:

1. Application navigator > *MAH Case Management*: a `MAH Operations` separator followed by the
   eight modules above. Each report module opens the named report; *Operations dashboard* opens
   `/now/mah-operations/home`.
2. The landing page shows the eight counters, the three charts and the queue lists. With the
   synthetic data set loaded, *Red (75+ days)* + *Amber (60+ days)* is at most *Open awards
   cases*, and the stage bar chart sums to *Open awards cases*.
3. Workspace list menu: *Awards cases*, *Engraving*, *Heraldry*, *Migration* categories.
4. *Reports > View / Run*, filter Source = `MAH Operations — …`: fourteen published reports.
5. *Service Level Management > SLA Definitions*: see `docs/SLA.md`.

Role checks (impersonate):

| Role | Expected |
|---|---|
| `x_cog_mah.vendor` | only the `Vendor work` module; no access to `/now/mah-operations` |
| `x_cog_mah.engraver` | dashboard, aging, engraving, assembly/QC and warehouse modules; no `Vendor work`, no `Migration exceptions` |
| `x_cog_mah.warehouse` | dashboard, aging, assembly/QC and warehouse modules; no engraving, vendor or migration modules |
| `x_cog_mah.tacom_staff` / `admin` | all eight modules |

Regenerating after a domain change:

```bash
npx tsx tools/generate-fluent-operations.ts   # rewrites the four .now.ts files
npx vitest run tests/operations-sync.test.ts   # fails until every new choice is assigned to a bucket
```

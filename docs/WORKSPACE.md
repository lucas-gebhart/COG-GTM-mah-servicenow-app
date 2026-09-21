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
`in_work` / `shipped` / `terminal` / `exception` stages, where `terminal` is imported from
`src/server/lib/aging.ts` so it can never drift from the case lifecycle), and renders encoded
queries such as `stateINreleased_to_vendor,in_production,shipped`. The test asserts every
partition covers its taxonomy exactly (both directions), pins control totals, and re-renders the
generator in memory to prove the checked-in files match. Do not edit the generated files by hand.

### Two clocks: aging flags versus the SLA

The queues and counters on this page use the **aging flag** maintained by the nightly aging job
(`src/server/lib/aging.ts`): `days_in_stage` counts from `stage_entered_at`, restarts at every
stage change, ignores the on-hold flag, and turns amber at 60 and red at 75 days *in the current
stage*. The **SLA definitions** (`docs/SLA.md`) use the same thresholds but run once, from
authorization to shipment, and pause while on hold. A case that spent 50 days authorized, 20 in
engraving and 10 in assembly is green on this dashboard (10 days in stage) and red on its SLA (80
days elapsed). Both views are intentional and every label here says "days in stage"; the
authorization-to-shipment view is the `task_sla` list (once the table extends `task`, see
`docs/SLA.md`). The aging population is `active=true` — every case that is not closed or
cancelled, including shipped and unmapped cases, exactly the set the aging job scores.

## Installed metadata

### Reports (`sys_report`)

Report sources are table-scoped on the platform, so "MAH Operations" is one source per
operational table (`MAH Operations — awards case`, `— engraving job`, `— heraldry request`,
`— migration exception`), each filtered to `active=true`. Every report is installed with
`is_published=false` (it is reachable through its source, the modules and the dashboard, not
through a public URL), scoped to the read roles of its table from `TABLE_ACCESS`, and bound to
its source. Publishing a report is an instance decision (see "What remains manual").

| Required concept | Report | Type | Table | Query / grouping |
|---|---|---|---|---|
| Cases by stage | Active awards cases by stage | bar | awards case | `active=true`, group by `stage` |
| Aging distribution | Active awards cases by aging flag | donut | awards case | `active=true`, group by `aging_flag` |
| Red-aging list | Aging — red (75+ days in stage) | list | awards case | `active=true^aging_flag=red`, longest in stage first |
| (companion) | Aging — amber (60–74 days in stage) | list | awards case | `active=true^aging_flag=amber` |
| (companion) | Awards cases on hold | list | awards case | `active=true^on_hold=true` |
| Engraving queue | Engraving queue by status / Engraving queue | bar + list | engraving job | open statuses (`queued,in_progress,qc_hold,rework`), group by `status` |
| Assembly/QC queue | Assembly / QC queue | list | awards case | `stage=assembly_qc` |
| Warehouse ready-to-ship | Warehouse ready-to-ship queue | list | awards case | `stage=warehouse` |
| Vendor work | Vendor work by vendor and state / Vendor work | stacked bar + list | heraldry request | vendor states (`released_to_vendor,in_production,shipped`), group by `vendor`, stacked by `state` (`additional_groupby`) |
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
| 0 | 8 counters (`single-score`, 6 columns each): Active awards cases, Red (75+ days in stage), Amber (60–74 days in stage), On hold, Engraving jobs open, Requests at vendors, Open migration exceptions, Unmapped legacy statuses |
| 7 | Active awards cases by stage (vertical bar), Active awards cases by aging flag (donut), Engraving queue by status (vertical bar) |
| 21 | Aging — red list, Assembly / QC queue list (`list-simple`, 15 rows each) |
| 35 | Warehouse ready-to-ship list, Vendor work list |
| 49 | Vendor work by vendor and state (`pivot-table`, vendor rows × state columns with row/column/total counts), Open migration exceptions by type (horizontal bar), Unmapped legacy statuses list |

Widget `componentProps` follow the data-wiring contract in the SDK's dashboard guide
(`node_modules/@servicenow/sdk/docs/guides/dashboard-guide.md`): a `table` data source with an
`id`, `metrics` bound to that id with `aggregateFunction: 'COUNT'`, `groupBy` entries naming the
data source, the field and whether it is a choice column (parsed from the Fluent table files),
`showZero` on counters. A category chart carries one grouping, so the two-dimensional vendor ×
state report renders as a pivot table, the widget type that accepts two groupings; the generator
refuses a `stackBy` report bound to any other widget. Every widget's data source is the same
table + encoded query as the report it mirrors; the test asserts that binding, both groupings of
the stacked report, and that no widget exceeds the 48-column grid.

### Application modules (`sys_app_module`)

Added under the existing `MAH Case Management` application menu after a `MAH Operations`
separator, without editing `src/fluent/ui/app_menu.now.ts`:

| Module | Link | Roles |
|---|---|---|
| Operations dashboard | `now/mah-operations/home` | awards-case readers (tacom_staff, csr, engraver, assembler, warehouse, dla, admin) |
| Aging — red | report *Aging — red (75+ days in stage)* | awards-case readers |
| Aging — amber | report *Aging — amber (60–74 days in stage)* | awards-case readers |
| Engraving queue | report *Engraving queue* | engraving-job readers (tacom_staff, csr, engraver, assembler, admin) |
| Assembly/QC queue | report *Assembly / QC queue* | awards-case readers |
| Warehouse queue | report *Warehouse ready-to-ship queue* | awards-case readers |
| Vendor work | report *Vendor work* | heraldry-request readers (tacom_staff, csr, dla, **vendor**, admin) |
| Migration exceptions | report *Open migration exceptions by type* | migration-exception readers (tacom_staff, admin) |

`tests/operations-sync.test.ts` asserts the exact module titles and that the vendor role sees
only `Vendor work`.

**Overlap with the base menu.** `src/fluent/ui/app_menu.now.ts` (owned by the data-model
workstream) already ships an operational block — *MAH Operations workspace*, *Aging: red (75+
days)*, *Aging: amber (60–74 days)*, *Engraving queue*, *Assembly / QC queue*, *Warehouse queue*,
*Vendor work (released / in production)*, *Migration exceptions (open)* — as list-view modules
with their own filters and role sets. The eight modules above are the report/dashboard
equivalents required for this workstream and use distinct `Now.ID` keys and orders (510–580),
so both blocks install side by side. Keeping one block is a one-file decision for the owner of
`app_menu.now.ts`; the recommended change is described in the pull request rather than made here.

## What remains manual, and why

Nothing is required to install or open the workspace. The following are deliberately left to
instance administrators because they need instance data or design judgement:

1. **Colour and drill-down tuning of dashboard widgets.** Widget props are the documented data
   wiring (data source, metric, grouping, labels); palette and click-through targets are chosen
   in the dashboard editor on the instance.
1. **Publishing reports** (`is_published=true`) exposes a report at a public URL to anyone with
   the link; it is an instance decision and is off for every generated report.
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
   synthetic data set loaded, *Red (75+ days in stage)* + *Amber (60–74 days in stage)* is at
   most *Active awards cases*, and the stage bar chart sums to *Active awards cases*. The vendor
   × state pivot shows one row per vendor and one column per vendor state.
3. Workspace list menu: *Awards cases*, *Engraving*, *Heraldry*, *Migration* categories.
4. *Reports > View / Run*, filter Source = `MAH Operations — …`: fourteen reports, none
   published.
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

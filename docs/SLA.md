# Awards-case SLA definitions

Part of the `x_cog_mah` (MAH Case Management) modernization reference application.

## Purpose

An awards case is expected to move from authorization to shipment within 60 days; 75 days is
the breach threshold. The nightly aging job (`src/server/lib/aging.ts`) already stamps every
open case with `days_in_stage` and an `aging_flag` (`green` / `amber` / `red`) from
`AGING_THRESHOLDS` in `src/server/lib/domain.ts`. This workstream adds the platform-native
declaration of the same two targets as SLA definitions (`contract_sla`), so the thresholds
are visible in the SLA definition list, can be attached to SLA reporting, and are ready for
engine evaluation once the table meets the platform prerequisite described below.

| Definition | Duration | Table |
|---|---|---|
| `MAH awards case — amber (60d)` | 60 days, 24x7 wall-clock | `x_cog_mah_awards_case` |
| `MAH awards case — red (75d)` | 75 days, 24x7 wall-clock | `x_cog_mah_awards_case` |

Both definitions share the same conditions:

| Condition | Encoded query | Meaning |
|---|---|---|
| Start | `active=true^stage=authorized` | timer starts when a case enters the first open stage |
| Pause | `on_hold=true` | timer pauses while the case is on hold |
| Stop | `stageINshipped,closed,cancelled` | timer stops at any terminal stage |

The stage buckets (`open` = authorized, engraving, assembly_qc, warehouse; `terminal` =
shipped, closed, cancelled; `exception` = unmapped) are declared once in
`tools/lib/operations-catalog.ts` and asserted against `CASE_STAGES` by
`tests/operations-sync.test.ts`, so adding a stage to the domain fails the build until it is
assigned to a bucket.

## What is Fluent, what is generated, what is manual

| Layer | Delivery | Location |
|---|---|---|
| SLA definitions | Fluent (`Sla()` from `@servicenow/sdk/core`), **generated** | `src/fluent/sla/awards_case_sla.now.ts` |
| Thresholds, names, conditions | TypeScript source of truth | `tools/lib/operations-catalog.ts` (`SLA_DEFINITIONS`, `SLA_CONDITIONS`) |
| Generator | `npx tsx tools/generate-fluent-operations.ts` (`--check` in CI/tests) | `tools/generate-fluent-operations.ts` |
| Drift test | Vitest | `tests/operations-sync.test.ts` |
| Raw XML | none | — |
| Manual steps | none for installation; see "Platform prerequisite" for engine evaluation | — |

The `.now.ts` file is generated because the Fluent parser only accepts literal values inside
metadata calls: the generator derives `Duration({ days: 60 })` / `Duration({ days: 75 })`
and the names from `AGING_THRESHOLDS` and `AGING_FLAGS`, and the test asserts the rendered
file contains exactly those values. Do not edit the generated file by hand.

### Fields the SDK fills in

`now-sdk build` compiles each `Sla()` into a `contract_sla` record (see
`dist/app/update/contract_sla_*.xml` after a build). Two references are supplied by the SDK's
SLA plugin rather than by this repository, and both are platform constants, not
instance-specific identifiers:

* `flow` = the SDK's `DEFAULT_SLA_FLOW` (`828f267973333300e289235f04f6a7a3`), the default SLA
  flow shipped with the platform SLA plugin. No workflow or flow of our own is referenced;
  the definitions use `type = SLA` and the standard flow.
* `schedule` = the SDK's `DEFAULT_NO_SCHEDULE_ID` (`38fa64edc0a8016400f4a5724b0434b8`) together
  with `schedule_source = no_schedule`, which the SDK documents as "24x7, no schedule applied".
  This is what makes the 60/75-day targets wall-clock durations, matching the aging job.
* `timezone_source` keeps the SDK default (`task.caller_id.time_zone`). With no schedule
  attached the time zone does not change the elapsed-time calculation.
* `retroactive` keeps the SDK default (off): timers start when the start condition is first
  met after installation. Existing migrated cases are covered by the aging job instead.

## Platform prerequisite (honest limitation)

The platform SLA engine evaluates SLA definitions only for tables that extend `task`
(`task_sla` records reference `task`). `x_cog_mah_awards_case` is a standalone table in this
application, so:

* the two definitions **install cleanly** and appear under *Service Level Management > SLA
  Definitions* filtered by table `x_cog_mah_awards_case`;
* the engine will **not** create `task_sla` records for awards cases until the table extends
  `task`. Until then the operational 60/75-day behaviour is provided by the nightly aging job
  and surfaced through the `aging_flag` reports, dashboard counters and the `Aging — red` /
  `Aging — amber` modules described in `docs/WORKSPACE.md`.

Changing the table hierarchy is owned by the data-model workstream
(`src/fluent/tables/awards_case.now.ts`), so it is not done here. If the team decides to make
awards cases task-based, no change is needed in this workstream: the definitions already
target the right table, fields and conditions.

## Installation

The SLA definitions are part of the scoped application; there is no separate import.

```bash
npm ci
npm run lint && npm test && npx now-sdk build
npx now-sdk install   # requires instance credentials (now-sdk auth); not run in this repository
```

## Verification

Offline (no instance):

```bash
npx tsx tools/generate-fluent-operations.ts --check   # generated file matches the catalog
npx vitest run tests/operations-sync.test.ts          # thresholds, names, conditions, stage buckets
npx now-sdk build && ls dist/app/update/contract_sla_*.xml
grep -h "<name>\|<duration>\|<start_condition>\|<pause_condition>\|<stop_condition>\|<schedule_source>" dist/app/update/contract_sla_*.xml
```

Expected: two records, durations `1970-03-02 00:00:00` (60 days) and
`1970-03-17 00:00:00` (75 days), the three conditions above and `schedule_source = no_schedule`.

On an instance after `now-sdk install`:

1. *Service Level Management > SLA Definitions*, filter **Table = `x_cog_mah_awards_case`**:
   both definitions present and active, Schedule source = *No schedule*.
2. Open either definition: Start / Pause / Stop conditions render against the awards-case
   fields `Active`, `Stage` and `On hold`.
3. If the table is later extended from `task`: create an awards case in stage *Authorized*,
   confirm a *Task SLA* row appears on the record with the 60-day and 75-day planned end
   dates; set *On hold* and confirm the row pauses; move the case to *Shipped* and confirm
   it completes.

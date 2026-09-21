// GENERATED FILE - do not edit by hand.
// Source of truth: tools/lib/operations-catalog.ts (derived from src/server/lib/domain.ts, security.ts, uiLayout.ts).
// Regenerate with `npx tsx tools/generate-fluent-operations.ts`; tests/operations-sync.test.ts fails when stale.
import '@servicenow/sdk/global'
import { Sla } from '@servicenow/sdk/core'

// Timers start when an awards case enters the first open stage, pause while the case is on hold and stop
// when the case reaches a terminal stage. scheduleSource 'no_schedule' = 24x7 wall-clock, no instance schedule.

export const sla_awards_case_amber = Sla({
    $id: Now.ID['sla_awards_case_amber'],
    name: 'MAH awards case — amber (60d)',
    table: 'x_cog_mah_awards_case',
    active: true,
    type: 'SLA',
    duration: Duration({ days: 60 }),
    scheduleSource: 'no_schedule',
    conditions: {
        start: 'active=true^stage=authorized',
        pause: 'on_hold=true',
        stop: 'stageINshipped,closed,cancelled',
    },
})

export const sla_awards_case_red = Sla({
    $id: Now.ID['sla_awards_case_red'],
    name: 'MAH awards case — red (75d)',
    table: 'x_cog_mah_awards_case',
    active: true,
    type: 'SLA',
    duration: Duration({ days: 75 }),
    scheduleSource: 'no_schedule',
    conditions: {
        start: 'active=true^stage=authorized',
        pause: 'on_hold=true',
        stop: 'stageINshipped,closed,cancelled',
    },
})

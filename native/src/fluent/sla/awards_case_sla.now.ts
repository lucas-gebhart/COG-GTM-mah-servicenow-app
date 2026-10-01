/**
 * Task SLAs for awards cases — the native replacement for v1's nightly aging job and its
 * persisted days_in_stage / aging_flag columns. v1 declared the same two definitions, but they
 * never produced a task_sla row because x_cog_mah_awards_case did not extend task. Here the
 * table does, so the platform creates the timers, pauses them on hold, shows them on the form
 * (Task SLAs related list) and reports on has_breached / percentage without any MAH code.
 *
 * Thresholds come from AGING_THRESHOLDS in src/server/lib/domain.ts (60 amber / 75 red).
 * scheduleSource 'no_schedule' = 24x7 wall clock, as the awards target is calendar days.
 */
import '@servicenow/sdk/global'
import { Sla } from '@servicenow/sdk/core'

export const sla_awards_case_amber = Sla({
    $id: Now.ID['sla_awards_case_amber'],
    name: 'MAH Native awards case - amber (60d)',
    table: 'x_cog_mah_native_awards_case',
    active: true,
    type: 'SLA',
    duration: Duration({ days: 60 }),
    scheduleSource: 'no_schedule',
    retroactive: { start: true, pause: true, setStartTo: 'opened_at' },
    conditions: {
        start: 'active=true^stage=authorized',
        pause: 'on_hold=true',
        stop: 'stageINshipped,closed,cancelled',
    },
})

export const sla_awards_case_red = Sla({
    $id: Now.ID['sla_awards_case_red'],
    name: 'MAH Native awards case - red (75d)',
    table: 'x_cog_mah_native_awards_case',
    active: true,
    type: 'SLA',
    duration: Duration({ days: 75 }),
    scheduleSource: 'no_schedule',
    retroactive: { start: true, pause: true, setStartTo: 'opened_at' },
    conditions: {
        start: 'active=true^stage=authorized',
        pause: 'on_hold=true',
        stop: 'stageINshipped,closed,cancelled',
    },
})

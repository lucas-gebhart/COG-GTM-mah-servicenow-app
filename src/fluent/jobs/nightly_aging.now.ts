/**
 * `MAH Nightly Aging` — replaces the legacy `NightlyAging` LotusScript agent.
 * Recomputes days_in_stage / aging_flag for every open awards case, fires the red-aging
 * event, refreshes status-map hit counts and records a JSON summary in system properties.
 */
import '@servicenow/sdk/global'
import { ScheduledScript } from '@servicenow/sdk/core'
import { nightlyAgingJob } from '../../server/jobs/nightlyAging'

export const nightlyAging = ScheduledScript({
    $id: Now.ID['job_nightly_aging'],
    name: 'MAH Nightly Aging',
    active: true,
    frequency: 'daily',
    executionTime: { hours: 2, minutes: 15, seconds: 0 },
    timeZone: 'America/Detroit',
    conditional: false,
    upgradeSafe: true,
    script: nightlyAgingJob,
})

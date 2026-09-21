/**
 * Scheduled job "MAH Nightly Aging".
 *
 * Replaces the `NightlyAging` LotusScript agent: walks every open awards case, recomputes
 * days_in_stage / aging_flag, fires the aging-red event on the amber→red transition, and
 * writes one structured summary log line. Also refreshes the status_map match counters
 * used by the reconciliation report.
 */
import { GlideAggregate, GlideRecord, gs } from '@servicenow/glide'
import { computeAging } from '../lib/aging'
import { EVENTS, SCHEDULED_JOB_NAME, TABLES, TERMINAL_CASE_STAGES, type AgingFlag, type CaseStage } from '../lib/domain'
import { nowValue, securityLog, str } from '../rules/glideSupport'

export interface AgingRunSummary {
    job: string
    scanned: number
    updated: number
    becameRed: number
    red: number
    amber: number
    green: number
    durationMs: number
}

export function runNightlyAging(): AgingRunSummary {
    const started = Date.now()
    const now = nowValue()
    const summary: AgingRunSummary = { job: SCHEDULED_JOB_NAME, scanned: 0, updated: 0, becameRed: 0, red: 0, amber: 0, green: 0, durationMs: 0 }

    const gr = new GlideRecord(TABLES.awards_case)
    gr.addQuery('active', 'true')
    gr.addQuery('stage', 'NOT IN', TERMINAL_CASE_STAGES.join(','))
    gr.query()
    while (gr.next()) {
        summary.scanned += 1
        const aging = computeAging(
            {
                stage: (str(gr, 'stage') || 'authorized') as CaseStage,
                stage_entered_at: str(gr, 'stage_entered_at') || str(gr, 'sys_created_on'),
                days_in_stage: Number(str(gr, 'days_in_stage') || 0),
                aging_flag: (str(gr, 'aging_flag') || 'green') as AgingFlag,
            },
            now,
        )
        summary[aging.aging_flag] += 1
        if (aging.changed) {
            gr.setValue('days_in_stage', String(aging.days_in_stage))
            gr.setValue('aging_flag', aging.aging_flag)
            gr.setWorkflow(false)
            gr.autoSysFields(false)
            gr.update()
            summary.updated += 1
            if (aging.becameRed) {
                summary.becameRed += 1
                gs.eventQueue(EVENTS.case_aging_red, gr, String(aging.days_in_stage), str(gr, 'assigned_to'))
            }
        }
    }

    refreshStatusMapCounts()

    summary.durationMs = Date.now() - started
    securityLog({ event: 'job_run', source: SCHEDULED_JOB_NAME, outcome: 'success', details: { ...summary } })
    gs.setProperty('x_cog_mah.aging.last_run', now)
    gs.setProperty('x_cog_mah.aging.last_summary', JSON.stringify(summary))
    return summary
}

/** Counts how many live records currently carry each legacy status verbatim (for the reconciliation view). */
function refreshStatusMapCounts(): void {
    const tablesByForm: Record<string, string> = {
        AwardsCase: TABLES.awards_case,
        AwardLine: TABLES.award_line,
        Requester: TABLES.requester,
        AuthorizationFile: TABLES.authorization_file,
        EngravingJob: TABLES.engraving_job,
        ShipmentRecord: TABLES.shipment,
        Request: TABLES.heraldry_request,
        RequestLine: TABLES.request_line,
        HeraldicItem: TABLES.heraldic_item,
        SESFlagRequest: TABLES.ses_flag_request,
        Vendor: TABLES.vendor,
    }
    const counts: Record<string, number> = {}
    for (const form of Object.keys(tablesByForm)) {
        const table = tablesByForm[form]
        if (!table) continue
        const ga = new GlideAggregate(table)
        ga.addAggregate('COUNT', 'legacy_status_raw')
        ga.groupBy('legacy_status_raw')
        ga.query()
        while (ga.next()) {
            const raw = String(ga.getValue('legacy_status_raw') ?? '').trim().toLowerCase()
            if (!raw) continue
            counts[`${form}|${raw}`] = Number(ga.getAggregate('COUNT', 'legacy_status_raw') || 0)
        }
    }
    const map = new GlideRecord(TABLES.status_map)
    map.query()
    while (map.next()) {
        const key = `${str(map, 'legacy_form')}|${str(map, 'legacy_status').trim().toLowerCase()}`
        const n = counts[key] ?? 0
        if (Number(str(map, 'match_count') || 0) !== n) {
            map.setValue('match_count', String(n))
            map.setWorkflow(false)
            map.autoSysFields(false)
            map.update()
        }
    }
}

/** Entry point wired to the ScheduledScript metadata. */
export function nightlyAgingJob(): void {
    try {
        runNightlyAging()
    } catch (e) {
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
        securityLog({ event: 'job_run', source: SCHEDULED_JOB_NAME, outcome: 'failure', reason: 'exception', details: { message } })
        gs.error(`${SCHEDULED_JOB_NAME} failed: ${message}`)
    }
}

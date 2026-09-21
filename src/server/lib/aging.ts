/**
 * Days-in-stage and aging flag computation for awards cases.
 *
 * Replaces the `NightlyAging` LotusScript agent, which walked the `(AllCases)` view once a
 * night and stamped `DaysInStage` / `AgingFlag` onto each document.
 */
import { AGING_THRESHOLDS, TERMINAL_CASE_STAGES, type AgingFlag, type CaseStage } from './domain'
import { daysBetween } from './dates'

export const TERMINAL_STAGES: ReadonlySet<CaseStage> = new Set<CaseStage>(TERMINAL_CASE_STAGES)

export function computeDaysInStage(stageEnteredAt: string | null | undefined, now: string): number {
    if (!stageEnteredAt) return 0
    return daysBetween(stageEnteredAt, now)
}

export function computeAgingFlag(daysInStage: number, stage: CaseStage, thresholds = AGING_THRESHOLDS): AgingFlag {
    if (TERMINAL_STAGES.has(stage)) return 'green'
    if (daysInStage >= thresholds.redDays) return 'red'
    if (daysInStage >= thresholds.amberDays) return 'amber'
    return 'green'
}

export interface AgingInput {
    stage: CaseStage
    stage_entered_at: string | null | undefined
    days_in_stage?: number | null
    aging_flag?: AgingFlag | null
}

export interface AgingOutput {
    days_in_stage: number
    aging_flag: AgingFlag
    changed: boolean
    /** True on the green/amber → red transition, which triggers the "aging red" notification. */
    becameRed: boolean
}

export function computeAging(input: AgingInput, now: string): AgingOutput {
    const days = computeDaysInStage(input.stage_entered_at, now)
    const flag = computeAgingFlag(days, input.stage)
    const changed = days !== (input.days_in_stage ?? -1) || flag !== (input.aging_flag ?? null)
    return { days_in_stage: days, aging_flag: flag, changed, becameRed: flag === 'red' && input.aging_flag !== 'red' }
}

export interface AgingSummary {
    total: number
    green: number
    amber: number
    red: number
    byStage: Record<string, { count: number; red: number; amber: number; avgDays: number }>
}

/** Aggregate for the operator dashboard / reconciliation view. */
export function summarizeAging(cases: readonly { stage: CaseStage; days_in_stage: number; aging_flag: AgingFlag }[]): AgingSummary {
    const summary: AgingSummary = { total: cases.length, green: 0, amber: 0, red: 0, byStage: {} }
    const totals: Record<string, number> = {}
    for (const c of cases) {
        summary[c.aging_flag] += 1
        const s = (summary.byStage[c.stage] ??= { count: 0, red: 0, amber: 0, avgDays: 0 })
        s.count += 1
        if (c.aging_flag === 'red') s.red += 1
        if (c.aging_flag === 'amber') s.amber += 1
        totals[c.stage] = (totals[c.stage] ?? 0) + c.days_in_stage
    }
    for (const [stage, s] of Object.entries(summary.byStage)) {
        s.avgDays = s.count ? Math.round(((totals[stage] ?? 0) / s.count) * 10) / 10 : 0
    }
    return summary
}

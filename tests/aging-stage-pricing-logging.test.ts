import { describe, expect, it } from 'vitest'
import { computeAging, computeAgingFlag, computeDaysInStage, summarizeAging } from '../src/server/lib/aging'
import { blockedPostReleaseEdits, canTransitionCase, canTransitionRequest, nextCaseStage, roleKeysFromNames } from '../src/server/lib/stageMachine'
import { computeExtendedPrice, totalRequestLines } from '../src/server/lib/pricing'
import { buildSecurityEvent, formatSecurityEvent, sanitizeLogValue } from '../src/server/lib/logging'
import { AGING_THRESHOLDS, RELEASED_TO_VENDOR_MESSAGE, ROLES } from '../src/server/lib/domain'

const NOW = '2024-06-01 08:00:00'

describe('aging', () => {
    it('computes days in stage from the stage-entered timestamp', () => {
        expect(computeDaysInStage('2024-05-01 08:00:00', NOW)).toBe(31)
        expect(computeDaysInStage(null, NOW)).toBe(0)
    })

    it('flags amber at 60 and red at 75 days, never for terminal stages', () => {
        expect(computeAgingFlag(AGING_THRESHOLDS.amberDays - 1, 'engraving')).toBe('green')
        expect(computeAgingFlag(AGING_THRESHOLDS.amberDays, 'engraving')).toBe('amber')
        expect(computeAgingFlag(AGING_THRESHOLDS.redDays - 1, 'warehouse')).toBe('amber')
        expect(computeAgingFlag(AGING_THRESHOLDS.redDays, 'warehouse')).toBe('red')
        expect(computeAgingFlag(400, 'closed')).toBe('green')
        expect(computeAgingFlag(400, 'cancelled')).toBe('green')
    })

    it('reports transitions to red exactly once', () => {
        const first = computeAging({ stage: 'engraving', stage_entered_at: '2024-03-01', days_in_stage: 74, aging_flag: 'amber' }, NOW)
        expect(first).toMatchObject({ days_in_stage: 92, aging_flag: 'red', changed: true, becameRed: true })
        const second = computeAging({ stage: 'engraving', stage_entered_at: '2024-03-01', days_in_stage: 92, aging_flag: 'red' }, NOW)
        expect(second).toMatchObject({ changed: false, becameRed: false })
    })

    it('summarizes by flag and stage', () => {
        const s = summarizeAging([
            { stage: 'engraving', days_in_stage: 10, aging_flag: 'green' },
            { stage: 'engraving', days_in_stage: 80, aging_flag: 'red' },
            { stage: 'warehouse', days_in_stage: 61, aging_flag: 'amber' },
        ])
        expect(s).toMatchObject({ total: 3, green: 1, amber: 1, red: 1 })
        expect(s.byStage['engraving']).toEqual({ count: 2, red: 1, amber: 0, avgDays: 45 })
    })
})

describe('awards case stage machine', () => {
    it('walks the forward path one stage at a time', () => {
        expect(nextCaseStage('authorized')).toBe('engraving')
        expect(nextCaseStage('closed')).toBeNull()
        expect(canTransitionCase({ from: 'authorized', to: 'engraving', roles: ['csr'] }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'authorized', to: 'warehouse', roles: ['tacom_staff'] }).allowed).toBe(false)
    })

    it('enforces role ownership of each stage', () => {
        expect(canTransitionCase({ from: 'engraving', to: 'assembly_qc', roles: ['engraver'] }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'engraving', to: 'assembly_qc', roles: ['warehouse'] }).allowed).toBe(false)
        expect(canTransitionCase({ from: 'warehouse', to: 'shipped', roles: ['warehouse'], openLines: 0 }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'warehouse', to: 'shipped', roles: ['csr'] }).allowed).toBe(false)
    })

    it('blocks shipping with open lines and closing without a shipment', () => {
        expect(canTransitionCase({ from: 'warehouse', to: 'shipped', roles: ['warehouse'], openLines: 2 }).reason).toMatch(/award lines/)
        expect(canTransitionCase({ from: 'shipped', to: 'closed', roles: ['csr'], hasShipment: false }).reason).toMatch(/shipment/)
        expect(canTransitionCase({ from: 'shipped', to: 'closed', roles: ['csr'], hasShipment: true }).allowed).toBe(true)
    })

    it('allows cancellation from any open stage and supervisor one-step rollback', () => {
        expect(canTransitionCase({ from: 'assembly_qc', to: 'cancelled', roles: ['csr'] }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'assembly_qc', to: 'cancelled', roles: ['assembler'] }).allowed).toBe(false)
        expect(canTransitionCase({ from: 'assembly_qc', to: 'engraving', roles: ['tacom_staff'] }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'assembly_qc', to: 'engraving', roles: ['assembler'] }).allowed).toBe(false)
        expect(canTransitionCase({ from: 'closed', to: 'warehouse', roles: ['tacom_staff'] }).allowed).toBe(false)
        expect(canTransitionCase({ from: 'closed', to: 'warehouse', roles: ['admin'] }).allowed).toBe(true)
    })

    it('lets TACOM repair unmapped migrated cases', () => {
        expect(canTransitionCase({ from: 'unmapped', to: 'warehouse', roles: ['tacom_staff'] }).allowed).toBe(true)
        expect(canTransitionCase({ from: 'unmapped', to: 'warehouse', roles: ['warehouse'] }).allowed).toBe(false)
        expect(canTransitionCase({ from: 'authorized', to: 'unmapped', roles: ['admin'] }).allowed).toBe(false)
    })
})

describe('heraldry request state machine', () => {
    it('requires a valid header and lines to submit, a vendor to release', () => {
        expect(canTransitionRequest({ from: 'draft', to: 'submitted', roles: ['csr'], headerValid: false, lineCount: 1 }).allowed).toBe(false)
        expect(canTransitionRequest({ from: 'draft', to: 'submitted', roles: ['csr'], headerValid: true, lineCount: 0 }).allowed).toBe(false)
        expect(canTransitionRequest({ from: 'draft', to: 'submitted', roles: ['csr'], headerValid: true, lineCount: 2 }).allowed).toBe(true)
        expect(canTransitionRequest({ from: 'in_review', to: 'released_to_vendor', roles: ['dla'], hasVendor: false }).allowed).toBe(false)
        expect(canTransitionRequest({ from: 'in_review', to: 'released_to_vendor', roles: ['dla'], hasVendor: true }).allowed).toBe(true)
        expect(canTransitionRequest({ from: 'in_review', to: 'released_to_vendor', roles: ['csr'], hasVendor: true }).allowed).toBe(false)
    })

    it('lets vendors progress production and shipping only', () => {
        expect(canTransitionRequest({ from: 'released_to_vendor', to: 'in_production', roles: ['vendor'] }).allowed).toBe(true)
        expect(canTransitionRequest({ from: 'in_production', to: 'shipped', roles: ['vendor'] }).allowed).toBe(true)
        expect(canTransitionRequest({ from: 'shipped', to: 'complete', roles: ['vendor'] }).allowed).toBe(false)
        expect(canTransitionRequest({ from: 'shipped', to: 'complete', roles: ['dla'] }).allowed).toBe(true)
    })

    it('uses the legacy message when cancelling after release', () => {
        const r = canTransitionRequest({ from: 'in_production', to: 'cancelled', roles: ['csr'] })
        expect(r.allowed).toBe(false)
        expect(r.reason).toBe(RELEASED_TO_VENDOR_MESSAGE)
        expect(canTransitionRequest({ from: 'in_production', to: 'cancelled', roles: ['dla'] }).allowed).toBe(true)
    })

    it('identifies frozen fields after release', () => {
        expect(blockedPostReleaseEdits(['work_notes', 'state'])).toEqual([])
        expect(blockedPostReleaseEdits(['justification', 'work_notes', 'requisition_priority'])).toEqual(['justification', 'requisition_priority'])
    })

    it('maps role names to keys', () => {
        expect(roleKeysFromNames([ROLES.vendor, 'itil'])).toEqual(['vendor'])
        expect(roleKeysFromNames(['admin'])).toEqual(['admin'])
        expect(roleKeysFromNames([ROLES.admin, 'admin'])).toEqual(['admin'])
    })
})

describe('pricing', () => {
    it('rounds extended price to cents', () => {
        expect(computeExtendedPrice(3, 19.99)).toBe(59.97)
        expect(computeExtendedPrice('3', '$1,019.99')).toBe(3059.97)
        expect(computeExtendedPrice(0.1 * 3, 10)).toBe(3)
        expect(computeExtendedPrice(-1, 10)).toBe(0)
        expect(computeExtendedPrice('abc', 10)).toBe(0)
    })

    it('totals request lines', () => {
        expect(totalRequestLines([{ quantity: 2, unit_price: 45.5 }, { quantity: '1', unit_price: '120.00' }])).toEqual({ lineCount: 2, totalQuantity: 3, totalExtended: 211 })
    })
})

describe('security logging', () => {
    it('strips control characters and clamps length', () => {
        expect(sanitizeLogValue('a\nb\u0000c')).toBe('a b c')
        expect(sanitizeLogValue('x'.repeat(300)).length).toBe(200)
    })

    it('redacts secret-looking keys and emits one-line JSON', () => {
        const ev = buildSecurityEvent(
            { event: 'authentication_failure', user: 'vendor.user', outcome: 'failure', details: { password: 'hunter2', api_key: 'k', attempts: 3, ip: '10.0.0.1' } },
            new Date('2024-06-01T08:00:00Z'),
        )
        expect(ev).toEqual({
            event: 'authentication_failure',
            timestamp: '2024-06-01T08:00:00.000Z',
            app: 'x_cog_mah',
            user: 'vendor.user',
            outcome: 'failure',
            details: { password: '[REDACTED]', api_key: '[REDACTED]', attempts: 3, ip: '10.0.0.1' },
        })
        const line = formatSecurityEvent({ event: 'data_change', table: 'x_cog_mah_awards_case', record: 'MAH0001001' })
        expect(line).not.toContain('\n')
        expect(JSON.parse(line)).toMatchObject({ event: 'data_change', table: 'x_cog_mah_awards_case' })
    })
})

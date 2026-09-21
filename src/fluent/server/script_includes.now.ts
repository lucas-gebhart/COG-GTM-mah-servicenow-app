/**
 * Script Includes: thin `Class.create()` bridges over the server modules so that reports,
 * GlideAjax and background scripts can reach the same tested logic the business rules use.
 */
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const mahReconciliation = ScriptInclude({
    $id: Now.ID['si_reconciliation'],
    name: 'MAHReconciliation',
    script: Now.include('../../includes/MAHReconciliation.js'),
    description: 'Migration reconciliation report (source vs target counts, orphans, merges, unmapped statuses, queues).',
    accessibleFrom: 'package_private',
})

export const mahStatusInquiry = ScriptInclude({
    $id: Now.ID['si_status_inquiry'],
    name: 'MAHStatusInquiry',
    script: Now.include('../../includes/MAHStatusInquiry.js'),
    description: 'GlideAjax processor behind the Status inquiry record producer; returns stage/aging only, never requester PII.',
    clientCallable: true,
    accessibleFrom: 'public',
    callerAccess: 'tracking',
})

export const mahAging = ScriptInclude({
    $id: Now.ID['si_aging'],
    name: 'MAHAging',
    script: Now.include('../../includes/MAHAging.js'),
    description: 'Runs the awards-case aging engine on demand (same code path as the MAH Nightly Aging job).',
    accessibleFrom: 'package_private',
})

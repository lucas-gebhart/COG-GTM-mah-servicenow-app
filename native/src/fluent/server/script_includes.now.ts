/**
 * Script Includes: thin `Class.create()` bridges over the server modules so that transform maps,
 * GlideAjax and background scripts reach the same tested logic the business rules use.
 * (v1 also had MAHAging; the nightly aging engine no longer exists — Task SLA replaces it.)
 */
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const mahNativeMigration = ScriptInclude({
    $id: Now.ID['nsi_migration'],
    name: 'MAHNativeMigration',
    script: Now.include('../../includes/MAHNativeMigration.js'),
    description: 'Transform Map bridge for the legacy import: status mapping, reference resolution, orphan rows to Import Set error state, requester coalescing, CaseNote → journal.',
    accessibleFrom: 'package_private',
})

export const mahNativeReconciliation = ScriptInclude({
    $id: Now.ID['nsi_reconciliation'],
    name: 'MAHNativeReconciliation',
    script: Now.include('../../includes/MAHNativeReconciliation.js'),
    description: 'Migration reconciliation report (source vs target counts, Import Set row states, SLA counts, queues).',
    accessibleFrom: 'package_private',
})

export const mahNativeStatusInquiry = ScriptInclude({
    $id: Now.ID['nsi_status_inquiry'],
    name: 'MAHNativeStatusInquiry',
    script: Now.include('../../includes/MAHNativeStatusInquiry.js'),
    description: 'GlideAjax processor behind the Status inquiry record producer; returns stage / SLA band only, never requester PII.',
    clientCallable: true,
    accessibleFrom: 'public',
    callerAccess: 'tracking',
})

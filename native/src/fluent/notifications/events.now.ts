import { Record } from '@servicenow/sdk/core'

// Event registry (sysevent_register). Names mirror EVENTS in src/server/lib/domain.ts and must
// stay under 40 characters. There is no aging event any more: SLA breach is a task_sla record
// the platform writes, and the breach notification triggers on that table directly.

export const caseStageChangedEvent = Record({
    $id: Now.ID['evt_case_stage_changed'],
    table: 'sysevent_register',
    data: {
        suffix: 'case.stage_changed',
        event_name: 'x_cog_mah_native.case.stage_changed',
        description: 'Awards case moved to a new stage. parm1 = previous stage, parm2 = new stage.',
        table: 'x_cog_mah_native_awards_case',
        fired_by: 'Business Rule: MAH Native Awards case - cascade and notify on stage change (awardsCaseAfter)',
        priority: 100,
    },
})

export const requestSubmittedEvent = Record({
    $id: Now.ID['evt_request_submitted'],
    table: 'sysevent_register',
    data: {
        suffix: 'request.submitted',
        event_name: 'x_cog_mah_native.request.submitted',
        description: 'DD Form 1348-6 heraldry request submitted for review. parm1 = requester POC e-mail, parm2 = submitting user.',
        table: 'x_cog_mah_native_heraldry_request',
        fired_by: 'Business Rule: MAH Native Heraldry request - cascade lines and fire events (heraldryRequestAfter)',
        priority: 100,
    },
})

export const requestReleasedEvent = Record({
    $id: Now.ID['evt_request_released'],
    table: 'sysevent_register',
    data: {
        suffix: 'request.released',
        event_name: 'x_cog_mah_native.request.released',
        description: 'Heraldry request released to vendor. parm1 = vendor company sys_id (task.company), parm2 = releasing user.',
        table: 'x_cog_mah_native_heraldry_request',
        fired_by: 'Business Rule: MAH Native Heraldry request - cascade lines and fire events (heraldryRequestAfter)',
        priority: 100,
    },
})

export const sesSubmittedEvent = Record({
    $id: Now.ID['evt_ses_submitted'],
    table: 'sysevent_register',
    data: {
        suffix: 'ses.submitted',
        event_name: 'x_cog_mah_native.ses.submitted',
        description: 'SES flag request submitted. parm1 = requesting office POC e-mail, parm2 = submitting user.',
        table: 'x_cog_mah_native_ses_flag_request',
        fired_by: 'Business Rule: MAH Native SES flag request - log and notify (sesFlagRequestAfter)',
        priority: 100,
    },
})

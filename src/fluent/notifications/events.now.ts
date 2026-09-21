import { Record } from '@servicenow/sdk/core'

// Event registry (sysevent_register). Names mirror EVENTS in src/server/lib/domain.ts and
// must stay under 40 characters. Registered before any gs.eventQueue() call fires them.

export const caseStageChangedEvent = Record({
    $id: Now.ID['evt_case_stage_changed'],
    table: 'sysevent_register',
    data: {
        suffix: 'case.stage_changed',
        event_name: 'x_cog_mah.case.stage_changed',
        description: 'Awards case moved to a new stage. parm1 = previous stage, parm2 = new stage.',
        table: 'x_cog_mah_awards_case',
        fired_by: 'Business Rule: MAH Awards case - stage cascade (awardsCaseAfter)',
        priority: 100,
    },
})

export const caseAgingRedEvent = Record({
    $id: Now.ID['evt_case_aging_red'],
    table: 'sysevent_register',
    data: {
        suffix: 'case.aging_red',
        event_name: 'x_cog_mah.case.aging_red',
        description: 'Awards case crossed the 75-day red threshold. parm1 = days in stage, parm2 = assignee sys_id.',
        table: 'x_cog_mah_awards_case',
        fired_by: 'Scheduled Script: MAH Nightly Aging; Business Rule: MAH Awards case - stage cascade',
        priority: 100,
    },
})

export const requestSubmittedEvent = Record({
    $id: Now.ID['evt_request_submitted'],
    table: 'sysevent_register',
    data: {
        suffix: 'request.submitted',
        event_name: 'x_cog_mah.request.submitted',
        description: 'DD Form 1348-6 heraldry request submitted for review. parm1 = requester POC e-mail, parm2 = submitting user.',
        table: 'x_cog_mah_heraldry_request',
        fired_by: 'Business Rule: MAH Heraldry request - lifecycle cascade (heraldryRequestAfter)',
        priority: 100,
    },
})

export const requestReleasedEvent = Record({
    $id: Now.ID['evt_request_released'],
    table: 'sysevent_register',
    data: {
        suffix: 'request.released',
        event_name: 'x_cog_mah.request.released',
        description: 'Heraldry request released to vendor. parm1 = vendor sys_id, parm2 = releasing user.',
        table: 'x_cog_mah_heraldry_request',
        fired_by: 'Business Rule: MAH Heraldry request - lifecycle cascade (heraldryRequestAfter)',
        priority: 100,
    },
})

export const sesSubmittedEvent = Record({
    $id: Now.ID['evt_ses_submitted'],
    table: 'sysevent_register',
    data: {
        suffix: 'ses.submitted',
        event_name: 'x_cog_mah.ses.submitted',
        description: 'SES flag request submitted. parm1 = requesting office POC e-mail, parm2 = submitting user.',
        table: 'x_cog_mah_ses_flag_request',
        fired_by: 'Business Rule: MAH SES flag request - lifecycle (sesFlagRequestAfter)',
        priority: 100,
    },
})

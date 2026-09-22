import { Property } from '@servicenow/sdk/core'

Property({
    $id: Now.ID['prop_aging_amber_days'],
    name: 'x_cog_mah.aging.amber_days',
    type: 'integer',
    value: 60,
    description: 'Days in stage after which an awards case is flagged amber (mission target is 60 days).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

Property({
    $id: Now.ID['prop_aging_red_days'],
    name: 'x_cog_mah.aging.red_days',
    type: 'integer',
    value: 75,
    description: 'Days in stage after which an awards case is flagged red (75-day ceiling).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

Property({
    $id: Now.ID['prop_aging_last_run'],
    name: 'x_cog_mah.aging.last_run',
    type: 'string',
    value: '',
    description: 'Timestamp of the last MAH Nightly Aging run (written by the job).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

Property({
    $id: Now.ID['prop_aging_last_summary'],
    name: 'x_cog_mah.aging.last_summary',
    type: 'string',
    value: '',
    description: 'JSON summary of the last MAH Nightly Aging run (scanned / updated / red / amber / green).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

Property({
    $id: Now.ID['prop_intake_max_bytes'],
    name: 'x_cog_mah.intake.max_body_bytes',
    type: 'integer',
    value: 5242880,
    description: 'Maximum accepted body size for POST /api/x_cog_mah/authorization_intake (5 MiB).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

Property({
    $id: Now.ID['prop_notifications_enabled'],
    name: 'x_cog_mah.notifications.enabled',
    type: 'boolean',
    value: true,
    description: 'Master switch for MAH e-mail notifications (stage change, vendor release, aging red).',
    roles: { read: ['x_cog_mah.tacom_staff'], write: ['x_cog_mah.admin'] },
})

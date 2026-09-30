/**
 * Awards case form (x_cog_mah_native_awards_case). Aging is no longer a pair of persisted columns:
 * the 60-day amber / 75-day red timers are task_sla rows shown in the "Task SLAs" related list, so
 * this script only locks the lifecycle field on terminal cases and points operators at the SLA list.
 */
function onLoad() {
    if (g_form.getValue('on_hold') === 'true') {
        g_form.addWarningMessage('Case is on hold: the aging SLA clock is paused until the hold is cleared.')
    }
    var stage = g_form.getValue('stage')
    if (stage === 'cancelled' || stage === 'closed') {
        g_form.setReadOnly('stage', true)
    }
}

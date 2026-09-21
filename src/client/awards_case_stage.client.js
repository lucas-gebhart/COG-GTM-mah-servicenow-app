function onLoad() {
    var flag = g_form.getValue('aging_flag')
    var days = g_form.getValue('days_in_stage')
    if (flag === 'red') {
        g_form.addErrorMessage('Aging RED: ' + days + ' days in stage — past the 75-day target. Escalate per MAH SOP.')
    } else if (flag === 'amber') {
        g_form.addWarningMessage('Aging AMBER: ' + days + ' days in stage — approaching the 75-day target (60-day warning).')
    }
    var stage = g_form.getValue('stage')
    if (stage === 'cancelled' || stage === 'closed') {
        g_form.setReadOnly('stage', true)
    }
}

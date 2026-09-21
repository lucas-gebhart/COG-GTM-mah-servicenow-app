/**
 * Status inquiry record producer (pre-insert script). Runs the parameterized lookup in
 * src/server/services/statusInquiry.ts and echoes only operational status. Nothing is
 * inserted: the abort is intentional — this producer is an intake form, not a data entry.
 */
;(function runStatusInquiry() {
    var mod = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/statusInquiry.ts')
    var result = mod.lookupCaseStatus({
        case_number: String(producer.case_number || ''),
        service_number_last4: String(producer.service_number_last4 || ''),
        zip: String(producer.zip || ''),
    })
    if (!result.found) {
        gs.addErrorMessage(result.message)
    } else {
        var parts = [result.message]
        if (result.aging_flag && result.aging_flag !== 'green') {
            parts.push('This case has been in its current stage for ' + result.days_in_stage + ' days and is being tracked by the fulfilment team.')
        }
        if (result.line_count) parts.push('Items on the case: ' + result.line_count + '.')
        if (result.shipped) {
            parts.push('Shipped ' + result.shipped + (result.tracking_number ? ' — tracking ' + result.tracking_number : '') + '.')
        }
        if (result.latest_note) parts.push('Latest update: ' + result.latest_note)
        gs.addInfoMessage(parts.join(' '))
    }
    current.setAbortAction(true)
})()

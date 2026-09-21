/**
 * SES flag request record producer (pre-insert). Whitelist-validates the free text and the
 * quantity range before the record is written; mapToField already copied the variables.
 */
;(function prepareSesFlagRequest() {
    var validators = require('x_cog_mah/mah-case-management/0.1.0/src/server/lib/validators.ts')
    var results = [
        validators.validateSafeText('requesting_office', producer.requesting_office, 120, true),
        validators.validateSafeText('executive_name', producer.executive_name, 120, true),
        validators.validateSafeText('position_title', producer.position_title, 160, true),
        validators.validateQuantity(Number(producer.quantity), 'quantity', 20),
        validators.validateEmail(String(producer.poc_email || '')),
        validators.validateMultiline('ship_to', producer.ship_to, 400),
        validators.validateMultiline('justification', producer.justification),
    ]
    if (String(producer.poc_phone || '') !== '') results.push(validators.validatePhone(String(producer.poc_phone)))
    var check = validators.mergeResults(results)
    if (!check.valid) {
        for (var i = 0; i < check.issues.length; i++) gs.addErrorMessage(check.issues[i].message)
        gs.info(JSON.stringify({ event: 'validation_failure', channel: 'record_producer', table: 'x_cog_mah_ses_flag_request', user: gs.getUserID(), issues: check.issues.length }))
        current.setAbortAction(true)
        return
    }
    current.state = 'draft'
    current.quantity = Number(producer.quantity)
})()

/**
 * SES flag request record producer (pre-insert). Whitelist-validates the free text and the
 * quantity range before the record is written; mapToField already copied the variables.
 */
;(function prepareSesFlagRequest() {
    var validators = require('x_cog_mah/mah-case-management/0.1.0/src/server/lib/validators.ts')
    // producer.* values are platform string objects, not JS primitives: coerce before the typeof checks.
    var input = {
        requesting_office: String(producer.requesting_office || ''),
        executive_name: String(producer.executive_name || ''),
        position_title: String(producer.position_title || ''),
        quantity: String(producer.quantity || ''),
        poc_email: String(producer.poc_email || ''),
        poc_phone: String(producer.poc_phone || ''),
        ship_to: String(producer.ship_to || ''),
        justification: String(producer.justification || ''),
    }
    var results = [
        validators.validateSafeText('requesting_office', input.requesting_office, 120, true),
        validators.validateSafeText('executive_name', input.executive_name, 120, true),
        validators.validateSafeText('position_title', input.position_title, 160, true),
        validators.validateQuantity(input.quantity, 'quantity', 20),
        validators.validateEmail(input.poc_email),
        validators.validateMultiline('ship_to', input.ship_to, 400),
        validators.validateMultiline('justification', input.justification),
    ]
    if (input.poc_phone !== '') results.push(validators.validatePhone(input.poc_phone))
    var check = validators.mergeResults(results)
    if (!check.valid) {
        for (var i = 0; i < check.issues.length; i++) gs.addErrorMessage(check.issues[i].message)
        gs.info(JSON.stringify({ event: 'validation_failure', channel: 'record_producer', table: 'x_cog_mah_ses_flag_request', user: gs.getUserID(), issues: check.issues.length }))
        current.setAbortAction(true)
        return
    }
    current.state = 'draft'
    current.quantity = Number(input.quantity)
})()

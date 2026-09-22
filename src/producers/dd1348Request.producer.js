/**
 * DD Form 1348-6 record producer (pre-insert). Normalizes the header, runs the shared header
 * validator so the requester gets field-level feedback before the before-insert business rule
 * would reject the record, and stamps provenance. mapToField already copied the variables.
 */
;(function prepareDd1348Request() {
    var validators = require('x_cog_mah/mah-case-management/0.1.0/src/server/lib/validators.ts')
    var header = {
        document_number: String(producer.document_number || '').toUpperCase().replace(/\s+/g, ''),
        dodaac: String(producer.dodaac || '').toUpperCase(),
        uic: String(producer.uic || '').toUpperCase(),
        requisition_priority: String(producer.requisition_priority || ''),
        project_code: String(producer.project_code || '').toUpperCase(),
        fund_code: String(producer.fund_code || '').toUpperCase(),
        requester_poc: String(producer.requester_poc || ''),
        ship_to: String(producer.ship_to || ''),
        justification: String(producer.justification || ''),
    }
    var check = validators.validateDd1348Header(header)
    if (!check.valid) {
        for (var i = 0; i < check.issues.length; i++) gs.addErrorMessage(check.issues[i].message)
        gs.info(JSON.stringify({ event: 'validation_failure', channel: 'record_producer', table: 'x_cog_mah_heraldry_request', user: gs.getUserID(), issues: check.issues.length }))
        current.setAbortAction(true)
        return
    }
    current.document_number = header.document_number
    current.dodaac = header.dodaac
    current.uic = header.uic
    current.project_code = header.project_code
    current.fund_code = header.fund_code
    current.state = 'draft'
    current.legacy_form = ''
    current.work_notes = 'Created from the DD Form 1348-6 request form (Employee Center) by ' + gs.getUserDisplayName()
})()

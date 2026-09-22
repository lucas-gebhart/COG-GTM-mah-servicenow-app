/**
 * DD Form 1348-6 header — client-side field behaviour on x_cog_mah_heraldry_request.
 * Immediate operator feedback only; the before business rule (src/server/rules/heraldryRequest.ts)
 * remains the authoritative validator. Regexes mirror src/server/lib/validators.ts and are kept
 * in sync by test/clientScripts.test.ts.
 */
function onLoad() {
    var released = g_form.getValue('released_to_vendor')
    if (released) {
        g_form.addInfoMessage('Request has been released to vendor and may not be modified')
        var fields = ['document_number', 'dodaac', 'uic', 'requisition_priority', 'project_code', 'fund_code', 'signal_code', 'required_delivery_date', 'requesting_unit', 'requester_poc', 'requester_poc_email', 'requester_poc_phone', 'ship_to', 'justification', 'vendor']
        for (var i = 0; i < fields.length; i++) g_form.setReadOnly(fields[i], true)
    }
    var state = g_form.getValue('state')
    if (state === 'draft' && g_form.isNewRecord()) {
        g_form.addInfoMessage('Enter the DD Form 1348-6 header. Document number = DODAAC (6) + Julian date (YDDD) + serial (4).')
    }
}

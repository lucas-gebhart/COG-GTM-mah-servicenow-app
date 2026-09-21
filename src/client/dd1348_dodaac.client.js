/* eslint-disable no-undef, no-unused-vars */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        g_form.hideFieldMsg('dodaac', true)
        return
    }
    var v = String(newValue).toUpperCase()
    if (v !== newValue) g_form.setValue('dodaac', v)
    var DODAAC = /^[A-Z0-9]{6}$/
    var SERVICE = 'WNFMZHSERV'
    g_form.hideFieldMsg('dodaac', true)
    if (!DODAAC.test(v)) {
        g_form.showFieldMsg('dodaac', 'DODAAC must be exactly 6 alphanumeric characters', 'error')
        return
    }
    if (SERVICE.indexOf(v.charAt(0)) < 0) {
        g_form.showFieldMsg('dodaac', 'DODAAC service designator "' + v.charAt(0) + '" is not recognized', 'error')
        return
    }
    var doc = String(g_form.getValue('document_number') || '').toUpperCase()
    if (doc.length === 14 && doc.substring(0, 6) !== v) {
        g_form.showFieldMsg('document_number', 'Document number DODAAC does not match the DODAAC field', 'error')
    } else {
        g_form.hideFieldMsg('document_number', true)
    }
}

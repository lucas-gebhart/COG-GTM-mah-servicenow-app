/* eslint-disable no-undef, no-unused-vars */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        g_form.hideFieldMsg('document_number', true)
        return
    }
    var v = String(newValue).toUpperCase().replace(/\s+/g, '')
    if (v !== newValue) g_form.setValue('document_number', v)
    g_form.hideFieldMsg('document_number', true)
    if (!/^[A-Z0-9]{14}$/.test(v)) {
        g_form.showFieldMsg('document_number', 'Document number must be exactly 14 alphanumeric characters', 'error')
        return
    }
    var julian = v.substring(6, 10)
    var doy = parseInt(julian.substring(1), 10)
    if (!/^\d{4}$/.test(julian) || doy < 1 || doy > 366) {
        g_form.showFieldMsg('document_number', 'Document number positions 7–10 must be a Julian date (YDDD)', 'error')
        return
    }
    var dodaac = String(g_form.getValue('dodaac') || '').toUpperCase()
    if (!dodaac) {
        g_form.setValue('dodaac', v.substring(0, 6))
    } else if (dodaac !== v.substring(0, 6)) {
        g_form.showFieldMsg('document_number', 'Document number DODAAC does not match the DODAAC field', 'error')
    }
}

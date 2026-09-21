/* eslint-disable no-undef, no-unused-vars */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        g_form.hideFieldMsg('uic', true)
        return
    }
    var v = String(newValue).toUpperCase()
    if (v !== newValue) g_form.setValue('uic', v)
    g_form.hideFieldMsg('uic', true)
    if (!/^W[A-Z0-9]{5}$/.test(v)) {
        g_form.showFieldMsg('uic', 'UIC must be "W" followed by 5 alphanumeric characters', 'error')
    }
}

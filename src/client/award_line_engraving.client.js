function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') return
    var v = String(newValue)
    g_form.hideFieldMsg('engraving_text', true)
    if (v.length > 60) {
        g_form.showFieldMsg('engraving_text', 'Engraving text is limited to 60 characters (' + v.length + ' entered)', 'error')
        return
    }
    if (!/^[A-Za-z0-9 .,'&/-]*$/.test(v)) {
        g_form.showFieldMsg('engraving_text', 'Engraving text may only contain letters, digits, space . , \' & / -', 'error')
    }
}

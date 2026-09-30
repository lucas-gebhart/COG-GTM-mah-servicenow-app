function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') return
    var n = parseInt(newValue, 10)
    g_form.hideFieldMsg('requisition_priority', true)
    if (n >= 1 && n <= 3) {
        g_form.showFieldMsg('requisition_priority', 'Priority designator 01–03 (IPG I): TACOM review target 1 working day; confirm required delivery date.', 'info')
        g_form.setMandatory('required_delivery_date', true)
    } else {
        g_form.setMandatory('required_delivery_date', false)
    }
}

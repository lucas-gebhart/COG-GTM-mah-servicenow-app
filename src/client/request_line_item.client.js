/* eslint-disable no-undef, no-unused-vars */
/**
 * When a heraldic item is picked, pull its NSN, nomenclature, unit of issue and price onto the line.
 */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') return
    var item = g_form.getReference('heraldic_item', function (ref) {
        if (!ref) return
        g_form.setValue('nsn_or_exception', ref.stock_number)
        g_form.setValue('nomenclature', ref.nomenclature)
        g_form.setValue('unit_of_issue', ref.unit_of_issue)
        g_form.setValue('unit_price', ref.unit_price)
        var qty = parseInt(g_form.getValue('quantity'), 10)
        var price = parseFloat(ref.unit_price)
        if (!isNaN(qty) && !isNaN(price)) g_form.setValue('extended_price', (Math.round(qty * price * 100) / 100).toFixed(2))
    })
}

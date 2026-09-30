/**
 * When a catalog model (cmdb_model extension x_cog_mah_native_catalog_item) is picked, pull its
 * NSN (model_number), nomenclature (name), unit of issue and catalog price (cost) onto the line.
 */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') return
    g_form.getReference('model', function (ref) {
        if (!ref) return
        g_form.setValue('nsn_or_exception', ref.model_number)
        g_form.setValue('nomenclature', ref.name)
        g_form.setValue('unit_of_issue', ref.unit_of_issue)
        g_form.setValue('unit_price', ref.cost)
        var qty = parseInt(g_form.getValue('quantity'), 10)
        var price = parseFloat(ref.cost)
        if (!isNaN(qty) && !isNaN(price)) g_form.setValue('extended_price', (Math.round(qty * price * 100) / 100).toFixed(2))
    })
}

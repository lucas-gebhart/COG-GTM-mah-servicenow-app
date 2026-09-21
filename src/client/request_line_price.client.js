/* eslint-disable no-undef, no-unused-vars */
/**
 * Live extended price on x_cog_mah_request_line (quantity x unit price, 2 dp). The server
 * before rule recomputes it authoritatively (src/server/rules/requestLine.ts).
 */
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) return
    var qty = parseInt(g_form.getValue('quantity'), 10)
    var price = parseFloat(g_form.getValue('unit_price'))
    if (isNaN(qty) || isNaN(price) || qty < 0 || price < 0) {
        g_form.setValue('extended_price', '')
        return
    }
    g_form.setValue('extended_price', (Math.round(qty * price * 100) / 100).toFixed(2))
}

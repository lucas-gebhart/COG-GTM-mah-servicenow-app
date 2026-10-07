/**
 * Script Include bridge: exposes the reconciliation module to background scripts and
 * scheduled reports (`new x_cog_mah_native.MAHNativeReconciliation().reportJson()`).
 * Logic lives in src/server/services/reconciliation.ts.
 */
var MAHNativeReconciliation = Class.create()
MAHNativeReconciliation.prototype = {
    initialize: function () {
        this._mod = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/reconciliation.ts')
    },
    /** @returns {object} the full reconciliation report */
    report: function () {
        return this._mod.buildReconciliationReport()
    },
    /** @returns {string} JSON text of the report, for scheduled report bodies */
    reportJson: function () {
        return JSON.stringify(this._mod.buildReconciliationReport())
    },
    type: 'MAHNativeReconciliation',
}

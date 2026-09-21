/**
 * Script Include bridge: exposes the reconciliation module to reports, scheduled
 * reports and background scripts (`new x_cog_mah.MAHReconciliation().report()`).
 * Logic lives in src/server/services/reconciliation.ts.
 */
var MAHReconciliation = Class.create()
MAHReconciliation.prototype = {
    initialize: function () {
        this._mod = require('x_cog_mah/mah-case-management/0.1.0/src/server/services/reconciliation.ts')
    },
    /** @returns {object} the full reconciliation report */
    report: function () {
        return this._mod.buildReconciliationReport()
    },
    /** @returns {string} JSON text of the report, for scheduled report bodies */
    reportJson: function () {
        return JSON.stringify(this._mod.buildReconciliationReport())
    },
    type: 'MAHReconciliation',
}

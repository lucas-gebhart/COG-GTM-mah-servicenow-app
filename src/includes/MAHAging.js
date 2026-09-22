/**
 * Script Include bridge for the aging engine so the nightly job can be triggered from a
 * background script or a UI action (`new x_cog_mah.MAHAging().runNow()`).
 * Logic lives in src/server/jobs/nightlyAging.ts.
 */
var MAHAging = Class.create()
MAHAging.prototype = {
    initialize: function () {
        this._mod = require('x_cog_mah/mah-case-management/0.1.0/src/server/jobs/nightlyAging.ts')
    },
    /** @returns {object} run summary (cases scanned, flags changed, red events fired) */
    runNow: function () {
        return this._mod.runNightlyAging()
    },
    type: 'MAHAging',
}

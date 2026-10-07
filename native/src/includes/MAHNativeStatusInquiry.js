/**
 * Client-callable Script Include (GlideAjax) behind the Status inquiry record producer.
 * Validation and lookup live in src/server/services/statusInquiry.ts.
 */
var MAHNativeStatusInquiry = Class.create()
MAHNativeStatusInquiry.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    lookup: function () {
        var mod = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/services/statusInquiry.ts')
        var result = mod.lookupCaseStatus({
            case_number: String(this.getParameter('sysparm_case_number') || ''),
            service_number_last4: String(this.getParameter('sysparm_last4') || ''),
            zip: String(this.getParameter('sysparm_zip') || ''),
        })
        return JSON.stringify(result)
    },
    type: 'MAHNativeStatusInquiry',
})

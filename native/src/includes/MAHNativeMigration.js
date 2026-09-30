/**
 * Bridge between the generated Transform Map scripts (src/fluent/migration/transform_maps.now.ts)
 * and the TypeScript migration engine. Every staging table's onStart / onBefore / onAfter /
 * onComplete script calls one method here with its legacy form name, so the mapping logic
 * lives once in src/server/migration and is unit-tested outside the instance.
 *
 * Failures never create records of their own: onBefore returns `{ ignore, error, statusMessage }`
 * and the generated script applies them to the Import Set row (state error / ignored + comment).
 */
var MAHNativeMigration = Class.create()

MAHNativeMigration.prototype = {
    initialize: function () {
        this._mod = require('x_cog_mah_native/mah-case-management-native/0.1.0/src/server/migration/transformEngine.ts')
    },

    /** onStart transform script: `import_set` is the sys_import_set GlideRecord. */
    onStart: function (form, importSet) {
        this._mod.onStart(form, importSet ? String(importSet.getUniqueValue()) : '')
    },

    /**
     * onBefore transform script. `action` is the transform's 'insert' | 'update'. Returns
     * `{ ignore, error, statusMessage, warningCount, quarantined }` for the caller to apply.
     */
    onBefore: function (form, source, target, action) {
        return this._mod.onBefore(form, source, target, action === 'update')
    },

    onAfter: function (form, source, target) {
        this._mod.onAfter(form, source, target)
    },

    onComplete: function (form, importSet) {
        return this._mod.onComplete(form, importSet ? String(importSet.getUniqueValue()) : '')
    },

    /** Merge duplicate requesters by dedupe_key; called once per batch from tools/migrate.ts. */
    coalesceRequesters: function (batchId) {
        return this._mod.coalesceRequesterTable(String(batchId || ''))
    },

    type: 'MAHNativeMigration',
}

/**
 * Bridge between the generated Transform Map scripts (src/fluent/migration/transform_maps.now.ts)
 * and the TypeScript migration engine. Every staging table's onStart / onBefore / onAfter /
 * onComplete script calls one method here with its legacy form name, so the mapping logic
 * lives once in src/server/migration and is unit-tested outside the instance.
 */
var MAHMigration = Class.create()

MAHMigration.prototype = {
    initialize: function () {
        this._mod = require(
            'x_cog_mah/mah-case-management/0.1.0/src/server/migration/transformEngine.ts',
        )
    },

    /** onStart transform script: `import_set` is the sys_import_set GlideRecord. */
    onStart: function (form, importSet) {
        this._mod.onStart(form, importSet ? String(importSet.getUniqueValue()) : '')
    },

    /**
     * onBefore transform script. `action` is the transform's 'insert' | 'update'. Returns
     * `{ ignore, statusMessage, warningCount, quarantined }` for the caller to apply.
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

    /** Merge duplicate requesters by dedupe_key; called once per batch from POST /migration/finalize. */
    coalesceRequesters: function (batchId) {
        return this._mod.coalesceRequesterTable(String(batchId || ''))
    },

    /** Exception counts by type for one batch id. */
    batchExceptionCounts: function (batchId) {
        return this._mod.batchExceptionCounts(String(batchId || ''))
    },

    type: 'MAHMigration',
}

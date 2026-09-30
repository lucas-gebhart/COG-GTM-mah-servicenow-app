/**
 * Live intake through the native Import Set API (replaces v1's Scripted REST `/api/x_cog_mah/authorization_intake`).
 *
 * `POST /api/now/import/x_cog_mah_native_stg_authorization_line` (one award line per row; the same
 * flat columns as the v1 delimited feed, plus `file_name`) lands rows on this staging table and the
 * transform map below turns them into an authorization-file task, awards cases (coalesced on the
 * source record id, so a re-post is idempotent) and award lines. Rows that fail the ported v1
 * validators stay in the Import Set in state `error` with the reason in `sys_import_state_comment`.
 * Logic lives in src/server/intake/importSetIntake.ts (unit-tested); this file is metadata only.
 */
import { ImportSet, StringColumn, Table } from '@servicenow/sdk/core'

export const x_cog_mah_native_stg_authorization_line = Table({
    name: 'x_cog_mah_native_stg_authorization_line',
    label: 'MAH Staging: authorization line (live intake)',
    extends: 'sys_import_set_row',
    schema: {
        file_name: StringColumn({ label: 'file_name', maxLength: 255 }),
        record_id: StringColumn({ label: 'record_id', maxLength: 255 }),
        agency: StringColumn({ label: 'agency', maxLength: 255 }),
        authorization_date: StringColumn({ label: 'authorization_date', maxLength: 255 }),
        requester_type: StringColumn({ label: 'requester_type', maxLength: 255 }),
        last_name: StringColumn({ label: 'last_name', maxLength: 255 }),
        first_name: StringColumn({ label: 'first_name', maxLength: 255 }),
        unit_name: StringColumn({ label: 'unit_name', maxLength: 255 }),
        service_number_last4: StringColumn({ label: 'service_number_last4', maxLength: 255 }),
        dob: StringColumn({ label: 'dob', maxLength: 255 }),
        email: StringColumn({ label: 'email', maxLength: 255 }),
        phone: StringColumn({ label: 'phone', maxLength: 255 }),
        address_1: StringColumn({ label: 'address_1', maxLength: 255 }),
        address_2: StringColumn({ label: 'address_2', maxLength: 255 }),
        city: StringColumn({ label: 'city', maxLength: 255 }),
        state: StringColumn({ label: 'state', maxLength: 255 }),
        zip: StringColumn({ label: 'zip', maxLength: 255 }),
        ship_to: StringColumn({ label: 'ship_to', maxLength: 1000 }),
        award_name: StringColumn({ label: 'award_name', maxLength: 255 }),
        device: StringColumn({ label: 'device', maxLength: 255 }),
        quantity: StringColumn({ label: 'quantity', maxLength: 255 }),
        engraving_text: StringColumn({ label: 'engraving_text', maxLength: 255 }),
        engraving_required: StringColumn({ label: 'engraving_required', maxLength: 255 }),
    },
    allowWebServiceAccess: true,
})

export const tm_intake_authorization_line = ImportSet({
    $id: Now.ID['tm_intake_authorization_line'],
    name: 'MAH Intake: authorization line -> x_cog_mah_native_awards_case',
    sourceTable: 'x_cog_mah_native_stg_authorization_line',
    targetTable: 'x_cog_mah_native_awards_case',
    active: true,
    order: 5,
    runBusinessRules: true,
    enforceMandatoryFields: 'no',
    copyEmptyFields: false,
    createOnEmptyCoalesce: true,
    fields: {
        source_record_id: { sourceField: 'record_id', coalesce: true, coalesceCaseSensitive: false },
    },
    runScript: false,
    scripts: [
        {
            $id: Now.ID['tm_intake_authorization_line_onBefore'],
            when: 'onBefore',
            order: 200,
            active: true,
            script: "(function runTransformScript(source, map, log, target) {\n    var r = new x_cog_mah_native.MAHNativeMigration().intakeBefore(source, target, !target.isNewRecord());\n    if (r.ignore) { ignore = true; }\n    if (r.error) { error = true; error_message = r.statusMessage; }\n    if (r.statusMessage) { status_message = r.statusMessage; }\n})(source, map, log, target);",
        },
        {
            $id: Now.ID['tm_intake_authorization_line_onAfter'],
            when: 'onAfter',
            order: 300,
            active: true,
            script: "(function runTransformScript(source, map, log, target) {\n    new x_cog_mah_native.MAHNativeMigration().intakeAfter(source, target);\n})(source, map, log, target);",
        },
        {
            $id: Now.ID['tm_intake_authorization_line_onComplete'],
            when: 'onComplete',
            order: 400,
            active: true,
            script: "(function runTransformScript(source, map, log, target) {\n    new x_cog_mah_native.MAHNativeMigration().intakeComplete(import_set);\n})(source, map, log, target);",
        },
    ],
})

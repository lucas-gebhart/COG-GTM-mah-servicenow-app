/**
 * Native assignment rules (sysrule_assignment) — replace v1's hand-written queue routing.
 * The platform evaluates them on insert/update of the task-derived tables and fills
 * `assignment_group`; "My Groups Work" and the Visual Task Board pick the work up from there.
 */
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'
import { group_assembly, group_engraving, group_tacom, group_warehouse } from './groups.now'

export const ar_engraving_job = Record({
    $id: Now.ID['ar_engraving_job'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: engraving jobs → Engraving Shop',
        table: 'x_cog_mah_native_engraving_job',
        active: true,
        condition: 'active=true^assignment_groupISEMPTY',
        group: group_engraving,
        order: 100,
    },
})

export const ar_case_assembly = Record({
    $id: Now.ID['ar_case_assembly'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: awards cases in Assembly/QC → Assembly and QC',
        table: 'x_cog_mah_native_awards_case',
        active: true,
        condition: 'active=true^stage=assembly_qc',
        group: group_assembly,
        order: 200,
    },
})

export const ar_case_warehouse = Record({
    $id: Now.ID['ar_case_warehouse'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: awards cases in Warehouse → Warehouse',
        table: 'x_cog_mah_native_awards_case',
        active: true,
        condition: 'active=true^stage=warehouse',
        group: group_warehouse,
        order: 210,
    },
})

export const ar_case_intake = Record({
    $id: Now.ID['ar_case_intake'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: new awards cases → TACOM Awards Staff',
        table: 'x_cog_mah_native_awards_case',
        active: true,
        condition: 'active=true^stageINauthorized,engraving^assignment_groupISEMPTY',
        group: group_tacom,
        order: 220,
    },
})

export const ar_shipment = Record({
    $id: Now.ID['ar_shipment'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: shipments → Warehouse',
        table: 'x_cog_mah_native_shipment',
        active: true,
        condition: 'active=true^assignment_groupISEMPTY',
        group: group_warehouse,
        order: 300,
    },
})

export const ar_request_review = Record({
    $id: Now.ID['ar_request_review'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: submitted heraldry requests → TACOM Awards Staff',
        table: 'x_cog_mah_native_heraldry_request',
        active: true,
        condition: 'active=true^stageINsubmitted,in_review^assignment_groupISEMPTY',
        group: group_tacom,
        order: 400,
    },
})

export const ar_ses = Record({
    $id: Now.ID['ar_ses'],
    table: 'sysrule_assignment',
    data: {
        name: 'MAH Native: SES flag requests → TACOM Awards Staff',
        table: 'x_cog_mah_native_ses_flag_request',
        active: true,
        condition: 'active=true^assignment_groupISEMPTY',
        group: group_tacom,
        order: 500,
    },
})

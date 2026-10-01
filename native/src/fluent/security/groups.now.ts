/**
 * Assignment groups (sys_user_group). Names come from GROUPS in src/server/lib/domain.ts. They are
 * the targets of the native assignment rules (sysrule_assignment), the approver group of the
 * heraldry-request review flow and the "My Groups Work" module. The Clearfield vendor group lives
 * in test_users.now.ts next to the vendor user it belongs to.
 */
import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

export const group_tacom = Record({
    $id: Now.ID['group_tacom'],
    table: 'sys_user_group',
    data: {
        name: 'MAH Native - TACOM Awards Staff',
        description: 'TACOM Awards Staff: case intake, requester management, DD 1348-6 review and approval (approver group of the review flow).',
        active: true,
    },
})

export const group_engraving = Record({
    $id: Now.ID['group_engraving'],
    table: 'sys_user_group',
    data: {
        name: 'MAH Native - Engraving Shop',
        description: 'Engraving shop floor: engraving-job tasks are assigned here by assignment rule.',
        active: true,
    },
})

export const group_assembly = Record({
    $id: Now.ID['group_assembly'],
    table: 'sys_user_group',
    data: {
        name: 'MAH Native - Assembly and QC',
        description: 'Assembly and quality control: awards cases entering Assembly/QC are assigned here by assignment rule.',
        active: true,
    },
})

export const group_warehouse = Record({
    $id: Now.ID['group_warehouse'],
    table: 'sys_user_group',
    data: {
        name: 'MAH Native - Warehouse',
        description: 'Warehouse: shipment tasks and awards cases entering Warehouse are assigned here by assignment rule.',
        active: true,
    },
})

import { Role } from '@servicenow/sdk/core'

// Mirrors the Domino ACL roles [TACOM] [CSR] [Engraver] [Assembler] [Warehouse] [Vendor] [DLA] [Admin].

export const tacomStaff = Role({
    $id: Now.ID['role_tacom_staff'],
    name: 'x_cog_mah.tacom_staff',
    description: 'TACOM ILSC Medals, Awards & Heraldry staff: owns awards cases end to end, approves SES flag requests, releases heraldry requests. Legacy [TACOM].',
})

export const csr = Role({
    $id: Now.ID['role_csr'],
    name: 'x_cog_mah.csr',
    description: 'Customer service representative: creates cases from authorization files, answers status inquiries, manages requesters. Legacy [CSR].',
})

export const engraver = Role({
    $id: Now.ID['role_engraver'],
    name: 'x_cog_mah.engraver',
    description: 'Engraving shop: works the engraving queue and completes engraving jobs. Legacy [Engraver].',
})

export const assembler = Role({
    $id: Now.ID['role_assembler'],
    name: 'x_cog_mah.assembler',
    description: 'Assembly / quality-control: assembles award sets and moves cases to the warehouse. Legacy [Assembler].',
})

export const warehouse = Role({
    $id: Now.ID['role_warehouse'],
    name: 'x_cog_mah.warehouse',
    description: 'Warehouse: picks, packs and ships award sets; records shipments. Legacy [Warehouse].',
})

export const vendor = Role({
    $id: Now.ID['role_vendor'],
    name: 'x_cog_mah.vendor',
    description: 'External heraldry vendor: sees only released requests assigned to its vendor record. Legacy [Vendor] / Readers field.',
})

export const dla = Role({
    $id: Now.ID['role_dla'],
    name: 'x_cog_mah.dla',
    description: 'DLA Troop Support heraldry program office: maintains the heraldic item catalog and vendors, releases DD Form 1348-6 requests. Legacy [DLA].',
})

export const admin = Role({
    $id: Now.ID['role_admin'],
    name: 'x_cog_mah.admin',
    description: 'MAH application administrator: all tables, status map, migration exceptions, requester merges. Legacy [Admin].',
    containsRoles: [tacomStaff, csr, engraver, assembler, warehouse, dla],
})

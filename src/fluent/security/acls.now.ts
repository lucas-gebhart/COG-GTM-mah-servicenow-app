// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/security.ts. Regenerate with `npm run gen:security`.
import { Acl } from '@servicenow/sdk/core'

// ---------------------------------------------------------------- table-level ACLs

Acl({
    $id: Now.ID['acl_awards_case_create'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case create: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_awards_case_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case create: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_awards_case_read'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin',
})

Acl({
    $id: Now.ID['acl_awards_case_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_awards_case_write'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case write: tacom_staff, csr, engraver, assembler, warehouse, admin',
})

Acl({
    $id: Now.ID['acl_awards_case_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case write: tacom_staff, csr, engraver, assembler, warehouse, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_awards_case_delete'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case delete: admin',
})

Acl({
    $id: Now.ID['acl_awards_case_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_awards_case delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_award_line_create'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line create: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_award_line_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line create: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_award_line_read'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin',
})

Acl({
    $id: Now.ID['acl_award_line_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_award_line_write'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line write: tacom_staff, csr, engraver, assembler, warehouse, admin',
})

Acl({
    $id: Now.ID['acl_award_line_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_award_line write: tacom_staff, csr, engraver, assembler, warehouse, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_award_line_delete'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_award_line delete: admin',
})

Acl({
    $id: Now.ID['acl_award_line_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_award_line',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_award_line delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_requester_create'],
    type: 'record',
    table: 'x_cog_mah_requester',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester create: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_requester_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester create: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_requester_read'],
    type: 'record',
    table: 'x_cog_mah_requester',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester read: tacom_staff, csr, dla, admin',
})

Acl({
    $id: Now.ID['acl_requester_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester read: tacom_staff, csr, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_requester_write'],
    type: 'record',
    table: 'x_cog_mah_requester',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester write: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_requester_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_requester write: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_requester_delete'],
    type: 'record',
    table: 'x_cog_mah_requester',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_requester delete: admin',
})

Acl({
    $id: Now.ID['acl_requester_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_requester delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_authorization_file_create'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file create: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_authorization_file_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file create: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_authorization_file_read'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file read: tacom_staff, csr, dla, admin',
})

Acl({
    $id: Now.ID['acl_authorization_file_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file read: tacom_staff, csr, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_authorization_file_write'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file write: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_authorization_file_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file write: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_authorization_file_delete'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file delete: admin',
})

Acl({
    $id: Now.ID['acl_authorization_file_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_authorization_file',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_authorization_file delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_engraving_job_create'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.engraver', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job create: tacom_staff, engraver, admin',
})

Acl({
    $id: Now.ID['acl_engraving_job_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.engraver', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job create: tacom_staff, engraver, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_engraving_job_read'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job read: tacom_staff, csr, engraver, assembler, admin',
})

Acl({
    $id: Now.ID['acl_engraving_job_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job read: tacom_staff, csr, engraver, assembler, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_engraving_job_write'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job write: tacom_staff, engraver, assembler, admin',
})

Acl({
    $id: Now.ID['acl_engraving_job_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job write: tacom_staff, engraver, assembler, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_engraving_job_delete'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job delete: admin',
})

Acl({
    $id: Now.ID['acl_engraving_job_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_engraving_job',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_engraving_job delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_shipment_create'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment create: tacom_staff, warehouse, admin',
})

Acl({
    $id: Now.ID['acl_shipment_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment create: tacom_staff, warehouse, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_shipment_read'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment read: tacom_staff, csr, warehouse, dla, admin',
})

Acl({
    $id: Now.ID['acl_shipment_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment read: tacom_staff, csr, warehouse, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_shipment_write'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment write: tacom_staff, warehouse, admin',
})

Acl({
    $id: Now.ID['acl_shipment_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.warehouse', 'x_cog_mah.admin'],
    description: 'x_cog_mah_shipment write: tacom_staff, warehouse, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_shipment_delete'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_shipment delete: admin',
})

Acl({
    $id: Now.ID['acl_shipment_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_shipment',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_shipment delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldry_request_create'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request create: tacom_staff, csr, dla, admin',
})

Acl({
    $id: Now.ID['acl_heraldry_request_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request create: tacom_staff, csr, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldry_request_read'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request read: tacom_staff, csr, dla, vendor, admin',
})

Acl({
    $id: Now.ID['acl_heraldry_request_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request read: tacom_staff, csr, dla, vendor, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldry_request_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request write: tacom_staff, csr, dla, vendor, admin',
})

Acl({
    $id: Now.ID['acl_heraldry_request_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request write: tacom_staff, csr, dla, vendor, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldry_request_delete'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request delete: admin',
})

Acl({
    $id: Now.ID['acl_heraldry_request_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_heraldry_request delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_request_line_create'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line create: tacom_staff, csr, dla, admin',
})

Acl({
    $id: Now.ID['acl_request_line_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line create: tacom_staff, csr, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_request_line_read'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line read: tacom_staff, csr, dla, vendor, admin',
})

Acl({
    $id: Now.ID['acl_request_line_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line read: tacom_staff, csr, dla, vendor, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_request_line_write'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line write: tacom_staff, csr, dla, vendor, admin',
})

Acl({
    $id: Now.ID['acl_request_line_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_request_line write: tacom_staff, csr, dla, vendor, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_request_line_delete'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_request_line delete: admin',
})

Acl({
    $id: Now.ID['acl_request_line_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_request_line delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldic_item_create'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item create: tacom_staff, dla, admin',
})

Acl({
    $id: Now.ID['acl_heraldic_item_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item create: tacom_staff, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldic_item_read'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_heraldic_item read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor',
})

Acl({
    $id: Now.ID['acl_heraldic_item_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_heraldic_item read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldic_item_write'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item write: tacom_staff, dla, admin',
})

Acl({
    $id: Now.ID['acl_heraldic_item_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item write: tacom_staff, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_heraldic_item_delete'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item delete: admin',
})

Acl({
    $id: Now.ID['acl_heraldic_item_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_heraldic_item',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_heraldic_item delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_create'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request create: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request create: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_read'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request read: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request read: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_write'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request write: tacom_staff, csr, admin',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request write: tacom_staff, csr, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_delete'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request delete: admin',
})

Acl({
    $id: Now.ID['acl_ses_flag_request_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_ses_flag_request',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_ses_flag_request delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_vendor_create'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor create: tacom_staff, dla, admin',
})

Acl({
    $id: Now.ID['acl_vendor_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor create: tacom_staff, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_vendor_read'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor read: tacom_staff, csr, dla, vendor, admin',
})

Acl({
    $id: Now.ID['acl_vendor_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.vendor', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor read: tacom_staff, csr, dla, vendor, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_vendor_write'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor write: tacom_staff, dla, admin',
})

Acl({
    $id: Now.ID['acl_vendor_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'x_cog_mah_vendor write: tacom_staff, dla, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_vendor_delete'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_vendor delete: admin',
})

Acl({
    $id: Now.ID['acl_vendor_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_vendor delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_case_note_create'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_case_note create: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor',
})

Acl({
    $id: Now.ID['acl_case_note_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_case_note create: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor (all fields)',
})

Acl({
    $id: Now.ID['acl_case_note_read'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_case_note read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor',
})

Acl({
    $id: Now.ID['acl_case_note_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.engraver', 'x_cog_mah.assembler', 'x_cog_mah.warehouse', 'x_cog_mah.dla', 'x_cog_mah.admin', 'x_cog_mah.vendor'],
    description: 'x_cog_mah_case_note read: tacom_staff, csr, engraver, assembler, warehouse, dla, admin, vendor (all fields)',
})

Acl({
    $id: Now.ID['acl_case_note_write'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_case_note write: admin',
})

Acl({
    $id: Now.ID['acl_case_note_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_case_note write: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_case_note_delete'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_case_note delete: admin',
})

Acl({
    $id: Now.ID['acl_case_note_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_case_note',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_case_note delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_status_map_create'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    operation: 'create',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map create: admin',
})

Acl({
    $id: Now.ID['acl_status_map_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map create: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_status_map_read'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_status_map read: tacom_staff, admin',
})

Acl({
    $id: Now.ID['acl_status_map_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_status_map read: tacom_staff, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_status_map_write'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map write: admin',
})

Acl({
    $id: Now.ID['acl_status_map_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map write: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_status_map_delete'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map delete: admin',
})

Acl({
    $id: Now.ID['acl_status_map_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_status_map',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_status_map delete: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_migration_exception_create'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    operation: 'create',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception create: admin',
})

Acl({
    $id: Now.ID['acl_migration_exception_all_fields_create'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    field: '*',
    operation: 'create',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception create: admin (all fields)',
})

Acl({
    $id: Now.ID['acl_migration_exception_read'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception read: tacom_staff, admin',
})

Acl({
    $id: Now.ID['acl_migration_exception_all_fields_read'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    field: '*',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception read: tacom_staff, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_migration_exception_write'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception write: tacom_staff, admin',
})

Acl({
    $id: Now.ID['acl_migration_exception_all_fields_write'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    field: '*',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception write: tacom_staff, admin (all fields)',
})

Acl({
    $id: Now.ID['acl_migration_exception_delete'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception delete: admin',
})

Acl({
    $id: Now.ID['acl_migration_exception_all_fields_delete'],
    type: 'record',
    table: 'x_cog_mah_migration_exception',
    field: '*',
    operation: 'delete',
    roles: ['x_cog_mah.admin'],
    description: 'x_cog_mah_migration_exception delete: admin (all fields)',
})

// ---------------------------------------------------------------- field-level ACLs

Acl({
    $id: Now.ID['acl_requester_dob_read'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: 'dob',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'PII: date of birth visible to case owners only',
})

Acl({
    $id: Now.ID['acl_requester_service_number_last4_read'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: 'service_number_last4',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    description: 'PII: partial service number visible to case owners only',
})

Acl({
    $id: Now.ID['acl_requester_merged_into_write'],
    type: 'record',
    table: 'x_cog_mah_requester',
    field: 'merged_into',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.admin'],
    description: 'Merging requesters is a supervised data-quality action',
})

Acl({
    $id: Now.ID['acl_awards_case_legacy_unid_write'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: 'legacy_unid',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'Legacy identity is immutable after migration',
})

Acl({
    $id: Now.ID['acl_awards_case_legacy_status_raw_write'],
    type: 'record',
    table: 'x_cog_mah_awards_case',
    field: 'legacy_status_raw',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'Legacy identity is immutable after migration',
})

Acl({
    $id: Now.ID['acl_heraldry_request_legacy_unid_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'legacy_unid',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'Legacy identity is immutable after migration',
})

Acl({
    $id: Now.ID['acl_heraldry_request_released_to_vendor_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'released_to_vendor',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendor release is a DLA / TACOM decision',
})

Acl({
    $id: Now.ID['acl_heraldry_request_vendor_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'vendor',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendor assignment is a DLA / TACOM decision',
})

Acl({
    $id: Now.ID['acl_heraldry_request_fund_code_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'fund_code',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not alter funding data',
})

Acl({
    $id: Now.ID['acl_heraldry_request_project_code_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'project_code',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not alter funding data',
})

Acl({
    $id: Now.ID['acl_heraldry_request_document_number_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'document_number',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not alter the DD 1348-6 header',
})

Acl({
    $id: Now.ID['acl_heraldry_request_justification_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'justification',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not alter the DD 1348-6 header',
})

Acl({
    $id: Now.ID['acl_heraldry_request_work_notes_read'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'work_notes',
    operation: 'read',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Internal work notes are not vendor-visible',
})

Acl({
    $id: Now.ID['acl_heraldry_request_work_notes_write'],
    type: 'record',
    table: 'x_cog_mah_heraldry_request',
    field: 'work_notes',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Internal work notes are not vendor-visible',
})

Acl({
    $id: Now.ID['acl_request_line_unit_price_write'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: 'unit_price',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not reprice lines',
})

Acl({
    $id: Now.ID['acl_request_line_quantity_write'],
    type: 'record',
    table: 'x_cog_mah_request_line',
    field: 'quantity',
    operation: 'write',
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    description: 'Vendors may not change ordered quantity',
})

Acl({
    $id: Now.ID['acl_vendor_portal_user_write'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: 'portal_user',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'Vendor login mapping is an administrative security setting',
})

Acl({
    $id: Now.ID['acl_vendor_user_group_write'],
    type: 'record',
    table: 'x_cog_mah_vendor',
    field: 'user_group',
    operation: 'write',
    roles: ['x_cog_mah.admin'],
    description: 'Vendor group mapping is an administrative security setting',
})

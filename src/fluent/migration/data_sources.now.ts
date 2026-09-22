// GENERATED FILE - do not edit by hand.
// Source of truth: src/server/lib/legacyContract.ts (+ statusMap.ts, rowTransforms.ts). Regenerate with `npm run gen:migration`.
import { Record } from '@servicenow/sdk/core'

export const ds_vendor = Record({
    $id: Now.ID['ds_vendor'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry Vendor',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_vendor',
        import_set_table_label: 'MAH Staging: heraldry Vendor',
        batch_size: 500,
    },
})

export const ds_heraldic_item = Record({
    $id: Now.ID['ds_heraldic_item'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry HeraldicItem',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_heraldic_item',
        import_set_table_label: 'MAH Staging: heraldry HeraldicItem',
        batch_size: 500,
    },
})

export const ds_requester = Record({
    $id: Now.ID['ds_requester'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals Requester',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_requester',
        import_set_table_label: 'MAH Staging: vetmedals Requester',
        batch_size: 500,
    },
})

export const ds_unit_requester = Record({
    $id: Now.ID['ds_unit_requester'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry Requester',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_unit_requester',
        import_set_table_label: 'MAH Staging: heraldry Requester',
        batch_size: 500,
    },
})

export const ds_authorization_file = Record({
    $id: Now.ID['ds_authorization_file'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals AuthorizationFile',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_authorization_file',
        import_set_table_label: 'MAH Staging: vetmedals AuthorizationFile',
        batch_size: 500,
    },
})

export const ds_awards_case = Record({
    $id: Now.ID['ds_awards_case'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals AwardsCase',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_awards_case',
        import_set_table_label: 'MAH Staging: vetmedals AwardsCase',
        batch_size: 500,
    },
})

export const ds_award_line = Record({
    $id: Now.ID['ds_award_line'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals AwardLine',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_award_line',
        import_set_table_label: 'MAH Staging: vetmedals AwardLine',
        batch_size: 500,
    },
})

export const ds_engraving_job = Record({
    $id: Now.ID['ds_engraving_job'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals EngravingJob',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_engraving_job',
        import_set_table_label: 'MAH Staging: vetmedals EngravingJob',
        batch_size: 500,
    },
})

export const ds_shipment = Record({
    $id: Now.ID['ds_shipment'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals ShipmentRecord',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_shipment',
        import_set_table_label: 'MAH Staging: vetmedals ShipmentRecord',
        batch_size: 500,
    },
})

export const ds_case_note = Record({
    $id: Now.ID['ds_case_note'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy vetmedals CaseNote',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_case_note',
        import_set_table_label: 'MAH Staging: vetmedals CaseNote',
        batch_size: 500,
    },
})

export const ds_heraldry_request = Record({
    $id: Now.ID['ds_heraldry_request'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry Request',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_heraldry_request',
        import_set_table_label: 'MAH Staging: heraldry Request',
        batch_size: 500,
    },
})

export const ds_request_line = Record({
    $id: Now.ID['ds_request_line'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry RequestLine',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_request_line',
        import_set_table_label: 'MAH Staging: heraldry RequestLine',
        batch_size: 500,
    },
})

export const ds_ses_flag_request = Record({
    $id: Now.ID['ds_ses_flag_request'],
    table: 'sys_data_source',
    data: {
        name: 'MAH Legacy heraldry SESFlagRequest',
        type: 'File',
        format: 'CSV',
        file_retrieval_method: 'Attachment',
        csv_delimiter: ',',
        header_row: 1,
        import_set_table_name: 'x_cog_mah_stg_ses_flag_request',
        import_set_table_label: 'MAH Staging: heraldry SESFlagRequest',
        batch_size: 500,
    },
})

/**
 * Legacy export contract: the exact CSV shape the source-system export produces for every
 * migrated form, the Import Set staging table that receives it, and the target table it lands in.
 *
 * This module is the single source of truth for:
 *   - src/fluent/migration/staging_tables.now.ts  (generated: one staging table per form)
 *   - src/fluent/migration/data_sources.now.ts    (generated: one CSV data source per form)
 *   - src/fluent/migration/transform_maps.now.ts  (hand-written field maps, validated against this)
 *   - tools/migrate.ts / tools/reconcile.ts        (load order, file names, control totals)
 *   - tests/legacyContract.test.ts                 (bidirectional sync with sample-data/ headers)
 *
 * Column order matches the export exactly; `tests/` fail if a sample CSV header drifts.
 */

export type LegacyDatabase = 'vetmedals' | 'heraldry'

export type LegacyFormName =
    | 'AwardsCase'
    | 'AwardLine'
    | 'Requester'
    | 'AuthorizationFile'
    | 'EngravingJob'
    | 'ShipmentRecord'
    | 'CaseNote'
    | 'Request'
    | 'RequestLine'
    | 'HeraldicItem'
    | 'SESFlagRequest'
    | 'Vendor'
    | 'HeraldryRequester'

/** Domino document items every exported row starts with (in this order). */
export const COMMON_LEGACY_COLUMNS = ['UNID', 'NoteID', 'ParentUNID', 'Created', 'Modified', 'LastUpdatedBy', 'Attachments'] as const

export interface LegacyFormContract {
    form: LegacyFormName
    database: LegacyDatabase
    /** Domino form name as it appears in the `Form` item / DXL (differs from `form` only for the two Requester forms). */
    legacyForm: string
    /** File name inside `export/csv/` (and `sample-data/`). */
    csvFile: string
    /** Import Set staging table (extends sys_import_set_row). */
    stagingTable: string
    /** Target production table. */
    targetTable: string
    /** Form-specific columns, in export order, after COMMON_LEGACY_COLUMNS. */
    columns: readonly string[]
    /** Columns that may exceed 255 characters in the export. */
    longColumns?: readonly string[]
    /** Column holding the legacy business key (case number, document number ...). */
    businessKey?: string
    /** Column holding the free-text status the status map normalizes. */
    statusColumn?: string
    /** How child rows find their parent: `ParentUNID` (response docs) or a business-key lookup. */
    parent?: { column: string; parentForm: LegacyFormName; by: 'unid' | 'business_key' }
    /** Load order: parents before children, lookups before transactions. */
    loadOrder: number
}

export const LEGACY_FORMS: Readonly<Record<LegacyFormName, LegacyFormContract>> = {
    Vendor: {
        form: 'Vendor',
        database: 'heraldry',
        legacyForm: 'Vendor',
        csvFile: 'heraldry-Vendor.csv',
        stagingTable: 'x_cog_mah_stg_vendor',
        targetTable: 'x_cog_mah_vendor',
        columns: ['VendorKey', 'VendorName', 'Address', 'City', 'State', 'ZIP', 'POC', 'Phone', 'Email', 'Products', 'ContractNumber', 'LeadTimeDays', 'Active', 'VendorUsers', 'VendorGroup', 'DocReaders'],
        businessKey: 'VendorKey',
        loadOrder: 10,
    },
    HeraldicItem: {
        form: 'HeraldicItem',
        database: 'heraldry',
        legacyForm: 'HeraldicItem',
        csvFile: 'heraldry-HeraldicItem.csv',
        stagingTable: 'x_cog_mah_stg_heraldic_item',
        targetTable: 'x_cog_mah_heraldic_item',
        columns: ['StockNumber', 'ItemName', 'Category', 'Description', 'Branch', 'UnitOfIssue', 'UnitPrice', 'MaxQtyPerRequest', 'LeadTimeDays', 'ApprovedVendors', 'Reference', 'Active', 'FSC', 'NIIN'],
        longColumns: ['Description'],
        businessKey: 'StockNumber',
        loadOrder: 20,
    },
    Requester: {
        form: 'Requester',
        database: 'vetmedals',
        legacyForm: 'Requester',
        csvFile: 'vetmedals-Requester.csv',
        stagingTable: 'x_cog_mah_stg_requester',
        targetTable: 'x_cog_mah_requester',
        columns: ['RequesterID', 'LastName', 'Suffix', 'FirstName', 'MI', 'Relationship', 'VeteranName', 'Street', 'City', 'State', 'ZIP', 'Phone', 'Email', 'PreferredContact', 'Source', 'CreatedDate', 'AddressVerified', 'AddressVerifiedDate', 'LookupKey', 'DisplayName', 'DocReaders', 'MergedInto'],
        businessKey: 'RequesterID',
        loadOrder: 30,
    },
    HeraldryRequester: {
        form: 'HeraldryRequester',
        database: 'heraldry',
        legacyForm: 'Requester',
        csvFile: 'heraldry-Requester.csv',
        stagingTable: 'x_cog_mah_stg_unit_requester',
        targetTable: 'x_cog_mah_requester',
        columns: ['RequesterKey', 'Name', 'Rank', 'DODAAC', 'UIC', 'UnitName', 'Role', 'Phone', 'Email', 'CreatedDate', 'LookupKey'],
        businessKey: 'RequesterKey',
        loadOrder: 35,
    },
    AuthorizationFile: {
        form: 'AuthorizationFile',
        database: 'vetmedals',
        legacyForm: 'AuthorizationFile',
        csvFile: 'vetmedals-AuthorizationFile.csv',
        stagingTable: 'x_cog_mah_stg_authorization_file',
        targetTable: 'x_cog_mah_authorization_file',
        columns: ['FileName', 'SourceAgency', 'Layout', 'TransmissionDate', 'ReceivedDate', 'AuthorizationDate', 'ImportStatus', 'ImportedDate', 'ImportedBy', 'RecordCount', 'CasesCreated', 'LinesCreated', 'RequestersCreated', 'RequestersMatched', 'RecordsRejected', 'TrailerChecksum', 'ChecksumMatch', 'ImportLog', 'DocReaders', 'FileKey'],
        longColumns: ['ImportLog'],
        businessKey: 'FileName',
        statusColumn: 'ImportStatus',
        loadOrder: 40,
    },
    AwardsCase: {
        form: 'AwardsCase',
        database: 'vetmedals',
        legacyForm: 'AwardsCase',
        csvFile: 'vetmedals-AwardsCase.csv',
        stagingTable: 'x_cog_mah_stg_awards_case',
        targetTable: 'x_cog_mah_awards_case',
        columns: ['CaseNumber', 'Stage', 'Source', 'AuthFileName', 'AuthFileLine', 'AuthorizationDate', 'EnteredDate', 'EnteredBy', 'Priority', 'ServiceNumber', 'VeteranLastName', 'VeteranFirstName', 'VeteranMI', 'VeteranRank', 'Branch', 'ServiceFrom', 'ServiceTo', 'Era', 'Deceased', 'RequesterKey', 'RequesterName', 'Relationship', 'AssignedCSR', 'LineCount', 'EngravingRequired', 'EngravingDate', 'EngravingJobNumber', 'AssemblyDate', 'QCResult', 'WarehouseDate', 'PickBin', 'ShippedDate', 'TrackingNumber', 'ClosedDate', 'DaysOpen', 'AgingFlag', 'HoldReason', 'StageBeforeHold', 'ShipToName', 'ShipToStreet', 'ShipToCity', 'ShipToState', 'ShipToZIP', 'Remarks', 'StatusHistory', 'DocReaders', 'DocAuthors', 'LookupKey', 'DaysInStage', 'LastModifiedBy', 'LastModifiedDate', 'AgingLastEval'],
        longColumns: ['Remarks', 'StatusHistory'],
        businessKey: 'CaseNumber',
        statusColumn: 'Stage',
        loadOrder: 50,
    },
    AwardLine: {
        form: 'AwardLine',
        database: 'vetmedals',
        legacyForm: 'AwardLine',
        csvFile: 'vetmedals-AwardLine.csv',
        stagingTable: 'x_cog_mah_stg_award_line',
        targetTable: 'x_cog_mah_award_line',
        columns: ['ParentCaseNumber', 'VeteranName', 'LineNumber', 'AwardName', 'AwardCode', 'AwardCategory', 'Quantity', 'SetType', 'Devices', 'DeviceCount', 'Engrave', 'EngravingText', 'StockNumber', 'LineStatus', 'BackorderETA', 'Authority', 'DocReaders', 'LineKey'],
        businessKey: 'LineKey',
        statusColumn: 'LineStatus',
        parent: { column: 'ParentUNID', parentForm: 'AwardsCase', by: 'unid' },
        loadOrder: 60,
    },
    EngravingJob: {
        form: 'EngravingJob',
        database: 'vetmedals',
        legacyForm: 'EngravingJob',
        csvFile: 'vetmedals-EngravingJob.csv',
        stagingTable: 'x_cog_mah_stg_engraving_job',
        targetTable: 'x_cog_mah_engraving_job',
        columns: ['JobNumber', 'CaseNumber', 'VeteranName', 'JobStatus', 'Priority', 'Items', 'EngravingText', 'Font', 'Machine', 'ProofChecked', 'QueuedDate', 'StartedDate', 'CompletedDate', 'Engraver', 'ReworkCount', 'Notes', 'DocReaders', 'DaysInQueue'],
        longColumns: ['Items', 'Notes'],
        businessKey: 'JobNumber',
        statusColumn: 'JobStatus',
        parent: { column: 'CaseNumber', parentForm: 'AwardsCase', by: 'business_key' },
        loadOrder: 70,
    },
    ShipmentRecord: {
        form: 'ShipmentRecord',
        database: 'vetmedals',
        legacyForm: 'ShipmentRecord',
        csvFile: 'vetmedals-ShipmentRecord.csv',
        stagingTable: 'x_cog_mah_stg_shipment',
        targetTable: 'x_cog_mah_shipment',
        columns: ['ShipmentNumber', 'CaseNumber', 'Partial', 'ShipToName', 'ShipToStreet', 'ShipToCity', 'ShipToState', 'ShipToZIP', 'Carrier', 'TrackingNumber', 'ShipStatus', 'PickedDate', 'ShippedDate', 'DeliveredDate', 'Contents', 'PieceCount', 'WeightOz', 'ShippedBy', 'Postage', 'ExceptionNote', 'DocReaders', 'ShipDateText'],
        businessKey: 'ShipmentNumber',
        statusColumn: 'ShipStatus',
        parent: { column: 'CaseNumber', parentForm: 'AwardsCase', by: 'business_key' },
        loadOrder: 80,
    },
    CaseNote: {
        form: 'CaseNote',
        database: 'vetmedals',
        legacyForm: 'CaseNote',
        csvFile: 'vetmedals-CaseNote.csv',
        stagingTable: 'x_cog_mah_stg_case_note',
        targetTable: 'x_cog_mah_case_note',
        columns: ['ParentCaseNumber', 'NoteType', 'ContactName', 'ContactPhone', 'Body', 'Summary', 'FollowUpDate', 'FollowUpDone', 'NoteAuthor', 'NoteDate', 'DocReaders', 'DocAuthors'],
        longColumns: ['Body'],
        parent: { column: 'ParentUNID', parentForm: 'AwardsCase', by: 'unid' },
        loadOrder: 90,
    },
    Request: {
        form: 'Request',
        database: 'heraldry',
        legacyForm: 'Request',
        csvFile: 'heraldry-Request.csv',
        stagingTable: 'x_cog_mah_stg_heraldry_request',
        targetTable: 'x_cog_mah_heraldry_request',
        columns: ['DocumentNumber', 'Status', 'DODAAC', 'UIC', 'UnitName', 'RPD', 'SignalCode', 'FundCode', 'ProjectCode', 'SupplementaryAddress', 'RequestType', 'RequiredDeliveryDate', 'ShipToDODAAC', 'ShipToName', 'ShipToAddress1', 'ShipToAddress2', 'ShipToCity', 'ShipToState', 'ShipToZIP', 'Justification', 'JustificationText', 'LineCount', 'TotalValue', 'EnteredDate', 'EnteredBy', 'SubmittedDate', 'ReviewedBy', 'ApprovedDate', 'VendorKey', 'VendorName', 'ReleasedDate', 'ReleasedBy', 'EstimatedShipDate', 'CancelReason', 'CancelledDate', 'CancelledBy', 'StatusHistory', 'DocReaders', 'DocAuthors', 'Priority', 'LastModifiedBy', 'LastModifiedDate', 'StatusInquiryKey', 'RequesterName', 'RequesterRank', 'RequesterRole', 'RequesterPhone', 'RequesterEmail'],
        longColumns: ['Justification', 'JustificationText', 'StatusHistory'],
        businessKey: 'DocumentNumber',
        statusColumn: 'Status',
        loadOrder: 100,
    },
    RequestLine: {
        form: 'RequestLine',
        database: 'heraldry',
        legacyForm: 'RequestLine',
        csvFile: 'heraldry-RequestLine.csv',
        stagingTable: 'x_cog_mah_stg_request_line',
        targetTable: 'x_cog_mah_request_line',
        columns: ['ParentDocNumber', 'LineNumber', 'LineDocNumber', 'NSN', 'ItemKey', 'ItemDescription', 'ExceptionData', 'UnitOfIssue', 'Quantity', 'UnitPrice', 'ExtendedPrice', 'LineStatus', 'VendorShipDate', 'DocReaders', 'VendorKey', 'EnteredBy', 'LookupKey'],
        longColumns: ['ExceptionData'],
        businessKey: 'LookupKey',
        statusColumn: 'LineStatus',
        parent: { column: 'ParentUNID', parentForm: 'Request', by: 'unid' },
        loadOrder: 110,
    },
    SESFlagRequest: {
        form: 'SESFlagRequest',
        database: 'heraldry',
        legacyForm: 'SESFlagRequest',
        csvFile: 'heraldry-SESFlagRequest.csv',
        stagingTable: 'x_cog_mah_stg_ses_flag_request',
        targetTable: 'x_cog_mah_ses_flag_request',
        columns: ['SESFlagNumber', 'Status', 'ExecutiveName', 'ExecutiveTitle', 'ExecutiveTier', 'Organization', 'FlagType', 'Quantity', 'DODAAC', 'UIC', 'ShipToAddress', 'Justification', 'EnteredDate', 'EnteredBy', 'ApprovalDate', 'ApprovedBy', 'ReturnReason', 'VendorKey', 'ReleasedDate', 'DocReaders', 'DocAuthors', 'StatusInquiryKey'],
        longColumns: ['Justification'],
        businessKey: 'SESFlagNumber',
        statusColumn: 'Status',
        loadOrder: 120,
    },
}

/** Forms in the order `tools/migrate.ts` loads them (lookups → parents → children). */
export const LOAD_ORDER: readonly LegacyFormName[] = (Object.values(LEGACY_FORMS) as LegacyFormContract[])
    .slice()
    .sort((a, b) => a.loadOrder - b.loadOrder)
    .map((f) => f.form)

/** Full header row (common + form-specific) exactly as the export writes it. */
export function csvHeader(form: LegacyFormName): readonly string[] {
    return [...COMMON_LEGACY_COLUMNS, ...LEGACY_FORMS[form].columns]
}

/**
 * Staging-table column name for an export header: `SSNLast4` → `ssn_last4`, `ShipToZIP` → `ship_to_zip`,
 * `UNID` → `unid`. Deterministic so every consumer (Fluent staging table, transform map, migrate.ts)
 * derives the same name from the header instead of hand-copying it.
 */
export function stagingColumnName(header: string): string {
    return header
        .replace(/^\$/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .toLowerCase()
}

/** Max length for a staging column; long free-text items get room, everything else 255. */
export function stagingColumnLength(form: LegacyFormName, header: string): number {
    const contract = LEGACY_FORMS[form]
    if (contract.longColumns?.includes(header)) return 4000
    if (header === 'Attachments' || header === 'DocReaders' || header === 'DocAuthors') return 1000
    return 255
}

/** Stable `$id` / variable name suffix for a form's generated Fluent metadata. */
export function formSlug(form: LegacyFormName): string {
    return stagingColumnName(form)
}

/** Migration batch identifier: `<yyyymmdd>-<source>` — recorded on every migration exception. */
export function batchId(now: Date, source: string): string {
    const d = now.toISOString().slice(0, 10).replace(/-/g, '')
    const safe = source.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 40)
    return `${d}-${safe}`
}

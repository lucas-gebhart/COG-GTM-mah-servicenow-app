/**
 * Employee Center / Service Portal intake — three record producers that replace the public
 * XPages (`StatusLookup`, `NewRequest1348`, `SESFlagRequest`). All three live in a dedicated
 * "Medals, Awards & Heraldry" category of the platform Service Catalog.
 */
import '@servicenow/sdk/global'
import {
    CatalogItemRecordProducer,
    MultiLineTextVariable,
    Record,
    ReferenceVariable,
    SelectBoxVariable,
    SingleLineTextVariable,
} from '@servicenow/sdk/core'

/** Out-of-box "Service Catalog" (sc_catalog) sys_id. */
const SERVICE_CATALOG = 'e0d08b13c3330100c8b837659bba8fb4'

export const mahCategory = Record({
    $id: Now.ID['sc_category_mah'],
    table: 'sc_category',
    data: {
        title: 'Medals, Awards & Heraldry',
        description: 'Awards case status, DD Form 1348-6 heraldic item requisitions and SES flag requests.',
        sc_catalog: SERVICE_CATALOG,
        active: true,
        order: 900,
    },
})

// ---------------------------------------------------------------------------------------
// 1. Status inquiry — "where is my case?" for veterans, next of kin and units.
//    The producer is used purely as an intake form: the lookup runs server side, only the
//    operational status is echoed back and no record is written (the inquiry itself is
//    captured through the JSON security log). Aborting the insert is deliberate.
// ---------------------------------------------------------------------------------------
export const rpStatusInquiry = CatalogItemRecordProducer({
    $id: Now.ID['rp_status_inquiry'],
    name: 'Awards case status inquiry',
    shortDescription: 'Check the fulfilment status of a medals and awards case',
    description:
        'Enter your MAH case number (on your acknowledgement letter) and either the last four digits of the service number or the mailing ZIP code. Only the current fulfilment stage and shipping information are returned.',
    table: 'x_cog_mah_case_note',
    catalogs: [SERVICE_CATALOG],
    categories: [mahCategory],
    availability: 'both',
    hideAttachment: true,
    hideAddToCart: true,
    hideAddToWishList: true,
    hideDeliveryTime: true,
    hideQuantitySelector: true,
    hideSaveAsDraft: true,
    redirectUrl: 'catalogHomePage',
    order: 10,
    meta: ['medals', 'awards', 'status', 'case', 'MAH'],
    variables: {
        case_number: SingleLineTextVariable({
            question: 'Case number',
            order: 100,
            mandatory: true,
            exampleText: 'MAH0001234',
            helpText: 'Three letters followed by seven digits, e.g. MAH0001234.',
            validateRegex: '^MAH[0-9]{7}$',
        }),
        service_number_last4: SingleLineTextVariable({
            question: 'Last four of the service number',
            order: 200,
            exampleText: '1234',
            helpText: 'Provide this OR the mailing ZIP code.',
            validateRegex: '^[0-9]{4}$',
        }),
        zip: SingleLineTextVariable({
            question: 'Mailing ZIP code',
            order: 300,
            exampleText: '48397',
            validateRegex: '^[0-9]{5}(-[0-9]{4})?$',
        }),
    },
    script: Now.include('../../producers/statusInquiry.producer.js'),
})

// ---------------------------------------------------------------------------------------
// 2. DD Form 1348-6 — DoD single line item requisition (heraldic items) from a unit / DLA.
// ---------------------------------------------------------------------------------------
export const rpDd1348Request = CatalogItemRecordProducer({
    $id: Now.ID['rp_dd1348_request'],
    name: 'DD Form 1348-6 heraldic item request',
    shortDescription: 'Requisition guidons, flags, streamers, colors and insignia (DD Form 1348-6)',
    description:
        'Submit a DoD Single Line Item Requisition System Document (DD Form 1348-6) for heraldic items. The request is created in Draft; add request lines, then Submit for TACOM review.',
    table: 'x_cog_mah_heraldry_request',
    catalogs: [SERVICE_CATALOG],
    categories: [mahCategory],
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.dla', 'x_cog_mah.admin'],
    availability: 'both',
    hideAddToCart: true,
    hideAddToWishList: true,
    hideDeliveryTime: true,
    hideQuantitySelector: true,
    redirectUrl: 'generatedRecord',
    order: 20,
    meta: ['1348', 'DD1348-6', 'heraldry', 'guidon', 'flag', 'requisition'],
    variables: {
        document_number: SingleLineTextVariable({
            question: 'Document number',
            order: 100,
            mandatory: true,
            mapToField: true,
            field: 'document_number',
            exampleText: 'W81XYZ61350001',
            helpText: 'DODAAC (6) + Julian date (YDDD) + serial (4) = 14 characters.',
            validateRegex: '^[A-Za-z0-9]{14}$',
        }),
        dodaac: SingleLineTextVariable({
            question: 'DODAAC',
            order: 110,
            mandatory: true,
            mapToField: true,
            field: 'dodaac',
            exampleText: 'W81XYZ',
            validateRegex: '^[A-Za-z0-9]{6}$',
        }),
        uic: SingleLineTextVariable({
            question: 'Unit identification code (UIC)',
            order: 120,
            mandatory: true,
            mapToField: true,
            field: 'uic',
            exampleText: 'WABC12',
            validateRegex: '^[Ww][A-Za-z0-9]{5}$',
        }),
        requisition_priority: SelectBoxVariable({
            question: 'Priority designator',
            order: 130,
            mandatory: true,
            mapToField: true,
            field: 'requisition_priority',
            defaultValue: '13',
            includeNone: false,
            choices: {
                '01': { label: '01 - F/AD I, UND A' },
                '02': { label: '02 - F/AD II, UND A' },
                '03': { label: '03 - F/AD III, UND A' },
                '04': { label: '04 - F/AD I, UND B' },
                '05': { label: '05 - F/AD II, UND B' },
                '06': { label: '06 - F/AD III, UND B' },
                '07': { label: '07 - F/AD IV, UND A' },
                '08': { label: '08 - F/AD V, UND A' },
                '09': { label: '09 - F/AD IV, UND B' },
                '10': { label: '10 - F/AD V, UND B' },
                '11': { label: '11 - F/AD I, UND C' },
                '12': { label: '12 - F/AD II, UND C' },
                '13': { label: '13 - F/AD III, UND C' },
                '14': { label: '14 - F/AD IV, UND C' },
                '15': { label: '15 - F/AD V, UND C' },
            },
        }),
        project_code: SingleLineTextVariable({
            question: 'Project code',
            order: 140,
            mapToField: true,
            field: 'project_code',
            validateRegex: '^([A-Za-z0-9]{3})?$',
        }),
        fund_code: SingleLineTextVariable({
            question: 'Fund code',
            order: 150,
            mapToField: true,
            field: 'fund_code',
            validateRegex: '^([A-Za-z0-9]{2})?$',
        }),
        requesting_unit: SingleLineTextVariable({
            question: 'Requesting unit',
            order: 200,
            mandatory: true,
            mapToField: true,
            field: 'requesting_unit',
            exampleText: '1st Battalion, 22nd Infantry Regiment',
        }),
        requester_poc: SingleLineTextVariable({
            question: 'Point of contact',
            order: 210,
            mandatory: true,
            mapToField: true,
            field: 'requester_poc',
            exampleText: 'SFC Jordan Reyes, Unit Supply',
        }),
        requester_poc_email: SingleLineTextVariable({
            question: 'POC e-mail',
            order: 220,
            mandatory: true,
            mapToField: true,
            field: 'requester_poc_email',
            exampleText: 'jordan.reyes.mil@army.mil',
            validateRegex: '^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,189}\\.[A-Za-z]{2,24}$',
        }),
        requester_poc_phone: SingleLineTextVariable({
            question: 'POC phone (DSN or commercial)',
            order: 230,
            mapToField: true,
            field: 'requester_poc_phone',
            exampleText: '(586) 282-1234',
            validateRegex: '^(\\+?[0-9(][0-9 ().-]{6,23})?$',
        }),
        ship_to: MultiLineTextVariable({
            question: 'Ship-to address',
            order: 300,
            mandatory: true,
            mapToField: true,
            field: 'ship_to',
            helpText: 'Unit, building, street, city, state, ZIP.',
        }),
        justification: MultiLineTextVariable({
            question: 'Justification / authority',
            order: 310,
            mandatory: true,
            mapToField: true,
            field: 'justification',
            helpText: 'Cite the authorizing regulation (e.g. AR 840-10 para) and the organizational event.',
        }),
        preferred_vendor: ReferenceVariable({
            question: 'Preferred vendor (optional)',
            order: 400,
            referenceTable: 'x_cog_mah_vendor',
            referenceQualCondition: 'active=true',
            mapToField: true,
            field: 'vendor',
        }),
    },
    script: Now.include('../../producers/dd1348Request.producer.js'),
})

// ---------------------------------------------------------------------------------------
// 3. SES flag request — positional flag for a Senior Executive Service member.
// ---------------------------------------------------------------------------------------
export const rpSesFlagRequest = CatalogItemRecordProducer({
    $id: Now.ID['rp_ses_flag_request'],
    name: 'SES flag request',
    shortDescription: 'Request the positional flag authorized for a Senior Executive Service member',
    description:
        'Requesting offices use this form to obtain the indoor, outdoor, automobile, boat or desk SES flag authorized by AR 840-10 for a newly appointed executive.',
    table: 'x_cog_mah_ses_flag_request',
    catalogs: [SERVICE_CATALOG],
    categories: [mahCategory],
    roles: ['x_cog_mah.tacom_staff', 'x_cog_mah.csr', 'x_cog_mah.admin'],
    availability: 'both',
    hideAddToCart: true,
    hideAddToWishList: true,
    hideDeliveryTime: true,
    hideQuantitySelector: true,
    redirectUrl: 'generatedRecord',
    order: 30,
    meta: ['SES', 'flag', 'executive', 'positional flag'],
    variables: {
        requesting_office: SingleLineTextVariable({
            question: 'Requesting office',
            order: 100,
            mandatory: true,
            mapToField: true,
            field: 'requesting_office',
            exampleText: 'Office of the Deputy to the Commanding General',
        }),
        executive_name: SingleLineTextVariable({
            question: 'Executive name',
            order: 110,
            mandatory: true,
            mapToField: true,
            field: 'executive_name',
        }),
        position_title: SingleLineTextVariable({
            question: 'Position title',
            order: 120,
            mandatory: true,
            mapToField: true,
            field: 'position_title',
            exampleText: 'Deputy to the Commanding General, TACOM',
        }),
        flag_type: SelectBoxVariable({
            question: 'Flag type',
            order: 200,
            mandatory: true,
            mapToField: true,
            field: 'flag_type',
            defaultValue: 'indoor',
            includeNone: false,
            choices: {
                indoor: { label: 'Indoor SES flag (4 ft 4 in x 5 ft 6 in)' },
                outdoor: { label: 'Outdoor SES flag (3 ft x 4 ft)' },
                automobile: { label: 'Automobile SES flag (12 in x 18 in)' },
                boat: { label: 'Boat SES flag (12 in x 18 in)' },
                desk: { label: 'Desk set miniature SES flag' },
            },
        }),
        quantity: SingleLineTextVariable({
            question: 'Quantity',
            order: 210,
            mandatory: true,
            mapToField: true,
            field: 'quantity',
            defaultValue: '1',
            validateRegex: '^[1-9][0-9]?$',
        }),
        poc_email: SingleLineTextVariable({
            question: 'POC e-mail',
            order: 300,
            mandatory: true,
            mapToField: true,
            field: 'poc_email',
            validateRegex: '^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,189}\\.[A-Za-z]{2,24}$',
        }),
        poc_phone: SingleLineTextVariable({
            question: 'POC phone',
            order: 310,
            mapToField: true,
            field: 'poc_phone',
            validateRegex: '^(\\+?[0-9(][0-9 ().-]{6,23})?$',
        }),
        ship_to: MultiLineTextVariable({
            question: 'Ship-to address',
            order: 320,
            mandatory: true,
            mapToField: true,
            field: 'ship_to',
        }),
        justification: MultiLineTextVariable({
            question: 'Justification',
            order: 400,
            mandatory: true,
            mapToField: true,
            field: 'justification',
            helpText: 'Appointment orders reference and effective date.',
        }),
    },
    script: Now.include('../../producers/sesFlagRequest.producer.js'),
})

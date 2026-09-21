/**
 * Access-control matrix: the single source of truth for table and field ACLs.
 *
 * `tools/generate-fluent-security.ts` renders this matrix into
 * `src/fluent/security/acls.now.ts`; `tests/security-sync.test.ts` fails when the two drift.
 * The README role table is rendered from the same structure by `tools/generate-docs.ts`.
 *
 * Mirrors the Domino ACL: [TACOM] and [CSR] own awards cases, [Engraver] / [Assembler] /
 * [Warehouse] work their queues, [DLA] manages the heraldry catalog and vendor release,
 * [Vendor] sees only released work assigned to it (enforced by query rules), [Admin]
 * is the application administrator.
 */
import { ROLES, TABLES, type RoleKey, type DomainTableKey as TableKey } from './domain'

export type Operation = 'create' | 'read' | 'write' | 'delete'

export type TableAccess = Readonly<Record<Operation, readonly RoleKey[]>>

const ALL_INTERNAL: readonly RoleKey[] = ['tacom_staff', 'csr', 'engraver', 'assembler', 'warehouse', 'dla', 'admin']
const CASE_OWNERS: readonly RoleKey[] = ['tacom_staff', 'csr', 'admin']
const CASE_WORKERS: readonly RoleKey[] = ['tacom_staff', 'csr', 'engraver', 'assembler', 'warehouse', 'admin']
const ADMIN_ONLY: readonly RoleKey[] = ['admin']

export const TABLE_ACCESS: Readonly<Record<TableKey, TableAccess>> = {
    awards_case: { read: ALL_INTERNAL, create: CASE_OWNERS, write: CASE_WORKERS, delete: ADMIN_ONLY },
    award_line: { read: ALL_INTERNAL, create: CASE_OWNERS, write: CASE_WORKERS, delete: ADMIN_ONLY },
    requester: { read: ['tacom_staff', 'csr', 'dla', 'admin'], create: CASE_OWNERS, write: CASE_OWNERS, delete: ADMIN_ONLY },
    authorization_file: { read: ['tacom_staff', 'csr', 'dla', 'admin'], create: CASE_OWNERS, write: CASE_OWNERS, delete: ADMIN_ONLY },
    engraving_job: {
        read: ['tacom_staff', 'csr', 'engraver', 'assembler', 'admin'],
        create: ['tacom_staff', 'engraver', 'admin'],
        write: ['tacom_staff', 'engraver', 'assembler', 'admin'],
        delete: ADMIN_ONLY,
    },
    shipment: {
        read: ['tacom_staff', 'csr', 'warehouse', 'dla', 'admin'],
        create: ['tacom_staff', 'warehouse', 'admin'],
        write: ['tacom_staff', 'warehouse', 'admin'],
        delete: ADMIN_ONLY,
    },
    heraldry_request: {
        read: ['tacom_staff', 'csr', 'dla', 'vendor', 'admin'],
        create: ['tacom_staff', 'csr', 'dla', 'admin'],
        write: ['tacom_staff', 'csr', 'dla', 'vendor', 'admin'],
        delete: ADMIN_ONLY,
    },
    request_line: {
        read: ['tacom_staff', 'csr', 'dla', 'vendor', 'admin'],
        create: ['tacom_staff', 'csr', 'dla', 'admin'],
        write: ['tacom_staff', 'csr', 'dla', 'vendor', 'admin'],
        delete: ADMIN_ONLY,
    },
    heraldic_item: {
        read: [...ALL_INTERNAL, 'vendor'],
        create: ['tacom_staff', 'dla', 'admin'],
        write: ['tacom_staff', 'dla', 'admin'],
        delete: ADMIN_ONLY,
    },
    ses_flag_request: { read: CASE_OWNERS, create: CASE_OWNERS, write: CASE_OWNERS, delete: ADMIN_ONLY },
    vendor: {
        read: ['tacom_staff', 'csr', 'dla', 'vendor', 'admin'],
        create: ['tacom_staff', 'dla', 'admin'],
        write: ['tacom_staff', 'dla', 'admin'],
        delete: ADMIN_ONLY,
    },
    case_note: { read: [...ALL_INTERNAL, 'vendor'], create: [...ALL_INTERNAL, 'vendor'], write: ADMIN_ONLY, delete: ADMIN_ONLY },
    status_map: { read: ['tacom_staff', 'admin'], create: ADMIN_ONLY, write: ADMIN_ONLY, delete: ADMIN_ONLY },
    migration_exception: { read: ['tacom_staff', 'admin'], create: ADMIN_ONLY, write: ['tacom_staff', 'admin'], delete: ADMIN_ONLY },
}

export interface FieldAccess {
    table: TableKey
    field: string
    operation: Operation
    roles: readonly RoleKey[]
    /** Human explanation carried into the ACL description and the equivalence matrix. */
    reason: string
}

/** Field-level restrictions tightening the table-level grants above. */
export const FIELD_ACCESS: readonly FieldAccess[] = [
    { table: 'requester', field: 'dob', operation: 'read', roles: ['tacom_staff', 'csr', 'admin'], reason: 'PII: date of birth visible to case owners only' },
    { table: 'requester', field: 'service_number_last4', operation: 'read', roles: ['tacom_staff', 'csr', 'admin'], reason: 'PII: partial service number visible to case owners only' },
    { table: 'requester', field: 'merged_into', operation: 'write', roles: ['tacom_staff', 'admin'], reason: 'Merging requesters is a supervised data-quality action' },
    { table: 'awards_case', field: 'legacy_unid', operation: 'write', roles: ['admin'], reason: 'Legacy identity is immutable after migration' },
    { table: 'awards_case', field: 'legacy_status_raw', operation: 'write', roles: ['admin'], reason: 'Legacy identity is immutable after migration' },
    { table: 'heraldry_request', field: 'legacy_unid', operation: 'write', roles: ['admin'], reason: 'Legacy identity is immutable after migration' },
    { table: 'heraldry_request', field: 'released_to_vendor', operation: 'write', roles: ['tacom_staff', 'dla', 'admin'], reason: 'Vendor release is a DLA / TACOM decision' },
    { table: 'heraldry_request', field: 'vendor', operation: 'write', roles: ['tacom_staff', 'dla', 'admin'], reason: 'Vendor assignment is a DLA / TACOM decision' },
    { table: 'heraldry_request', field: 'fund_code', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Vendors may not alter funding data' },
    { table: 'heraldry_request', field: 'project_code', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Vendors may not alter funding data' },
    { table: 'heraldry_request', field: 'document_number', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Vendors may not alter the DD 1348-6 header' },
    { table: 'heraldry_request', field: 'justification', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Vendors may not alter the DD 1348-6 header' },
    { table: 'heraldry_request', field: 'work_notes', operation: 'read', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Internal work notes are not vendor-visible' },
    { table: 'heraldry_request', field: 'work_notes', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Internal work notes are not vendor-visible' },
    { table: 'request_line', field: 'unit_price', operation: 'write', roles: ['tacom_staff', 'dla', 'admin'], reason: 'Vendors may not reprice lines' },
    { table: 'request_line', field: 'quantity', operation: 'write', roles: ['tacom_staff', 'csr', 'dla', 'admin'], reason: 'Vendors may not change ordered quantity' },
    { table: 'vendor', field: 'portal_user', operation: 'write', roles: ['admin'], reason: 'Vendor login mapping is an administrative security setting' },
    { table: 'vendor', field: 'user_group', operation: 'write', roles: ['admin'], reason: 'Vendor group mapping is an administrative security setting' },
]

/** Fields an external vendor may edit on a released heraldry request (everything else is denied by field ACL + business rule). */
export const VENDOR_EDITABLE_REQUEST_FIELDS: readonly string[] = ['state', 'vendor_acknowledged', 'vendor_ship_date', 'vendor_tracking_number', 'vendor_notes']

export function roleNames(keys: readonly RoleKey[]): string[] {
    return keys.map((k) => ROLES[k])
}

export function tableName(key: TableKey): string {
    return TABLES[key]
}

/** Every (table, operation) pair with its role list — convenient for docs and tests. */
export function tableAccessRows(): { table: TableKey; operation: Operation; roles: readonly RoleKey[] }[] {
    const rows: { table: TableKey; operation: Operation; roles: readonly RoleKey[] }[] = []
    for (const table of Object.keys(TABLE_ACCESS) as TableKey[]) {
        const access = TABLE_ACCESS[table]
        for (const operation of ['create', 'read', 'write', 'delete'] as const) {
            rows.push({ table, operation, roles: access[operation] })
        }
    }
    return rows
}

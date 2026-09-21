import { describe, expect, it } from 'vitest'
import {
    validateCageCode,
    validateDd1348Header,
    validateDocumentNumber,
    validateDodaac,
    validateEmail,
    validateEngravingText,
    validateFundCode,
    validateLegacyUnid,
    validateNsn,
    validatePhone,
    validateProjectCode,
    validateQuantity,
    validateRequisitionPriority,
    validateSafeText,
    validateUic,
} from '../src/server/lib/validators'
import { LIMITS } from '../src/server/lib/domain'

describe('DD Form 1348-6 header validators', () => {
    it('accepts a well-formed Army DODAAC and rejects bad ones', () => {
        expect(validateDodaac('W56HZV').valid).toBe(true)
        expect(validateDodaac('w56hzv').valid).toBe(true)
        expect(validateDodaac('W56HZ').valid).toBe(false)
        expect(validateDodaac('W56HZV1').valid).toBe(false)
        expect(validateDodaac('X56HZV').issues[0]?.code).toBe('service_code')
        expect(validateDodaac('W56-ZV').issues[0]?.code).toBe('format')
        expect(validateDodaac(123456).issues[0]?.code).toBe('type')
    })

    it('requires UIC to be W + 5 alphanumerics', () => {
        expect(validateUic('W0ABC1').valid).toBe(true)
        expect(validateUic('WA1B2C').valid).toBe(true)
        expect(validateUic('N0ABC1').valid).toBe(false)
        expect(validateUic('W0ABC').valid).toBe(false)
        expect(validateUic('W0AB-1').valid).toBe(false)
    })

    it('bounds requisition priority to 01–15', () => {
        expect(validateRequisitionPriority('01').valid).toBe(true)
        expect(validateRequisitionPriority('15').valid).toBe(true)
        expect(validateRequisitionPriority(3).valid).toBe(true)
        expect(validateRequisitionPriority('00').issues[0]?.code).toBe('range')
        expect(validateRequisitionPriority('16').issues[0]?.code).toBe('range')
        expect(validateRequisitionPriority('1').issues[0]?.code).toBe('format')
        expect(validateRequisitionPriority('AB').issues[0]?.code).toBe('format')
    })

    it('validates project and fund codes when present', () => {
        expect(validateProjectCode('').valid).toBe(true)
        expect(validateProjectCode('3AH').valid).toBe(true)
        expect(validateProjectCode('3AHX').valid).toBe(false)
        expect(validateFundCode('').valid).toBe(true)
        expect(validateFundCode('2A').valid).toBe(true)
        expect(validateFundCode('2AA').valid).toBe(false)
    })

    it('validates the 14-character document number structure', () => {
        expect(validateDocumentNumber('W56HZV41230001').valid).toBe(true)
        expect(validateDocumentNumber('W56HZV41230001', 'W56HZV').valid).toBe(true)
        expect(validateDocumentNumber('W56HZV41230001', 'W56HZX').issues[0]?.code).toBe('mismatch')
        expect(validateDocumentNumber('W56HZV4123000').issues[0]?.code).toBe('format')
        expect(validateDocumentNumber('W56HZV43670001').issues[0]?.code).toBe('julian')
        expect(validateDocumentNumber('W56HZV40000001').issues[0]?.code).toBe('julian')
        expect(validateDocumentNumber('X56HZV41230001').issues[0]?.code).toBe('dodaac')
        expect(validateDocumentNumber('W56HZV4123-001').issues[0]?.code).toBe('format')
    })

    it('aggregates header issues per field', () => {
        const r = validateDd1348Header({
            document_number: 'W56HZV41230001',
            dodaac: 'W56HZV',
            uic: 'W0ABC1',
            requisition_priority: '06',
            project_code: '3AH',
            fund_code: '2A',
            requester_poc: 'SFC Jordan Alvarez',
            ship_to: 'TACOM ILSC, 6501 E 11 Mile Rd, Warren MI 48397',
            justification: 'Replacement guidon for change of command ceremony.',
        })
        expect(r.valid).toBe(true)
        const bad = validateDd1348Header({ document_number: 'bad', dodaac: 'nope', uic: 'x', requisition_priority: '99', requester_poc: '' })
        expect(bad.valid).toBe(false)
        const fields = new Set(bad.issues.map((i) => i.field))
        expect(fields).toEqual(new Set(['document_number', 'dodaac', 'uic', 'requisition_priority', 'requester_poc']))
    })
})

describe('general whitelist validators', () => {
    it('rejects dangerous characters in free text', () => {
        expect(validateSafeText('name', "O'Brien-Smith, Jr.").valid).toBe(true)
        expect(validateSafeText('name', '<script>alert(1)</script>').issues[0]?.code).toBe('charset')
        expect(validateSafeText('name', 'a; DROP TABLE').issues[0]?.code).toBe('charset')
        expect(validateSafeText('name', 'x'.repeat(LIMITS.name + 1)).issues[0]?.code).toBe('length')
        expect(validateSafeText('name', '', LIMITS.name, true).issues[0]?.code).toBe('required')
    })

    it('validates UNIDs, e-mail, phone', () => {
        expect(validateLegacyUnid('0123456789ABCDEF0123456789ABCDEF').valid).toBe(true)
        expect(validateLegacyUnid('0123456789abcdef0123456789abcdef').valid).toBe(true)
        expect(validateLegacyUnid('0123').valid).toBe(false)
        expect(validateEmail('jordan.alvarez@example.mil').valid).toBe(true)
        expect(validateEmail('').valid).toBe(true)
        expect(validateEmail('not an email').valid).toBe(false)
        expect(validateEmail('a@b').valid).toBe(false)
        expect(validatePhone('(586) 282-1234').valid).toBe(true)
        expect(validatePhone('+1 586 282 1234').valid).toBe(true)
        expect(validatePhone('call me').valid).toBe(false)
    })

    it('limits engraving text to 60 engravable characters', () => {
        expect(validateEngravingText('SFC JORDAN ALVAREZ - FOR VALOR').valid).toBe(true)
        expect(validateEngravingText('x'.repeat(60)).valid).toBe(true)
        expect(validateEngravingText('x'.repeat(61)).issues[0]?.code).toBe('length')
        expect(validateEngravingText('SFC ALVAREZ <3').issues[0]?.code).toBe('charset')
    })

    it('bounds quantities', () => {
        expect(validateQuantity(1).valid).toBe(true)
        expect(validateQuantity('12').valid).toBe(true)
        expect(validateQuantity(0).issues[0]?.code).toBe('range')
        expect(validateQuantity(1.5).issues[0]?.code).toBe('type')
        expect(validateQuantity(LIMITS.maxQuantity + 1).issues[0]?.code).toBe('range')
        expect(validateQuantity(5000, 'quantity', LIMITS.maxLineQuantity).valid).toBe(true)
    })

    it('accepts NSNs with or without dashes and EXC- exception codes', () => {
        expect(validateNsn('8345-01-123-4567').valid).toBe(true)
        expect(validateNsn('8345011234567').valid).toBe(true)
        expect(validateNsn('EXC-GUIDON01').valid).toBe(true)
        expect(validateNsn('8345-01-123').valid).toBe(false)
        expect(validateNsn('').issues[0]?.code).toBe('required')
    })

    it('validates CAGE codes (no I or O)', () => {
        expect(validateCageCode('1A2B3').valid).toBe(true)
        expect(validateCageCode('1A2BO').valid).toBe(false)
        expect(validateCageCode('1A2B').valid).toBe(false)
    })
})

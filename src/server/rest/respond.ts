/**
 * Response plumbing shared by every Scripted REST handler in the application.
 *
 * The platform `setBody` route hands the object to the platform serializer, which renders every
 * JavaScript number as a Java double (`"accepted": 1.0`) and wraps the payload in `{ "result": ... }`.
 * Writing `JSON.stringify(obj)` through the stream writer keeps integers as integers and gives
 * callers exactly the documented payload shape.
 */
export interface RestResponse {
    setStatus: (code: number) => void
    setHeader: (name: string, value: string) => void
    setContentType: (type: string) => void
    getStreamWriter: () => { writeString: (value: string) => void }
}

export const GENERIC_ERROR = 'The request could not be processed.'

export function securityHeaders(response: RestResponse): void {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', "default-src 'none'")
}

export function writeJson(response: RestResponse, status: number, body: unknown): void {
    response.setStatus(status)
    response.setContentType('application/json')
    response.getStreamWriter().writeString(JSON.stringify(body))
}

export function writeError(response: RestResponse, status: number, reference: string): void {
    writeJson(response, status, { error: GENERIC_ERROR, reference })
}

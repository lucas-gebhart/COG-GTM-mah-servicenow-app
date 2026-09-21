/**
 * Thin authenticated HTTPS client for the migration tools. Credentials come from the
 * environment only (SERVICENOW_PDI_USERNAME / SERVICENOW_PDI_PASSWORD, see .env.example) and
 * are never written to disk or echoed; every response body is size-limited and parsed as JSON.
 */
import { readFileSync } from 'node:fs'

export interface InstanceConfig {
    baseUrl: string
    username: string
    password: string
}

const MAX_BODY = 20 * 1024 * 1024
const RETRY_STATUSES = new Set([429, 502, 503, 504])

/** Load KEY=VALUE lines from a local .env without overriding variables already exported. */
export function loadDotEnv(path = '.env'): void {
    let text = ''
    try {
        text = readFileSync(path, 'utf8')
    } catch {
        return
    }
    for (const line of text.split(/\r?\n/)) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
        if (!m || m[1] === undefined || m[2] === undefined) continue
        if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
}

export function instanceFromEnv(): InstanceConfig {
    loadDotEnv()
    const baseUrl = (process.env['SN_INSTANCE_URL'] ?? '').replace(/\/+$/, '')
    const username = process.env['SERVICENOW_PDI_USERNAME'] ?? ''
    const password = process.env['SERVICENOW_PDI_PASSWORD'] ?? ''
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(baseUrl)) throw new Error('SN_INSTANCE_URL must be an https URL with no path')
    if (!username || !password) throw new Error('SERVICENOW_PDI_USERNAME / SERVICENOW_PDI_PASSWORD are not set')
    return { baseUrl, username, password }
}

export class InstanceError extends Error {
    constructor(
        readonly status: number,
        readonly url: string,
        readonly body: string
    ) {
        super(`${status} from ${url}: ${body.slice(0, 300)}`)
    }
}

export interface RequestOptions {
    method: 'GET' | 'POST'
    path: string
    body?: unknown
    retries?: number
}

async function sleep(ms: number): Promise<void> {
    await new Promise((r) => setTimeout(r, ms))
}

/**
 * The application's routes stream `JSON.stringify(x)` directly, but responses built with
 * `response.setBody(x)` (Table / Import Set APIs) arrive wrapped as `{ "result": x }`. Accept both.
 */
export function unwrapResult<T>(body: unknown): T {
    if (body !== null && typeof body === 'object' && 'result' in body && Object.keys(body).length === 1) {
        return (body as { result: T }).result
    }
    return body as T
}

/** GET/POST a scripted REST route and return the unwrapped payload. */
export async function callScriptedApi<T>(cfg: InstanceConfig, opts: RequestOptions): Promise<T> {
    return unwrapResult<T>(await callInstance<unknown>(cfg, opts))
}

export async function callInstance<T>(cfg: InstanceConfig, opts: RequestOptions): Promise<T> {
    const url = `${cfg.baseUrl}${opts.path}`
    const auth = Buffer.from(`${cfg.username}:${cfg.password}`, 'utf8').toString('base64')
    const retries = opts.retries ?? 4
    for (let attempt = 0; ; attempt++) {
        const init: RequestInit = {
            method: opts.method,
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }
        if (opts.body !== undefined) init.body = JSON.stringify(opts.body)
        const res = await fetch(url, init)
        const text = await res.text()
        if (text.length > MAX_BODY) throw new InstanceError(res.status, url, 'response too large')
        if (res.ok) {
            return (text ? JSON.parse(text) : {}) as T
        }
        if (RETRY_STATUSES.has(res.status) && attempt < retries) {
            await sleep(500 * 2 ** attempt)
            continue
        }
        throw new InstanceError(res.status, url, text)
    }
}

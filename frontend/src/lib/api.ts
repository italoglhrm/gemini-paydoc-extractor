import {
  DOCUMENT_TYPES,
  FIELD_NAMES,
  type ExtractResponse,
  type FieldName,
} from '@/types'

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

/**
 * Why a request failed (design FD5). The UI maps each kind to a localized message, so this
 * module never produces user-facing text.
 */
export type ApiErrorKind =
  | 'bad_request' // 400: no file, or an empty one (R4)
  | 'too_large' // 413 (R3)
  | 'unsupported_type' // 415 (R2)
  | 'service' // 502 and other 5xx: the extraction service failed (R11)
  | 'network' // the API could not be reached at all
  | 'unexpected' // any other status, or a body that is not what the API promises
  | 'aborted' // the user cancelled; not an error to show

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  /** The API's own `detail` message, in English. Shown as secondary text only. */
  readonly detail?: string

  constructor(kind: ApiErrorKind, options: { status?: number; detail?: string } = {}) {
    super(kind)
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
    this.detail = options.detail
  }
}

const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError'

function kindForStatus(status: number): ApiErrorKind {
  if (status === 400) return 'bad_request'
  if (status === 413) return 'too_large'
  if (status === 415) return 'unsupported_type'
  if (status >= 500) return 'service'
  return 'unexpected'
}

async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'detail' in body) {
      const { detail } = body as { detail: unknown }
      return typeof detail === 'string' ? detail : undefined
    }
  } catch {
    // The error body was not JSON; the status alone is enough.
  }
  return undefined
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/** Minimal runtime check of the response shape, so a surprise becomes an ApiError and not a crash. */
export function isExtractResponse(v: unknown): v is ExtractResponse {
  if (!isRecord(v) || !isRecord(v.data) || !isRecord(v.confidence)) return false
  const { data, confidence } = v
  const textOrNull = (x: unknown) => x === null || typeof x === 'string'
  return (
    typeof v.document_type === 'string' &&
    (DOCUMENT_TYPES as readonly string[]).includes(v.document_type) &&
    typeof v.overall_confidence === 'number' &&
    Array.isArray(v.low_confidence_fields) &&
    v.low_confidence_fields.every((f) => (FIELD_NAMES as readonly string[]).includes(f as FieldName)) &&
    FIELD_NAMES.every((f) => typeof confidence[f] === 'number') &&
    textOrNull(data.vendor_name) &&
    textOrNull(data.document_number) &&
    textOrNull(data.issue_date) &&
    textOrNull(data.due_date) &&
    (data.total_amount === null || typeof data.total_amount === 'number') &&
    textOrNull(data.currency)
  )
}

/** POST the file to /extract (R1). Throws ApiError; `aborted` means the caller cancelled. */
export async function extractDocument(file: File, signal?: AbortSignal): Promise<ExtractResponse> {
  const body = new FormData()
  body.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_URL}/extract`, { method: 'POST', body, signal })
  } catch (err) {
    throw new ApiError(isAbort(err) ? 'aborted' : 'network')
  }

  if (!response.ok) {
    throw new ApiError(kindForStatus(response.status), {
      status: response.status,
      detail: await readDetail(response),
    })
  }

  let json: unknown
  try {
    json = await response.json()
  } catch (err) {
    throw new ApiError(isAbort(err) ? 'aborted' : 'unexpected', { status: response.status })
  }
  if (!isExtractResponse(json)) {
    throw new ApiError('unexpected', {
      status: response.status,
      detail: 'The response did not have the expected shape.',
    })
  }
  return json
}

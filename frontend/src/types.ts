// Mirrors the backend schemas in app/schemas.py. Keep the two in step.

export const DOCUMENT_TYPES = ['invoice', 'boleto', 'receipt', 'waybill', 'unknown'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const FIELD_NAMES = [
  'vendor_name',
  'document_number',
  'issue_date',
  'due_date',
  'total_amount',
  'currency',
] as const
export type FieldName = (typeof FIELD_NAMES)[number]

/** Extracted values. `null` means the API could not determine the field. */
export interface DocumentData {
  vendor_name: string | null
  document_number: string | null
  issue_date: string | null // YYYY-MM-DD when the model followed the prompt; kept as a string on purpose
  due_date: string | null
  total_amount: number | null
  currency: string | null // ISO 4217 when present
}

/** One 0.0-1.0 score per field. */
type FieldConfidence = Record<FieldName, number>

export interface ExtractResponse {
  document_type: DocumentType
  data: DocumentData
  confidence: FieldConfidence
  overall_confidence: number
  /** The only source of truth for "needs review": the server owns the threshold. */
  low_confidence_fields: FieldName[]
}

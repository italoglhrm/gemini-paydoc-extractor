import type { TranslationKey } from '@/lib/i18n'
import type { DocumentType, FieldName } from '@/types'

// Typed as Records over the API's own unions, so adding a field or a document type to the backend
// types breaks the build here until it has a label.

export const FIELD_LABEL: Record<FieldName, TranslationKey> = {
  vendor_name: 'fieldVendorName',
  document_number: 'fieldDocumentNumber',
  issue_date: 'fieldIssueDate',
  due_date: 'fieldDueDate',
  total_amount: 'fieldTotalAmount',
  currency: 'fieldCurrency',
}

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, TranslationKey> = {
  invoice: 'docTypeInvoice',
  boleto: 'docTypeBoleto',
  receipt: 'docTypeReceipt',
  waybill: 'docTypeWaybill',
  unknown: 'docTypeUnknown',
}

import type { TranslationKey } from '@/lib/i18n'

// The sample documents live in the repository's samples/ folder (one level above frontend/) and are
// served from there in dev (vite.config.ts allows the parent folder) and bundled by the build.
// There are no copies.
const urls = import.meta.glob<string>('../../../samples/sample_*.{pdf,png,jpg}', {
  query: '?url',
  import: 'default',
  eager: true,
})

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
}

/** Display order and the dictionary key of each sample's name. */
const CATALOG: readonly { fileName: string; label: TranslationKey }[] = [
  { fileName: 'sample_invoice.pdf', label: 'sampleInvoice' },
  { fileName: 'sample_boleto.pdf', label: 'sampleBoleto' },
  { fileName: 'sample_receipt.jpg', label: 'sampleReceipt' },
  { fileName: 'sample_waybill.png', label: 'sampleWaybill' },
  { fileName: 'sample_blurry.jpg', label: 'sampleBlurry' },
  { fileName: 'sample_ambiguous.pdf', label: 'sampleAmbiguous' },
  { fileName: 'sample_not_a_payment_doc.pdf', label: 'sampleNotPayment' },
]

export interface Sample {
  fileName: string
  label: TranslationKey
  url: string
  mimeType: string
  /** Short file format shown next to the name: PDF, PNG or JPG. */
  format: string
}

/** The catalog entries whose file exists in samples/. Empty if the folder is missing. */
export const SAMPLES: Sample[] = CATALOG.flatMap(({ fileName, label }) => {
  const url = urls[`../../../samples/${fileName}`]
  if (!url) return []
  const extension = fileName.split('.').pop() ?? ''
  return [{ fileName, label, url, mimeType: MIME_BY_EXTENSION[extension], format: extension.toUpperCase() }]
})

// Typed translations (design FD8). English is the source of truth: `Dict` is derived from it, so a
// key that is missing or extra in Portuguese fails `tsc`. Each task adds the keys it needs.
// The product name ("PayDoc Extractor") is not translated and lives outside the dictionary.

export type Lang = 'en' | 'pt'

export const APP_NAME = 'PayDoc Extractor'

/** `html` is the value for <html lang>, `intl` the locale for Intl formatting, `label` the toggle text. */
export const LOCALES: Record<Lang, { html: string; intl: string; label: string }> = {
  en: { html: 'en', intl: 'en-US', label: 'EN' },
  pt: { html: 'pt-BR', intl: 'pt-BR', label: 'PT' },
}

const en = {
  // intro
  introTitle: 'Extract data from payment documents',
  introSubtitle:
    'Upload an invoice, boleto, receipt or waybill and get structured data with a confidence score for each field.',
  // layout
  skipToContent: 'Skip to content',
  documentTitle: 'Document',
  documentDescription: 'Choose a file to extract data from.',
  resultTitle: 'Result',
  resultEmpty: 'The extracted data will appear here.',
  // upload and preview
  dropTitle: 'Drop a file here, or browse',
  dropHint: 'PDF, JPEG or PNG, up to {max} MB',
  removeFile: 'Remove file',
  openInNewTab: 'Open in a new tab',
  pdfPreviewUnavailable: 'This browser cannot show the PDF here.',
  errorUnsupportedFile: 'Only PDF, JPEG and PNG files are supported.',
  errorEmptyFile: 'This file is empty.',
  errorFileTooLarge: 'The file is larger than {max} MB.',
  // samples
  trySample: 'Try a sample',
  sampleMenuLabel: 'Sample documents',
  sampleInvoice: 'Invoice',
  sampleBoleto: 'Boleto',
  sampleReceipt: 'Receipt (photo)',
  sampleWaybill: 'Waybill',
  sampleBlurry: 'Blurry invoice',
  sampleAmbiguous: 'Invoice with ambiguous dates',
  sampleNotPayment: 'Not a payment document',
  errorSampleLoad: 'Could not load the sample.',
  // privacy
  privacyNote:
    "The file is sent to Google Gemini for extraction. On the free tier Google may use submitted content, so don't upload sensitive documents.",
  // language toggle (describes what clicking does)
  switchLanguage: 'Switch to Portuguese',
} as const

export type Dict = { [K in keyof typeof en]: string }
export type TranslationKey = keyof Dict

const pt: Dict = {
  introTitle: 'Extraia dados de documentos de pagamento',
  introSubtitle:
    'Envie uma fatura, boleto, recibo ou conhecimento de transporte e receba os dados estruturados com um índice de confiança para cada campo.',
  skipToContent: 'Ir para o conteúdo',
  documentTitle: 'Documento',
  documentDescription: 'Escolha um arquivo para extrair os dados.',
  resultTitle: 'Resultado',
  resultEmpty: 'Os dados extraídos aparecerão aqui.',
  dropTitle: 'Solte um arquivo aqui ou procure',
  dropHint: 'PDF, JPEG ou PNG, até {max} MB',
  removeFile: 'Remover arquivo',
  openInNewTab: 'Abrir em uma nova aba',
  pdfPreviewUnavailable: 'Este navegador não consegue mostrar o PDF aqui.',
  errorUnsupportedFile: 'Apenas arquivos PDF, JPEG e PNG são aceitos.',
  errorEmptyFile: 'Este arquivo está vazio.',
  errorFileTooLarge: 'O arquivo é maior que {max} MB.',
  trySample: 'Experimentar um exemplo',
  sampleMenuLabel: 'Documentos de exemplo',
  sampleInvoice: 'Fatura',
  sampleBoleto: 'Boleto',
  sampleReceipt: 'Recibo (foto)',
  sampleWaybill: 'Conhecimento de transporte',
  sampleBlurry: 'Fatura desfocada',
  sampleAmbiguous: 'Fatura com datas ambíguas',
  sampleNotPayment: 'Não é um documento de pagamento',
  errorSampleLoad: 'Não foi possível carregar o exemplo.',
  privacyNote:
    'O arquivo é enviado ao Google Gemini para a extração. No plano gratuito, o Google pode usar o conteúdo enviado; por isso, não envie documentos sensíveis.',
  switchLanguage: 'Mudar para inglês',
}

export const translations: Record<Lang, Dict> = { en, pt }

export type TranslateParams = Record<string, string | number>

/** Looks up a key and fills `{name}` placeholders. */
export function translate(lang: Lang, key: TranslationKey, params?: TranslateParams): string {
  const text = translations[lang][key]
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

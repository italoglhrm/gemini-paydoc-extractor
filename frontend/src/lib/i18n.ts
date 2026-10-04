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

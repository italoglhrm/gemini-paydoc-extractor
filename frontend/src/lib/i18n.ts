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
  // result
  docTypeInvoice: 'Invoice',
  docTypeBoleto: 'Boleto',
  docTypeReceipt: 'Receipt',
  docTypeWaybill: 'Waybill',
  docTypeUnknown: 'Unknown',
  overallConfidence: 'Overall confidence',
  reviewOne: '1 field needs review',
  reviewMany: '{n} fields need review',
  reviewHint: 'Check {fields} before relying on the result.',
  levelHigh: 'High',
  levelMedium: 'Medium',
  levelLow: 'Low',
  legendTitle: 'Confidence levels',
  legendHigh: '{from}% or more',
  legendMedium: '{from}% to {to}%',
  legendLow: 'Below {from}%',
  colField: 'Field',
  colValue: 'Value',
  colConfidence: 'Confidence',
  notFound: 'Not found',
  review: 'Review',
  currencyUnknown: 'currency unknown',
  fieldVendorName: 'Vendor / payee',
  fieldDocumentNumber: 'Document number',
  fieldIssueDate: 'Issue date',
  fieldDueDate: 'Due date',
  fieldTotalAmount: 'Total amount',
  fieldCurrency: 'Currency',
  // extraction flow
  extract: 'Extract',
  extracting: 'Extracting…',
  cancel: 'Cancel',
  retry: 'Try again',
  newDocument: 'New document',
  resultReady: 'Click Extract to read this document.',
  // errors (design FD5)
  errorTitle: 'Extraction failed',
  errBadRequest: 'No file was received, or the file is empty.',
  errTooLarge: 'The file exceeds the size limit the server accepts.',
  errUnsupported: 'The server only accepts PDF, JPEG and PNG files.',
  errService: 'The extraction service failed. Try again in a moment.',
  errNetwork: 'Could not reach the API at {url}. Check that it is running.',
  errUnexpected: 'Something unexpected happened.',
  serverMessage: 'Server message',
  // announcements for assistive technology (design FD6)
  statusReady: 'File ready: {name}',
  statusExtracting: 'Extracting…',
  statusDone: 'Extraction complete.',
  statusDoneReviewOne: 'Extraction complete. 1 field needs review.',
  statusDoneReviewMany: 'Extraction complete. {n} fields need review.',
  statusFailed: 'Extraction failed.',
  statusCancelled: 'Extraction cancelled.',
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

type Dict = { [K in keyof typeof en]: string }
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
  docTypeInvoice: 'Fatura',
  docTypeBoleto: 'Boleto',
  docTypeReceipt: 'Recibo',
  docTypeWaybill: 'Conhecimento de transporte',
  docTypeUnknown: 'Desconhecido',
  overallConfidence: 'Confiança geral',
  reviewOne: '1 campo precisa de revisão',
  reviewMany: '{n} campos precisam de revisão',
  reviewHint: 'Confira {fields} antes de usar o resultado.',
  levelHigh: 'Alta',
  levelMedium: 'Média',
  levelLow: 'Baixa',
  legendTitle: 'Níveis de confiança',
  legendHigh: '{from}% ou mais',
  legendMedium: '{from}% a {to}%',
  legendLow: 'Abaixo de {from}%',
  colField: 'Campo',
  colValue: 'Valor',
  colConfidence: 'Confiança',
  notFound: 'Não encontrado',
  review: 'Revisar',
  currencyUnknown: 'moeda desconhecida',
  fieldVendorName: 'Fornecedor / beneficiário',
  fieldDocumentNumber: 'Nº do documento',
  fieldIssueDate: 'Data de emissão',
  fieldDueDate: 'Vencimento',
  fieldTotalAmount: 'Valor total',
  fieldCurrency: 'Moeda',
  extract: 'Extrair',
  extracting: 'Extraindo…',
  cancel: 'Cancelar',
  retry: 'Tentar novamente',
  newDocument: 'Novo documento',
  resultReady: 'Clique em Extrair para ler este documento.',
  errorTitle: 'A extração falhou',
  errBadRequest: 'Nenhum arquivo foi recebido ou o arquivo está vazio.',
  errTooLarge: 'O arquivo excede o limite de tamanho aceito pelo servidor.',
  errUnsupported: 'O servidor aceita apenas arquivos PDF, JPEG e PNG.',
  errService: 'O serviço de extração falhou. Tente novamente em instantes.',
  errNetwork: 'Não foi possível acessar a API em {url}. Verifique se ela está em execução.',
  errUnexpected: 'Ocorreu algo inesperado.',
  serverMessage: 'Mensagem do servidor',
  statusReady: 'Arquivo pronto: {name}',
  statusExtracting: 'Extraindo…',
  statusDone: 'Extração concluída.',
  statusDoneReviewOne: 'Extração concluída. 1 campo precisa de revisão.',
  statusDoneReviewMany: 'Extração concluída. {n} campos precisam de revisão.',
  statusFailed: 'A extração falhou.',
  statusCancelled: 'Extração cancelada.',
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

const translations: Record<Lang, Dict> = { en, pt }

export type TranslateParams = Record<string, string | number>

/** Looks up a key and fills `{name}` placeholders. */
export function translate(lang: Lang, key: TranslationKey, params?: TranslateParams): string {
  const text = translations[lang][key]
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

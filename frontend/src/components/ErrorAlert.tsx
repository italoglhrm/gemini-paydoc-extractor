import { XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useLanguage } from '@/contexts/LanguageContext'
import { API_URL, type ApiError, type ApiErrorKind } from '@/lib/api'
import type { TranslationKey } from '@/lib/i18n'

// One localized message per failure kind (design FD5). `aborted` is a user cancel and is never shown.
const MESSAGE: Record<Exclude<ApiErrorKind, 'aborted'>, TranslationKey> = {
  bad_request: 'errBadRequest',
  too_large: 'errTooLarge',
  unsupported_type: 'errUnsupported',
  service: 'errService',
  network: 'errNetwork',
  unexpected: 'errUnexpected',
}

export function ErrorAlert({ error }: { error: ApiError }) {
  const { t } = useLanguage()
  const key = error.kind === 'aborted' ? 'errUnexpected' : MESSAGE[error.kind]
  // The API's own message is in English. It helps when the service or the response is the problem,
  // and adds nothing for errors the localized text already explains.
  const showDetail = error.detail && (error.kind === 'service' || error.kind === 'unexpected')

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{t('errorTitle')}</AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{t(key, { url: API_URL })}</p>
        {showDetail && (
          <p className="break-words text-xs">
            <span className="font-medium">{t('serverMessage')}: </span>
            <span className="font-mono">{error.detail}</span>
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}

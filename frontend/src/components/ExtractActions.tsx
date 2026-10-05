import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Status } from '@/hooks/useExtraction'

interface Props {
  status: Status
  onExtract: () => void
  onCancel: () => void
  onNew: () => void
}

/** The one primary action for the current state (design FD6). Extract is never triggered by choosing a file. */
export function ExtractActions({ status, onExtract, onCancel, onNew }: Props) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-wrap gap-2">
      {(status === 'idle' || status === 'ready') && (
        <Button data-action="extract" onClick={onExtract} disabled={status === 'idle'}>
          {t('extract')}
        </Button>
      )}

      {status === 'extracting' && (
        <>
          <Button disabled>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {t('extracting')}
          </Button>
          {/* Focus follows the primary action: the button that was just activated is gone, and a keyboard
              user should not be thrown back to the top of the page. */}
          <Button variant="outline" onClick={onCancel} autoFocus>
            {t('cancel')}
          </Button>
        </>
      )}

      {status === 'success' && (
        <Button variant="outline" onClick={onNew} autoFocus>
          {t('newDocument')}
        </Button>
      )}

      {status === 'error' && (
        <>
          <Button onClick={onExtract} autoFocus>
            {t('retry')}
          </Button>
          <Button variant="outline" onClick={onNew}>
            {t('newDocument')}
          </Button>
        </>
      )}
    </div>
  )
}

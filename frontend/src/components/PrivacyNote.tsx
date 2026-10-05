import { Info } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

/** Always visible, never dismissible: the file leaves the browser when the user clicks Extract (F8). */
export function PrivacyNote() {
  const { t } = useLanguage()

  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {t('privacyNote')}
    </p>
  )
}

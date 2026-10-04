import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLanguage } from '@/contexts/LanguageContext'
import { LOCALES } from '@/lib/i18n'

/** Shows the language a click switches to (PT while in English, EN while in Portuguese). */
export function LanguageToggle() {
  const { lang, toggle, t } = useLanguage()
  const target = lang === 'en' ? 'pt' : 'en'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          aria-label={t('switchLanguage')}
          className="gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <Globe aria-hidden="true" />
          <span className="text-xs">{LOCALES[target].label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('switchLanguage')}</TooltipContent>
    </Tooltip>
  )
}

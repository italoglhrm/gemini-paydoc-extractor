import { LanguageToggle } from '@/components/LanguageToggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { APP_NAME } from '@/lib/i18n'

// Placeholder shell for F-T4 (the language toggle). Replaced by the real layout in F-T5.
function Shell() {
  const { t } = useLanguage()
  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{APP_NAME}</span>
        <LanguageToggle />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{t('introTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('introSubtitle')}</p>
    </main>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <Shell />
      </TooltipProvider>
    </LanguageProvider>
  )
}

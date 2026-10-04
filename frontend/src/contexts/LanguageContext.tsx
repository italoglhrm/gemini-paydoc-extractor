import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LOCALES, translate, type Lang, type TranslateParams, type TranslationKey } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Lang
  /** Locale for Intl formatting (en-US or pt-BR). */
  locale: string
  toggle: () => void
  t: (key: TranslationKey, params?: TranslateParams) => string
}

const STORAGE_KEY = 'lang'
const LanguageContext = createContext<LanguageContextValue | null>(null)

// The only value this app keeps in the browser (F10). Storage can be unavailable or hold junk.
function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'pt' || stored === 'en' ? stored : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = LOCALES[lang].html
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Not persisted this time; the choice still applies for the session.
    }
  }, [lang])

  const toggle = useCallback(() => setLang((current) => (current === 'en' ? 'pt' : 'en')), [])
  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(lang, key, params),
    [lang],
  )
  const value = useMemo(
    () => ({ lang, locale: LOCALES[lang].intl, toggle, t }),
    [lang, toggle, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return value
}

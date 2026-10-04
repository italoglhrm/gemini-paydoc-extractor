import { useEffect, useState } from 'react'
import { DocumentPreview } from '@/components/DocumentPreview'
import { Header } from '@/components/Header'
import { UploadZone } from '@/components/UploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { validateFile, type FileProblem } from '@/lib/files'

function Shell() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [problem, setProblem] = useState<FileProblem | null>(null)

  // A file dropped outside the zone would make the browser navigate to it and lose the page.
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault()
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => {
      window.removeEventListener('dragover', stop)
      window.removeEventListener('drop', stop)
    }
  }, [])

  function handleFile(next: File) {
    const found = validateFile(next)
    setProblem(found)
    if (!found) setFile(next)
  }

  function handleRemove() {
    setFile(null)
    setProblem(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t('skipToContent')}
      </a>
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t('introTitle')}</h1>
          <p className="max-w-2xl text-balance text-sm text-muted-foreground">{t('introSubtitle')}</p>
        </div>

        {/* Two columns from lg, stacked below it, Document first (design FD3). */}
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>{t('documentTitle')}</CardTitle>
              <CardDescription>{t('documentDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {file ? (
                <DocumentPreview file={file} onRemove={handleRemove} />
              ) : (
                <UploadZone onFile={handleFile} problem={problem} />
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>{t('resultTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="py-12 text-center text-sm text-muted-foreground">{t('resultEmpty')}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Announces extracting, done and failed to assistive technology (F11). Filled in F-T9. */}
      <div role="status" aria-live="polite" className="sr-only" />
    </div>
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

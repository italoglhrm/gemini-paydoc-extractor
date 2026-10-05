import { useEffect } from 'react'
import { DocumentPreview } from '@/components/DocumentPreview'
import { ErrorAlert } from '@/components/ErrorAlert'
import { ExtractActions } from '@/components/ExtractActions'
import { Header } from '@/components/Header'
import { PrivacyNote } from '@/components/PrivacyNote'
import { ResultPanel } from '@/components/ResultPanel'
import { ResultSkeleton } from '@/components/ResultSkeleton'
import { SamplePicker } from '@/components/SamplePicker'
import { UploadZone } from '@/components/UploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { useExtraction } from '@/hooks/useExtraction'

function Shell() {
  const { t } = useLanguage()
  const flow = useExtraction()

  // Keyboard focus follows the flow: the control that had it may have just disappeared (design FD6).
  useEffect(() => {
    if (!flow.focus) return
    const selector = flow.focus.target === 'extract' ? '[data-action="extract"]' : '[data-dropzone]'
    document.querySelector<HTMLElement>(selector)?.focus()
  }, [flow.focus])

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
            <CardContent className="space-y-4">
              {flow.file ? (
                <DocumentPreview file={flow.file} onRemove={flow.removeFile} />
              ) : (
                <UploadZone onFile={flow.selectFile} problem={flow.problem} />
              )}
              <SamplePicker onSample={flow.selectFile} />
              <PrivacyNote />
              <ExtractActions
                status={flow.status}
                onExtract={() => void flow.extract()}
                onCancel={flow.cancel}
                onNew={flow.removeFile}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>{t('resultTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {flow.status === 'success' && flow.result ? (
                <ResultPanel key={flow.runId} result={flow.result} />
              ) : flow.status === 'extracting' ? (
                <ResultSkeleton />
              ) : flow.status === 'error' && flow.error ? (
                <ErrorAlert error={flow.error} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {flow.status === 'ready' ? t('resultReady') : t('resultEmpty')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Announces choosing a file, extracting, done, failed and cancelled to assistive technology (F11). */}
      <div role="status" aria-live="polite" className="sr-only">
        {flow.announce ? t(flow.announce.key, flow.announce.params) : ''}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <Shell />
        <Toaster />
      </TooltipProvider>
    </LanguageProvider>
  )
}

import { useState } from 'react'
import { AlertCircle, ChevronDown, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/LanguageContext'
import { SAMPLES, type Sample } from '@/lib/samples'

interface Props {
  /** Receives the sample as a File, to go through the same validation and preview as an upload. */
  onSample: (file: File) => void
}

/** "Try a sample" menu (design FD10). The user still has to click Extract afterwards. */
export function SamplePicker({ onSample }: Props) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  if (SAMPLES.length === 0) return null

  async function pick(sample: Sample) {
    setFailed(false)
    setLoading(true)
    try {
      const response = await fetch(sample.url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      // The type comes from the extension: a static host may serve these as octet-stream.
      onSample(new File([blob], sample.fileName, { type: sample.mimeType }))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t('trySample')}
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>{t('sampleMenuLabel')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SAMPLES.map((sample) => (
            <DropdownMenuItem key={sample.fileName} onSelect={() => void pick(sample)} className="gap-2">
              {sample.mimeType === 'application/pdf' ? (
                <FileText aria-hidden="true" />
              ) : (
                <ImageIcon aria-hidden="true" />
              )}
              <span className="flex-1">{t(sample.label)}</span>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {sample.format}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {failed && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('errorSampleLoad')}
        </p>
      )}
    </div>
  )
}

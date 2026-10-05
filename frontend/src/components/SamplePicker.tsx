import { useRef, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickedRef = useRef(false)

  if (SAMPLES.length === 0) return null

  async function pick(sample: Sample) {
    if (loading) return
    pickedRef.current = true
    // Radix calls onSelect inside flushSync, so the re-render for setLoading below happens before it
    // reports the menu closing. Closing here, explicitly, keeps the menu from reopening afterwards.
    setOpen(false)
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
      triggerRef.current?.focus() // nothing was chosen, so focus stays where the user was
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <DropdownMenu open={open} onOpenChange={(next) => setOpen(next && !loading)}>
        <DropdownMenuTrigger asChild>
          {/* aria-disabled instead of disabled while loading: a disabled button cannot hold focus, and
              the menu is closing around it, so keyboard focus would be lost to the top of the page. */}
          <Button
            ref={triggerRef}
            variant="outline"
            aria-disabled={loading || undefined}
            aria-busy={loading || undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t('trySample')}
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          // No exit animation: while the menu fades out, the item slides from under a still pointer and
          // Radix hands focus back to the menu, undoing the move to Extract. It unmounts at once instead.
          className="w-80 data-[state=closed]:!animate-none"
          onCloseAutoFocus={(event) => {
            // After a pick, the app moves focus to Extract. Without a pick (Escape, click outside),
            // the default applies and focus returns to this trigger.
            if (pickedRef.current) {
              event.preventDefault()
              pickedRef.current = false
            }
          }}
        >
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

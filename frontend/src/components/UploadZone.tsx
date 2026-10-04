import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AlertCircle, UploadCloud } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_MB, type FileProblem } from '@/lib/files'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const PROBLEM_MESSAGE: Record<FileProblem, TranslationKey> = {
  unsupported: 'errorUnsupportedFile',
  empty: 'errorEmptyFile',
  too_large: 'errorFileTooLarge',
}

interface Props {
  onFile: (file: File) => void
  /** Why the last file was rejected, if it was. */
  problem: FileProblem | null
}

/** Drop zone and picker (design FD4). A real button, so Enter and Space open the picker. */
export function UploadZone({ onFile, problem }: Props) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [dragging, setDragging] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = '' // lets the same file be chosen again after removing it
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0] // one document at a time: extra files are ignored
    if (file) onFile(file)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-dropzone
        data-dragging={dragging || undefined}
        aria-describedby={hintId}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          dragging ? 'border-primary bg-accent' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50',
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">{t('dropTitle')}</span>
        <span id={hintId} className="text-xs text-muted-foreground">
          {t('dropHint', { max: MAX_UPLOAD_MB })}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {problem && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t(PROBLEM_MESSAGE[problem], { max: MAX_UPLOAD_MB })}
        </p>
      )}
    </div>
  )
}

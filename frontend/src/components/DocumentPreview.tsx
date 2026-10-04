import { useEffect, useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { fileTypeLabel, isPdf } from '@/lib/files'
import { formatFileSize } from '@/lib/format'

interface Props {
  file: File
  onRemove: () => void
}

/** Preview of the chosen file with its name, size and a Remove button (design FD4). */
export function DocumentPreview({ file, onRemove }: Props) {
  const { t, locale } = useLanguage()
  const [url, setUrl] = useState<string | null>(null)

  // Created in an effect, not during render: StrictMode's simulated unmount would otherwise revoke
  // a URL that render still holds. Revoked on replace, remove and unmount.
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-muted">
        {url &&
          (isPdf(file) ? (
            // Open parameters for the browser's PDF viewer: no toolbar or side panel, page fitted to the
            // width. Browsers that do not know them ignore them.
            <object
              data={`${url}#toolbar=0&navpanes=0&view=FitH`}
              type="application/pdf"
              aria-label={file.name}
              className="h-80 w-full"
            >
              <div className="flex h-80 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                <FileText className="h-6 w-6" aria-hidden="true" />
                <p>{t('pdfPreviewUnavailable')}</p>
                <a href={url} target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                  {t('openInNewTab')}
                </a>
              </div>
            </object>
          ) : (
            <img src={url} alt={file.name} className="max-h-80 w-full object-contain" />
          ))}
        {!url && <div className="h-80" />}
      </div>

      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size, locale)} · {fileTypeLabel(file)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={t('removeFile')}>
          <X aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

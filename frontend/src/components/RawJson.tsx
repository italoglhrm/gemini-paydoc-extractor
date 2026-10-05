import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ExtractResponse } from '@/types'

/** The response exactly as the API returned it, pretty-printed, with a copy button (F12). */
export function RawJson({ result }: { result: ExtractResponse }) {
  const { t } = useLanguage()
  const json = JSON.stringify(result, null, 2)

  async function copy() {
    try {
      await navigator.clipboard.writeText(json)
      toast.success(t('copied'))
    } catch {
      toast.error(t('copyFailed'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void copy()}>
          <Copy aria-hidden="true" />
          {t('copyJson')}
        </Button>
      </div>
      <pre
        tabIndex={0}
        aria-label={t('rawJsonLabel')}
        className="max-h-96 overflow-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed"
      >
        {json}
      </pre>
    </div>
  )
}

import { AlertTriangle } from 'lucide-react'
import { FieldsTable } from '@/components/FieldsTable'
import { OverallConfidence } from '@/components/OverallConfidence'
import { RawJson } from '@/components/RawJson'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/contexts/LanguageContext'
import { DOCUMENT_TYPE_LABEL, FIELD_LABEL } from '@/lib/labels'
import type { ExtractResponse } from '@/types'

/** A successful extraction (design FD7). Mount it with a `key` so each result starts on the Fields tab. */
export function ResultPanel({ result }: { result: ExtractResponse }) {
  const { t } = useLanguage()
  const flagged = result.low_confidence_fields

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
          {t(DOCUMENT_TYPE_LABEL[result.document_type])}
        </Badge>
        <OverallConfidence score={result.overall_confidence} />
      </div>

      {flagged.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t(flagged.length === 1 ? 'reviewOne' : 'reviewMany', { n: flagged.length })}</AlertTitle>
          <AlertDescription>
            {t('reviewHint', { fields: flagged.map((name) => t(FIELD_LABEL[name])).join(', ') })}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="fields">
        <TabsList>
          <TabsTrigger value="fields">{t('tabFields')}</TabsTrigger>
          <TabsTrigger value="json">{t('tabJson')}</TabsTrigger>
        </TabsList>
        <TabsContent value="fields">
          <FieldsTable result={result} />
        </TabsContent>
        <TabsContent value="json">
          <RawJson result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

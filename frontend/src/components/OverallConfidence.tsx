import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatPercent } from '@/lib/format'

/** The API's overall confidence as a percentage and a slim bar (design FD7). */
export function OverallConfidence({ score }: { score: number }) {
  const { t, locale } = useLanguage()
  const percent = formatPercent(score, locale)
  const fill = Math.min(100, Math.max(0, Math.round(score * 100)))

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{t('overallConfidence')}</p>
        <p className="text-lg font-semibold leading-tight tabular-nums">{percent}</p>
      </div>
      <Progress value={fill} aria-label={`${t('overallConfidence')}: ${percent}`} className="h-1.5 w-20" />
    </div>
  )
}

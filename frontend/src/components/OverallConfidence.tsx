import { lazy, Suspense } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { confidenceLevel, LEVEL_STYLE, percentOf } from '@/lib/confidence'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

// Recharts is the heaviest dependency: the chart is fetched only when a result is first shown.
const ConfidenceGauge = lazy(() => import('@/components/ConfidenceGauge'))

/** Same size as the chart, so nothing moves when the chart arrives. */
function GaugeRing() {
  return <div aria-hidden="true" data-gauge-placeholder className="h-24 w-24 rounded-full border-[10px] border-border" />
}

/** The API's overall confidence: a radial chart with the percentage at its center and its level beside it. */
export function OverallConfidence({ score }: { score: number }) {
  const { t, locale } = useLanguage()
  const level = confidenceLevel(score)
  const style = LEVEL_STYLE[level]
  const percentText = formatPercent(score, locale)
  const levelName = t(style.label)

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{t('overallConfidence')}</p>
        <p data-gauge-level className={cn('text-sm font-semibold', style.text)}>
          {levelName}
        </p>
      </div>
      {/* One label for assistive technology; the chart and the number inside are presentational. */}
      <div
        role="img"
        aria-label={`${t('overallConfidence')}: ${percentText}, ${levelName.toLowerCase()}`}
        data-gauge
        data-level={level}
        className="relative h-24 w-24 shrink-0"
      >
        <Suspense fallback={<GaugeRing />}>
          <ConfidenceGauge percent={percentOf(score)} colorClass={style.text} />
        </Suspense>
        {/* Real text, not part of the SVG: it is on screen before the chart loads and without it. */}
        <span
          data-gauge-value
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center font-semibold tabular-nums',
            // The ring's hole is about 65 px wide: three digits need a size down to keep clear of it.
            percentOf(score) === 100 ? 'text-lg' : 'text-xl',
            style.text,
          )}
        >
          {percentText}
        </span>
      </div>
    </div>
  )
}

import { useLanguage } from '@/contexts/LanguageContext'
import { HIGH_FROM, LEVEL_STYLE, LEVELS, MEDIUM_FROM, type ConfidenceLevel } from '@/lib/confidence'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// The ranges are built from the same constants as the bands, so the legend cannot drift from the colors.
const RANGE: Record<ConfidenceLevel, { key: TranslationKey; params: Record<string, number> }> = {
  high: { key: 'legendHigh', params: { from: HIGH_FROM } },
  medium: { key: 'legendMedium', params: { from: MEDIUM_FROM, to: HIGH_FROM - 1 } },
  low: { key: 'legendLow', params: { from: MEDIUM_FROM } },
}

/** Names the three confidence colors with their ranges. Color is never the only signal. */
export function ConfidenceLegend() {
  const { t } = useLanguage()

  return (
    <ul
      aria-label={t('legendTitle')}
      data-legend
      className="flex flex-wrap gap-x-5 gap-y-1.5 border-t pt-4 text-xs text-muted-foreground"
    >
      {LEVELS.map((level) => (
        <li key={level} data-level={level} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', LEVEL_STYLE[level].dot)} />
          <span className="font-medium text-foreground">{t(LEVEL_STYLE[level].label)}</span>
          {/* A real space: in a flex row it takes no room, but assistive technology reads two words, not one. */}{' '}
          <span>{t(RANGE[level].key, RANGE[level].params)}</span>
        </li>
      ))}
    </ul>
  )
}

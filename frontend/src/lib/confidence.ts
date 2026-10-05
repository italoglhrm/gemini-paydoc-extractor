import type { TranslationKey } from '@/lib/i18n'

// Confidence levels. They are display bands for a score and nothing more: whether a field
// needs review is decided by the server and arrives in `low_confidence_fields`, so the UI never
// recomputes that. The bands follow the extraction prompt's own scale (clearly stated is 0.9 to 1.0,
// partial is 0.5 to 0.8) and the server's default review threshold of 0.7.

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** First percentage of each band. Everything below MEDIUM_FROM is low. */
export const HIGH_FROM = 90
export const MEDIUM_FROM = 70

/** 0.896 becomes 90. The level is taken from this rounded value, so the number on screen and its color agree. */
export const percentOf = (score: number): number => Math.min(100, Math.max(0, Math.round(score * 100)))

export function confidenceLevel(score: number): ConfidenceLevel {
  const percent = percentOf(score)
  if (percent >= HIGH_FROM) return 'high'
  if (percent >= MEDIUM_FROM) return 'medium'
  return 'low'
}

interface LevelStyle {
  /** Bar fill, percentage text and legend dot: the token of the level. Written out in full so Tailwind sees the names. */
  bar: string
  text: string
  dot: string
  /** The Review badge of a flagged field takes the color of its level. */
  badge: 'warning' | 'danger'
  label: TranslationKey
}

export const LEVEL_STYLE: Record<ConfidenceLevel, LevelStyle> = {
  high: { bar: 'bg-success', text: 'text-success', dot: 'bg-success', badge: 'warning', label: 'levelHigh' },
  medium: { bar: 'bg-warning', text: 'text-warning', dot: 'bg-warning', badge: 'warning', label: 'levelMedium' },
  low: { bar: 'bg-destructive', text: 'text-destructive', dot: 'bg-destructive', badge: 'danger', label: 'levelLow' },
}

/** Display order of the legend. */
export const LEVELS: readonly ConfidenceLevel[] = ['high', 'medium', 'low']

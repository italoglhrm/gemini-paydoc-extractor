import { ConfidenceLegend } from '@/components/ConfidenceLegend'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLanguage } from '@/contexts/LanguageContext'
import { confidenceLevel, LEVEL_STYLE, percentOf, type ConfidenceLevel } from '@/lib/confidence'
import { formatAmount, formatDate, formatPercent } from '@/lib/format'
import { FIELD_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { FIELD_NAMES, type DocumentData, type ExtractResponse, type FieldName } from '@/types'

interface Row {
  name: FieldName
  label: string
  /** Formatted for display, or null when the API returned null (shown as "Not found"). */
  value: string | null
  /** Small note after the value, e.g. "currency unknown". */
  hint: string | null
  score: number
  level: ConfidenceLevel
  /** From `low_confidence_fields` only: the server owns the review threshold (design FD7). */
  flagged: boolean
}

type Display = { value: string | null; hint: string | null }
const NOTHING: Display = { value: null, hint: null }

function display(name: FieldName, data: DocumentData, locale: string, unknownCurrency: string): Display {
  switch (name) {
    case 'issue_date':
    case 'due_date': {
      const value = data[name]
      return value === null ? NOTHING : { value: formatDate(value, locale), hint: null }
    }
    case 'total_amount': {
      if (data.total_amount === null) return NOTHING
      const amount = formatAmount(data.total_amount, data.currency, locale)
      return { value: amount.text, hint: amount.currencyKnown ? null : unknownCurrency }
    }
    default: {
      const value = data[name]
      return value === null ? NOTHING : { value, hint: null }
    }
  }
}

/** Bar and percentage, both in the color of the score's level (F14). */
function ConfidenceBar({ row, locale, levelName }: { row: Row; locale: string; levelName: string }) {
  const percent = formatPercent(row.score, locale)
  const style = LEVEL_STYLE[row.level]
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Progress
        value={percentOf(row.score)}
        aria-label={`${row.label}: ${percent} (${levelName})`}
        className="h-1.5 flex-1"
        indicatorClassName={style.bar}
      />
      <span className={cn('w-10 shrink-0 text-right text-xs font-medium tabular-nums', style.text)}>{percent}</span>
    </div>
  )
}

/** The six fields. A table from `sm` up; a stacked list below it, where three columns cannot fit. */
export function FieldsTable({ result }: { result: ExtractResponse }) {
  const { t, locale } = useLanguage()

  const rows: Row[] = FIELD_NAMES.map((name) => ({
    name,
    label: t(FIELD_LABEL[name]),
    ...display(name, result.data, locale, t('currencyUnknown')),
    score: result.confidence[name],
    level: confidenceLevel(result.confidence[name]),
    flagged: result.low_confidence_fields.includes(name),
  }))

  const valueOf = (row: Row) =>
    row.value === null ? (
      <span className="text-muted-foreground">{t('notFound')}</span>
    ) : (
      <>
        {row.value}
        {row.hint && (
          <>
            {' '}
            <span className="text-xs font-normal text-muted-foreground">({row.hint})</span>
          </>
        )}
      </>
    )

  const reviewBadge = (row: Row) => (
    <Badge variant={LEVEL_STYLE[row.level].badge}>{t('review')}</Badge>
  )
  // `data-level` exists only for a value that was found: a score for an absent value says nothing.
  const levelAttr = (row: Row) => (row.value === null ? undefined : row.level)

  return (
    <div className="space-y-4">
      <div className="hidden sm:block" data-layout="table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('colField')}</TableHead>
              <TableHead>{t('colValue')}</TableHead>
              <TableHead className="w-72">{t('colConfidence')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                data-field={row.name}
                data-level={levelAttr(row)}
                data-flagged={row.flagged || undefined}
              >
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className="break-words">{valueOf(row)}</TableCell>
                <TableCell>
                  {row.value === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ConfidenceBar row={row} locale={locale} levelName={t(LEVEL_STYLE[row.level].label)} />
                      {/* A fixed slot, so every row's bar has the same length whether or not it is flagged. */}
                      <span className="flex w-16 shrink-0">{row.flagged && reviewBadge(row)}</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y sm:hidden" data-layout="list">
        {rows.map((row) => (
          <li
            key={row.name}
            data-field={row.name}
            data-level={levelAttr(row)}
            data-flagged={row.flagged || undefined}
            className="space-y-1.5 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              {row.flagged && reviewBadge(row)}
            </div>
            <div className="break-words text-sm font-medium">{valueOf(row)}</div>
            {row.value !== null && (
              <ConfidenceBar row={row} locale={locale} levelName={t(LEVEL_STYLE[row.level].label)} />
            )}
          </li>
        ))}
      </ul>

      <ConfidenceLegend />
    </div>
  )
}

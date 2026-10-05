// Value formatting for the result. All functions take the Intl locale (en-US or pt-BR).

/**
 * `YYYY-MM-DD` becomes a medium date ("Mar 14, 2026" / "14 de mar. de 2026"). Anything else, including
 * impossible dates, is returned as is: the API deliberately returns dates as strings that may be
 * malformed, and showing what it said beats hiding it. Built in UTC so the day never shifts.
 */
export function formatDate(value: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  // Date.UTC rolls 2026-02-31 over to March, so check that nothing moved.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return value
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

/**
 * Formats an amount with its currency when the code is usable; otherwise as a plain number and
 * `currencyKnown: false`, so the caller can say the currency is unknown.
 */
export function formatAmount(
  amount: number,
  currency: string | null,
  locale: string,
): { text: string; currencyKnown: boolean } {
  if (currency && /^[A-Za-z]{3}$/.test(currency)) {
    try {
      const text = new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(amount)
      return { text, currencyKnown: true }
    } catch {
      // An invalid code throws a RangeError; fall through to the plain form.
    }
  }
  const text = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  return { text, currencyKnown: false }
}

/** 1536 becomes "1.5 kB" (en-US) or "1,5 kB" (pt-BR). Uses 1024-based steps, like most file dialogs. */
export function formatFileSize(bytes: number, locale: string): string {
  // Intl would print "512 byte"; "512 B" reads better.
  if (bytes < 1024) return `${new Intl.NumberFormat(locale).format(bytes)} B`
  const [value, unit] =
    bytes < 1024 * 1024 ? [bytes / 1024, 'kilobyte'] : [bytes / (1024 * 1024), 'megabyte']
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

/** 0.97 becomes "97%". */
export function formatPercent(score: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(score)
}

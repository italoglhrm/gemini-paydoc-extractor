interface Props {
  className?: string
}

/** A page with two text lines; the same glyph as the favicon. Drawn in currentColor on the brand square. */
export function LogoIcon({ className }: Props) {
  return (
    <svg viewBox="7 5 18 22" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 7h8l5 5v13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
      <rect className="fill-primary" x="12" y="16" width="8" height="1.6" rx="0.8" />
      <rect className="fill-primary" x="12" y="19.5" width="8" height="1.6" rx="0.8" />
    </svg>
  )
}

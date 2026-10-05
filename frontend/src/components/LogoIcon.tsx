interface Props {
  className?: string
}

/**
 * The brand mark: a receipt with one field lifted out of it, in currentColor on the brand square.
 * Same shapes as public/favicon.svg, so keep the two in step. No sparkles, robots or gradients.
 */
export function LogoIcon({ className }: Props) {
  return (
    <svg viewBox="3.45 1.5 21 21" fill="currentColor" className={className} aria-hidden="true">
      {/* the receipt, with a torn edge */}
      <path d="M5 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15l-1.5 2-1.5-2-1.5 2-1.5-2-1.5 2-1.5-2-1.5 2-1.5-2V4z" />
      {/* two lines of text on it */}
      <rect className="fill-primary" x="7.5" y="6.3" width="6" height="1.6" rx="0.8" />
      <rect className="fill-primary" x="7.5" y="15.6" width="7.5" height="1.6" rx="0.8" />
      {/* the field being lifted out: a cut in the background color, then the tab itself */}
      <rect className="fill-primary" x="11.6" y="8.6" width="11.8" height="5.4" rx="1.6" />
      <rect x="12.6" y="9.6" width="9.8" height="3.4" rx="0.9" />
    </svg>
  )
}

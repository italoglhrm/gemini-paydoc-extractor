interface Props {
  className?: string
}

// The page, with its two lines of text cut out (even-odd) so the background shows through them.
const PAGE =
  'M10 7h8l5 5v13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12.8 16h6.4a.8.8 0 0 1 0 1.6h-6.4a.8.8 0 0 1 0-1.6zM12.8 19.5h6.4a.8.8 0 0 1 0 1.6h-6.4a.8.8 0 0 1 0-1.6z'
// A four-point sparkle in the corner the page's clipped edge leaves free, to say there is AI behind it.
const SPARKLE = 'M23.4 3.8Q24.1 6.3 26.6 7Q24.1 7.7 23.4 10.2Q22.7 7.7 20.2 7Q22.7 6.3 23.4 3.8Z'

/**
 * The brand mark: a page with two lines of text and a small sparkle at its top-right corner, in
 * currentColor with no container square. Same paths as public/favicon.svg: keep the two in step.
 */
export function LogoIcon({ className }: Props) {
  return (
    <svg viewBox="8.5 3.3 18.5 23.2" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d={PAGE} />
      <path d={SPARKLE} />
    </svg>
  )
}

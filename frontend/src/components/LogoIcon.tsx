interface Props {
  className?: string
}

/**
 * The brand mark: a page with two lines of text, in currentColor and with no container square (a colored
 * square around a glyph is what makes a mark look generic). The lines are cut out of the page, so the
 * background shows through them. Same path as public/favicon.svg: keep the two in step.
 */
export function LogoIcon({ className }: Props) {
  return (
    <svg viewBox="8.5 6.5 15 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 7h8l5 5v13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12.8 16h6.4a.8.8 0 0 1 0 1.6h-6.4a.8.8 0 0 1 0-1.6zM12.8 19.5h6.4a.8.8 0 0 1 0 1.6h-6.4a.8.8 0 0 1 0-1.6z"
      />
    </svg>
  )
}

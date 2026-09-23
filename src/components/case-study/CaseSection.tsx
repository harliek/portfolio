import type { ReactNode } from 'react'

interface CaseSectionProps {
  id?: string
  /** Small label above the heading (e.g. "Later independent work"). */
  label?: string
  heading: string
  /** Visible H2 by default; pass 3 for sub-sections. */
  level?: 2 | 3
  children: ReactNode
  className?: string
  /** Reveal the section as one group on first scroll into view. */
  reveal?: boolean
}

/**
 * A narrative chapter. Heading and copy come first, then any media the page
 * composes as children — so the mobile reading order is always
 * heading → explanation → visual → caption.
 */
export function CaseSection({ id, label, heading, level = 2, children, className, reveal = true }: CaseSectionProps) {
  const H = level === 2 ? 'h2' : 'h3'
  return (
    <section id={id} className={['case-section', className].filter(Boolean).join(' ')} aria-labelledby={id ? `${id}-heading` : undefined} data-reveal={reveal ? '' : undefined}>
      {label && <p className="case-section__label t-label">{label}</p>}
      <H id={id ? `${id}-heading` : undefined} className={level === 2 ? 't-section case-section__heading' : 't-sub case-section__heading'}>
        {heading}
      </H>
      {children}
    </section>
  )
}

/** Readable prose column (max ~660px). */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['prose', className].filter(Boolean).join(' ')}>{children}</div>
}

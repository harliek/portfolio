import type { ReactNode } from 'react'
import { CaseTitle } from './CasePage'

/**
 * The compact case study (brief v18), modelled on the portfolio's earlier
 * pages: a short introduction (title, role and dates, a brief summary, one
 * status line) with one artifact held beside it, then two or three short
 * decisions or findings under the introduction. The artifact is the landing
 * point of the project opening (`data-hero-media`); the introduction waits
 * for it (`data-hero-reveal`). Phones: the introduction, the artifact, then
 * the text.
 */
export function CaseSplit({
  title,
  meta,
  lede,
  status,
  media,
  heroInside,
  children,
}: {
  title: string
  meta: readonly string[]
  lede: ReactNode
  status?: ReactNode
  media: ReactNode
  /** The media marks its own landing point (a walkthrough's picture), so the column does not. */
  heroInside?: boolean
  children: ReactNode
}) {
  return (
    <div className="cs cx-wrap">
      <header className="cs__intro" data-hero-reveal>
        <CaseTitle title={title} meta={meta} />
        <div className="cx-lede">{lede}</div>
        {status && <p className="cx-status">{status}</p>}
      </header>
      <div className="cs__media" {...(heroInside ? {} : { 'data-hero-media': '' })}>
        {media}
      </div>
      <div className="cs__body">{children}</div>
    </div>
  )
}

/** One decision or finding: a short heading and one or two sentences. */
export function CaseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cs__sec">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  )
}

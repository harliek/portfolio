import type { ReactNode } from 'react'
import { Figure } from '../../media/Figure'

interface BusinessModelProps {
  body: ReactNode
  caption: ReactNode
}

const SIZES = '(min-width: 960px) 560px, calc(100vw - 32px)'

/**
 * Optional supplementary material after the results: the pitch's proposed
 * pricing tiers, behind a clearly labelled disclosure (a secondary button
 * look with a chevron and "Show" / "Hide"). It sits apart from the Results
 * figure, so the tiers never read as evidence for the sign-up figure.
 */
export function BusinessModel({ body, caption }: BusinessModelProps) {
  return (
    <section className="jf-supplement" aria-labelledby="jf-supplement-title">
      <h2 id="jf-supplement-title" className="jf-supplement__label">
        Supplementary material
      </h2>
      <details className="jf-supplement__details">
        <summary className="button button--secondary jf-supplement__summary">
          <svg className="jf-supplement__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="jf-supplement__show">Show proposed business model</span>
          <span className="jf-supplement__hide">Hide proposed business model</span>
        </summary>
        <div className="jf-supplement__body">
          <div className="case-prose">{body}</div>
          <Figure image="jumpstart-business-model" sizes={SIZES} caption={caption} zoom />
        </div>
      </details>
    </section>
  )
}

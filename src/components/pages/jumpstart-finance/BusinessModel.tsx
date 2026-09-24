import type { ReactNode } from 'react'
import { Figure } from '../../media/Figure'

interface BusinessModelProps {
  label: string
  title: string
  body: ReactNode
  caption: ReactNode
}

const SIZES = '(min-width: 1100px) 600px, (min-width: 960px) 52vw, (min-width: 660px) 600px, calc(100vw - 40px)'

/**
 * Optional supporting material after the results: the pitch's proposed tiers.
 * Kept as its own row (text left, slide right) so it never reads as evidence
 * for the sign-up figure in the Results paragraph.
 */
export function BusinessModel({ label, title, body, caption }: BusinessModelProps) {
  return (
    <section className="case-shell jf-support" aria-labelledby="business-model-title">
      <div className="jf-support__text reading-scrim">
        <p className="jf-support__label">{label}</p>
        <h3 id="business-model-title" className="jf-support__title">
          {title}
        </h3>
        <div className="case-prose">{body}</div>
      </div>
      <div className="jf-support__media">
        <Figure image="jumpstart-business-model" sizes={SIZES} caption={caption} zoom />
      </div>
    </section>
  )
}

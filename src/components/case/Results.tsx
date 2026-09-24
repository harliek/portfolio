import type { ReactNode } from 'react'
import type { ImageId } from '../../content/media'
import { Figure } from '../media/Figure'

interface ResultsProps {
  /** One or two short paragraphs: demonstrated or supported results only. No metric cards, no counters. */
  children: ReactNode
  /** An optional small evidence image beside the text (with a visible "Enlarge image" button). */
  figure?: { image: ImageId; caption?: ReactNode; zoom?: boolean }
  title?: string
}

const SIZES = '(min-width: 960px) 460px, calc(100vw - 32px)'

/**
 * Compact results after the scroll section (56–72px later): the heading and
 * text in the text column, an optional small evidence figure beside them.
 * The next-project row follows directly; there is no separate large region.
 */
export function Results({ children, figure, title = 'Results' }: ResultsProps) {
  return (
    <section id="results" className="case-results" aria-labelledby="results-title">
      <div className="case-results__text">
        <h2 id="results-title" className="case-results__heading">
          {title}
        </h2>
        <div className="case-prose">{children}</div>
      </div>
      {figure && (
        <div className="case-results__figure">
          <Figure image={figure.image} sizes={SIZES} caption={figure.caption} zoom={figure.zoom ?? true} />
        </div>
      )}
    </section>
  )
}

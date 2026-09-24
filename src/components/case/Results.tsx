import type { ReactNode } from 'react'
import type { ImageId } from '../../content/media'
import { Figure } from '../media/Figure'

interface ResultsProps {
  /** A short paragraph (or two). No metric cards, no counters. */
  children: ReactNode
  /** An optional small evidence image beside the text. */
  figure?: { image: ImageId; caption?: ReactNode; zoom?: boolean }
  title?: string
}

const SIZES = '(min-width: 1320px) 420px, (min-width: 960px) 32vw, calc(100vw - 40px)'

/** Results in ordinary document flow, with id="results" for the section links. */
export function Results({ children, figure, title = 'Results' }: ResultsProps) {
  return (
    <section id="results" className="case-shell case-section case-results" aria-labelledby="results-title">
      <div className="case-section__text reading-scrim">
        <h2 id="results-title" className="case-heading">
          {title}
        </h2>
        <div className="case-prose">{children}</div>
      </div>
      {figure && (
        <div className="case-section__aside case-results__figure">
          <Figure image={figure.image} sizes={SIZES} caption={figure.caption} zoom={figure.zoom ?? true} />
        </div>
      )}
    </section>
  )
}

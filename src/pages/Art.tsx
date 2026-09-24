import '../styles/pages/art.css'
import type { MouseEvent } from 'react'
import { CreativeNav } from '../components/creative/CreativeNav'
import { ZoomableImage } from '../components/media/Figure'
import { ART } from '../content/pages/art'
import { getImage, type ImageId } from '../content/media'
import { usePageMeta } from '../hooks/usePageMeta'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

/** Rendered width of one grid cell (3 columns ≥900px, 2 below). */
const SIZES = '(min-width: 1280px) 368px, (min-width: 900px) calc((100vw - 144px) / 3), calc((100vw - 56px) / 2)'

const TOTAL = ART.series.reduce((n, s) => n + s.works.length, 0)

/** Series links scroll like the case pages' section links: no animation dependency, focus follows, the hash updates. */
function onSeriesLink(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  const heading = target.querySelector<HTMLElement>('h2') ?? target
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
  window.history.replaceState(window.history.state, '', `#${id}`)
}

function Work({ id }: { id: ImageId }) {
  const asset = getImage(id)
  return (
    <li className="art-work">
      <figure className="art-work__figure">
        <div className="art-work__frame">
          <ZoomableImage image={id} sizes={SIZES} fit="contain" />
        </div>
        {asset.caption && <figcaption className="art-work__title">{asset.caption}</figcaption>}
      </figure>
    </li>
  )
}

/**
 * The art archive (/art; linked from About, not from the header). Every
 * drawing from the previous portfolio, in Harlie's own series, order and
 * titles, followed by the three drawings the old site left out of its
 * series. A plain grid of equal cells: each drawing is shown whole on a dark
 * mat (never cropped) with its title below, and opens the shared
 * enlargement dialog, which steps through the whole archive in page order.
 */
export default function Art() {
  usePageMeta('Drawings', `${TOTAL} drawings by Harlie Katz, most of them in four series, with their titles.`)
  return (
    <article className="page-art">
      <header className="shell art-intro">
        <CreativeNav />
        <p className="art-intro__eyebrow">Art portfolio</p>
        <h1 className="art-intro__title" tabIndex={-1}>
          Drawings
        </h1>
        <p className="art-intro__lead">{ART.intro}</p>
        <nav className="art-index" aria-label="Series">
          <ul className="art-index__list" role="list">
            {ART.series.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="art-index__link" onClick={(e) => onSeriesLink(e, s.id)}>
                  {s.name}
                  <span className="visually-hidden">, </span>
                  <span className="art-index__count tabular">{s.works.length}</span>
                  <span className="visually-hidden"> drawings</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {ART.series.map((s) => (
        <section key={s.id} id={s.id} className="shell art-series" aria-labelledby={`${s.id}-title`}>
          <header className="art-series__head">
            <h2 id={`${s.id}-title`} className="art-series__name">
              {s.name}
            </h2>
            {'note' in s && s.note && <p className="art-series__note">{s.note}</p>}
          </header>
          <ul className="art-grid" role="list">
            {s.works.map((id) => (
              <Work key={id} id={id} />
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}

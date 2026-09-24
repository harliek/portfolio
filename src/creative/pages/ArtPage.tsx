import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { SERIES } from '../content'
import { Lightbox } from '../lib/Lightbox'
import { Picture, preload } from '../lib/Media'
import { Contact } from '../site/Contact'
import { Foot } from '../site/Foot'

/*
  A wall rather than a grid, as in the original.

  Nothing is cropped to a card and nothing is forced to a common height: the
  works keep their own proportions and are hung at different sizes, so the
  wall has a rhythm instead of a raster.

  Archive repairs: a one-line introduction and a row of series links under
  the title; readable captions; a visible "Enlarge" cue on every work (its
  button is named "Enlarge <title>"); and in the enlarged view a labelled
  Close button plus Previous / Next (and the Arrow keys) within the series,
  with "n of m".
*/

const WALL_SIZES = (span: number) =>
  `(max-width: 520px) calc(100vw - 40px), (max-width: 860px) calc(50vw - 36px), calc(${span} / 12 * min(100vw, 1680px))`
const LB_SIZES = 'min(1100px, 88vw)'

type Pos = { s: number; i: number }

const ExpandIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M7 1h4v4M5 11H1V7M11 1L7 5M1 11l4-4" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

export default function ArtPage() {
  usePageMeta('Art', 'Selected drawings and studies by Harlie Katz, in four series.')
  const [open, setOpen] = useState<Pos | null>(null)
  const prevBtn = useRef<HTMLButtonElement>(null)
  const nextBtn = useRef<HTMLButtonElement>(null)
  /** The button that should hold focus after a step that disabled the focused one. */
  const refocus = useRef<'prev' | 'next' | null>(null)

  const series = open ? SERIES[open.s] : null
  const work = open && series ? series.works[open.i] : null
  const count = series?.works.length ?? 0

  const step = useCallback(
    (dir: -1 | 1) => {
      if (!open) return
      const n = SERIES[open.s].works.length
      const i = open.i + dir
      if (i < 0 || i >= n) return
      const active = document.activeElement
      if (active === prevBtn.current && i === 0) refocus.current = 'next'
      if (active === nextBtn.current && i === n - 1) refocus.current = 'prev'
      setOpen({ s: open.s, i })
    },
    [open],
  )

  // Keep focus on a usable control when a step reaches either end, and warm
  // the neighbours so Previous / Next show their image at once.
  useEffect(() => {
    if (!open) return
    const target = refocus.current === 'next' ? nextBtn.current : refocus.current === 'prev' ? prevBtn.current : null
    refocus.current = null
    target?.focus()
    const works = SERIES[open.s].works
    for (const j of [open.i - 1, open.i + 1]) if (works[j]) preload(works[j].img, LB_SIZES)
  }, [open])

  const close = useCallback(() => setOpen(null), [])
  // Focus returns to the work being shown, which may differ from the one opened.
  const returnFocus = useCallback(
    () => (open ? document.querySelector<HTMLElement>(`[data-work="${open.s}-${open.i}"]`) : null),
    [open],
  )

  return (
    <main id="main" className="at">
      <header className="at-head lc-shell">
        <p className="at-crumb">
          <Link to="/creative">Creative</Link>
          <span aria-hidden="true">/</span>
          <b>Art</b>
        </p>
        <h1 className="at-t lc-display">Art</h1>
        <p className="at-intro">Selected drawings and studies.</p>
        <nav className="at-nav" aria-label="Series">
          <ul>
            {SERIES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {SERIES.map((s, si) => (
        <section key={s.id} id={s.id} className="at-series lc-shell" aria-labelledby={`${s.id}-h`}>
          <header className="at-series-h">
            <h2 className="at-series-n lc-serif" id={`${s.id}-h`}>
              {s.name}
            </h2>
            {s.note && <p className="at-series-note">{s.note}</p>}
          </header>

          <div className="at-wall">
            {s.works.map((w, i) => (
              <figure key={w.img.stem} className="at-work" style={{ gridColumn: `span ${w.w}`, '--i': i } as CSSProperties}>
                <button
                  type="button"
                  className="at-open"
                  data-work={`${si}-${i}`}
                  onClick={() => setOpen({ s: si, i })}
                  aria-label={`Enlarge ${w.title}`}
                >
                  <Picture img={w.img} alt={w.title} sizes={WALL_SIZES(w.w)} />
                  <span className="at-cue" aria-hidden="true">
                    <ExpandIcon />
                    Enlarge
                  </span>
                </button>
                <figcaption>
                  {w.title}
                  {w.note && <i>{w.note}</i>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <Lightbox open={Boolean(work)} onClose={close} onStep={step} returnFocus={returnFocus} label={work?.title ?? 'Artwork'}>
        {work && series && open && (
          <>
            <figure className="at-lb">
              <Picture img={work.img} alt={work.title} sizes={LB_SIZES} eager />
              <figcaption aria-live="polite">
                {work.title}
                {work.note && <i>{work.note}</i>}
                <span className="lc-sr">
                  , {open.i + 1} of {count} in {series.name}
                </span>
              </figcaption>
            </figure>
            <div className="lb-nav">
              <button
                ref={prevBtn}
                type="button"
                className="lb-btn"
                onClick={() => step(-1)}
                disabled={open.i === 0}
                aria-label="Previous work in this series"
              >
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                  <path d="M16 4.5H1M4.5 1L1 4.5 4.5 8" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Previous
              </button>
              <p className="lb-count" aria-hidden="true">
                {open.i + 1} of {count}
                <span> · {series.name}</span>
              </p>
              <button
                ref={nextBtn}
                type="button"
                className="lb-btn"
                onClick={() => step(1)}
                disabled={open.i === count - 1}
                aria-label="Next work in this series"
              >
                Next
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                  <path d="M0 4.5h15M11.5 1L15 4.5 11.5 8" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </Lightbox>

      <Contact />
      <Foot />
    </main>
  )
}

import '../../styles/pages/merchandising-platform.css'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ScrollScrubVideo } from '../../components/case/ScrollScrubVideo'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { MERCH as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, ScrollTrigger } from '../../lib/gsap'

const project = projectById('merchandising-platform')

/** Where each fragment waits before it converges (percent of the stage, rotation in degrees, scale); clear of the statement on the left. */
const SCATTER: readonly [number, number, number, number][] = [
  [6, 8, -4, 1],
  [72, 10, 3, 0.9],
  [64, 40, 2, 0.85],
  [84, 30, -3, 1],
  [22, 86, -2, 0.85],
  [60, 80, 4, 0.9],
  [38, 4, 1, 0.75],
  [88, 70, -2, 0.8],
  [76, 56, 3, 0.8],
  [46, 90, -3, 0.75],
]

/**
 * The problem, set as type, with the scattered sources converging: small
 * fragment windows (the fields a merchandiser had to gather: SKU, vendor, on
 * hand, units sold...) drift in from around the statement and settle into
 * one frame, which becomes the platform's catalog, where every SKU carries
 * them on one row. Scroll-scrubbed and pinned only for this passage;
 * reduced motion shows the statement and the catalog without movement.
 */
function Converge() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top+=61',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })
      tl.fromTo(
        '.mp-fragment',
        { xPercent: 0, yPercent: 0 },
        {
          left: '50%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          rotate: 0,
          scale: 0.55,
          opacity: 0,
          duration: 0.62,
          stagger: 0.02,
        },
        0.12,
      )
        .to('.mp-problem__text', { opacity: 0, y: -32, duration: 0.16 }, 0.36)
        .fromTo('.mp-converge__frame', { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.3 }, 0.54)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={rootRef} className="mp-problem" data-reduced={reduced || undefined} aria-labelledby="mp-problem-title">
      <div className="mp-problem__pin">
        <div className="mp-problem__text">
          <p className="cx-kicker">The problem</p>
          <h2 className="cx-statement mp-problem__statement" id="mp-problem-title">
            {C.problem.statement.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <div className="cx-body mp-problem__body">{C.problem.body}</div>
        </div>
        <div className="mp-fragments" aria-hidden="true">
          {C.problem.fragments.map((f, i) => {
            const [x, y, r, s] = SCATTER[i % SCATTER.length]
            return (
              <span
                key={f}
                className="mp-fragment"
                data-mid={y > 22 && y < 78 ? '' : undefined}
                style={
                  {
                    left: `${x}%`,
                    top: `${y}%`,
                    '--r': `${r}deg`,
                    '--s': s,
                  } as CSSProperties
                }
              >
                <span className="mp-fragment__bar" />
                <span className="mp-fragment__field">{f}</span>
                <span className="mp-fragment__rows" />
              </span>
            )
          })}
        </div>
        <figure className="mp-converge">
          <div className="mp-converge__frame cx-frame">
            <ResponsiveImage image="merch-catalog" sizes="(min-width: 1100px) 62vw, 92vw" />
          </div>
        </figure>
      </div>
    </section>
  )
}

/**
 * Merchandising Platform (brief v16): the real interface first and large;
 * then the recording, played by the scroll with four short annotations at
 * the moments they describe; the problem as type, its fragments converging
 * into the platform; one large view of the replenishment working with the
 * three decisions beneath; the outcome set quietly in type.
 */
export default function MerchandisingPlatform() {
  useLayoutEffect(() => {
    // Images above change heights once decoded; keep pinned sections measured.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <CasePage project={project} className="page-merchandising-platform">
      <header className="mp-hero">
        <div className="mp-hero__title">
          <CaseTitle title={C.title} meta={C.meta} />
        </div>
        <div className="mp-hero__text">
          <div className="cx-lede">{C.summary}</div>
          <p className="cx-status">{C.status}</p>
        </div>
        <figure className="mp-hero__media cx-frame">
          <ResponsiveImage image="merch-overview" sizes="(min-width: 1100px) 66vw, 100vw" priority />
        </figure>
      </header>

      <ScrollScrubVideo
        className="mp-demo"
        src="/media/video/merch-console-scrub-1280.mp4"
        poster="/media/img/merch-console-poster-1600.jpg"
        width={1280}
        height={646}
        duration={56.3}
        moments={C.moments}
        label="The Merchandising Platform prototype, played by scrolling: overview, a replenishment calculation, inventory and the Ask screen"
      />

      <Converge />

      <section className="mp-built" aria-labelledby="mp-built-title">
        <h2 className="visually-hidden" id="mp-built-title">
          What I built
        </h2>
        <figure className="mp-built__media cx-frame" data-reveal>
          <ResponsiveImage image="merch-replenish" sizes="(min-width: 1100px) 88vw, 100vw" />
        </figure>
        <ol className="mp-built__decisions">
          {C.built.map((d, i) => (
            <li key={d.title} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="mp-built__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mp-built__title">{d.title}</h3>
              <p className="mp-built__body">{d.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mp-outcome" aria-labelledby="mp-outcome-title">
        <p className="cx-kicker" id="mp-outcome-title">
          Prototype outcome
        </p>
        <p className="cx-statement mp-outcome__text" data-reveal>
          {C.outcome}
        </p>
      </section>
    </CasePage>
  )
}

import '../../styles/pages/merchandising-platform.css'
import { useLayoutEffect, useRef } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ChapterDemo } from '../../components/case/ChapterDemo'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { MERCH as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'

const project = projectById('merchandising-platform')

/**
 * The problem (brief v17, items 7 and 9): the explanation stays still in the
 * left four columns; on the right, four labelled source cards move toward
 * one product record as the section passes, a connector draws between them,
 * and the two permanent labels beneath ("Separate sources", "One reviewable
 * product record") keep the meaning in view throughout. The animation never
 * leaves the right-hand region. Reduced motion: both states side by side.
 */
function Problem() {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top 78%', end: 'bottom 60%', scrub: 0.5 } })
      tl.fromTo('.mp-source', { x: 0, opacity: 1, scale: 1 }, { x: () => (window.innerWidth < 600 ? 0 : stage.clientWidth * 0.2), opacity: 0.42, scale: 0.92, stagger: 0.06, duration: 0.7 }, 0)
        .fromTo('.mp-link path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, 0.1)
        .fromTo('.mp-record', { opacity: 0.35, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
        .fromTo('.mp-record__row', { opacity: 0.2 }, { opacity: 1, stagger: 0.06, duration: 0.3 }, 0.55)
    }, stage)
    return () => ctx.revert()
  }, [reduced])

  const P = C.problem
  return (
    <section className="mp-problem cx-wrap cx-section" aria-labelledby="mp-problem-title">
      <div className="cx-grid">
        <div className="mp-problem__text">
          <p className="cx-kicker">The problem</p>
          <h2 className="cx-h2" id="mp-problem-title">
            {P.heading}
          </h2>
          <p className="cx-body">{P.body}</p>
        </div>
        <div ref={stageRef} className="mp-converge" data-reduced={reduced || undefined}>
          <div className="mp-converge__field" aria-hidden="true">
            <div className="mp-sources">
              {P.sources.map((s) => (
                <div key={s.name} className="mp-source">
                  <p className="mp-source__name">{s.name}</p>
                  {s.fields.map(([k, v]) => (
                    <p key={k} className="mp-source__field">
                      <span>{k}</span> {v}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <svg className="mp-link" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 18 C 45 18, 55 50, 100 50" pathLength="1" />
              <path d="M0 42 C 45 42, 55 50, 100 50" pathLength="1" />
              <path d="M0 64 C 45 64, 55 50, 100 50" pathLength="1" />
              <path d="M0 86 C 45 86, 55 50, 100 50" pathLength="1" />
            </svg>
            <div className="mp-record">
              <p className="mp-record__title">{P.record.title}</p>
              <p className="mp-record__sub">{P.record.sub}</p>
              {P.record.rows.map(([k, v]) => (
                <p key={k} className="mp-record__row">
                  <span>{k}</span> {v}
                </p>
              ))}
            </div>
          </div>
          <div className="mp-converge__labels">
            <p className="cx-label">{P.before}</p>
            <span className="mp-converge__rule" aria-hidden="true" />
            <p className="cx-label mp-converge__after">{P.after}</p>
          </div>
          <p className="cx-caption mp-converge__note">{P.note}</p>
        </div>
      </div>
    </section>
  )
}

/**
 * Merchandising Platform (brief v17): the decision process is the story.
 * One composed hero image (the same crop as the homepage cover, so the
 * opening frame lands on it), the problem, three design decisions that each
 * pair a reason with exact evidence and one sentence on what it proves, the
 * recording in three chapters, and an honest closing on what the prototype
 * demonstrates and what is still to validate.
 */
export default function MerchandisingPlatform() {
  const [together, reasoning, control] = C.decisions
  return (
    <CasePage project={project} className="page-merchandising-platform">
      <header className="mp-hero cx-wrap">
        <div className="mp-hero__head" data-hero-reveal>
          <CaseTitle title={C.title} meta={C.meta} />
        </div>
        <div className="mp-hero__text" data-hero-reveal>
          <div className="cx-lede">{C.summary}</div>
          <p className="cx-status">{C.status}</p>
        </div>
        <figure className="mp-hero__media cx-frame" data-hero-media>
          <ResponsiveImage image={C.hero} sizes="(min-width: 1408px) 1280px, calc(100vw - 48px)" priority />
        </figure>
      </header>

      <Problem />

      <section className="mp-decision mp-decision--together cx-wrap cx-section" aria-labelledby="mp-d1">
        <div className="cx-grid">
          <div className="mp-decision__head">
            <p className="cx-kicker">Decision 1</p>
            <h2 className="cx-h2" id="mp-d1">
              {together.heading}
            </h2>
          </div>
          <p className="cx-body mp-decision__why">{together.why}</p>
          <figure className="mp-decision__media cx-frame" data-reveal>
            <ResponsiveImage image={together.image} sizes="(min-width: 1408px) 1280px, calc(100vw - 48px)" />
          </figure>
          <p className="cx-proof mp-decision__proof">{together.proof}</p>
        </div>
      </section>

      <section className="mp-decision mp-decision--reasoning cx-wrap cx-section" aria-labelledby="mp-d2">
        <div className="cx-grid">
          <div className="mp-decision__text">
            <p className="cx-kicker">Decision 2</p>
            <h2 className="cx-h2" id="mp-d2">
              {reasoning.heading}
            </h2>
            <p className="cx-body">{reasoning.why}</p>
            <p className="cx-proof">{reasoning.proof}</p>
          </div>
          <figure className="mp-working" data-reveal>
            <div className="cx-frame">
              <ResponsiveImage image={reasoning.image} sizes="(min-width: 1100px) 560px, calc(100vw - 48px)" />
            </div>
            {reasoning.notes?.map((n, i) => (
              <figcaption key={n.label} className="mp-note" style={{ top: `${n.y}%` }}>
                <span className="mp-note__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="mp-note__text">
                  <strong>{n.label}</strong> {n.text}
                </span>
              </figcaption>
            ))}
          </figure>
        </div>
      </section>

      <section className="mp-decision mp-decision--control cx-wrap cx-section" aria-labelledby="mp-d3">
        <div className="cx-grid">
          <figure className="mp-decision__media cx-frame" data-reveal>
            <ResponsiveImage image={control.image} sizes="(min-width: 1100px) 830px, calc(100vw - 48px)" />
          </figure>
          <div className="mp-decision__text">
            <p className="cx-kicker">Decision 3</p>
            <h2 className="cx-h2" id="mp-d3">
              {control.heading}
            </h2>
            <p className="cx-body">{control.why}</p>
            <p className="cx-proof">{control.proof}</p>
          </div>
        </div>
      </section>

      <section className="mp-demo cx-wrap cx-section" aria-labelledby="mp-demo-title">
        <h2 className="cx-h2 mp-demo__title" id="mp-demo-title">
          {C.demo.heading}
        </h2>
        <ChapterDemo
          large
          numbered={false}
          label="The Merchandising Platform recording"
          chapters={C.demo.chapters}
          aspect="1280 / 646"
          video={{ src: '/media/video/merch-console-scrub-1280.mp4', poster: '/media/img/merch-console-poster-1600.jpg', width: 1280, height: 646 }}
        />
        <p className="cx-caption mp-demo__also">{C.demo.also}</p>
      </section>

      <section className="mp-closing cx-wrap cx-section" aria-labelledby="mp-closing-title">
        <h2 className="cx-h2" id="mp-closing-title">
          {C.closing.heading}
        </h2>
        <div className="cx-grid mp-closing__cols">
          <div>
            <p className="cx-kicker">Demonstrated</p>
            <ul className="cx-list">
              {C.closing.demonstrated.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="cx-kicker">Still to validate</p>
            <ul className="cx-list">
              {C.closing.toValidate.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </CasePage>
  )
}

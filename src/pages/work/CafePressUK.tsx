import '../../styles/pages/cafepress-uk.css'
import { useLayoutEffect, useRef } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v16): localization and merchandising, told with the
 * storefront itself. The opening is a composed view of the prototype, the
 * whole page with a magnified UK detail laid over it, the layers drifting
 * at different depths as the page scrolls; then the category navigation as
 * type with the storefront's own category row beneath it; the US to UK
 * wording from the research shifting word by word with the scroll; the
 * assortment large; and the three recommendations. Reduced motion: every
 * layer and word at rest (UK terms shown).
 */
export default function CafePressUK() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    const ctx = gsap.context(() => {
      // Depth in the opening: the magnified detail travels faster than the page behind it.
      gsap.to('.cp-collage__page', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.cp-hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.fromTo(
        '.cp-collage__detail',
        { yPercent: 6 },
        { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.cp-hero', start: 'top top', end: 'bottom top', scrub: true } },
      )
      // The words shift from US to UK one after another as the list crosses the view.
      const rows = gsap.utils.toArray<HTMLElement>('.cp-pair')
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.cp-pairs', start: 'top 75%', end: 'bottom 45%', scrub: 0.4 } })
      rows.forEach((row, i) => {
        tl.to(row.querySelector('.cp-pair__us'), { opacity: 0.28, duration: 0.5 }, i * 0.35)
        tl.fromTo(row.querySelector('.cp-pair__uk'), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5 }, i * 0.35 + 0.15)
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <CasePage project={project} className="page-cafepress-uk">
      <div ref={rootRef} data-reduced={reduced || undefined}>
        <header className="cp-hero">
          <div className="cp-hero__title">
            <CaseTitle title={C.title} meta={C.meta} />
          </div>
          <div className="cp-hero__text">
            <div className="cx-lede">{C.summary}</div>
            <p className="cx-status">{C.status}</p>
          </div>
          <figure className="cp-collage" aria-label="The CafePress Business UK storefront prototype, with its UK contact details magnified">
            <div className="cp-collage__page cx-frame">
              <ResponsiveImage image="cp-storefront" sizes="(min-width: 1100px) 56vw, 100vw" priority />
            </div>
            <div className="cp-collage__detail cx-frame">
              <ResponsiveImage image="cp-header-nav" sizes="(min-width: 1100px) 24vw, 50vw" />
            </div>
          </figure>
        </header>

        <section className="cp-categories" aria-labelledby="cp-categories-title">
          <p className="cx-kicker" id="cp-categories-title">
            {C.categories.title}
          </p>
          <ul className="cp-categories__list" data-reveal>
            {C.categories.items.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="cp-strip cx-frame" data-reveal aria-hidden="true">
            <ResponsiveImage image="cp-storefront" sizes="(min-width: 1100px) 88vw, 100vw" decorative />
          </div>
          <p className="cx-body cp-categories__body" data-reveal>
            {C.categories.body}
          </p>
        </section>

        <section className="cp-local" aria-labelledby="cp-local-title">
          <div className="cp-local__text">
            <p className="cx-kicker" id="cp-local-title">
              {C.localization.title}
            </p>
            <p className="cx-body">{C.localization.body}</p>
            <figure className="cp-local__detail cx-frame" data-reveal>
              <ResponsiveImage image="cp-header-nav" sizes="(min-width: 1100px) 30vw, 100vw" />
            </figure>
          </div>
          <div className="cp-pairs">
            <p className="cp-pairs__label">{C.localization.label}</p>
            <ul className="cp-pairs__list">
              {C.localization.pairs.map(([us, uk]) => (
                <li key={us} className="cp-pair">
                  <span className="cp-pair__us" lang="en-US">
                    {us}
                  </span>
                  <span className="cp-pair__arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="cp-pair__uk" lang="en-GB">
                    {uk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="cp-assortment" aria-labelledby="cp-assortment-title">
          <figure className="cp-assortment__media cx-frame" data-reveal>
            <ResponsiveImage image="cp-products" sizes="(min-width: 1100px) 76vw, 100vw" />
          </figure>
          <div className="cp-assortment__text" data-reveal>
            <p className="cx-kicker" id="cp-assortment-title">
              {C.assortment.title}
            </p>
            <div className="cx-body">{C.assortment.body}</div>
          </div>
        </section>

        <section className="cp-result" aria-labelledby="cp-result-title">
          <p className="cx-kicker" id="cp-result-title">
            The result
          </p>
          <p className="cx-statement cp-result__lead" data-reveal>
            {C.result.lead}
          </p>
          <ol className="cp-result__list">
            {C.result.items.map((item, i) => (
              <li key={item} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </CasePage>
  )
}

import '../../styles/pages/about.css'
import { useEffect, useState, type MouseEvent } from 'react'
import { ABOUT } from '../../content/pages/about'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { StatefulIcons } from '../ui/Stateful'
import { ArtPreview } from './ArtPreview'
import { FeaturedFilm } from './FeaturedFilm'

/** Each drawing in the Art card is about a third of the card's width at most (three side by side). */
const ART_PIECE_SIZES = '(min-width: 1320px) 112px, (min-width: 900px) 8.5vw, (min-width: 560px) 14vw, 30vw'

/** The portrait's rendered width (about.css). */
const PORTRAIT_SIZES = '(min-width: 720px) 340px, 80vw'

/**
 * The /about page (brief v21), in the old creative portfolio's About format:
 *
 * 1. Opening. On the left a small "About" label with its rule, the name
 *    "Harlie Katz", a short descriptor in the red accent, and three short
 *    paragraphs; on the right the colour portrait (about 340px wide, 4:5).
 *    Phones: the text, then the portrait.
 * 2. Education, numbered as on the creative site: the school, degree, minor,
 *    certificate and dates, then Harlie's two written paragraphs.
 * 3. Creative work, compact: the Creative Portfolio (its Art tile; opens the
 *    original creative homepage at /creative/, a separate build, so a plain
 *    link), An Artistic End (its authentic poster; plays the film, with the
 *    YouTube player requested only after that press), and Art (one of
 *    Harlie's charcoal portraits; opens the creative portfolio's Art page).
 * Email, LinkedIn and the résumé live in the site's ending (Footer.tsx).
 *
 * The page is deliberately still: no pointer light and no parallax.
 */
export function AboutContent() {
  const { education: edu } = ABOUT
  // The creative links load a separate site: their red badge shows the loader until the page changes.
  const [leaving, setLeaving] = useState<'portfolio' | 'art' | null>(null)
  useEffect(() => {
    // Back from the creative site restores this page from the cache: clear the loader.
    const reset = () => setLeaving(null)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])
  const leave = (which: 'portfolio' | 'art') => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) setLeaving(which)
  }

  return (
    <div className="about-content">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__text">
          <p className="about-label">{ABOUT.label}</p>
          <h1 id="about-title" className="about-name">
            {ABOUT.name}
          </h1>
          <p className="about-descriptor">{ABOUT.descriptor}</p>
          <div className="about-hero__copy">
            {ABOUT.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="about-portrait">
          <ResponsiveImage image="headshot" sizes={PORTRAIT_SIZES} alt={ABOUT.portraitLabel} priority />
        </figure>
      </section>

      <section className="about-education" aria-labelledby="about-education-title">
        <h2 id="about-education-title" className="about-section-label">
          <span className="about-section-label__num" aria-hidden="true">
            01
          </span>
          {ABOUT.educationTitle}
        </h2>
        <div className="about-education__grid">
          <div className="about-school">
            <p className="about-school__name">
              {edu.school} <span className="about-school__dates tabular">{edu.dates}</span>
            </p>
            <ul className="about-school__credentials" role="list">
              {edu.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div className="about-school__text">
            {edu.text.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="about-creative" aria-labelledby="about-creative-title">
        <h2 id="about-creative-title" className="about-section-label">
          <span className="about-section-label__num" aria-hidden="true">
            02
          </span>
          {ABOUT.creativeTitle}
        </h2>
        <div className="about-creative__grid">
          <div className="about-work about-work--portfolio">
            <div className="about-work__frame">
              {/* A separate static build outside the router: a plain link and a full page load. */}
              <a
                href={ABOUT.portfolio.href}
                className="about-work__hit"
                aria-label={`${ABOUT.portfolio.action}, ${ABOUT.portfolio.title}`}
                onClick={leave('portfolio')}
              >
                <ArtPreview />
                <span className="about-work__badge stateful" aria-hidden="true" data-state={leaving === 'portfolio' ? 'loading' : 'idle'}>
                  <StatefulIcons />
                  {ABOUT.portfolio.action}
                  <span className="about-work__arrow">↗</span>
                </span>
              </a>
            </div>
            <div className="about-work__foot">
              <h3 className="about-work__title">{ABOUT.portfolio.title}</h3>
              <p className="about-work__line">{ABOUT.portfolio.line}</p>
            </div>
          </div>
          <FeaturedFilm />
          <div className="about-work about-work--art">
            <div className="about-work__frame">
              {/* The creative portfolio's Charcoal Art page, a separate static build: a plain link and a full page load. */}
              <a href={ABOUT.art.href} className="about-work__hit" aria-label={`${ABOUT.art.action}, ${ABOUT.art.title}`} onClick={leave('art')}>
                {/* Three drawings, upright and small, side by side on the dark ground; the whole frame is the one link. */}
                <span className="about-art-strip">
                  {ABOUT.art.images.map((id) => (
                    <span key={id} className="about-art-strip__piece">
                      <ResponsiveImage image={id} sizes={ART_PIECE_SIZES} decorative fit="cover" className="about-art-strip__image" />
                    </span>
                  ))}
                </span>
                <span className="about-work__badge stateful" aria-hidden="true" data-state={leaving === 'art' ? 'loading' : 'idle'}>
                  <StatefulIcons />
                  {ABOUT.art.action}
                  <span className="about-work__arrow">↗</span>
                </span>
              </a>
            </div>
            <div className="about-work__foot">
              <h3 className="about-work__title">{ABOUT.art.title}</h3>
              <p className="about-work__line">{ABOUT.art.line}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

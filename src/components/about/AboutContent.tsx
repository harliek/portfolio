import '../../styles/pages/about.css'
import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { ABOUT } from '../../content/pages/about'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { DockTitle } from '../ui/DockTitle'
import { StatefulIcons } from '../ui/Stateful'
import { ArtPreview } from './ArtPreview'
import { ContactForm } from './ContactForm'
import { FeaturedFilm } from './FeaturedFilm'
import { useRestingEnd } from './useRestingEnd'

/**
 * Each drawing in the Art card is a third of the card's width (three side by side, filling it). The cards are at most
 * 312px wide (about.css); from 560px to 900px the Art card spans the row, so each drawing is about 30vw (2026-09-28).
 */
const ART_PIECE_SIZES = '(min-width: 1128px) 104px, (min-width: 900px) 10vw, (min-width: 560px) 30vw, 33vw'

/**
 * The portrait's rendered width (about.css, 2026-09-28): beside the words from 720px (32vw, at least 240px, then from
 * 820px 26vw between 300px and 344px), 344px when stacked on a tablet, and the full column on a phone.
 */
const PORTRAIT_SIZES = '(min-width: 1323px) 344px, (min-width: 820px) 300px, (min-width: 750px) 32vw, (min-width: 720px) 240px, (min-width: 560px) 344px, calc(100vw - 40px)'

/** The descriptor's halves, either side of its middle dot ("AI implementation" and "Product strategy and operations"). */
const DESCRIPTOR = ABOUT.descriptor.split(' · ')

/**
 * The /about page (brief v21), in the old creative portfolio's About format:
 *
 * 1. Opening. On the left a small "About" label with its rule, the name
 *    "Harlie Katz", a short descriptor in the blue violet glow, and two short
 *    paragraphs (Harlie's baseline, 2026-09-28); on the right the colour
 *    portrait (4:5, 240 to 344px wide). Beside the words from 720px wide
 *    (2026-09-28; it was 820px, which left tablets a lone portrait with
 *    empty space beside it); narrower, the text and then the portrait.
 *    The descriptor's two halves each wrap as one where they can.
 * 2. Education, numbered as on the creative site: the school with its years,
 *    the degree and the certificate, the coursework line, then Harlie's one
 *    paragraph.
 * 3. Creative work, compact: the Creative Portfolio (its Art tile; opens the
 *    original creative homepage at /creative/, a separate build, so a plain
 *    link), An Artistic End (its authentic poster; plays the film, with the
 *    YouTube player requested only after that press), and Art (three of
 *    Harlie's charcoal portraits; opens the creative portfolio's Art page).
 * 4. Get in touch: a name, an email address and a message (ContactForm.tsx),
 *    with the email address, LinkedIn and the résumé beside "Send message"
 *    (Harlie's request, 2026-09-28). It is the page's last section and its
 *    resting place (useRestingEnd): nothing scrolls the page away from it.
 *
 * No parallax. Like the rest of the site, the page sits on the Nebula ground, lit only where the pointer moves
 * (CaseGround.tsx), and the portrait and the cards answer the pointer (a 3D tilt, a hover scale).
 */
export function AboutContent() {
  const { education: edu } = ABOUT
  const rootRef = useRef<HTMLDivElement>(null)
  useRestingEnd(rootRef)
  // The creative links load a separate site: their stateful badge shows the loader until the page changes.
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
    <div ref={rootRef} className="about-content">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__text">
          <p className="about-label">{ABOUT.label}</p>
          <DockTitle id="about-title" className="about-name" text={ABOUT.name} />
          {/* The two halves, each kept whole where the line allows (2026-09-28: it broke as "... PRODUCT STRATEGY" / "AND OPERATIONS"). */}
          <p className="about-descriptor">
            {DESCRIPTOR.map((part, i) => (
              <Fragment key={part}>
                {i > 0 && ' '}
                <span className="about-descriptor__part">{i < DESCRIPTOR.length - 1 ? `${part} ·` : part}</span>
              </Fragment>
            ))}
          </p>
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
            <p className="about-school__coursework">{edu.coursework}</p>
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
                aria-label={`${ABOUT.portfolio.action} (a separate site)`}
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
            </div>
          </div>
          <FeaturedFilm />
          <div className="about-work about-work--art">
            <div className="about-work__frame">
              {/* The creative portfolio's Charcoal Art page, a separate static build: a plain link and a full page load. */}
              {/* Named by its title, "View drawings, Selected drawings and studies" (copy brief of 2026-09-28). */}
              <a href={ABOUT.art.href} className="about-work__hit" aria-label={`${ABOUT.art.action}, ${ABOUT.art.title}`} onClick={leave('art')}>
                {/* Three drawings filling the card side by side; the whole frame is the one link. */}
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
            </div>
          </div>
        </div>
      </section>

      <section className="about-contact" aria-labelledby="about-contact-title">
        <h2 id="about-contact-title" className="about-section-label">
          <span className="about-section-label__num" aria-hidden="true">
            03
          </span>
          {ABOUT.contactTitle}
        </h2>
        <ContactForm />
      </section>
    </div>
  )
}


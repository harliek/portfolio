import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import '../styles/home.css'
import { headerHeight } from '../components/home/headerHeight'
import { HomeFilm } from '../components/home/HomeFilm'
import { TypeLine } from '../components/ui/TypeLine'
import { useFilmSlot } from '../components/layout/filmSlot'
import { ProjectField } from '../components/home/ProjectField'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { ScrollProgress } from '../lib/scrollProgress'

/** The page's end, where the collection fills the window with the footer below it. */
const landAtEnd = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })

/**
 * The homepage (brief v19; v23): Harlie's original film, clearly visible,
 * with the identity group (name, PORTFOLIO, one line) about 39% down the
 * opening; the selected work already shows beneath it, and the page ends
 * with it (the footer just below), where scrolling moves the projects on.
 * As the opening scrolls out, the title eases up and fades a little
 * (`--enter`), and the film dims only slightly behind
 * the work (`--settle`). Both are written by lib/scrollProgress.ts (ScrollTrigger's
 * measurements and timing, without GSAP since 2026-09-29, Harlie's approval, audit
 * D1/E4/G1) straight to the style of the elements that read them (`--enter` on
 * the opening and the film's slot, `--settle` on the slot), so a scroll frame
 * restyles only those; nothing re-renders on scroll.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  const heroRef = useRef<HTMLElement>(null)
  // The film goes to PageShell's fixed slot (outside the route wrapper, whose animation would capture position: fixed).
  const filmSlot = useFilmSlot()
  const location = useLocation()
  const toWork = Boolean((location.state as { toWork?: boolean } | null)?.toWork)

  /*
   * Back from a case study opened directly (Header.tsx): the page's end, where the collection fills the window, with
   * the project last looked at centred (ProjectField); again after fonts, so it lands exactly. It lands before the
   * first paint (the collection has measured by then) and again once the router's own scroll reset for a new entry
   * has run (ScrollRestoration's, a later layout effect), before the page change pictures the new page, so the case
   * study folds into that project's tile (Harlie's brief, 2026-09-28: it slid in with the page still at its top).
   */
  useLayoutEffect(() => {
    if (toWork) landAtEnd()
  }, [toWork])
  useEffect(() => {
    if (!toWork) return
    landAtEnd()
    let live = true
    void document.fonts?.ready.then(() => live && landAtEnd())
    return () => {
      live = false
    }
  }, [toWork])

  useLayoutEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const slot = filmSlot
    // --enter: the title (inside the opening) and the film's dim; --settle: the film's dim only.
    const setEnter = (v: number) => {
      hero.style.setProperty('--enter', v.toFixed(4))
      slot?.style.setProperty('--enter', v.toFixed(4))
    }
    const setSettle = (v: number) => slot?.style.setProperty('--settle', v.toFixed(4))
    // Under the header (its one height, tokens.css).
    const under = `top+=${headerHeight()}`
    const opening = ScrollProgress.create({
      trigger: hero,
      start: `top ${under}`,
      // No hold: the title eases away as the opening scrolls out.
      end: `bottom ${under}`,
      onUpdate: (self) => setEnter(self.progress),
      onRefresh: (self) => setEnter(self.progress),
    })
    const field = ScrollProgress.create({
      trigger: '.field',
      start: 'top bottom',
      end: `top ${under}`,
      onUpdate: (self) => setSettle(self.progress),
      onRefresh: (self) => setSettle(self.progress),
    })
    // Media and fonts change heights after the first layout.
    const refresh = () => ScrollProgress.refresh()
    window.addEventListener('load', refresh)
    void document.fonts?.ready.then(refresh)
    return () => {
      window.removeEventListener('load', refresh)
      opening.kill()
      field.kill()
      slot?.style.removeProperty('--enter')
      slot?.style.removeProperty('--settle')
    }
  }, [filmSlot])

  return (
    <div className="home">
      {filmSlot && createPortal(<HomeFilm />, filmSlot)}
      <section ref={heroRef} className="hero" aria-labelledby="home-title">
        <div className="hero__stage">
          <div className="hero__group">
            <h1 className="hero__title" id="home-title">
              {/* Typed in from top to bottom: the name, then PORTFOLIO, then the line (TypeLine). */}
              <span className="hero__name">
                <TypeLine text={SITE.name} delay={0.15} duration={0.3} hideAt={0.45} />
              </span>{' '}
              <span className="hero__word">
                <TypeLine text="Portfolio" delay={0.45} duration={0.55} hideAt={1.0} letters />
              </span>
            </h1>
            <p className="hero__line">
              {/* "&" stays with "Implementation" where the line wraps (phones). */}
              <TypeLine text={'AI Product Strategy, Deployment &\u00a0Implementation'} delay={1.0} duration={0.8} />
            </p>
          </div>
        </div>
      </section>
      <ProjectField />
    </div>
  )
}

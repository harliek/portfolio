import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import '../styles/home.css'
import { HomeFilm } from '../components/home/HomeFilm'
import { TypeLine } from '../components/ui/TypeLine'
import { useFilmSlot } from '../components/layout/filmSlot'
import { ProjectField } from '../components/home/ProjectField'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { ScrollTrigger } from '../lib/gsap'

/**
 * The homepage (brief v19; v23): Harlie's original film, clearly visible,
 * with the identity group (name, PORTFOLIO, one line) about 39% down the
 * opening; the selected work already shows beneath it, and the page ends
 * with it (the footer just below), where scrolling moves the projects on. As the opening scrolls out, the title eases up
 * and fades a little (`--enter`), and the film dims only slightly behind
 * the work (`--settle`). Both are written by ScrollTrigger straight to the
 * root's style; nothing re-renders on scroll.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  // The film goes to PageShell's fixed slot (outside the route wrapper, whose animation would capture position: fixed).
  const filmSlot = useFilmSlot()
  const location = useLocation()
  const toWork = Boolean((location.state as { toWork?: boolean } | null)?.toWork)

  // Back from a case study opened directly (Header.tsx): the page's end, where the collection fills the window,
  // with the project last looked at; again after fonts, so it lands exactly.
  useEffect(() => {
    if (!toWork) return
    const land = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
    const frame = requestAnimationFrame(() => requestAnimationFrame(land))
    void document.fonts?.ready.then(land)
    return () => cancelAnimationFrame(frame)
  }, [toWork])

  useLayoutEffect(() => {
    const root = rootRef.current
    const hero = heroRef.current
    if (!root || !hero) return
    const slot = filmSlot
    const set = (name: string, v: number) => {
      root.style.setProperty(name, v.toFixed(4))
      slot?.style.setProperty(name, v.toFixed(4))
    }
    const opening = ScrollTrigger.create({
      trigger: hero,
      start: 'top top+=61',
      // No hold: the title eases away as the opening scrolls out.
      end: 'bottom top+=61',
      onUpdate: (self) => set('--enter', self.progress),
      onRefresh: (self) => set('--enter', self.progress),
    })
    const field = ScrollTrigger.create({
      trigger: '.field',
      start: 'top bottom',
      end: 'top top+=61',
      onUpdate: (self) => set('--settle', self.progress),
      onRefresh: (self) => set('--settle', self.progress),
    })
    // Media and fonts change heights after the first layout.
    const refresh = () => ScrollTrigger.refresh()
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
    <div ref={rootRef} className="home">
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
              <TypeLine text="AI product management, strategy, and implementation" delay={1.0} duration={0.8} />
            </p>
          </div>
        </div>
      </section>
      <ProjectField />
    </div>
  )
}

import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import '../styles/home.css'
import { HomeFilm } from '../components/home/HomeFilm'
import { useFilmSlot } from '../components/layout/filmSlot'
import { ProjectField } from '../components/home/ProjectField'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { ScrollTrigger } from '../lib/gsap'

/**
 * The homepage (brief v16): Harlie's original film as the one dominant
 * image, very large PORTFOLIO, darkness and space; then the selected work.
 *
 * The opening holds (a short pin) as scrolling begins: PORTFOLIO rises a
 * little and scales down, the film darkens, and the selected work arrives
 * from below over the same, now faint, film (`--enter`, 0 to 1). The film
 * keeps darkening a little further as the field settles in (`--film-dim`).
 * Both are written by ScrollTrigger straight to the root's style; nothing
 * re-renders on scroll.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  // The film goes to PageShell's fixed slot (outside the route wrapper, whose animation would capture position: fixed).
  const filmSlot = useFilmSlot()

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
      // The hold: the section's extra height beyond one window.
      end: () => `+=${Math.max(1, hero.offsetHeight - (window.innerHeight - 61))}`,
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

  /** Scrolls to the selected work (smoothly, unless reduced motion) and moves focus there. */
  const exploreWork = (e: MouseEvent<HTMLAnchorElement>) => {
    const field = document.getElementById('selected-work')
    if (!field) return
    e.preventDefault()
    const top = field.getBoundingClientRect().top + window.scrollY - 61
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    field.querySelector<HTMLElement>('.plane[aria-current]')?.focus({ preventScroll: true })
  }

  return (
    <div ref={rootRef} className="home">
      {filmSlot && createPortal(<HomeFilm />, filmSlot)}
      <section ref={heroRef} className="hero" aria-labelledby="home-title">
        <div className="hero__stage">
          <div className="hero__group">
            <h1 className="hero__title" id="home-title">
              <span className="hero__name">{SITE.name}</span> <span className="hero__word">Portfolio</span>
            </h1>
            <p className="hero__line">AI implementation, product strategy, and working prototypes.</p>
            <a className="hero__explore" href="#selected-work" onClick={exploreWork}>
              Explore selected work <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>
      <ProjectField />
    </div>
  )
}

import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION, staggerFor } from '../config/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Restrained, once-only entrances for elements marked with data-reveal inside
 * `scope`:
 *   data-reveal            → the element fades up 14px as one group
 *   data-reveal="stagger"  → its direct children fade up 10px, stagger ≤ 180ms
 * Never applied to the H1 or hero. Nothing replays on upward scroll. Under
 * reduced motion nothing is animated. If GSAP fails, content stays visible
 * because no hidden state exists in CSS.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const stagger = el.dataset.reveal === 'stagger'
        const targets = stagger ? Array.from(el.children) : [el]
        const cfg = stagger ? MOTION.enterSmall : MOTION.enterSection
        gsap.from(targets, {
          autoAlpha: 0,
          y: cfg.y,
          duration: cfg.duration,
          ease: cfg.ease,
          stagger: stagger ? staggerFor(targets.length) : 0,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: el, start: MOTION.enterStart, once: true },
        })
      })
    })
    // Media and fonts can change layout after mount; refresh once when ready.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
      mm.revert()
    }
  }, [scope])
}

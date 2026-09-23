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
 *
 * Only opacity is animated (never visibility), so content that has not yet
 * scrolled into view stays focusable and exposed to assistive technology.
 * If keyboard focus lands inside a section before it is revealed, the
 * section is shown immediately.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanups: Array<() => void> = []
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const stagger = el.dataset.reveal === 'stagger'
        const targets = stagger ? Array.from(el.children) : [el]
        const cfg = stagger ? MOTION.enterSmall : MOTION.enterSection
        const tween = gsap.from(targets, {
          opacity: 0,
          y: cfg.y,
          duration: cfg.duration,
          ease: cfg.ease,
          stagger: stagger ? staggerFor(targets.length) : 0,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: MOTION.enterStart, once: true },
        })
        const onFocusIn = () => tween.progress(1)
        el.addEventListener('focusin', onFocusIn, { once: true })
        cleanups.push(() => el.removeEventListener('focusin', onFocusIn))
      })
      return () => cleanups.forEach((fn) => fn())
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

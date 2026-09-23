import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { MOTION, staggerFor } from '../config/motion'
import { prefersReducedMotion } from './useReducedMotion'

/**
 * Restrained, once-only entrances for elements marked with data-reveal inside
 * `scope`:
 *   data-reveal            → the element fades up 14px as one group
 *   data-reveal="stagger"  → its direct children fade up 10px, stagger ≤ 180ms
 *
 * Never applied to the H1 or hero. Nothing replays on upward scroll. Under
 * reduced motion nothing is animated. If GSAP fails, content stays visible
 * because no hidden state exists in CSS.
 *
 * Triggering uses IntersectionObserver rather than ScrollTrigger, so case
 * pages run no animation-frame loop at rest. Only opacity and transform are
 * animated (never visibility): unrevealed content stays focusable and exposed
 * to assistive technology, and keyboard focus inside a section — or an
 * anchor jump to it — completes its entrance immediately.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const tweens = new Map<Element, gsap.core.Tween>()
    const cleanups: Array<() => void> = []

    for (const el of els) {
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
        paused: true,
      })
      tweens.set(el, tween)
      const finish = () => tween.progress(1)
      el.addEventListener('focusin', finish, { once: true })
      cleanups.push(() => el.removeEventListener('focusin', finish))
    }

    // Sections already above the fold (or passed) play at once; others play
    // when they approach the viewport (≈ ScrollTrigger's "top 85%").
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue
          tweens.get(entry.target)?.play()
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    els.forEach((el) => io.observe(el))

    // Chapter links and deep links: finish the target's entrance before the
    // browser scrolls, so the heading lands at its final position.
    const finishFor = (hash: string) => {
      let target: Element | null
      try {
        target = hash.length > 1 ? root.querySelector(`#${CSS.escape(decodeURIComponent(hash.slice(1)))}`) : null
      } catch {
        target = null
      }
      const host = target?.closest('[data-reveal]')
      if (host) tweens.get(host)?.progress(1)
    }
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (a) finishFor(a.getAttribute('href') ?? '')
    }
    root.addEventListener('click', onAnchor, true)
    if (location.hash) finishFor(location.hash)

    return () => {
      io.disconnect()
      root.removeEventListener('click', onAnchor, true)
      cleanups.forEach((fn) => fn())
      tweens.forEach((t) => t.revert())
    }
  }, [scope])
}

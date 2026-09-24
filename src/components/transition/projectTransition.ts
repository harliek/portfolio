import type { MouseEvent } from 'react'
import { MOTION } from '../../config/motion'
import { getImage, srcSet } from '../../content/media'
import { projectForPath } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { prefetchRoute } from '../../routes'

type Gsap = typeof import('gsap').gsap
type Tween = ReturnType<Gsap['to']>

/**
 * Image continuity when a project is opened (a carousel tile, a next-project
 * link):
 *
 * 1. a flat copy of the clicked cover is laid exactly over it (fixed, outside
 *    React, aria-hidden) and the route changes at once; the copy stays on
 *    screen while the old page is replaced, so there is no blank beat and the
 *    site never fades to black;
 * 2. the destination's opening image (`[data-case-hero]`, hidden meanwhile
 *    via `isTransitionPending`) is waited for until it has decoded;
 * 3. the copy travels into the opening image's box; it has dissolved before
 *    the opening image fades in (MOTION.route.continuityMs, ≈280ms), so two
 *    different images are never seen at half opacity together (a portrait
 *    cover and a landscape screenshot would double-expose).
 *
 * Hovering or focusing a project link warms everything the transition needs
 * (warmProject): the route's code, GSAP (loaded on demand, not part of the
 * entry bundle) and the destination's opening image, so the wait in step 2
 * is usually just a decode and the whole move stays within 300–450ms.
 *
 * If the destination image is not ready within MOTION.route.heroWaitMs, or
 * it is off screen, the copy simply fades. Back/Forward or another
 * navigation cancels everything. Reduced motion: ordinary navigation.
 */

let gsapPromise: Promise<Gsap | null> | null = null

/** GSAP, loaded once on demand (null if it cannot be loaded; the page then simply appears). */
function loadGsap() {
  gsapPromise ??= import('gsap').then(
    (m) => m.gsap,
    () => {
      gsapPromise = null
      return null
    },
  )
  return gsapPromise
}

const warmed = new Set<string>()

/**
 * Prepares a project transition ahead of the click: the route chunk, GSAP and
 * the destination's opening image (a preload with the same srcset and sizes
 * as the hero, so the browser picks the same file). Idempotent.
 */
export function warmProject(path: string) {
  prefetchRoute(path)
  if (prefersReducedMotion()) return
  void loadGsap()
  const project = projectForPath(path)
  if (!project || warmed.has(path)) return
  warmed.add(path)
  const asset = getImage(project.hero.image)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.type = 'image/avif'
  link.setAttribute('imagesrcset', srcSet(asset, 'avif'))
  link.setAttribute('imagesizes', project.hero.sizes)
  document.head.appendChild(link)
}

interface Active {
  path: string
  overlay: HTMLImageElement
  hero: HTMLElement | null
  frame: number
  timer: number
  tweens: Tween[]
  gsap: Gsap | null
}

let active: Active | null = null

/** True while a transition into `path` is waiting for its opening image (the hero renders hidden). */
export function isTransitionPending(path: string) {
  return active?.path === path
}

export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

function teardown() {
  const t = active
  if (!t) return
  active = null
  cancelAnimationFrame(t.frame)
  window.clearTimeout(t.timer)
  t.tweens.forEach((tw) => tw.kill())
  t.overlay.remove()
  if (t.hero) {
    delete t.hero.dataset.transitionPending
    t.hero.style.removeProperty('opacity')
  }
  window.removeEventListener('popstate', teardown)
}

/** Wait until an image has decoded (or failed), whichever comes first. */
function whenDecoded(img: HTMLImageElement | null): Promise<void> {
  if (!img) return Promise.resolve()
  if (img.complete && img.naturalWidth) return img.decode().catch(() => {})
  return new Promise((resolve) => {
    const done = () => resolve()
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(done), { once: true })
    img.addEventListener('error', done, { once: true })
  })
}

function fadeOut(t: Active) {
  const { fallbackFadeMs } = MOTION.route
  const gsap = t.gsap
  if (!gsap) {
    teardown()
    return
  }
  if (t.hero) {
    delete t.hero.dataset.transitionPending
    t.tweens.push(gsap.fromTo(t.hero, { opacity: 0 }, { opacity: 1, duration: fallbackFadeMs / 1000, ease: 'power1.out', clearProps: 'opacity' }))
  }
  t.tweens.push(gsap.to(t.overlay, { opacity: 0, duration: fallbackFadeMs / 1000, ease: 'power1.out', onComplete: teardown }))
}

function fly(t: Active, hero: HTMLElement, from: DOMRect) {
  if (active !== t) return
  const to = hero.getBoundingClientRect()
  const onScreen = to.width > 0 && to.bottom > 0 && to.top < window.innerHeight
  if (!onScreen) {
    fadeOut(t)
    return
  }
  const gsap = t.gsap
  if (!gsap) {
    teardown()
    return
  }
  const { continuityMs, continuityEase, overlayFadeShare, heroFadeFrom } = MOTION.route
  const d = continuityMs / 1000
  // Uniform scale (no distortion): match the destination's height, centred on it.
  const scale = Math.min(to.height / from.height, to.width / from.width)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  delete hero.dataset.transitionPending
  // The copy has dissolved (first part of the move) before the opening image
  // appears (last part), so the two images never sit at half opacity together.
  t.tweens.push(
    gsap.to(t.overlay, { x: dx, y: dy, scale, duration: d, ease: continuityEase, onComplete: teardown }),
    gsap.to(t.overlay, { opacity: 0, duration: d * overlayFadeShare, ease: 'power1.in' }),
    gsap.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: d * (1 - heroFadeFrom), delay: d * heroFadeFrom, ease: 'power1.out', clearProps: 'opacity' }),
  )
}

export interface OpenProjectOptions {
  path: string
  /** The clicked element containing the cover image. */
  source: HTMLElement | null
  navigate: (path: string) => void
}

export function openProject({ path, source, navigate }: OpenProjectOptions) {
  warmProject(path)
  teardown()
  const img = source?.querySelector('img') ?? null
  const from = img?.getBoundingClientRect()
  if (prefersReducedMotion() || !img || !from || !img.complete || !img.naturalWidth || from.width < 8) {
    navigate(path)
    return
  }

  const overlay = document.createElement('img')
  overlay.src = img.currentSrc || img.src
  overlay.alt = ''
  overlay.decoding = 'sync'
  overlay.draggable = false
  overlay.className = 'transition-image'
  overlay.setAttribute('aria-hidden', 'true')
  Object.assign(overlay.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` })
  document.body.appendChild(overlay)

  const previousHero = document.querySelector<HTMLElement>('[data-case-hero]')
  const t: Active = { path, overlay, hero: null, frame: 0, timer: 0, tweens: [], gsap: null }
  active = t
  window.addEventListener('popstate', teardown)
  t.timer = window.setTimeout(() => {
    if (active !== t) return
    void loadGsap().then((gsap) => {
      if (active !== t) return
      t.gsap = gsap
      fadeOut(t)
    })
  }, MOTION.route.heroWaitMs)

  navigate(path)

  const poll = () => {
    if (active !== t) return
    const hero = document.querySelector<HTMLElement>('[data-case-hero]')
    if (hero && hero !== previousHero && window.location.pathname === path) {
      t.hero = hero
      hero.dataset.transitionPending = 'true'
      void Promise.all([whenDecoded(hero.querySelector('img')), loadGsap()]).then(([, gsap]) => {
        if (active !== t) return
        window.clearTimeout(t.timer)
        t.gsap = gsap
        fly(t, hero, from)
      })
      return
    }
    t.frame = requestAnimationFrame(poll)
  }
  t.frame = requestAnimationFrame(poll)
}

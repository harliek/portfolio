import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { CAROUSEL } from '../../config/carousel'
import { MOTION } from '../../config/motion'
import type { ProjectId } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { router } from '../../routes'

/**
 * Shared-poster project opening (homepage spatial carousel → case study).
 *
 * One flat, aria-hidden <img> of the project's cover is laid over the centred
 * card's media, the source media is hidden, the homepage fades, and the route
 * changes. When the case study mounts, its hero (`[data-shared-hero]`) is kept
 * hidden (`data-transition-pending`) while the poster travels into the hero
 * frame with a transform-only FLIP tween; then the hero is revealed and the
 * poster removed. Anything unexpected (another navigation of any kind,
 * Back/Forward, resize, scroll, a slow chunk, an unmount) ends it safely: no
 * poster left on screen, no hidden hero, no paused carousel, and the user's
 * own navigation always wins over ours.
 *
 * Only one transition exists at a time; state lives at module level because it
 * spans two routes. Reverse travel is intentionally not implemented.
 */

/**
 * preparing  → poster placed, homepage fading, waiting for the fade + chunk
 * navigating → router navigation started, waiting for the hero to mount
 * flying     → poster travelling into the hero
 * fallback   → chunk was slow: ordinary navigation, poster gone, homepage kept
 *              faded until the case study replaces it
 */
type Phase = 'preparing' | 'navigating' | 'flying' | 'fallback'

interface ActiveTransition {
  id: ProjectId
  path: string
  phase: Phase
  overlay: HTMLImageElement
  source: HTMLElement
  fade: gsap.core.Tween | null
  travel: gsap.core.Tween | null
  hero: HTMLElement | null
  /** window.scrollY when the travel was measured. */
  scrollY: number
  timers: number[]
  frames: number[]
  onCancel: () => void
  removeListeners: () => void
}

let active: ActiveTransition | null = null

export interface BeginTransitionOptions {
  id: ProjectId
  path: string
  /** The centred card's media box (flat, facing the viewer). */
  media: HTMLElement
  /** Elements faded out while the poster detaches (neighbours, page sections). */
  fade: Element[]
  /** Clicks inside this element belong to the opener (the carousel stage). */
  scope: Element | null
  /** Resolves when the destination route chunk is loaded. */
  ready: Promise<unknown>
  navigate: (path: string, state?: { transition: ProjectId }) => void
  /** Called whenever the transition ends without landing, to resume the carousel if it is still mounted. */
  onCancel: () => void
}

const OVERLAY_ATTR = 'data-transition-overlay'

interface WatchHandlers {
  /** The user went (or is going) somewhere other than `path`. */
  onOther: () => void
  /** A navigation to `path` has committed. */
  onArrive?: () => void
}

/**
 * While a project is being opened, reports the first sign that the user has
 * chosen to go somewhere else: any router navigation (link, Back/Forward,
 * programmatic) toward a location other than `path`, even while its route
 * chunk is still loading, or a plain same-tab click on another link outside
 * `scope` (the header's in-page "Work" link never reaches the router).
 * Modified clicks, new-tab links and links to `path` itself are ignored.
 * Returns a function that stops watching.
 */
export function watchForOtherNavigation(path: string, scope: Element | null, { onOther, onArrive }: WatchHandlers): () => void {
  const startKey = router.state.location.key
  let stopped = false
  const other = () => {
    if (!stopped) onOther()
  }
  const unsubscribe = router.subscribe((state) => {
    const pending = state.navigation.location
    if (pending && pending.pathname !== path) other()
    else if (state.location.key !== startKey) {
      if (state.location.pathname !== path) other()
      else if (state.navigation.state === 'idle' && !stopped) onArrive?.()
    }
  })
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null
    if (!link || scope?.contains(link) || link.hasAttribute('download')) return
    if ((link.target && link.target !== '_self') || !/^https?:$/.test(link.protocol)) return
    if (link.origin === window.location.origin && link.pathname === path) return
    other()
  }
  document.addEventListener('click', onClick, true)
  window.addEventListener('popstate', other)
  return () => {
    stopped = true
    unsubscribe()
    document.removeEventListener('click', onClick, true)
    window.removeEventListener('popstate', other)
  }
}

function clearTimers(t: ActiveTransition) {
  t.timers.forEach((id) => window.clearTimeout(id))
  t.frames.forEach((id) => cancelAnimationFrame(id))
  t.timers = []
  t.frames = []
}

/**
 * Removes every trace of the transition. `landed` = the destination is on
 * screen (the homepage is being replaced, so its fade is left as is);
 * otherwise the homepage is restored and the carousel resumes.
 */
function teardown(landed = false) {
  const t = active
  if (!t) return
  active = null
  clearTimers(t)
  t.removeListeners()
  t.travel?.kill()
  // revert() restores the faded elements' previous inline opacity.
  if (landed) t.fade?.kill()
  else t.fade?.revert()
  t.overlay.remove()
  if (t.hero) delete t.hero.dataset.transitionPending
  t.source.style.visibility = ''
  if (!landed) t.onCancel()
}

/** Abandons any transition in progress (e.g. the user navigated elsewhere). */
export function cancelProjectTransition() {
  teardown()
}

/** Cancels only a transition that has not navigated yet (the homepage is unmounting). */
export function cancelPreparingTransition() {
  if (active?.phase === 'preparing') teardown()
}

/**
 * Ordinary navigation without travel (slow or failed chunk, resize): the
 * poster goes, but the already faded homepage stays faded until the case study
 * replaces it, so the page never snaps back in the meantime. It is restored if
 * the user goes elsewhere or the route has not arrived after landTimeoutMs.
 */
function fallBack(t: ActiveTransition, navigate: BeginTransitionOptions['navigate']) {
  if (active !== t || t.phase !== 'preparing') return
  clearTimers(t)
  t.phase = 'fallback'
  t.overlay.remove()
  t.source.style.visibility = ''
  navigate(t.path)
  t.timers.push(window.setTimeout(() => active === t && teardown(), CAROUSEL.transition.landTimeoutMs))
}

/**
 * Starts the forward transition. Returns false when it cannot run (reduced
 * motion, another transition active, media not ready); the caller then uses
 * ordinary navigation.
 */
export function beginProjectTransition(opts: BeginTransitionOptions): boolean {
  if (active || prefersReducedMotion()) return false
  const img = opts.media.querySelector('img')
  const rect = opts.media.getBoundingClientRect()
  if (!img || !img.complete || !img.naturalWidth || rect.width < 1 || rect.height < 1) return false
  const startKey = router.state.location.key

  // 4. One flat poster, outside the React tree so it survives the route change.
  const overlay = document.createElement('img')
  overlay.src = img.currentSrc || img.src
  overlay.alt = ''
  overlay.decoding = 'sync'
  overlay.draggable = false
  overlay.className = 'transition-poster'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.setAttribute(OVERLAY_ATTR, opts.id)
  overlay.style.left = `${rect.left}px`
  overlay.style.top = `${rect.top}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  document.body.appendChild(overlay)

  const onResize = () => {
    const t = active
    if (!t) return
    // Still on the homepage: keep the user's intent, drop the travel.
    if (t.phase === 'preparing') fallBack(t, opts.navigate)
    else if (t.phase !== 'fallback') teardown()
  }
  const onScroll = () => {
    const t = active
    if (t?.phase === 'flying' && Math.abs(window.scrollY - t.scrollY) > 2) teardown()
  }
  const stopWatching = watchForOtherNavigation(opts.path, opts.scope, {
    onOther: () => teardown(),
    onArrive: () => {
      if (active?.phase === 'fallback') teardown(true)
    },
  })
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, { passive: true })

  const t: ActiveTransition = {
    id: opts.id,
    path: opts.path,
    phase: 'preparing',
    overlay,
    source: opts.media,
    fade: null,
    travel: null,
    hero: null,
    scrollY: 0,
    timers: [],
    frames: [],
    onCancel: opts.onCancel,
    removeListeners: () => {
      stopWatching()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    },
  }
  active = t
  upgradePoster(img, t)

  // 5. Hide the duplicate source visual; 6. fade everything else.
  opts.media.style.visibility = 'hidden'
  if (opts.fade.length) {
    t.fade = gsap.to(opts.fade, {
      opacity: 0,
      duration: MOTION.sharedTransition.neighbourFade,
      ease: 'power1.out',
    })
  }

  // 7. Navigate once the fade is done and the chunk is ready; if the chunk is
  // slow, fall back to ordinary navigation without travel.
  let chunkReady = false
  let faded = false
  const go = () => {
    if (active !== t || t.phase !== 'preparing' || !chunkReady || !faded) return
    // Belt and braces: never override a navigation the user has started.
    const { navigation, location } = router.state
    if (navigation.state !== 'idle' || location.key !== startKey) {
      teardown()
      return
    }
    clearTimers(t)
    t.phase = 'navigating'
    opts.navigate(opts.path, { transition: opts.id })
    // If the destination never lands (interrupted navigation), clean up.
    t.timers.push(window.setTimeout(() => active === t && teardown(), CAROUSEL.transition.landTimeoutMs))
  }
  opts.ready.then(
    () => {
      chunkReady = true
      go()
    },
    () => fallBack(t, opts.navigate),
  )
  t.timers.push(
    window.setTimeout(() => {
      faded = true
      go()
    }, MOTION.sharedTransition.neighbourFade * 1000),
    window.setTimeout(() => {
      if (!chunkReady) fallBack(t, opts.navigate)
    }, CAROUSEL.transition.chunkTimeoutMs),
  )
  return true
}

/**
 * The card's image was chosen for a ~424px card; the poster ends at hero size.
 * Load the same cover (same format) at hero width and swap it in once decoded,
 * so the poster is sharp when it lands (and the hero's image is warmed up).
 */
function upgradePoster(img: HTMLImageElement, t: ActiveTransition) {
  const current = img.currentSrc || img.src
  const ext = current.split(/[?#]/)[0].split('.').pop()
  const source = img.closest('picture')?.querySelector(`source[type="image/${ext}"]`)
  const srcset = source?.getAttribute('srcset') ?? img.getAttribute('srcset')
  if (!srcset) return
  const mediaMax = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--media-max')) || window.innerWidth
  const hi = new Image()
  hi.decoding = 'async'
  hi.sizes = `${Math.round(Math.min(window.innerWidth, mediaMax))}px`
  hi.srcset = srcset
  hi.decode().then(
    () => {
      if (active === t && hi.currentSrc && hi.currentSrc !== t.overlay.currentSrc) t.overlay.src = hi.currentSrc
    },
    () => {},
  )
}

/** Reveals the destination hero and removes the poster in the same frame. */
function finish(t: ActiveTransition) {
  if (active === t) teardown(true)
}

/** Waits (briefly) for the hero image so the reveal never shows an empty frame. */
function whenImageReady(frame: Element, t: ActiveTransition, done: () => void) {
  const img = frame.querySelector('img')
  if (!img || (img.complete && img.naturalWidth > 0)) {
    done()
    return
  }
  let settled = false
  const once = () => {
    if (settled) return
    settled = true
    done()
  }
  t.timers.push(window.setTimeout(once, CAROUSEL.transition.imageWaitMs))
  img.decode().then(once, once)
}

/**
 * Destination side: claims the in-flight poster for this hero. Hides the hero
 * frame before first paint (called from a layout effect), then — once scroll
 * restoration has moved the page to the top — measures the hero frame and
 * tweens the poster into it.
 */
function land(id: ProjectId, hero: HTMLElement): boolean {
  const t = active
  if (!t || t.id !== id) return false
  // StrictMode re-runs effects on the same node: keep the flight going.
  if (t.phase === 'flying') return t.hero === hero
  if (t.phase !== 'navigating') return false

  clearTimers(t)
  t.phase = 'flying'
  t.hero = hero
  hero.dataset.transitionPending = 'true'

  t.frames.push(
    requestAnimationFrame(() => {
      if (active !== t) return
      const frame = hero.querySelector<HTMLElement>('.case-hero__figure .media-frame')
      // An instant scroll also stops any smooth scroll still running from the homepage.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      const to = frame?.getBoundingClientRect()
      const from = t.overlay.getBoundingClientRect()
      if (!frame || !to || to.width < 1 || to.height < 1) {
        finish(t)
        return
      }
      t.scrollY = window.scrollY
      const radius = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0
      const sx = from.width / to.width
      const sy = from.height / to.height

      // FLIP: lay the poster out once at its final rect, then tween only the
      // transform (and the counter-scaled corner radius) back to identity.
      const s = t.overlay.style
      s.left = `${to.left}px`
      s.top = `${to.top}px`
      s.width = `${to.width}px`
      s.height = `${to.height}px`
      t.travel = gsap.fromTo(
        t.overlay,
        {
          x: from.left - to.left,
          y: from.top - to.top,
          scaleX: sx,
          scaleY: sy,
          transformOrigin: '0 0',
          borderRadius: radius / Math.max(0.01, sx),
          force3D: true,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          borderRadius: radius,
          duration: MOTION.sharedTransition.duration,
          ease: MOTION.sharedTransition.ease,
          onComplete: () => whenImageReady(frame, t, () => finish(t)),
        },
      )
    }),
  )
  return true
}

/** The hero element was removed while the poster was travelling. */
function abandonHero(hero: HTMLElement) {
  if (active?.hero === hero) teardown()
}

/**
 * Used by the case-study header: if a shared-poster transition is heading to
 * this project, hide the hero frame until the poster lands on it.
 */
export function useSharedHeroLanding(id: ProjectId, heroRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const hero = heroRef.current
    if (!hero || !land(id, hero)) return
    return () => {
      // StrictMode's simulated unmount keeps the node connected; only a real
      // unmount (another navigation mid-flight) abandons the travel.
      queueMicrotask(() => {
        if (!hero.isConnected) abandonHero(hero)
      })
    }
  }, [id, heroRef])
}

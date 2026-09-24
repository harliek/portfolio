import type { MouseEvent } from 'react'
import { TRANSITION } from '../../config/carousel'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { projectForPath } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { prefetchRoute, routeChunks } from '../../routes'

/**
 * Opening a project.
 *
 * From a carousel tile (the element passed as `source` carries
 * `data-transition="tile"`, the tile's inner wrapper):
 *
 * 1. the carousel freezes (ConcaveCarousel does this when openProject
 *    returns 'tile'); the tile comes a little forward while it fades out
 *    (TRANSITION in config/carousel.ts). No turn or flip, and no copy of the
 *    tile travels over the new page;
 * 2. the route changes once that has finished and the route's code has
 *    loaded, and never later than TRANSITION.navigateCapMs after the click
 *    (a failed chunk still navigates: RouteError handles it);
 * 3. on the new page, the opening frame (`[data-case-hero]`, rendered hidden
 *    while `isTransitionPending(path)`) appears in place once its image has
 *    decoded (at most TRANSITION.heroWaitMs), with a short opacity and 1.5%
 *    scale reveal. Its space is reserved by the page layout, and nothing is
 *    ever laid over the new page: no floating copy crosses its text.
 *
 * From anything else (e.g. a next-project link): step 3 alone.
 *
 * Rapid clicks are ignored while a tile is leaving. Back/Forward or another
 * navigation before the route change cancels it and restores the tile;
 * after the route change it simply completes the reveal. Reduced motion:
 * ordinary navigation. Modifier and middle clicks stay native (isPlainClick).
 * Every inline style or animation this module adds is removed when it ends.
 */

/** Warmed opening images, by path (kept so a detached image is never collected mid-load). */
const warmed = new Map<string, HTMLImageElement>()

/**
 * Opening images of the pages a carousel tile opens that are not case
 * studies. /about opens on the portrait (AboutContent.tsx: keep the `sizes`
 * in step).
 */
const PAGE_HEROES: Record<string, { image: ImageId; sizes: string }> = {
  '/about': { image: 'headshot', sizes: '(min-width: 960px) 344px, 240px' },
}

/**
 * Fetches and decodes an image exactly as the page's ResponsiveImage will
 * (a detached <picture> with the same AVIF/WebP sources, fallback and
 * `sizes`, so the browser picks the same file for this viewport). Unlike a
 * <link rel="preload">, it does not warn when nobody clicks.
 */
function warmImage(image: ImageId, sizes: string): HTMLImageElement {
  const asset = getImage(image)
  const picture = document.createElement('picture')
  for (const format of ['avif', 'webp'] as const) {
    const source = document.createElement('source')
    source.type = `image/${format}`
    source.srcset = srcSet(asset, format)
    source.sizes = sizes
    picture.appendChild(source)
  }
  // Inside the <picture> before any attribute is set, so only the chosen source is requested.
  const img = document.createElement('img')
  picture.appendChild(img)
  img.decoding = 'async'
  img.sizes = sizes
  img.srcset = srcSet(asset, asset.fallback)
  img.src = fallbackSrc(asset)
  img.decode().catch(() => {})
  return img
}

/**
 * Prepares a destination ahead of the click (hover, focus, touch start):
 * the route's code and its opening image (projects.ts `hero`, or
 * PAGE_HEROES), fetched and decoded, so the transition's "decoded before
 * reveal" step finds it ready. Idempotent.
 */
export function warmProject(path: string) {
  prefetchRoute(path)
  if (warmed.has(path)) return
  const hero = projectForPath(path)?.hero ?? PAGE_HEROES[path]
  if (!hero) return
  warmed.set(path, warmImage(hero.image, hero.sizes))
}

export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

type Phase = 'leave' | 'pending' | 'reveal'

interface Active {
  path: string
  /** The pathname the transition started from (a different one means someone navigated elsewhere). */
  from: string
  phase: Phase
  tile: HTMLElement | null
  hero: HTMLElement | null
  /** The opening frame of the page being left (ignored while looking for the new one). */
  previousHero: Element | null
  revealMs: number
  anims: Animation[]
  timers: number[]
  frame: number
  onCancel?: () => void
}

let active: Active | null = null

/** True while a transition into `path` has not revealed its opening frame yet (the hero renders hidden). */
export function isTransitionPending(path: string) {
  return active !== null && active.path === path && active.phase !== 'reveal'
}

/*
 * The destination of the running transition, for components that should
 * change ahead of the route (StageBackground applies the destination's
 * darker reading shade while the tile leaves, so it is complete before any
 * destination text appears). Read with useSyncExternalStore.
 */
const targetListeners = new Set<() => void>()
let target: string | null = null

function setTarget(path: string | null) {
  if (target === path) return
  target = path
  targetListeners.forEach((listener) => listener())
}

/** Subscribes to changes of `transitionTarget()`. */
export function subscribeTransitionTarget(listener: () => void) {
  targetListeners.add(listener)
  return () => {
    targetListeners.delete(listener)
  }
}

/** The pathname a transition is opening (from the click until the reveal ends), or null. */
export const transitionTarget = () => target

const onPopState = () => {
  if (!active) return
  if (active.phase === 'leave') cancel()
  else finish()
}

/** Ends the transition and removes everything it added (the new page stays as it is). */
function finish() {
  const t = active
  if (!t) return
  active = null
  cancelAnimationFrame(t.frame)
  t.timers.forEach((id) => window.clearTimeout(id))
  // Cancelling restores the tile if the old page is somehow still shown
  // (after the route change it has unmounted, so this has no visible effect).
  t.anims.forEach((a) => a.cancel())
  if (t.hero) delete t.hero.dataset.transitionPending
  window.removeEventListener('popstate', onPopState)
  setTarget(null)
}

/** Stops a transition before the route change and restores the tile (its animations are cancelled). */
function cancel() {
  const t = active
  if (!t) return
  finish()
  t.onCancel?.()
}

const wait = (t: Active, ms: number) =>
  new Promise<void>((resolve) => {
    t.timers.push(window.setTimeout(resolve, ms))
  })

/** Resolves when an image has decoded, failed, or is missing. */
function whenDecoded(img: HTMLImageElement | null): Promise<void> {
  if (!img) return Promise.resolve()
  if (img.complete) return img.naturalWidth ? img.decode().catch(() => {}) : Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(() => resolve()), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

/** The route's code (resolves on failure too: RouteError handles a failed chunk after navigation). */
function loadChunk(path: string): Promise<void> {
  const load = (routeChunks as Record<string, (() => Promise<unknown>) | undefined>)[path]
  if (!load) return Promise.resolve()
  return load().then(
    () => undefined,
    () => undefined,
  )
}

/** Step 3: find the new page's opening frame, wait for its image, reveal it in place. */
function revealDestination(t: Active) {
  const started = performance.now()
  const poll = () => {
    if (active !== t) return
    const hero = Array.from(document.querySelectorAll<HTMLElement>('[data-case-hero]')).find((h) => h !== t.previousHero)
    if (hero && window.location.pathname === t.path) {
      t.hero = hero
      hero.dataset.transitionPending = 'true'
      void Promise.race([whenDecoded(hero.querySelector('img')), wait(t, TRANSITION.heroWaitMs)]).then(() => {
        if (active !== t) return
        t.phase = 'reveal'
        delete hero.dataset.transitionPending
        const box = hero.getBoundingClientRect()
        if (box.width === 0 || box.bottom < 0 || box.top > window.innerHeight) {
          finish()
          return
        }
        const anim = hero.animate(
          [
            { opacity: 0, transform: `scale(${TRANSITION.revealScale})` },
            { opacity: 1, transform: 'none' },
          ],
          { duration: t.revealMs, easing: TRANSITION.ease },
        )
        t.anims.push(anim)
        anim.finished.then(
          () => {
            if (active === t) finish()
          },
          () => {},
        )
      })
      return
    }
    if (performance.now() - started > TRANSITION.heroFindMs) {
      finish()
      return
    }
    t.frame = requestAnimationFrame(poll)
  }
  t.frame = requestAnimationFrame(poll)
}

function start(path: string, phase: Phase, tile: HTMLElement | null, revealMs: number, onCancel?: () => void): Active {
  const t: Active = {
    path,
    from: window.location.pathname,
    phase,
    tile,
    hero: null,
    previousHero: document.querySelector('[data-case-hero]'),
    revealMs,
    anims: [],
    timers: [],
    frame: 0,
    onCancel,
  }
  active = t
  window.addEventListener('popstate', onPopState)
  setTarget(path)
  return t
}

export interface OpenProjectOptions {
  path: string
  /** The clicked tile's inner wrapper (`data-transition="tile"`), or any other element (plain reveal). */
  source?: HTMLElement | null
  navigate: (path: string) => void
  /** Called if a tile transition is cancelled before the route change (Back, another navigation). */
  onCancel?: () => void
}

/**
 * Opens a project with the transition described above.
 * Returns 'tile' when the tile sequence started (the caller freezes the
 * carousel), 'reveal' for a plain opening-frame reveal, 'plain' for an
 * ordinary navigation, 'ignored' when a tile transition is already running.
 */
export function openProject({ path, source, navigate, onCancel }: OpenProjectOptions): 'tile' | 'reveal' | 'plain' | 'ignored' {
  if (active?.phase === 'leave') return 'ignored'
  // A reveal still running on the current page completes at once.
  finish()
  warmProject(path)

  if (prefersReducedMotion()) {
    navigate(path)
    return 'plain'
  }

  const tile = source?.dataset.transition === 'tile' ? source : null
  const box = tile?.getBoundingClientRect()
  if (!tile || !box || box.width < 8 || box.bottom < 0 || box.top > window.innerHeight) {
    const t = start(path, 'pending', null, TRANSITION.plainRevealMs)
    navigate(path)
    revealDestination(t)
    return 'reveal'
  }

  const t = start(path, 'leave', tile, TRANSITION.revealMs, onCancel)
  const { leaveMs, leaveScale, leaveLift } = TRANSITION
  // From wherever the hover lift left it: a short move forward, fading out.
  const current = getComputedStyle(tile).transform
  const anim = tile.animate(
    [
      { transform: current === 'none' ? 'translateY(0) scale(1)' : current, opacity: 1 },
      { offset: 0.45, transform: `translateY(${-leaveLift}px) scale(${leaveScale})`, opacity: 1 },
      { transform: `translateY(${-leaveLift - 4}px) scale(${leaveScale + 0.03})`, opacity: 0 },
    ],
    // Stays hidden (forwards) until the old page unmounts; cancel() restores it.
    { duration: leaveMs, easing: TRANSITION.ease, fill: 'forwards' },
  )
  t.anims.push(anim)

  const ready = Promise.all([
    anim.finished.then(
      () => undefined,
      () => undefined,
    ),
    loadChunk(path),
  ])
  void Promise.race([ready, wait(t, TRANSITION.navigateCapMs)]).then(() => {
    if (active !== t) return
    if (window.location.pathname !== t.from) {
      // Someone navigated elsewhere meanwhile: stay there.
      cancel()
      return
    }
    t.phase = 'pending'
    navigate(path)
    revealDestination(t)
  })
  return 'tile'
}

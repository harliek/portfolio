import type { MouseEvent } from 'react'
import { TRANSITION } from '../../config/transition'
import { ACCENTS } from '../../content/accents'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { projectForPath } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { prefetchRoute, routeChunks, router } from '../../routes'
import { coverItem, coverItemForPath } from './coverGeometry'
import './transition.css'

/**
 * Opening a project: "move closer" (spec/motion-plan.md P3), never an empty
 * scene. The chosen PNG advances into its place on the new page while the
 * rest of the scene steps back, and the new page's heading and opening media
 * arrive in the same 420ms (MOTION.t.move, arrive curve, no overshoot).
 *
 * 1. Wait. The page being left stays exactly as it is (the caller freezes
 *    the carousel when openProject returns 'cover') while the destination's
 *    code loads and its cover object and opening media (projects.ts `hero`)
 *    decode, usually already done on hover or focus (warmProject). Nothing
 *    fades, nothing is hidden. A longer wait (a slow connection) shows a thin
 *    line in the destination's accent across the top, so the click is
 *    visibly under way.
 * 2. Change, in one view transition (document.startViewTransition): the
 *    browser keeps pictures of the page being left, the route changes
 *    synchronously underneath them, and then, together:
 *    - the chosen object advances: from a PNG marked
 *      `data-cover-source="<id>"` (a gallery object, the portrait anchor, a
 *      next-project thumbnail), a copy of the clicked image (its file, glow,
 *      3D turn, fade and crop) stands in for it, and the browser moves it
 *      into the destination's `[data-cover-slot="<id>"]` (CoverSlot.tsx)
 *      with a uniform scale (both boxes have the artwork's proportions, so it
 *      is never stretched; a turned object straightens on the way, it never
 *      flips);
 *    - the rest of the scene steps back (stepBack): every other PNG object in
 *      view shrinks towards its floor, rises a little towards the horizon,
 *      converges slightly on the chosen one and dims away, and the rest of
 *      the old content eases back and clears;
 *    - the new page's content (its heading and opening media included, live)
 *      arrives in front of all that, and behind the header and the moving
 *      object;
 *    - the room (the same background video on both pages) cross-fades with
 *      itself, complementary and blended additively, so it stays whole and
 *      never dims towards black.
 *    The page never waits for the move. Focus then lands on the new page's
 *    H1 (RouteFocus).
 *
 * Without a slot on screen the copy simply leaves with the old page. From a
 * text link (the Work shelf) or a source that is not a loaded, visible PNG,
 * nothing advances; the scene still steps back while the new page arrives.
 * Browsers without view transitions, reduced motion and a failed or very slow
 * chunk get an ordinary navigation (the old page still stays until the new
 * one is ready: react-router keeps it while the lazy route loads). Direct
 * loads are untouched.
 *
 * Rapid clicks are ignored until the change has finished. Back/Forward (or
 * another navigation) while waiting cancels it and restores the source
 * (onCancel lets the carousel resume); during the change it ends the
 * animation at once. TRANSITION.hardCapMs ends any animation. Modifier and
 * middle clicks stay native (isPlainClick).
 */

// ---------------------------------------------------------------------------
// Warming a destination
// ---------------------------------------------------------------------------

interface Warm {
  /** Kept so a detached image is never collected mid-load. */
  images: HTMLImageElement[]
  /** The cover object at the slot's size, decoded. */
  cover: Promise<void>
  /** The opening media (projects.ts `hero`, or TRANSITION.openingMedia), decoded. */
  opening: Promise<void>
}

const warmed = new Map<string, Warm>()

/**
 * Fetches and decodes an image exactly as the page's ResponsiveImage will
 * (a detached <picture> with the same AVIF/WebP sources, fallback and
 * `sizes`, so the browser picks the same file for this viewport). Unlike a
 * <link rel="preload">, it does not warn when nobody clicks.
 */
function warmImage(image: ImageId, sizes: string): { img: HTMLImageElement; ready: Promise<void> } {
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
  return { img, ready: img.decode().catch(() => {}) }
}

/**
 * Prepares a destination ahead of the click (hover, focus, touch start):
 * the route's code, its cover object at the slot's size and its opening
 * media (projects.ts `hero`), fetched and decoded. Idempotent.
 */
export function warmProject(path: string) {
  prefetchRoute(path)
  if (warmed.has(path)) return
  const images: HTMLImageElement[] = []
  let cover = Promise.resolve()
  const item = coverItemForPath(path)
  if (item) {
    const asset = getImage(item.image)
    const sizes = TRANSITION.slotSizes[path] ?? `${Math.round((TRANSITION.caseCoverHeights[item.kind] * asset.width) / asset.height)}px`
    const warm = warmImage(item.image, sizes)
    images.push(warm.img)
    cover = warm.ready
  }
  // The page's opening media (projects.ts `hero`), only the crops this viewport shows.
  const opening = TRANSITION.openingMedia[path] ?? projectForPath(path)?.hero ?? []
  const openings = opening.filter((o) => !o.media || window.matchMedia(o.media).matches).map(({ image, sizes }) => warmImage(image, sizes))
  images.push(...openings.map((w) => w.img))
  warmed.set(path, { images, cover, opening: Promise.all(openings.map((w) => w.ready)).then(() => {}) })
}

export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** The view-transition-name shared by the moving copy (old state) and the destination slot (new state). */
const COVER_NAME = 'hk-cover'

type Mode = 'cover' | 'fade'
/** wait: the old page stays while the destination loads · change: the view transition runs. */
type Phase = 'wait' | 'change'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Run {
  mode: Mode
  path: string
  /** The pathname the transition started from (a different one while waiting means someone navigated elsewhere). */
  from: string
  phase: Phase
  /** Set when Back/Forward or another navigation stopped it: the pending route change must not happen. */
  cancelled: boolean
  /** The route change has been asked for (inside the view transition). */
  routed: boolean
  /** The element passed as the source (measured again when the change starts). */
  sourceArg: HTMLElement | null
  /** The `[data-cover-source]` element hidden while its copy stands in for it. */
  source: HTMLElement | null
  coverId: string | null
  clone: HTMLDivElement | null
  /** The slow-wait line (progressDelayMs), while shown. */
  progress: HTMLDivElement | null
  /** The destination element carrying COVER_NAME in the new state. */
  named: HTMLElement | null
  /** The other objects of the scene being left, each named `hk-back-<n>` while it steps back. */
  backs: HTMLElement[]
  vt: ViewTransition | null
  timers: number[]
  unsubscribe: (() => void) | null
  navigate: Navigate
  onCancel?: () => void
}

/**
 * The caller's navigate (react-router's useNavigate()): the route changes
 * through the very router the page renders from, with `flushSync` inside the
 * view transition so the new page is in the DOM when the browser pictures it.
 */
type Navigate = (path: string, options?: { flushSync?: boolean }) => void | Promise<void>

let run: Run | null = null

declare global {
  interface Window {
    /** Development only: the steps of recent transitions, for browser checks. */
    __pageTransitionLog?: [number, string, string?][]
    /** Development only: a slow-motion factor for inspecting the animation frame by frame. */
    __pageTransitionSlow?: number
    /** Development only: false runs the change without the scene stepping back (for comparisons). */
    __pageTransitionStepBack?: boolean
  }
}

/** Records a step in development (window.__pageTransitionLog). */
function trace(step: string, detail?: string) {
  if (!import.meta.env.DEV) return
  const log = (window.__pageTransitionLog ??= [])
  log.push([Math.round(performance.timeOrigin + performance.now()), step, detail])
  if (log.length > 200) log.splice(0, log.length - 200)
}

/** True while a transition into `path` is still waiting for its page (the old page is still shown). */
export function isTransitionPending(path: string) {
  return run !== null && run.path === path && run.phase === 'wait'
}

/*
 * The destination of the running transition, for components that should
 * change with the route (StageBackground). Set when the route changes inside
 * the view transition, cleared when it ends. Read with useSyncExternalStore.
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

/** The pathname a transition is changing to (while its view transition runs), or null. */
export const transitionTarget = () => target

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const supportsViewTransitions = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function'

/** A timer that only fires while `r` is still the running transition (all are cleared at the end). */
function later(r: Run, ms: number, fn: () => void) {
  r.timers.push(
    window.setTimeout(
      () => {
        if (run === r) fn()
      },
      Math.max(0, ms),
    ),
  )
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms))
  })

function objectPosition(value: string, freeX: number, freeY: number): [number, number] {
  const [x, y] = value.trim().split(/\s+/)
  const at = (v: string | undefined, free: number) => {
    if (v?.endsWith('%')) return (parseFloat(v) / 100) * free
    if (v?.endsWith('px')) return parseFloat(v)
    return free / 2
  }
  return [at(x, freeX), at(y, freeY)]
}

/**
 * The painted image inside `el` (or the image element itself), in viewport
 * px, with the image's own proportions: object-fit contain and
 * object-position are applied, and a projected (3D-turned, scaled) element
 * is reduced to one uniform scale about its visual centre. `ratio` (the
 * registered artwork's) is preferred to the element's natural size, which
 * srcset density correction rounds to whole pixels.
 */
function contentBox(el: Element, img: HTMLImageElement | null, ratio?: number): Box | null {
  const box = (img ?? el) as HTMLElement
  const rect = box.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return null
  const ow = box.offsetWidth || rect.width
  const oh = box.offsetHeight || rect.height
  const s = Math.sqrt((rect.width / ow) * (rect.height / oh))
  const natural = ratio ?? (img && img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0)
  let cw = ow
  let ch = oh
  let dx = 0
  let dy = 0
  const fit = img ? getComputedStyle(img) : null
  if (natural && (!fit || fit.objectFit === 'contain' || fit.objectFit === 'scale-down')) {
    if (ow / oh > natural) cw = oh * natural
    else ch = ow / natural
    const [px, py] = fit ? objectPosition(fit.objectPosition, ow - cw, oh - ch) : [(ow - cw) / 2, (oh - ch) / 2]
    dx = px + cw / 2 - ow / 2
    dy = py + ch / 2 - oh / 2
  }
  const cx = rect.left + rect.width / 2 + dx * s
  const cy = rect.top + rect.height / 2 + dy * s
  return { x: cx - (cw * s) / 2, y: cy - (ch * s) / 2, w: cw * s, h: ch * s }
}

/** The share of a box inside the viewport. */
function visibleShare(b: Box) {
  const w = Math.min(window.innerWidth, b.x + b.w) - Math.max(0, b.x)
  const h = Math.min(window.innerHeight, b.y + b.h) - Math.max(0, b.y)
  return w <= 0 || h <= 0 ? 0 : (w * h) / (b.w * b.h)
}

const toBox = (d: DOMRect): Box => ({ x: d.left, y: d.top, w: d.width, h: d.height })

/** The filters and opacity painted on `from` by itself and its ancestors up to (not including) `stop`. */
function paintedStyle(from: Element, stop: Element | null) {
  const filters: string[] = []
  let opacity = 1
  for (let el: Element | null = from; el && el !== stop && el !== document.body; el = el.parentElement) {
    const cs = getComputedStyle(el)
    if (cs.filter && cs.filter !== 'none') filters.push(cs.filter)
    opacity *= Number(cs.opacity)
  }
  return { filter: filters.join(' ') || 'none', opacity: Number.isFinite(opacity) ? opacity : 1 }
}

/** Resolves when an image has decoded, failed, or is missing. */
function imageReady(img: HTMLImageElement | null): Promise<void> {
  if (!img) return Promise.resolve()
  if (img.complete) return img.naturalWidth ? img.decode().catch(() => {}) : Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(() => resolve()), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

/**
 * Resolves once `old` (the route content being left, a child of <main>) has
 * been replaced by the new page, or after `ms`. The router's navigate()
 * settles as soon as its state has changed; React commits the new route a
 * moment later.
 */
function pageReplaced(old: Element | null, ms: number): Promise<void> {
  const parent = old?.parentElement
  if (!old || !parent || !old.isConnected) return Promise.resolve()
  return new Promise((resolve) => {
    let timer = 0
    const observer = new MutationObserver(() => {
      if (!old.isConnected) done()
    })
    const done = () => {
      observer.disconnect()
      window.clearTimeout(timer)
      resolve()
    }
    observer.observe(parent, { childList: true })
    timer = window.setTimeout(done, ms)
  })
}

/**
 * The new page's opening media: the largest image or video that can be seen
 * in the viewport, other than the cover slot (a poster underlay counts).
 */
function openingMedia(): HTMLImageElement | HTMLVideoElement | null {
  const main = document.getElementById('main')
  if (!main) return null
  let best: HTMLImageElement | HTMLVideoElement | null = null
  let bestArea = 0
  for (const el of main.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video')) {
    if (el.closest('[data-cover-slot]')) continue
    const b = el.getBoundingClientRect()
    const w = Math.min(window.innerWidth, b.right) - Math.max(0, b.left)
    const h = Math.min(window.innerHeight, b.bottom) - Math.max(0, b.top)
    if (w < 80 || h < 80) continue
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    if (w * h > bestArea) {
      best = el
      bestArea = w * h
    }
  }
  return best
}

/**
 * Resolves when an image has decoded or a video can show a frame or its
 * poster (or either failed). Media that only loads once it is painted (a
 * lazy image, a video that preloads nothing) is not waited for: nothing is
 * painted while the browser holds the picture of the old page.
 */
function mediaReady(el: HTMLImageElement | HTMLVideoElement | null): Promise<void> {
  if (!el) return Promise.resolve()
  if (el instanceof HTMLImageElement) return el.loading === 'lazy' && !el.complete ? Promise.resolve() : imageReady(el)
  if (el.readyState >= 2 || (!el.poster && el.preload === 'none')) return Promise.resolve()
  const waits: Promise<void>[] = [
    new Promise((resolve) => {
      el.addEventListener('loadeddata', () => resolve(), { once: true })
      el.addEventListener('error', () => resolve(), { once: true })
    }),
  ]
  if (el.poster) {
    const poster = new Image()
    poster.src = el.poster
    waits.push(poster.decode().catch(() => {}))
  }
  return Promise.race(waits)
}

/** The route's code; resolves false on failure (RouteError handles a failed chunk after navigation). */
function loadChunk(path: string): Promise<boolean> {
  const load = (routeChunks as Record<string, (() => Promise<unknown>) | undefined>)[path]
  if (!load) return Promise.resolve(true)
  return load().then(
    () => true,
    () => false,
  )
}

/** Another navigation is under way or done (a header link, Back): the transition must not change the route. */
function otherNavigation(r: Run) {
  if (window.location.pathname !== r.from) return true
  try {
    const nav = router.state.navigation
    return nav.state !== 'idle' && nav.location?.pathname !== r.path
  } catch {
    return false
  }
}

/** The registered proportions of a cover object's artwork. */
function coverRatio(id: string | null | undefined): number | undefined {
  const item = coverItem(id)
  if (!item) return undefined
  const asset = getImage(item.image)
  return asset.width / asset.height
}

function placeBox(el: HTMLElement, b: Box) {
  el.style.left = `${b.x}px`
  el.style.top = `${b.y}px`
  el.style.width = `${b.w}px`
  el.style.height = `${b.h}px`
}

/** A 3D turn on an ancestor of the source (the gallery's objects are turned towards the viewer): the copy is turned the same way. */
interface Turn {
  /** The image's box with the turn taken off (viewport px): the copy's box. */
  box: Box
  /** The turn's origin within that box (px) and its perspective in viewport px. */
  origin: string
  perspective: number
  /** The ancestor's own rotation functions, verbatim. */
  rotate: string
}

const TURN = /perspective\(\s*([\d.]+)px\s*\)((?:\s*rotate[XYZ]?\(\s*-?[\d.e+-]+(?:rad|deg|grad|turn)?\s*\))+)/

/**
 * The turn of the nearest ancestor of `el` whose inline transform ends in
 * perspective() and one or more rotations (the depth gallery writes
 * perspective() rotateY() per object),
 * measured by taking it off for one synchronous measurement: the image's
 * flat box, the turn's origin and the perspective at the ancestor's scale.
 */
function turnOf(el: HTMLElement, img: HTMLImageElement, ratio: number | undefined): Turn | null {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const t = n.style.transform
    const m = t ? TURN.exec(t) : null
    if (!m) continue
    n.style.transform = t.replace(m[0], '').trim() || 'none'
    const box = contentBox(el, img, ratio)
    const rect = n.getBoundingClientRect()
    const [ox, oy] = getComputedStyle(n).transformOrigin.split(' ').map(parseFloat)
    n.style.transform = t
    const k = n.offsetWidth ? rect.width / n.offsetWidth : 1
    if (!box || !Number.isFinite(ox) || !Number.isFinite(oy)) return null
    const origin = `${(rect.left + ox * k - box.x).toFixed(2)}px ${(rect.top + oy * k - box.y).toFixed(2)}px`
    return { box, origin, perspective: parseFloat(m[1]) * k, rotate: m[2].trim() }
  }
  return null
}

/**
 * The `[data-cover-source]` object for a click: `source` itself, the object
 * around it, or the one inside it (a whole link was passed). Only an image
 * that is loaded and mostly on screen can travel.
 */
function coverSource(source: HTMLElement | null | undefined) {
  if (!source?.isConnected) return null
  const el = source.closest<HTMLElement>('[data-cover-source]') ?? source.querySelector<HTMLElement>('[data-cover-source]')
  if (!el) return null
  const img = el instanceof HTMLImageElement ? el : el.querySelector('img')
  const src = img?.currentSrc || img?.src
  if (!img || !src || !img.complete || !img.naturalWidth) return null
  const id = el.dataset.coverSource || null
  const ratio = coverRatio(id)
  const box = contentBox(el, img, ratio)
  if (!box || box.w < 12 || visibleShare(box) < 0.3) return null
  return { el, img, src, box, id, turn: turnOf(el, img, ratio) }
}

/**
 * The destination's slot for `id` on the new page, and the element that
 * carries the shared name: the slot itself, or its immediate wrapper when
 * that wrapper draws the object's glow (a filter) around a box of the same
 * size, so the glow travels with the object instead of appearing after it.
 * Null when the slot is missing or mostly off screen.
 */
function destination(id: string | null): HTMLElement | null {
  if (!id) return null
  for (const slot of document.querySelectorAll<HTMLElement>(`[data-cover-slot="${CSS.escape(id)}"]`)) {
    if (slot.hasAttribute('data-cover-old')) continue
    const box = toBox(slot.getBoundingClientRect())
    if (box.w < 1 || box.h < 1) continue
    if (visibleShare(box) < TRANSITION.minSlotVisible) return null
    const wrap = slot.parentElement
    if (wrap && wrap !== document.body && getComputedStyle(wrap).filter !== 'none') {
      const w = wrap.getBoundingClientRect()
      if (Math.abs(w.width - box.w) < 2 && Math.abs(w.height - box.h) < 2) return wrap
    }
    return slot
  }
  return null
}

// ---------------------------------------------------------------------------
// Running a transition
// ---------------------------------------------------------------------------

const onPopState = () => {
  const r = run
  if (!r) return
  // Before the route change the old page is still shown: the carousel resumes. After it, the animation ends at once.
  if (r.routed) finish(r)
  else cancel(r)
}

/**
 * The new page's own short entrance (PageShell's route content rise) is
 * switched off during the cross-fade (transition.css); lifting that would
 * start it from the beginning under the arrived page, so it is finished at
 * once instead.
 */
function finishEntrance() {
  const main = document.getElementById('main')
  if (!main) return
  for (const el of [main, ...Array.from(main.children)]) {
    for (const a of el.getAnimations()) {
      if (!(a instanceof CSSAnimation) || Number(a.currentTime ?? 0) > 50) continue
      try {
        a.finish()
      } catch {
        /* an endless animation: leave it */
      }
    }
  }
}

/** The custom properties a change sets on <html> for transition.css. */
const TRANSITION_PROPS = [
  '--pt-page-ms',
  '--pt-cover-ms',
  '--pt-page-ease',
  '--pt-cover-ease',
  '--pt-scene-origin',
  '--pt-scene-ms',
  '--pt-scene-scale',
  '--pt-scene-ease',
  '--pt-back-ms',
  '--pt-back-fade-ms',
  '--pt-back-scale',
  '--pt-back-rise',
  '--pt-back-move-ease',
  '--pt-back-fade-ease',
]

/** Ends a transition and removes everything it added. */
function complete(r: Run) {
  if (run !== r) return
  trace('complete', r.cancelled ? 'cancelled' : r.path)
  run = null
  r.timers.forEach((id) => window.clearTimeout(id))
  r.unsubscribe?.()
  r.clone?.remove()
  r.progress?.remove()
  r.source?.removeAttribute('data-cover-moving')
  r.named?.style.removeProperty('view-transition-name')
  releaseScene(r)
  document.querySelectorAll('[data-cover-old]').forEach((el) => el.removeAttribute('data-cover-old'))
  const root = document.documentElement
  if (root.hasAttribute('data-page-transition')) {
    root.removeAttribute('data-page-transition')
    finishEntrance()
  }
  for (const prop of TRANSITION_PROPS) root.style.removeProperty(prop)
  window.removeEventListener('popstate', onPopState)
  setTarget(null)
}

/** Ends a running view transition at once and removes everything (a pending route change no longer happens). */
function finish(r: Run) {
  if (run !== r) return
  r.cancelled = true
  r.vt?.skipTransition()
  complete(r)
}

/** Stops a transition that has not changed the route: the source and the page are restored, the caller resumes. */
function cancel(r: Run) {
  if (run !== r) return
  trace('cancel')
  finish(r)
  r.onCancel?.()
}

/**
 * Where the page crops an object inside the viewport (an ancestor that clips
 * its overflow, such as an anchor partly hidden at the edge of its column),
 * as a clip-path inset of its box, so the copy is cropped the same way in the
 * first frame. Crops at or beyond the viewport's edges are left out: nothing
 * shows there anyway, and the moving copy brings the rest into view.
 */
function cropOf(el: HTMLElement, b: Box): string | null {
  let left = 0
  let top = 0
  let right = window.innerWidth
  let bottom = window.innerHeight
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n)
    if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
    const c = n.getBoundingClientRect()
    if (cs.overflowX !== 'visible') {
      left = Math.max(left, c.left)
      right = Math.min(right, c.right)
    }
    if (cs.overflowY !== 'visible') {
      top = Math.max(top, c.top)
      bottom = Math.min(bottom, c.bottom)
    }
  }
  const edge = (v: number) => (v > 0.5 ? v : 0)
  const inset = [edge(top - b.y), edge(b.x + b.w - right), edge(b.y + b.h - bottom), edge(left - b.x)]
  // Only a crop within the viewport counts (a side cut by the viewport itself reads as 0 above).
  if (top <= 0.5) inset[0] = 0
  if (right >= window.innerWidth - 0.5) inset[1] = 0
  if (bottom >= window.innerHeight - 0.5) inset[2] = 0
  if (left <= 0.5) inset[3] = 0
  return inset.some((v) => v > 0) ? `inset(${inset.map((v) => `${v.toFixed(1)}px`).join(' ')})` : null
}

/**
 * The fade a source draws with a mask (the portrait's lower edge fading into
 * the room), carried over to the copy's image exactly: the mask of the
 * element (or of the image), sized and placed as it is on the page, relative
 * to the painted image. A mask sized or placed some other way falls back to
 * the generic lower-edge fade (transition.css `data-fade`).
 */
function copyMask(found: NonNullable<ReturnType<typeof coverSource>>, img: HTMLImageElement, clone: HTMLElement) {
  for (const el of [found.img, found.el]) {
    const cs = getComputedStyle(el)
    if (!cs.maskImage || cs.maskImage === 'none') continue
    const simple = (cs.maskSize === 'auto' || cs.maskSize === 'auto auto') && (cs.maskPosition === '0% 0%' || cs.maskPosition === '0px 0px')
    if (found.turn || !simple) {
      clone.dataset.fade = 'bottom'
      return
    }
    const r = el.getBoundingClientRect()
    img.style.maskImage = cs.maskImage
    img.style.maskRepeat = 'no-repeat'
    img.style.maskSize = `${r.width.toFixed(2)}px ${r.height.toFixed(2)}px`
    img.style.maskPosition = `${(r.left - found.box.x).toFixed(2)}px ${(r.top - found.box.y).toFixed(2)}px`
    return
  }
}

/** The copy of the clicked PNG that stands in for it in the picture of the old page (same file, glow, turn, fade and crop). */
function placeClone(r: Run, found: NonNullable<ReturnType<typeof coverSource>>) {
  const painted = paintedStyle(found.img, document.getElementById('main'))
  const clone = document.createElement('div')
  clone.className = 'cover-clone'
  clone.setAttribute('aria-hidden', 'true')
  const img = document.createElement('img')
  img.alt = ''
  img.decoding = 'sync'
  img.draggable = false
  img.src = found.src
  clone.appendChild(img)
  // A cut-out shown with a faded edge (the portrait) keeps that fade.
  copyMask(found, img, clone)
  const turn = found.turn
  placeBox(clone, turn?.box ?? found.box)
  clone.style.transformOrigin = turn?.origin ?? '50% 50%'
  clone.style.transform = turn ? `perspective(${turn.perspective.toFixed(2)}px) ${turn.rotate}` : 'none'
  clone.style.filter = painted.filter
  clone.style.opacity = String(painted.opacity)
  // A flat copy is cropped where its scene crops the object (a turned one is not: its box is the unturned one).
  const crop = turn ? null : cropOf(found.el, found.box)
  if (crop) img.style.clipPath = crop
  clone.style.setProperty('view-transition-name', COVER_NAME)
  document.body.appendChild(clone)
  found.el.setAttribute('data-cover-moving', '')
  r.clone = clone
  r.source = found.el
  r.coverId = found.id
}

// ---------------------------------------------------------------------------
// The rest of the scene steps back
// ---------------------------------------------------------------------------

/**
 * View-transition names (transition.css): the content of the page being left
 * as one layer, the new page's content as another, the header, and each
 * other object stepping back (`hk-back-0` to `hk-back-<max - 1>`, one rule
 * each in transition.css).
 */
const SCENE_NAME = 'hk-scene'
const PAGE_NAME = 'hk-page'
const HEADER_NAME = 'hk-header'
const BACK_NAME = 'hk-back-'

const area = (b: DOMRect) => b.width * b.height

/**
 * The element that stands for a scene object as a whole, looking only at
 * ancestors that hold no other object:
 * 1. the outermost one its scene places with an inline transform and a real
 *    box (the gallery's object, with its floor light, reflection, shadow and
 *    glow inside; not the zero-size point the gallery positions it from);
 * 2. else its link, if that hugs it (the portrait anchor, a thumbnail);
 * 3. else the widest wrapper that still hugs it (so a glow drawn by a
 *    wrapper is part of the picture), never a whole block of the page.
 */
function sceneUnit(source: HTMLElement, stop: Element): HTMLElement {
  const own = area(source.getBoundingClientRect())
  const chain: HTMLElement[] = []
  for (let n: HTMLElement | null = source; n && n !== stop && n !== document.body; n = n.parentElement) {
    if (n !== source && n.querySelectorAll('[data-cover-source]').length > 1) break
    chain.push(n)
  }
  const placed = chain.filter((n) => n.style.transform && n.style.transform !== 'none' && n.offsetWidth >= 2 && n.offsetHeight >= 2).pop()
  if (placed) return placed
  const link = chain.find((n) => n.matches('a[href]'))
  if (link && area(link.getBoundingClientRect()) <= own * 3) return link
  let unit = source
  for (const n of chain.slice(1)) {
    if (area(n.getBoundingClientRect()) > own * 1.5) break
    unit = n
  }
  return unit
}

/**
 * The rest of the scene steps back while the chosen object advances (P3,
 * "move closer"). Just before the browser pictures the page being left:
 *
 * - every other PNG object that can be seen (the other gallery objects, the
 *   portrait anchor, a next-project thumbnail) is named `hk-back-<n>`, so it
 *   is pictured on its own and recedes the way the gallery shows distance:
 *   smaller about its floor point, a little higher, dimming away;
 * - the rest of the page's content (the title, the labels, the text) is
 *   named `hk-scene`: it eases back a little about the chosen object and
 *   clears a little sooner than the new page arrives, so old and new text
 *   barely overlap;
 * - the header is named `hk-header`, so that layer never paints over it; it
 *   cross-fades with the pages;
 * - once the route has changed, the new page's content is named `hk-page`
 *   (in the change's update), so it arrives in front of everything stepping
 *   back and behind the header and the advancing object (transition.css
 *   stacks the layers: room, receding scene, new page, header, cover).
 *
 * The room (the background video) stays in the root pictures, whose
 * complementary cross-fade keeps it whole. The names live only until the
 * change ends (releaseScene).
 */
function stepBack(r: Run, focus: Box | null) {
  const cfg = TRANSITION.stepBack
  const main = document.getElementById('main')
  if (!cfg.enabled || !main || (import.meta.env.DEV && window.__pageTransitionStepBack === false)) return
  const root = document.documentElement
  const slow = import.meta.env.DEV ? (window.__pageTransitionSlow ?? 1) : 1
  const name = (el: HTMLElement, n: string) => {
    el.style.setProperty('view-transition-name', n)
    r.backs.push(el)
  }

  // The page's content as one layer, unless it is still moving by itself (its own entrance).
  const scene = main.firstElementChild instanceof HTMLElement ? main.firstElementChild : null
  const sb = scene?.getBoundingClientRect()
  const still = (t: string) => t === 'none' || new DOMMatrixReadOnly(t).isIdentity
  if (scene && sb && sb.width > 0 && sb.height > 0 && still(getComputedStyle(scene).transform)) {
    const cx = focus ? focus.x + focus.w / 2 : window.innerWidth / 2
    const cy = focus ? focus.y + focus.h / 2 : window.innerHeight / 2
    root.style.setProperty('--pt-scene-origin', `${(cx - sb.left).toFixed(1)}px ${(cy - sb.top).toFixed(1)}px`)
    root.style.setProperty('--pt-scene-ms', `${cfg.sceneMs * slow}ms`)
    root.style.setProperty('--pt-scene-scale', String(cfg.sceneScale))
    root.style.setProperty('--pt-scene-ease', cfg.sceneEase)
    name(scene, SCENE_NAME)
    const header = document.querySelector<HTMLElement>('.site-header')
    if (header) name(header, HEADER_NAME)
  }

  // Each other object that can be seen.
  const units: HTMLElement[] = []
  for (const el of main.querySelectorAll<HTMLElement>('[data-cover-source]')) {
    if (units.length >= cfg.max) break
    if (r.source && (el === r.source || el.contains(r.source) || r.source.contains(el))) continue
    const unit = sceneUnit(el, main)
    if (units.some((u) => u === unit || u.contains(unit) || unit.contains(u)) || (r.source && unit.contains(r.source))) continue
    const b = unit.getBoundingClientRect()
    if (b.width < 2 || b.height < 2 || b.right <= 0 || b.bottom <= 0 || b.left >= window.innerWidth || b.top >= window.innerHeight) continue
    if (paintedStyle(unit, main).opacity < 0.03) continue
    units.push(unit)
  }
  // Each converges a little towards the chosen object as it recedes (in its own, depth-scaled units).
  const vx = focus ? focus.x + focus.w / 2 : window.innerWidth / 2
  units.forEach((unit, i) => {
    const b = unit.getBoundingClientRect()
    const k = unit.offsetWidth ? b.width / unit.offsetWidth : 1
    const dx = ((vx - (b.left + b.width / 2)) * cfg.converge) / Math.max(0.2, k)
    root.style.setProperty(`--pt-back-dx-${i}`, `${dx.toFixed(1)}px`)
    name(unit, `${BACK_NAME}${i}`)
  })
  if (units.length) {
    root.style.setProperty('--pt-back-ms', `${cfg.ms * slow}ms`)
    root.style.setProperty('--pt-back-fade-ms', `${cfg.fadeMs * slow}ms`)
    root.style.setProperty('--pt-back-scale', String(cfg.scale))
    root.style.setProperty('--pt-back-rise', String(cfg.rise))
    root.style.setProperty('--pt-back-move-ease', cfg.moveEase)
    root.style.setProperty('--pt-back-fade-ease', cfg.fadeEase)
  }
  trace('step back', `${units.length} objects${r.backs.length > units.length ? ' + scene' : ''}`)
}

/** Takes the step-back names off again (the change has ended or could not start). */
function releaseScene(r: Run) {
  r.backs.forEach((el) => el.style.removeProperty('view-transition-name'))
  r.backs = []
  for (let i = 0; i < TRANSITION.stepBack.max; i++) document.documentElement.style.removeProperty(`--pt-back-dx-${i}`)
}

/** The destination's accent ("r g b"), for the slow-wait line. */
function accentRgb(path: string): string {
  const id = coverItemForPath(path)?.id
  return id && id in ACCENTS ? ACCENTS[id as keyof typeof ACCENTS].rgb : ACCENTS.about.rgb
}

/**
 * Step 1 is taking longer than progressDelayMs (a slow connection): a thin
 * line in the destination's accent runs across the top of the viewport, so
 * the click is visibly under way while the old page stays. Decorative (the
 * link keeps its focus and name); it leaves with the old page.
 */
function showProgress(r: Run) {
  if (run !== r || r.progress || r.phase !== 'wait') return
  const bar = document.createElement('div')
  bar.className = 'pt-progress'
  bar.setAttribute('aria-hidden', 'true')
  bar.style.setProperty('--pt-accent-rgb', accentRgb(r.path))
  document.body.appendChild(bar)
  r.progress = bar
  trace('progress')
}

/** After an ordinary navigation takes over (plain), the line stays until the router has the new page (or progressHoldMs). */
function holdProgress(bar: HTMLDivElement, path: string) {
  let timer = 0
  let unsubscribe = () => {}
  const done = () => {
    unsubscribe()
    window.clearTimeout(timer)
    bar.remove()
  }
  timer = window.setTimeout(done, TRANSITION.progressHoldMs)
  unsubscribe = router.subscribe((state) => {
    if (state.navigation.state === 'idle') done()
  })
  if (router.state.navigation.state === 'idle' && window.location.pathname === path) done()
}

/** Falls back to an ordinary navigation (the old page stays until react-router has the new one). */
function plain(r: Run) {
  if (run !== r) return
  trace('plain')
  const { navigate, path } = r
  const bar = r.progress
  r.progress = null
  complete(r)
  navigate(path)
  if (bar) holdProgress(bar, path)
}

/**
 * Step 2 and 3: one view transition. The old page is captured (with the copy
 * standing in for the clicked object), the route changes synchronously
 * inside the update callback, the slot receives the shared name, and the
 * browser cross-fades the pages while the copy moves into the slot.
 */
function change(r: Run) {
  if (run !== r || r.phase !== 'wait') return
  if (otherNavigation(r)) return cancel(r)
  r.phase = 'change'
  const found = r.mode === 'cover' ? coverSource(r.sourceArg) : null
  if (found) placeClone(r, found)
  else r.mode = 'fade'
  stepBack(r, found ? (found.turn?.box ?? found.box) : null)

  const root = document.documentElement
  const slow = import.meta.env.DEV ? (window.__pageTransitionSlow ?? 1) : 1
  root.style.setProperty('--pt-page-ms', `${TRANSITION.pageMs * slow}ms`)
  root.style.setProperty('--pt-cover-ms', `${TRANSITION.coverMs * slow}ms`)
  root.style.setProperty('--pt-page-ease', TRANSITION.pageEase)
  root.style.setProperty('--pt-cover-ease', TRANSITION.coverEase)
  root.setAttribute('data-page-transition', r.mode)
  document.querySelectorAll('[data-cover-slot]').forEach((el) => el.setAttribute('data-cover-old', ''))

  const update = async () => {
    trace('update', r.cancelled ? 'cancelled' : r.mode)
    if (run !== r || r.cancelled) return
    // The new state has no copy (the slot takes the name) or wait line (it leaves with the old page),
    // and nothing of the old page stays hidden.
    r.clone?.remove()
    r.progress?.remove()
    r.progress = null
    r.source?.removeAttribute('data-cover-moving')
    setTarget(r.path)
    r.routed = true
    const oldPage = document.getElementById('main')?.firstElementChild ?? null
    try {
      await r.navigate(r.path, { flushSync: true })
    } catch {
      /* RouteError shows a failed page */
    }
    trace('navigated')
    await pageReplaced(oldPage, TRANSITION.renderWaitMs)
    trace('routed', window.location.pathname)
    if (run !== r || r.cancelled || window.location.pathname !== r.path) return
    // The new page's content arrives as its own layer, in front of the scene stepping back.
    const page = document.getElementById('main')?.firstElementChild
    if (r.backs.length && page instanceof HTMLElement && page !== oldPage && !oldPage?.isConnected) {
      page.style.setProperty('view-transition-name', PAGE_NAME)
      r.backs.push(page)
    }
    // The browser holds the picture of the old page meanwhile: short, capped waits for the slot's file and
    // the opening media (both warmed and normally decoded already), so they appear with the page.
    const dest = destination(r.coverId)
    const media = openingMedia()
    trace('destination', `${dest?.className ?? 'none'}; media ${media?.tagName ?? 'none'}`)
    if (import.meta.env.DEV && media instanceof HTMLImageElement && !warmed.get(r.path)?.images.some((img) => img.currentSrc === media.currentSrc)) {
      // projects.ts `hero` (or TRANSITION.openingMedia) is out of step with the page: this file loads while the display is held.
      trace('opening not warmed', media.currentSrc.split('/').pop())
    }
    await Promise.all([
      Promise.race([imageReady(dest?.querySelector('img') ?? null), delay(TRANSITION.slotDecodeMs)]),
      Promise.race([mediaReady(media), delay(TRANSITION.openingMediaWaitMs)]),
    ])
    trace('media ready')
    if (!dest || run !== r || r.cancelled || !dest.isConnected) return
    dest.style.setProperty('view-transition-name', COVER_NAME)
    r.named = dest
    trace('named')
  }

  let vt: ViewTransition
  try {
    vt = document.startViewTransition(update)
  } catch {
    // No view transition after all: change the route the ordinary way.
    r.clone?.remove()
    r.source?.removeAttribute('data-cover-moving')
    releaseScene(r)
    return plain(r)
  }
  r.vt = vt
  trace('start', r.mode)
  vt.ready.then(
    () => trace('ready'),
    (e: unknown) => trace('ready failed', String(e)),
  )
  vt.updateCallbackDone.catch(() => {})
  vt.finished.then(
    () => complete(r),
    () => complete(r),
  )
  later(r, TRANSITION.hardCapMs * slow, () => finish(r))
}

function start(mode: Mode, path: string, source: HTMLElement | null | undefined, navigate: Navigate, onCancel?: () => void) {
  const r: Run = {
    mode,
    path,
    from: window.location.pathname,
    phase: 'wait',
    cancelled: false,
    routed: false,
    sourceArg: source ?? null,
    source: null,
    coverId: null,
    clone: null,
    progress: null,
    named: null,
    backs: [],
    vt: null,
    timers: [],
    unsubscribe: null,
    navigate,
    onCancel,
  }
  run = r
  trace('open', `${mode} ${path}`)
  window.addEventListener('popstate', onPopState)
  // Another navigation while waiting (a header link, Back handled by the router) cancels this one.
  r.unsubscribe = router.subscribe(() => {
    if (run === r && r.phase === 'wait' && otherNavigation(r)) cancel(r)
  })

  // Step 1: the old page stays while the destination gets ready.
  const warm = warmed.get(path)
  const media = Promise.race([Promise.all([warm?.cover, warm?.opening]), delay(TRANSITION.mediaWaitMs)])
  void Promise.all([loadChunk(path), media]).then(([ok]) => {
    if (run !== r || r.phase !== 'wait') return
    if (!ok) return plain(r)
    change(r)
  })
  // A slow connection: the thin accent line shows the click is under way.
  later(r, TRANSITION.progressDelayMs, () => showProgress(r))
  // A chunk that takes too long: an ordinary navigation (react-router keeps the old page until it arrives).
  later(r, TRANSITION.chunkWaitMs, () => {
    if (r.phase === 'wait') plain(r)
  })
}

export interface OpenProjectOptions {
  path: string
  /**
   * The clicked PNG object (`[data-cover-source]`), or an element around or
   * inside it (e.g. the whole link). Anything else, or null: the pages only
   * cross-fade.
   */
  source?: HTMLElement | null
  /** react-router's useNavigate() of the calling component. */
  navigate: Navigate
  /** Called if the transition is cancelled before the route change (Back, another navigation). */
  onCancel?: () => void
}

/**
 * Opens a project with the transition described above. Returns 'cover'
 * when the PNG will move (the caller freezes the carousel until the page
 * changes or onCancel is called), 'reveal' for a cross-fade without a
 * moving image, 'plain' for an ordinary navigation (reduced motion, no view
 * transitions, the same page), 'ignored' while a transition is still under
 * way (rapid clicks).
 */
export function openProject({ path, source, navigate, onCancel }: OpenProjectOptions): 'cover' | 'reveal' | 'plain' | 'ignored' {
  if (run) return 'ignored'
  warmProject(path)

  if (prefersReducedMotion() || path === window.location.pathname || !supportsViewTransitions()) {
    navigate(path)
    return 'plain'
  }

  const cover = coverSource(source) !== null
  start(cover ? 'cover' : 'fade', path, source, navigate, onCancel)
  return cover ? 'cover' : 'reveal'
}

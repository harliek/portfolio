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
 * Opening a project (brief-v8 section 6): never an empty scene.
 *
 * 1. Wait. The page being left stays exactly as it is (the caller freezes
 *    the carousel when openProject returns 'cover') while the destination's
 *    code loads and its cover object and opening media decode (usually
 *    already done on hover or focus: warmProject). Nothing fades, nothing is
 *    hidden. A longer wait (a slow connection) shows a thin line in the
 *    destination's accent across the top, so the click is visibly under way.
 * 2. Change, in one view transition (document.startViewTransition): the
 *    browser keeps a picture of the page being left, the route changes
 *    synchronously underneath it, and then, over TRANSITION.pageMs, the old
 *    page fades out while the new page (its heading and opening media
 *    included, live) fades in. The two fades are complementary and blended
 *    additively, so the background room (the same video on both pages) stays
 *    continuous and the scene never dims towards black.
 * 3. At the same time, from a PNG object marked `data-cover-source="<id>"`
 *    (a gallery object, a next-project thumbnail), the same image moves into
 *    the destination's `[data-cover-slot="<id>"]` (CoverSlot.tsx) over
 *    TRANSITION.coverMs: a copy of the clicked image (its file, glow and
 *    3D turn) stands in for the source in the picture of the old page, and
 *    the browser morphs it to the slot with a uniform scale (both boxes have
 *    the artwork's own proportions, so it is never stretched; a turned object
 *    turns to face the viewer on the way, it never flips). The page does not
 *    wait for the move.
 *
 * Without a slot on screen the copy simply fades with the old page. From a
 * text link (the Work shelf) or a source that is not a loaded, visible PNG,
 * only the pages cross-fade. Browsers without view transitions, reduced
 * motion and a failed or very slow chunk get an ordinary navigation (the
 * old page still stays until the new one is ready: react-router keeps it
 * while the lazy route loads). Direct loads are untouched.
 *
 * Rapid clicks are ignored until the change has finished. Back/Forward (or
 * another navigation) while waiting cancels it and restores the source
 * (onCancel lets the carousel resume); during the cross-fade it ends the
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
  /** The opening media (TRANSITION.openingMedia, else projects.ts `hero`), decoded. */
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
 * media (TRANSITION.openingMedia), fetched and decoded. Idempotent.
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
  const hero = projectForPath(path)?.hero
  const openings = (TRANSITION.openingMedia[path] ?? (hero ? [hero] : [])).map(({ image, sizes }) => warmImage(image, sizes))
  images.push(...openings.map((w) => w.img))
  const opening = Promise.all(openings.map((w) => w.ready)).then(() => {})
  warmed.set(path, { images, cover, opening })
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
  vt: ViewTransition | null
  timers: number[]
  unsubscribe: (() => void) | null
  navigate: (path: string) => void
  onCancel?: () => void
}

let run: Run | null = null

declare global {
  interface Window {
    /** Development only: the steps of recent transitions, for browser checks. */
    __pageTransitionLog?: [number, string, string?][]
    /** Development only: a slow-motion factor for inspecting the animation frame by frame. */
    __pageTransitionSlow?: number
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
  document.querySelectorAll('[data-cover-old]').forEach((el) => el.removeAttribute('data-cover-old'))
  const root = document.documentElement
  if (root.hasAttribute('data-page-transition')) {
    root.removeAttribute('data-page-transition')
    finishEntrance()
  }
  for (const prop of ['--pt-page-ms', '--pt-cover-ms', '--pt-page-ease', '--pt-cover-ease']) root.style.removeProperty(prop)
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

/** The copy of the clicked PNG that stands in for it in the picture of the old page (same file, glow, turn and fade). */
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
  // A cut-out shown with a faded lower edge (the headshot) keeps that fade (transition.css).
  if (getComputedStyle(found.el).maskImage !== 'none' || getComputedStyle(found.img).maskImage !== 'none') clone.dataset.fade = 'bottom'
  const turn = found.turn
  placeBox(clone, turn?.box ?? found.box)
  clone.style.transformOrigin = turn?.origin ?? '50% 50%'
  clone.style.transform = turn ? `perspective(${turn.perspective.toFixed(2)}px) ${turn.rotate}` : 'none'
  clone.style.filter = painted.filter
  clone.style.opacity = String(painted.opacity)
  clone.style.setProperty('view-transition-name', COVER_NAME)
  document.body.appendChild(clone)
  found.el.setAttribute('data-cover-moving', '')
  r.clone = clone
  r.source = found.el
  r.coverId = found.id
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
      await router.navigate(r.path, { flushSync: true })
    } catch {
      /* RouteError shows a failed page */
    }
    trace('navigated')
    await pageReplaced(oldPage, TRANSITION.renderWaitMs)
    trace('routed', window.location.pathname)
    if (run !== r || r.cancelled || window.location.pathname !== r.path) return
    // The browser holds the picture of the old page meanwhile: short, capped waits for the slot's file and
    // the opening media (both warmed and normally decoded already), so they appear with the page.
    const dest = destination(r.coverId)
    const media = openingMedia()
    trace('destination', `${dest?.className ?? 'none'}; media ${media?.tagName ?? 'none'}`)
    if (import.meta.env.DEV && media instanceof HTMLImageElement && !warmed.get(r.path)?.images.some((img) => img.currentSrc === media.currentSrc)) {
      // TRANSITION.openingMedia is out of step with the page: this file loads while the display is held.
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

function start(mode: Mode, path: string, source: HTMLElement | null | undefined, navigate: (path: string) => void, onCancel?: () => void) {
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
  navigate: (path: string) => void
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

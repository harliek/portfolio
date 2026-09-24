import type { MouseEvent } from 'react'
import { TRANSITION } from '../../config/transition'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { projectForPath } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { prefetchRoute, routeChunks, router } from '../../routes'
import { coverItem, coverItemForPath, coverSlotWidth } from './coverGeometry'
import './transition.css'

/**
 * Opening a project: the same image moves into the new page.
 *
 * From a PNG object marked `data-cover-source="<id>"` (a carousel object, a
 * next-project thumbnail), when the caller passes it (or an element around
 * or inside it) as `source`:
 *
 * 1. the caller freezes the carousel (openProject returned 'cover'); a copy
 *    of the clicked image (the same file, `currentSrc`, with its glow) takes
 *    its place and comes a little forward, while the page being left fades
 *    out;
 * 2. the route changes once the route's code has loaded and the slot's
 *    image file has decoded (never later than TRANSITION.navigateCapMs; a
 *    failed chunk still navigates and RouteError handles it);
 * 3. the copy travels to the destination's `[data-cover-slot="<id>"]`
 *    (CoverSlot.tsx) with a uniform scale, following the slot if the layout
 *    or scroll shifts. Meanwhile the slot image and every
 *    `[data-cover-reveal]` element of the new page are hidden
 *    (transition.css), so the copy never crosses visible text;
 * 4. on landing, the heading, introduction and media fade in around it;
 *    then the slot image (decoded) replaces the copy in the same frame.
 *
 * From anything else (a text link, a source that is not visible or not
 * loaded): the new page's `[data-cover-reveal]` elements fade in once it
 * has rendered ('reveal').
 *
 * Rapid clicks are ignored until the copy has landed. Back/Forward or
 * another navigation before the route change cancels it and restores the
 * source (onCancel lets the carousel resume); after the route change, Back
 * or Forward removes everything at once. A missing or off-screen slot, or a
 * failed page, fades the copy away. Every wait has a cap and
 * TRANSITION.hardCapMs ends any transition. Direct loads are untouched
 * (nothing is hidden without a running transition). Reduced motion:
 * ordinary navigation. Modifier and middle clicks stay native (isPlainClick).
 */

// ---------------------------------------------------------------------------
// Warming a destination
// ---------------------------------------------------------------------------

/** Warmed images by path (kept so a detached image is never collected mid-load), and when the cover object is decoded. */
const warmed = new Map<string, { images: HTMLImageElement[]; cover: Promise<void> }>()

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
 * media image (projects.ts `hero`), fetched and decoded. Idempotent.
 */
export function warmProject(path: string) {
  prefetchRoute(path)
  if (warmed.has(path)) return
  const images: HTMLImageElement[] = []
  let cover = Promise.resolve()
  const item = coverItemForPath(path)
  if (item) {
    const sizes = TRANSITION.slotSizes[path] ?? `${coverSlotWidth(item, TRANSITION.defaultSlotScale)}px`
    const warm = warmImage(item.image, sizes)
    images.push(warm.img)
    cover = warm.ready
  }
  const hero = projectForPath(path)?.hero
  if (hero) images.push(warmImage(hero.image, hero.sizes).img)
  warmed.set(path, { images, cover })
}

export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type Mode = 'cover' | 'reveal'
/** forward: before the route change · route: waiting for the new page · move: the copy travels · reveal: landed, text fading in. */
type Phase = 'forward' | 'route' | 'move' | 'reveal'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Run {
  mode: Mode
  path: string
  /** The pathname the transition started from (a different one before the route change means someone navigated elsewhere). */
  from: string
  phase: Phase
  navigatedAt: number
  /** The route content being left (a child of <main>); once disconnected, the new page has replaced it. */
  oldPage: Element | null
  /** The clicked `[data-cover-source]` element (hidden while its copy travels). */
  source: HTMLElement | null
  coverId: string | null
  clone: HTMLDivElement | null
  cloneImg: HTMLImageElement | null
  forward: Animation | null
  move: Animation | null
  pageFade: Animation | null
  slot: HTMLElement | null
  /** Where the copy is going (viewport px). */
  target: Box | null
  chunkFailed: boolean
  timers: number[]
  frame: number
  onCancel?: () => void
}

let run: Run | null = null

/** True while a transition into `path` has not landed yet (its opening is hidden until then). */
export function isTransitionPending(path: string) {
  return run !== null && run.path === path && run.phase !== 'reveal'
}

/*
 * The destination of the running transition, for components that should
 * change ahead of the route (StageBackground applies the destination's
 * darker reading shade while the copy comes forward, so it is complete
 * before any destination text appears). Read with useSyncExternalStore.
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = () => performance.now()

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

const delay = (r: Run, ms: number) =>
  new Promise<void>((resolve) => {
    r.timers.push(window.setTimeout(resolve, Math.max(0, ms)))
  })

/** Runs `fn` every animation frame while it returns true and `r` is running (one loop per transition at a time). */
function eachFrame(r: Run, fn: () => boolean) {
  cancelAnimationFrame(r.frame)
  const tick = () => {
    if (run !== r) return
    if (fn()) r.frame = requestAnimationFrame(tick)
  }
  r.frame = requestAnimationFrame(tick)
}

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
 * srcset density correction rounds to whole pixels (a 160 × 103 file shown
 * at 104px wide reports 104 × 66).
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

const differs = (a: Box, b: Box | null, px: number) =>
  !b || Math.abs(a.x - b.x) > px || Math.abs(a.y - b.y) > px || Math.abs(a.w - b.w) > px || Math.abs(a.h - b.h) > px

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

/** The route content holding `el` (a child of <main>), else the current route content. */
function pageRootOf(el: Element | null | undefined): Element | null {
  const main = document.getElementById('main')
  if (!main) return null
  for (let n: Element | null = el ?? null; n; n = n.parentElement) if (n.parentElement === main) return n
  return main.firstElementChild
}

/**
 * Ends the entrance animations that move the ancestors of `el` (the route
 * content's short rise), so the slot's position is final before the copy
 * heads for it and nothing rises twice.
 */
function settle(el: Element) {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    for (const a of n.getAnimations()) {
      if (!(a instanceof CSSAnimation)) continue
      const frames = (a.effect as KeyframeEffect | null)?.getKeyframes() ?? []
      if (!frames.some((k) => 'transform' in k || 'translate' in k || 'scale' in k || 'rotate' in k)) continue
      try {
        a.finish()
      } catch {
        /* an endless animation: leave it */
      }
    }
  }
}

/**
 * Ends, at once, the CSS entrance animations that (re)start when the
 * transition's hiding ends: a page rule may pause them while
 * `html[data-cover-transition]` is set (the route content's rise), and they
 * would then replay under the landed image. The reveal replaces them.
 * Looks at the route content and the ancestors of the slot.
 */
function finishRestarted(slot: Element | null) {
  const main = document.getElementById('main')
  const els = new Set<Element>(main ? [main, ...Array.from(main.children)] : [])
  for (let n = slot?.parentElement ?? null; n && n !== document.body; n = n.parentElement) els.add(n)
  for (const el of els) {
    for (const a of el.getAnimations()) {
      if (!(a instanceof CSSAnimation) || Number(a.currentTime ?? 0) > 34) continue
      try {
        a.finish()
      } catch {
        /* an endless animation: leave it */
      }
    }
  }
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

/** The route's code; resolves false on failure (RouteError handles a failed chunk after navigation). */
function loadChunk(path: string): Promise<boolean> {
  const load = (routeChunks as Record<string, (() => Promise<unknown>) | undefined>)[path]
  if (!load) return Promise.resolve(true)
  return load().then(
    () => true,
    () => false,
  )
}

/** Another navigation is already under way (a header link clicked while the copy came forward). */
function otherNavigation(path: string) {
  try {
    const nav = router.state.navigation
    return nav.state !== 'idle' && nav.location?.pathname !== path
  } catch {
    return false
  }
}

function findSlot(id: string | null): HTMLElement | null {
  if (!id) return null
  for (const el of document.querySelectorAll<HTMLElement>(`[data-cover-slot="${CSS.escape(id)}"]`)) {
    if (el.hasAttribute('data-cover-old')) continue
    const b = el.getBoundingClientRect()
    if (b.width > 0 && b.height > 0) return el
  }
  return null
}

/** The registered proportions of a cover object's artwork. */
function coverRatio(id: string | null | undefined): number | undefined {
  const item = coverItem(id)
  if (!item) return undefined
  const asset = getImage(item.image)
  return asset.width / asset.height
}

function slotBox(r: Run, slot: HTMLElement): Box | null {
  return contentBox(slot, slot.querySelector('img'), coverRatio(r.coverId))
}

function placeBox(el: HTMLElement, b: Box) {
  el.style.left = `${b.x}px`
  el.style.top = `${b.y}px`
  el.style.width = `${b.w}px`
  el.style.height = `${b.h}px`
}

const toBox = (d: DOMRect): Box => ({ x: d.left, y: d.top, w: d.width, h: d.height })

/**
 * The `[data-cover-source]` object for a click: `source` itself, the object
 * around it, or the one inside it (a whole link was passed). Only an image
 * that is loaded and mostly on screen can travel.
 */
function coverSource(source: HTMLElement | null | undefined) {
  if (!source) return null
  const el = source.closest<HTMLElement>('[data-cover-source]') ?? source.querySelector<HTMLElement>('[data-cover-source]')
  if (!el) return null
  const img = el instanceof HTMLImageElement ? el : el.querySelector('img')
  const src = img?.currentSrc || img?.src
  if (!img || !src || !img.complete || !img.naturalWidth) return null
  const id = el.dataset.coverSource || null
  const box = contentBox(el, img, coverRatio(id))
  if (!box || box.w < 12 || visibleShare(box) < 0.3) return null
  return { el, img, src, box, id }
}

// ---------------------------------------------------------------------------
// Running a transition
// ---------------------------------------------------------------------------

function newRun(mode: Mode, path: string, onCancel?: () => void): Run {
  return {
    mode,
    path,
    from: window.location.pathname,
    phase: 'forward',
    navigatedAt: 0,
    oldPage: null,
    source: null,
    coverId: null,
    clone: null,
    cloneImg: null,
    forward: null,
    move: null,
    pageFade: null,
    slot: null,
    target: null,
    chunkFailed: false,
    timers: [],
    frame: 0,
    onCancel,
  }
}

/** The page being left is still the one shown (the route has not changed yet). */
const beforeRouteChange = (r: Run) => r.phase === 'forward' || (r.phase === 'route' && !!r.oldPage?.isConnected && window.location.pathname === r.from)

const onPopState = () => {
  const r = run
  if (!r) return
  // Before the route change the old page is still shown: restore it (the carousel resumes). After it, Back/Forward leaves at once.
  if (beforeRouteChange(r)) cancel(r)
  else complete(r)
}

/** Marks the page being left (its reveal and slot elements stay visible) and hides whatever the new page mounts. */
function begin(r: Run) {
  run = r
  document.querySelectorAll('[data-cover-reveal], [data-cover-slot]').forEach((el) => el.setAttribute('data-cover-old', ''))
  document.documentElement.setAttribute('data-cover-transition', r.mode)
  window.addEventListener('popstate', onPopState)
  setTarget(r.path)
  later(r, TRANSITION.hardCapMs, () => (beforeRouteChange(r) ? cancel(r) : complete(r)))
}

/** Ends a transition and removes everything it added, in one frame (the slot image replaces the copy). */
function complete(r: Run) {
  if (run !== r) return
  run = null
  cancelAnimationFrame(r.frame)
  r.timers.forEach((id) => window.clearTimeout(id))
  r.forward?.cancel()
  r.move?.cancel()
  r.pageFade?.cancel()
  r.clone?.remove()
  r.source?.removeAttribute('data-cover-moving')
  const root = document.documentElement
  if (root.hasAttribute('data-cover-transition')) {
    root.removeAttribute('data-cover-transition')
    finishRestarted(r.slot?.isConnected ? r.slot : null)
  }
  for (const name of ['data-cover-old', 'data-cover-hold', 'data-transition-pending']) {
    document.querySelectorAll(`[${name}]`).forEach((el) => el.removeAttribute(name))
  }
  window.removeEventListener('popstate', onPopState)
  setTarget(null)
}

/** Stops a transition before the route change: the source and the page are restored, the caller resumes. */
function cancel(r: Run) {
  if (run !== r) return
  complete(r)
  r.onCancel?.()
}

/**
 * Shows the new page: removes the hiding and fades in its opening
 * (`[data-cover-reveal]`, and legacy `[data-transition-pending]` frames)
 * where it is on screen, with a short rise, except the element holding the
 * landed image, which only fades (the copy above it never moves).
 */
function revealPage(r: Run, ms: number) {
  const els = new Set<HTMLElement>()
  document.querySelectorAll<HTMLElement>('[data-cover-reveal]:not([data-cover-old]), [data-transition-pending]').forEach((el) => els.add(el))
  // Slots outside every reveal element (their image was hidden too).
  document.querySelectorAll<HTMLElement>('[data-cover-slot]:not([data-cover-old]):not([data-cover-hold])').forEach((el) => {
    if (!el.closest('[data-cover-reveal]')) els.add(el)
  })
  document.documentElement.removeAttribute('data-cover-transition')
  document.querySelectorAll('[data-transition-pending]').forEach((el) => el.removeAttribute('data-transition-pending'))
  finishRestarted(r.slot)
  for (const el of els) {
    if (!el.isConnected) continue
    const b = el.getBoundingClientRect()
    if (b.bottom < 0 || b.top > window.innerHeight || b.width === 0) continue
    const still = r.slot ? el.contains(r.slot) : false
    const rise = still ? 0 : TRANSITION.revealRise
    el.animate(
      [
        { opacity: 0, translate: `0 ${rise}px` },
        { opacity: 1, translate: '0 0' },
      ],
      { duration: ms, easing: TRANSITION.revealEase, fill: 'backwards' },
    )
  }
}

/** The copy travels from `from` to `to` (viewport px) with a uniform scale; its box is the destination's, so the last frame is exact. */
function flyTo(r: Run, from: Box, fromFilter: string, fromOpacity: string, to: Box, duration: number, easing: string) {
  const clone = r.clone
  if (!clone || !r.slot) return
  const toFilter = paintedStyle(r.slot.querySelector('img') ?? r.slot, r.slot.parentElement).filter
  placeBox(clone, to)
  clone.style.transformOrigin = '0 0'
  clone.style.transform = 'none'
  clone.style.filter = toFilter
  clone.style.opacity = '1'
  const s = from.w / to.w
  const tx = from.x + from.w / 2 - (to.x + (to.w * s) / 2)
  const ty = from.y + from.h / 2 - (to.y + (to.h * s) / 2)
  const first: Keyframe = { transform: `translate(${tx}px, ${ty}px) scale(${s})`, opacity: fromOpacity }
  const last: Keyframe = { transform: 'translate(0px, 0px) scale(1)', opacity: 1 }
  if (fromFilter !== 'none' || toFilter !== 'none') {
    first.filter = fromFilter
    last.filter = toFilter
  }
  const anim = clone.animate([first, last], { duration, easing, fill: 'both' })
  r.move = anim
  r.target = to
  anim.finished.then(
    () => {
      if (r.move === anim) land(r)
    },
    () => {},
  )
}

/** Step 3: the new page has its slot; the copy heads for it (or fades away if it cannot be reached). */
function startMove(r: Run, slot: HTMLElement) {
  const clone = r.clone
  if (!clone) return abort(r)
  r.slot = slot
  settle(slot)
  const to = slotBox(r, slot)
  if (!to || visibleShare(to) < TRANSITION.minSlotVisible) return abort(r)
  r.phase = 'move'
  const from = toBox(clone.getBoundingClientRect())
  const cs = getComputedStyle(clone)
  const fromFilter = cs.filter
  const fromOpacity = cs.opacity
  r.forward?.cancel()
  r.forward = null
  flyTo(r, from, fromFilter, fromOpacity, to, TRANSITION.moveMs, TRANSITION.moveEase)

  // A small source (a next-project thumbnail): continue with the slot's larger file once decoded.
  const slotImg = slot.querySelector('img')
  if (r.cloneImg && slotImg?.currentSrc && slotImg.complete && slotImg.naturalWidth > r.cloneImg.naturalWidth * 1.2) {
    const hi = new Image()
    hi.src = slotImg.currentSrc
    hi.decode().then(
      () => {
        if (run === r && r.cloneImg) r.cloneImg.src = hi.src
      },
      () => {},
    )
  }

  // Follow the slot if it shifts (a late layout change, a scroll) while the copy travels.
  eachFrame(r, () => {
    if (r.phase !== 'move') return false
    if (!slot.isConnected) {
      abort(r)
      return false
    }
    const live = slotBox(r, slot)
    if (live && differs(live, r.target, 2) && r.move) {
      const elapsed = Number(r.move.currentTime ?? 0)
      const here = toBox(clone.getBoundingClientRect())
      const style = getComputedStyle(clone)
      const old = r.move
      r.move = null
      old.cancel()
      flyTo(r, here, style.filter, style.opacity, live, Math.max(90, TRANSITION.moveMs - elapsed), 'cubic-bezier(0.25, 0.6, 0.3, 1)')
    }
    return true
  })
}

/** Step 4: landed. The opening fades in around the copy; then the decoded slot image replaces it. */
function land(r: Run) {
  if (run !== r || r.phase !== 'move' || !r.slot || !r.clone) return
  r.phase = 'reveal'
  const slot = r.slot
  const clone = r.clone
  const settled = r.move
  r.move = null
  settled?.cancel()
  // From here the copy takes the slot image's own box (object-fit contain, as
  // the slot draws it) and, once the slot has it, the same file, so the
  // frame in which the slot image replaces it changes nothing.
  const slotImg = slot.querySelector('img')
  const exact = () => (slotImg?.isConnected ? toBox(slotImg.getBoundingClientRect()) : slotBox(r, slot))
  const match = () => {
    const src = slotImg?.currentSrc
    if (slotImg && r.cloneImg && src && slotImg.complete && slotImg.naturalWidth && r.cloneImg.src !== src) r.cloneImg.src = src
  }
  const follow = () => {
    const b = exact()
    if (b && differs(b, r.target, 0.25)) {
      placeBox(clone, b)
      r.target = b
    }
  }
  r.target = null
  follow()
  match()
  slot.setAttribute('data-cover-hold', '')
  revealPage(r, TRANSITION.revealMs)
  // Keep the copy on the slot (a scroll during the fade).
  eachFrame(r, () => {
    follow()
    return true
  })
  const imageDecoded = Promise.race([imageReady(slotImg), delay(r, TRANSITION.slotImageWaitMs)])
  void Promise.all([imageDecoded, delay(r, TRANSITION.revealMs)]).then(() => {
    match()
    // One frame with the matched file before the swap.
    requestAnimationFrame(() => complete(r))
  })
}

/** The copy cannot reach a slot (missing, off screen, failed page): it fades away and the page is shown. */
function abort(r: Run) {
  if (run !== r) return
  r.phase = 'reveal'
  r.move?.cancel()
  r.move = null
  if (r.oldPage?.isConnected && window.location.pathname !== r.path) {
    // The route has not changed (still loading): show the old page again meanwhile, and let the carousel move.
    r.pageFade?.cancel()
    r.pageFade = null
    r.source?.removeAttribute('data-cover-moving')
    r.onCancel?.()
  }
  revealPage(r, TRANSITION.plainRevealMs)
  const clone = r.clone
  if (clone) {
    clone.animate([{ opacity: getComputedStyle(clone).opacity }, { opacity: 0 }], { duration: TRANSITION.abortFadeMs, easing: 'ease-out', fill: 'forwards' })
  }
  later(r, Math.max(TRANSITION.abortFadeMs, TRANSITION.plainRevealMs), () => complete(r))
}

/** Step 2: the route changes (unless someone navigated elsewhere meanwhile), then the new page is awaited. */
function changeRoute(r: Run, navigate: (path: string) => void) {
  if (run !== r || r.phase !== 'forward') return
  if (window.location.pathname !== r.from || otherNavigation(r.path)) return cancel(r)
  r.phase = 'route'
  r.navigatedAt = now()
  navigate(r.path)
  let mountedAt = 0
  eachFrame(r, () => {
    const t = now()
    const arrived = window.location.pathname === r.path
    const replaced = arrived && !r.oldPage?.isConnected
    if (replaced) {
      // The new page is in: stop fading the (now new) route content.
      r.pageFade?.cancel()
      r.pageFade = null
      if (!mountedAt) mountedAt = t
    }
    if (arrived) {
      const slot = findSlot(r.coverId)
      if (slot) {
        startMove(r, slot)
        return false
      }
    }
    // A page that hides nothing (no reveal elements) does not take part: the copy leaves at once, never over its text.
    const bystander = mountedAt > 0 && t - mountedAt > 20 && !document.querySelector('[data-cover-reveal]:not([data-cover-old])')
    // Someone navigated elsewhere after the route change began (a header link): the copy leaves.
    const elsewhere = window.location.pathname !== r.path && window.location.pathname !== r.from
    if ((replaced && r.chunkFailed) || bystander || elsewhere || (mountedAt && t - mountedAt > TRANSITION.slotGraceMs) || t - r.navigatedAt > TRANSITION.slotWaitMs) {
      abort(r)
      return false
    }
    return true
  })
}

function startCover(path: string, found: NonNullable<ReturnType<typeof coverSource>>, navigate: (path: string) => void, onCancel?: () => void) {
  const r = newRun('cover', path, onCancel)
  r.source = found.el
  r.coverId = found.id
  r.oldPage = pageRootOf(found.el)

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
  placeBox(clone, found.box)
  clone.style.transformOrigin = '50% 50%'
  clone.style.filter = painted.filter
  clone.style.opacity = String(painted.opacity)
  document.body.appendChild(clone)
  r.clone = clone
  r.cloneImg = img
  found.el.setAttribute('data-cover-moving', '')
  begin(r)

  // Step 1: forward, while the page being left fades out.
  const { forwardMs, forwardScale, forwardLift } = TRANSITION
  r.forward = clone.animate([{ transform: 'none' }, { transform: `translateY(${-forwardLift}px) scale(${forwardScale})` }], {
    duration: forwardMs,
    easing: TRANSITION.forwardEase,
    fill: 'forwards',
  })
  r.pageFade = r.oldPage?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: TRANSITION.pageFadeMs, easing: 'ease-out', fill: 'forwards' }) ?? null

  const forwardDone = r.forward.finished.then(
    () => undefined,
    () => undefined,
  )
  const chunk = loadChunk(path).then((ok) => {
    r.chunkFailed = !ok
  })
  // The slot's image file, decoded, so it can replace the copy the moment it lands.
  const cover = warmed.get(path)?.cover ?? Promise.resolve()
  void Promise.all([forwardDone, chunk, cover]).then(() => changeRoute(r, navigate))
  later(r, TRANSITION.navigateCapMs, () => changeRoute(r, navigate))
}

function startReveal(path: string, source: HTMLElement | null | undefined, navigate: (path: string) => void) {
  const r = newRun('reveal', path)
  r.oldPage = pageRootOf(source)
  begin(r)
  r.phase = 'route'
  r.navigatedAt = now()
  navigate(path)
  let mountedAt = 0
  eachFrame(r, () => {
    const t = now()
    if (window.location.pathname === r.path && !r.oldPage?.isConnected) {
      if (!mountedAt) mountedAt = t
      const fresh = document.querySelector('[data-cover-reveal]:not([data-cover-old]), [data-cover-slot]:not([data-cover-old])')
      if (fresh || t - mountedAt > TRANSITION.slotGraceMs) {
        if (fresh) settle(fresh)
        r.phase = 'reveal'
        revealPage(r, TRANSITION.plainRevealMs)
        later(r, TRANSITION.plainRevealMs, () => complete(r))
        return false
      }
    }
    const elsewhere = window.location.pathname !== r.path && window.location.pathname !== r.from
    if (elsewhere || t - r.navigatedAt > TRANSITION.navigateCapMs + TRANSITION.slotWaitMs) {
      complete(r)
      return false
    }
    return true
  })
}

export interface OpenProjectOptions {
  path: string
  /**
   * The clicked PNG object (`[data-cover-source]`), or an element around or
   * inside it (e.g. the whole link). Anything else, or null: a plain reveal.
   */
  source?: HTMLElement | null
  navigate: (path: string) => void
  /** Called if a cover transition is cancelled before the route change (Back, another navigation). */
  onCancel?: () => void
}

/**
 * Opens a project with the transition described above. Returns 'cover'
 * when the image sequence started (the caller freezes the carousel),
 * 'reveal' for a plain reveal of the new page, 'plain' for an ordinary
 * navigation (reduced motion, same page), 'ignored' while a transition is
 * still under way (rapid clicks).
 */
export function openProject({ path, source, navigate, onCancel }: OpenProjectOptions): 'cover' | 'reveal' | 'plain' | 'ignored' {
  if (run && run.phase !== 'reveal') return 'ignored'
  // A reveal still fading on the current page completes at once.
  if (run) complete(run)
  warmProject(path)

  if (prefersReducedMotion() || path === window.location.pathname) {
    navigate(path)
    return 'plain'
  }

  const found = coverSource(source)
  if (found) {
    startCover(path, found, navigate, onCancel)
    return 'cover'
  }
  startReveal(path, source, navigate)
  return 'reveal'
}

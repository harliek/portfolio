import { delayedCall, type DelayedCall } from './ticker'

/**
 * Scroll progress between two points of the page (Harlie's approval, 2026-09-29, audit D1/E4/G1): the homepage's
 * `--enter` and `--settle` (Home.tsx) and the case studies' current step (CaseStory.tsx). GSAP's ScrollTrigger did
 * this until then; it also kept an empty requestAnimationFrame loop and a 250ms timer running on every page for the
 * whole visit, and GSAP was about 44 KB gzip of every first load. This is the part of ScrollTrigger 3.15.0 the site
 * used, kept step for step so the values, the moments they change and every measurement stay exactly as they were
 * (line numbers are node_modules/gsap/ScrollTrigger.js 3.15.0, removed with the package):
 * - Positions (:310, :738-807): a number is a scroll position; 'top top+=64' is where the trigger's top meets 64px
 *   below the window's top, measured from its box (transforms included) at scroll 0 and rounded to whole pixels;
 *   'max' is the page's last scroll position, the page's height less a 100vh box's (not innerHeight: phones' toolbars
 *   do not move it, :113, :466, :2026). Progress is clamped to 0..1 (:1650).
 * - Scrolling: each scroll event (and wheel) updates every trigger at once, in that frame, not on a later one
 *   (:374-389); onUpdate runs only when progress changes (:1680, :1786).
 * - Refreshing (:478-570): the page is scrolled to 0 and back while everything is measured (so it lands on a whole
 *   pixel, and one scroll event follows), progress is updated, then every onRefresh runs, in creation order, once all
 *   are measured. A new trigger is measured at once, where the page is, then onUpdate and onRefresh (:1606-1612).
 * - Refreshes happen on DOMContentLoaded and load, 200ms after the last resize (ignored in fullscreen, and on
 *   touch-only screens unless the width or a quarter of the height changes: toolbars; :395-398, :2135), when the tab
 *   is shown again at a new size (:2136-2145), when the orientation turns (at once, :2070-2081), and on refresh(). One
 *   from a resize waits while the page scrolls, until 200ms after its last scroll event (:484-487, :588-594).
 * - After each refresh history.scrollRestoration is set back to what it was when the site loaded (:446-455, :2018),
 *   as ScrollTrigger did (React Router's ScrollRestoration sets 'manual' first; it ends 'auto').
 * - The 200ms wait after a resize is timed on lib/ticker.ts (GSAP's clock), which also gets the half-second call
 *   ScrollTrigger made when it started (:2116): that call kept GSAP's clock awake for its first 150 frames or so, and
 *   a resize's wait counts from the clock's last frame while it is awake, so it has to be there for a resize soon
 *   after a load to be measured on the same frame as before.
 * Nothing runs while nothing scrolls, resizes or refreshes: the 250ms check for the end of a scroll (:371, :2115)
 * runs only until the scroll has ended, on the same beat, and the clock stops within about 2 seconds of its last use.
 */

type Position = number | string

export interface ScrollProgress {
  /** 0 at start, 1 at end. */
  readonly progress: number
  kill(): void
}

interface Vars {
  /** The element (or the first match of a selector, looked up once) whose box `start` and `end` name. */
  trigger?: Element | string
  /** A scroll position (px), or '<trigger edge> <window edge>' with an optional '+=' or '-=' offset (px or %). */
  start: Position
  /** As `start`, or 'max': the page's last scroll position. */
  end: Position
  onUpdate?: (self: ScrollProgress) => void
  onRefresh?: (self: ScrollProgress) => void
}

interface Trigger extends ScrollProgress {
  progress: number
  vars: Vars
  el: Element | null
  start: number
  end: number
  change: number
  enabled: boolean
  reverted?: boolean
  endClamp: boolean
  prevScroll: number
  prevProgress: number
  inRefresh: boolean
}

const win = window
const doc = document
const EDGES: Record<string, number> = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 }
const triggers: Trigger[] = []
const restoration = history.scrollRestoration || 'auto'
const touchOnly = win.matchMedia('(hover: none), (pointer: coarse)').matches
const portraitQuery = '(orientation: portrait)'
const div100vh = doc.createElement('div')
div100vh.style.height = '100vh'
div100vh.style.position = 'absolute'

// The page's scroll, read again only after a scroll, resize or refresh (ScrollTrigger's cache, quirks kept).
let cache = 0
let readAt = 0
let cached = 0
/** The scroll recorded before a refresh, restored after it. */
let rec = 0
let hasScroller = false
let refreshing: Trigger | null = null
let refreshingAll: boolean | 2 = false
let revertedAll = false
let vh100 = 0
let lastScrollTime = 0
let time1 = Date.now()
let lastScroll = 0
let direction = 1
let iter = 0
let pointerDown = false
/** A resize's refresh waiting for the scroll to end. */
let softPending = false
let rafID = 0
let baseW = 0
let baseH = 0
let prevW: number | undefined
let prevH: number | undefined
let isPortrait = false
let lastMediaTime = 0
const syncFrom = Date.now()
let syncTimer = 0

const readScroll = () => win.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop || 0

function scroll() {
  if (cache !== readAt || refreshing) {
    readAt = cache
    cached = readScroll()
  }
  return cached
}

function scrollTo(value: number) {
  cached = Math.round(value) || 0
  win.scrollTo(win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0, cached)
  readAt = cache
}

const viewport = () => vh100 || doc.documentElement.clientHeight || doc.body.clientHeight
const maxScroll = () => Math.max(0, (doc.documentElement.scrollHeight || doc.body.scrollHeight) - viewport())

function measureViewport() {
  doc.body.appendChild(div100vh)
  vh100 = div100vh.offsetHeight || win.innerHeight
  doc.body.removeChild(div100vh)
}

function setBase() {
  baseW = win.innerWidth
  baseH = win.innerHeight
}

/** 'top', 'bottom+=20', '50%'… as px of `size`. */
function offsetToPx(value: string, size: number) {
  const eq = value.indexOf('=')
  let relative = eq >= 0 ? +(value.charAt(eq - 1) + 1) * parseFloat(value.slice(eq + 1)) : 0
  if (eq >= 0) {
    if (value.indexOf('%') > eq) relative *= size / 100
    value = value.slice(0, Math.max(0, eq - 1))
  }
  return relative + (value in EDGES ? EDGES[value] * size : value.includes('%') ? (parseFloat(value) * size) / 100 : parseFloat(value) || 0)
}

function position(value: Position, el: Element | null, size: number, at: number) {
  if (typeof value === 'string' && !isNaN(+value)) value = +value
  if (typeof value === 'number') return Math.round(value)
  const [local, global] = (value || '0').split(' ')
  const box = (el ?? doc.body).getBoundingClientRect()
  return Math.round(box.top + offsetToPx(local, box.height) + at - offsetToPx(global || '0', size))
}

function update(t: Trigger, reset?: boolean) {
  const at = refreshingAll === true ? t.prevScroll : scroll()
  const p = reset ? 0 : (at - t.start) / t.change
  const clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0
  if (clipped === t.progress || !t.enabled) return
  t.progress = clipped
  if (!refreshing) t.vars.onUpdate?.(t)
}

/** Progress set aside (to 0, silently) while measuring, or brought back after. */
function revert(t: Trigger, r: boolean) {
  r = r || !t.enabled
  if (r === t.reverted) return
  const prev = refreshing
  if (r) {
    t.prevScroll = Math.max(scroll(), rec || 0)
    t.prevProgress = t.progress
    refreshing = t
  }
  update(t, r)
  refreshing = prev
  t.reverted = r
}

/** Measures one trigger (:1296-1612); `pos` sets its positions directly (setPositions, for 'max'). */
function refreshOne(t: Trigger, pos?: { start: number; end: number }) {
  if (refreshing || !t.enabled) return
  refreshing = t
  if (!t.reverted) revert(t, true)
  const size = viewport()
  const max = maxScroll()
  const first = t.change <= 0.01 || !t.change
  let start = position(pos ? pos.start : t.vars.start, t.el, size, scroll()) || 0
  const endVar = pos ? pos.end : t.vars.end
  let end = Math.max(start, endVar === 'max' ? Math.round(max) : position(endVar, t.el, size, scroll())) || -0.001
  if (t.endClamp && !refreshingAll) end = Math.min(end, maxScroll())
  const change = end - start || ((start -= 0.01) && 0.001)
  t.start = start
  t.end = end
  t.change = change
  const scroll1 = refreshingAll ? t.prevScroll : scroll()
  if (!refreshingAll) {
    if (scroll1 < t.prevScroll) scrollTo(t.prevScroll)
    rec = 0
  }
  revert(t, false)
  refreshing = null
  // Progress goes back to what it was (0 the first time), so the next update reports the change.
  if (first || t.prevProgress !== t.progress) t.progress = first || (scroll1 - start) / change === t.prevProgress ? 0 : t.prevProgress
  if (first && !refreshingAll) update(t)
  if (t.vars.onRefresh && !refreshingAll && !t.inRefresh) {
    t.inRefresh = true
    t.vars.onRefresh(t)
    t.inRefresh = false
  }
}

function recordScroll() {
  if (hasScroller && ++readAt) rec = scroll()
}

function revertAll() {
  for (iter = 0; iter < triggers.length; iter++) revert(triggers[iter], true)
  revertedAll = true
}

function refreshAll(force?: boolean, skipRevert?: boolean) {
  if (lastScrollTime && !force && !revertedAll) {
    softPending = true
    return
  }
  measureViewport()
  refreshingAll = true
  if (!revertedAll) recordScroll()
  if (!skipRevert) revertAll()
  if (hasScroller) scrollTo(0)
  for (const t of triggers.slice()) refreshOne(t)
  revertedAll = false
  for (const t of triggers) {
    const max = maxScroll()
    if (t.vars.end === 'max' || (t.endClamp && t.end > max)) {
      refreshOne(t, { start: t.start, end: Math.max(t.start + 1, max) })
      update(t)
    }
  }
  if (hasScroller && rec) scrollTo(rec)
  cache++
  // `readAt++ &&`: ScrollTrigger kept the recorded scroll when its cache mark was 0 (:450); kept as it was.
  if (hasScroller && readAt++) rec = 0
  history.scrollRestoration = restoration
  resizeDelay?.pause()
  refreshingAll = 2
  updateAll(2)
  for (const t of triggers) t.vars.onRefresh?.(t)
  refreshingAll = false
}

function updateAll(force?: 2) {
  if (force === 2 || (!refreshingAll && !revertedAll)) {
    const l = triggers.length
    const time = Date.now()
    const recordVelocity = time - time1 >= 50
    const at = l && scroll()
    direction = lastScroll > at ? -1 : 1
    if (!refreshingAll) lastScroll = at
    if (recordVelocity) {
      if (lastScrollTime && !pointerDown && time - lastScrollTime > 200) {
        lastScrollTime = 0
        if (softPending) {
          softPending = false
          refreshAll(true)
        }
      }
      time1 = time
    }
    if (direction < 0) {
      for (iter = l; iter-- > 0; ) if (triggers[iter]) update(triggers[iter])
      direction = 1
    } else for (iter = 0; iter < l; iter++) if (triggers[iter]) update(triggers[iter])
  }
  rafID = 0
}

/** ScrollTrigger's 250ms check (:371, :2115), on the same beat, but only until the scroll has ended. */
function watchScrollEnd() {
  if (!syncTimer && lastScrollTime && !pointerDown) syncTimer = win.setTimeout(sync, 250 - ((Date.now() - syncFrom) % 250))
}

function sync() {
  syncTimer = 0
  if (!lastScrollTime || pointerDown) return
  if (Date.now() - lastScrollTime > 34 && !rafID) rafID = requestAnimationFrame(() => updateAll())
  watchScrollEnd()
}

function onScroll() {
  cache++
  updateAll()
  lastScrollTime = Date.now()
  watchScrollEnd()
}

/** The 200ms wait after a resize (made, paused, when this starts, as ScrollTrigger's was, :2135). */
let resizeDelay: DelayedCall | undefined

function onResize() {
  cache++
  const fullscreen = doc.fullscreenElement || (doc as { webkitFullscreenElement?: Element | null }).webkitFullscreenElement
  const h = win.innerHeight
  if (!refreshing && !fullscreen && (!touchOnly || baseW !== win.innerWidth || Math.abs(h - baseH) > h * 0.25)) resizeDelay?.restart()
}

function kill(t: Trigger) {
  revert(t, true)
  t.enabled = false
  const i = triggers.indexOf(t)
  if (i >= 0) triggers.splice(i, 1)
  if (i === iter && direction > 0) iter--
  if (!triggers.length && !refreshingAll) rec = 0
}

function create(vars: Vars): ScrollProgress {
  hasScroller = true
  scroll()
  const t: Trigger = {
    vars,
    el: typeof vars.trigger === 'string' ? doc.querySelector(vars.trigger) : (vars.trigger ?? null),
    progress: 0,
    start: 0,
    end: 0,
    change: 0,
    enabled: true,
    endClamp: vars.end === 'max',
    prevScroll: 0,
    prevProgress: 0,
    inRefresh: false,
    kill: () => kill(t),
  }
  triggers.push(t)
  refreshOne(t)
  return t
}

function enable() {
  lastScroll = win.pageYOffset || 0
  measureViewport()
  const on = (target: EventTarget, types: string, fn: EventListener) => {
    for (const type of types.split(',')) target.addEventListener(type, fn, { passive: true })
  }
  on(win, 'wheel', onScroll)
  const portrait = win.matchMedia(portraitQuery)
  isPortrait = portrait.matches
  // The orientation turned (gsap.matchMedia): new base measurements for the toolbar rule, and a refresh at once.
  portrait.addEventListener('change', () => {
    const time = Date.now()
    if (time - lastMediaTime <= 2) return
    recordScroll()
    revertAll()
    const match = win.matchMedia(portraitQuery).matches
    if (match !== isPortrait) {
      isPortrait = match
      setBase()
    }
    lastMediaTime = time
    refreshAll(false, true)
  })
  setBase()
  on(doc, 'scroll', onScroll)
  cached = readScroll()
  // ScrollTrigger's start-up call (:2116): it does nothing itself, but keeps the clock awake past its 30th frame.
  delayedCall(0.5, () => {})
  // Kept from ScrollTrigger (:2120, :2123): some older Android browsers stop sending touchmove (the tiles' swipe) unless
  // touchcancel is listened for, and a Safari touch bug needs a touchstart listener on the body.
  const nothing = () => {}
  on(doc, 'touchcancel', nothing)
  on(doc.body, 'touchstart', nothing)
  on(doc, 'pointerdown,touchstart,mousedown', () => (pointerDown = true))
  on(doc, 'pointerup,touchend,mouseup', () => {
    pointerDown = false
    watchScrollEnd()
  })
  resizeDelay = delayedCall(0.2, () => refreshAll())
  resizeDelay.pause()
  on(doc, 'visibilitychange', () => {
    const w = win.innerWidth
    const h = win.innerHeight
    if (doc.hidden) {
      prevW = w
      prevH = h
    } else if (prevW !== w || prevH !== h) onResize()
  })
  on(doc, 'DOMContentLoaded', () => refreshAll(true))
  on(win, 'load', () => refreshAll(true))
  on(win, 'resize', onResize)
}

if (doc.body) enable()
else doc.addEventListener('DOMContentLoaded', enable, { once: true })

export const ScrollProgress = {
  /** Watches the scroll between `start` and `end`; measured at once (onUpdate if not at 0, then onRefresh). */
  create,
  /** Measures everything again now, even mid-scroll. */
  refresh: () => refreshAll(true),
}

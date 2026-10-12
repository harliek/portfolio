import type { NavigateFunction } from 'react-router-dom'
import { TRANSITION } from '../../config/transition'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { DEPTH, alphaAt, holdInLane, keepClear, laneOf, obstacle, still, type Box, type Fade, type Lane, type Obstacle, type Plan, type Pose, type Timing } from './paths'
import { NARROW, PICTURES, coverOf, piecesInView, sliversInView, type Piece } from './pieces'
import { coverVideos, isWebKit } from './stills'
import { loadChunk, openingReady, warmProject } from './warm'
import './transition.css'

/**
 * Every page change inside the site (Harlie's requests: "make the page deconstruct and build itself like all the
 * separate components", "pieces move and rearrange", "more movement of the components"): a tile, Previous/Next
 * project, the header's Home, About and Back, the phone menu's links. The page comes apart into its pieces (the
 * title, the details, each step, the pictures, the tiles and their captions, the footer's links), they travel, and the
 * new page's pieces travel into their places:
 *
 * In turn from the leading edge, the pieces are thrown out to one side on diverging paths (spreading apart as they go,
 * tilting either way, the footer's row dropping away), and as they go the new page's pieces arrive from the other side,
 * each on its own converging path into its place. Every change moves this way: from a homepage tile, between case
 * studies, to and from About and back to the homepage. Each page's main picture leaves and arrives by itself in its own
 * column; it is never flown, grown or turned over into the other page's picture, nor is the title turned into the next
 * title (Harlie's brief, 2026-10-12: a tile's picture and the page's are often different photographs; until then a
 * tile's picture flew into the page's, and pictures and titles turned over into the next like a card).
 *
 * Every move is planned, then checked frame by frame before it runs (paths.ts; Harlie's requests, 2026-09-28): a
 * page's main picture keeps to its own column beside the words, turning with its edge towards them turned away; the
 * words keep clear of the pictures moving over them and of the header's items (a piece shortens its way in,
 * inside its own column, or waits a few frames); the lines drawn tight against a title (a case study's details, the
 * homepage's name) come in with it as one unit; the two pages' words never sit over each other, nor do a new page's
 * neighbours cross on the way in; and the window is never left without a picture between two projects.
 *
 * It runs in one view transition (document.startViewTransition), so the real pages are never moved: the browser
 * pictures each piece of the page being left and each of the new page, and the transition moves only those pictures
 * (transform and opacity, with absolute keyframes so the compositor runs them), then drops them. The new page
 * underneath is already exactly as a normal load leaves it, at the top, measured by its own scroll effects. The
 * pointer stays live above everything and its trail under the pieces; the header crossfades from the old page's to
 * the new one's as the old pieces leave. Click to settled is at most about 1.2s; the new title reads at about 0.5-0.7s.
 *
 * The browser's own Back and Forward stay instant (the scroll position is being restored then), and Back during a
 * change ends it at once. Reduced motion: a quick plain fade, the old page out before the new one in (transition.css).
 * Browsers without view transitions: an ordinary navigation. The creative portfolio (a separate site) loads in full
 * after its outgoing half (leaveSite).
 */

/** Which way the pieces travel between pages: forward like Next (to the left), back like Previous (to the right). */
export type Direction = 'forward' | 'back'

export interface ChangeOptions {
  /** A path in the site, or -1 for the previous entry (the header's Back). */
  to: string | -1
  navigate: NavigateFunction
  /** Router state for the new entry. */
  state?: unknown
  direction?: Direction
  /** Runs as the change begins, and `onCancel` if it is stopped before the route changes. */
  onStart?: () => void
  onCancel?: () => void
}

// ---------------------------------------------------------------------------
// Timing (ms from the moment the new page has been pictured, about 60ms after the click)
// ---------------------------------------------------------------------------

const TIME = {
  /** Each leaving piece travels this long, starting in turn over at most OUT_SPREAD. */
  out: 420,
  outStep: 36,
  outSpread: 140,
  /**
   * Each arriving piece travels this long, the first at IN_AT, the rest in turn over at most IN_SPREAD. They start while
   * the leaving pieces are still on their way; a piece that would meet a leaving one's words waits a few frames for it
   * (paths.ts), so the two pages' words never sit over each other and the window is never nearly empty (Harlie's
   * request, 2026-09-28; it was 250ms, with the page almost black for about 140ms).
   */
  inAt: 150,
  in: 560,
  inStep: 38,
  inSpread: 240,
  /**
   * The header crossfades from the old page's to the new page's over this, quickly and between the halves, when the
   * page is emptiest (a floating pill becoming the full bar is never seen doubled: then the old one is out before the
   * new one comes in, each over half of it).
   */
  headerAt: 220,
  header: 140,
  /** A page chosen from the open phone menu: the menu (in the old header's picture) fades from MENU_OUT_AT, MENU_OUT. */
  menuOutAt: 40,
  menuOut: 120,
  /**
   * The backgrounds. Reaching the homepage's film (a different ground from the pages' black one), the page left fades
   * out over ROOT_OUT: whatever of it is not one of its pieces (a form's outlines) never shows through the arriving film
   * (Harlie's brief, 2026-09-28; it dimmed to 0.4 over 460ms and held there). Leaving the homepage, its film fades out
   * over FILM_OUT (its slivers of tiles are hidden, pieces.ts), so the window is never nearly black while the pieces
   * change. The new one comes in over ROOT_IN from ROOT_IN_AT (from 200ms until 2026-09-28: reaching the homepage, its
   * film now shows as the old page's pieces go, not after).
   */
  rootOut: 220,
  filmOut: 420,
  rootInAt: 120,
  rootIn: 520,
  /** A phone's held band fades over BAND_OUT once the pieces passing under it have gone (at most BAND_AT). */
  bandOut: 120,
  bandAt: 420,
  /** Reaching the homepage, the leaving words are gone by then (its film shows through them). */
  wordsOverFilm: 260,
  /** A change that has not ended by then is ended. */
  cap: 2600,
} as const

const EASE = {
  /** Leaving: under way from the first frame (no slow start after the click), accelerating out. */
  out: 'cubic-bezier(0.25, 0.3, 0.7, 0.45)',
  /** Thrown out: fast from the first frame, so most of the travel is seen before the piece has faded. */
  throw: 'cubic-bezier(0.3, 0.6, 0.55, 1)',
  /** Arriving: visible from early on, gliding the whole way into place. */
  glide: 'cubic-bezier(0.2, 0.65, 0.25, 1)',
  fade: 'cubic-bezier(0.33, 0, 0.25, 1)',
} as const

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface Run {
  to: string | -1
  /** The pathname being left. */
  from: string
  opts: ChangeOptions
  cancelled: boolean
  /** The route change has been asked for. */
  routed: boolean
  /** The header's Back asked the router to go back: that popstate is ours, not the visitor's. */
  ownPop: boolean
  vt: ViewTransition | null
  old: Piece[]
  next: Piece[]
  /** Every element given a view-transition name, to take it off again. */
  named: HTMLElement[]
  timers: number[]
  progress: HTMLDivElement | null
  /** The videos of the page being left, held on their frame while it is pictured (played again if the change stops). */
  paused: HTMLVideoElement[]
  /** WebKit: stills over those videos while the page is pictured (stills.ts), removed at the end. */
  stills: HTMLCanvasElement[]
  /** The page being left shows the header as the floating pill (it scrolled), not the bar. */
  headerFloats: boolean
  /** The page being left shows the header's Back (every page but the homepage). */
  headerBack: boolean
  /** Where the old page's header items stood (paths.ts keeps the words clear of them). */
  header: Box[]
  /** WebKit, a new page landing scrolled: the new header comes in with the page's own picture (update()). */
  headerInRoot: boolean
  /** The page was chosen from the open phone menu, pictured with the header: it goes first (choreograph). */
  menu: boolean
  /** A phone's held band on the case study being left (pieces.ts coverOf), pictured as its own layer, and its box. */
  band: HTMLElement | null
  bandRect: Box | null
  /** The new page's pieces left in its own picture at the window's edge (pieces.ts piecesInView `stay`). */
  stay: DOMRect[]
  /** Slivers of pieces hidden while the page being left is pictured (pieces.ts sliversInView), shown again after. */
  hidden: HTMLElement[]
  hiddenWas: string[]
}

let run: Run | null = null

declare global {
  interface Window {
    /** Development only: the steps of recent page changes, for browser checks. */
    __pageChangeLog?: [number, string, string?][]
    /** Development only: the last change's planned moves (paths.ts), for browser checks. */
    __pageChangePlans?: (Plan & { label: string })[]
  }
}

function trace(step: string, detail?: string) {
  if (!import.meta.env.DEV) return
  const log = (window.__pageChangeLog ??= [])
  // Wall-clock ms, so browser checks can line the steps up with recorded frames.
  log.push([Math.round(performance.timeOrigin + performance.now()), step, detail])
  if (log.length > 200) log.splice(0, log.length - 200)
}

const supportsViewTransitions = () => typeof document.startViewTransition === 'function'
const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Starting, waiting, ending
// ---------------------------------------------------------------------------

/**
 * Changes the page with the transition described above. Returns 'started', 'plain' for an ordinary navigation
 * (reduced motion is still a fade; no view transitions; the same page), or 'ignored' while a change is under way.
 */
export function changePage(opts: ChangeOptions): 'started' | 'plain' | 'ignored' {
  if (run) {
    // Once the old page is pictured the change runs to its end (a second or so); before that (a slow wait for the
    // destination's code), the visitor's newer choice wins and the waiting change is dropped.
    if (run.vt) return 'ignored'
    const waiting = run
    trace('superseded')
    waiting.cancelled = true
    waiting.opts.onCancel?.()
    complete(waiting)
  }
  const { to, navigate } = opts
  // Any other destination chosen during a HOME glide: the glide's HOME is not followed afterwards (glideHome).
  if (to !== '/') cancelGlide?.()
  if (typeof to === 'string') warmProject(to)
  if (to === '/' && window.location.pathname === '/' && glideHome(navigate, opts.state)) return 'plain'
  if ((typeof to === 'string' && to === window.location.pathname) || !supportsViewTransitions()) {
    if (to === -1) navigate(-1)
    else navigate(to, { state: opts.state })
    return 'plain'
  }
  const r: Run = {
    to,
    from: window.location.pathname,
    opts,
    cancelled: false,
    routed: false,
    ownPop: false,
    vt: null,
    old: [],
    next: [],
    named: [],
    timers: [],
    progress: null,
    paused: [],
    stills: [],
    headerFloats: false,
    headerBack: false,
    header: [],
    headerInRoot: false,
    menu: false,
    band: null,
    bandRect: null,
    stay: [],
    hidden: [],
    hiddenWas: [],
  }
  run = r
  trace('click', String(to))
  opts.onStart?.()
  window.addEventListener('popstate', onPopState)
  window.addEventListener('pagehide', onPageHide)

  // The page being left stays live while the destination's code loads and its opening pictures decode (normally done
  // already, on hover); a slow wait shows a thin blue violet line.
  const path = typeof to === 'string' ? to : null
  const ready = path ? Promise.all([loadChunk(path), Promise.race([openingReady(path), delay(TRANSITION.mediaWaitMs)])]).then(([ok]) => ok) : Promise.resolve(true)
  later(r, TRANSITION.progressDelayMs, () => showProgress(r))
  later(r, TRANSITION.chunkWaitMs, () => plain(r))
  void ready.then((ok) => {
    if (run !== r || r.vt) return
    if (!ok) plain(r)
    else begin(r)
  })
  return 'started'
}

/** A HOME glide under way (glideHome): further clicks on HOME wait for it. */
let gliding = false
/** Drops the pending HOME glide's navigation (glideHome), for a visitor who chose another page meanwhile (changePage). */
let cancelGlide: (() => void) | null = null

/**
 * HOME on the homepage, scrolled down to the tiles (Harlie's brief, 2026-09-28: it was a jump cut from the tiles to the
 * top): the page glides back to the top, the header gathering back into its bar with the scroll as it does, and only
 * there is HOME followed (a new entry: the tiles start again from the first, out of sight below the hero). At the top
 * already, or with reduced motion, HOME is followed at once, as before. Returns whether it glides.
 * A visitor who chooses another page during the glide (About, a tile, a page in the phone's menu), or goes Back or
 * Forward in the browser, stays on that page: the glide's HOME is dropped rather than followed after it has arrived
 * (bug fix approved by Harlie, 2026-09-29; the scroll itself still runs out underneath). The Creative Portfolio link
 * leaves the site through leaveSite, not changePage, and is unchanged.
 */
function glideHome(navigate: NavigateFunction, state: unknown): boolean {
  if (gliding) return true
  if (window.scrollY <= 0 || prefersReducedMotion()) return false
  gliding = true
  let done = false
  // Ends the glide's wait, once; false if it had already ended.
  const stop = () => {
    if (done) return false
    done = true
    gliding = false
    cancelGlide = null
    window.clearTimeout(timer)
    window.removeEventListener('scrollend', arrive)
    return true
  }
  const arrive = () => {
    if (!stop()) return
    // The visitor went elsewhere during the glide (browser Back or Forward): stay there.
    if (window.location.pathname !== '/') return
    navigate('/', { state })
  }
  // At the top (scrollend), or after the longest a browser takes to glide there (one without scrollend).
  const timer = window.setTimeout(arrive, GLIDE_HOME_MS)
  window.addEventListener('scrollend', arrive)
  cancelGlide = () => void stop()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  return true
}

/** The longest HOME waits for the glide to the top of the homepage before it is followed anyway (ms). */
const GLIDE_HOME_MS = 900

/** A timer that only fires while `r` is still the running change (all are cleared at the end). */
function later(r: Run, ms: number, fn: () => void) {
  r.timers.push(window.setTimeout(() => run === r && fn(), ms))
}

/** The visitor went Back or Forward: before the route change nothing happens; after it, the transition ends at once. */
function onPopState() {
  const r = run
  if (!r) return
  if (r.ownPop) {
    r.ownPop = false
    return
  }
  trace('back')
  if (!r.routed) {
    r.opts.onCancel?.()
    resumeVideos(r)
  }
  r.cancelled = true
  r.vt?.skipTransition()
  complete(r)
}

/** The page stays after all (the change stopped before the route changed): its videos carry on. */
function resumeVideos(r: Run) {
  for (const video of r.paused) if (video.isConnected) void video.play().catch(() => {})
  r.paused = []
}

function onPageHide() {
  const r = run
  if (!r) return
  r.cancelled = true
  r.vt?.skipTransition()
  complete(r)
}

/** Ends a change and removes everything it added: the names, the attribute, the listeners and timers, the line. */
function complete(r: Run) {
  if (run !== r) return
  trace('done', r.cancelled ? 'cancelled' : window.location.pathname)
  run = null
  r.timers.forEach((id) => window.clearTimeout(id))
  r.progress?.remove()
  r.stills.forEach((c) => c.remove())
  r.stills = []
  reveal(r)
  unname(r.named)
  r.named = []
  // The moves hold their last frame until the whole change ends; the pictures they moved are gone now, so let them go.
  moves.forEach((a) => a.cancel())
  moves.length = 0
  document.documentElement.removeAttribute('data-shuffle')
  window.removeEventListener('popstate', onPopState)
  window.removeEventListener('pagehide', onPageHide)
}

/** An ordinary navigation (the route's code failed or is very slow): the router keeps this page until the next is ready. */
function plain(r: Run) {
  if (run !== r || r.vt) return
  trace('plain')
  const { to, navigate, state } = r.opts
  complete(r)
  if (to === -1) navigate(-1)
  else navigate(to, { state })
}

/**
 * A slow wait: a thin line in the statement blue violet runs across the top, so the click is visibly under way (it took
 * the destination's own accent until 2026-09-28: rose, lime or amber; Harlie's rule is blue violet only).
 */
function showProgress(r: Run) {
  if (r.progress || r.vt) return
  const bar = document.createElement('div')
  bar.className = 'pt-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)
  r.progress = bar
}

// ---------------------------------------------------------------------------
// Naming the pieces
// ---------------------------------------------------------------------------

/**
 * The layers kept apart from the moving pieces: the header (crossfading from the old page's to the new page's, so its
 * state never jumps ahead of the pieces), the pointer's trail (under the pieces) and the pointer (live throughout).
 */
const LIVE = [
  ['.site-header', 'tx-header', 'tx-head'],
  ['.pointer-trail', 'tx-trail', 'tx-live'],
  ['.custom-cursor', 'tx-cursor', 'tx-live'],
] as const

function name(r: Run, el: HTMLElement, vtName: string, vtClass: string) {
  el.style.setProperty('view-transition-name', vtName)
  el.style.setProperty('view-transition-class', vtClass)
  r.named.push(el)
}

function unname(els: HTMLElement[]) {
  for (const el of els) {
    el.style.removeProperty('view-transition-name')
    el.style.removeProperty('view-transition-class')
  }
}

/** The header is drawn as the floating pill (the page has scrolled past Header.tsx's FLOAT_AT), not the full bar. */
const headerFloats = () => Boolean(document.querySelector('.site-header[data-floating]')) || window.scrollY > 12

/** The header shows Back before HOME (every page but the homepage), so HOME stands further along. */
const headerBack = () => Boolean(document.querySelector('.site-header .site-back'))

const boxOf = (r: DOMRect): Box => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })

/**
 * Where the header's items stand, in viewport px: the floating pill, or the bar's two groups (Back and HOME, the
 * navigation); on a phone the whole bar (black on the case studies). The header is drawn over every moving piece, so
 * the words keep clear of it (Harlie's brief, 2026-09-28: titles passed under BACK, HOME and MENU as the header
 * crossfaded).
 */
function headerBoxes(): Box[] {
  const header = document.querySelector<HTMLElement>('.site-header')
  const bar = header?.getBoundingClientRect()
  if (!header || !bar || bar.bottom <= 0) return []
  if (window.matchMedia(NARROW).matches) return [{ left: 0, top: 0, right: window.innerWidth, bottom: bar.bottom }]
  const parts = header.matches('[data-floating]') ? ['.site-header__inner'] : ['.site-header__start', '.site-nav']
  return parts.flatMap((part) => {
    const rect = header.querySelector(part)?.getBoundingClientRect()
    return rect && rect.width > 0 && rect.height > 0 ? [boxOf(rect)] : []
  })
}

/**
 * Hides the page's slivers while it is pictured (pieces.ts sliversInView), keeping each one's own inline visibility to
 * give back.
 */
function hideSlivers(r: Run) {
  r.hidden = sliversInView()
  r.hiddenWas = r.hidden.map((el) => el.style.getPropertyValue('visibility'))
  r.hidden.forEach((el) => el.style.setProperty('visibility', 'hidden'))
}

/** Shows the slivers again: once the page being left has been pictured, or when the change stops before that. */
function reveal(r: Run) {
  r.hidden.forEach((el, i) => {
    const was = r.hiddenWas[i]
    if (was) el.style.setProperty('visibility', was)
    else el.style.removeProperty('visibility')
  })
  r.hidden = []
  r.hiddenWas = []
}

/** The route's own element inside <main> (keyed by path in PageShell): replaced when the new page is in. */
const routeElement = () => document.querySelector<HTMLElement>('#main > .route-reveal')

/**
 * Resolves once the new page has replaced the old one and has its heading (or after `wait` ms regardless). Checked by
 * timer: the browser holds the picture of the old page meanwhile and runs no animation frames.
 */
function newPageIn(oldRoute: HTMLElement | null, path: string | null, wait = 900): Promise<void> {
  const started = performance.now()
  return new Promise((resolve) => {
    const check = () => {
      const route = routeElement()
      const moved = path ? window.location.pathname === path : true
      const done = moved && route && route !== oldRoute && !oldRoute?.isConnected && route.querySelector('h1')
      if (done || performance.now() - started > wait) resolve()
      else window.setTimeout(check, 8)
    }
    check()
  })
}

/**
 * The homepage types its words in when it first loads; arriving by a page change, its pieces fly in already whole
 * (a typing line inside a travelling piece would arrive empty), so their typing is finished at once.
 */
function finishTyping() {
  const hero = document.querySelector<HTMLElement>('.home .hero')
  if (!hero) return
  for (const a of hero.getAnimations({ subtree: true })) {
    if (a.effect?.getTiming().iterations === Infinity) continue
    try {
      a.finish()
    } catch {
      /* not finishable: leave it */
    }
  }
}

// ---------------------------------------------------------------------------
// The change
// ---------------------------------------------------------------------------

function begin(r: Run) {
  r.progress?.remove()
  r.progress = null
  const root = document.documentElement
  // The page's videos hold their frame while it is pictured: WebKit otherwise pictures a playing video on another
  // frame (the homepage's film cut to a different shot, the tiles blank) for the first frames of the change.
  r.paused = [...document.querySelectorAll<HTMLVideoElement>('video')].filter((v) => !v.paused)
  r.paused.forEach((v) => v.pause())
  // WebKit can still leave a video out of the picture on its first frames: each is covered by a still of its frame.
  r.stills = coverVideos()
  const reduced = prefersReducedMotion()
  root.setAttribute('data-shuffle', reduced ? 'fade' : 'move')
  const path = typeof r.to === 'string' ? r.to : null

  if (!reduced) {
    // The page's pieces, measured once.
    r.old = piecesInView(true)
    r.old.forEach((p, i) => name(r, p.el, `tx-o${i}`, p.role === 'piece' ? 'tx-out' : 'tx-main-out'))
    // A phone's held band (black, over the steps scrolled under it) is pictured over the leaving pieces, so the steps
    // under it stay under it as they go, and it goes once they have (Harlie's brief, 2026-09-28: they popped out above
    // it and around its moving picture, its thumbnails over their words).
    const { band } = coverOf()
    if (band) {
      name(r, band, 'tx-band', 'tx-band')
      r.band = band
      r.bandRect = boxOf(band.getBoundingClientRect())
    }
    for (const [selector, vtName, vtClass] of LIVE) {
      const el = document.querySelector<HTMLElement>(selector)
      if (el) name(r, el, vtName, vtClass)
    }
    r.headerFloats = headerFloats()
    r.headerBack = headerBack()
    r.header = headerBoxes()
    r.menu = Boolean(document.querySelector('.site-menu[data-open]'))
    hideSlivers(r)
  }

  const update = async () => {
    trace('update')
    if (run !== r || r.cancelled) return
    // The pieces of the page being left are pictured; the footer's stay mounted and must be free for the new page (and
    // its slivers seen again).
    unname(r.old.map((p) => p.el))
    if (r.band) unname([r.band])
    reveal(r)
    const oldRoute = routeElement()
    r.routed = true
    try {
      if (r.to === -1) {
        r.ownPop = true
        await r.opts.navigate(-1)
      } else {
        await r.opts.navigate(r.to, { state: r.opts.state, flushSync: true })
      }
    } catch {
      /* RouteError shows a failed page */
    }
    await newPageIn(oldRoute, path)
    trace('drawn', window.location.pathname)
    if (run !== r || r.cancelled || reduced) return
    // A new page that lands scrolled (Back to the homepage's projects): WebKit pictures its sticky header blank, so
    // the header was missing for the whole change. There, in WebKit only, the new header comes in with the page's own
    // picture instead, and the old one goes before that picture shows (choreograph). Chrome pictures it and keeps the
    // header's own crossfade (Harlie's QA pass, 2026-09-28: the workaround ran everywhere, and both headers showed for
    // about 120ms on every Back to the homepage, HOME drawn twice).
    if (window.scrollY > 0 && isWebKit()) {
      const header = r.named.find((el) => el.matches('.site-header'))
      if (header) {
        unname([header])
        r.headerInRoot = true
      }
    }
    const home = Boolean(document.querySelector('.home'))
    if (home) finishTyping()
    r.next = piecesInView(false, home ? undefined : r.stay)
    r.next.forEach((p, i) => name(r, p.el, `tx-n${i}`, p.role === 'piece' ? 'tx-in' : 'tx-main-in'))
  }

  let vt: ViewTransition
  try {
    vt = document.startViewTransition(update)
  } catch {
    reveal(r)
    unname(r.named)
    r.named = []
    root.removeAttribute('data-shuffle')
    resumeVideos(r)
    r.stills.forEach((c) => c.remove())
    r.stills = []
    return plain(r)
  }
  r.vt = vt
  trace('start')
  vt.ready.then(
    () => {
      trace('ready')
      if (run === r && !r.cancelled && !reduced) choreograph(r)
    },
    (e: unknown) => trace('ready failed', String(e)),
  )
  vt.updateCallbackDone.catch(() => {})
  vt.finished.then(
    () => complete(r),
    () => complete(r),
  )
  later(r, TIME.cap, () => {
    vt.skipTransition()
    complete(r)
  })
}

// ---------------------------------------------------------------------------
// The choreography
// ---------------------------------------------------------------------------

const html = () => document.documentElement

/** The lines drawn tight against a page's title, which come in with it (choreograph). */
const RIDERS = 'main .cx-meta, .home .hero__name, main .about-label, main .about-descriptor'

/** Every move of the running change (each held on its last frame until the change ends). */
const moves: Animation[] = []

/** Animates one of the change's pictures (a pseudo-element of the root), holding it before and after its move. */
function animate(pseudoElement: string, frames: Keyframe[], timing: KeyframeAnimationOptions) {
  moves.push(html().animate(frames, { ...timing, pseudoElement, fill: 'both' }))
}

/**
 * The browser places each piece's picture (its group) with a matrix; a pose is applied on top of it, so a piece leaves
 * from exactly how it looked (a hovered tile keeps its tilt) and arrives exactly where the live element is. The
 * keyframes are absolute (the group's matrix, then the pose), so the compositor runs them. A viewport offset is turned
 * into the group's own axes.
 */
function groupMatrix(vtName: string): DOMMatrix {
  const t = getComputedStyle(html(), `::view-transition-group(${vtName})`).transform
  try {
    return new DOMMatrix(t && t !== 'none' ? t : undefined)
  } catch {
    return new DOMMatrix()
  }
}

function poseTransform(m: DOMMatrix, p: Pose) {
  const dx = p.dx ?? 0
  const dy = p.dy ?? 0
  const det = m.a * m.d - m.b * m.c || 1
  const lx = (m.d * dx - m.c * dy) / det
  const ly = (-m.b * dx + m.a * dy) / det
  return `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) perspective(${DEPTH}px) rotateX(${(p.rx ?? 0).toFixed(2)}deg) rotateY(${(p.ry ?? 0).toFixed(2)}deg) rotate(${(p.r ?? 0).toFixed(2)}deg) scale(${(p.s ?? 1).toFixed(4)})`
}

/** Moves a named piece as planned: its transform on top of where the browser pictures it, and its opacity. */
function move({ vtName, poses, timing, fades }: Plan) {
  const m = groupMatrix(vtName)
  const base = m.isIdentity ? '' : `${m.toString()} `
  const pseudoElement = `::view-transition-group(${vtName})`
  const frames = poses.map((p) => ({ transform: base + poseTransform(m, p), ...(p.offset === undefined ? {} : { offset: p.offset }) }))
  animate(pseudoElement, frames, timing)
  animate(pseudoElement, fades.map((f) => ({ ...f })), { delay: timing.delay, duration: timing.duration, easing: 'linear' })
}

/** A piece in place (a new object each time: planned poses are adjusted before they run). */
const rest = (): Pose => ({})

/** How far a piece's lean may lift or drop the ends of its line (px; choreograph). */
const LEAN_LIFT = 12

type Named = Piece & { vtName: string }

function choreograph(r: Run) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // How far pieces sweep between pages: a share of the window, but never less than on a 900px one, so on a phone they
  // clearly travel (most of the way across) rather than nudge.
  const span = Math.max(vw, 900)
  // Words arriving on a narrow window travel a shorter way, fading in as they come, so a new title can be read inside
  // the window almost at once (Harlie's brief, 2026-09-28: on a phone they ran off its edge for about 240ms, "Spreadsheet
  // Ag…"). The pictures keep the long sweep.
  const reach = (p: Piece) => (vw < 700 && !p.el.matches(PICTURES) ? vw * 0.35 : span)
  const old: Named[] = r.old.map((p, i) => ({ ...p, vtName: `tx-o${i}` }))
  const next: Named[] = r.next.map((p, i) => ({ ...p, vtName: `tx-n${i}` }))
  const oldHero = old.find((p) => p.role === 'hero')
  const newHero = next.find((p) => p.role === 'hero')
  const newTitle = next.find((p) => p.role === 'title')
  // The way the pieces travel: out towards one side, in from the other.
  const flow = { x: r.opts.direction === 'back' ? 1 : -1 }
  trace('mode', `slide ${old.length}->${next.length}`)

  // The backgrounds: leaving or reaching the homepage's film, the old one fades out as its pieces leave (TIME.rootOut,
  // TIME.filmOut); the new one comes in under the arrivals. Between pages with the same black ground behind them, the
  // old stays whole.
  const leavingFilm = r.from === '/'
  // A page chosen from the open phone menu: the page being left was under the menu's opaque panel, so none of it is
  // seen again (below): the menu fades over black, then the new page builds itself (Harlie's QA pass, 2026-09-28).
  const unseen = [{ opacity: 0 }, { opacity: 0 }]
  if (r.menu) animate('::view-transition-old(root)', unseen, { duration: 1 })
  else if (leavingFilm !== (window.location.pathname === '/')) {
    animate('::view-transition-old(root)', [{ opacity: 1 }, { opacity: 0 }], { duration: leavingFilm ? TIME.filmOut : TIME.rootOut, easing: EASE.fade })
  }
  animate('::view-transition-new(root)', [{ opacity: 0 }, { opacity: 1 }], { delay: TIME.rootInAt, duration: TIME.rootIn, easing: EASE.fade })

  // The header: the old page's stays while its pieces start to leave, then crossfades into the new page's (what both
  // share stays steady: transition.css adds the two pictures' light), so BACK, the current item and the phone's
  // black bar change with the page rather than ahead of it.
  // When the header's contents stand elsewhere on the new page (the floating pill of a scrolled page becoming the full
  // bar, or Back coming or going to and from the homepage, which moves HOME along), they would show twice for the
  // crossfade, BACK and HOME drawn over each other as one garbled word: the old one goes first and the new one
  // follows once it has gone (2026-09-28; they overlapped for about 14ms).
  // The new page is pictured by now at its own scroll (its live header may not have caught up with it yet).
  const moved = r.headerFloats !== window.scrollY > 12 || r.headerBack !== headerBack()
  const headerFade = { delay: TIME.headerAt, duration: TIME.header, easing: 'linear' }
  // The new header in the page's own picture (WebKit, update()): the old one is gone before that picture comes in.
  // A page chosen from the open phone menu: the menu, pictured with the old header, goes at once and quickly, and the
  // new header follows (Harlie's QA pass, 2026-09-28: the menu stood still for about 300ms, then its rows crossed the
  // arriving title).
  const headerOut = r.headerInRoot
    ? { delay: 0, duration: TIME.rootInAt, easing: 'linear' }
    : r.menu
      ? { delay: TIME.menuOutAt, duration: TIME.menuOut, easing: 'linear' }
      : moved
        ? { ...headerFade, duration: TIME.header / 2 }
        : headerFade
  const headerIn = r.menu
    ? { ...headerFade, delay: TIME.menuOutAt + TIME.menuOut }
    : moved
      ? { ...headerFade, delay: TIME.headerAt + TIME.header / 2, duration: TIME.header / 2 }
      : headerFade
  animate('::view-transition-old(tx-header)', [{ opacity: 1 }, { opacity: 0 }], headerOut)
  animate('::view-transition-new(tx-header)', [{ opacity: 0 }, { opacity: 1 }], headerIn)

  // Every move is planned first, checked against the others (paths.ts), then run.
  const plans: Plan[] = []
  const plan = (p: Named, poses: Pose[], timing: Timing, fades: Fade[]): Plan => {
    const planned = { vtName: p.vtName, rect: p.rect, poses, timing, fades }
    plans.push(planned)
    return planned
  }

  // The columns (Harlie's request, 2026-09-28: each column animates "within its own area"). A page's main picture
  // beside its words keeps to its own column.
  const wordsOf = (list: Named[], hero?: Named) => list.filter((p) => p !== hero && !p.el.closest('.site-end')).map((p) => p.rect)
  const newLane: Lane | null = newHero ? laneOf(newHero.rect, wordsOf(next, newHero)) : null
  const oldLane: Lane | null = oldHero ? laneOf(oldHero.rect, wordsOf(old, oldHero)) : null

  // --- The pictures. Each page's main picture leaves and arrives by itself, inside its own column, like the other
  // pieces: it is never flown, grown or turned over into the other page's picture (Harlie's brief, 2026-10-12: a tile's
  // picture and the page's are often different photographs). The edge facing the words is the one turned away.
  const heroes: { out?: Plan; in?: Plan } = {}
  const carried = new Set<string>()
  if (oldHero && oldLane) {
    // Out towards its own side, away from its words.
    carried.add(oldHero.vtName)
    const side = oldLane.side
    heroes.out = plan(oldHero, [rest(), { dx: side * 0.22 * span, dy: (oldHero.y - vh / 2) * 0.2, s: 0.9, ry: -side * 30 }], { delay: 0, duration: TIME.out, easing: EASE.throw }, [
      { opacity: 1 },
      { opacity: 1, offset: 0.12 },
      { opacity: 0, offset: 0.5 },
      { opacity: 0 },
    ])
    holdInLane(heroes.out, oldLane, 1, 0)
  }
  if (newHero) {
    // The new picture comes in first, into its own column: from the first frame where there was no picture to leave
    // (Creative Production's end has none in view), so the window never shows no picture at all; otherwise as the old
    // one goes, and leaving the homepage as the first of the arrivals.
    carried.add(newHero.vtName)
    const spin = newLane ? -newLane.side : flow.x < 0 ? -1 : 1
    const start: Pose = { dx: -flow.x * 0.3 * span, dy: (newHero.y - vh / 2) * 0.45, s: 0.88, ry: spin * 40 }
    const at = oldHero || r.from === '/' ? TIME.inAt : 0
    heroes.in = plan(newHero, [start, rest()], { delay: at, duration: TIME.in, easing: EASE.glide }, [{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 1 }])
    if (newLane) holdInLane(heroes.in, newLane, 0, 0)
  }

  // The lines drawn tight against the new title come in with it, as one unit (the details under a case study's title,
  // the homepage's name over PORTFOLIO, About's label and descriptor; Harlie's brief, 2026-09-28: the details arrived
  // apart from their title). Planned once the title's way in is settled.
  const riders = newTitle ? next.filter((p) => p.el.matches(RIDERS)) : []
  riders.forEach((p) => carried.add(p.vtName))

  // --- Leaving: in turn from the leading edge, each remaining piece of the page being left is thrown out to one side.
  const leaving = old.filter((p) => !carried.has(p.vtName))
  leaving.sort((a, b) => b.x * flow.x - a.x * flow.x)
  const outStep = leaving.length > 1 ? Math.min(TIME.outStep, TIME.outSpread / (leaving.length - 1)) : 0
  // Where in its travel a leaving piece has faded out: well before the arrivals reach its part of the window. Reaching
  // the homepage, whose film shows through whatever is left, the words are gone by TIME.wordsOverFilm at the latest
  // (Harlie's QA pass, 2026-09-28: About's biography stayed at a quarter to a third of its strength over the film's
  // figure until about 440ms).
  const goneAt = 0.5
  const toFilm = window.location.pathname === '/'
  const goneBy = (p: Piece, delay: number) => (toFilm && !p.el.matches(PICTURES) ? Math.max(0.2, Math.min(goneAt, (TIME.wordsOverFilm - delay) / TIME.out)) : goneAt)
  // A piece's lean (deg) on its way: at most so much that a wide line's ends rise or fall LEAN_LIFT px, since the
  // words keep clear of each other by their level boxes (paths.ts; the About descriptor, 500px wide at 5°, dipped 22px
  // at its end, under the name above it).
  const lean = (p: Piece, deg: number) => Math.min(deg, (Math.asin(Math.min(1, (2 * LEAN_LIFT) / Math.max(1, p.rect.width))) * 180) / Math.PI)
  const gone = leaving.map((p, i) => {
    const tilt = lean(p, i % 2 ? 5 : 3)
    // Alternate pieces go to either side of their line, so neighbours part rather than travel as one slab.
    const side = i % 2 ? 1 : -1
    let end: Pose
    let delay = i * outStep
    if (p.rect.top > vh * 0.72) {
      // The bottom of the window (the footer's row, the last step) drops away while the rest is thrown to the side,
      // all of it at once (in turn, a piece falling from above would pass through the one below).
      end = { dx: flow.x * 0.06 * span, dy: 0.34 * vh, s: 0.9, r: side * tilt }
      delay = 0
    } else {
      // Thrown out to one side at different distances, spreading apart from the middle as they go, tilting either way.
      // Their heights keep their order, so neighbours never cross going out.
      const lane = [0.22, 0.48, 0.34, 0.41][i % 4]
      end = { dx: flow.x * lane * span, dy: (p.y - vh / 2) * 0.45, s: 0.86, r: side * tilt }
    }
    const fadeEnd = goneBy(p, delay)
    return plan(p, [rest(), end], { delay, duration: TIME.out, easing: EASE.throw }, [
      { opacity: 1 },
      { opacity: 1, offset: Math.min(0.12, fadeEnd - 0.1) },
      { opacity: 0, offset: fadeEnd },
      { opacity: 0 },
    ])
  })

  // --- Arriving: in reading order, each piece of the new page comes in from the other side, each from its own distance,
  // converging into its place. Their heights spread out from the middle of the window, keeping their order, so
  // neighbours never cross over each other's words on the way.
  const arriving = next.filter((p) => !carried.has(p.vtName))
  const inStep = arriving.length > 1 ? Math.min(TIME.inStep, TIME.inSpread / (arriving.length - 1)) : 0
  const come = arriving.map((p, i) => {
    const tilt = lean(p, i % 2 ? 5 : 3)
    const side = i % 2 ? -1 : 1
    const lane = [0.3, 0.46, 0.38, 0.52][i % 4]
    const start: Pose = { dx: -flow.x * lane * reach(p), dy: (p.y - vh / 2) * 0.45, s: 0.88, r: -side * tilt }
    return plan(p, [start, rest()], { delay: TIME.inAt + i * inStep, duration: TIME.in, easing: EASE.glide }, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1 }])
  })

  // Chosen from the open phone menu: the old page's pieces stay unseen (they were under the menu's panel), and so
  // nothing arriving waits for them.
  if (r.menu) for (const p of plans) if (p.vtName.startsWith('tx-o')) p.fades = unseen.map((f) => ({ ...f }))

  // --- The words keep clear (paths.ts; Harlie's requests, 2026-09-28: the product picture "should never cover the
  // project description", the biography "readable throughout"). Each leaving piece keeps clear of both pictures, of the
  // header's items (drawn over them) and of those that left before it; then each arriving piece of all of them and of
  // the new pieces before it.
  {
    const started = performance.now()
    // Every move is over by then, however late a piece waited.
    const until = 1300
    const flying = (list: (Plan | undefined)[]) => list.flatMap((p) => (p ? [obstacle(p, until)] : []))
    const header = [...r.header, ...headerBoxes()].map((box, i) => still(`tx-header-${i}`, box, until))
    const pictures = flying([heroes.out, heroes.in])
    const done: string[] = []
    const out = [...pictures, ...header]
    for (const p of gone) {
      done.push(keepClear(p, 1, out, until, false))
      out.push(obstacle(p, until, true))
    }
    const words: Obstacle[] = gone.map((p) => obstacle(p, until, true))
    // The new page's pieces left in its own picture at the window's edge (a step cut by the window's bottom): they show
    // as that picture comes in, so the pieces rising past them keep clear (Harlie's QA pass, 2026-09-28: at 360 × 740 a
    // step's words rose through the next step's heading at the bottom edge).
    const rootIn = (TIME.rootInAt + TIME.rootIn) / until
    const staying = r.stay.map((box, i) =>
      obstacle({ vtName: `tx-stay-${i}`, rect: boxOf(box), poses: [{}, {}], timing: { delay: 0, duration: until, easing: 'linear' }, fades: [{ opacity: 0 }, { opacity: 0, offset: TIME.rootInAt / until }, { opacity: 1, offset: rootIn }, { opacity: 1 }] }, until, true),
    )
    const over = [...pictures, ...words, ...staying, ...header]
    // The lines against the title: from where the title starts, with it, each one's place turned and scaled about the
    // title's centre as the title is, so they keep their spacing on the way.
    const withTitle = (t: Plan) => {
      const from = t.poses[0]
      const turn = ((from.r ?? 0) * Math.PI) / 180
      const size = from.s ?? 1
      for (const rider of riders) {
        const ox = rider.x - (t.rect.left + t.rect.right) / 2
        const oy = rider.y - (t.rect.top + t.rect.bottom) / 2
        const dx = (from.dx ?? 0) + (Math.cos(turn) * ox - Math.sin(turn) * oy) * size - ox
        const dy = (from.dy ?? 0) + (Math.sin(turn) * ox + Math.cos(turn) * oy) * size - oy
        const line = plan(rider, [{ dx, dy, s: size, r: from.r }, rest()], { ...t.timing }, t.fades.map((f) => ({ ...f })))
        done.push(keepClear(line, 0, over, until, true))
        over.push(obstacle(line, until, true))
      }
    }
    // Each arriving piece keeps clear of those before it in reading order too: neighbours never cross on the way in.
    come.forEach((p, i) => {
      done.push(keepClear(p, 0, over, until, true))
      over.push(obstacle(p, until, true))
      if (arriving[i] === newTitle) withTitle(p)
    })
    trace('clear', `${Math.round(performance.now() - started)}ms lane ${newLane ? `${newLane.side}@${Math.round(newLane.edge)}` : '-'} ${done.filter(Boolean).join(', ')}`)
  }

  // A phone's held band goes once the pieces passing under it have gone (or faded enough not to be read).
  if (r.band) {
    let clear: number = TIME.inAt
    for (const p of plans) {
      if (!p.vtName.startsWith('tx-o') || carried.has(p.vtName)) continue
      for (let T = p.timing.delay; T <= p.timing.delay + p.timing.duration; T += 12) {
        if (alphaAt(p, T) > 0.08) continue
        clear = Math.max(clear, T)
        break
      }
    }
    animate('::view-transition-old(tx-band)', r.menu ? unseen : [{ opacity: 1 }, { opacity: 0 }], { delay: r.menu ? 0 : Math.min(clear, TIME.bandAt), duration: TIME.bandOut, easing: EASE.fade })
  }

  if (import.meta.env.DEV) {
    const label = (name: string) => [...old, ...next].find((p) => p.vtName === name)?.el.className.split(' ')[0] ?? name
    window.__pageChangePlans = plans.map((p) => ({ ...p, label: label(p.vtName) }))
  }
  plans.forEach(move)
}

// ---------------------------------------------------------------------------
// Leaving the site
// ---------------------------------------------------------------------------

let leaving = false

/**
 * The creative portfolio is a separate site with its own full page load (Harlie's request: keep it). Its outgoing half
 * runs first: the page's pieces sweep out to the left, as they do for a change inside the site, while the page goes
 * dark, then the other site loads. Back to this page from the browser's cache undoes it at once. Reduced motion: the
 * page fades.
 */
export function leaveSite(href: string) {
  if (leaving) return
  leaving = true
  const reduced = prefersReducedMotion()
  const running: Animation[] = []
  const vw = window.innerWidth
  const pieces = reduced ? [] : piecesInView(true)
  pieces.forEach((p, i) => {
    const end = { transform: `translate(${(-[0.26, 0.4, 0.33][i % 3] * vw).toFixed(1)}px, 0) rotate(-4deg) scale(0.9)`, opacity: 0 }
    running.push(p.el.animate([{ offset: 0.3, opacity: 1 }, end], { delay: Math.min(i * TIME.outStep, TIME.outSpread), duration: TIME.out, easing: EASE.out, fill: 'forwards' }))
  })
  const fade = { delay: reduced ? 0 : 160, duration: reduced ? 180 : 360, easing: EASE.fade, fill: 'forwards' as const }
  running.push(document.body.animate([{ opacity: 1 }, { opacity: 0 }], fade))
  // The pointer is drawn in the top layer, outside the page: it goes with the page, and its outline round the clicked
  // item at once (Harlie's QA pass, 2026-09-28: the outline stayed bright on the darkened page until the other site
  // loaded).
  const cursor = document.querySelector<HTMLElement>('.custom-cursor')
  const ring = cursor?.querySelector<HTMLElement>('.custom-cursor__ring')
  if (ring) running.push(ring.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: EASE.fade, fill: 'forwards' }))
  if (cursor) running.push(cursor.animate([{ opacity: 1 }, { opacity: 0 }], fade))
  let gone = false
  const undo = () => {
    window.removeEventListener('pageshow', restore)
    window.removeEventListener('pagehide', onHide)
    running.forEach((a) => a.cancel())
    leaving = false
  }
  const restore = (e: PageTransitionEvent) => {
    if (e.persisted) undo()
  }
  const onHide = () => {
    gone = true
  }
  window.addEventListener('pageshow', restore)
  window.addEventListener('pagehide', onHide)
  window.setTimeout(() => {
    window.location.assign(href)
    // The other site never took over (the load was stopped, or stalls): this page comes back rather than staying dark.
    window.setTimeout(() => {
      if (!gone && document.visibilityState === 'visible') undo()
    }, LEAVE_GIVE_UP_MS)
  }, reduced ? 180 : 520)
}

/** How long after asking for the creative portfolio this page waits for it to take over before showing itself again. */
const LEAVE_GIVE_UP_MS = 3000

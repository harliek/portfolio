import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { FIELD, fieldPath, isExternalTile, isFree } from '../../content/field'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'
import { changePage, leaveSite } from '../transition/pageChange'
import { MetaLine } from '../layout/MetaLine'
import { isPlainClick, warmProject } from '../transition/warm'
import { headerHeight } from './headerHeight'
import { PlaneMedia } from './PlaneMedia'

const N = FIELD.length
const STORAGE_KEY = 'field-active'

/**
 * What each tile does, at the end of its link's name (a case study's otherwise). The Creative Portfolio tile loads
 * the separate creative site; it was announced as a case study (Harlie's brief, 2026-09-28, accessibility).
 */
const ACTION: Partial<Record<string, string>> = {
  about: 'Open the About page',
  creative: 'Open the creative portfolio (a separate site)',
}

/** The collection's own steady drift to the left, in projects per second (one project about every 6.5s). */
const SPEED = 1 / 6.5
/** How quickly the drift eases to a stop (keyboard focus, a drag, the pause control) and back up again (s). */
const EASE_V = 0.45
/** HOME while the tiles are in view: how long they glide back to the first tile (s). */
const RESET_GLIDE = 0.9

/** How much a hovered tile grows (home.css, .plane:hover .plane__frame) and the space it keeps from its neighbours. */
const HOVER_SCALE = 1.15
const HOVER_CLEAR = 16
/**
 * Windows this short (phones held sideways; the same query as home.css): the collection is exactly the room between
 * the header and the footer, the tile's top edge SHORT_TOP below its top, and the tile only as large as leaves its
 * caption whole under it, with SHORT_BOTTOM to spare.
 */
const SHORT = '(max-height: 520px)'
const SHORT_TOP = 12
const SHORT_BOTTOM = 8

interface Layout {
  w: number
  h: number
  /** From one tile's centre to the next (the tile's width plus the gap). */
  step: number
}

/**
 * One continuous strip (Harlie's request, 2026-09-26): every tile the same size, evenly spaced, at full brightness;
 * the tiles simply pass into and out of view. Each tile is about 30% of the window's width on wide screens, never
 * taller than the room left for its caption (`room`, the tallest the tile may be, when measured: short windows).
 *
 * Harlie's brief, 2026-09-28 (homepage polish): with a mouse or trackpad a hovered tile keeps at least 16px from its
 * neighbours (it grows by 7.5% of its width each side; at tablet widths it nearly touched them), and a tablet held
 * upright shows a larger tile (it was 20% of the window's height, with the film standing empty above and below it).
 */
function layoutFor(vw: number, vh: number, room = vh - headerHeight() - 200): Layout {
  const aspect = 1.6
  let w: number, gap: number
  if (vw >= 1100) {
    w = Math.min(vw * 0.3, room * aspect)
    gap = vw * 0.028
  } else if (vw >= 700) {
    w = Math.min(vw * (vh > vw ? 0.6 : 0.42), room * aspect)
    gap = vw * 0.035
  } else {
    w = Math.min(vw * 0.66, room * aspect)
    gap = vw * 0.045
  }
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) gap = Math.max(gap, ((HOVER_SCALE - 1) / 2) * w + HOVER_CLEAR)
  return { w, h: w / aspect, step: w + gap }
}

/**
 * How many tiles either side of the centred one can be in view (any part of one): the centred tile is at most half a
 * step from the middle, so a tile k steps from it can be in view while
 * k < (half the window + half a tile) / step + 0.5.
 */
const reachFor = (L: Layout) => Math.floor((window.innerWidth / 2 + L.w / 2) / L.step + 0.5)

/** v wrapped into [0, n). */
const mod = (v: number, n: number) => ((v % n) + n) % n
/** The shortest signed distance from b to a around the loop, in [-N/2, N/2). */
const around = (a: number, b: number) => mod(a - b + N / 2, N) - N / 2

/**
 * Where the field starts (Harlie's request): the first tile (field.ts) at the far left of the view, its left edge one
 * gap in from the window's edge (the tile before it just out of view).
 */
function startPosition(L = layoutFor(window.innerWidth, window.innerHeight)) {
  return Math.max(0, (window.innerWidth / 2 - (L.step - L.w) - L.w / 2) / L.step)
}

/**
 * Coming Back from a page opened here, the tile that was opened, centred (remembered for that return only); coming
 * Back from a case study opened directly (Header.tsx passes the page it came from, `from`), that project's tile
 * (Harlie's brief, 2026-09-28: Back returns to "the project last looked at", and the page folds into its tile). Any
 * other arrival, HOME included, starts from the beginning (Harlie's request, 2026-09-27: HOME resets the tile order).
 * `tile` is the remembered tile, or -1.
 */
function readStored(back: boolean, from: unknown): { pos: number; tile: number } {
  const opened = FIELD.findIndex((item) => item.id === from)
  if (opened >= 0) return { pos: opened, tile: opened }
  const start = { pos: startPosition(), tile: -1 }
  if (!back) return start
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const v = Number(raw)
    return raw !== null && Number.isInteger(v) && v >= 0 && v < N ? { pos: v, tile: v } : start
  } catch {
    return start
  }
}

/**
 * The page's end: the collection is the last thing on the page. A few pixels' tolerance: phones' toolbars and
 * rounding can leave the last scroll position just short.
 */
const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8

/**
 * Selected work (Harlie's v23 request). The projects form a loop (after the
 * last comes the first, both ways) that moves continuously to the left in one
 * steady motion, and keeps moving under the pointer (Harlie's request); it
 * eases to a stop only while a tile's link has keyboard focus or a tile is
 * being dragged. The page ends here: the
 * collection fills the window between the header and the footer, which sits
 * just below it, so the page never scrolls further; scrolling on down from
 * there (wheel, trackpad or a swipe) keeps moving the projects instead, so the
 * scroll never ends. Dragging, swiping sideways, horizontal scrolling (a
 * trackpad's sideways swipe or Shift with the wheel; right moves them right)
 * and the arrow keys move the tiles too; the drift simply carries on from
 * wherever they are left (no snapping).
 *
 * Hovering a tile (mouse or trackpad) enlarges it a little and lights it
 * slightly (home.css). Clicking any tile
 * unfolds its page out of it (pageChange.ts): the tile's picture becomes the
 * page's, and the page's pieces come out of the tile into their places.
 * There are no arrows, counter or visible label; a pause control appears for
 * keyboard users when focused (before the tiles in the tab order), just above
 * the strip's right end, and keyboard focus arriving here settles the page at
 * its end (Harlie's brief, 2026-09-28). Footage
 * plays muted at normal speed on every tile that can be in view,
 * continuing where it left off; a tile that has passed out of view on the
 * left waits on its last frame until it comes round again (or is dragged
 * back). The tiles form one flat strip: the same size
 * and brightness everywhere, evenly spaced (layoutFor). Reduced motion: no drift, moves without
 * animation, posters instead of footage.
 */
export function ProjectField() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const planeRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const location = useLocation()
  const navigationType = useNavigationType()
  // Back or Forward, or the Back button's way to the collection when there is no page to go back to (Header.tsx).
  const arrival = location.state as { toWork?: boolean; from?: unknown } | null
  const back = navigationType === 'POP' || Boolean(arrival?.toWork)
  const [initial] = useState(() => readStored(back, arrival?.from))
  const [active, setActive] = useState(() => mod(Math.round(initial.pos), N))
  const [running, setRunning] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [turning, setTurning] = useState(false)
  /** Tiles either side of the centred one that can be in view (reachFor), following the window's size. */
  const [reach, setReach] = useState(() => reachFor(layoutFor(window.innerWidth, window.innerHeight)))
  const m = useRef({
    /** The displayed position and the position it follows (unwrapped; the loop is taken modulo N). */
    pos: initial.pos,
    target: initial.pos,
    active: mod(Math.round(initial.pos), N),
    layout: null as Layout | null,
    /** The `reach` state, for the frame loop. */
    reach,
    tween: null as gsap.core.Tween | null,
    frozen: false,
    dragEndedAt: 0,
    /** The drift's current speed (projects per second), easing towards SPEED or 0. */
    v: 0,
    /** Reasons the drift eases to a stop. */
    focus: false,
    dragging: false,
    userPaused: false,
    /** Set while the arrow keys move focus, so the focus handler leaves the move alone. */
    keyed: false,
    /** The tiles are on screen (horizontal scrolling anywhere on the page then moves them). */
    visible: false,
    /**
     * Starts the frame loop again when it has stopped (the loop rests while nothing moves: paused, held or under
     * reduced motion). Everything that can set the tiles moving calls it; a no-op while the tiles are off screen.
     */
    wake: () => {},
  })

  const apply = useCallback(() => {
    const s = m.current
    const L = s.layout
    if (!L) return
    const half = window.innerWidth / 2
    for (let i = 0; i < N; i++) {
      const el = planeRefs.current[i]
      if (!el) continue
      const x = around(i, s.pos) * L.step
      el.style.transform = `translate3d(${(x - L.w / 2).toFixed(2)}px, ${(-L.h / 2).toFixed(2)}px, 0)`
      // Only a tile wholly outside the window is hidden (where the loop joins, it moves from one end to the other):
      // clipped away (home.css data-away), not made invisible, so every project stays a link a screen reader lists
      // (Harlie's QA pass, 2026-09-28: with visibility hidden, half of them were missing at any moment).
      const hide = Math.abs(x) - L.w / 2 > half + 60
      if (hide === el.hasAttribute('data-away')) continue
      el.toggleAttribute('data-away', hide)
      // Its footage: once out of view on the left (the side the drift leaves by) it pauses on its frame; brought back
      // into view (a drag) it carries on. Out of view on the right it keeps playing, so it arrives already moving.
      // One not loaded yet is loaded and started by the footage effect below.
      const video = videoRefs.current[i]
      if (!video) continue
      if (hide) {
        if (x < 0 && !video.paused) video.pause()
      } else if (
        video.paused &&
        video.hasAttribute('src') &&
        s.visible &&
        !prefersReducedMotion() &&
        document.visibilityState === 'visible' &&
        Math.abs(around(i, s.active)) <= Math.max(2, s.reach)
      ) {
        void video.play().catch(() => {})
      }
    }
    const centred = mod(Math.round(s.pos), N)
    if (centred !== s.active) {
      s.active = centred
      setActive(centred)
    }
  }, [])

  /** Moves the followed position to `to` over `duration` seconds (at once under reduced motion). */
  const glide = useCallback((to: number, duration: number, ease = 'power2.inOut') => {
    const s = m.current
    s.tween?.kill()
    if (prefersReducedMotion() || duration <= 0) {
      s.target = to
      s.tween = null
    } else s.tween = gsap.to(s, { target: to, duration, ease, overwrite: true, onComplete: () => (s.tween = null) })
    s.wake()
  }, [])

  /** The visitor moved the tiles: any glide to a project gives way (the drift carries on from where they are). */
  const took = useCallback(() => {
    const s = m.current
    s.tween?.kill()
    s.tween = null
    s.wake()
  }, [])

  /** Brings project i to the centre by the shorter way around the loop. */
  const goTo = useCallback(
    (i: number, duration = 0.6) => {
      const s = m.current
      const from = Math.round(s.target)
      took()
      glide(from + around(i, from), duration)
    },
    [glide, took],
  )

  /*
   * HOME while already here (a new entry for this page): the tiles start again from the first, as on arriving. While
   * any of them are in view (peeking under the opening as HOME scrolls the page back up, Header.tsx) they glide back
   * the shorter way round instead of jumping (Harlie's brief, 2026-09-28: no jumps); at once under reduced motion.
   */
  const arrivedAs = useRef(location.key)
  useEffect(() => {
    if (location.key === arrivedAs.current) return
    arrivedAs.current = location.key
    if (navigationType === 'POP') return
    const s = m.current
    const start = startPosition(s.layout ?? undefined)
    took()
    if (s.visible && !prefersReducedMotion()) {
      glide(s.target + around(start, s.target), RESET_GLIDE)
      return
    }
    s.pos = s.target = start
    apply()
  }, [location.key, navigationType, took, glide, apply])

  // A remembered project is for one return only: the next visit starts with the first tile again.
  useEffect(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* private mode */
    }
  }, [])

  /*
   * Back to a remembered tile (Harlie's brief, 2026-09-28, keyboard continuity): focus goes to that tile, not to the
   * page's title far above the restored strip, so the next Tab carries on from it. RouteFocus leaves this navigation
   * to the page (data-focus-managed, set once, before its effect runs); a pointer visitor sees no ring.
   */
  const focusClaimed = useRef(false)
  useLayoutEffect(() => {
    if (initial.tile < 0) return
    const main = document.getElementById('main')
    if (main && !focusClaimed.current) main.dataset.focusManaged = 'true'
    focusClaimed.current = true
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        planeRefs.current[initial.tile]?.focus({ preventScroll: true })
        // A first load (RouteFocus leaves those alone, so never reads the mark): the mark must not outlive it.
        if (main?.dataset.focusManaged === 'true') delete main.dataset.focusManaged
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [initial.tile])

  // Back from the creative portfolio (a full page load) can restore this page from the browser's cache as it was left:
  // bring the field back to life.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      m.current.frozen = false
      m.current.wake()
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  // Footage plays (muted, at normal speed) only on the tiles that can be in view while the field is on screen and the
  // tab is shown; pausing keeps its place, so a film is never restarted by the turning and loops only at its end.
  useEffect(() => {
    const pass = () => {
      const on = running && !reduced && document.visibilityState === 'visible'
      videoRefs.current.forEach((video, i) => {
        if (!video) return
        // Every tile that can be in view plays (the centred one and those either side, at least two each way), so
        // each arrives already moving; one that played and then passed out of view on the left waits (apply). A
        // tile beyond view on the left (the side the drift leaves by) that has never been loaded stays unloaded:
        // the drift carries it away, and it loads as it comes round from the right, or once moved back into view.
        const k = around(i, active)
        const near = Math.abs(k) <= Math.max(2, reach)
        if (near && k >= -reach && !video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
        video.defaultPlaybackRate = 1
        video.playbackRate = 1
        const gone = Boolean(planeRefs.current[i]?.hasAttribute('data-away')) && around(i, m.current.pos) < 0 && video.played.length > 0
        if (near && on && !gone && video.hasAttribute('src')) void video.play().catch(() => {})
        else if (!video.paused) video.pause()
      })
    }
    pass()
    // The site pauses every video in a hidden tab (useMediaPlayback); shown again, the tiles carry on.
    document.addEventListener('visibilitychange', pass)
    return () => document.removeEventListener('visibilitychange', pass)
  }, [active, running, reduced, reach])

  /*
   * Layout follows the window, measured before the first paint. The tiles' size goes on the homepage as --plane-w and
   * --plane-h (home.css sizes the opening, the tiles and the shade under the captions with it: one source, no copies of
   * these sizes in the stylesheet); the page ends with the collection and the footer just below it, whose height is
   * kept in --footer-h. On a short window (SHORT) the tile is as large as leaves its caption whole below it, measured.
   */
  useLayoutEffect(() => {
    const section = sectionRef.current
    const home = section?.closest<HTMLElement>('.home')
    if (!section || !home) return
    const s = m.current
    const footer = document.querySelector<HTMLElement>('.site-end')
    const short = window.matchMedia(SHORT)
    const write = (L: Layout) => {
      home.style.setProperty('--plane-w', `${L.w}px`)
      home.style.setProperty('--plane-h', `${L.h}px`)
    }
    let first = true
    const measure = () => {
      if (footer) home.style.setProperty('--footer-h', `${Math.ceil(footer.getBoundingClientRect().height)}px`)
      const vw = window.innerWidth
      const vh = window.innerHeight
      let L = layoutFor(vw, vh)
      if (short.matches) {
        // From the widest tile down: at each width the tallest caption is measured, and the tile shrinks to the room
        // it leaves until it fits (a narrower tile can wrap its caption onto another line, so a few passes).
        const field = section.clientHeight
        L = layoutFor(vw, vh, Infinity)
        for (let pass = 0; pass < 4; pass++) {
          write(L)
          const caption = Math.max(0, ...planeRefs.current.map((p) => p?.querySelector<HTMLElement>('.plane__caption')?.offsetHeight ?? 0))
          const fits = layoutFor(vw, vh, field - SHORT_TOP - SHORT_BOTTOM - caption)
          if (fits.w >= L.w - 1) break
          L = fits
        }
      }
      write(L)
      // A first visit starts with the first tile at the far left of this layout.
      if (first && initial.tile < 0) s.pos = s.target = startPosition(L)
      first = false
      s.layout = L
      s.reach = reachFor(L)
      setReach(s.reach)
      apply()
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = footer ? new ResizeObserver(() => measure()) : null
    if (footer) ro?.observe(footer)
    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
      for (const name of ['--footer-h', '--plane-w', '--plane-h']) home.style.removeProperty(name)
    }
  }, [apply, initial.tile])

  // Visibility: the frame loop, the turning and the tile films run whenever any of the tiles is on screen, even while
  // they only peek under the opening before the page is scrolled (Harlie's request: they move from the start).
  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting))
    io.observe(stage)
    // Any part of the tiles on screen, even peeking under the title, counts for horizontal scrolling.
    const seen = new IntersectionObserver(([e]) => {
      m.current.visible = e.isIntersecting
    })
    if (stageRef.current) seen.observe(stageRef.current)
    return () => {
      io.disconnect()
      seen.disconnect()
    }
  }, [])

  /*
   * The frame loop: the collection drifts steadily to the left (easing to a stop while it is held), and the displayed
   * position follows the followed one (quickly; at once under reduced motion). Once nothing moves (held, paused or
   * under reduced motion, at rest, no glide under way) the loop stops, and `wake` starts it again (Harlie's brief,
   * 2026-09-28, code cleanup: no frame every frame for a still strip); frozen (a tile opening), it waits the same way.
   */
  useEffect(() => {
    if (!running) return
    const s = m.current
    let last = 0
    let wasTurning = false
    let frame = 0
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      if (s.frozen) {
        last = 0
        return
      }
      const reducedNow = prefersReducedMotion()
      // Hovering does not stop it (Harlie's request: keep moving); keyboard focus and dragging do.
      const held = s.focus || s.dragging || s.userPaused || reducedNow || document.hidden
      const want = held ? 0 : SPEED
      s.v += (want - s.v) * (1 - Math.exp(-dt / EASE_V))
      if (Math.abs(s.v - want) < 0.0005) s.v = want
      if (!s.tween && s.v) s.target += s.v * dt
      const turning = s.v > 0.01
      if (turning !== wasTurning) {
        wasTurning = turning
        setTurning(turning)
      }
      const gap = s.target - s.pos
      const step = reducedNow ? gap : gap * (1 - Math.exp(-dt / 0.06))
      if (Math.abs(gap) > 0.0002) {
        s.pos += step
        apply()
      } else if (s.pos !== s.target) {
        s.pos = s.target
        apply()
      }
      if (want === 0 && s.v === 0 && !s.tween && s.pos === s.target) {
        last = 0
        return
      }
      frame = requestAnimationFrame(tick)
    }
    s.wake = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    s.wake()
    // Whatever else holds or frees the drift: the tab hidden or shown, reduced motion turned on or off.
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wake = () => s.wake()
    document.addEventListener('visibilitychange', wake)
    reducedQuery.addEventListener('change', wake)
    return () => {
      cancelAnimationFrame(frame)
      frame = 0
      s.wake = () => {}
      document.removeEventListener('visibilitychange', wake)
      reducedQuery.removeEventListener('change', wake)
      setTurning(false)
    }
  }, [running, apply])

  /**
   * Opens project i: its page unfolds out of the tile (pageChange.ts), or the creative portfolio loads after the
   * homepage's outgoing half; the field stops moving first, and moves on again if the change is stopped.
   */
  const open = (i: number) => {
    const item = FIELD[i]
    m.current.tween?.kill()
    m.current.tween = null
    // Remember the opened project for Back.
    try {
      sessionStorage.setItem(STORAGE_KEY, String(i))
    } catch {
      /* private mode */
    }
    const from = planeRefs.current[i]?.querySelector<HTMLElement>('.plane__frame') ?? null
    m.current.frozen = true
    if (isExternalTile(item)) {
      leaveSite(fieldPath(item), from)
      return
    }
    const unfreeze = () => {
      m.current.frozen = false
      m.current.wake()
    }
    const started = changePage({ to: fieldPath(item), navigate, from, onCancel: unfreeze })
    if (started === 'ignored') unfreeze()
  }

  const onPlaneClick = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    // A click that ends a drag does not open the tile (the event's own time, on performance.now()'s clock).
    if (e.timeStamp - m.current.dragEndedAt < 350) {
      e.preventDefault()
      return
    }
    if (!isPlainClick(e)) return
    e.preventDefault()
    if (m.current.frozen) return
    open(i)
  }

  /** Space opens like Enter; the arrow keys move around the loop (focus follows the centred tile). */
  const onPlaneKey = (e: KeyboardEvent<HTMLAnchorElement>, i: number) => {
    if (e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
      return
    }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const j = mod(i + (e.key === 'ArrowRight' ? 1 : -1), N)
    goTo(j)
    m.current.keyed = true
    planeRefs.current[j]?.focus({ preventScroll: true })
    m.current.keyed = false
  }

  const togglePause = () => {
    const next = !m.current.userPaused
    m.current.userPaused = next
    if (next) {
      m.current.tween?.kill()
      m.current.tween = null
    }
    m.current.wake()
    setUserPaused(next)
  }

  // Drag and swipe (horizontal) and horizontal trackpad gestures move the tiles directly, then settle.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const s = m.current
    const slot = () => s.layout?.step || 400
    let drag: { id: number; x: number; y0: number; x0: number; moved: boolean } | null = null
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || s.frozen || e.pointerType === 'touch') return
      drag = { id: e.pointerId, x: e.clientX, x0: e.clientX, y0: e.clientY, moved: false }
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (!drag.moved) {
        const dx0 = e.clientX - drag.x0
        if (Math.abs(dx0) < 6 || Math.abs(dx0) < Math.abs(e.clientY - drag.y0)) return
        drag.moved = true
        s.dragging = true
        stage.setPointerCapture(e.pointerId)
      }
      const dx = e.clientX - drag.x
      drag.x = e.clientX
      took()
      s.target -= dx / slot()
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.moved) {
        s.dragEndedAt = performance.now()
        s.dragging = false
        s.wake()
      }
      drag = null
    }
    // Scrolling down from the page's end (atEnd) moves the collection on.
    const pixels = (d: number, mode: number) => (mode === 1 ? d * 16 : mode === 2 ? d * window.innerHeight : d)
    // Horizontal scrolling (trackpad swipes, Shift + wheel) anywhere on the page while the tiles are on screen moves
    // them the same way as the scroll (right moves them right), one to one; it never becomes the browser's back or
    // forward gesture here. Scrolling down once the page has reached its end moves them on to the left.
    const wheel = (e: WheelEvent) => {
      if (!s.visible || s.frozen) return
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0)
      const dy = e.shiftKey ? 0 : e.deltaY
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault()
        took()
        // The projects move the way the scroll goes (Harlie's request): a swipe to the right carries them right.
        s.target += pixels(dx, e.deltaMode) / slot()
        return
      }
      if (dy > 0 && atEnd()) {
        e.preventDefault()
        took()
        s.target += pixels(dy, e.deltaMode) / slot()
      }
    }
    // Touch: a horizontal swipe moves between projects; vertical swipes scroll the page.
    let touch: { x: number; y: number; horizontal: boolean | null } | null = null
    const tStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch = { x: t.clientX, y: t.clientY, horizontal: null }
    }
    const tMove = (e: TouchEvent) => {
      if (!touch) return
      const t = e.touches[0]
      const dx = t.clientX - touch.x
      if (touch.horizontal === null && Math.hypot(dx, t.clientY - touch.y) > 8) touch.horizontal = Math.abs(dx) > Math.abs(t.clientY - touch.y)
      if (!touch.horizontal) return
      touch.x = t.clientX
      s.dragging = true
      took()
      s.target -= dx / slot()
    }
    const tEnd = () => {
      if (touch?.horizontal) {
        s.dragEndedAt = performance.now()
        s.dragging = false
        s.wake()
      }
      touch = null
    }
    // A vertical swipe that would scroll on down past the page's end moves the projects on instead.
    let lastY: number | null = null
    const vStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? null
    }
    const vMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (y === undefined || lastY === null || touch?.horizontal) {
        lastY = y ?? null
        return
      }
      const dy = lastY - y
      lastY = y
      if (dy > 0 && s.visible && !s.frozen && atEnd()) {
        took()
        s.target += dy / slot()
      }
    }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('touchstart', vStart, { passive: true })
    window.addEventListener('touchmove', vMove, { passive: true })
    stage.addEventListener('touchstart', tStart, { passive: true })
    stage.addEventListener('touchmove', tMove, { passive: true })
    stage.addEventListener('touchend', tEnd)
    stage.addEventListener('touchcancel', tEnd)
    return () => {
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', vStart)
      window.removeEventListener('touchmove', vMove)
      stage.removeEventListener('touchstart', tStart)
      stage.removeEventListener('touchmove', tMove)
      stage.removeEventListener('touchend', tEnd)
      stage.removeEventListener('touchcancel', tEnd)
    }
  }, [took])

  return (
    <section
      ref={sectionRef}
      id="selected-work"
      className="field"
      aria-labelledby="field-label"
      data-reduced={reduced || undefined}
      onFocus={(e) => {
        // Keyboard focus coming into the collection (the pause control or a tile): the page settles at its end, where
        // the strip sits clear of the header; the browser's own focus scroll stopped part way, with PORTFOLIO cut under
        // the navigation (Harlie's brief, 2026-09-28).
        if (!e.target.matches(':focus-visible') || atEnd()) return
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }}
    >
      <div className="field__pin">
        {/* The section's name for screen readers; nothing shows over the tiles (Harlie's request). */}
        <h2 className="visually-hidden" id="field-label">
          Selected work
        </h2>
        {!reduced && (
          <button type="button" className="field__motion" aria-pressed={userPaused} onClick={togglePause}>
            {userPaused ? 'Resume the moving projects' : 'Pause the moving projects'}
          </button>
        )}
        <div
          ref={stageRef}
          className="field__stage"
          onFocus={(e) => {
            // Keyboard focus holds the drift at once, so the focused tile stays centred (it drifted about 30px on as
            // it eased to a stop); a tile focused for a pointer visitor, as on the way Back, does not hold it.
            const held = e.target.matches(':focus-visible')
            m.current.focus = held
            if (held) m.current.v = 0
            m.current.wake()
          }}
          onBlur={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
            m.current.focus = false
            m.current.wake()
          }}
        >
          {FIELD.map((item, i) => {
            const path = fieldPath(item)
            return (
              <a
                key={item.id}
                ref={(el) => {
                  planeRefs.current[i] = el
                }}
                className="plane"
                data-kind={item.media.kind}
                data-free={isFree(item.media) || undefined}
                href={path}
                aria-label={`${item.title}. ${item.alt}. ${ACTION[item.id] ?? 'Open the case study'}`}
                aria-current={i === active ? 'true' : undefined}
                draggable={false}
                onClick={(e) => onPlaneClick(e, i)}
                onKeyDown={(e) => onPlaneKey(e, i)}
                onFocus={(e) => {
                  // Tabbed to: the tile glides to the centre (the arrow keys move it themselves).
                  if (!m.current.keyed && e.currentTarget.matches(':focus-visible') && Math.abs(around(i, m.current.pos)) > 0.005) goTo(i, 0.4)
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') warmProject(path)
                }}
              >
                <span className="plane__frame">
                  <span className="plane__media" data-kind={item.media.kind} data-free={isFree(item.media) || undefined}>
                    <PlaneMedia
                      item={item}
                      videoRef={(el) => {
                        videoRefs.current[i] = el
                      }}
                    />
                  </span>
                </span>
                <span className="plane__caption" aria-hidden="true">
                  <span className="plane__title">{item.title}</span>
                  <span className="plane__line">
                    <MetaLine text={item.line} />
                  </span>
                </span>
              </a>
            )
          })}
        </div>
        {/* Announced only while the collection is still (not on every automatic turn). */}
        <p className="visually-hidden" aria-live={turning ? 'off' : 'polite'}>
          {FIELD[active].title}, {active + 1} of {N}
        </p>
      </div>
    </section>
  )
}

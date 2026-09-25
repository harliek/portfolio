import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELD, isFree } from '../../content/field'
import { projectById, projectPath } from '../../content/projects'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'
import { expandFrame } from '../transition/expandFrame'
import { isPlainClick, warmProject } from '../transition/projectTransition'
import { PlaneMedia } from './PlaneMedia'

const N = FIELD.length
const STORAGE_KEY = 'field-active'
const HEADER = 61

/** The collection's own steady drift to the left, in projects per second (one project about every 6.5s). */
const SPEED = 1 / 6.5
/** How quickly the drift eases to a stop (hover, focus) and back up again (s). */
const EASE_V = 0.45

interface Layout {
  w: number
  h: number
  /** Per depth step 0..2: scale, horizontal offset (px), veil opacity. */
  scale: number[]
  x: number[]
  veil: number[]
}

/**
 * Composition per viewport (brief v19; a little smaller since v26): the centred tile at about 34% of the
 * window's width, never taller than the room left for its caption; its
 * neighbours at 82%, clearly visible and only lightly veiled.
 */
function layoutFor(vw: number, vh: number): Layout {
  const room = vh - HEADER - 200
  const aspect = 1.6
  let w: number, scale: number[], veil: number[], gap: number
  if (vw >= 1100) {
    w = Math.min(vw * 0.34, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.2, 0.45]
    gap = vw * 0.03
  } else if (vw >= 700) {
    w = Math.min(vw * 0.47, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.22, 0.45]
    gap = vw * 0.035
  } else {
    w = Math.min(vw * 0.68, room * aspect)
    scale = [1, 0.84, 0.7]
    veil = [0, 0.25, 0.5]
    gap = vw * 0.045
  }
  const x = [0]
  for (let k = 1; k < 3; k++) x.push(x[k - 1] + (w * (scale[k - 1] + scale[k])) / 2 + gap)
  return { w, h: w / aspect, scale, x, veil }
}

const lerpSteps = (steps: number[], a: number) => {
  if (a >= steps.length - 1) return steps[steps.length - 1]
  const k = Math.floor(a)
  return steps[k] + (steps[k + 1] - steps[k]) * (a - k)
}

/** v wrapped into [0, n). */
const mod = (v: number, n: number) => ((v % n) + n) % n
/** The shortest signed distance from b to a around the loop, in [-N/2, N/2). */
const around = (a: number, b: number) => mod(a - b + N / 2, N) - N / 2

function readStored() {
  try {
    const v = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isInteger(v) && v >= 0 && v < N ? v : 0
  } catch {
    return 0
  }
}

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
 * slightly (home.css); the cursor stays the system's own. Clicking any tile
 * opens its case study (its picture travels into the page, expandFrame).
 * There are no arrows, counter or visible label; a pause control appears for
 * keyboard users when focused (before the tiles in the tab order). Footage
 * plays muted at normal speed on the centred tile and its neighbours,
 * continuing where it left off. Reduced motion: no drift, moves without
 * animation, posters instead of footage.
 */
export function ProjectField() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const planeRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const veilRefs = useRef<(HTMLSpanElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const pinRef = useRef<HTMLDivElement>(null)
  const [initial] = useState(readStored)
  const [active, setActive] = useState(initial)
  const [running, setRunning] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [turning, setTurning] = useState(false)
  const m = useRef({
    /** The displayed position and the position it follows (unwrapped; the loop is taken modulo N). */
    pos: initial,
    target: initial,
    active: initial,
    layout: null as Layout | null,
    tween: null as gsap.core.Tween | null,
    frozen: false,
    dragEndedAt: 0,
    /** The drift's current speed (projects per second), easing towards SPEED or 0. */
    v: 0,
    /** Reasons the drift eases to a stop. */
    hover: false,
    focus: false,
    dragging: false,
    userPaused: false,
    /** Set while the arrow keys move focus, so the focus handler leaves the move alone. */
    keyed: false,
    /** The tiles are on screen (horizontal scrolling anywhere on the page then moves them). */
    visible: false,
  })

  const apply = useCallback(() => {
    const s = m.current
    const L = s.layout
    if (!L) return
    for (let i = 0; i < N; i++) {
      const el = planeRefs.current[i]
      if (!el) continue
      const d = around(i, s.pos)
      const a = Math.abs(d)
      const side = Math.sign(d)
      const sc = lerpSteps(L.scale, a)
      const x = side * lerpSteps(L.x, a)
      el.style.transform = `translate3d(${(x - L.w / 2).toFixed(2)}px, ${(-L.h / 2).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`
      el.style.zIndex = String(100 - Math.round(a * 10))
      el.style.visibility = a > 2.2 ? 'hidden' : ''
      el.style.setProperty('--depth', Math.min(1, a).toFixed(3))
      const v = lerpSteps(L.veil, a).toFixed(3)
      const veil = veilRefs.current[i]
      if (veil) veil.style.opacity = v
      el.style.setProperty('--veil', v)
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
      return
    }
    s.tween = gsap.to(s, { target: to, duration, ease, overwrite: true, onComplete: () => (s.tween = null) })
  }, [])

  /** The visitor moved the tiles: any glide to a project gives way (the drift carries on from where they are). */
  const took = useCallback(() => {
    const s = m.current
    s.tween?.kill()
    s.tween = null
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

  // Remember the project for Back.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(active))
    } catch {
      /* private mode */
    }
  }, [active])

  // Footage plays (muted, at normal speed) only on the centred tile and its neighbours while the field is on
  // screen; pausing keeps its place, so a film is never restarted by the turning and loops only at its end.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      const near = Math.abs(around(i, active)) <= 1
      if (near && !video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
      video.defaultPlaybackRate = 1
      video.playbackRate = 1
      if (near && running && !reduced) void video.play().catch(() => {})
      else if (!video.paused) video.pause()
    })
  }, [active, running, reduced])

  // Layout follows the window.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const L = layoutFor(window.innerWidth, window.innerHeight)
      m.current.layout = L
      stage.style.setProperty('--plane-w', `${L.w}px`)
      stage.style.setProperty('--plane-h', `${L.h}px`)
      apply()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [apply])

  // The page ends with the collection and the footer just below it: the footer's height is kept in --footer-h
  // (home.css sizes the opening and the collection with it).
  useLayoutEffect(() => {
    const home = sectionRef.current?.closest<HTMLElement>('.home')
    const footer = document.querySelector<HTMLElement>('.site-end')
    if (!home || !footer) return
    const measure = () => home.style.setProperty('--footer-h', `${Math.ceil(footer.getBoundingClientRect().height)}px`)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(footer)
    return () => {
      ro.disconnect()
      home.style.removeProperty('--footer-h')
    }
  }, [])

  // Visibility: the frame loop and the turning run only while the field is near the viewport.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: '15% 0px' })
    io.observe(section)
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

  // The frame loop: the collection drifts steadily to the left (easing to a stop while it is held), and the
  // displayed position follows the followed one (quickly; at once under reduced motion).
  useEffect(() => {
    if (!running) return
    const s = m.current
    let last = performance.now()
    let wasTurning = false
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (s.frozen) return
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
    })
    return () => {
      cancelAnimationFrame(frame)
      setTurning(false)
    }
  }, [running, apply])

  /** Freezes the centred picture and carries it into the case study; the rest recede and the captions fade first. */
  const open = (i: number) => {
    const item = FIELD[i]
    m.current.tween?.kill()
    expandFrame({
      media: planeRefs.current[i]?.querySelector<HTMLElement>('.plane__media') ?? null,
      path: projectPath(projectById(item.id)),
      navigate,
      onStart: () => {
        m.current.frozen = true
        sectionRef.current?.closest('.home')?.setAttribute('data-leaving', '')
        document.querySelector('.home-film')?.setAttribute('data-leaving', '')
      },
    })
  }

  const onPlaneClick = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (performance.now() - m.current.dragEndedAt < 350) {
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
    if (next) m.current.tween?.kill()
    setUserPaused(next)
  }

  // Drag and swipe (horizontal) and horizontal trackpad gestures move the tiles directly, then settle.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const s = m.current
    const slot = () => s.layout?.x[1] || 400
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
        stage.dataset.dragging = ''
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
        delete stage.dataset.dragging
      }
      drag = null
    }
    // The page's end: the collection is the last thing on the page, so scrolling down from there moves it on.
    // A few pixels' tolerance: phones' toolbars and rounding can leave the last scroll position just short.
    const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
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
    >
      <div ref={pinRef} className="field__pin">
        {/* The section's name for screen readers; nothing shows over the tiles (Harlie's request). */}
        <h2 className="visually-hidden" id="field-label">
          Selected work
        </h2>
        {!reduced && (
          <button type="button" className="field__motion" aria-pressed={userPaused} onClick={togglePause}>
            {userPaused ? 'Resume automatic rotation' : 'Pause automatic rotation'}
          </button>
        )}
        <div
          ref={stageRef}
          className="field__stage"
          onFocus={() => {
            m.current.focus = true
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) m.current.focus = false
          }}
        >
          {FIELD.map((item, i) => {
            const project = projectById(item.id)
            return (
              <a
                key={item.id}
                ref={(el) => {
                  planeRefs.current[i] = el
                }}
                className="plane"
                data-kind={item.media.kind}
                data-free={isFree(item.media) || undefined}
                href={projectPath(project)}
                aria-label={`${item.title}. ${item.alt}. Open the case study`}
                aria-current={i === active ? 'true' : undefined}
                draggable={false}
                onClick={(e) => onPlaneClick(e, i)}
                onKeyDown={(e) => onPlaneKey(e, i)}
                onFocus={(e) => {
                  if (!m.current.keyed && e.currentTarget.matches(':focus-visible') && i !== m.current.active) goTo(i, 0)
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'mouse') return
                  m.current.hover = true
                  warmProject(projectPath(project))
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') m.current.hover = false
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
                  <span
                    className="plane__veil"
                    ref={(el) => {
                      veilRefs.current[i] = el
                    }}
                  />
                </span>
                <span className="plane__caption" aria-hidden="true">
                  <span className="plane__title">{item.title}</span>
                  <span className="plane__line">{item.line}</span>
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

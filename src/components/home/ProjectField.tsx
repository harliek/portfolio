import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELD, FIELD_YEARS } from '../../content/field'
import { projectById, projectPath } from '../../content/projects'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'
import { expandFrame } from '../transition/expandFrame'
import { isPlainClick, warmProject } from '../transition/projectTransition'
import { PlaneMedia } from './PlaneMedia'

const N = FIELD.length
const STORAGE_KEY = 'field-active'
const HEADER = 61

/** Scroll distance per project, as a share of the window's height: one ordinary wheel or trackpad gesture moves one project. */
const STEP = 0.28
/** Homepage footage plays at twice its speed (a quick preview, muted). */
const PREVIEW_RATE = 2

interface Layout {
  w: number
  h: number
  /** Per depth step 0..2: scale, horizontal offset (px), veil opacity. */
  scale: number[]
  x: number[]
  veil: number[]
}

/**
 * Composition per viewport (brief v19): the centred tile at about 38% of the
 * window's width, never taller than the room left for its caption; its
 * neighbours at 82%, clearly visible and only lightly veiled.
 */
function layoutFor(vw: number, vh: number): Layout {
  const room = vh - HEADER - 200
  const aspect = 1.6
  let w: number, scale: number[], veil: number[], gap: number
  if (vw >= 1100) {
    w = Math.min(vw * 0.38, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.2, 0.45]
    gap = vw * 0.03
  } else if (vw >= 700) {
    w = Math.min(vw * 0.52, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.22, 0.45]
    gap = vw * 0.035
  } else {
    w = Math.min(vw * 0.74, room * aspect)
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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
/** v wrapped into [0, n). */
const mod = (v: number, n: number) => ((v % n) + n) % n
/** The shortest signed distance from b to a around a loop of n, in [-n/2, n/2). */
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
 * Selected work (brief v19). The projects form a loop: the tile after the
 * last is the first, on both sides, with no reset, gap or reversal. Once the
 * collection reaches its place under the header it stays put (a sticky pin)
 * while vertical scrolling moves the tiles: the scroll position within the
 * pin maps to one full turn of the loop, about 28% of a window's height per
 * project, so an ordinary wheel or trackpad gesture moves one project
 * promptly, and the page settles on it in the direction of travel. After the
 * turn (back at the first project) the page continues to its end, and
 * scrolling up at the start returns to the title: no trap, no blank stretch,
 * no idle drift to fight the visitor.
 *
 * Drag, swipe, horizontal trackpad gestures and the arrow keys move the same
 * scroll position and wrap around the loop without end (the pin's two ends
 * show the same arrangement, so the jump between them is invisible). There
 * are no buttons and no counter. Each tile carries its own title and
 * one-sentence line. Clicking the centred tile opens its case study (the
 * picture travels into the page, expandFrame); clicking a neighbour brings
 * it to the centre. Keyboard: each tile is a link; focusing one centres it;
 * Enter opens it. Footage plays muted at twice its speed on the centred tile
 * and its neighbours only. Reduced motion: the same mapping without easing
 * or settling, and posters instead of footage.
 */
export function ProjectField() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const planeRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const veilRefs = useRef<(HTMLSpanElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [initial] = useState(readStored)
  const [active, setActive] = useState(initial)
  const [running, setRunning] = useState(false)
  const m = useRef({
    pos: initial,
    target: initial,
    active: initial,
    layout: null as Layout | null,
    trigger: null as ScrollTrigger | null,
    frozen: false,
    dragEndedAt: 0,
    /** Set while the arrow keys move focus, so the focus handler leaves the smooth move alone. */
    keyed: false,
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

  // Remember the project for Back.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(active))
    } catch {
      /* private mode */
    }
  }, [active])

  // Footage plays (muted, at twice its speed) only on the centred tile and its neighbours, while the field is on screen.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      const near = Math.abs(around(i, active)) <= 1
      if (near && !video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
      video.defaultPlaybackRate = PREVIEW_RATE
      video.playbackRate = PREVIEW_RATE
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

  // The pin's scroll range maps to one turn of the loop; the page settles on a project in the direction of travel.
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const s = m.current
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: `top top+=${HEADER}`,
      end: 'bottom bottom',
      onUpdate: (self) => {
        s.target = self.progress * N
      },
      snap: prefersReducedMotion() ? undefined : { snapTo: 1 / N, directional: true, duration: { min: 0.18, max: 0.4 }, delay: 0.08, ease: 'power2.out', inertia: false },
    })
    s.trigger = trigger
    s.target = trigger.progress * N
    return () => {
      trigger.kill()
      s.trigger = null
    }
  }, [])

  // Visibility: the frame loop runs only while the field is near the viewport.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: '15% 0px' })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  // The frame loop: the displayed position eases toward the scroll's (instantly under reduced motion).
  useEffect(() => {
    if (!running) return
    const s = m.current
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (s.frozen) return
      // Around the loop by the shorter way, so the jump between the pin's two ends never shows.
      const gap = around(s.target, s.pos)
      const step = prefersReducedMotion() ? gap : gap * (1 - Math.exp(-dt / 0.08))
      const settled = Math.abs(gap - step) < 0.0005
      if (Math.abs(step) > 0.0002 || (settled && gap !== 0)) {
        s.pos = mod(settled ? s.target : s.pos + step, N)
        apply()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [running, apply])

  /** Scrolls the page to project i by the shorter way around the loop (the pin maps it to the centre). */
  const goTo = useCallback(
    (i: number, smooth = true) => {
      const s = m.current
      const t = s.trigger
      if (!t) {
        s.target = mod(i, N)
        return
      }
      const len = t.end - t.start
      const now = ((window.scrollY - t.start) / len) * N
      let dest = now + around(i, now)
      // Past either end, continue from the other one (the same picture), so the loop never stops.
      if (dest < -0.001 || dest > N + 0.001) {
        const jump = dest < 0 ? now + N : now - N
        window.scrollTo({ top: t.start + (len * clamp(jump, 0, N)) / N, behavior: 'auto' })
        dest = mod(dest, N) === 0 && dest > 0 ? N : mod(dest, N)
      }
      window.scrollTo({ top: t.start + (len * clamp(dest, 0, N)) / N, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' })
    },
    [],
  )

  /** Freezes the centred cover and carries it into the case study's hero; the rest recede and the captions fade first. */
  const open = (i: number) => {
    const item = FIELD[i]
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
    if (i !== m.current.active) goTo(i)
    else open(i)
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

  // Drag and swipe (horizontal) and horizontal trackpad gestures move the same scroll position.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const s = m.current
    let drag: { id: number; x0: number; y0: number; y: number; moved: boolean } | null = null
    const perPx = () => {
      const t = s.trigger
      const slot = s.layout?.x[1] || 400
      return t ? (t.end - t.start) / N / slot : 1
    }
    /** Moves the page to y, wrapped around the pin (its two ends are the same picture), so dragging never stops. */
    const wrapTo = (y: number) => {
      const t = s.trigger
      if (!t) return 0
      const len = t.end - t.start
      const w = t.start + mod(y - t.start, len)
      window.scrollTo({ top: w, behavior: 'auto' })
      return w - y
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || s.frozen || e.pointerType === 'touch') return
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, y: window.scrollY, moved: false }
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x0
      if (!drag.moved) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0)) return
        drag.moved = true
        stage.setPointerCapture(e.pointerId)
        stage.dataset.dragging = ''
      }
      const to = drag.y - dx * perPx()
      drag.y = to + wrapTo(to)
      drag.x0 = e.clientX
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.moved) {
        s.dragEndedAt = performance.now()
        delete stage.dataset.dragging
      }
      drag = null
    }
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || s.frozen) return
      e.preventDefault()
      wrapTo(window.scrollY + e.deltaX * perPx() * 0.9)
    }
    // Touch: a horizontal swipe also moves between projects (vertical swipes scroll, which the pin maps the same way).
    let touch: { x: number; y: number; sy: number; horizontal: boolean | null } | null = null
    const tStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch = { x: t.clientX, y: t.clientY, sy: window.scrollY, horizontal: null }
    }
    const tMove = (e: TouchEvent) => {
      if (!touch) return
      const t = e.touches[0]
      const dx = t.clientX - touch.x
      const dy = t.clientY - touch.y
      if (touch.horizontal === null && Math.hypot(dx, dy) > 8) touch.horizontal = Math.abs(dx) > Math.abs(dy)
      if (touch.horizontal) {
        const to = touch.sy - dx * perPx()
        touch.sy = to + wrapTo(to)
        touch.x = t.clientX
      }
    }
    const tEnd = () => {
      if (touch?.horizontal) s.dragEndedAt = performance.now()
      touch = null
    }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    stage.addEventListener('wheel', wheel, { passive: false })
    stage.addEventListener('touchstart', tStart, { passive: true })
    stage.addEventListener('touchmove', tMove, { passive: true })
    stage.addEventListener('touchend', tEnd)
    return () => {
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
      stage.removeEventListener('wheel', wheel)
      stage.removeEventListener('touchstart', tStart)
      stage.removeEventListener('touchmove', tMove)
      stage.removeEventListener('touchend', tEnd)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="selected-work"
      className="field"
      aria-labelledby="field-label"
      data-reduced={reduced || undefined}
      style={{ '--field-steps': `${N * STEP * 100}svh` } as CSSProperties}
    >
      <div className="field__pin">
        <h2 className="field__label" id="field-label">
          Selected work <span className="field__years">{FIELD_YEARS}</span>
        </h2>
        <div ref={stageRef} className="field__stage">
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
                href={projectPath(project)}
                aria-label={`${item.title}. ${item.alt}. Open the case study`}
                aria-current={i === active ? 'true' : undefined}
                draggable={false}
                onClick={(e) => onPlaneClick(e, i)}
                onKeyDown={(e) => onPlaneKey(e, i)}
                onFocus={(e) => {
                  if (!m.current.keyed && e.currentTarget.matches(':focus-visible') && i !== m.current.active) goTo(i, false)
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') warmProject(projectPath(project))
                }}
              >
                <span className="plane__frame">
                  <span className="plane__media" data-kind={item.media.kind}>
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
        <p className="visually-hidden" aria-live="polite">
          {FIELD[active].title}, {active + 1} of {N}
        </p>
      </div>
    </section>
  )
}

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

/** Scroll distance per project, as a share of the window's height: one deliberate gesture moves one project. */
const STEP = 0.4

interface Layout {
  w: number
  h: number
  /** Per depth step 0..2: scale, horizontal offset (px), veil opacity. */
  scale: number[]
  x: number[]
  veil: number[]
}

/**
 * Composition per viewport (brief v18): the centred tile at about 42% of the
 * window's width, never taller than the room left for its caption and the
 * controls; neighbours at 82%, clearly visible and only lightly veiled.
 */
function layoutFor(vw: number, vh: number): Layout {
  const room = vh - HEADER - 250
  const aspect = 1.6
  let w: number, scale: number[], veil: number[], gap: number
  if (vw >= 1100) {
    w = Math.min(vw * 0.42, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.2, 0.45]
    gap = vw * 0.03
  } else if (vw >= 700) {
    w = Math.min(vw * 0.56, room * aspect)
    scale = [1, 0.82, 0.68]
    veil = [0, 0.22, 0.45]
    gap = vw * 0.035
  } else {
    w = Math.min(vw * 0.78, room * aspect)
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

function readStored() {
  try {
    const v = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isInteger(v) && v >= 0 && v < N ? v : 0
  } catch {
    return 0
  }
}

/**
 * Selected work (brief v18). Once the collection reaches its place under the
 * header it stays put (a sticky pin) while vertical scrolling advances the
 * projects horizontally: the page's scroll position within the pin maps
 * directly to the project in the centre, about 40% of a window's height per
 * project, so one deliberate wheel or trackpad gesture visibly moves to the
 * next. When scrolling stops, the page settles on the nearest project.
 * Scrolling up at the start returns to the title; past the last project the
 * page continues to its end (no trap, no blank stretch). There is no idle
 * drift to fight the visitor.
 *
 * Previous/next, the counter, horizontal trackpad gestures, drag and swipe
 * all move the same scroll position, so every input agrees. Each tile
 * carries its own title and one-sentence line. Clicking the centred tile
 * opens its case study (the frame travels into the hero, expandFrame);
 * clicking a neighbour brings it to the centre. Keyboard: each tile is a
 * link; focusing one centres it; Enter opens it. Reduced motion: the same
 * mapping without easing or settling animation.
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
  const m = useRef({ pos: initial, target: initial, active: initial, layout: null as Layout | null, trigger: null as ScrollTrigger | null, frozen: false, dragEndedAt: 0 })

  const apply = useCallback(() => {
    const s = m.current
    const L = s.layout
    if (!L) return
    for (let i = 0; i < N; i++) {
      const el = planeRefs.current[i]
      if (!el) continue
      const d = i - s.pos
      const a = Math.abs(d)
      const side = Math.sign(d)
      const sc = lerpSteps(L.scale, a)
      const x = side * lerpSteps(L.x, a)
      el.style.transform = `translate3d(${(x - L.w / 2).toFixed(2)}px, ${(-L.h / 2).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`
      el.style.zIndex = String(100 - Math.round(a * 10))
      el.style.visibility = a > 2.2 ? 'hidden' : ''
      el.style.setProperty('--depth', Math.min(1, a).toFixed(3))
      const veil = veilRefs.current[i]
      if (veil) veil.style.opacity = lerpSteps(L.veil, a).toFixed(3)
    }
    const centred = clamp(Math.round(s.pos), 0, N - 1)
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

  // Footage plays only on the centred tile and its neighbours, while the field is on screen.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      const near = Math.abs(i - active) <= 1
      if (near && !video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
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

  // The pin's scroll range maps to the projects; the page settles on the nearest one.
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const s = m.current
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: `top top+=${HEADER}`,
      end: 'bottom bottom',
      onUpdate: (self) => {
        s.target = self.progress * (N - 1)
      },
      snap: prefersReducedMotion() ? undefined : { snapTo: 1 / (N - 1), duration: { min: 0.2, max: 0.45 }, delay: 0.12, ease: 'power2.out', inertia: false },
    })
    s.trigger = trigger
    s.target = trigger.progress * (N - 1)
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
      const goal = clamp(s.target, 0, N - 1)
      const next = prefersReducedMotion() ? goal : s.pos + (goal - s.pos) * (1 - Math.exp(-dt / 0.09))
      const settled = Math.abs(goal - next) < 0.0005
      if (Math.abs(next - s.pos) > 0.0002 || (settled && s.pos !== goal)) {
        s.pos = settled ? goal : next
        apply()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [running, apply])

  /** Scrolls the page to project i (the pin maps it to the centre). */
  const goTo = useCallback((i: number, smooth = true) => {
    const t = m.current.trigger
    const k = clamp(i, 0, N - 1)
    if (!t) {
      m.current.target = k
      return
    }
    const y = t.start + ((t.end - t.start) * k) / (N - 1)
    window.scrollTo({ top: y, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' })
  }, [])

  const step = (dir: number) => goTo(m.current.active + dir)

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

  const onPlaneKey = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
    }
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
      return t ? (t.end - t.start) / (N - 1) / slot : 1
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
      window.scrollTo({ top: drag.y - dx * perPx(), behavior: 'auto' })
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
      window.scrollBy({ top: e.deltaX * perPx() * 0.9, behavior: 'auto' })
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
      if (touch.horizontal) window.scrollTo({ top: touch.sy - dx * perPx(), behavior: 'auto' })
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
      style={{ '--field-steps': `${(N - 1) * STEP * 100}svh` } as CSSProperties}
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
                href={projectPath(project)}
                aria-label={`${item.title}. ${item.alt}. Open the case study`}
                aria-current={i === active ? 'true' : undefined}
                draggable={false}
                onClick={(e) => onPlaneClick(e, i)}
                onKeyDown={onPlaneKey}
                onFocus={(e) => {
                  if (e.currentTarget.matches(':focus-visible') && i !== m.current.active) goTo(i, false)
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
        <div className="field__controls">
          <button type="button" className="field__step" aria-label="Previous project" onClick={() => step(-1)} disabled={active === 0}>
            <span aria-hidden="true">←</span>
          </button>
          <p className="field__count" aria-live="polite">
            <span className="visually-hidden">Project </span>
            {String(active + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            <span className="visually-hidden"> of </span>
            {String(N).padStart(2, '0')}
          </p>
          <button type="button" className="field__step" aria-label="Next project" onClick={() => step(1)} disabled={active === N - 1}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

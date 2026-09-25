import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELD, FIELD_YEARS, type FieldProject } from '../../content/field'
import { fallbackSrc, getImage, srcSet } from '../../content/media'
import { projectById, projectPath } from '../../content/projects'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE, gsap } from '../../lib/gsap'
import { isPlainClick, warmProject } from '../transition/projectTransition'

const N = FIELD.length
const STORAGE_KEY = 'field-active'

/**
 * Motion (brief v16, sections 4 and 5). One value, `pos` (in projects),
 * places every plane. Idle, it drifts very slowly and almost comes to rest
 * on each project (so the centre always resolves), then glides to the next.
 * Vertical scrolling adds its velocity (scroll faster, the field moves
 * faster; scroll back, it moves back), horizontal drag, swipe and trackpad
 * move it directly, and every change is damped (no free-running inertia).
 */
const MOTION = {
  /** Seconds per idle glide cycle; a project rests near the centre for most of it (about 11s per project). */
  idlePeriod: 5.5,
  /** Minimum idle speed at rest (fraction of the cycle's peak), so the field never quite stops. */
  idleFloor: 0.1,
  /** Scroll distance (px) that moves the field by one project. */
  scrollPxPerProject: 380,
  /** Time constant (s) of the field's velocity: how quickly it follows scroll and settles after it. */
  damping: 0.22,
  /** Pull toward the centred project while paused or when a project is chosen. */
  settle: 3.2,
} as const

const mod = (n: number, m: number) => ((n % m) + m) % m
/** Signed distance from `pos` to project `i` along the loop, in [-N/2, N/2). */
const loopDelta = (i: number, pos: number) => mod(i - pos + N / 2, N) - N / 2
const approach = (current: number, target: number, dt: number, tau: number) => current + (target - current) * (1 - Math.exp(-dt / tau))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface Layout {
  w: number
  h: number
  /** Per depth step 0..3: scale, horizontal offset (px), inward turn (deg), veil opacity. */
  scale: number[]
  x: number[]
  turn: number[]
  veil: number[]
}

/** Composition per viewport: three primary planes on desktop, simpler depth on tablets, one plane and glimpses on phones. */
function layoutFor(vw: number, vh: number): Layout {
  const avail = vh - 61
  let w: number, aspect: number, scale: number[], turn: number[], veil: number[], gap: number, tuck: number
  if (vw >= 1100) {
    aspect = 1.55
    w = Math.min(vw * 0.4, avail * 0.56 * aspect)
    scale = [1, 0.8, 0.64, 0.52]
    turn = [0, 11, 18, 22]
    veil = [0, 0.38, 0.66, 0.82]
    gap = vw * 0.022
    tuck = vw * 0.07
  } else if (vw >= 700) {
    aspect = 1.6
    w = Math.min(vw * 0.5, avail * 0.46 * aspect)
    scale = [1, 0.8, 0.64, 0.52]
    turn = [0, 7, 12, 14]
    veil = [0, 0.42, 0.68, 0.84]
    gap = vw * 0.03
    tuck = vw * 0.08
  } else {
    aspect = 4 / 3
    w = Math.min(vw * 0.8, avail * 0.44 * aspect)
    scale = [1, 0.84, 0.7, 0.6]
    turn = [0, 0, 0, 0]
    veil = [0, 0.46, 0.7, 0.85]
    gap = vw * 0.045
    tuck = 0
  }
  const x = [0]
  for (let k = 1; k < 4; k++) x.push(x[k - 1] + (w * (scale[k - 1] + scale[k])) / 2 + gap - (k > 1 ? tuck : 0))
  return { w, h: w / aspect, scale, x, turn, veil }
}

const lerpSteps = (steps: number[], a: number) => {
  if (a >= steps.length - 1) return steps[steps.length - 1]
  const k = Math.floor(a)
  return steps[k] + (steps[k + 1] - steps[k]) * (a - k)
}

function PlaneMedia({ item, videoRef }: { item: FieldProject; videoRef: (el: HTMLVideoElement | null) => void }) {
  const { media } = item
  if (media.kind === 'video') {
    return (
      <video
        ref={videoRef}
        className="plane__video"
        data-src={media.src}
        poster={media.poster}
        style={{ objectPosition: media.position }}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
      />
    )
  }
  if (media.kind === 'image') {
    const asset = getImage(media.image)
    return (
      <picture className="plane__picture" data-pan={media.pan}>
        <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes="(min-width: 1100px) 36vw, 80vw" />
        <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes="(min-width: 1100px) 36vw, 80vw" />
        <img
          src={fallbackSrc(asset, 1200)}
          srcSet={srcSet(asset, 'jpg')}
          sizes="(min-width: 1100px) 36vw, 80vw"
          alt=""
          width={asset.width}
          height={asset.height}
          style={{ objectPosition: media.position }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>
    )
  }
  return (
    <div className="plane__screens">
      {media.screens.map((s, k) => (
        <picture key={s} className="plane__screen" style={{ '--k': k } as CSSProperties}>
          <source type="image/webp" srcSet={`${s}-360.webp 360w, ${s}-540.webp 540w`} sizes="(min-width: 1100px) 10vw, 24vw" />
          <img src={`${s}-360.png`} alt="" width={360} height={771} loading="lazy" decoding="async" draggable={false} />
        </picture>
      ))}
    </div>
  )
}

function readStored() {
  try {
    const v = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isInteger(v) && v >= 0 && v < N ? v : 0
  } catch {
    return 0
  }
}

/**
 * The selected work (brief v16): a controlled field of rectangular media
 * planes in perspective. The centred project is the largest, sharpest and
 * brightest; its neighbours sit a step back (about 80% scale, turned
 * slightly inward, under a dark veil); the next layer is only glimpsed at
 * the edges. Only the centred project shows its title and one line, which
 * crossfade as the centre changes. No arrows, counters, pause buttons or
 * video controls: the field drifts slowly on its own, follows vertical
 * scroll velocity while it is on screen, and can be dragged or swiped.
 *
 * Clicking the centred plane expands its frame to the window edges while
 * the others recede, then opens the case study; clicking a neighbour
 * brings it to the centre first. Keyboard: every plane is a link; focusing
 * one centres it and holds the motion; Enter opens it. Motion also holds
 * while the pointer rests on the centred plane, and a pause control appears
 * on keyboard focus (WCAG 2.2.2). Reduced motion: no drift and no scroll
 * coupling; the centre changes only on request.
 *
 * Per frame everything is written straight to the planes' styles; React
 * state changes only when the centred project changes.
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
  const [caption, setCaption] = useState<{ current: number; previous: number | null }>({ current: initial, previous: null })
  const [userPaused, setUserPaused] = useState(false)
  const [running, setRunning] = useState(false)

  const motion = useRef({
    pos: initial,
    vel: 0,
    scrollVel: 0,
    goal: null as number | null,
    idleDir: 1,
    hover: false,
    focus: false,
    paused: false,
    coupled: false,
    frozen: false,
    dragging: false,
    dragEndedAt: 0,
    active: initial,
    layout: null as Layout | null,
  })

  // Hidden pause control -> the motion model.
  useEffect(() => {
    motion.current.paused = userPaused
  }, [userPaused])

  // The caption crossfades: the previous line fades out while the new one arrives.
  useEffect(() => {
    setCaption((c) => (c.current === active ? c : { current: active, previous: c.current }))
    const t = window.setTimeout(() => setCaption((c) => ({ current: c.current, previous: null })), 520)
    try {
      sessionStorage.setItem(STORAGE_KEY, String(active))
    } catch {
      /* private mode */
    }
    return () => window.clearTimeout(t)
  }, [active])

  // Only the centred plane and its neighbours load and play their footage, and only while the field is on screen.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      const near = Math.abs(loopDelta(i, active)) <= 1
      if (near && !video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
      if (near && running && !reduced) void video.play().catch(() => {})
      else if (!video.paused) video.pause()
    })
  }, [active, running, reduced])

  const apply = useCallback(() => {
    const m = motion.current
    const L = m.layout
    if (!L) return
    for (let i = 0; i < N; i++) {
      const el = planeRefs.current[i]
      if (!el) continue
      const d = loopDelta(i, m.pos)
      const a = Math.abs(d)
      const side = Math.sign(d)
      const s = lerpSteps(L.scale, a)
      const x = side * lerpSteps(L.x, a)
      const turn = side * lerpSteps(L.turn, a)
      el.style.transform = `translate3d(${(x - L.w / 2).toFixed(2)}px, ${(-L.h / 2).toFixed(2)}px, 0) rotateY(${turn.toFixed(2)}deg) scale(${s.toFixed(4)})`
      el.style.zIndex = String(100 - Math.round(a * 10))
      el.style.visibility = a > 2.9 ? 'hidden' : ''
      const veil = veilRefs.current[i]
      if (veil) veil.style.opacity = lerpSteps(L.veil, a).toFixed(3)
    }
    const centred = mod(Math.round(m.pos), N)
    if (centred !== m.active) {
      m.active = centred
      setActive(centred)
    }
  }, [])

  // Layout: sizes follow the window.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const L = layoutFor(window.innerWidth, window.innerHeight)
      motion.current.layout = L
      stage.style.setProperty('--plane-w', `${L.w}px`)
      stage.style.setProperty('--plane-h', `${L.h}px`)
      apply()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [apply])

  // Visibility: the loop runs only while the field is near the viewport; scroll couples only while it fills the view.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const near = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: '15% 0px' })
    const centre = new IntersectionObserver(
      ([e]) => {
        motion.current.coupled = e.isIntersecting
      },
      { rootMargin: '-30% 0px -30% 0px' },
    )
    near.observe(section)
    centre.observe(section)
    return () => {
      near.disconnect()
      centre.disconnect()
    }
  }, [])

  // The frame loop.
  useEffect(() => {
    if (!running) return
    const m = motion.current
    let last = performance.now()
    let lastScroll = window.scrollY
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const y = window.scrollY
      const dy = y - lastScroll
      lastScroll = y
      if (m.frozen || m.dragging || dt <= 0) return
      const still = prefersReducedMotion()
      // Scroll velocity, in projects per second (only while the field fills the view).
      const input = !still && m.coupled ? dy / dt / MOTION.scrollPxPerProject : 0
      m.scrollVel = approach(m.scrollVel, input, dt, 0.08)
      if (!still && m.coupled && Math.abs(dy) > 0.5) {
        m.idleDir = Math.sign(dy)
        m.goal = null
      }
      let desired: number
      if (m.goal !== null) {
        const diff = m.goal - m.pos
        desired = clamp(diff * MOTION.settle, -4, 4)
        if (Math.abs(diff) < 0.002) {
          m.pos = m.goal
          m.goal = null
          m.vel = 0
          apply()
          return
        }
      } else if (still || m.hover || m.focus || m.paused) {
        desired = (Math.round(m.pos) - m.pos) * MOTION.settle + m.scrollVel
      } else {
        const f = m.idleDir > 0 ? m.pos - Math.floor(m.pos) : Math.ceil(m.pos) - m.pos
        desired = (m.idleDir * (MOTION.idleFloor + 1 - Math.cos(2 * Math.PI * f))) / MOTION.idlePeriod + m.scrollVel
      }
      m.vel = approach(m.vel, desired, dt, MOTION.damping)
      m.pos += m.vel * dt
      apply()
    })
    return () => cancelAnimationFrame(frame)
  }, [running, apply])

  /** Brings project i to the centre along the shorter way round (instantly under reduced motion). */
  const centre = useCallback(
    (i: number) => {
      const m = motion.current
      const goal = m.pos + loopDelta(i, m.pos)
      if (prefersReducedMotion()) {
        m.pos = goal
        m.goal = null
        apply()
      } else m.goal = goal
    },
    [apply],
  )

  /** The project the field is showing or on its way to. */
  const target = () => {
    const m = motion.current
    return m.goal !== null ? mod(Math.round(m.goal), N) : m.active
  }

  /** Expands the centred plane to the window, lets the rest recede, then opens the case study. */
  const open = (i: number) => {
    const item = FIELD[i]
    const path = projectPath(projectById(item.id))
    const plane = planeRefs.current[i]
    const media = plane?.querySelector<HTMLElement>('.plane__media')
    if (prefersReducedMotion() || !media) {
      navigate(path)
      return
    }
    warmProject(path)
    const m = motion.current
    m.frozen = true
    const rect = media.getBoundingClientRect()
    const overlay = document.createElement('div')
    overlay.className = 'plane-expand'
    overlay.setAttribute('aria-hidden', 'true')
    const clone = media.cloneNode(true) as HTMLElement
    const sourceVideo = media.querySelector('video')
    const cloneVideo = clone.querySelector('video')
    if (sourceVideo && cloneVideo) {
      cloneVideo.muted = true
      cloneVideo.currentTime = sourceVideo.currentTime
      void cloneVideo.play().catch(() => {})
    }
    const title = document.createElement('p')
    title.className = 'plane-expand__title'
    title.textContent = item.title
    overlay.append(clone, title)
    Object.assign(overlay.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
    document.body.append(overlay)
    sectionRef.current?.closest('.home')?.setAttribute('data-leaving', '')
    document.querySelector('.home-film')?.setAttribute('data-leaving', '')
    // Expand, dip the frame to black while the route changes, then fade the new page in (never two pictures blended).
    const media2 = overlay.querySelector<HTMLElement>('.plane__media')
    const done = () => {
      gsap.to([media2, title], {
        opacity: 0,
        duration: 0.26,
        ease: EASE.arrive,
        onComplete: () => {
          navigate(path)
          requestAnimationFrame(() =>
            requestAnimationFrame(() => gsap.to(overlay, { opacity: 0, duration: 0.5, ease: EASE.arrive, onComplete: () => overlay.remove() })),
          )
        },
      })
    }
    const captionTitle = sectionRef.current?.querySelector<HTMLElement>('.field__caption-item[data-state="in"] .field__title')
    const startSize = captionTitle ? parseFloat(getComputedStyle(captionTitle).fontSize) : 24
    gsap.set(title, { fontSize: startSize })
    gsap.to(overlay, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, duration: 0.85, ease: EASE.move, onComplete: done })
    gsap.to(title, { opacity: 1, fontSize: Math.min(80, Math.max(32, window.innerWidth * 0.05)), duration: 0.85, ease: EASE.move })
  }

  const onPlaneClick = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    const m = motion.current
    if (performance.now() - m.dragEndedAt < 350) {
      e.preventDefault()
      return
    }
    if (!isPlainClick(e)) return
    e.preventDefault()
    if (m.frozen) return
    if (i !== target()) centre(i)
    else open(i)
  }

  const onPlaneKey = (e: KeyboardEvent<HTMLAnchorElement>) => {
    // Space opens as well as Enter (the plane reads as a button-like target).
    if (e.key === ' ') {
      e.preventDefault()
      e.currentTarget.click()
    }
  }

  // Drag and swipe (horizontal), and horizontal trackpad gestures.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const m = motion.current
    let drag: { id: number; x0: number; y0: number; pos0: number; lastX: number; lastT: number; vx: number; moved: boolean } | null = null
    const slot = () => m.layout?.x[1] || 400
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || m.frozen) return
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: m.pos, lastX: e.clientX, lastT: e.timeStamp, vx: 0, moved: false }
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x0
      const dy = e.clientY - drag.y0
      if (!drag.moved) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return
        drag.moved = true
        drag.pos0 = m.pos + dx / slot()
        m.dragging = true
        m.goal = null
        stage.setPointerCapture(e.pointerId)
        stage.dataset.dragging = ''
      }
      const dt = e.timeStamp - drag.lastT
      if (dt > 0) drag.vx = approach(drag.vx, (e.clientX - drag.lastX) / dt, dt / 1000, 0.05)
      drag.lastX = e.clientX
      drag.lastT = e.timeStamp
      m.pos = drag.pos0 - dx / slot()
      apply()
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.moved) {
        // Released: a short, damped continuation in the drag's direction (capped), then the idle model settles it.
        m.vel = clamp((-drag.vx * 1000) / slot(), -3, 3)
        if (Math.abs(drag.vx) > 0.02) m.idleDir = drag.vx < 0 ? 1 : -1
        m.dragging = false
        m.dragEndedAt = performance.now()
        delete stage.dataset.dragging
      }
      drag = null
    }
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || m.frozen) return
      e.preventDefault()
      m.goal = null
      m.pos += (e.deltaX / slot()) * 0.9
      m.idleDir = Math.sign(e.deltaX)
      apply()
    }
    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    stage.addEventListener('wheel', wheel, { passive: false })
    return () => {
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
      stage.removeEventListener('wheel', wheel)
    }
  }, [apply])

  const shown = [caption.previous, caption.current].filter((v): v is number => v !== null)

  return (
    <section ref={sectionRef} className="field" aria-labelledby="field-label" data-reduced={reduced || undefined}>
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
                onFocus={() => {
                  motion.current.focus = true
                  centre(i)
                }}
                onBlur={() => {
                  motion.current.focus = false
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') warmProject(projectPath(project))
                  if (e.pointerType === 'mouse' && i === motion.current.active) motion.current.hover = true
                }}
                onPointerLeave={() => {
                  motion.current.hover = false
                }}
              >
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
              </a>
            )
          })}
          <div className="field__caption" aria-hidden="true">
            {shown.map((i) => (
              <div key={`${i}-${i === caption.current ? 'in' : 'out'}`} className="field__caption-item" data-state={i === caption.current ? 'in' : 'out'}>
                <p className="field__title">{FIELD[i].title}</p>
                <p className="field__line">{FIELD[i].line}</p>
              </div>
            ))}
          </div>
        </div>
        <button type="button" className="field__motion" aria-pressed={userPaused} onClick={() => setUserPaused((p) => !p)}>
          {userPaused ? 'Resume motion' : 'Pause motion'}
        </button>
      </div>
    </section>
  )
}

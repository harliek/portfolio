import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { CAROUSEL } from '../../config/carousel'
import { MOTION } from '../../config/motion'
import { projectPath, type Project } from '../../content/projects'
import { prefetchRoute, routeChunks } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { beginProjectTransition, cancelPreparingTransition, watchForOtherNavigation } from './ProjectTransition'
import type { RailHandle, RailMoveSource } from './SnapRail'

export interface SpatialRailHandle extends RailHandle {
  /** Centre project `index` if needed, then open it with the shared-poster transition. */
  open: (index: number) => void
}

interface SpatialRailProps {
  ref?: Ref<SpatialRailHandle>
  projects: Project[]
  /** Currently selected project (owned by WorkCarousel). */
  selected: number
  /** Project placed at the centre on mount, without animation. */
  initialIndex: number
  /** Fires as soon as the intended project changes (arrow press, drag crossing a midpoint). */
  onSelect: (index: number) => void
  /** Fires once the arc has come to rest. */
  onSettle: (index: number, source: RailMoveSource) => void
}

/** Rendered cover width: card width (clamp 340px, 31vw, 440px) minus the 8px frame padding. */
const COVER_SIZES = '(min-width: 1420px) 424px, (min-width: 1097px) calc(31vw - 16px), 324px'

const DEG = Math.PI / 180
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Opacity stops at 0, 1, 2 … steps from the active position; hidden beyond. */
const OPACITY_STOPS = [CAROUSEL.opacity.active, CAROUSEL.opacity.near, CAROUSEL.opacity.far, CAROUSEL.opacity.hidden]

function opacityAt(distance: number): number {
  const d = clamp(distance, 0, OPACITY_STOPS.length - 1)
  const i = Math.min(OPACITY_STOPS.length - 2, Math.floor(d))
  return OPACITY_STOPS[i] + (OPACITY_STOPS[i + 1] - OPACITY_STOPS[i]) * (d - i)
}

/**
 * Placement of a card `offset` steps from the active position on a shallow
 * arc (see src/config/carousel.ts). Unprojected: perspective does the rest.
 */
function placement(offset: number, cardWidth: number) {
  const radius = (CAROUSEL.spacing * cardWidth) / Math.sin(CAROUSEL.angleStep * DEG)
  const angle = clamp(offset * CAROUSEL.angleStep, -90, 90)
  const d = Math.abs(offset)
  return {
    x: radius * Math.sin(angle * DEG),
    z: radius * (Math.cos(angle * DEG) - 1),
    rotateY: angle * CAROUSEL.rotateFactor,
    scale: 1 - CAROUSEL.scaleFalloff * Math.min(d, CAROUSEL.visibleSteps + 1),
    opacity: opacityAt(d),
    zIndex: Math.round(100 - d * 10),
  }
}

type Depth = 'active' | 'near' | 'far' | 'hidden'
const depthOf = (offset: number): Depth => {
  const d = Math.abs(offset)
  return d === 0 ? 'active' : d === 1 ? 'near' : d <= CAROUSEL.visibleSteps ? 'far' : 'hidden'
}

const isPlainPrimaryClick = (e: ReactMouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

interface Engine {
  goTo: (index: number, source?: RailMoveSource) => void
  open: (index: number) => void
  /** Keyboard: select `index`, centre it and move focus to its card. */
  focusCard: (index: number) => void
  target: () => number
}

interface DragState {
  id: number
  x0: number
  y0: number
  pos0: number
  base: number
  active: boolean
  lastX: number
  lastT: number
  velocity: number
}

/**
 * Wide-screen spatial work carousel: five unique project cards on a shallow
 * arc in CSS 3D (perspective on the list, one transform per card). Finite
 * sequence, no clones; cards more than `visibleSteps` from the selection are
 * hidden and inert. Motion only while dragging, snapping, or opening a
 * project (GSAP interpolates one position value); nothing runs at rest.
 *
 * Input: pointer drag on the stage (threshold, capture, snap on release),
 * intentional horizontal or Shift+wheel gestures over the stage, arrow keys
 * while a card has focus, and the shared arrow buttons via RailHandle.
 */
export function SpatialRail({ ref, projects, selected, initialIndex, onSelect, onSettle }: SpatialRailProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const initialRef = useRef(initialIndex)
  const navigate = useNavigate()
  const latest = useRef({ onSelect, onSettle, navigate, projects })

  useLayoutEffect(() => {
    latest.current = { onSelect, onSettle, navigate, projects }
  })

  useLayoutEffect(() => {
    const stage = stageRef.current
    const list = listRef.current
    if (!stage || !list) return
    const items = Array.from(list.children) as HTMLElement[]
    const maxIndex = items.length - 1
    const ctx = gsap.context(() => {}, stage)
    const { perspective } = CAROUSEL
    const { thresholdPx, maxStepsPerRelease, intentRatio, flickVelocity, edgeResistance, edgeMax } = CAROUSEL.drag

    let disposed = false
    let pos = clamp(initialRef.current, 0, maxIndex)
    let target = pos
    let reported = pos
    let cardWidth = 0
    let spacingPx = 1
    let busy = false
    let moving = false
    let tween: gsap.core.Tween | null = null
    let drag: DragState | null = null
    let suppressClick = false
    /** A neighbour being aligned before it opens; stop() ends the navigation watch. */
    let aligning: { stop: () => void } | null = null
    /**
     * One wheel gesture (ended by a quiet gap): its axis is decided once, from
     * the first few events, and kept; a horizontal gesture moves one project.
     */
    const wheel = { axis: null as 'x' | 'y' | null, sumX: 0, sumY: 0, acc: 0, moved: false, timer: 0 }
    const resetWheel = () => {
      window.clearTimeout(wheel.timer)
      wheel.axis = null
      wheel.sumX = 0
      wheel.sumY = 0
      wheel.acc = 0
      wheel.moved = false
    }
    const proxy = { pos }

    // Reads: the card's layout width (unaffected by transforms) and the
    // projected distance between the active card and its neighbour.
    const measure = () => {
      cardWidth = items[0]?.offsetWidth ?? 0
      const n = placement(1, cardWidth)
      spacingPx = Math.max(1, (n.x * perspective) / (perspective - n.z))
    }

    // Writes only.
    const layout = () => {
      const places = items.map((_, i) => placement(i - pos, cardWidth))
      items.forEach((el, i) => {
        const p = places[i]
        el.style.transform = `translate3d(${p.x.toFixed(2)}px, 0, ${p.z.toFixed(2)}px) rotateY(${p.rotateY.toFixed(3)}deg) scale(${p.scale.toFixed(4)})`
        el.style.setProperty('--card-opacity', p.opacity.toFixed(3))
        // The intended card is never hidden, so keyboard focus can land on it.
        el.style.visibility = p.opacity < 0.005 && i !== target ? 'hidden' : ''
        el.style.zIndex = String(p.zIndex)
      })
    }

    const report = (i: number) => {
      if (i === reported) return
      reported = i
      latest.current.onSelect(i)
    }

    const setMoving = (on: boolean) => {
      if (moving === on) return
      moving = on
      if (on) stage.dataset.moving = 'true'
      else delete stage.dataset.moving
      items.forEach((el) => {
        el.style.willChange = on ? 'transform, opacity' : ''
      })
    }

    const animateTo = (
      i: number,
      source: RailMoveSource,
      { duration = MOTION.carouselSnap.duration, ease = MOTION.carouselSnap.ease, onDone }: { duration?: number; ease?: string; onDone?: () => void } = {},
    ) => {
      tween?.kill()
      target = i
      report(i)
      setMoving(true)
      proxy.pos = pos
      ctx.add(() => {
        tween = gsap.to(proxy, {
          pos: i,
          duration,
          ease,
          onUpdate: () => {
            pos = proxy.pos
            layout()
          },
          onComplete: () => {
            tween = null
            pos = i
            layout()
            setMoving(false)
            latest.current.onSettle(i, source)
            onDone?.()
          },
        })
      })
    }

    const goTo = (index: number, source: RailMoveSource = 'control') => {
      if (disposed || busy || drag?.active) return
      const i = clamp(Math.round(index), 0, maxIndex)
      if (i === target && (tween || Math.abs(pos - i) < 1e-3)) {
        if (!tween) {
          report(i)
          latest.current.onSettle(i, source)
        }
        return
      }
      animateTo(i, source)
    }

    const focusCard = (index: number) => {
      if (disposed || busy || drag?.active) return
      const i = clamp(index, 0, maxIndex)
      // Commit the new selection first so the card is no longer inert.
      flushSync(() => report(i))
      if (i !== target) animateTo(i, 'focus')
      layout()
      items[i].querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    }

    const resume = () => {
      if (disposed) return
      busy = false
      delete stage.dataset.busy
      layout()
    }

    const open = (index: number) => {
      if (disposed || busy) return
      const project = latest.current.projects[index]
      if (!project) return
      const path = projectPath(project)
      prefetchRoute(path)
      const loader = routeChunks[path as keyof typeof routeChunks]
      const ready: Promise<unknown> = loader ? loader() : Promise.resolve()
      // Handled by the transition (fallback to ordinary navigation); never unhandled.
      ready.catch(() => {})
      busy = true
      stage.dataset.busy = 'true'
      resetWheel()

      const start = () => {
        if (disposed) return
        const media = items[index].querySelector<HTMLElement>('[data-card-media]')
        const scope = stage.closest('main') ?? document.body
        const started =
          !!media &&
          beginProjectTransition({
            id: project.id,
            path,
            media,
            fade: [...items, ...Array.from(scope.querySelectorAll('[data-transition-fade]'))],
            scope: stage,
            ready,
            navigate: (to, state) => latest.current.navigate(to, state ? { state } : undefined),
            onCancel: resume,
          })
        if (!started) {
          resume()
          latest.current.navigate(path)
        }
      }

      // A neighbour is aligned first (briefly) so the poster is captured flat.
      // Any other navigation meanwhile (a link, Back/Forward) wins: the align
      // then just finishes as an ordinary move and nothing opens.
      if (index !== target || Math.abs(pos - index) > 1e-3) {
        const pending = {
          stop: watchForOtherNavigation(path, stage, {
            onOther: () => {
              if (aligning !== pending) return
              aligning = null
              pending.stop()
              resume()
            },
          }),
        }
        aligning = pending
        animateTo(index, 'focus', {
          duration: MOTION.sharedTransition.align,
          ease: 'power2.inOut',
          onDone: () => {
            if (aligning !== pending) return
            aligning = null
            pending.stop()
            start()
          },
        })
      } else {
        start()
      }
    }

    engineRef.current = { goTo, open, focusCard, target: () => target }

    /* Pointer drag -------------------------------------------------------- */

    const onPointerDown = (e: PointerEvent) => {
      if (busy || e.button !== 0 || !e.isPrimary || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      drag = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        pos0: pos,
        base: clamp(Math.round(pos), 0, maxIndex),
        active: false,
        lastX: e.clientX,
        lastT: e.timeStamp,
        velocity: 0,
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const d = drag
      if (!d || e.pointerId !== d.id) return
      const dx = e.clientX - d.x0
      const dy = e.clientY - d.y0
      if (!d.active) {
        if (Math.abs(dx) < thresholdPx && Math.abs(dy) < thresholdPx) return
        if (Math.abs(dy) >= Math.abs(dx)) {
          // Vertical intent: leave it to the page.
          drag = null
          return
        }
        d.active = true
        try {
          stage.setPointerCapture(d.id)
        } catch {
          /* pointer already released */
        }
        tween?.kill()
        tween = null
        d.pos0 = pos
        d.x0 = e.clientX - Math.sign(dx) * thresholdPx
        stage.dataset.dragging = 'true'
        setMoving(true)
      }
      let p = d.pos0 - (e.clientX - d.x0) / spacingPx
      if (p < 0) p = -Math.min(edgeMax, -p * edgeResistance)
      else if (p > maxIndex) p = maxIndex + Math.min(edgeMax, (p - maxIndex) * edgeResistance)
      pos = p
      layout()
      report(clamp(Math.round(p), 0, maxIndex))
      const dt = e.timeStamp - d.lastT
      if (dt > 0) d.velocity = 0.7 * ((e.clientX - d.lastX) / dt) + 0.3 * d.velocity
      d.lastX = e.clientX
      d.lastT = e.timeStamp
    }

    const endDrag = (e: PointerEvent, cancelled: boolean) => {
      const d = drag
      if (!d || e.pointerId !== d.id) return
      drag = null
      if (!d.active) return
      if (stage.hasPointerCapture(d.id)) stage.releasePointerCapture(d.id)
      delete stage.dataset.dragging
      if (!cancelled) {
        // The click that follows this pointerup belongs to the drag.
        suppressClick = true
        window.setTimeout(() => {
          suppressClick = false
        }, 0)
      }
      let next = Math.round(pos)
      if (!cancelled && next === d.base) {
        const recent = e.timeStamp - d.lastT < 100
        const flick = recent && Math.abs(d.velocity) >= flickVelocity
        const moved = pos - d.base
        if (flick) next = d.base - Math.sign(d.velocity)
        else if (Math.abs(moved) >= intentRatio) next = d.base + Math.sign(moved)
      }
      next = clamp(clamp(next, d.base - maxStepsPerRelease, d.base + maxStepsPerRelease), 0, maxIndex)
      animateTo(next, 'user')
    }

    const onPointerUp = (e: PointerEvent) => endDrag(e, false)
    const onPointerCancel = (e: PointerEvent) => endDrag(e, true)

    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick || busy) {
        suppressClick = false
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onDragStart = (e: DragEvent) => e.preventDefault()

    /* Wheel: only intentional horizontal (or Shift) gestures over the stage. */

    const onWheel = (e: WheelEvent) => {
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientWidth : 1
      const dx = e.deltaX * unit
      const dy = e.deltaY * unit
      if (!dx && !dy) return
      window.clearTimeout(wheel.timer)
      wheel.timer = window.setTimeout(resetWheel, CAROUSEL.wheel.gestureGapMs)
      // Shift+wheel: some platforms keep the delta on the vertical axis.
      const along = e.shiftKey && Math.abs(dy) > Math.abs(dx) ? dy : dx
      if (!wheel.axis) {
        if (e.shiftKey) wheel.axis = 'x'
        else {
          wheel.sumX += Math.abs(dx)
          wheel.sumY += Math.abs(dy)
          if (wheel.sumX + wheel.sumY < CAROUSEL.wheel.axisDecidePx) {
            // Too little movement to tell yet. A sideways-leaning start stays
            // cancelled (Chrome only lets a gesture's first event be cancelled);
            // anything else is left to the page.
            wheel.acc += dx
            if (Math.abs(dx) > Math.abs(dy) && e.cancelable) e.preventDefault()
            return
          }
          wheel.axis = wheel.sumX > CAROUSEL.wheel.axisBias * wheel.sumY ? 'x' : 'y'
          if (wheel.axis === 'y') wheel.acc = 0
        }
      }
      // A vertical gesture belongs to the page for its whole length.
      if (wheel.axis === 'y') return
      if (e.cancelable) e.preventDefault()
      if (busy || drag?.active || wheel.moved) return
      wheel.acc += along
      if (Math.abs(wheel.acc) < CAROUSEL.wheel.threshold) return
      const next = clamp(target + Math.sign(wheel.acc), 0, maxIndex)
      wheel.moved = true
      wheel.acc = 0
      if (next !== target) animateTo(next, 'control')
    }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerCancel)
    stage.addEventListener('lostpointercapture', onPointerCancel)
    stage.addEventListener('click', onClickCapture, true)
    stage.addEventListener('dragstart', onDragStart)
    stage.addEventListener('wheel', onWheel, { passive: false })

    const ro = new ResizeObserver(() => {
      measure()
      if (!busy) layout()
    })
    ro.observe(stage)
    // Native image drag would fight the pointer drag (ResponsiveImage has no draggable prop).
    list.querySelectorAll('img').forEach((img) => {
      img.draggable = false
    })
    measure()
    layout()

    return () => {
      disposed = true
      engineRef.current = null
      aligning?.stop()
      aligning = null
      cancelPreparingTransition()
      ro.disconnect()
      resetWheel()
      if (drag?.active && stage.hasPointerCapture(drag.id)) stage.releasePointerCapture(drag.id)
      drag = null
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerCancel)
      stage.removeEventListener('lostpointercapture', onPointerCancel)
      stage.removeEventListener('click', onClickCapture, true)
      stage.removeEventListener('dragstart', onDragStart)
      stage.removeEventListener('wheel', onWheel)
      ctx.revert()
      delete stage.dataset.moving
      delete stage.dataset.dragging
      delete stage.dataset.busy
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      goTo: (index, source) => engineRef.current?.goTo(index, source),
      open: (index) => engineRef.current?.open(index),
    }),
    [],
  )

  // Arrow keys move the selection only while a card has focus.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    const engine = engineRef.current
    if (!engine) return
    const base = engine.target()
    let next: number
    if (e.key === 'ArrowLeft') next = base - 1
    else if (e.key === 'ArrowRight') next = base + 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = projects.length - 1
    else return
    e.preventDefault()
    next = clamp(next, 0, projects.length - 1)
    if (next !== base) engine.focusCard(next)
  }

  const stageStyle = {
    '--spatial-card-w': `clamp(${CAROUSEL.cardWidth.min}px, ${CAROUSEL.cardWidth.vw}vw, ${CAROUSEL.cardWidth.max}px)`,
    '--spatial-card-ratio': String(CAROUSEL.cardRatio),
    '--spatial-perspective': `${CAROUSEL.perspective}px`,
    '--spatial-pad-block': `${CAROUSEL.stagePadBlock}px`,
    '--spatial-far-blur': `${CAROUSEL.farBlurPx}px`,
    '--spatial-hover-lift': `${CAROUSEL.hoverLift}px`,
  } as CSSProperties

  return (
    <div className="spatial-rail" ref={stageRef} style={stageStyle}>
      <ul className="spatial-rail__list" ref={listRef} onKeyDown={onKeyDown}>
        {projects.map((project, i) => {
          const offset = i - selected
          const depth = depthOf(offset)
          const hidden = depth === 'hidden'
          const path = projectPath(project)
          const prefetch = () => prefetchRoute(path)
          return (
            <li
              key={project.id}
              className="spatial-rail__item"
              data-depth={depth}
              // Hidden cards leave the accessibility tree; keep the real position and count.
              aria-posinset={i + 1}
              aria-setsize={projects.length}
              aria-hidden={hidden || undefined}
              inert={hidden}
            >
              {/* Roving tabindex: Tab reaches only the selected card (then the
                  title and CTA below); arrow keys, Home and End move between
                  cards. Neighbours stay focusable and clickable. */}
              <Link
                to={path}
                className="spatial-card"
                draggable={false}
                tabIndex={depth === 'active' ? 0 : -1}
                data-project-id={project.id}
                onPointerEnter={prefetch}
                onPointerDown={prefetch}
                onFocus={(e) => {
                  prefetch()
                  // Keyboard focus centres the card; pointer focus never moves anything.
                  if (e.currentTarget.matches(':focus-visible')) engineRef.current?.goTo(i, 'focus')
                }}
                onClick={(e) => {
                  if (e.defaultPrevented || !isPlainPrimaryClick(e)) return
                  e.preventDefault()
                  engineRef.current?.open(i)
                }}
              >
                <span className="visually-hidden">
                  {project.title}, {project.org}, {project.year}
                </span>
                <span className="spatial-card__frame">
                  <span className="spatial-card__media" data-card-media={project.id}>
                    <ResponsiveImage
                      image={project.cover}
                      sizes={COVER_SIZES}
                      priority={i === initialIndex}
                      decorative
                      fit="cover"
                    />
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

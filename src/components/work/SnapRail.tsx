import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'
import type { Project } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { ProjectCard } from './ProjectCard'

/** What moved the rail. Only 'control' and 'user' moves are announced. */
export type RailMoveSource = 'control' | 'user' | 'focus' | 'init'

/** Shared interface for any work rail (the snap rail now, a spatial rail later). */
export interface RailHandle {
  goTo: (index: number, source?: RailMoveSource) => void
}

interface SnapRailProps {
  ref?: Ref<RailHandle>
  projects: Project[]
  /** Currently selected project (owned by WorkCarousel). */
  selected: number
  /** Project brought into position on mount, without animation. */
  initialIndex: number
  /** Fires while scrolling whenever the nearest snapped card changes. */
  onSelect: (index: number) => void
  /** Fires once the rail has come to rest. */
  onSettle: (index: number, source: RailMoveSource) => void
}

/** Fallback settle delay for browsers without the scrollend event. */
const SETTLE_MS = 140

/** Scroll position at which card `i` is snapped (center-aligned, clamped at the ends). */
function snapTarget(rail: HTMLElement, i: number): number {
  const item = rail.children[i] as HTMLElement | undefined
  if (!item) return 0
  const max = rail.scrollWidth - rail.clientWidth
  const centered = item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2
  return Math.min(max, Math.max(0, centered))
}

/** The card whose snap position is closest to the current scroll position. */
function nearestIndex(rail: HTMLElement): number {
  const count = rail.children.length
  const x = rail.scrollLeft
  const max = rail.scrollWidth - rail.clientWidth
  // Finite ends: resting against either end always means the first/last card.
  if (x <= 1) return 0
  if (x >= max - 1) return count - 1
  let best = 0
  let bestDistance = Infinity
  for (let i = 0; i < count; i++) {
    const d = Math.abs(snapTarget(rail, i) - x)
    if (d < bestDistance) {
      best = i
      bestDistance = d
    }
  }
  return best
}

/**
 * Native horizontal scroll-snap rail (MDN scroll snap): five unique cards,
 * finite, no clones, no autoplay. Vertical page scrolling is untouched
 * (default touch-action). Selection follows the card nearest its snap
 * position, which stays unambiguous when several cards are fully visible.
 */
export function SnapRail({ ref, projects, selected, initialIndex, onSelect, onSettle }: SnapRailProps) {
  const railRef = useRef<HTMLUListElement>(null)
  const sourceRef = useRef<RailMoveSource>('user')
  const onSelectRef = useRef(onSelect)
  const onSettleRef = useRef(onSettle)

  useLayoutEffect(() => {
    onSelectRef.current = onSelect
    onSettleRef.current = onSettle
  })

  // Returning from a case study: start on that project, instantly.
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail || initialIndex <= 0) return
    const left = snapTarget(rail, initialIndex)
    if (Math.abs(rail.scrollLeft - left) < 1) return
    sourceRef.current = 'init'
    rail.scrollLeft = left
  }, [initialIndex])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const hasScrollEnd = 'onscrollend' in window
    let frame = 0
    let timer: number | undefined

    const settle = () => {
      window.clearTimeout(timer)
      const i = nearestIndex(rail)
      const source = sourceRef.current
      sourceRef.current = 'user'
      onSelectRef.current(i)
      onSettleRef.current(i, source)
    }

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          onSelectRef.current(nearestIndex(rail))
        })
      }
      if (!hasScrollEnd) {
        window.clearTimeout(timer)
        timer = window.setTimeout(settle, SETTLE_MS)
      }
    }

    rail.addEventListener('scroll', onScroll, { passive: true })
    if (hasScrollEnd) rail.addEventListener('scrollend', settle)
    return () => {
      rail.removeEventListener('scroll', onScroll)
      if (hasScrollEnd) rail.removeEventListener('scrollend', settle)
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [])

  const goTo = useCallback((index: number, source: RailMoveSource = 'control') => {
    const rail = railRef.current
    if (!rail) return
    const i = Math.min(rail.children.length - 1, Math.max(0, index))
    const left = snapTarget(rail, i)
    sourceRef.current = source
    if (Math.abs(rail.scrollLeft - left) < 1) {
      // Already in place: no scroll events will follow, so settle now.
      sourceRef.current = 'user'
      onSelectRef.current(i)
      onSettleRef.current(i, source)
      return
    }
    rail.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [])

  useImperativeHandle(ref, () => ({ goTo }), [goTo])

  return (
    <ul className="snap-rail" ref={railRef}>
      {projects.map((project, i) => (
        <li
          key={project.id}
          className="snap-rail__item"
          data-active={i === selected}
          // Keyboard focus on a card centers it (cards are the rail's only tab
          // stops). Pointer focus is left alone so a click is never moved away.
          onFocus={(e) => {
            if (e.target instanceof HTMLElement && e.target.matches(':focus-visible')) goTo(i, 'focus')
          }}
        >
          <ProjectCard project={project} priority={i === 0} />
        </li>
      ))}
    </ul>
  )
}

import { useCallback, useRef, useState } from 'react'
import { PROJECTS, type ProjectId } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SnapRail, type RailHandle, type RailMoveSource } from './SnapRail'

/** Touch-first devices get the swipe instruction (never a mouse icon). */
const TOUCH_QUERY = '(hover: none), (pointer: coarse)'

const pad = (n: number) => String(n).padStart(2, '0')

interface WorkCarouselProps {
  /** id for the visible "Selected work" heading (labels the enclosing region). */
  headingId: string
  /** Project to start on, e.g. when returning from its case study. */
  initialProjectId?: ProjectId
}

function Arrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d={direction === 'previous' ? 'M13 8H3.5M7.5 3.5 3 8l4.5 4.5' : 'M3 8h9.5M8.5 3.5 13 8l-4.5 4.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Selected work: owns the selected index, the counter, the arrow controls,
 * and the polite announcement. It renders the native snap rail at every width
 * for now; a spatial rail for wide fine-pointer screens can implement the same
 * RailHandle and be swapped in here.
 */
export function WorkCarousel({ headingId, initialProjectId }: WorkCarouselProps) {
  const projects = PROJECTS
  const count = projects.length
  const initialIndex = Math.max(0, projects.findIndex((p) => p.id === initialProjectId))

  const [index, setIndex] = useState(initialIndex)
  const [announcement, setAnnouncement] = useState('')
  const railRef = useRef<RailHandle>(null)
  /** Target of an arrow move still in flight, so rapid presses accumulate. */
  const pendingRef = useRef<number | null>(null)
  const announcedRef = useRef(initialIndex)
  const touch = useMediaQuery(TOUCH_QUERY)

  const onSettle = useCallback(
    (i: number, source: RailMoveSource) => {
      pendingRef.current = null
      // Keyboard focus already speaks the card; initial placement is not a change.
      if (source === 'focus' || source === 'init') {
        announcedRef.current = i
        return
      }
      if (i === announcedRef.current) return
      announcedRef.current = i
      setAnnouncement(`Project ${i + 1} of ${count}: ${projects[i].title}`)
    },
    [count, projects],
  )

  const go = (delta: number) => {
    const base = pendingRef.current ?? index
    const next = Math.min(count - 1, Math.max(0, base + delta))
    if (next === base) return
    pendingRef.current = next
    railRef.current?.goTo(next, 'control')
  }

  const atStart = index === 0
  const atEnd = index === count - 1

  return (
    <div className="work-carousel">
      <div className="shell work-carousel__bar">
        <h2 id={headingId} className="work-carousel__heading t-label">
          Selected work
        </h2>
        <div className="work-carousel__controls">
          <p className="work-carousel__counter tabular" aria-hidden="true">
            <span className="work-carousel__current">{pad(index + 1)}</span> / {pad(count)}
          </p>
          <button
            type="button"
            className="icon-button work-carousel__arrow"
            aria-label="Previous project"
            aria-disabled={atStart}
            onClick={() => {
              if (!atStart) go(-1)
            }}
          >
            <Arrow direction="previous" />
          </button>
          <button
            type="button"
            className="icon-button work-carousel__arrow"
            aria-label="Next project"
            aria-disabled={atEnd}
            onClick={() => {
              if (!atEnd) go(1)
            }}
          >
            <Arrow direction="next" />
          </button>
        </div>
      </div>

      <SnapRail
        ref={railRef}
        projects={projects}
        selected={index}
        initialIndex={initialIndex}
        onSelect={setIndex}
        onSettle={onSettle}
      />

      {touch && <p className="shell work-carousel__hint">Swipe to browse</p>}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}

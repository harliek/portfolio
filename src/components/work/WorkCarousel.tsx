import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { CAROUSEL } from '../../config/carousel'
import { PROJECTS, projectPath, type ProjectId } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { prefetchRoute } from '../../routes'
import { SnapRail, type RailHandle, type RailMoveSource } from './SnapRail'
import { SpatialRail, type SpatialRailHandle } from './SpatialRail'

/** Touch-first devices get the swipe instruction (never a mouse icon). */
const TOUCH_QUERY = '(hover: none), (pointer: coarse)'

const pad = (n: number) => String(n).padStart(2, '0')

/* Selection memory -------------------------------------------------------- */

const HISTORY_KEY = 'workSelection'

/**
 * Remembers the selected project on the current history entry (alongside the
 * router's own state), so Back/Forward to the homepage restores it. A new
 * visit to "/" is a new entry and starts fresh.
 */
export function rememberWorkSelection(id: ProjectId) {
  try {
    const state: unknown = window.history.state
    const current = state && typeof state === 'object' ? (state as Record<string, unknown>) : {}
    if (current[HISTORY_KEY] === id) return
    window.history.replaceState({ ...current, [HISTORY_KEY]: id }, '')
  } catch {
    /* History unavailable or rate-limited: restoration is a convenience. */
  }
}

/** The project remembered on the current history entry, if any. */
export function readWorkSelection(): ProjectId | undefined {
  try {
    const state: unknown = window.history.state
    if (!state || typeof state !== 'object') return undefined
    const id = (state as Record<string, unknown>)[HISTORY_KEY]
    return PROJECTS.find((p) => p.id === id)?.id
  } catch {
    return undefined
  }
}

/* ------------------------------------------------------------------------- */

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

const isPlainPrimaryClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

/**
 * Selected work: owns the selected index, the counter, the arrow controls,
 * and the polite announcement. Wide screens with a fine pointer (and motion
 * allowed) get the spatial arc plus a stable text region below it; everything
 * else gets the native snap rail.
 */
export function WorkCarousel({ headingId, initialProjectId }: WorkCarouselProps) {
  const projects = PROJECTS
  const count = projects.length
  const initialIndex = Math.max(0, projects.findIndex((p) => p.id === initialProjectId))

  const spatial = useMediaQuery(CAROUSEL.enableQuery)
  const touch = useMediaQuery(TOUCH_QUERY)

  const [index, setIndex] = useState(initialIndex)
  const [announcement, setAnnouncement] = useState('')
  // Each rail mounts on the current selection (e.g. after crossing 900px).
  const [railStart, setRailStart] = useState({ spatial, index: initialIndex })
  if (railStart.spatial !== spatial) setRailStart({ spatial, index })

  const snapRef = useRef<RailHandle>(null)
  const spatialRef = useRef<SpatialRailHandle>(null)
  /** Target of an arrow move still in flight, so rapid presses accumulate. */
  const pendingRef = useRef<number | null>(null)
  const announcedRef = useRef(initialIndex)
  const rootRef = useRef<HTMLDivElement>(null)
  /** Control that had focus when the selection moved out from under it. */
  const refocusRef = useRef<'title' | 'cta' | 'card' | null>(null)

  const onSelect = useCallback((i: number) => {
    // The previous entry's links (and any card beyond the visible range) become
    // inert with this change; remember where focus was so it is not dropped.
    const el = document.activeElement
    if (el instanceof HTMLElement && rootRef.current?.contains(el)) {
      const item = el.closest('.work-selected__item, .spatial-rail__item')
      if (item?.classList.contains('work-selected__item')) {
        refocusRef.current = el.classList.contains('work-selected__cta') ? 'cta' : 'title'
      } else if (item && item.parentElement) {
        const cardIndex = Array.prototype.indexOf.call(item.parentElement.children, item)
        if (Math.abs(cardIndex - i) > CAROUSEL.visibleSteps) refocusRef.current = 'card'
      }
    }
    setIndex(i)
  }, [])

  // Move focus to the same control for the new selection (without scrolling).
  useLayoutEffect(() => {
    const kind = refocusRef.current
    refocusRef.current = null
    const root = rootRef.current
    if (!kind || !root) return
    const selector =
      kind === 'card'
        ? '.spatial-rail__item[data-depth="active"] .spatial-card'
        : `.work-selected__item[data-active="true"] ${kind === 'cta' ? '.work-selected__cta' : '.work-selected__title a'}`
    root.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true })
  }, [index])

  const onSettle = useCallback(
    (i: number, source: RailMoveSource) => {
      pendingRef.current = null
      rememberWorkSelection(projects[i].id)
      // Keyboard focus already speaks the card; initial placement is not a
      // change. Clear the last sentence so it is never stale, and so the next
      // announcement is always a change even if it repeats an earlier one.
      if (source === 'focus' || source === 'init') {
        announcedRef.current = i
        setAnnouncement('')
        return
      }
      if (i === announcedRef.current) return
      announcedRef.current = i
      setAnnouncement(`Project ${i + 1} of ${count}: ${projects[i].title}`)
    },
    [count, projects],
  )

  const rail = () => (spatial ? spatialRef.current : snapRef.current)

  const moveTo = (next: number) => {
    const base = pendingRef.current ?? index
    const i = Math.min(count - 1, Math.max(0, next))
    if (i === base) return
    pendingRef.current = i
    rail()?.goTo(i, 'control')
  }
  const go = (delta: number) => moveTo((pendingRef.current ?? index) + delta)

  // On the arc, arrow keys (and Home/End) also work while an arrow button has focus.
  const onArrowKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!spatial || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    const base = pendingRef.current ?? index
    let next: number
    if (e.key === 'ArrowLeft') next = base - 1
    else if (e.key === 'ArrowRight') next = base + 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    else return
    e.preventDefault()
    moveTo(next)
  }

  // The selected title and "View case study" open with the shared-poster transition.
  const openSelected = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (e.defaultPrevented || !isPlainPrimaryClick(e)) return
    const handle = spatialRef.current
    if (!handle) return
    e.preventDefault()
    handle.open(i)
  }

  const atStart = index === 0
  const atEnd = index === count - 1

  return (
    <div className="work-carousel" data-mode={spatial ? 'spatial' : 'snap'} ref={rootRef}>
      <div className="shell work-carousel__bar" data-transition-fade>
        <h2 id={headingId} className="work-carousel__heading t-label">
          Selected work
        </h2>
        <div className="work-carousel__controls">
          {spatial && <p className="work-carousel__instruction">Drag or use the arrows</p>}
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
            onKeyDown={onArrowKeyDown}
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
            onKeyDown={onArrowKeyDown}
          >
            <Arrow direction="next" />
          </button>
        </div>
      </div>

      {spatial ? (
        <>
          <SpatialRail
            key="spatial"
            ref={spatialRef}
            projects={projects}
            selected={index}
            initialIndex={railStart.index}
            onSelect={onSelect}
            onSettle={onSettle}
          />
          {/* Essential text lives here, not only inside moving cards. All five
              entries share one grid cell, so the height never changes. */}
          <div className="shell work-selected" data-transition-fade>
            <div className="work-selected__stack">
              {projects.map((project, i) => {
                const active = i === index
                const path = projectPath(project)
                const prefetch = () => prefetchRoute(path)
                return (
                  <div
                    key={project.id}
                    className="work-selected__item"
                    data-active={active}
                    aria-hidden={active ? undefined : true}
                    inert={!active}
                  >
                    <p className="work-selected__title t-sub">
                      <Link
                        to={path}
                        onPointerEnter={prefetch}
                        onPointerDown={prefetch}
                        onFocus={prefetch}
                        onClick={(e) => openSelected(e, i)}
                      >
                        {project.title}
                      </Link>
                    </p>
                    <p className="work-selected__meta">
                      {project.org}{' '}
                      <span className="work-selected__sep" aria-hidden="true">
                        ·
                      </span>{' '}
                      <span className="tabular">{project.year}</span>
                    </p>
                    <p className="work-selected__summary">{project.summary}</p>
                    <Link
                      to={path}
                      className="work-selected__cta"
                      aria-label={`View case study: ${project.title}`}
                      onPointerEnter={prefetch}
                      onPointerDown={prefetch}
                      onFocus={prefetch}
                      onClick={(e) => openSelected(e, i)}
                    >
                      View case study <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <SnapRail
          key="snap"
          ref={snapRef}
          projects={projects}
          selected={index}
          initialIndex={railStart.index}
          onSelect={setIndex}
          onSettle={onSettle}
        />
      )}

      {!spatial && touch && <p className="shell work-carousel__hint">Swipe to browse</p>}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}

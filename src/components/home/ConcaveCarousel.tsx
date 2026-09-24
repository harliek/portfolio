import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAROUSEL } from '../../config/carousel'
import { PROJECTS, projectPath, type Project } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

const TILE_SIZES = '(min-width: 1100px) 290px, (min-width: 600px) 240px, 70vw'

/** Arc length where the continuous motion was when the carousel last unmounted or changed mode. */
let savedPhase: number | null = null

/**
 * The homepage carousel.
 *
 * - `moving` (fine pointer, motion allowed): six tiles on a concave arc,
 *   travelling laterally at one constant linear speed.
 * - `static` (reduced motion on a wide screen): the same arc, frozen with all
 *   six tiles in view.
 * - `row` (touch or coarse pointers, windows narrower than
 *   CAROUSEL.arcMinWidth, reduced motion on narrower screens): a flat,
 *   horizontally swipeable row with names, labels and direct links.
 */
export function ConcaveCarousel() {
  const reduced = useReducedMotion()
  const touch = useMediaQuery(CAROUSEL.touchQuery)
  const narrow = useMediaQuery(`(max-width: ${CAROUSEL.arcMinWidth - 0.02}px)`)
  const wide = useMediaQuery(`(min-width: ${CAROUSEL.staticArcMinWidth}px)`)
  if (touch || narrow || (reduced && !wide)) return <SwipeRow />
  return <Arc moving={!reduced} />
}

function TileText({ project, id, captionRef }: { project: Project; id: string; captionRef?: (el: HTMLElement | null) => void }) {
  return (
    <span ref={captionRef} className="arc__caption">
      <span className="arc__name" id={`${id}-name`}>
        {project.name}
      </span>
      <span className="arc__more" id={`${id}-more`}>
        <span className="arc__desc">{project.label}</span>
        <span className="arc__cta">
          View project <span aria-hidden="true">→</span>
        </span>
      </span>
    </span>
  )
}

/**
 * The concave arc. Geometry (config/carousel.ts): a wall of radius R around
 * the viewer; a tile at arc position s turns by θ = s / R and is placed with
 * `translateZ(R) rotateY(-θ) translateZ(-R)`, so the centre tile faces the
 * viewer at its natural size and edge tiles turn inward and come closer.
 * One phase (arc length) drives every tile; transforms are written directly
 * in an animation-frame loop (no React state per frame) that runs only while
 * the carousel moves: never while a tile or its caption is hovered, while
 * keyboard focus is inside, while the page is hidden or the carousel is off
 * screen.
 *
 * Captions are turned back by the tile's angle, so the name, the sentence
 * and "View project" always face the viewer (flat, never slanted).
 *
 * Keyboard: only tiles wholly inside the clipped view are in the tab order
 * (updated as they travel, never while focus is inside), so a focused tile
 * is always fully visible and nothing moves while it has focus. Every
 * project is also in the Selected work index below.
 */
function Arc({ moving }: { moving: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLUListElement>(null)
  const tileRefs = useRef<Array<HTMLLIElement | null>>([])
  const captionRefs = useRef<Array<HTMLElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const busyRef = useRef(false)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const tiles = tileRefs.current.filter((t): t is HTMLLIElement => Boolean(t))
    const captions = captionRefs.current
    const links = linkRefs.current
    if (!root || !stage || tiles.length === 0) return
    const n = tiles.length
    const g = { w: 0, spacing: 0, L: 0, R: 0, p: 0, half: 0, limit: 0 }
    const state = { hover: false, focus: false, onScreen: true, pageVisible: document.visibilityState === 'visible' }
    let phase = 0
    let raf = 0
    let last = 0
    let resumeTimer = 0

    const wrap = (s: number) => ((((s + g.L / 2) % g.L) + g.L) % g.L) - g.L / 2

    const measure = () => {
      g.w = tiles[0].offsetWidth
      const gap = parseFloat(getComputedStyle(root).getPropertyValue('--tile-gap')) || 24
      g.spacing = g.w + gap
      g.L = g.spacing * n
      g.R = g.w * (moving ? CAROUSEL.radius : CAROUSEL.staticRadius)
      g.p = g.R * CAROUSEL.perspective
      g.half = root.clientWidth / 2
      stage.style.perspective = `${g.p}px`
      g.limit = visibleLimit()
    }

    const layout = () => {
      for (let i = 0; i < n; i++) {
        const s = wrap(i * g.spacing - phase)
        const theta = s / g.R
        tiles[i].style.transform = `translateZ(${g.R}px) rotateY(${-theta}rad) translateZ(${-g.R}px)`
        tiles[i].dataset.side = s < -g.spacing / 2 ? 'left' : s > g.spacing / 2 ? 'right' : 'centre'
        const caption = captions[i]
        if (caption) caption.style.transform = `rotateY(${theta}rad)`
        const link = links[i]
        // The static arrangement shows all six and never moves: every tile is focusable.
        const tab = !moving || Math.abs(s) <= g.limit ? 0 : -1
        if (link && link.tabIndex !== tab) link.tabIndex = tab
      }
    }

    /** Screen x of a tile's outer edge at arc position s ≥ 0 (relative to the centre). */
    function outerEdge(s: number) {
      const t = s / g.R
      const x = g.R * Math.sin(t) + (g.w / 2) * Math.cos(t)
      const z = g.R * (1 - Math.cos(t)) + (g.w / 2) * Math.sin(t)
      return (x * g.p) / (g.p - z)
    }

    /** The largest |s| at which a whole tile is still inside the clipped viewport (clear of the edge fades). */
    function visibleLimit() {
      const edge = g.half * (1 - CAROUSEL.edgeFade * 2) - 8
      let lo = 0
      let hi = g.L / 2
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2
        if (outerEdge(mid) <= edge) lo = mid
        else hi = mid
      }
      return lo
    }

    const running = () => moving && !state.hover && !state.focus && state.onScreen && state.pageVisible && !busyRef.current

    const tick = (now: number) => {
      raf = 0
      if (!running()) {
        last = 0
        return
      }
      const dt = last ? Math.min((now - last) / 1000, CAROUSEL.maxStep) : 0
      last = now
      phase += CAROUSEL.speed * dt
      if (phase > g.L * 1000) phase -= g.L * 1000
      savedPhase = phase
      layout()
      raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf && running()) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    measure()
    phase = moving ? (savedPhase ?? CAROUSEL.startOffset * g.spacing) : ((n - 1) / 2) * g.spacing
    layout()
    root.dataset.ready = 'true'

    // Hover: a tile and its caption are one region. Pausing is immediate
    // (the exact phase is kept; nothing snaps or scales); after leaving, a
    // short grace lets the pointer cross the gap to the next tile.
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      window.clearTimeout(resumeTimer)
      state.hover = true
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        state.hover = false
        kick()
      }, CAROUSEL.resumeGraceMs)
    }
    tiles.forEach((t) => {
      t.addEventListener('pointerenter', onEnter)
      t.addEventListener('pointerleave', onLeave)
    })

    // Keyboard focus freezes the carousel (only tiles wholly in view can be
    // focused, see layout). Focus from a mouse or a right-click does not:
    // the pointer's hover already pauses it and leaving resumes it.
    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof Element) || !e.target.matches(':focus-visible')) return
      state.focus = true
    }
    const onFocusOut = (e: FocusEvent) => {
      if (root.contains(e.relatedTarget as Node | null)) return
      state.focus = false
      kick()
    }
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)

    const io = new IntersectionObserver(([entry]) => {
      state.onScreen = entry.isIntersecting
      kick()
    })
    io.observe(root)
    const onVisibility = () => {
      state.pageVisible = document.visibilityState === 'visible'
      kick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const ro = new ResizeObserver(() => {
      measure()
      if (!moving) phase = ((n - 1) / 2) * g.spacing
      layout()
    })
    ro.observe(root)

    kick()
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resumeTimer)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      tiles.forEach((t) => {
        t.removeEventListener('pointerenter', onEnter)
        t.removeEventListener('pointerleave', onLeave)
      })
    }
  }, [moving])

  const onOpen = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    busyRef.current = true
    openProject({ path, source: e.currentTarget.querySelector<HTMLElement>('.arc__card'), navigate })
  }

  return (
    <div ref={rootRef} className="arc" data-mode={moving ? 'moving' : 'static'}>
      <div className="arc__stage">
        <ul ref={stageRef} className="arc__list" role="list">
          {PROJECTS.map((p, i) => {
            const path = projectPath(p)
            const id = `arc-${p.id}`
            return (
              <li
                key={p.id}
                ref={(el) => {
                  tileRefs.current[i] = el
                }}
                className="arc__tile"
                data-accent={p.accent}
              >
                <a
                  ref={(el) => {
                    linkRefs.current[i] = el
                  }}
                  href={path}
                  className="arc__link"
                  aria-labelledby={`${id}-name`}
                  aria-describedby={`${id}-more`}
                  onClick={(e) => onOpen(e, path)}
                  onPointerEnter={() => warmProject(path)}
                  onFocus={() => warmProject(path)}
                >
                  <span className="arc__card">
                    <ResponsiveImage image={p.cover} sizes={TILE_SIZES} decorative fit="cover" priority={i < 4} />
                  </span>
                  <TileText
                    project={p}
                    id={id}
                    captionRef={(el) => {
                      captionRefs.current[i] = el
                    }}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Touch and narrow reduced-motion layout: a static, swipeable row. Nothing depends on hover. */
function SwipeRow() {
  const navigate = useNavigate()
  return (
    <div className="arc-row">
      <ul className="arc-row__list" role="list">
        {PROJECTS.map((p, i) => {
          const path = projectPath(p)
          return (
            <li key={p.id} className="arc-row__item" data-accent={p.accent}>
              <a
                href={path}
                className="arc-row__link"
                onClick={(e) => {
                  if (!isPlainClick(e)) return
                  e.preventDefault()
                  openProject({ path, source: e.currentTarget.querySelector<HTMLElement>('.arc-row__card'), navigate })
                }}
                onPointerEnter={() => warmProject(path)}
                onPointerDown={() => warmProject(path)}
                onFocus={() => warmProject(path)}
              >
                <span className="arc-row__card">
                  <ResponsiveImage image={p.cover} sizes={TILE_SIZES} decorative fit="cover" priority={i < 2} />
                </span>
                <span className="arc-row__name">{p.name}</span>
                <span className="arc-row__desc">{p.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

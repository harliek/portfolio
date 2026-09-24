import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MOTION } from '../../config/motion'
import { accentVars } from '../../content/accents'
import { PROJECTS, projectPath, type Project, type ProjectId } from '../../content/projects'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

/** Rendered size of a shelf thumbnail (CSS px): the project's PNG object, contained in a 48px square. */
const THUMB_SIZES = '48px'

/** The small arrow after "Creative Portfolio": it leaves the professional site for another one. */
export function ExternalMark() {
  return (
    <svg className="site-nav__mark" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false">
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * One project entry: one ordinary link with a small thumbnail of the
 * project's PNG object (whole, never cropped), the project name and its
 * short category (shown where it fits on one line, layout.css). The current
 * project says "Current page" instead. Hover and focus use the project's
 * own accent and prepare the destination (code, cover, opening image).
 * A plain click opens the page with the transition module's short plain
 * reveal (no image travels from a 48px thumbnail); modified clicks stay
 * native (new tab, new window).
 */
function ProjectLink({ project, current, thumbs, className, onNavigate }: { project: Project; current: boolean; thumbs: boolean; className: string; onNavigate: () => void }) {
  const navigate = useNavigate()
  const path = projectPath(project)
  return (
    <Link
      to={path}
      className={className}
      style={accentVars(project.accent)}
      aria-current={current ? 'page' : undefined}
      onClick={(e) => {
        onNavigate()
        if (!isPlainClick(e)) return
        e.preventDefault()
        openProject({ path, source: null, navigate })
      }}
      onPointerEnter={() => warmProject(path)}
      onFocus={() => warmProject(path)}
    >
      <span className="shelf-item__thumb" aria-hidden="true">
        {thumbs && <ResponsiveImage image={project.cover} sizes={THUMB_SIZES} decorative fit="contain" />}
      </span>
      <span className="shelf-item__text">
        <span className="shelf-item__name">{project.name}</span>
        <span className="shelf-item__meta">{current ? 'Current page' : project.category}</span>
      </span>
    </Link>
  )
}

interface WorkShelfProps {
  id: string
  open: boolean
  /** Move focus to the first project once open (the shelf was opened from the keyboard). */
  focusFirst: boolean
  /** Render the thumbnails (false until the visitor shows interest in Work, so a closed shelf downloads nothing). */
  thumbs: boolean
  /** The project whose case study is on screen (marked as current). */
  activeId?: ProjectId
  /** Close without moving focus (a link was followed). */
  onNavigate: () => void
  /** Close and return focus to the Work control. */
  onClose: () => void
}

/**
 * The Work shelf (desktop, 900px and wider): a compact row of the six
 * projects on a solid dark surface under the header, in project order (one
 * row from 1180px, two rows of three below). The page behind is dimmed so
 * the shelf reads as separate from it. Not a carousel: nothing moves.
 *
 * Opening and closing live in Header.tsx (click toggles; Escape, a click
 * outside or focus leaving closes; following a link closes). Here: Arrow
 * Left/Right move between entries (Home/End jump to the ends), Arrow
 * Up/Down move between rows (two rows below 1180px), Arrow Up from the
 * first row closes the shelf and returns to Work, Tab works as usual, and
 * opening from the keyboard focuses the first entry.
 */
export function WorkShelf({ id, open, focusFirst, thumbs, activeId, onNavigate, onClose }: WorkShelfProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open || !focusFirst) return
    listRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
  }, [open, focusFirst])

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const list = listRef.current
    if (!list) return
    const items = [...list.querySelectorAll<HTMLAnchorElement>('a')]
    const i = items.indexOf(document.activeElement as HTMLAnchorElement)
    if (i < 0) return
    const last = items.length - 1
    const columns = getComputedStyle(list).gridTemplateColumns.split(' ').filter(Boolean).length || items.length
    let next = -1
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else if (e.key === 'ArrowDown') next = i + columns <= last ? i + columns : i
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (i - columns >= 0) items[i - columns].focus()
      else onClose()
      return
    }
    if (next < 0) return
    e.preventDefault()
    items[next].focus()
  }

  const style = {
    '--shelf-dur': `${MOTION.shelf.durationMs}ms`,
    '--shelf-offset': `${MOTION.shelf.itemOffsetPx}px`,
    '--shelf-stagger': `${MOTION.shelf.itemStaggerMs}ms`,
  } as CSSProperties

  return (
    <div id={id} className="work-shelf" data-open={open || undefined} inert={!open} style={style}>
      <div className="shell work-shelf__inner">
        <ul ref={listRef} className="work-shelf__list" role="list" aria-label="Case studies" onKeyDown={onKeyDown}>
          {PROJECTS.map((p, i) => (
            <li key={p.id} className="work-shelf__entry" style={{ '--i': i } as CSSProperties}>
              <ProjectLink project={p} current={p.id === activeId} thumbs={thumbs} className="shelf-item" onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

interface MobileMenuProps {
  id: string
  open: boolean
  activeId?: ProjectId
  aboutCurrent: boolean
  /** The restored creative homepage (a plain link, full page load). */
  creativeHref: string
  onNavigate: () => void
  onAbout: (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * The small-screen menu (below 900px) on a solid surface: the six projects
 * (one column on phones, two from 600px), then About and Creative Portfolio.
 * Focus containment, Escape and the scroll lock live in Header.tsx.
 */
export function MobileMenu({ id, open, activeId, aboutCurrent, creativeHref, onNavigate, onAbout }: MobileMenuProps) {
  return (
    <div id={id} className="site-menu" data-open={open || undefined} inert={!open}>
      <nav className="shell site-menu__inner" aria-label="Primary">
        <h2 className="site-menu__label" id={`${id}-work`}>
          Work
        </h2>
        <ul className="site-menu__work" role="list" aria-labelledby={`${id}-work`}>
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <ProjectLink project={p} current={p.id === activeId} thumbs={open} className="shelf-item shelf-item--menu" onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        <ul className="site-menu__pages" role="list">
          <li>
            <Link to="/about" className="site-menu__link" aria-current={aboutCurrent ? 'page' : undefined} onClick={onAbout}>
              About
            </Link>
          </li>
          <li>
            <a href={creativeHref} className="site-menu__link">
              Creative Portfolio
              <ExternalMark />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

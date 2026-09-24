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
 * one-line context (employer or independent work), the same in the shelf
 * and the small-screen menu. Hover and focus use the project's own accent
 * and prepare the destination (code, cover, opening image). A plain click
 * opens the page with the transition module's short plain reveal (no image
 * travels from a 48px thumbnail); modified clicks stay native (new tab, new
 * window).
 *
 * The project on screen is not a link: the same entry, highlighted and
 * saying "Current page", as plain text marked `aria-current="page"`
 * (following it would only reload this page and add a Back step). The
 * shelf's arrow keys and Tab pass over it.
 */
function ProjectLink({ project, current, thumbs, className, onNavigate }: { project: Project; current: boolean; thumbs: boolean; className: string; onNavigate: () => void }) {
  const navigate = useNavigate()
  const path = projectPath(project)
  const content = (
    <>
      <span className="shelf-item__thumb" aria-hidden="true">
        {thumbs && <ResponsiveImage image={project.cover} sizes={THUMB_SIZES} decorative fit="contain" />}
      </span>
      <span className="shelf-item__text">
        <span className="shelf-item__name">{project.name}</span>
        <span className="shelf-item__meta">{current ? 'Current page' : project.category}</span>
      </span>
    </>
  )
  if (current) {
    return (
      <span className={className} style={accentVars(project.accent)} aria-current="page">
        {content}
      </span>
    )
  }
  return (
    <Link
      to={path}
      className={className}
      style={accentVars(project.accent)}
      onClick={(e) => {
        onNavigate()
        if (!isPlainClick(e)) return
        e.preventDefault()
        openProject({ path, source: null, navigate })
      }}
      onPointerEnter={() => warmProject(path)}
      onFocus={() => warmProject(path)}
    >
      {content}
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
 * The Work shelf (desktop, 900px and wider): the six projects on one solid
 * dark surface under the header, in project order, in two rows of three at
 * every width. The page behind is dimmed so the shelf reads as separate
 * from it. Not a carousel: nothing moves.
 *
 * Opening and closing live in Header.tsx (click toggles; Escape, a click
 * outside or focus leaving closes; following a link closes). Here: Arrow
 * Left/Right move between the links (Home/End jump to the ends), Arrow
 * Up/Down move between the two rows, Arrow Up from the
 * first row closes the shelf and returns to Work, Tab works as usual, and
 * opening from the keyboard focuses the first link. The current project
 * (text, not a link) is passed over.
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
    // Every entry keeps its place in the grid; only the links take focus (the current project is text).
    const entries = [...list.querySelectorAll<HTMLElement>('.shelf-item')]
    const i = entries.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    const n = entries.length
    const isLink = (k: number) => entries[k]?.tagName === 'A'
    const columns = getComputedStyle(list).gridTemplateColumns.split(' ').filter(Boolean).length || n
    /** The next link from k in direction dir, around the ends. */
    const walk = (k: number, dir: 1 | -1) => {
      for (let s = 1; s < n; s++) {
        const t = (((k + dir * s) % n) + n) % n
        if (isLink(t)) return t
      }
      return i
    }
    /** The entry t in another row, or the link beside it in that row. */
    const inRow = (t: number) => {
      const start = t - (t % columns)
      return [t, t + 1, t - 1].find((k) => k >= start && k < Math.min(n, start + columns) && isLink(k)) ?? i
    }
    let next = -1
    if (e.key === 'ArrowRight') next = walk(i, 1)
    else if (e.key === 'ArrowLeft') next = walk(i, -1)
    else if (e.key === 'Home') next = isLink(0) ? 0 : walk(0, 1)
    else if (e.key === 'End') next = isLink(n - 1) ? n - 1 : walk(n - 1, -1)
    else if (e.key === 'ArrowDown') next = i + columns < n ? inRow(i + columns) : i
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (i - columns >= 0) entries[inRow(i - columns)].focus()
      else onClose()
      return
    }
    if (next < 0) return
    e.preventDefault()
    entries[next].focus()
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

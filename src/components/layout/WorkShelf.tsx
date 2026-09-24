import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { MOTION } from '../../config/motion'
import { PROJECTS, projectPath, type Project, type ProjectId } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'

/** Rendered width of a shelf thumbnail (CSS px): the project's 3:4 tile artwork, 60px tall. */
const THUMB_SIZES = '45px'

/**
 * One project entry: a small thumbnail of the project's tile artwork (the
 * same image as its carousel tile), the project name and a persistent
 * "View case study ↗" line, so every entry reads as a link before hover.
 * The current project says so instead.
 */
function ProjectLink({ project, current, thumbs, className, onNavigate }: { project: Project; current: boolean; thumbs: boolean; className: string; onNavigate: () => void }) {
  const path = projectPath(project)
  return (
    <Link
      to={path}
      className={className}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
      onPointerEnter={() => prefetchRoute(path)}
      onFocus={() => prefetchRoute(path)}
    >
      <span className="shelf-item__thumb" aria-hidden="true">
        {thumbs && <ResponsiveImage image={project.cover} sizes={THUMB_SIZES} decorative fit="cover" />}
      </span>
      <span className="shelf-item__text">
        <span className="shelf-item__name">{project.name}</span>
        <span className="shelf-item__action">
          {current ? (
            'Current case study'
          ) : (
            <>
              View case study <span className="link-arrow" aria-hidden="true">↗</span>
            </>
          )}
        </span>
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
 * The Work shelf (desktop, 900px and wider): a compact horizontal shelf of
 * all six projects under the header, in project order. Each entry is one
 * ordinary link (phone thumbnail, name, "View case study ↗").
 *
 * Opening and closing live in Header.tsx (click toggles; Escape, a click
 * outside or focus leaving closes). Here: Arrow Left/Right move between
 * entries (Home/End jump to the ends), Tab works as usual, and opening from
 * the keyboard focuses the first entry.
 */
export function WorkShelf({ id, open, focusFirst, thumbs, activeId, onNavigate, onClose }: WorkShelfProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open || !focusFirst) return
    listRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
  }, [open, focusFirst])

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLAnchorElement)
    if (i < 0) return
    const last = items.length - 1
    const next =
      e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      onClose()
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
  onNavigate: () => void
  onAbout: (e: MouseEvent<HTMLAnchorElement>) => void
  onContact: (e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * The small-screen menu (below 900px): the six projects in two columns,
 * then About and Contact. Focus containment, Escape and the scroll lock
 * live in Header.tsx.
 */
export function MobileMenu({ id, open, activeId, aboutCurrent, onNavigate, onAbout, onContact }: MobileMenuProps) {
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
            <a href="#contact" className="site-menu__link" onClick={onContact}>
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

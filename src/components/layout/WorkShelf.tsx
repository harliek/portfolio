import { useState, type MouseEvent } from 'react'
import { PROJECTS, projectPath, type Project, type ProjectId } from '../../content/projects'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { PageLink } from '../transition/PageLink'
import { leaveSite } from '../transition/pageChange'
import { isPlainClick } from '../transition/warm'
import { MetaLine } from './MetaLine'

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
 * project's PNG object (whole, never cropped), the project's display title
 * (`displayName`, the same name the homepage tile uses) and its
 * metadata line, kind of work then context (projects.ts `category`, the homepage tiles' captions; MetaLine wraps it
 * at its dot where the column is narrow, Harlie's brief, 2026-09-28), the same in the shelf and the small-screen
 * menu. Hover and focus use the statement rose and prepare the destination (its code and opening image). A plain
 * click changes the page like every other link in the site (PageLink: the page comes apart and the next builds
 * itself); modified clicks stay native (new tab, new window).
 *
 * The project on screen is not a link: the same entry, highlighted and
 * saying "Current page", as plain text marked `aria-current="page"`
 * (following it would only reload this page and add a Back step). The
 * shelf's arrow keys and Tab pass over it.
 */
function ProjectLink({ project, current, thumbs, className, onNavigate }: { project: Project; current: boolean; thumbs: boolean; className: string; onNavigate: OnNavigate }) {
  const path = projectPath(project)
  const content = (
    <>
      <span className="shelf-item__thumb" aria-hidden="true">
        {thumbs && <ResponsiveImage image={project.cover} sizes={THUMB_SIZES} decorative fit="contain" />}
      </span>
      <span className="shelf-item__text">
        <span className="shelf-item__name">{project.displayName}</span>
        <span className="shelf-item__meta">{current ? 'Current page' : <MetaLine text={project.category} />}</span>
      </span>
    </>
  )
  if (current) {
    return (
      <span className={className} aria-current="page">
        {content}
      </span>
    )
  }
  return (
    <PageLink to={path} className={className} onClick={onNavigate(path)}>
      {content}
    </PageLink>
  )
}

/** A click handler for a link to `to` in the menu (Header.tsx: the page changes with the menu still open). */
type OnNavigate = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => void

interface MobileMenuProps {
  id: string
  open: boolean
  activeId?: ProjectId
  aboutCurrent: boolean
  /** The restored creative homepage (a plain link, full page load). */
  creativeHref: string
  onNavigate: OnNavigate
}

/**
 * The small-screen menu (below 900px) on a solid surface: the six projects
 * (one column on phones, two from 600px), then About and Creative Portfolio.
 * Focus containment, Escape and the scroll lock live in Header.tsx.
 *
 * The thumbnails load with the first opening and then stay (Harlie's brief, 2026-09-28): unmounted on closing, they
 * went blank for a frame as a page chosen from the menu was pictured, and decoded again on every opening. Leaving for
 * the creative portfolio keeps the menu open: the whole page, menu and all, fades out as it goes (leaveSite).
 */
export function MobileMenu({ id, open, activeId, aboutCurrent, creativeHref, onNavigate }: MobileMenuProps) {
  const [opened, setOpened] = useState(open)
  // The first opening mounts the thumbnails (adjusting state while rendering, not in an effect).
  if (open && !opened) setOpened(true)
  return (
    <div id={id} className="site-menu" data-open={open || undefined} inert={!open}>
      <nav className="shell site-menu__inner" aria-label="Primary">
        <h2 className="site-menu__label" id={`${id}-work`}>
          Projects
        </h2>
        <ul className="site-menu__work" role="list" aria-labelledby={`${id}-work`}>
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <ProjectLink project={p} current={p.id === activeId} thumbs={opened} className="shelf-item shelf-item--menu" onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        <ul className="site-menu__pages" role="list">
          <li>
            <PageLink to="/about" className="site-menu__link" aria-current={aboutCurrent ? 'page' : undefined} onClick={onNavigate('/about')}>
              About
            </PageLink>
          </li>
          <li>
            <a
              href={creativeHref}
              className="site-menu__link"
              onClick={(e) => {
                if (!isPlainClick(e)) return
                e.preventDefault()
                leaveSite(creativeHref)
              }}
            >
              Creative Portfolio
              <ExternalMark />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

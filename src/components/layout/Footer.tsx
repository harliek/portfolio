import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PROJECTS, projectById, projectForPath, projectPath, type Project } from '../../content/projects'
import { SITE } from '../../content/site'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'
import { StatefulIcons } from '../ui/Stateful'

/** A small red button to the previous or next case study (a plain fade, as the Projects menu opens one). */
function PagerLink({ to, dir }: { to: Project; dir: 'previous' | 'next' }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const path = projectPath(to)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    setLoading(true)
    openProject({ path, source: null, navigate })
  }
  return (
    <a
      className={`site-end__pager site-end__pager--${dir} stateful`}
      href={path}
      data-state={loading ? 'loading' : 'idle'}
      aria-label={`${dir === 'next' ? 'Next' : 'Previous'} project, ${to.displayName}`}
      onClick={onClick}
      onPointerEnter={() => warmProject(path)}
      onFocus={() => warmProject(path)}
    >
      <StatefulIcons />
      {dir === 'previous' && !loading && (
        <span className="site-end__pager-arrow" aria-hidden="true">
          ←
        </span>
      )}
      {dir === 'next' ? 'Next project' : 'Previous project'}
      {dir === 'next' && (
        <span className="site-end__pager-arrow" aria-hidden="true">
          →
        </span>
      )}
    </a>
  )
}

/**
 * The end of every page (brief v18): transparent and without a line (Harlie's request). The email address, LinkedIn
 * and the résumé (checked: no phone number in it), and the copyright; no name link (Harlie's request). On a case
 * study it is one row, well below the page's last section: "Previous project" at the left, the links and the
 * copyright in the middle, "Next project" at the right, following the case studies' loop. Elsewhere, the links with
 * the copyright in the far right corner. Narrow windows: the two buttons on one line, the links under them.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const current = pathname.startsWith('/work/') ? projectForPath(pathname) : undefined
  const next = current ? projectById(current.next) : undefined
  const previous = current ? PROJECTS.find((p) => p.next === current.id) : undefined
  const links = (
    <nav className="site-end__links" aria-label="Contact and elsewhere">
      <a className="site-end__link" href={SITE.emailHref}>
        {SITE.email}
      </a>
      <a className="site-end__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      <a className="site-end__link" href={SITE.resume} target="_blank" rel="noopener noreferrer">
        Résumé<span className="visually-hidden"> (PDF, opens in a new tab)</span>
      </a>
    </nav>
  )
  const copy = (
    <p className="site-end__copy tabular">
      © {year} {SITE.name}
    </p>
  )
  return (
    <footer className="site-end" data-pager={current ? '' : undefined}>
      <div className="site-end__inner">
        {current ? (
          <>
            {previous && <PagerLink key={`p-${pathname}`} to={previous} dir="previous" />}
            <div className="site-end__contact">
              {links}
              {copy}
            </div>
            {next && <PagerLink key={`n-${pathname}`} to={next} dir="next" />}
          </>
        ) : (
          <>
            {links}
            {/* The copyright in the far right corner. */}
            {copy}
          </>
        )}
      </div>
    </footer>
  )
}

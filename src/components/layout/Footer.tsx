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
 * The end of every page (brief v18): one compact row, transparent and
 * without a line (Harlie's request). Harlie's name (a mailto link, with a
 * label that says so), then the email address itself, LinkedIn and the
 * résumé (checked: no phone number in it), and the copyright. On a case
 * study it also carries a small "Previous project" button in its lower left
 * corner and "Next project" in its lower right (in place of the old
 * next-project block under the story), following the case studies' loop.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const current = pathname.startsWith('/work/') ? projectForPath(pathname) : undefined
  const next = current ? projectById(current.next) : undefined
  const previous = current ? PROJECTS.find((p) => p.next === current.id) : undefined
  return (
    <footer className="site-end" data-pager={current ? '' : undefined}>
      <div className="site-end__inner">
        {previous && <PagerLink key={`p-${pathname}`} to={previous} dir="previous" />}
        <a className="site-end__name" href={SITE.emailHref} aria-label={`Email Harlie Katz at ${SITE.email}`}>
          {SITE.name}
        </a>
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
        <p className="site-end__copy tabular">
          © {year} {SITE.name}
        </p>
        {next && <PagerLink key={`n-${pathname}`} to={next} dir="next" />}
      </div>
    </footer>
  )
}

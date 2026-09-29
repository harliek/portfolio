import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PROJECTS, projectById, projectForPath, projectPath, type Project } from '../../content/projects'
import { SITE } from '../../content/site'
import { changePage } from '../transition/pageChange'
import { isPlainClick, warmProject } from '../transition/warm'
import { StatefulIcons } from '../ui/Stateful'

/**
 * A small button to the previous or next case study: the page comes apart and the next builds itself (pageChange.ts),
 * its pieces sweeping to the left for the next project and to the right for the previous one.
 */
function PagerLink({ to, dir }: { to: Project; dir: 'previous' | 'next' }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const path = projectPath(to)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    setLoading(true)
    changePage({ to: path, navigate, direction: dir === 'next' ? 'forward' : 'back', onCancel: () => setLoading(false) })
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
      <span>{dir === 'next' ? `Next project · ${to.displayName}` : 'Previous project'}</span>
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
 *
 * On About the contact section just above carries the same three links beside the form (ContactForm.tsx; Harlie's
 * brief, 2026-09-28, item 8), so the footer keeps only the copyright there: no second set 100 to 180px below the first,
 * and on a small phone the page's end no longer leaves "Get in touch" under the navigation.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const current = pathname.startsWith('/work/') ? projectForPath(pathname) : undefined
  const onAbout = pathname === '/about'
  const next = current ? projectById(current.next) : undefined
  const previous = current ? PROJECTS.find((p) => p.next === current.id) : undefined
  const links = (
    <nav className="site-end__links" aria-label="Contact and elsewhere">
      <a className="site-end__link" href={SITE.emailHref}>
        {SITE.email}
      </a>
      {/* LinkedIn and the résumé wrap together, never the résumé alone under the others (layout.css). */}
      <span className="site-end__pair">
        <a className="site-end__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <a className="site-end__link" href={SITE.resume} target="_blank" rel="noopener noreferrer">
          Résumé<span className="visually-hidden"> (PDF, opens in a new tab)</span>
        </a>
      </span>
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
            {!onAbout && links}
            {/* The copyright in the far right corner. */}
            {copy}
          </>
        )}
      </div>
    </footer>
  )
}


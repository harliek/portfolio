import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectById, projectPath, type ProjectId } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

/**
 * Next-project navigation after the results, with normal spacing: the next
 * project's cover, name and label as one link (its cover travels into the
 * next case's opening image), and a link back to the Selected work index.
 */
export function NextProject({ current }: { current: ProjectId }) {
  const navigate = useNavigate()
  const next = projectById(projectById(current).next)
  const path = projectPath(next)
  return (
    <nav className="case-shell next-project" aria-label="Next project">
      <p className="next-project__eyebrow">Next project</p>
      <a
        href={path}
        className="next-project__link"
        onClick={(e) => {
          if (!isPlainClick(e)) return
          e.preventDefault()
          openProject({ path, source: e.currentTarget.querySelector<HTMLElement>('.next-project__cover'), navigate })
        }}
        onPointerEnter={() => warmProject(path)}
        onFocus={() => warmProject(path)}
      >
        <span className="next-project__cover">
          <ResponsiveImage image={next.cover} sizes="120px" decorative fit="cover" />
        </span>
        <span className="next-project__text">
          <span className="next-project__name">{next.name}</span>
          <span className="next-project__label">{next.label}</span>
          <span className="next-project__cta">
            View project <span aria-hidden="true">→</span>
          </span>
        </span>
      </a>
      <Link to={{ pathname: '/', hash: '#selected-work' }} className="next-project__all">
        All work
      </Link>
    </nav>
  )
}

/** A small link to a related project (e.g. CafePress UK and Merchandising Platform). */
export function RelatedProject({ id, children }: { id: ProjectId; children?: ReactNode }) {
  const p = projectById(id)
  const path = projectPath(p)
  return (
    // A div, not a p, so it keeps its own small style inside .case-prose.
    <div className="related-project">
      <span className="related-project__label">Related project</span>
      <Link to={path} className="related-project__link" onPointerEnter={() => prefetchRoute(path)} onFocus={() => prefetchRoute(path)}>
        {p.name}
      </Link>
      {children && <span className="related-project__note">{children}</span>}
    </div>
  )
}

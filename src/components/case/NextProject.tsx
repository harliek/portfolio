import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectById, projectPath, type ProjectId } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

interface NextProjectProps {
  current: ProjectId
  /**
   * Replaces the next project's one-sentence description, e.g. to say that
   * the next project is a separate, later piece of work.
   */
  description?: ReactNode
}

/**
 * The one next-project row after Results: a single, clearly actionable link
 * labelled "Next project · <Name> ↗" with the project's one-sentence
 * description. A plain click (or Enter) opens the project through
 * openProject, which gives the destination's opening frame a short reveal
 * (nothing travels across text); modifier and middle clicks stay native.
 */
export function NextProject({ current, description }: NextProjectProps) {
  const navigate = useNavigate()
  const next = projectById(projectById(current).next)
  const path = projectPath(next)
  return (
    <nav className="next-project" aria-label="Next project">
      <Link
        to={path}
        className="next-project__link"
        onClick={(e) => {
          if (!isPlainClick(e)) return
          e.preventDefault()
          openProject({ path, source: null, navigate })
        }}
        onPointerEnter={() => warmProject(path)}
        onFocus={() => warmProject(path)}
      >
        <span className="next-project__label">
          Next project · {next.name}{' '}
          <span className="next-project__arrow" aria-hidden="true">
            ↗
          </span>
        </span>
        <span className="next-project__desc">{description ?? next.description}</span>
      </Link>
    </nav>
  )
}

/**
 * A small inline link to a related project (legacy pages). New pages carry
 * the relationship in NextProject's `description` instead, so there is
 * exactly one related link.
 */
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

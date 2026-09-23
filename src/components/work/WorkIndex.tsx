import { useId } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS, projectPath } from '../../content/projects'
import { prefetchRoute } from '../../routes'

/**
 * All projects as a compact, always-available list of plain rows: the
 * robust navigation path alongside the rail. Each row is one link.
 */
export function WorkIndex() {
  const headingId = useId()
  return (
    <section className="work-index" aria-labelledby={headingId}>
      <h2 id={headingId} className="work-index__heading t-label">
        All projects
      </h2>
      <ul className="work-index__list">
        {PROJECTS.map((project) => {
          const path = projectPath(project)
          const prefetch = () => prefetchRoute(path)
          return (
            <li key={project.id}>
              <Link to={path} className="work-index__row" onPointerEnter={prefetch} onFocus={prefetch}>
                <span className="work-index__title">{project.title}</span>
                <span className="work-index__meta">
                  <span className="work-index__org">{project.org}</span>{' '}
                  <span className="work-index__sep" aria-hidden="true">
                    ·
                  </span>{' '}
                  <span className="work-index__year tabular">{project.year}</span>
                </span>
                <span className="work-index__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

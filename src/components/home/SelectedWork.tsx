import { Link } from 'react-router-dom'
import { PROJECTS, projectPath } from '../../content/projects'
import { prefetchRoute } from '../../routes'

/**
 * The compact Selected work index under the carousel: all six projects,
 * each row with its name, one short factual description, the timeframe and
 * a link. No second animated preview.
 */
export function SelectedWork() {
  return (
    <section id="selected-work" className="shell selected-work" aria-labelledby="selected-work-title" tabIndex={-1}>
      <h2 id="selected-work-title" className="selected-work__title">
        Selected work
      </h2>
      <ol className="selected-work__list" role="list">
        {PROJECTS.map((p) => {
          const path = projectPath(p)
          return (
            <li key={p.id} className="selected-work__row">
              <Link
                to={path}
                className="selected-work__link"
                onPointerEnter={() => prefetchRoute(path)}
                onFocus={() => prefetchRoute(path)}
              >
                <span className="selected-work__name">{p.name}</span>
                <span className="selected-work__summary">{p.summary}</span>
                <span className="selected-work__year tabular">{p.year}</span>
                <span className="selected-work__go" aria-hidden="true">
                  View <span className="selected-work__arrow">→</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

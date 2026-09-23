import { Link } from 'react-router-dom'
import { PROJECTS, projectPath } from '../content/projects'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

// Phase 1 shell. Completed in Phase 2.
export function Home() {
  usePageMeta(undefined, SITE.description)
  return (
    <div className="shell">
      <h1 className="t-display">{SITE.name}</h1>
      <p className="t-sub t-muted">{SITE.descriptor}</p>
      <section id="work" tabIndex={-1} aria-label="Selected work">
        <ul>
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <Link to={projectPath(p)}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

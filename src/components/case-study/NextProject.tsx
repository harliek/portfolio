import { Link } from 'react-router-dom'
import { projectById, projectPath, type ProjectId } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'

/** One quiet next-project preview plus an "All work" link. */
export function NextProject({ current }: { current: ProjectId }) {
  const here = projectById(current)
  const next = projectById(here.next)
  const path = projectPath(next)
  return (
    <nav className="shell next-project" aria-label="Next project">
      <Link
        to={path}
        className="next-project__link"
        onPointerEnter={() => prefetchRoute(path)}
        onFocus={() => prefetchRoute(path)}
      >
        <span className="next-project__text">
          <span className="next-project__eyebrow t-label">Next project</span>
          <span className="next-project__title t-section">{next.title}</span>
          <span className="next-project__org t-muted">{next.org}</span>
        </span>
        <span className="next-project__media">
          <ResponsiveImage image={next.cover} sizes="(min-width: 900px) 360px, (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)" decorative fit="cover" />
        </span>
      </Link>
      <Link to="/" state={{ selectProject: here.id }} className="back-link next-project__all">
        <span aria-hidden="true">←</span> All work
      </Link>
    </nav>
  )
}

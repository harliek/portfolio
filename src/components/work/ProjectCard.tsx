import { useId } from 'react'
import { Link } from 'react-router-dom'
import { projectPath, type Project } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'

/** Rendered cover width per breakpoint for rail cards (literal; no CSS vars). */
export const CARD_COVER_SIZES = '(min-width: 900px) 460px, (min-width: 600px) 62vw, 86vw'

interface ProjectCardProps {
  project: Project
  /** Eager, high-priority cover. Use only for the homepage LCP image. */
  priority?: boolean
  sizes?: string
}

/**
 * One project as a single real link: cover, title, organization and year,
 * summary, and a visual "View case study" cue. The link is named by the
 * title and described by the context and summary, so assistive technology
 * hears a short name rather than the whole card.
 */
export function ProjectCard({ project, priority = false, sizes = CARD_COVER_SIZES }: ProjectCardProps) {
  const uid = useId()
  const path = projectPath(project)
  const prefetch = () => prefetchRoute(path)
  const titleId = `${uid}-title`
  const metaId = `${uid}-meta`
  const summaryId = `${uid}-summary`

  return (
    <Link
      to={path}
      className="project-card"
      data-project-id={project.id}
      aria-labelledby={titleId}
      aria-describedby={`${metaId} ${summaryId}`}
      onPointerEnter={prefetch}
      onFocus={prefetch}
    >
      <span className="project-card__media" data-card-media={project.id}>
        <ResponsiveImage image={project.cover} sizes={sizes} priority={priority} decorative fit="cover" />
      </span>
      <span className="project-card__body">
        <span id={titleId} className="project-card__title t-sub">
          {project.title}
        </span>
        <span id={metaId} className="project-card__meta">
          {project.org}{' '}
          <span className="project-card__sep" aria-hidden="true">
            ·
          </span>{' '}
          <span className="tabular">{project.year}</span>
        </span>
        <span id={summaryId} className="project-card__summary">
          {project.summary}
        </span>
        <span className="project-card__cta">
          View case study <span aria-hidden="true">↗</span>
        </span>
      </span>
    </Link>
  )
}

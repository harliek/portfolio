import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ImageId } from '../../content/media'
import type { Project } from '../../content/projects'
import { Figure } from '../media/Figure'
import { BoundaryNote } from './BoundaryNote'
import { MetadataList, type MetaItem } from './MetadataList'

interface CaseHeaderProps {
  project: Project
  eyebrow: string
  title: string
  summary: string
  meta: MetaItem[]
  ownership?: ReactNode
  hero: ImageId
  heroCaption?: ReactNode
  /** Chapter anchor links shown below the hero: [label, #id]. */
  chapters?: Array<[string, string]>
}

/**
 * Shared opening for every case study:
 * All work → eyebrow → H1 → summary → metadata → ownership → hero → chapters.
 * The hero element carries data-shared-hero so the homepage transition can
 * land on it; it is always visible immediately (no entrance animation).
 */
export function CaseHeader({ project, eyebrow, title, summary, meta, ownership, hero, heroCaption, chapters }: CaseHeaderProps) {
  return (
    <header className="case-header">
      <div className="shell">
        <Link to="/" state={{ selectProject: project.id }} className="back-link">
          <span aria-hidden="true">←</span> All work
        </Link>
        <p className="case-header__eyebrow t-label">{eyebrow}</p>
        <h1 className="case-header__title t-display" tabIndex={-1}>
          {title}
        </h1>
        <p className="case-header__summary t-sub">{summary}</p>
        <MetadataList items={meta} />
        {ownership && <BoundaryNote>{ownership}</BoundaryNote>}
      </div>
      <div className="shell case-hero" data-shared-hero={project.id}>
        <Figure image={hero} sizes="(min-width: 1248px) 1120px, (min-width: 1200px) calc(100vw - 128px), (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)" priority caption={heroCaption} className="case-hero__figure" />
      </div>
      {chapters && chapters.length > 0 && (
        <nav className="shell chapter-links" aria-label="Chapters">
          <ul>
            {chapters.map(([label, id]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

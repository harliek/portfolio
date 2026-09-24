import '../../styles/case.css'
import type { CSSProperties, ReactNode } from 'react'
import { ACCENTS, accentVars } from '../../content/accents'
import type { Project } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'

/*
 * The shared case-study page (brief-v5 sections 13 to 16 and 30):
 *
 *   <CaseLayout project className="page-x">   article, page meta, the project's accent
 *     <CaseScroll … />                         opening, cover, story and outcome beside ONE
 *                                              media stage (see the note in CaseScroll.tsx)
 *     <NextProject current={project.id} />     small next-project PNG + "Next project" + name
 *   </CaseLayout>
 *
 * The accent (--accent, --accent-rgb; --case-accent for older page CSS) is
 * carried into the active section marker, highlights, media hover and focus
 * edges, link and button hover states, never into whole paragraphs.
 */

interface CaseLayoutProps {
  project: Project
  /** Page root class, e.g. `page-cafepress-uk` (scope page CSS under it). */
  className?: string
  children: ReactNode
}

export function CaseLayout({ project, className, children }: CaseLayoutProps) {
  usePageMeta(project.seo.title, project.seo.description)
  return (
    <article
      className={['case', className].filter(Boolean).join(' ')}
      data-project={project.id}
      style={{ ...accentVars(project.accent), '--case-accent': ACCENTS[project.accent].hex } as CSSProperties}
    >
      {children}
    </article>
  )
}

import { CaseHeader } from '../../components/case-study/CaseHeader'
import { NextProject } from '../../components/case-study/NextProject'
import { projectById } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'

const project = projectById('valiance')

// Phase 1 shell. The full case study replaces this file in Phase 3.
export default function Valiance() {
  usePageMeta(project.seo.title, project.seo.description)
  return (
    <article className="case-study">
      <CaseHeader
        project={project}
        eyebrow={project.org}
        title={project.title}
        summary={project.caseSummary}
        meta={[
          { term: 'Role', detail: project.role },
          { term: 'When', detail: project.dateRange },
        ]}
        ownership={project.ownership}
        hero={project.hero}
      />
      <NextProject current={project.id} />
    </article>
  )
}

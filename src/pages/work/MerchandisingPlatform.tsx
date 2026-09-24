import '../../styles/pages/merchandising-platform.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { MERCHANDISING_PLATFORM as C, PREVIEW_MAP } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * Merchandising Platform: the real dashboard recording beside the story. Inline, its edited preview (1.5×, idle
 * stretches cut, readable holds) opens on the replenishment drawer, the page's strongest moment, so it matches the
 * poster (the same drawer); Expand plays the complete recording at original speed from the matching moment.
 */
export default function MerchandisingPlatform() {
  return (
    <CaseLayout project={project} className="page-merchandising-platform">
      <CaseScroll
        project={project}
        meta={C.meta}
        status={C.status}
        summary={C.summary}
        media={{
          kind: 'video',
          video: 'merch-console',
          preview: { video: 'merch-console-preview', label: 'Edited preview · 1.5× speed', map: PREVIEW_MAP },
        }}
        sections={C.sections}
        outcome={C.outcome}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

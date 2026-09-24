import '../../styles/pages/merchandising-platform.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { MERCHANDISING_PLATFORM as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * Merchandising Platform: the real dashboard recording autoplays beside the
 * story (CaseScroll video media). Its poster is the recording's opening
 * Overview frame (the manifest default), so autoplay starts without a jump.
 */
export default function MerchandisingPlatform() {
  return (
    <CaseLayout project={project} className="page-merchandising-platform">
      <CaseScroll
        project={project}
        meta={C.meta}
        summary={C.summary}
        media={{ kind: 'video', video: 'merch-console' }}
        sections={C.sections}
        outcome={C.outcome}
        // Smaller than the default: the cover monitor's large headline would otherwise outweigh the recording, the
        // page's evidence, so it stays a small identifier.
        coverScale={0.6}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

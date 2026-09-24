import '../../styles/pages/jumpstart-finance.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { JUMPSTART_FINANCE as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Jumpstart Finance (route /work/jumpstart): the original 2024 prototype
 * screens change beside the story in one stable portrait stage (CaseScroll
 * states media). The phone cover in the opening is later artwork; no pitch
 * slides are shown.
 */
export default function JumpstartFinance() {
  return (
    <CaseLayout project={project} className="page-jumpstart-finance">
      <CaseScroll
        project={project}
        meta={C.meta}
        summary={C.summary}
        media={C.media}
        sections={C.sections}
        outcome={C.outcome}
        // The upright phone reads small at the default scale beside the wide covers of other pages.
        coverScale={0.86}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

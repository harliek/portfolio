import '../../styles/pages/ai-leasing-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { AI_LEASING_AGENT as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * The frame has the ratio of the two conversation crops (836×452), so the
 * focused views fill it; the opening (the whole illustration, 16:9) sits
 * contained at the left, in line with its caption.
 */
const FRAME_RATIO = '836 / 452'

/** AI Leasing Agent (route /work/valiance). */
export default function AILeasingAgent() {
  return (
    <CaseLayout project={project} className="page-ai-leasing-agent">
      <CaseScroll project={project} situation={C.situation} opening={C.opening} sections={C.sections} frameRatio={FRAME_RATIO} />
      <Results>{C.results}</Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

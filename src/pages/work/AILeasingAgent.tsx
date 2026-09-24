import '../../styles/pages/ai-leasing-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { AI_LEASING_AGENT as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (route /work/valiance): one illustrative conversation beside the story, its renter, assistant and
 * staff moments brought forward in turn (CaseScroll custom media, components/pages/ai-leasing-agent/ConversationStage).
 */
export default function AILeasingAgent() {
  return (
    <CaseLayout project={project} className="page-ai-leasing-agent">
      <CaseScroll project={project} meta={C.meta} summary={C.summary} media={C.media} sections={C.sections} outcome={C.outcome} />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

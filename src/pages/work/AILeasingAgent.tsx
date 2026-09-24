import '../../styles/pages/ai-leasing-agent.css'
import { CaseLayout, CaseOpening, CaseSection } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { DiagramSlot } from '../../components/media/DiagramSlot'
import { ConversationHero } from '../../components/pages/ai-leasing-agent/ConversationHero'
import { ConversationSteps } from '../../components/pages/ai-leasing-agent/ConversationSteps'
import { AI_LEASING_AGENT as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (route /work/valiance). The opening shows the whole
 * illustrative web chat; Approach keeps one conversation frame (the message
 * thread) and highlights the message each paragraph refers to.
 */
export default function AILeasingAgent() {
  return (
    <CaseLayout project={project} className="page-ai-leasing-agent">
      <CaseOpening project={project} description={C.description} note={C.note} hero={<ConversationHero caption={C.heroCaption} />} />
      <CaseSection id="context" title="Context and role">
        {C.context}
      </CaseSection>
      <CaseSection id="problem" title="Problem">
        {C.problem}
      </CaseSection>
      <CaseSection id="approach" title="Approach" wide>
        <ConversationSteps {...C.conversation}>
          <DiagramSlot id="ai-leasing-agent-diagram" sizes="(min-width: 960px) 55vw, 100vw" />
        </ConversationSteps>
      </CaseSection>
      <Results>{C.results}</Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

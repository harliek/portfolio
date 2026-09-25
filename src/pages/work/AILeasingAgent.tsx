import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v19; route /work/valiance): the introduction and
 * three passages on the left (responsibilities, testing, rollout, with the
 * 18 properties in a sentence); the illustrative conversation (labelled)
 * fixed on the right, moving to the part each passage is about.
 */
export default function AILeasingAgent() {
  return (
    <CasePage project={project} className="page-ai-leasing-agent">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.sections}
        stage={{ kind: 'zoom', image: 'valiance-messages', regions: C.regions }}
        caption={C.conversationLabel}
      />
    </CasePage>
  )
}

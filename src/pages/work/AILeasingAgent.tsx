import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v19; route /work/valiance): the introduction and
 * four sections on the left; the illustrative conversation (captioned as
 * illustrative) fixed on the right, crossfading to the part each section is
 * about; the implementation note after the sections.
 */
export default function AILeasingAgent() {
  return (
    <CasePage project={project} className="page-ai-leasing-agent">
      <CaseStory
        project={project}
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.sections}
        stage={{ kind: 'crops', image: 'valiance-messages', regions: C.regions }}
      />
    </CasePage>
  )
}

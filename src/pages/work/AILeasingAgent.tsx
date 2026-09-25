import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v19; route /work/valiance): the introduction and
 * four sections on the left; Harlie's three images in the laptop on the
 * right (the listing with the assistant, the inbox, the dashboard),
 * crossfading as the sections change.
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
        stage={{
          kind: 'layers',
          // The laptop screen's own shape: each picture shows whole, centred on a light screen that matches them.
          aspect: 971 / 578,
          screen: '#f5f7fa',
          layers: [{ image: 'valiance-listing' }, { image: 'valiance-dashboard' }, { image: 'valiance-inbox' }],
          // Inquiry scope and live data: the listing's assistant; staff escalation: the inbox; testing and deployment: the dashboard.
          show: [0, 0, 2, 1],
        }}
      />
    </CasePage>
  )
}

import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v19; route /work/valiance): the introduction and four sections on the left (Harlie's text of
 * 2026-09-30); Harlie's three images on the right as a card-hover gallery (the listing with the assistant, the inbox,
 * the dashboard), the current section's picture large (the inbox for the two middle sections).
 */
export default function AILeasingAgent() {
  return (
    <CasePage project={project} className="page-ai-leasing-agent">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.sections}
        stage={{
          kind: 'layers',
          // The pictures' own shape (the listing and the dashboard are 4:3; the inbox, a little wider, shows whole with
          // a thin light band above and below that matches it).
          aspect: 4 / 3,
          screen: '#f5f7fa',
          // Harlie's order: the listing first (current property information: its assistant quoting live availability and
          // price), then the inbox (scope and escalation: conversations needing a person), then the dashboard (testing
          // and rollout across 18 properties). The sections follow the same order, so the larger view's Previous and
          // Next follow them too. No caption (Harlie's request).
          layers: [{ image: 'valiance-listing' }, { image: 'valiance-inbox' }, { image: 'valiance-dashboard' }],
          // Four sections (2026-09-30): the listing, the inbox for the automation boundary and the assistant's design, the
          // dashboard for the testing and adoption.
          show: [0, 1, 1, 2],
          // The imagery is synthetic (invented figures); no label beside the pictures or in the meta line says so
          // (Harlie's requests, 2026-09-28 and 2026-09-29).
        }}
      />
    </CasePage>
  )
}

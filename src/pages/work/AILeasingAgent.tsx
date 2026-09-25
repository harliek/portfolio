import { CasePage } from '../../components/case/CasePage'
import { CaseSection, CaseSplit } from '../../components/case/CaseSplit'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v18; route /work/valiance): the introduction
 * beside the illustrative conversation (labelled), then responsibilities,
 * testing, and rollout, with the 18 properties in a sentence.
 */
export default function AILeasingAgent() {
  return (
    <CasePage project={project} className="page-ai-leasing-agent">
      <CaseSplit
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        media={
          <figure className="cx-figure">
            <div className="cx-frame">
              <ResponsiveImage image="valiance-messages" sizes="(min-width: 1408px) 640px, (min-width: 900px) 48vw, calc(100vw - 48px)" priority />
            </div>
            <figcaption className="cx-caption">{C.conversationLabel}</figcaption>
          </figure>
        }
      >
        {C.sections.map((s) => (
          <CaseSection key={s.title} title={s.title}>
            {s.text}
          </CaseSection>
        ))}
      </CaseSplit>
    </CasePage>
  )
}

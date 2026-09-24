import '../../styles/pages/jumpstart-finance.css'
import { CaseLayout, CaseOpening, CaseSection } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { StickyVisual } from '../../components/case/StickyVisual'
import { DiagramSlot } from '../../components/media/DiagramSlot'
import { BusinessModel } from '../../components/pages/jumpstart-finance/BusinessModel'
import { PhonesHero } from '../../components/pages/jumpstart-finance/PhonesHero'
import { JUMPSTART_FINANCE as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Jumpstart Finance (route /work/jumpstart). The opening overview is the only
 * place the three phones appear together; the Approach section shows one
 * phone at a time (Lessons, Progress, Community). Green is the local accent.
 */
export default function JumpstartFinance() {
  return (
    <CaseLayout project={project} className="page-jumpstart-finance">
      <CaseOpening
        project={project}
        subtitle={C.subtitle}
        description={C.description}
        summary={C.summary}
        hero={<PhonesHero caption={C.heroCaption} />}
      />
      <CaseSection id="context" title="Context and role">
        {C.context}
      </CaseSection>
      <CaseSection id="problem" title="Problem">
        {C.problem}
      </CaseSection>
      <CaseSection id="approach" title="Approach" wide>
        <StickyVisual steps={C.steps} ratio="628 / 1232" sizes="(min-width: 960px) 320px, 260px">
          <DiagramSlot id="jumpstart-finance-diagram" sizes="(min-width: 960px) 55vw, 100vw" />
        </StickyVisual>
      </CaseSection>
      <Results figure={{ image: 'jumpstart-traction', caption: C.resultsFigureCaption }}>{C.results}</Results>
      <BusinessModel {...C.businessModel} />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

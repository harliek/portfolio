import '../../styles/pages/cafepress-uk.css'
import { CaseLayout, CaseOpening, CaseSection } from '../../components/case/CaseLayout'
import { NextProject, RelatedProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { StickyVisual } from '../../components/case/StickyVisual'
import { StorefrontHero } from '../../components/pages/cafepress-uk/StorefrontHero'
import { CAFEPRESS_UK as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/** CafePress UK (also served at the legacy /work/planetart). */
export default function CafePressUK() {
  return (
    <CaseLayout project={project} className="page-cafepress-uk">
      <CaseOpening project={project} description={C.description} summary={C.summary} hero={<StorefrontHero caption={C.heroCaption} />} />
      <CaseSection id="context" title="Context and role">
        {C.context}
      </CaseSection>
      <CaseSection id="problem" title="Problem">
        {C.problem}
      </CaseSection>
      <CaseSection id="approach" title="Approach" wide>
        <StickyVisual steps={C.steps} ratio="1672 / 941" sizes={C.stepSizes} className="cp-steps" />
      </CaseSection>
      <Results figure={{ image: 'planetart-assortment', caption: C.resultsFigureCaption }}>
        {C.results}
        <RelatedProject id="merchandising-platform">{C.related}</RelatedProject>
      </Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

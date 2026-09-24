import '../../styles/pages/cafepress-uk.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { CAFEPRESS_UK as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * The storefront screenshot and the presentation slides are 16:9, so every
 * crop shares that ratio; the transparent monitor (4:3) sits inside the same
 * frame without a backing panel.
 */
const FRAME_RATIO = '16 / 9'

/** CafePress UK (also served at the legacy /work/planetart). */
export default function CafePressUK() {
  return (
    <CaseLayout project={project} className="page-cafepress-uk">
      <CaseScroll project={project} situation={C.situation} opening={C.opening} sections={C.sections} frameRatio={FRAME_RATIO} />
      <Results figure={C.resultsFigure}>{C.results}</Results>
      <NextProject current={project.id} description={C.next} />
    </CaseLayout>
  )
}

import '../../styles/pages/cafepress-uk.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { CAFEPRESS_UK as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/** CafePress UK (also served at the legacy /work/planetart): the storefront and focused crops beside the story (CaseScroll states media). */
export default function CafePressUK() {
  return (
    <CaseLayout project={project} className="page-cafepress-uk">
      <CaseScroll project={project} meta={C.meta} summary={C.summary} media={C.media} sections={C.sections} outcome={C.outcome} />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v19): the research question and three findings on the
 * left (localization, assortment, operations); the storefront prototype fixed
 * on the right, moving to the part of the page each finding is about.
 * Recommendations are kept distinct from what was launched (nothing was).
 */
export default function CafePressUK() {
  return (
    <CasePage project={project} className="page-cafepress-uk">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        status={C.status}
        steps={C.findings}
        stage={{ kind: 'zoom', image: 'cp-storefront', regions: C.regions }}
        caption={C.caption}
      />
    </CasePage>
  )
}

import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v19): the research question and three findings on the
 * left (localization, assortment, operations); a stable stage on the right
 * (the storefront prototype, whole), no pan or zoom.
 * Recommendations are kept distinct from what was launched (nothing was).
 */
export default function CafePressUK() {
  return (
    <CasePage project={project} className="page-cafepress-uk">
      <CaseStory
        project={project}
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.findings}
        stage={{ kind: 'layers', aspect: 1672 / 941, layers: [{ image: 'cp-storefront' }, { image: 'cp-drinkware' }, { image: 'cp-assistant' }], show: [0, 1, 2] }}
      />
    </CasePage>
  )
}

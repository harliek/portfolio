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
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.findings}
        stage={{
          kind: 'layers',
          // The pictures' own shape, on a white screen like the pages: each shows whole.
          aspect: 1672 / 941,
          screen: '#ffffff',
          // Harlie's storefront prototype pictures, as the page had them before (PlanetArt/cafepress uk): the CafePress
          // homepage first, then the drinkware page, then the page with the assistant panel. No captions (Harlie's request).
          layers: [{ image: 'cp-storefront' }, { image: 'cp-drinkware' }, { image: 'cp-assistant' }],
          show: [0, 1, 2],
          // Harlie's brief, 2026-09-28: the storefront pictures carry the real CafePress brand and could be taken for
          // the live UK site; nothing was launched. "Concept UI", not "Prototype": all three are generated images of
          // the storefront concept (two made on 2026-09-25, after the internship), not a working build.
          status: 'Concept UI',
        }}
      />
    </CasePage>
  )
}

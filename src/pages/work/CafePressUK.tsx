import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v19): the introduction and four sections on the right
 * (market challenge, market analysis, launch strategy, recommendation;
 * Harlie's text of 2026-09-30); on the left the storefront concept's three
 * pages in a card-hover gallery, each whole, no pan or zoom. The sides are
 * swapped because the project's order is odd (caseSide.ts; Harlie's request,
 * 2026-09-30: every other told page has its words on the right).
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
          // Harlie's storefront pictures, as the page had them before (PlanetArt/cafepress uk): the CafePress homepage
          // concept first, then the drinkware page, then the page with the assistant panel, in a card-hover gallery
          // (CaseStory). No captions or labels on the pictures (Harlie's request, 2026-09-28: "there should be no
          // captions for any photos"), and no provenance label in the meta line either (Harlie's request,
          // 2026-09-29). Provenance for Harlie's records: the homepage is the internship's concept
          // (deck p.8); the other two were made on 2026-09-25, after the internship; the assistant was never built.
          layers: [
            { image: 'cp-storefront' },
            { image: 'cp-drinkware' },
            { image: 'cp-assistant' },
          ],
          // Four sections (2026-09-30): the storefront concept (market challenge), the drinkware page (market analysis), the
          // assistant page (launch strategy), then the concept again for the recommendation.
          show: [0, 1, 2, 0],
          // Harlie's brief, 2026-09-28: the storefront pictures carry the real CafePress brand and could be taken for
          // the live UK site; nothing was launched.
        }}
      />
    </CasePage>
  )
}

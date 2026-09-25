import { CasePage } from '../../components/case/CasePage'
import { CaseSection, CaseSplit } from '../../components/case/CaseSplit'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v18): the research question and the storefront
 * prototype side by side, then three short findings (localization,
 * assortment, operations). Recommendations are kept distinct from what was
 * launched (nothing was).
 */
export default function CafePressUK() {
  return (
    <CasePage project={project} className="page-cafepress-uk">
      <CaseSplit
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        status={C.status}
        media={
          <figure className="cx-figure">
            <div className="cx-frame">
              <ResponsiveImage image="cp-storefront" sizes="(min-width: 1408px) 640px, (min-width: 900px) 48vw, calc(100vw - 48px)" priority />
            </div>
            <figcaption className="cx-caption">The storefront prototype, coded from the research.</figcaption>
          </figure>
        }
      >
        {C.findings.map((f) => (
          <CaseSection key={f.title} title={f.title}>
            {f.text}
          </CaseSection>
        ))}
      </CaseSplit>
    </CasePage>
  )
}

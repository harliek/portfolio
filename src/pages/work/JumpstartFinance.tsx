import '../../styles/pages/jumpstart-finance.css'
import { CasePage } from '../../components/case/CasePage'
import { CaseSection, CaseSplit } from '../../components/case/CaseSplit'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { JUMPSTART as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Jumpstart Finance (brief v18): the introduction beside the three original
 * prototype screens, always visible in one stable composition (the middle
 * one a step forward; a slight lift on hover, nothing pinned), then a short
 * line for each screen and the qualified result.
 */
export default function JumpstartFinance() {
  return (
    <CasePage project={project} className="page-jumpstart-finance">
      <CaseSplit
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        media={
          <figure className="jf-trio cx-figure">
            <div className="jf-trio__row">
              {C.phones.map((p) => (
                <div key={p.image} className="jf-phone">
                  <ResponsiveImage image={p.image} sizes="(min-width: 1100px) 200px, 30vw" alt={`${p.name} screen`} />
                </div>
              ))}
            </div>
            <figcaption className="cx-caption">{C.label}</figcaption>
          </figure>
        }
      >
        {C.features.map((f) => (
          <CaseSection key={f.title} title={f.title}>
            {f.text}
          </CaseSection>
        ))}
        <p className="cs__note">{C.result}</p>
      </CaseSplit>
    </CasePage>
  )
}

import '../../styles/pages/merchandising-platform.css'
import { CaseLayout, CaseOpening, CaseSection } from '../../components/case/CaseLayout'
import { NextProject, RelatedProject } from '../../components/case/NextProject'
import { StickyVisual } from '../../components/case/StickyVisual'
import { DiagramSlot } from '../../components/media/DiagramSlot'
import { ConsoleHero } from '../../components/pages/merchandising-platform/ConsoleHero'
import { EvidenceCrop } from '../../components/pages/merchandising-platform/EvidenceCrop'
import { MERCHANDISING_PLATFORM as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/** The crop is shown at about its natural size (554px of the 1600px derivative), so its text stays readable. */
const CROP_SIZES = '(min-width: 960px) 1600px, calc((100vw - 40px) * 2.9)'

/**
 * Merchandising Platform (brief Page 2), on the shared case layout.
 * Approach is the one sticky section: one application frame on the right
 * with three real states from the recording (catalog, product and inventory
 * detail, the Ask review screen), a highlighted region per paragraph, and
 * Watch demo directly beneath the frame, which plays the recording in the
 * same frame with native controls.
 */
export default function MerchandisingPlatform() {
  return (
    <CaseLayout project={project} className="page-merchandising-platform">
      <CaseOpening
        project={project}
        subtitle={C.subtitle}
        description={C.description}
        note={C.note}
        summary={C.summary}
        hero={<ConsoleHero caption={C.heroCaption} />}
      />
      <CaseSection id="context" title="Context and role">
        {C.context}
      </CaseSection>
      <CaseSection id="problem" title="Problem">
        {C.problem}
      </CaseSection>
      <CaseSection id="approach" title="Approach" wide>
        <StickyVisual steps={C.steps} ratio="2940 / 1486" demo={{ video: 'merch-console', poster: 'merch-vendors' }}>
          <DiagramSlot id="merchandising-platform-diagram" sizes="(min-width: 960px) 55vw, 100vw" />
        </StickyVisual>
      </CaseSection>
      {/* Same markup and classes as the shared Results, with a readable crop as the evidence image. */}
      <section id="results" className="case-shell case-section case-results" aria-labelledby="results-title">
        <div className="case-section__text reading-scrim">
          <h2 id="results-title" className="case-heading">
            Results
          </h2>
          <div className="case-prose">{C.results}</div>
        </div>
        <div className="case-section__aside mp-results__aside">
          <EvidenceCrop {...C.resultsCrop} sizes={CROP_SIZES} />
        </div>
        {/* After the evidence on phones; under the text column on desktop. */}
        <div className="mp-results__related">
          <RelatedProject id="cafepress-uk">{C.related}</RelatedProject>
        </div>
      </section>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

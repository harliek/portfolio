import { useRef } from 'react'
import '../../styles/pages/planetart.css'
import { BoundaryNote } from '../../components/case-study/BoundaryNote'
import { CaseHeader } from '../../components/case-study/CaseHeader'
import { CaseSection, Prose } from '../../components/case-study/CaseSection'
import { NextProject } from '../../components/case-study/NextProject'
import { PlanetArtWorkflow } from '../../components/diagrams/PlanetArtWorkflow'
import { CaptionText, Figure, ZoomableImage } from '../../components/media/Figure'
import { VideoFigure } from '../../components/media/VideoFigure'
import { getImage, type ImageId } from '../../content/media'
import { projectById } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReveal } from '../../hooks/useReveal'

const project = projectById('planetart')

/*
 * Literal `sizes` values for each composition (shell gutters: 20/32/40/64px;
 * case media max 1120px; grid gaps 24px on wide screens).
 */
const SIZES = {
  full: '(min-width: 1248px) 1120px, (min-width: 1200px) calc(100vw - 128px), (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)',
  half: '(min-width: 1248px) 548px, (min-width: 1200px) calc(50vw - 76px), (min-width: 900px) calc(50vw - 52px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)',
  third: '(min-width: 1248px) 358px, (min-width: 1200px) calc(33.3vw - 59px), (min-width: 900px) calc(33.3vw - 43px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)',
  split: '(min-width: 1248px) 731px, (min-width: 1200px) calc(66.7vw - 101px), (min-width: 900px) calc(66.7vw - 69px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)',
  concept: '(min-width: 900px) 560px, (min-width: 700px) 620px, (min-width: 600px) calc(100vw - 80px), calc(100vw - 56px)',
}

const DECISIONS = [
  ['Use the existing foundation', 'Adapt the existing US approach rather than define an unrelated storefront.'],
  ['Localize the details', 'Account for UK language, GBP pricing, and relevant assortment choices.'],
  ['Check operational readiness', 'Connect the proposed offer to available vendors and product information.'],
] as const

const CONCEPT: ImageId[] = ['planetart-concept-dashboard', 'planetart-concept-workflow']

const STILLS: ImageId[] = ['merch-catalog', 'merch-vendors', 'merch-drawer']

export default function PlanetArt() {
  usePageMeta(project.seo.title, project.seo.description)
  const articleRef = useRef<HTMLElement>(null)
  useReveal(articleRef)

  return (
    <article ref={articleRef} className="case-study cs-planetart">
      <CaseHeader
        project={project}
        eyebrow={project.org}
        title={project.title}
        summary={project.caseSummary}
        meta={[
          { term: 'Role', detail: project.role },
          { term: 'When', detail: project.dateRange },
          { term: 'Context', detail: 'B2B e-commerce' },
          { term: 'Status', detail: project.status },
        ]}
        ownership={project.ownership}
        hero={project.hero}
        heroCaption="CafePress UK website prototype created during the internship."
        chapters={[
          ['UK research', 'uk-research'],
          ['Merchandising workflow', 'merchandising-workflow'],
          ['Independent rebuild', 'independent-rebuild'],
          ['Outcome', 'outcome'],
        ]}
      />

      <div className="shell case-body">
        {/* 1 · UK research */}
        <CaseSection id="uk-research" heading="Preparing a UK B2B offer" className="pa-research">
          <Prose>
            <p>
              I researched competitors, suppliers, product categories, and the changes needed to adapt CafePress’s
              existing offer for a UK audience. The work connected market research with practical merchandising and
              website decisions.
            </p>
          </Prose>
          <figure className="figure-group pa-research__pair" data-reveal="">
            <div className="figure-group__items figure-group__items--2">
              <div className="media-frame">
                <ZoomableImage image="planetart-competitors" sizes={SIZES.half} />
              </div>
              <div className="media-frame">
                <ZoomableImage image="planetart-assortment" sizes={SIZES.half} />
              </div>
            </div>
            <figcaption className="figure__caption">
              <CaptionText provenance="original-artifact">
                Research from the internship presentation, covering the competitive landscape and potential UK
                suppliers.
              </CaptionText>
            </figcaption>
          </figure>
          <ul className="editorial-rows editorial-rows--split pa-decisions">
            {DECISIONS.map(([title, text]) => (
              <li key={title}>
                <p className="editorial-rows__title">{title}</p>
                <p className="editorial-rows__text">{text}</p>
              </li>
            ))}
          </ul>
        </CaseSection>

        {/* 2 · Storefront prototype (copy ≈4 columns, screenshot ≈8 on wide screens) */}
        <section id="storefront" className="case-section pa-storefront" aria-labelledby="storefront-heading" data-reveal="">
          <div className="case-split">
            <div className="case-split__copy">
              <h2 id="storefront-heading" className="t-section case-section__heading">
                Turning research into a storefront
              </h2>
              <Prose>
                <p>
                  I translated the research into a UK website prototype. The prototype made the recommendations concrete
                  enough to review: how the offer was presented, how categories were organized, and which details needed
                  localization.
                </p>
              </Prose>
            </div>
            <Figure
              image="planetart-uk"
              sizes={SIZES.split}
              zoom
              caption="Prototype view. This shows a proposed experience, not evidence of a completed UK launch."
            />
          </div>
        </section>

        {/* 3 · Merchandising workflow */}
        <CaseSection id="merchandising-workflow" heading="Product information was spread across tools" className="pa-workflow">
          <Prose>
            <p>
              The internship also exposed a workflow problem: product, vendor, inventory, and promotional information was
              spread across spreadsheets and other tools. Repeated lookups and disconnected information made it harder
              to see the full merchandising picture.
            </p>
          </Prose>
          <PlanetArtWorkflow />
        </CaseSection>

        {/* 4 · Original concept (padded frame keeps it distinct from the later recording) */}
        <CaseSection id="concept" heading="An early centralized-platform concept" className="pa-concept-section">
          <Prose>
            <p>
              I developed an early prototype to bring these information needs into one place and make the idea easier to
              discuss with engineering. The concept focused on a shared merchandising view and possible support for
              alerts and recommendations.
            </p>
          </Prose>
          <figure className="figure pa-concept">
            <div className="media-frame media-frame--padded">
              <div className="pa-concept__items">
                {CONCEPT.map((id) => {
                  const asset = getImage(id)
                  return (
                    <div key={id} className="pa-concept__item" style={{ flexGrow: asset.width / asset.height }}>
                      <ZoomableImage image={id} sizes={SIZES.concept} />
                    </div>
                  )
                })}
              </div>
            </div>
            <figcaption className="figure__caption">
              <CaptionText provenance="original-artifact">
                Original concept from the internship presentation. Proposed capabilities are not evidence of production
                deployment.
              </CaptionText>
            </figcaption>
          </figure>
        </CaseSection>

        {/* 5 · Later, independent rebuild with synthetic data */}
        <CaseSection
          id="independent-rebuild"
          label="Later independent work"
          heading="Revisiting the concept with synthetic data"
          className="pa-rebuild"
        >
          <Prose>
            <p>
              After the internship, I revisited the workflow as an independent Merch Console prototype. The recording
              shows a catalog, vendor information, promotion views, and an assistant-style interface in a synthetic demo
              environment.
            </p>
          </Prose>
          <div className="pa-rebuild__media">
            <BoundaryNote tone="strong">
              Independent reconstruction. Synthetic data. Not PlanetArt’s internal production system.
            </BoundaryNote>
            <VideoFigure
              video="merch-console"
              sizes={SIZES.full}
              caption="Recorded walkthrough of the independent Merch Console prototype."
            />
            <div className="figure-group__items figure-group__items--3 pa-stills">
              {STILLS.map((id) => (
                <Figure key={id} image={id} sizes={SIZES.third} zoom />
              ))}
            </div>
          </div>
        </CaseSection>

        {/* Ending */}
        <CaseSection id="outcome" heading="What the work produced" className="case-ending pa-ending">
          <Prose>
            <p>
              The internship produced UK research and recommendations, a storefront prototype, and an early
              merchandising-platform concept. The later rebuild made the workflow idea more tangible, but it does not
              establish a production rollout or measured business impact.
            </p>
            <p className="pa-ending__decision">
              The main product decision was to connect market recommendations to the information and workflows needed to
              support them.
            </p>
          </Prose>
        </CaseSection>
      </div>

      <NextProject current={project.id} />
    </article>
  )
}

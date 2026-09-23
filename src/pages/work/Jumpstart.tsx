import { useRef, type CSSProperties } from 'react'
import '../../styles/pages/jumpstart.css'
import { CaseHeader } from '../../components/case-study/CaseHeader'
import { CaseSection, Prose } from '../../components/case-study/CaseSection'
import { NextProject } from '../../components/case-study/NextProject'
import { CaptionText, Figure, ZoomableImage } from '../../components/media/Figure'
import { getImage, type ImageId } from '../../content/media'
import { projectById } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReveal } from '../../hooks/useReveal'

const project = projectById('jumpstart')

const CHAPTERS: Array<[string, string]> = [
  ['Positioning', 'positioning'],
  ['Prototype', 'prototype'],
  ['Business model', 'business-model'],
  ['Early interest', 'early-interest'],
]

/**
 * The four prototype screens in reading order. The first two lead the wide
 * composition; the other two support it at a smaller size. Captions come
 * from the media manifest so the enlargement dialog shows the same text.
 */
const PHONES: Array<{ id: ImageId; lead: boolean }> = [
  { id: 'jumpstart-proto-1', lead: true },
  { id: 'jumpstart-proto-2', lead: true },
  { id: 'jumpstart-proto-3', lead: false },
  { id: 'jumpstart-proto-4', lead: false },
]

/** Lead screens are drawn this much taller than supporting ones (wide layout). */
const LEAD_SCALE = 1.4

const aspect = (id: ImageId) => {
  const a = getImage(id)
  return a.width / a.height
}
const WIDEST = Math.max(...PHONES.map((p) => aspect(p.id)))

/**
 * Wide layout: each column is proportional to its screen's aspect ratio, so
 * every screen in a size class renders at exactly the same height and all
 * four share one baseline.
 */
const PHONE_COLUMNS = PHONES.map((p) => `minmax(0, ${((p.lead ? LEAD_SCALE : 1) * aspect(p.id)).toFixed(4)}fr)`).join(' ')

const SIZES = {
  competitors: '(min-width: 1248px) 700px, (min-width: 900px) 60vw, (min-width: 600px) calc(100vw - 80px), calc(100vw - 56px)',
  businessModel: '(min-width: 1000px) 864px, (min-width: 600px) calc(100vw - 80px), calc(100vw - 56px)',
  phoneLead: '(min-width: 1248px) 280px, (min-width: 900px) 23vw, (min-width: 600px) 248px, 256px',
  phoneSupport: '(min-width: 1248px) 200px, (min-width: 900px) 16vw, (min-width: 600px) 248px, 256px',
}

export default function Jumpstart() {
  usePageMeta(project.seo.title, project.seo.description)
  const articleRef = useRef<HTMLElement>(null)
  useReveal(articleRef)

  return (
    <article ref={articleRef} className="case-study cs-jumpstart">
      <CaseHeader
        project={project}
        eyebrow={project.org}
        title={project.title}
        summary={project.caseSummary}
        meta={[
          { term: 'Role', detail: project.role },
          { term: 'When', detail: project.dateRange },
          { term: 'Program', detail: 'European Innovation Academy, Porto' },
          { term: 'Status', detail: project.status },
        ]}
        hero={project.hero}
        chapters={CHAPTERS}
      />

      <div className="shell case-body">
        <CaseSection id="positioning" heading="Define the offer before adding features">
          <Prose>
            <p>
              Jumpstart explored a mobile approach to financial education. I worked with the team on the product concept, positioning, prototype, and
              business model during the European Innovation Academy program.
            </p>
          </Prose>
          <div className="media-block js-positioning">
            <Figure image="jumpstart-competitors" sizes={SIZES.competitors} zoom framed className="js-positioning__figure" />
            <Prose className="js-positioning__note">
              <p>The comparison helped frame a product combining structured learning, visible progression, and a community component.</p>
            </Prose>
          </div>
        </CaseSection>

        <CaseSection id="prototype" heading="Make progress visible">
          <Prose>
            <p>
              The prototype organized financial learning into a visible path, with short lessons and a community space alongside individual progress.
            </p>
          </Prose>
          <div className="media-block js-phones" data-reveal="stagger" style={{ '--phone-cols': PHONE_COLUMNS } as CSSProperties}>
            {PHONES.map(({ id, lead }) => {
              const asset = getImage(id)
              return (
                <figure
                  key={id}
                  className={lead ? 'js-phone js-phone--lead' : 'js-phone'}
                  style={{ '--rel': (aspect(id) / WIDEST).toFixed(4) } as CSSProperties}
                >
                  <div className="media-frame media-frame--bare js-phone__media">
                    <ZoomableImage image={id} sizes={lead ? SIZES.phoneLead : SIZES.phoneSupport} />
                  </div>
                  <figcaption className="figure__caption js-phone__caption">
                    <CaptionText provenance={asset.provenance}>{asset.caption}</CaptionText>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </CaseSection>

        <CaseSection id="business-model" heading="Explore how the product could be supported">
          <Prose>
            <p>
              The pitch proposed free access alongside paid options. This was a business-model exercise: the pricing and tiers were assumptions to
              test, not evidence of paying customers or revenue.
            </p>
          </Prose>
          <Figure image="jumpstart-business-model" sizes={SIZES.businessModel} zoom framed className="media-block media-block--narrow" />
        </CaseSection>

        <CaseSection id="early-interest" heading="An early signal of interest">
          <figure className="js-signal">
            <p className="js-signal__value t-display">150 sign-ups in 24 hours</p>
            <figcaption className="js-signal__source t-body">Reported in the program pitch.</figcaption>
          </figure>
          <Prose className="js-signal__copy">
            <p>That response was an early interest signal for the concept. It did not establish retention, revenue, or product-market fit.</p>
          </Prose>
        </CaseSection>

        <CaseSection id="reflection" heading="A complete venture exercise" className="case-ending">
          <Prose>
            <p>
              The project brought together positioning, a product prototype, a proposed business model, and an initial demand signal. My role was to
              help turn those parts into a coherent product direction with the team.
            </p>
          </Prose>
        </CaseSection>
      </div>

      <NextProject current={project.id} />
    </article>
  )
}

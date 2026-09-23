import { useRef } from 'react'
import { CaseHeader } from '../../components/case-study/CaseHeader'
import { CaseSection, Prose } from '../../components/case-study/CaseSection'
import { NextProject } from '../../components/case-study/NextProject'
import { CaptionText, ZoomableImage } from '../../components/media/Figure'
import { VideoFigure } from '../../components/media/VideoFigure'
import type { ImageId } from '../../content/media'
import { projectById } from '../../content/projects'
import { TRANSCRIPTS } from '../../content/transcripts'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReveal } from '../../hooks/useReveal'
import '../../styles/pages/shift.css'

const project = projectById('shift')

/*
 * `sizes` values are literal (no CSS variables). They follow the layout in
 * styles/pages/shift.css: 16:9 films use the full media width; the 4:3 film
 * and its stills share a column capped at 960px.
 */
const SIZES_FILM_WIDE =
  '(min-width: 1248px) 1120px, (min-width: 1200px) calc(100vw - 128px), (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)'
const SIZES_FILM_4X3 = '(min-width: 1040px) 960px, (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)'
const SIZES_STILL_LEAD =
  '(min-width: 1040px) 304px, (min-width: 900px) calc((100vw - 128px) / 3), (min-width: 600px) calc((100vw - 96px) / 3), calc(100vw - 40px)'
const SIZES_STILL =
  '(min-width: 1040px) 304px, (min-width: 900px) calc((100vw - 128px) / 3), (min-width: 600px) calc((100vw - 96px) / 3), calc((100vw - 52px) / 2)'

/** Supplied campaign photographs, in the order they appear (and page through in the dialog). */
const STILLS: ImageId[] = ['aristocracy-photo-234', 'aristocracy-photo-103', 'aristocracy-photo-077']

const CHAPTERS: Array<[string, string]> = [
  ['Aristocracy', 'aristocracy'],
  ['Nickleby Capital', 'nickleby-capital'],
  ['The Night Club / HECK', 'the-night-club'],
]

/**
 * Shift Content: one agency creative-production chapter with exactly three
 * films. Each film is one uninterrupted group (title, subheading, context,
 * player, caption). Films are user-initiated; nothing autoplays.
 */
export default function Shift() {
  usePageMeta(project.seo.title, project.seo.description)
  const articleRef = useRef<HTMLElement>(null)
  useReveal(articleRef)

  return (
    <article ref={articleRef} className="case-study cs-shift">
      <CaseHeader
        project={project}
        eyebrow={project.org}
        title={project.title}
        summary={project.caseSummary}
        meta={[
          { term: 'Role', detail: project.role },
          { term: 'When', detail: project.dateRange },
          { term: 'Location', detail: 'London' },
          { term: 'Context', detail: 'Agency production' },
        ]}
        ownership={project.ownership}
        hero={project.hero}
        heroCaption="Still from the Aristocracy campaign film."
        chapters={CHAPTERS}
      />

      <div className="shell case-body cs-shift__body">
        <CaseSection id="aristocracy" heading="Aristocracy" className="cs-shift__film cs-shift__film--4x3">
          <p className="t-sub cs-shift__subhead">Fashion campaign</p>
          <Prose>
            <p>A fashion campaign combining film and still imagery. I supported production through setup, lighting, coordination, and behind-the-scenes work.</p>
          </Prose>
          <VideoFigure video="aristocracy" sizes={SIZES_FILM_4X3} transcript={TRANSCRIPTS.aristocracy} className="media-block cs-shift__player" />
          <figure className="figure-group cs-shift__stills">
            <ul className="figure-group__items cs-shift__stills-list" data-reveal="stagger">
              {STILLS.map((id, i) => (
                <li key={id}>
                  <div className="media-frame">
                    <ZoomableImage image={id} sizes={i === 0 ? SIZES_STILL_LEAD : SIZES_STILL} />
                  </div>
                </li>
              ))}
            </ul>
            <figcaption className="figure__caption">
              <CaptionText provenance="agency-work">Selected campaign imagery from the supplied project materials.</CaptionText>
            </figcaption>
          </figure>
        </CaseSection>

        <CaseSection id="nickleby-capital" heading="Nickleby Capital" className="cs-shift__film">
          <p className="t-sub cs-shift__subhead">Interview-led client content</p>
          <Prose>
            <p>An interview-led project for an investment firm. My production support included equipment and lighting setup and interview B-roll.</p>
          </Prose>
          <VideoFigure video="nickleby" sizes={SIZES_FILM_WIDE} transcript={TRANSCRIPTS.nickleby} className="media-block cs-shift__player" />
        </CaseSection>

        <CaseSection id="the-night-club" heading="The Night Club / HECK" className="cs-shift__film">
          <p className="t-sub cs-shift__subhead">Event film</p>
          <Prose>
            <p>An event edit from the supplied Shift materials, with running, community, and HECK branding. I supported the agency’s production work around the event.</p>
          </Prose>
          <VideoFigure video="heck" sizes={SIZES_FILM_WIDE} transcript={TRANSCRIPTS.heck} className="media-block cs-shift__player" />
        </CaseSection>

        <div className="case-ending cs-shift__closing" data-reveal="">
          <CaseSection id="alongside-production" heading="Alongside production" reveal={false}>
            <Prose>
              <p>I also worked on pitch decks, Google Ads campaigns, and CSS changes to the agency’s Squarespace website.</p>
            </Prose>
          </CaseSection>
          <CaseSection id="work-made-with-a-team" heading="Work made with a team" reveal={false}>
            <Prose>
              <p>The films show the visual output of the agency projects. My role sat within the production and client-work process that helped those projects move forward.</p>
            </Prose>
          </CaseSection>
        </div>
      </div>

      <NextProject current={project.id} />
    </article>
  )
}

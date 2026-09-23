import '../../styles/pages/spreadsheet.css'
import { useRef, type ReactNode } from 'react'
import type { ImageId } from '../../content/media'
import { CaseHeader } from '../../components/case-study/CaseHeader'
import { CaseSection, Prose } from '../../components/case-study/CaseSection'
import { NextProject } from '../../components/case-study/NextProject'
import { Figure } from '../../components/media/Figure'
import { VideoFigure } from '../../components/media/VideoFigure'
import { projectById } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReveal } from '../../hooks/useReveal'

const project = projectById('spreadsheet-agent')

/** Full case-media width (max 1120px) at each breakpoint. */
const SIZES_FULL =
  '(min-width: 1248px) 1120px, (min-width: 1200px) calc(100vw - 128px), (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)'

/** A step still: 8 of 12 columns on wide screens, full width below 900px. */
const SIZES_STEP =
  '(min-width: 1248px) 731px, (min-width: 1200px) calc(66.67vw - 101px), (min-width: 900px) calc(66.67vw - 69px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)'

interface Step {
  title: string
  text: string
  image: ImageId
}

const STEPS: Step[] = [
  {
    title: 'Describe the task',
    text: 'Enter a request such as comparing vendor prices across products.',
    image: 'sheet-request',
  },
  {
    title: 'Review the sheet',
    text: 'Move from the request into a structured spreadsheet view.',
    image: 'sheet-returned',
  },
  {
    title: 'Continue working',
    text: 'Edit the sheet and return to the collection of sheets.',
    image: 'sheet-list',
  },
]

const DEMONSTRATED: Array<[key: string, content: ReactNode]> = [
  ['prompt', 'Prompt-entry interface'],
  [
    'sequence',
    <>
      A simulated <span className="nowrap">request-to-sheet</span> sequence
    </>,
  ],
  ['views', 'Spreadsheet views and visible edits'],
  ['navigation', 'Navigation between sheets'],
]

const NOT_DEMONSTRATED = [
  'A live LLM/API connection',
  'Reliable execution of arbitrary requests',
  'Live external data retrieval',
  'Production deployment',
]

const FUTURE_OUTLINE = ['Request', 'Model and tool layer', 'Validated sheet operations', 'Review']

export default function SpreadsheetAgent() {
  usePageMeta(project.seo.title, project.seo.description)
  const articleRef = useRef<HTMLElement>(null)
  useReveal(articleRef)

  return (
    <article ref={articleRef} className="case-study cs-spreadsheet">
      <CaseHeader
        project={project}
        eyebrow="Independent prototype"
        title="Spreadsheet Agent"
        summary="A prompt-to-spreadsheet interaction prototype for turning a request into an editable sheet."
        meta={[
          { term: 'Role', detail: 'Independent project' },
          { term: 'When', detail: '2026' },
          { term: 'Focus', detail: 'Interaction and workflow prototyping' },
          { term: 'Status', detail: 'Simulated AI responses' },
        ]}
        ownership="The demonstrated prototype did not have a live LLM/API connection."
        hero="cover-spreadsheet"
        heroCaption="A recorded prototype state using demo data."
      />

      <div className="shell case-body">
        <CaseSection id="walkthrough" heading="A request, an editable sheet">
          <Prose>
            <p>
              The prototype explores a simple workflow: start with a request, review the resulting spreadsheet, make
              changes, and return to the sheet list. The recording demonstrates that interaction sequence.
            </p>
          </Prose>
          <div className="media-block">
            <VideoFigure
              video="spreadsheet-agent"
              sizes={SIZES_FULL}
              caption="Recorded walkthrough. The AI response is simulated; this is not a demonstration of live model execution."
            />
          </div>
        </CaseSection>

        <CaseSection id="sequence" heading="What the recording shows">
          <ol className="sheet-steps" role="list">
            {STEPS.map((step, i) => (
              <li className="sheet-step" key={step.image}>
                <div className="sheet-step__copy">
                  <h3 className="sheet-step__title t-sub">
                    <span className="sheet-step__number tabular">{i + 1}.</span> {step.title}
                  </h3>
                  <p className="sheet-step__text">{step.text}</p>
                </div>
                <Figure image={step.image} sizes={SIZES_STEP} zoom className="sheet-step__figure" />
              </li>
            ))}
          </ol>
        </CaseSection>

        <CaseSection id="boundaries" heading="Prototype boundaries">
          <div className="sheet-scope">
            <div className="sheet-scope__column sheet-scope__column--shown">
              <h3 id="scope-shown" className="sheet-scope__heading t-sub">
                Demonstrated
              </h3>
              <ul className="sheet-scope__list" role="list" aria-labelledby="scope-shown">
                {DEMONSTRATED.map(([key, content]) => (
                  <li key={key}>{content}</li>
                ))}
              </ul>
            </div>
            <div className="sheet-scope__column sheet-scope__column--not-shown">
              <h3 id="scope-not-shown" className="sheet-scope__heading t-sub">
                Not demonstrated
              </h3>
              <ul className="sheet-scope__list" role="list" aria-labelledby="scope-not-shown">
                {NOT_DEMONSTRATED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CaseSection>

        <CaseSection id="live-version" heading="What a live version would need">
          <Prose>
            <p>
              A live version would need a defined model and tool interface, validated spreadsheet operations, clear
              handling of uncertain or failed requests, and controls for data access. Those are implementation
              requirements for future work, not capabilities established by this recording.
            </p>
          </Prose>
          <figure className="sheet-outline">
            <p id="sheet-outline-title" className="sheet-outline__title t-label">
              Future implementation outline
            </p>
            <ol className="sheet-outline__flow" role="list" aria-labelledby="sheet-outline-title">
              {FUTURE_OUTLINE.map((node, i) => (
                <li className="sheet-outline__node" key={node}>
                  {node}
                  {i < FUTURE_OUTLINE.length - 1 && (
                    <svg className="sheet-outline__arrow" viewBox="0 0 24 12" width="24" height="12" aria-hidden="true" focusable="false">
                      <path d="M1 6h21M17 1.5 22 6l-5 4.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
            <figcaption className="figure__caption">
              Proposed outline for future work; not part of the recorded prototype.
            </figcaption>
          </figure>
        </CaseSection>

        <CaseSection id="outcome" heading="An interaction prototype with a clear boundary" className="case-ending">
          <Prose>
            <p>
              The result is a concrete interface demonstration of a spreadsheet workflow. Its value here is the product
              interaction and the clarity of what was simulated.
            </p>
          </Prose>
        </CaseSection>
      </div>

      <NextProject current={project.id} />
    </article>
  )
}

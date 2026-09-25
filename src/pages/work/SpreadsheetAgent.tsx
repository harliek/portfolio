import '../../styles/pages/spreadsheet-agent.css'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ChapterDemo, type Chapter } from '../../components/case/ChapterDemo'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

const STAGE_SIZES = '(min-width: 1408px) 1280px, calc(100vw - 48px)'

/** Stage 4: the selected cell on the left, its source detail enlarged on the right, a thin connector between. */
function Trace() {
  return (
    <div className="sa-trace">
      <figure className="sa-trace__cell cx-frame">
        <ResponsiveImage image="sa-trace-cell" sizes="(min-width: 1100px) 460px, 40vw" />
      </figure>
      <span className="sa-trace__link" aria-hidden="true" />
      <figure className="sa-trace__detail cx-frame">
        <ResponsiveImage image="sa-trace-detail" sizes="(min-width: 1100px) 680px, 56vw" />
      </figure>
    </div>
  )
}

const chapters: Chapter[] = C.demo.stages.map((s) => ({
  label: s.label,
  caption: s.caption,
  visual:
    'image' in s && s.image ? (
      <div className="cx-frame">
        <ResponsiveImage image={s.image} sizes={STAGE_SIZES} />
      </div>
    ) : (
      <Trace />
    ),
}))

/**
 * Spreadsheet Agent (brief v17): built around review and traceability. The
 * hero with its scope; the problem in two compact columns; the four-stage
 * demonstration (the persistent request, the scope line and its one
 * sentence, four tabs, one picture, one stable caption, Play walkthrough),
 * where every stage answers the same verified request; the design decisions
 * with their tradeoff; and what the prototype demonstrates beside its
 * limitations, with the dataset size as supporting metadata only.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <header className="sa-hero cx-wrap">
        <div data-hero-reveal>
          <CaseTitle title={C.title} meta={C.meta} />
        </div>
        <div className="sa-hero__lede" data-hero-reveal>
          <div className="cx-lede">{C.summary}</div>
        </div>
        <figure className="sa-hero__media cx-frame" data-hero-media>
          <ResponsiveImage image={C.hero} sizes={STAGE_SIZES} priority />
        </figure>
      </header>

      <section className="sa-problem cx-wrap cx-section" aria-labelledby="sa-problem-title">
        <div className="cx-grid">
          <h2 className="cx-h2 sa-problem__heading" id="sa-problem-title">
            {C.problem.heading}
          </h2>
          <p className="cx-body sa-problem__body">{C.problem.body}</p>
        </div>
      </section>

      <section className="sa-demo cx-wrap cx-section" aria-labelledby="sa-demo-title">
        <h2 className="visually-hidden" id="sa-demo-title">
          The prototype, in four stages
        </h2>
        <ChapterDemo
          label="The Spreadsheet Agent prototype in four stages"
          chapters={chapters}
          hold={4}
          head={
            <div className="sa-demo__head">
              <blockquote className="sa-request">
                <p>“{C.demo.request}”</p>
              </blockquote>
              <div className="chapters__scope">
                <p className="sa-scope">{C.demo.scope}</p>
                <p className="sa-scope__note">{C.demo.scopeNote}</p>
              </div>
            </div>
          }
        />
      </section>

      <section className="sa-decisions cx-wrap cx-section" aria-labelledby="sa-decisions-title">
        <h2 className="cx-h2" id="sa-decisions-title">
          {C.decisions.heading}
        </h2>
        <div className="cx-grid sa-decisions__grid">
          {C.decisions.items.map((d) => (
            <div key={d.title} className="sa-decision">
              <h3 className="cx-h3">{d.title}</h3>
              <p className="cx-body">{d.body}</p>
            </div>
          ))}
          <div className="sa-decision sa-decision--tradeoff">
            <h3 className="cx-h3">{C.decisions.tradeoff.title}</h3>
            <p className="cx-body">{C.decisions.tradeoff.body}</p>
          </div>
        </div>
      </section>

      <section className="sa-closing cx-wrap cx-section" aria-labelledby="sa-closing-title">
        <h2 className="cx-h2" id="sa-closing-title">
          {C.closing.lead}
        </h2>
        <p className="sa-closing__meta">{C.closing.meta}</p>
        <div className="cx-grid sa-closing__cols">
          <div>
            <p className="cx-kicker">Demonstrated</p>
            <ul className="cx-list">
              {C.closing.demonstrated.map((d) => (
                <li key={d.title}>
                  <strong>{d.title}.</strong> {d.text}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="cx-kicker">Limitations</p>
            <ul className="cx-list">
              {C.closing.limitations.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </CasePage>
  )
}

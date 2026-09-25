import '../../styles/pages/spreadsheet-agent.css'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ScrollScrubVideo } from '../../components/case/ScrollScrubVideo'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent (brief v16): the application is the opening visual. A
 * short title band, then one pinned passage the visitor plays with the
 * scroll, from a blank sheet through the request, its interpretation, the
 * plan to review, the rows, the traced source and the finished sheet, with
 * the seven steps as a quiet rail beneath the picture. Then the problem as
 * a statement, the review plan large with the decision beside it, and the
 * outcome as a figure.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <header className="sa-hero">
        <div className="sa-hero__title">
          <CaseTitle title={C.title} meta={C.meta} />
        </div>
        <div className="sa-hero__text">
          <div className="cx-lede">{C.summary}</div>
          <p className="cx-status">{C.status}</p>
        </div>
      </header>

      <ScrollScrubVideo
        className="sa-demo"
        layout="rail"
        src="/media/video/spreadsheet-agent-scrub-1280.mp4"
        poster="/media/img/spreadsheet-agent-scrub-poster.jpg"
        width={1280}
        height={646}
        duration={25.4}
        length={380}
        timeMap={C.timeMap}
        moments={C.moments}
        label="The Spreadsheet Agent prototype, played by scrolling: a written request becomes a reviewed plan and a finished sheet"
      />

      <section className="sa-problem" aria-labelledby="sa-problem-title">
        <p className="cx-kicker" id="sa-problem-title">
          The problem
        </p>
        <p className="sa-problem__lead" data-reveal>
          {C.problem.lead}
        </p>
        <p className="cx-statement sa-problem__statement" data-reveal>
          {C.problem.statement}
        </p>
      </section>

      <section className="sa-approach" aria-labelledby="sa-approach-title">
        <figure className="sa-approach__media cx-frame" data-reveal>
          <ResponsiveImage image="sheet-plan" sizes="(min-width: 1100px) 70vw, 100vw" />
        </figure>
        <div className="sa-approach__text" data-reveal>
          <p className="cx-kicker">My approach</p>
          <h2 className="sa-approach__title" id="sa-approach-title">
            {C.approach.title}
          </h2>
          <p className="cx-body">{C.approach.body}</p>
        </div>
      </section>

      <section className="sa-outcome" aria-labelledby="sa-outcome-title">
        <p className="cx-kicker" id="sa-outcome-title">
          Prototype outcome
        </p>
        <p className="sa-outcome__figure" data-reveal aria-hidden="true">
          {C.outcome.figure}
          <span>{C.outcome.unit}</span>
        </p>
        <p className="cx-body sa-outcome__text" data-reveal>
          {C.outcome.text}
        </p>
      </section>
    </CasePage>
  )
}

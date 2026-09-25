import '../../styles/pages/ai-leasing-agent.css'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { LEASING as C } from '../../content/pages/ai-leasing-agent'
import { projectById } from '../../content/projects'

const project = projectById('ai-leasing-agent')

/**
 * AI Leasing Agent (brief v16; route /work/valiance): the illustrative
 * conversation as the opening image, the problem as a statement, the
 * requirements drawn as a routing diagram (one incoming question, three
 * routes) with the tested topics beside it, the rollout as a short path, and
 * the adoption as a figure. The diagram draws itself in as it enters the
 * view (the page's reveal); reduced motion shows it complete.
 */
export default function AILeasingAgent() {
  const R = C.routing
  return (
    <CasePage project={project} className="page-ai-leasing-agent">
      <header className="la-hero">
        <div className="la-hero__text" data-hero-reveal>
          <CaseTitle title={C.title} meta={C.meta} />
          <div className="cx-lede">{C.summary}</div>
        </div>
        <figure className="la-hero__media" data-hero-media>
          <div className="cx-frame">
            <ResponsiveImage image="valiance-messages" sizes="(min-width: 1100px) 58vw, 100vw" priority />
          </div>
          <figcaption className="cx-caption">{C.conversationLabel}</figcaption>
        </figure>
      </header>

      <section className="la-problem" aria-labelledby="la-problem-title">
        <p className="cx-kicker" id="la-problem-title">
          The problem
        </p>
        <p className="la-problem__lead" data-reveal>
          {C.problem.lead}
        </p>
        <p className="cx-statement la-problem__statement" data-reveal>
          {C.problem.statement}
        </p>
      </section>

      <section className="la-routing" aria-labelledby="la-routing-title">
        <div className="la-routing__head">
          <p className="cx-kicker">{R.kicker}</p>
          <h2 className="la-routing__title" id="la-routing-title">
            {R.title}
          </h2>
        </div>
        <div className="la-diagram" data-reveal>
          <p className="la-diagram__in">{R.incoming}</p>
          <svg className="la-diagram__lines" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M150 0 V40 M150 40 C150 70 50 60 50 120 M150 40 V120 M150 40 C150 70 250 60 250 120" />
          </svg>
          <ol className="la-diagram__routes">
            {R.routes.map((r, i) => (
              <li key={r.title} className="la-route" style={{ transitionDelay: `${300 + i * 140}ms` }}>
                <span className="la-route__title">{r.title}</span>
                <span className="la-route__body">{r.body}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="la-routing__notes" data-reveal>
          <p className="la-routing__label">{R.testedLabel}</p>
          <ul className="la-tested">
            {R.tested.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="cx-caption">{R.platform}</p>
        </div>
      </section>

      <section className="la-rollout" aria-label="Rollout">
        <ol className="la-rollout__path" data-reveal>
          {C.rollout.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="la-result" aria-labelledby="la-result-title">
        <p className="cx-kicker" id="la-result-title">
          The result
        </p>
        <p className="la-result__figure" data-reveal aria-hidden="true">
          {C.result.figure}
          <span>{C.result.unit}</span>
        </p>
        <div className="cx-body la-result__text" data-reveal>
          {C.result.body}
        </div>
      </section>
    </CasePage>
  )
}

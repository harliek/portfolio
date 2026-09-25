import '../../styles/pages/cafepress-uk.css'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { CAFEPRESS as C } from '../../content/pages/cafepress-uk'
import { projectById } from '../../content/projects'

const project = projectById('cafepress-uk')

/**
 * CafePress UK (brief v17): research turned into visible choices. The hero
 * (the same storefront crop as the homepage cover); the launch question
 * with the four areas assessed; the storefront with three numbered
 * markers beside what was retained, what changed and why (one viewport,
 * not pinned); the localization table, complete from the start, a quiet
 * pink highlight passing across its rows; the assortment considered as a
 * readable comparison; and three recommendation rows (Retain, Localize,
 * Prepare) with their evidence and implication, ending on the status.
 */
export default function CafePressUK() {
  const D = C.decisions
  const L = C.localization
  const A = C.assortment
  const R = C.recommendations
  return (
    <CasePage project={project} className="page-cafepress-uk">
      <header className="cp-hero cx-wrap">
        <div data-hero-reveal>
          <CaseTitle title={C.title} meta={C.meta} />
        </div>
        <div className="cp-hero__lede" data-hero-reveal>
          <div className="cx-lede">{C.summary}</div>
        </div>
        <figure className="cp-hero__media cx-frame" data-hero-media>
          <ResponsiveImage image={C.hero} sizes="(min-width: 1408px) 1280px, calc(100vw - 48px)" priority />
        </figure>
      </header>

      <section className="cp-question cx-wrap cx-section" aria-labelledby="cp-question-title">
        <div className="cx-grid">
          <div className="cp-question__head">
            <p className="cx-kicker">The launch question</p>
            <h2 className="cx-h2" id="cp-question-title">
              {C.question.heading}
            </h2>
          </div>
          <div className="cp-question__areas">
            <p className="cx-body">{C.question.lead}</p>
            <ol className="cp-areas">
              {C.question.areas.map((a) => (
                <li key={a.title}>
                  <strong>{a.title}</strong>
                  <span>{a.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="cp-decisions cx-wrap cx-section" aria-labelledby="cp-decisions-title">
        <h2 className="cx-h2" id="cp-decisions-title">
          {D.heading}
        </h2>
        <div className="cx-grid cp-decisions__grid">
          <figure className="cp-annotated" data-reveal>
            <div className="cx-frame">
              <ResponsiveImage image={D.image} sizes="(min-width: 1100px) 830px, calc(100vw - 48px)" />
            </div>
            {D.markers.map((m) => (
              <span key={m.n} className="cp-marker" style={{ left: `${m.x}%`, top: `${m.y}%` }} aria-hidden="true">
                {m.n}
              </span>
            ))}
            <figcaption className="visually-hidden">Markers: {D.markers.map((m) => `${m.n}, ${m.label}`).join('; ')}.</figcaption>
          </figure>
          <ol className="cp-choices">
            {D.items.map((d) => (
              <li key={d.n}>
                <span className="cp-choices__num" aria-hidden="true">
                  {d.n}
                </span>
                <div>
                  <p className="cx-kicker">{d.kind}</p>
                  <h3 className="cp-choices__title">{d.title}</h3>
                  <p className="cp-choices__text">{d.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cp-local cx-wrap cx-section" aria-labelledby="cp-local-title">
        <div className="cx-grid">
          <div className="cp-local__head">
            <h2 className="cx-h2" id="cp-local-title">
              {L.heading}
            </h2>
            <p className="cx-body">{L.lead}</p>
            <figure className="cp-local__detail cx-frame" data-reveal>
              <ResponsiveImage image={L.detail} sizes="(min-width: 1100px) 400px, calc(100vw - 48px)" />
            </figure>
          </div>
          <div className="cp-local__table">
            <table className="cp-terms">
              <thead>
                <tr>
                  <th scope="col">US</th>
                  <th scope="col">UK</th>
                </tr>
              </thead>
              <tbody>
                {L.pairs.map(([us, uk], i) => (
                  <tr key={us} style={{ animationDelay: `${i * 2.5}s` }}>
                    <td lang="en-US">{us}</td>
                    <td lang="en-GB">{uk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="cx-caption">{L.note}</p>
          </div>
        </div>
      </section>

      <section className="cp-assortment cx-wrap cx-section" aria-labelledby="cp-assortment-title">
        <h2 className="cx-h2" id="cp-assortment-title">
          {A.heading}
        </h2>
        <p className="cx-body cp-assortment__lead">{A.lead}</p>
        <div className="cp-table-wrap">
          <table className="cp-assort">
            <thead>
              <tr>
                {A.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {A.rows.map((r) => (
                <tr key={r.product}>
                  <th scope="row">{r.product}</th>
                  <td>{r.supplier}</td>
                  <td>{r.reason}</td>
                  <td className="cp-assort__muted">{r.constraint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cx-caption">{A.note}</p>
      </section>

      <section className="cp-recs cx-wrap cx-section" aria-labelledby="cp-recs-title">
        <h2 className="cx-h2" id="cp-recs-title">
          {R.heading}
        </h2>
        <ol className="cp-recs__rows">
          {R.rows.map((r) => (
            <li key={r.kind} className="cp-rec">
              <p className="cp-rec__kind">{r.kind}</p>
              <div className="cp-rec__main">
                <h3 className="cx-h3">{r.title}</h3>
              </div>
              <div className="cp-rec__col">
                <p className="cx-kicker">Evidence</p>
                <p className="cp-rec__text">{r.evidence}</p>
              </div>
              <div className="cp-rec__col">
                <p className="cx-kicker">For the launch</p>
                <p className="cp-rec__text">{r.implication}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="cx-status cp-recs__status">{R.status}</p>
      </section>
    </CasePage>
  )
}

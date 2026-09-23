import { CaptionText } from '../media/Figure'

/**
 * Retrospective decision diagram for the Valiance case study: how a leasing
 * question is routed between approved information, current property data, and
 * the leasing team.
 *
 * One semantic structure serves every breakpoint: an ordered list of the two
 * decisions, each with its Yes/No outcomes as a nested list. Below 900px it
 * reads as a numbered vertical sequence; from 900px CSS (subgrid) lays the
 * same elements out as a branching tree. All connectors are CSS pseudo-elements
 * (not read aloud). Styles live in src/styles/pages/valiance.css (.vb).
 */
export function ValianceBoundaries({ className }: { className?: string }) {
  return (
    <figure className={['vb', className].filter(Boolean).join(' ')}>
      <div className="diagram vb__panel">
        <h3 className="diagram__title">How a leasing question is routed</h3>
        <div className="vb__chart">
          <p className="vb__start diagram-node diagram-node--focus">Leasing question</p>

          <ol className="vb__steps">
            <li className="vb__step vb__step--1">
              <p className="vb__question diagram-node">
                <span className="vb__num tabular" aria-hidden="true">1</span>
                <span>Does it require a human decision or exception?</span>
              </p>
              <ul className="vb__outcomes">
                <li className="vb__outcome vb__outcome--yes">
                  <span className="vb__label">Yes</span>
                  <p className="vb__node diagram-node diagram-node--human">Escalate to the leasing team</p>
                </li>
                <li className="vb__outcome vb__outcome--no vb__outcome--continue">
                  <span className="vb__label">No</span>
                  <p className="vb__continue">Continue to question 2</p>
                </li>
              </ul>
            </li>

            <li className="vb__step vb__step--2">
              <p className="vb__question diagram-node">
                <span className="vb__num tabular" aria-hidden="true">2</span>
                <span>Does it depend on current property information?</span>
              </p>
              <ul className="vb__outcomes">
                <li className="vb__outcome vb__outcome--yes">
                  <span className="vb__label">Yes</span>
                  <p className="vb__node diagram-node">Use a verified current source</p>
                  <p className="vb__then">
                    <span className="vb__label">Then</span>
                    <span className="vb__node diagram-node diagram-node--human">If unavailable or uncertain, hand off</span>
                  </p>
                </li>
                <li className="vb__outcome vb__outcome--no">
                  <span className="vb__label">No</span>
                  <p className="vb__node diagram-node">Answer from approved information</p>
                </li>
              </ul>
            </li>
          </ol>

          <p className="vb__end">
            <span className="vb__end-label">All answer routes end with</span>
            <span className="vb__node diagram-node diagram-node--focus">Keep the next step clear</span>
          </p>
        </div>
      </div>
      <figcaption className="figure__caption">
        <CaptionText provenance="retrospective-diagram">
          Retrospective workflow explanation based on the requirements work. It is not a diagram of the third-party platform’s internal architecture.
        </CaptionText>
      </figcaption>
    </figure>
  )
}

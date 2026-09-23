import { CaptionText } from '../media/Figure'

/**
 * Retrospective diagram for the PlanetArt case study: the kinds of
 * information a merchandising decision draws on, gathered into one view.
 *
 * It shows relationships only. It is not a schema, an integration map, or a
 * deployed architecture, and the caption says so.
 *
 * Structure (also the screen-reader reading order):
 *   ol  → 1. the five sources (ul) → 2. the central view → 3. the output
 * The ol's three direct children are what data-reveal="stagger" animates.
 * Connectors are decorative (aria-hidden); the list order carries the
 * relationship. Styles live in src/styles/pages/planetart.css.
 */

const SOURCES = ['Vendors', 'Products', 'Inventory', 'Promotions', 'Sales information'] as const

/*
 * Wide layout: the five source rows share the column height equally, so each
 * row's centre sits at a fixed percentage. The connector SVG stretches to
 * that height (preserveAspectRatio="none", strokes kept at a constant width)
 * and draws one curve per source into a single junction.
 */
const JUNCTION_X = 76
const MERGE_PATHS = SOURCES.map((_, i) => {
  const y = ((i + 0.5) / SOURCES.length) * 100
  return `M0 ${y} C ${JUNCTION_X * 0.55} ${y} ${JUNCTION_X * 0.45} 50 ${JUNCTION_X} 50 L 100 50`
})

export function PlanetArtWorkflow() {
  return (
    <figure className="figure pa-flow">
      <div className="diagram pa-flow__panel">
        <h3 id="pa-flow-title" className="diagram__title">
          Information needed for merchandising decisions
        </h3>
        <ol className="pa-flow__stages" data-reveal="stagger" aria-labelledby="pa-flow-title">
          <li className="pa-flow__stage pa-flow__stage--sources">
            <ul className="pa-flow__sources">
              {SOURCES.map((source) => (
                <li key={source} className="pa-flow__source">
                  <span className="diagram-node">{source}</span>
                </li>
              ))}
            </ul>
          </li>
          <li className="pa-flow__stage pa-flow__stage--hub">
            <span className="pa-flow__link pa-flow__link--merge" aria-hidden="true">
              <svg className="pa-flow__merge" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
                {MERGE_PATHS.map((d) => (
                  <path key={d} d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            </span>
            <span className="diagram-node diagram-node--focus pa-flow__hub">Centralized merchandising view</span>
          </li>
          <li className="pa-flow__stage pa-flow__stage--output">
            <span className="pa-flow__link" aria-hidden="true" />
            <span className="diagram-node diagram-node--human pa-flow__output">Review and decisions</span>
          </li>
        </ol>
      </div>
      <figcaption className="figure__caption">
        <CaptionText provenance="retrospective-diagram">
          Retrospective explanation of the concept. This is not a{' '}
          <span className="pa-nowrap">deployed-system</span> architecture.
        </CaptionText>
      </figcaption>
    </figure>
  )
}

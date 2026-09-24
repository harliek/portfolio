import type { Rect, Section, Visual } from '../../components/case/CaseScroll'

/**
 * Spreadsheet Agent (CaseScroll). Copy follows the latest brief (section 20)
 * and adds only what the recording shows
 * (Spreadsheet Agent/Spreadsheet Video.mov, 37.8s):
 *   4–18s   the request is typed in the assistant panel and sent
 *   19–22s  "Review before building / Build plan": source (Northwind product
 *           catalog, 1,200 synthetic records), filters, columns, sort, row
 *           limit, Edit plan, Discard, Build sheet, and a "Not used" note for
 *           words that did not map to a field or filter
 *   25.3s   the saved sheet, "Saved · 1,200 rows · 6 columns", with an
 *           editing toolbar, a formula bar and a source line for the selected
 *           cell (northwind.catalog.products[].sku); no cell edit is typed
 *   34–37s  All Sheets, with the new sheet listed first
 * No cell edit or reopening is performed on screen, so the page says the
 * sheet opens in an editable grid and is listed in All Sheets, where it can
 * be reopened. The simulation limit is stated once, in Results (plus the
 * metadata status).
 *
 * Visuals are the focused crops in src/content/crops/spreadsheet-agent.ts
 * (all 5:3, the frame ratio). Highlights are percentages of each crop.
 */

/** The assistant panel's instruction line, in sa-request. */
const INSTRUCTION: Rect = { x: 26.7, y: 33.3, w: 59.2, h: 18.6 }
/** The request field, in sa-request. */
const REQUEST_FIELD: Rect = { x: 27, y: 56, w: 70.5, h: 39.2 }
/** Source, filters and columns, in sa-plan. */
const PLAN_ROWS: Rect = { x: 29.1, y: 43.9, w: 66.3, h: 52.2 }
/** The "Not used" note, in sa-plan-unused. */
const NOT_USED: Rect = { x: 29.2, y: 53, w: 65.9, h: 18.7 }
/** Toolbar, formula bar and source line, in sa-sheet. */
const SHEET_CONTROLS: Rect = { x: 1.2, y: 17.9, w: 97.6, h: 21.1 }
/** The new sheet's card, in sa-list. */
const NEW_SHEET_CARD: Rect = { x: 1, y: 30.2, w: 32.3, h: 43.6 }

const requestVisual: Visual = {
  kind: 'image',
  image: 'sa-request',
  caption: 'The request typed into the assistant panel.',
  highlight: REQUEST_FIELD,
}

/**
 * The page's sections. `premiseVisual`: on the desktop split the premise shows
 * the panel's instruction line (then the highlight moves to the request field
 * in the same crop); stacked, the premise has no figure, so the same crop is
 * not shown twice in a row.
 */
function sections(premiseVisual: boolean): Section[] {
  return [
    {
      id: 'premise',
      title: 'Product premise',
      blocks: [
        {
          id: 'premise-text',
          body: (
            <p>
              A written request can be read in more than one way. The prototype is built on the premise that the user should{' '}
              <strong>check how a request was interpreted before any data reaches the sheet</strong>. The assistant panel says so directly, “Describe
              the result you need. Review the data source and logic before anything is added to your sheet.”
            </p>
          ),
          visual: premiseVisual
            ? { kind: 'image', image: 'sa-request', caption: 'The assistant panel’s instruction above the request field.', highlight: INSTRUCTION }
            : undefined,
        },
      ],
    },
    {
      id: 'decisions',
      title: 'Design decisions',
      blocks: [
        {
          id: 'request',
          title: 'Request',
          body: (
            <p>
              The request is a plain sentence typed into the assistant panel, not a query or a formula. In the recording, the user types{' '}
              <strong>“Compare vendor prices across B2B products”</strong> and sends it.
            </p>
          ),
          visual: requestVisual,
        },
        {
          id: 'plan',
          title: 'Review the proposed plan',
          body: (
            <p>
              Before creating the sheet, the prototype shows the proposed data source, filters, columns, and sorting. The user can{' '}
              <strong>revise the plan</strong> and see which parts of the request were <strong>not recognized</strong>. In the recording, the plan
              proposes the Northwind product catalog (1,200 synthetic records), no filters, and six columns.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'sa-plan',
            caption: 'The proposed plan under the request, with Edit plan at the top.',
            highlight: PLAN_ROWS,
            enlarge: 'sa-plan-panel',
          },
        },
        {
          id: 'plan-unused',
          body: (
            <p>
              Words that did not map to a field or filter are listed as not used, here <strong>“compare” and “across”</strong>, so they have no
              effect on the plan. Nothing is added to the sheet until the user chooses <strong>Build sheet</strong>.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'sa-plan-unused',
            caption: 'Sorting, the row limit and the words the plan did not use, above Build sheet.',
            highlight: NOT_USED,
            enlarge: 'sa-plan-panel',
          },
        },
        {
          id: 'sheet',
          title: 'Edit and reopen the sheet',
          body: (
            <p>
              Build sheet creates a sheet named Vendor Pricing and Margin and saves it with 1,200 rows and six columns. The sheet opens in an{' '}
              <strong>editable grid</strong> with an editing toolbar and a formula bar, and selecting a cell shows{' '}
              <strong>the catalog field its value came from</strong>.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'sa-sheet',
            caption: 'The saved sheet with its editing toolbar, formula bar and source line.',
            highlight: SHEET_CONTROLS,
          },
        },
        {
          id: 'list',
          body: (
            <p>
              The saved sheet is listed first in <strong>All Sheets</strong>, where it can be reopened alongside the other sheets in the workspace.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'sa-list',
            caption: 'All Sheets, with the new sheet listed first.',
            highlight: NEW_SHEET_CARD,
          },
        },
      ],
    },
  ]
}

export const SPREADSHEET_AGENT = {
  situation: (
    <p>
      Spreadsheet Agent is a spreadsheet workspace with an assistant panel. A user describes the sheet they need, <strong>reviews a proposed
      plan</strong>, and receives an editable sheet built from a synthetic product catalog.
    </p>
  ),
  opening: {
    kind: 'image',
    image: 'sa-overview',
    caption: 'The saved sheet beside the assistant panel that produced it.',
  } satisfies Visual,
  sections,
  results: (
    <p>
      The prototype connects a written request to a <strong>reviewable plan and a saved spreadsheet</strong>. AI responses are simulated, so the
      work demonstrates the interaction rather than model reliability.
    </p>
  ),
}

import type { Highlight, VisualStep } from '../../components/case/StickyVisual'

/**
 * Spreadsheet Agent: copy from the client's brief (Page 3). Each approach
 * paragraph opens with the brief's sentence and adds only what the
 * recording shows (PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov):
 *   4–18s   the request is typed in the assistant panel
 *   19–22s  "Review before building / Build plan" with source (Northwind
 *           product catalog, 1,200 synthetic records), filters, columns,
 *           sort, row limit, Edit plan, Discard, Build sheet, and a
 *           "Not used" note for words that did not map to a field
 *   25.3s   the returned sheet, "Saved · 1,200 rows · 6 columns", with a
 *           formula bar and an editing toolbar (the rows are scrolled;
 *           no cell edit is typed)
 *   34–37s  All Sheets, with the new sheet listed first
 * No cell edit or reopening is performed on screen, so the page says the
 * sheet opens in an editable grid and is saved to the list of sheets,
 * where it can be reopened (the lead's wording).
 *
 * Highlights and crops are percentages of the 2940×1486 still.
 * No diagram placeholder on this page.
 */
export const SPREADSHEET_AGENT = {
  subtitle: 'Spreadsheet workflow prototype',
  description: <p>An independent prototype of a spreadsheet workspace with an assistant panel, built on a synthetic product catalog.</p>,
  note: 'Simulated AI responses. No live model connection.',
  summary: <p>The recorded walkthrough goes from a typed request to a reviewed build plan and a saved, editable sheet.</p>,
  heroCaption: 'The returned Vendor Pricing and Margin sheet beside the assistant panel.',
  context: (
    <p>
      I built an independent prototype to explore how a user could describe a spreadsheet task, review a proposed structure, and continue editing
      the result.
    </p>
  ),
  problem: <p>The prototype examines the steps between describing a spreadsheet task and receiving a result that can be reviewed and edited.</p>,
  steps: [
    {
      id: 'request',
      title: 'Request',
      body: (
        <p>
          The user enters a request. The assistant panel asks for the result the user needs, and in the recording the request reads “Compare vendor
          prices across B2B products.”
        </p>
      ),
      image: 'sheet-request',
      highlight: { x: 73.6, y: 24, w: 25.4, h: 16.6 },
      dim: true,
      marker: true,
      caption: 'The request field in the assistant panel.',
    },
    {
      id: 'plan',
      title: 'Plan review',
      body: (
        <p>
          The prototype presents a proposed structure for review. Before anything is added to the sheet, a build plan lists the data source,
          filters, columns, sort order, and row limit, with controls to edit the plan, discard it, or build the sheet. A note names the words in
          the request that did not map to a field or filter.
        </p>
      ),
      image: 'sheet-plan',
      highlight: { x: 73.6, y: 16.4, w: 25.4, h: 64.6 },
      dim: true,
      marker: true,
      caption: 'The build plan, shown for review before the sheet is built.',
    },
    {
      id: 'sheet',
      title: 'Editable sheet',
      body: (
        <p>
          The resulting sheet opens in an editable grid with a formula bar and an editing toolbar. It is saved with 1,200 rows and six columns and
          appears in the list of sheets, where it can be reopened.
        </p>
      ),
      image: 'sheet-returned',
      highlight: { x: 17, y: 6.6, w: 25, h: 32.7 },
      dim: true,
      marker: true,
      caption: 'The saved sheet with its editing toolbar and formula bar.',
    },
  ] satisfies VisualStep[],
  /**
   * Below 960px each step shows a faithful crop around its highlighted
   * region instead of the whole 2940px interface shrunk to phone width.
   */
  mobileCrops: {
    request: { x: 72.5, y: 0, w: 27.5, h: 42 },
    plan: { x: 72.5, y: 7, w: 27.5, h: 75 },
    sheet: { x: 15.9, y: 0, w: 27, h: 42.9 },
  } satisfies Record<string, Highlight>,
  results: (
    <p>
      The prototype demonstrates the interaction from request to editable sheet. The responses are simulated, so it does not establish the
      reliability of a live AI system.
    </p>
  ),
  resultsFigureCaption: 'The new sheet, listed first in All Sheets.',
}

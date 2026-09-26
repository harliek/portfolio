/**
 * Spreadsheet Agent (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and two sections on the left (review
 * before generation, data provenance; September 26 copy); beside
 * them, fixed, the recording of the same build (captured 2026-09-25 at
 * 1440 × 900 from spreadsheetagent.netlify.app with a request its plan
 * answers exactly), following the scroll; one scope note.
 *
 * Facts: the plan for “Create a sheet of B2B products with vendor, cost,
 * retail price, and margin” lists the Northwind product catalog (1,200
 * synthetic records), no filters, SKU, Product Name, Vendor, Cost, Retail
 * Price and Margin Percent, sorted by product name; the built sheet has 1,200
 * rows and six columns; selecting Atlas Goods (C3) and opening Detail shows
 * the field, dataset, record, definition and why the column was chosen. The
 * responses come from rules (a deterministic rule engine), not a model. The
 * earlier recording (a comparison request its plan did not answer) is not
 * shown.
 */
export const SHEET = {
  title: 'Spreadsheet Agent',
  meta: ['Product design and build', 'Independent project · 2026'],
  lede: (
    <p>
      I designed and built a prototype that turns written requests into editable spreadsheets using a synthetic product catalog.
    </p>
  ),
  /**
   * The recording (sa-demo-scrub-1440.mp4, 24.7s): a fresh capture of spreadsheetagent.netlify.app at 1440x900
   * on 2026-09-25 with this request. Typing starts 4.5s and is sent 8.97s; the plan is read until Build sheet at
   * 13.2s; the sheet is complete at 15.47s; Atlas Goods is selected at 19.77s and its detail opens at 21.23s. The
   * earlier recordings (request "Compare vendor prices across B2B products") are not used.
   */
  // Review before generation: the request sent, the plan reviewed, the sheet built (8.5s to 19.3s); data provenance:
  // the pointer moving to a cell, the cell selected and its source detail opened (19.3s to the end). Never the empty sheet.
  segments: [
    [8.5, 19.3],
    [19.3, 24.73],
  ] as const,
  stills: [11.5, 23.5],
  /** Harlie's editorial pass (v23): the workflow's distinctions, the demonstrated request quoted on its own, one scope note. */
  steps: [
    {
      title: 'Review before generation',
      text: 'The prototype presents the proposed data source, columns, filters, and sort order for approval. It also identifies words from the request that were not used.',
    },
    {
      title: 'Data provenance',
      text: 'Cell details identify the source dataset and record, define the field, and explain why the column was included.',
    },
  ],
}

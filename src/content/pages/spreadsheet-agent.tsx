/**
 * Spreadsheet Agent (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and four sections on the left (request
 * interpretation, plan review, sheet generation, data provenance); beside
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
  meta: ['Product design and build', 'Independent project – 2026'],
  lede: (
    <p>
      I designed and built a prototype for creating spreadsheets from written requests, using a synthetic product catalog.
    </p>
  ),
  /**
   * The recording (sa-demo-scrub-1440.mp4, 24.7s): a fresh capture of spreadsheetagent.netlify.app at 1440x900
   * on 2026-09-25 with this request. Typing starts 4.5s and is sent 8.97s; the plan is read until Build sheet at
   * 13.2s; the sheet is complete at 15.47s; Atlas Goods is selected at 19.77s and its detail opens at 21.23s. The
   * earlier recordings (request "Compare vendor prices across B2B products") are not used.
   */
  segments: [
    [0, 8.97],
    [8.97, 13.2],
    [13.2, 18.83],
    [18.83, 24.73],
  ] as const,
  stills: [8.6, 11.5, 17.2, 23.5],
  /** Harlie's editorial pass (v23): the workflow's distinctions, the demonstrated request quoted on its own, one scope note. */
  steps: [
    {
      title: 'Defining the request',
      text: 'A written request specifies which product fields to include.',
      quote: '“Create a sheet of B2B products with vendor, cost, retail price, and margin.”',
    },
    {
      title: 'Reviewing the plan',
      text: 'Before building the sheet, users can review the data source, columns, filters, and sorting. The plan flags terms it cannot interpret.',
    },
    {
      title: 'Building the sheet',
      text: 'The approved plan becomes an editable sheet.',
    },
    {
      title: 'Tracing the data',
      text: 'Cell details show where the data came from, what the field means, and why it was included.',
    },
  ],
}

/**
 * Spreadsheet Agent (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and two sections on the left (review
 * before generation, data provenance; September 26 copy); beside
 * them, fixed, the recording of the same build (captured 2026-09-25 at
 * 1440 × 900 from spreadsheetagent.netlify.app with a request its plan
 * answers exactly), playing by itself on a loop at 1.5 times its speed.
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
 *
 * Copy brief of 2026-09-29: the narrative no longer repeats that there is no language model, and there is no closing
 * restatement. The meta is one line, "Independent project · 2026" (Harlie's request, 2026-09-29: the labels
 * "Product design and build" and "Rule-based prototype · Synthetic data" removed).
 */
export const SHEET = {
  title: 'Spreadsheet Assistant',
  meta: ['Independent project · 2026'],
  /** Harlie's copy brief of 2026-09-29, verbatim (README: nothing reaches a sheet until the plan is approved). */
  lede: (
    <p>
      I designed and built a spreadsheet assistant that translates written requests into editable sheets through a reviewable plan.
    </p>
  ),
  /**
   * The recording (sa-demo-1440.mp4, 24.7s): a fresh capture of spreadsheetagent.netlify.app at 1440x900
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
  /**
   * Harlie's copy brief of 2026-09-29, checked against the prototype's source (~/Desktop/monty-sheets 11/
   * spreadsheet-agent), not the recordings: query.ts reads fields, filters, sorting and row limits; PlanReview.tsx
   * "Edit plan" changes filters, columns, sort and limit before Build sheet, and its "Not used" line lists the request's
   * words that did not map to a field or filter (query.ts unmatchedTerms), so the copy says words, not instructions;
   * CellDetail.tsx names the dataset, record and field and a derived column's formula ("Calculation"); cell edits
   * (SpreadsheetGrid.tsx), undo and redo and saved folders (useWorkspace.ts). Which of these the recording shows is
   * recorded in docs/content-provenance.md.
   */
  steps: [
    {
      title: 'Review the plan',
      text: 'The interpreter identifies the requested fields, filters, sorting, and row limits. Users can adjust the proposed plan and see which instructions were not recognized before creating the sheet.',
    },
    {
      title: 'Inspect and edit',
      text: 'Cell details trace values to their source records and formulas. Users can edit the sheet, undo changes, and save it to a folder.',
    },
  ],
}

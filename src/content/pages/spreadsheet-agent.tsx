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
  /** Harlie's revised text of 2026-09-30, verbatim (README: nothing reaches a sheet until the plan is approved). */
  lede: (
    <p>
      I designed and built a spreadsheet assistant that turns written requests into structured, editable sheets.
    </p>
  ),
  /**
   * The recording (sa-demo-1440.mp4, 24.7s): a fresh capture of spreadsheetagent.netlify.app at 1440x900
   * on 2026-09-25 with this request. Typing starts 4.5s and is sent 8.97s; the plan is read until Build sheet at
   * 13.2s; the sheet is complete at 15.47s; Atlas Goods is selected at 19.77s and its detail opens at 21.23s. The
   * earlier recordings (request "Compare vendor prices across B2B products") are not used.
   */
  // Four sections (Harlie's text of 2026-09-30): the workspace of saved sheets, held on its last frame before New sheet
  // at 2.23s (Product problem); the request sent and the plan reviewed, to just before Build sheet at 13.2s
  // (Interpretation layer); the sheet built (Review and editing); the pointer moving to a cell, the cell selected and
  // its source detail opened (19.3s to the end; Product principle). Never the empty sheet. The recording itself plays
  // on its own loop (SpreadsheetAgent.tsx, `free`), so these apply under reduced motion (the stills).
  segments: [
    [0, 2.2, 'hold'],
    [8.5, 13.17],
    [13.2, 19.3],
    [19.3, 24.73],
  ] as const,
  stills: [1.0, 11.5, 17.0, 23.5],
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
      title: 'Product problem',
      text: 'Natural-language tools can generate results quickly, but users often cannot see what the system understood, missed, or used to produce an answer.',
    },
    {
      title: 'Interpretation layer',
      text: 'Before creating the sheet, the assistant identifies fields, filters, sorting, and row limits, then flags instructions it could not interpret.',
    },
    {
      title: 'Review and editing',
      text: 'Users can adjust the plan before generation, then inspect source records and formulas, edit cells, undo changes, and save the sheet.',
    },
    {
      title: 'Product principle',
      text: 'The workflow gives users visibility into the assistant’s reasoning before and after generation while preserving the speed of automation.',
    },
  ],
}

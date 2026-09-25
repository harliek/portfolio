import type { ScrubMoment, ScrubTimeMap } from '../../components/case/ScrollScrubVideo'

/**
 * Spreadsheet Agent (brief v16): one choreographed, scroll-played passage
 * from a blank sheet to a finished one, the recording itself as the story.
 *
 * Checked against the recording (Spreadsheet Agent/Spreadsheet Video.mov,
 * 37.8s; the scrub encode starts at its 2.0s, so times below are the
 * recording's minus 2.0):
 *  1 blank sheet 2.07 ("Untitled sheet · Not saved", "Select a cell to trace
 *    where its value came from.");
 *  2 request typed 4.5 to 17.2 ("Compare vendor prices across B2B
 *    products"), sent 18.1;
 *  3 "Interpreting request" 18.1 to 19.1;
 *  4 "Review before building · Build plan" 19.2 to 22.6: source "Northwind
 *    product catalog · 1,200 synthetic records · approved for this
 *    workspace", columns, sort, and "Not used: compare, across";
 *  5 rows arrive 23.75 to 24.75 (1,200);
 *  6 the selected cell's "Source data · northwind.catalog.products[].sku"
 *    bar, shown with the rows (selected automatically, never clicked);
 *  7 "Vendor Pricing and Margin is ready: 1,200 rows and 6 columns" 25.0.
 * Steps 4 to 7 pass within six seconds, so the time map gives each a
 * similar share of the scroll.
 *
 * Qualified once, beside the title: synthetic data, AI responses simulated
 * by rules, not a live model. Not claimed: a model, live data, edits typed
 * into cells (the recording shows the editing controls, not an edit).
 */
export const SHEET = {
  title: 'Spreadsheet Agent',
  meta: ['Independent project', 'Product design and build', '2026'],
  status: 'Working prototype with synthetic data. The AI responses are simulated by rules, not a live model.',
  summary: (
    <p>
      I built a prototype spreadsheet agent that turns a written request into a structured, editable sheet. It adds matching rows from a product
      catalog and shows a plan to review before it builds anything.
    </p>
  ),
  moments: [
    { start: 0, end: 2.5, label: 'A blank sheet' },
    { start: 2.5, end: 16.1, label: 'A written request', note: '“Compare vendor prices across B2B products.”', still: 'sheet-request' },
    { start: 16.1, end: 17.2, label: 'The agent interprets it', still: 'sheet-interpreting' },
    { start: 17.2, end: 21.75, label: 'A plan to review first', note: 'Source, filters, columns, and sort, with unmatched words listed as unused.', still: 'sheet-plan' },
    { start: 21.75, end: 22.5, label: 'Matching rows arrive', note: '1,200 rows from the approved catalog.', still: 'sheet-returned' },
    { start: 22.5, end: 23.2, label: 'Each value traces to its source', note: 'The selected cell shows the catalog field it came from.' },
    { start: 23.2, end: 25.5, label: 'The sheet is ready', note: 'Saved with 1,200 rows and six columns.', still: 'sheet-list' },
  ] satisfies ScrubMoment[],
  timeMap: [
    [0, 0],
    [0.08, 2.5],
    [0.28, 15.6],
    [0.36, 16.6],
    [0.4, 17.2],
    [0.54, 21.2],
    [0.64, 22.1],
    [0.76, 22.9],
    [0.88, 23.6],
    [1, 25.4],
  ] satisfies ScrubTimeMap,
  problem: {
    lead: 'In leasing and merchandising, I worked with large amounts of property and product data.',
    statement: 'Preparing a new spreadsheet meant gathering data, cleaning it, and repeating the work for each requested view.',
  },
  approach: {
    title: 'Review the plan before creating the sheet.',
    body: 'Users can check the source, filters, columns, and sort order before building. Words the agent could not map to a field or filter are listed as unused rather than silently dropped.',
  },
  outcome: { figure: '1,200', unit: 'rows', text: 'In the prototype, one written request becomes a saved sheet of 1,200 rows and six columns after a single review step.' },
}

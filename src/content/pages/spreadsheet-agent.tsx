import type { StorySection } from '../../components/case/CaseScroll'
import type { TimeMap } from '../../components/media/DemoVideo'

/**
 * Spreadsheet Agent (CaseScroll `video` media with an edited preview; brief-v8 section 10).
 *
 * Inline, an edited preview at 1.5× plays (VIDEOS `spreadsheet-agent-preview`, labelled "Edited preview · 1.5×
 * speed"): the request, the reviewable build plan at 1.8s, then the sheet created and filled from 5.8s (the sheet
 * list and most of the typing are left out, so the preview no longer dwells on an empty sheet). Expanding plays the
 * complete recording (`spreadsheet-agent`) at original speed, from the matching moment (PREVIEW_MAP). Its poster is
 * the build plan, for reduced motion and a refused autoplay.
 *
 * Copy: The problem's second sentence and My approach are brief-v8 section 10 verbatim ("Preparing a new spreadsheet ...",
 * "Review the plan before creating the sheet. Users can check ..."). The status line states once that the AI responses
 * are simulated (no live model), so the page never describes a production agent; the opening says "prototype". The
 * homepage's display subtitle ("Built an agent that retrieves data ...") is a label; the page says what the recording
 * shows (matching rows added from a product catalog). Word counts: opening 32, The problem 30, My approach 36,
 * Prototype outcome 21.
 *
 * Checked against the recording (Spreadsheet Agent/Spreadsheet Video.mov, 37.8s, read frame by frame):
 *   4 to 18.4s  the request "Compare vendor prices across B2B products" typed into the assistant panel ("Describe the
 *               result you need. Review the data source and logic before anything is added to your sheet.")
 *   18.5 to 19s "Interpreting request"
 *   19.25 to 22s "Review before building · Build plan": Source (Northwind product catalog, "1,200 synthetic records
 *               approved for this workspace"), Filters, Columns, Sort, Row limit, Edit plan, Discard, Build sheet, and
 *               "Not used: compare, across. These words did not map to a field or filter, so they had no effect on
 *               the plan."
 *   22 to 25.25s Build sheet: "Checking approved sources", "No filters to apply", "Creating 6 columns", "Adding 1,200
 *               matching products" (200 to 1,200 rows), "Sheet ready"
 *   25.25s      "Vendor Pricing and Margin is ready: 1,200 rows and 6 columns from the Northwind catalog."; the sheet
 *               "Saved · 1,200 rows · 6 columns" with an editing toolbar, a formula bar, Download CSV and "Ask for a
 *               change to this sheet"
 * "Editable" rests on those controls (no cell edit is typed on screen); Download CSV is visible but not used. The
 * leasing and merchandising data work is on the résumé (Valiance Capital, a 1,000+ tenant portfolio; PlanetArt,
 * product, vendor and inventory data). "Simulated by rules, not a live model": Harlie's statement (earlier briefs),
 * the plan's "Not used" words (a field mapping, not a model), and the project's own README
 * (~/Downloads/spreadsheet-agent: "a deterministic rule engine, not a language model"; "no database, no API, no
 * authentication and no model behind it"). That local copy is a related version, not the exact recorded build (its
 * catalog is "Northwind Goods" and it lacks the recording's "Review before building" wording).
 */

/** [previewSeconds, completeSeconds], printed by `node scripts/prepare-media.mjs previews`. */
export const PREVIEW_MAP: TimeMap = [
  [0, 17],
  [0.9, 18.35],
  [1.2, 18.35],
  [3.567, 21.9],
  [4.367, 21.9],
  [7.433, 26.5],
  [8.633, 26.5],
  [10.133, 28.75],
]

export const SPREADSHEET_AGENT = {
  meta: ['Product design and build · Independent project', '2026 · Spreadsheets from written requests'],
  status: 'Working prototype with synthetic data. The AI responses are simulated by rules, not a live model.',
  summary: (
    <p>
      I built a prototype spreadsheet agent that turns a written request into a structured, editable sheet. It adds matching rows from a product
      catalog and shows a plan to review before it builds anything.
    </p>
  ),
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          In leasing and merchandising, I worked with large amounts of property and product data. Preparing a new spreadsheet meant gathering data,
          cleaning it, and repeating the work for each requested view.
        </p>
      ),
    },
    {
      id: 'approach',
      title: 'My approach',
      body: (
        <p>
          <strong>Review the plan before creating the sheet.</strong> Users can check the source, filters, columns, and sort order before building.
          Words the agent could not map to a field or filter are listed as unused rather than silently dropped.
        </p>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'outcome',
    title: 'Prototype outcome',
    body: <p>In the prototype, one written request becomes a saved sheet of 1,200 rows and six columns after a single review step.</p>,
  } satisfies StorySection,
}

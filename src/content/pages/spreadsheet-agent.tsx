import type { StorySection } from '../../components/case/CaseScroll'

/**
 * Spreadsheet Agent (CaseScroll, `video` media: the real recording autoplays
 * on the right, so the sections carry no visuals).
 *
 * Copy is brief-v5 section 19, edited for the copy rules and lead decision 4
 * (one qualification, the simulated AI responses, stated once; no "retrieves
 * data" claim). Round 1 of the critique (R1-01, R1-04) moved that
 * qualification into the metadata's status line ("Prototype with simulated AI
 * responses") and removed the result's first sentence, which repeated the
 * opening. The opening adds the homepage sentence (brief-v5 section 9, "I
 * designed a review step before a request becomes a spreadsheet"). Word
 * counts: opening 28, The problem 37, My approach 40, The result 20.
 *
 * The recording starts at 16.5s on its first play (VIDEOS startAt), so the
 * build plan appears within about 3s; its poster is the plan at 21s.
 *
 * Every statement is checked against the recording
 * (Spreadsheet Agent/Spreadsheet Video.mov, 37.8s, read frame by frame; the
 * site's encode, spreadsheet-agent-1600.mp4, matches it at SSIM 0.99+ and
 * stops at 36.4s):
 *   4 to 18s  the request "Compare vendor prices across B2B products" is typed
 *             into the assistant panel ("Describe the result you need. Review
 *             the data source and logic before anything is added to your
 *             sheet.") and sent
 *   19 to 22s "Review before building · Build plan" with Source (Northwind
 *             product catalog, "1,200 synthetic records approved for this
 *             workspace"), Filters, Columns, Sort, Row limit, Edit plan,
 *             Discard, Build sheet, and "Not used: compare, across. These
 *             words did not map to a field or filter, so they had no effect
 *             on the plan."
 *   25.3s     the saved sheet, "Saved · 1,200 rows · 6 columns", with an
 *             editing toolbar, a formula bar, a source line for the selected
 *             cell, Download CSV and "Ask for a change to this sheet"
 * "Editable" rests on those controls; no cell edit is typed on screen, and
 * Edit plan is visible but not used. The problem section's leasing and
 * merchandising data work is on the résumé (Valiance Capital, a 1,000+ tenant
 * portfolio; PlanetArt, product, vendor and inventory data). The résumé's
 * "retrieves data" wording is not used (the recording shows no retrieval).
 */

export const SPREADSHEET_AGENT = {
  meta: ['Product design and build · Independent project', '2026 · Prototype with simulated AI responses'],
  summary: (
    <p>
      I built a spreadsheet agent that turns a natural language request into a structured, editable sheet. I designed <strong>a review step</strong>{' '}
      before a request becomes a sheet.
    </p>
  ),
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          In leasing and merchandising, I worked with large amounts of property and product data. Building a spreadsheet meant gathering information,
          deciding how to organize it, cleaning entries, and repeating that work whenever someone needed a different view.
        </p>
      ),
    },
    {
      id: 'approach',
      title: 'My approach',
      body: (
        <p>
          The agent uses a synthetic dataset to create a plan from the request, listing the source, filters, columns, sort order, and any words it did not
          use. The user can <strong>review how it interpreted the task</strong> before generating the sheet.
        </p>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        Reviewing the plan first makes it easier to catch the wrong columns, filters, or interpretation before the sheet is created.
      </p>
    ),
  } satisfies StorySection,
}

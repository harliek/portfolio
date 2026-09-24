import type { StorySection } from '../../components/case/CaseScroll'

/**
 * Merchandising Platform (CaseScroll, `video` media: the real recording
 * autoplays on the right, so the sections carry no visuals).
 *
 * Copy is brief-v5 section 18, edited for the copy rules (first person, no
 * colons or em dashes, word targets, the Ask sentence once) and round 1 of the
 * critique (R1-01, R1-03, R1-04, R1-06): the metadata carries role, status and
 * the synthetic-data qualification (stated once, there); "What I built" opens
 * with the reorder calculation instead of repeating the summary's list, and
 * states the Ask design as a choice; the 240-product catalog is named in the
 * recording's caption (src/content/media.ts), next to the evidence. Word
 * counts: opening 21, The problem 30, What I built 35, The result 22.
 *
 * Every statement is checked against the recording
 * (PlanetArt/Merchandising Dashboard/Dashboard Video.mov, 57.3s, read frame by
 * frame; the site's encode, merch-console-1600.mp4, matches it at SSIM 0.99+
 * and stops at 56.3s):
 *  - Independent, after the internship, synthetic data. The in-app footer on
 *    every screen reads "Portfolio project. Synthetic catalog, no backend,
 *    nothing leaves your browser."; the header reads "Merch Console · 240
 *    SKUs · demo data" (the "catalog of 240 products"). The internship ran
 *    June to August 2026 (résumé); the recording was made in September 2026.
 *  - "Catalog records, stock levels, and sales history with cost, price,
 *    margin, and profit": the catalog row ("Every SKU with its vendor, unit
 *    economics, stock position and trailing performance on one row"), the
 *    product drawer (on hand, available, velocity, list price, landed cost,
 *    contribution per unit, break-even price, trailing 28 days). "Profit" is
 *    Harlie's word for the contribution figures.
 *  - Reorder quantities, vendor minimums, the calculation: 12 to 18s, the
 *    Canyon Pouch drawer ("Kestrel Goods has a 200 unit minimum, which sets
 *    this quantity"; "Show the working" with the safety stock, reorder point
 *    and order-up-to arithmetic, "floored at the 200 unit MOQ").
 *  - Export: the drawer note "This is a calculation and a CSV export. The
 *    console does not place orders.", "Export order sheet" (Inventory) and
 *    "Export 240 rows" (Catalog). The recording shows CSV only and never runs
 *    an export; "or PDF" is Harlie's wording, kept per lead decision 6 and
 *    reported as not shown.
 *  - Ask: "It matches your question against a fixed set of query shapes and
 *    shows you the query it ran. There is no language model involved."
 *    (41.5 to 46s; eight query shapes).
 *  - During the internship: the internship deck (p. 10) describes the work as
 *    "highly manual and often repeated across spreadsheets and systems" and
 *    "fragmented across multiple disconnected tools".
 * No PlanetArt data, production use, savings or model integration is claimed,
 * and no synthetic figure is presented as a result.
 */

export const MERCHANDISING_PLATFORM = {
  meta: ['Product design and build · Independent project', '2026 · Working prototype on synthetic data'],
  summary: (
    <p>
      After my PlanetArt internship, I built an independent merchandising platform. I brought catalog, stock, sales, and replenishment information into{' '}
      <strong>one workspace</strong>.
    </p>
  ),
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          During my internship, I saw that merchandising decisions meant moving between spreadsheets and separate tools to understand what was selling,
          what was in stock, and what needed to be reordered.
        </p>
      ),
    },
    {
      id: 'built',
      title: 'What I built',
      body: (
        <p>
          The platform <strong>calculates reorder quantities</strong>, accounts for vendor minimum order quantities, and{' '}
          <strong>shows the calculation</strong> before export. I kept Ask to a fixed set of query patterns so every answer shows the query it ran.
        </p>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        In the working prototype, a merchandiser can check the reasoning behind each reorder and export the order sheet as CSV or PDF.
      </p>
    ),
  } satisfies StorySection,
}

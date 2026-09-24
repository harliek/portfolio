import type { StorySection } from '../../components/case/CaseScroll'
import type { TimeMap } from '../../components/media/DemoVideo'

/**
 * Merchandising Platform (CaseScroll `video` media with an edited preview; brief-v8 section 9).
 *
 * The real dashboard recording stays the evidence. Inline, an edited preview at 1.5× plays (VIDEOS
 * `merch-console-preview`, labelled "Edited preview · 1.5× speed" in the player): the Canyon Pouch drawer with its
 * quantity and supplier minimum, Show the working held to be read, Inventory with Export order sheet, then Ask with
 * the query it ran. Expanding plays the complete recording (`merch-console`) at original speed, from the matching
 * moment (PREVIEW_MAP). The cover keeps its "Concept cover" label (the monitor artwork shows a different catalog scale
 * and an AI panel; it is not the interface), and the status line carries the one qualification.
 *
 * Copy: "What I built" is the three decisions of brief-v8 section 9, verbatim; the outcome is headed "Prototype
 * outcome" because it describes what the prototype does, not a measured result. Word counts: opening 33, The
 * problem 30, What I built 45, Prototype outcome 29.
 *
 * Checked against the recording (PlanetArt/Merchandising Dashboard/Dashboard Video.mov, 57.3s; read frame by frame
 * through its site encode merch-console-1600.mp4, the same timeline, because the original is an iCloud placeholder
 * that could not be downloaded here):
 *  - Synthetic data, independent: the footer on every screen reads "Portfolio project. Synthetic catalog, no backend,
 *    nothing leaves your browser."; the header "Merch Console · 240 SKUs · demo data". "After my PlanetArt internship"
 *    is Harlie's statement (brief-v5); the internship ran June to August 2026 (résumé), the recording is from
 *    September 2026.
 *  - One workspace for catalog, stock, sales and replenishment: Overview, Catalog, Inventory, Vendors, Promotions and
 *    Ask in one app; the catalog row and product drawer carry vendor, stock position, trailing sales and unit
 *    economics.
 *  - Explain the quantity: the Canyon Pouch drawer (12s) reads "200 units", "Kestrel Goods has a 200 unit minimum,
 *    which sets this quantity" and "Show the working" (13.7s) opens the arithmetic (lead time demand, safety stock,
 *    reorder point, order-up-to, "rounded up, floored at the 200 unit MOQ = 200 units"). The Lantern Pouch drawer
 *    (50s) also has Show the working (not opened); the Vendors screen lists each vendor's MOQ.
 *  - Keep approval with the merchandiser: the drawer note "This is a calculation and a CSV export. The console does
 *    not place orders." and "Export order sheet" on Inventory (21s). The recording never runs an export.
 *  - Make queries inspectable: Ask (40 to 47s) says "It matches your question against a fixed set of query shapes
 *    and shows you the query it ran. There is no language model involved."; "What is out of stock?" returns the
 *    query (metric, category, vendor, sort, limit) above the answer (45.8s).
 *  - The problem: the internship deck (p. 10) calls the work "highly manual and often repeated across spreadsheets
 *    and systems" and "fragmented across multiple disconnected tools".
 *  - Prototype outcome: the Overview's "Needs a decision" list ("Raise a purchase order for ..."), the drawers'
 *    working, and the order sheet export.
 * Not claimed: PlanetArt data or use, production use, savings, a model connection, PDF export (not in the recording).
 */

/** [previewSeconds, completeSeconds], printed by `node scripts/prepare-media.mjs previews`. */
export const PREVIEW_MAP: TimeMap = [
  [0, 12],
  [2.3, 15.45],
  [5.05, 15.45],
  [5.051, 20.45],
  [5.817, 21.6],
  [6.867, 21.6],
  [6.868, 44],
  [8.467, 46.4],
  [10.017, 46.4],
]

export const MERCHANDISING_PLATFORM = {
  meta: ['Product design and build · Independent project', '2026 · Catalog, inventory, and replenishment'],
  status: 'Working prototype with synthetic data',
  summary: (
    <p>
      After my PlanetArt internship, I built a merchandising platform that brings catalog, stock, sales, and replenishment information into{' '}
      <strong>one workspace</strong>, so a merchandiser can see what to reorder and why.
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
        <>
          <p>
            <strong>Explain the quantity.</strong> Each replenishment recommendation shows its calculation and the supplier minimum.
          </p>
          <p>
            <strong>Keep approval with the merchandiser.</strong> The prototype exports an order sheet for review.
          </p>
          <p>
            <strong>Make queries inspectable.</strong> The Ask feature uses fixed query patterns and shows the query behind each answer.
          </p>
        </>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'outcome',
    title: 'Prototype outcome',
    body: (
      <p>
        In the prototype, a merchandiser can move from the products that need a decision to an order sheet ready for review, with the reasoning behind
        each quantity in view.
      </p>
    ),
  } satisfies StorySection,
}

import type { ScrubMoment } from '../../components/case/ScrollScrubVideo'

/**
 * Merchandising Platform (brief v16). The interface is the hero, the
 * recording is scrubbed by scroll, and the problem is set as type.
 *
 * Facts (checked against the recording, PlanetArt/Merchandising Dashboard/
 * Dashboard Video.mov, 57.3s; its footer reads "Portfolio project. Synthetic
 * catalog, no backend, nothing leaves your browser."):
 *  - Independent prototype with synthetic data, built after the internship
 *    (Harlie, brief v5: "After my PlanetArt internship, I built an
 *    independent merchandising platform using synthetic data."). Brief v16
 *    suggested "PlanetArt / Product Operations" as metadata; the recorded
 *    work is independent, so the metadata keeps "Independent project".
 *  - The problem uses the internship deck's own words (p. 10: "Data and
 *    workflows were fragmented across multiple disconnected tools"; "Key
 *    merchandising work was highly manual and often repeated across
 *    spreadsheets and systems"). Brief v16's "8 TOOLS" and "hundreds of
 *    spreadsheets" appear in no source, so no number is used (Harlie:
 *    "If '8 tools' ... is not verified, write the section without the
 *    number").
 *  - Scrub moments (seconds of the recording): Overview 0 to 6 ("Product,
 *    vendor, inventory, pricing, promotion and sales data joined into one
 *    view"); Canyon Pouch drawer 11.5 and Show the working 13.75 (the
 *    arithmetic, "floored at the 200 unit MOQ", "The console does not place
 *    orders"); Inventory 20.4 ("Export order sheet"); Ask 39.4 to 50 ("shows
 *    you the query it ran. There is no language model involved.").
 * Not claimed: PlanetArt data or use, production use, savings, a model
 * connection, an export being run.
 */
export const MERCH = {
  title: 'Merchandising Platform',
  meta: ['Independent project', 'Product design and build', '2026'],
  status: 'Working prototype with synthetic data',
  summary: (
    <p>
      After my PlanetArt internship, I built a merchandising platform that brings catalog, stock, sales, and replenishment information into{' '}
      <strong>one workspace</strong>, so a merchandiser can see what to reorder and why.
    </p>
  ),
  moments: [
    {
      start: 0,
      end: 6,
      label: 'Product data consolidated',
      note: 'Product, vendor, inventory, pricing, promotion, and sales data in one view.',
      still: 'merch-overview',
    },
    {
      start: 11.5,
      end: 20.4,
      label: 'Replenishment logic exposed',
      note: 'Each quantity shows its calculation and the supplier minimum.',
      still: 'merch-replenish',
    },
    {
      start: 20.4,
      end: 25.5,
      label: 'The merchandiser keeps approval',
      note: 'The console calculates and exports an order sheet. It does not place orders.',
      still: 'merch-inventory',
    },
    {
      start: 39.3,
      end: 56.4,
      label: 'The query behind each answer is shown',
      note: 'Ask matches a question to fixed query shapes. No language model is involved.',
      still: 'merch-ask',
    },
  ] satisfies ScrubMoment[],
  problem: {
    statement: ['Multiple disconnected tools.', 'Repeated spreadsheet work.'],
    body: (
      <p>
        During my internship, I saw that merchandising decisions meant moving between spreadsheets and separate tools to understand what was selling,
        what was in stock, and what needed to be reordered.
      </p>
    ),
    /** Field names the prototype brings together (the fragments that converge). */
    fragments: ['SKU', 'Vendor', 'On hand', 'Units sold', 'Promotion', 'Lead time', 'Landed cost', 'Margin', 'Reorder point', 'Price'],
  },
  built: [
    { title: 'Explain the quantity', body: 'Each replenishment recommendation shows its calculation and the supplier minimum.' },
    { title: 'Keep approval with the merchandiser', body: 'The prototype exports an order sheet for review.' },
    { title: 'Make queries inspectable', body: 'The Ask feature uses fixed query patterns and shows the query behind each answer.' },
  ],
  outcome:
    'In the prototype, a merchandiser can move from the products that need a decision to an order sheet ready for review, with the reasoning behind each quantity in view.',
}

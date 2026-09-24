import type { Section, Visual } from '../../components/case/CaseScroll'

/**
 * Merchandising Platform (CaseScroll). Copy follows the latest brief
 * (section 19). Every statement about the app is read from the recording
 * (PlanetArt/Merchandising Dashboard/Dashboard Video.mov, 57.3s; the site's
 * encode stops at 56.3s):
 *
 *  - Header "Merch Console · 240 SKUs · demo data"; footer on every screen
 *    "Portfolio project. Synthetic catalog, no backend, nothing leaves your
 *    browser."
 *  - 0.3s Overview "Product, vendor, inventory, pricing, promotion and sales
 *    data joined into one view."
 *  - 6.5s Catalog "Every SKU with its vendor, unit economics, stock position
 *    and trailing performance on one row." Filters: All categories, All
 *    vendors, Any stock state, Live only; "240 of 240 SKUs". States Healthy,
 *    At risk, Out of stock. (No filter is applied on screen.)
 *  - 12.0–18.2s Canyon Pouch drawer: Replenishment "200 units", "Kestrel Goods
 *    has a 200 unit minimum, which sets this quantity. The calculated
 *    shortfall is 198 units."; "Show the working" (v 11.71/day, σ 4.15/day,
 *    L 45 days, safety stock 1.645·σ·√L, reorder point 573.0, order up to
 *    1100.1, 1100.1 − 903 − 0 = 197.1, floored at the 200 unit MOQ); "This is
 *    a calculation and a CSV export. The console does not place orders.";
 *    stock position, "Chance of running out before a restock arrives", unit
 *    economics (contribution, break-even price), trailing 28 days.
 *  - 20.4s Inventory "Continuous-review planning. Safety stock is sized for a
 *    95% service level. Rows are ranked by margin at risk rather than by
 *    remaining units."; Export order sheet; Needs replenishment ("At or below
 *    reorder point"). Lantern Pouch's order (1235) matches its drawer at
 *    ~50s, so the list uses the same calculation. The export is never run.
 *  - 41.5s Ask "What this can answer": eight query shapes (replenishment,
 *    overstock, margin thresholds, top sellers, cost increases, catalog
 *    hygiene, active promotions, slow movers). 46.0s: "It matches your
 *    question against a fixed set of query shapes and shows you the query it
 *    ran. There is no language model involved."
 *  - 28–31s Vendors (scorecards), 32–39s Promotions.
 *
 * Independent work: the internship is mentioned only as the context in which
 * Harlie saw the problem (deck p. 10: manual work "repeated across
 * spreadsheets and systems"; workflows "fragmented across multiple
 * disconnected tools"). No PlanetArt data, savings, production use or model
 * integration is claimed. Synthetic figures are not presented as results.
 *
 * Highlights are percentages of each crop (src/content/crops/merchandising-platform.ts).
 */

export const MERCHANDISING_PLATFORM = {
  note: 'An independent prototype using synthetic data, without a production backend.',
  situation: (
    <p>
      The prototype brings catalog status, product economics, and replenishment calculations into one workspace. I built it after my PlanetArt internship,
      where I had seen <strong>merchandising information split across spreadsheets and separate tools</strong>.
    </p>
  ),
  opening: {
    kind: 'image',
    image: 'mp-overview',
    caption: 'The Merch Console overview joins product, vendor, inventory, pricing, promotion, and sales data in one view.',
  } satisfies Visual,
  sections: [
    {
      id: 'premise',
      title: 'Product premise',
      blocks: [
        {
          id: 'premise-text',
          body: (
            <p>
              A reorder decision depends on several facts at once: stock on hand, the rate of sales, landed cost, and the vendor’s lead time and minimum
              order. The prototype tests whether one workspace can show these together and <strong>explain how each suggested quantity is calculated</strong>.
            </p>
          ),
        },
      ],
    },
    {
      id: 'decisions',
      title: 'Design decisions',
      blocks: [
        {
          id: 'catalog',
          title: 'Catalog and inventory',
          body: (
            <p>
              The catalog gives each of the 240 products <strong>one row</strong> with its vendor, listing status, price, margin, 28-day sales, stock on hand,
              days of cover, and a stock state such as Healthy, At risk, or Out of stock. Filters narrow the list by category, vendor, and stock state.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'mp-catalog',
            caption: 'The catalog, with one row per product. Everyday Notebook is out of stock.',
            highlight: { x: 2.1, y: 35.6, w: 96.4, h: 7.8 },
          },
        },
        {
          id: 'economics',
          title: 'Product economics and stock context',
          body: (
            <p>
              Selecting a product opens its full record. For Canyon Pouch, the record shows the stock position, the chance of running out before a restock
              arrives, and unit economics from list price and landed cost to <strong>contribution per unit</strong> and break-even price.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'mp-economics',
            caption: 'Part of the Canyon Pouch record: the stock-out estimate and unit economics.',
            highlight: { x: 1.7, y: 83.9, w: 96.5, h: 7.7 },
          },
        },
        {
          id: 'calculation',
          title: 'Replenishment calculation',
          body: (
            <p>
              The record also suggests an order quantity and can show its working. The calculation combines the 28-day sales rate, its daily variation, and the
              vendor’s 45-day lead time, with safety stock for a 95% service level. For Canyon Pouch the shortfall is 198 units, so{' '}
              <strong>the vendor’s 200-unit minimum sets the order at 200</strong>.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'mp-working',
            caption: 'The working behind the Canyon Pouch order quantity.',
            highlight: { x: 6.9, y: 58.8, w: 77.2, h: 20.3 },
          },
        },
        {
          id: 'export',
          title: 'Replenishment list and export',
          body: (
            <p>
              The Inventory view lists every product at or below its reorder point with a suggested order, ranked by margin at risk, and offers{' '}
              <strong>Export order sheet</strong>. The prototype describes its output as “a calculation and a CSV export” and states that “the console does not
              place orders.”
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'mp-inventory',
            caption: 'The Inventory view, with the products that need replenishment and Export order sheet.',
            highlight: { x: 85.1, y: 2.5, w: 13.8, h: 5.4 },
          },
        },
        {
          id: 'ask',
          title: 'Ask',
          body: (
            <p>
              The Ask screen takes a typed question, such as “What is out of stock?”, and <strong>matches it to one of eight supported query patterns</strong>,
              including replenishment, overstock, and margin thresholds. It shows the query it ran above the results and does not use a language model.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'mp-ask',
            caption: 'The Ask screen with the question “What is out of stock?” and the query it ran.',
            highlight: { x: 1.9, y: 15.7, w: 89.4, h: 19 },
          },
        },
      ],
    },
  ] satisfies Section[],
  results: (
    <p>
      The recording demonstrates a working prototype: a catalog of 240 products, product records with unit economics and stock-out estimates, replenishment
      quantities that <strong>show their working and respect vendor minimums</strong>, and a question screen that runs fixed queries. It also includes vendor
      scorecards and a promotions view.
    </p>
  ),
}

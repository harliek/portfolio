import type { VisualStep } from '../../components/case/StickyVisual'
import type { CropSpec } from '../../components/pages/merchandising-platform/EvidenceCrop'

/**
 * Merchandising Platform (brief Page 2). Context, Problem and Results use the
 * brief's exact text. Every other sentence was checked against the recording
 * (PlanetArt/Merchandising Dashboard/Dashboard Video.mov, 57.3s):
 *
 *  - App header "Merch Console · 240 SKUs · demo data"; footer on every
 *    screen "Portfolio project. Synthetic catalog, no backend, nothing leaves
 *    your browser."
 *  - 0.3s Overview "Product, vendor, inventory, pricing, promotion and sales
 *    data joined into one view."
 *  - 6.0s Catalog header row Product, Vendor, Status, Price, Margin, 28d
 *    units, 28d revenue, On hand, Cover, State; filters All categories, All
 *    vendors, Any stock state (the 8.5s still used here shows the rows only;
 *    the recording never applies a filter or runs the CSV export, so the copy
 *    only says the controls exist and quotes the drawer's own statement).
 *  - 12.0s Canyon Pouch drawer "Kestrel Goods has a 200 unit minimum, which
 *    sets this quantity", "Show the working", stock position, "Vendor lead
 *    time, quoted 45 days", "Chance of running out before a restock arrives",
 *    "This is a calculation and a CSV export. The console does not place
 *    orders."
 *  - 46.0s Ask "It matches your question against a fixed set of query shapes
 *    and shows you the query it ran. There is no language model involved."
 *    Result columns include Order.
 *  - 53.9s Lantern Pouch drawer, Adjust "Edits apply on top of the generated
 *    dataset and are stored in this browser."
 *
 * Independent work. Never merged with internship ownership or results; no
 * savings, production use or model integration is claimed.
 */
export const MERCHANDISING_PLATFORM = {
  subtitle: 'Independent application prototype',
  description: (
    <p>
      Merch Console is an application prototype for reviewing merchandising information in one place. It runs in the browser on a synthetic catalog of
      240 products, with no backend.
    </p>
  ),
  note: 'Independent work with synthetic data, separate from PlanetArt’s internal systems.',
  summary: <p>The result is an interactive prototype of the proposed workflow, with a recorded walkthrough.</p>,
  heroCaption: 'The overview screen joins product, vendor, inventory, pricing, promotion, and sales data in one view.',
  context: (
    <p>
      I developed this independent prototype after exploring merchandising workflows during my PlanetArt internship. It uses synthetic data and is
      separate from PlanetArt’s internal systems.
    </p>
  ),
  problem: <p>The prototype explores how product, pricing, inventory, and vendor information can be reviewed in one workspace.</p>,
  /*
   * Highlights are measured on the 1600px derivatives (1600×809), in percent
   * of the frame, with a few pixels of breathing room around each region.
   */
  steps: [
    {
      id: 'catalog',
      title: 'Catalog overview',
      body: (
        <p>
          The catalog lists every product on one row with its vendor, price, margin, 28-day sales, stock on hand, days of cover, and a stock state
          such as Healthy or At risk. The list has filters for category, vendor, and stock state.
        </p>
      ),
      image: 'merch-catalog',
      // The Foundry Cap row (rules at y 290 and 348; table x 270 to 1565).
      highlight: { x: 16.5, y: 35.4, w: 81.6, h: 8.1 },
      dim: true,
      caption: 'One catalog row, for a product marked At risk.',
    },
    {
      id: 'detail',
      title: 'Product and inventory detail',
      body: (
        <>
          <p>
            Selecting a product opens its full record. For Canyon Pouch, the drawer suggests ordering 200 units and explains that the vendor’s 200
            unit minimum sets the quantity. A “Show the working” control reveals the calculation, with the stock position and quoted lead time
            below it.
          </p>
          <p>The drawer states that it offers a calculation and a CSV export, and that the console does not place orders.</p>
        </>
      ),
      image: 'merch-replenish',
      // The Replenishment card (x 1052 to 1582, y 121 to 363).
      highlight: { x: 65.3, y: 14.3, w: 33.9, h: 31.1 },
      dim: true,
      caption: 'The replenishment calculation for one product. The console does not place orders.',
    },
    {
      id: 'review',
      title: 'Review and decision',
      body: (
        <>
          <p>
            The Ask screen matches a typed question, such as “What is out of stock?”, to one of a fixed set of query shapes. It shows the query it ran
            above the matching products, each with an order quantity.
          </p>
          <p>The screen states that no language model is involved.</p>
        </>
      ),
      image: 'merch-ask',
      // The query it ran (x 270 to 1565, y 313 to 378).
      highlight: { x: 16.5, y: 37.9, w: 81.6, h: 9.1 },
      dim: true,
      caption: 'The query behind a typed question, shown above its results. No language model is involved.',
    },
  ] satisfies VisualStep[],
  results: (
    <>
      <p>
        The result is an interactive prototype for reviewing merchandising information. It demonstrates the proposed workflow using synthetic data.
      </p>
      <p>The app has no backend. Edits to prices and listing status are stored in the browser.</p>
    </>
  ),
  /** A readable crop of the 53.9s drawer (merch-drawer), x 1036 to 1590, y 617 to 809 of 1600×809. */
  resultsCrop: {
    image: 'merch-drawer',
    region: { x: 64.75, y: 76.27, w: 34.63, h: 23.73 },
    alt: 'The Adjust section of a product drawer in the synthetic demo, with a price field, a Save price button, the listing states live, paused, draft and discontinued, and a note that edits are stored in this browser.',
    caption: 'The Adjust section of a product drawer. Edits apply on top of the generated data.',
  } satisfies CropSpec,
  related: 'The UK market research and storefront prototype from my PlanetArt internship.',
}

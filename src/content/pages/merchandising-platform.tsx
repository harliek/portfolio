
/**
 * Merchandising Platform (brief v19; copy from Harlie's editorial pass,
 * v23): a compact page. The introduction and three sections on the left;
 * the recording fixed beside them, its time following the scroll through
 * each section's segment (the Overview and catalog, the Canyon Pouch panel
 * and its working, Inventory with its order sheet); one scope note.
 *
 * Facts (the recording, PlanetArt/Merchandising Dashboard/Dashboard
 * Video.mov; footer: "Portfolio project. Synthetic catalog, no backend,
 * nothing leaves your browser."): an independent prototype with synthetic
 * data, built during the internship (Harlie, v27); Overview 0 to 6s;
 * the Canyon Pouch panel with its working 11.5 to 20.4s ("The console does
 * not place orders."); Inventory with Export order sheet 20.4 to 25.5s (never
 * clicked); Ask with "There is no language model involved" at 39.4s.
 * Not claimed: PlanetArt data or use, real orders, measured results.
 */
export const MERCH = {
  title: 'Merchandising Platform',
  meta: ['Product design and build', 'Independent project – 2026'],
  lede: (
    <p>
      During my PlanetArt internship, I designed and built an independent merchandising prototype that consolidates catalog, inventory, sales, and vendor
      data to support replenishment decisions.
    </p>
  ),
  /** The recording's segment for each decision (seconds), and one still per step for reduced motion. */
  segments: [
    [0, 11.5],
    [11.5, 20.4],
    [20.4, 25.5],
  ] as const,
  stills: [0.5, 15.2, 21.6],
  /** Harlie's editorial pass (v23): descriptive headings and one scope note. */
  decisions: [
    {
      title: 'Unified product data',
      text: 'Each product record combines pricing, margin, inventory, vendor information, and sales. The overview prioritizes pending decisions by severity and financial exposure.',
    },
    {
      title: 'Replenishment calculations',
      text: 'Suggested order quantities include the underlying sales velocity, demand variability, supplier lead time, safety stock, and reorder point. Supplier minimums are included in the calculation.',
    },
    {
      title: 'Review and order preparation',
      text: 'Products at or below their reorder point are ranked by margin at risk. Merchandisers can export an order sheet for review; the prototype does not place orders.',
    },
  ],
}

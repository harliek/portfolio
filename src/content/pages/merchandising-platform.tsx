
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
      During my PlanetArt internship, I designed and built an independent prototype to help merchandisers decide what to reorder and how much.
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
      title: 'Bringing product data together',
      text: 'I brought pricing, margin, inventory, vendor information, and sales into one product record. The overview prioritizes decisions by urgency and financial exposure.',
    },
    {
      title: 'Explaining order quantities',
      text: 'Each suggested order quantity shows the calculation behind it, including sales patterns, supplier lead times, safety stock, and minimum order quantities.',
    },
    {
      title: 'Preparing orders for review',
      text: 'Products due for replenishment are ranked by margin at risk. Merchandisers can export an order sheet for review; the prototype does not place orders.',
    },
  ],
}

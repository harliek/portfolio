
/**
 * Merchandising Dashboard, named Merchandising Platform until 2026-09-26 (brief v19; copy from Harlie's editorial pass,
 * v23): a compact page. The introduction and three sections on the left;
 * the recording fixed beside them, its time following the scroll through
 * each section's segment (the Overview and catalog, the Canyon Pouch panel
 * and its working, Inventory with its order sheet).
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
  title: 'Merchandising Dashboard',
  meta: ['Product design and build', 'Independent project · 2026'],
  lede: (
    <p>
      During my PlanetArt internship, I designed and built an independent prototype to help merchandisers decide what to reorder and how much.
    </p>
  ),
  /** The recording's segment for each decision (seconds), and one still per step for reduced motion. */
  // The catalog's product records to 11.42s, the calculation panel opening at 11.46s, the reorder page from 20.42s,
  // Vendors from 25.54s. Each segment starts on its own first frame and ends before the next one's.
  segments: [
    [0, 11.45],
    [11.46, 20.4],
    [20.44, 25.5],
  ] as const,
  stills: [0.5, 15.2, 21.6],
  /** Harlie's editorial pass (v23): descriptive headings and one scope note. */
  decisions: [
    {
      title: 'Product information',
      text: 'I brought pricing, margin, inventory, sales, and vendor information together in each product record.',
    },
    {
      title: 'Reorder calculations',
      text: 'Suggested quantities account for sales velocity, demand variability, supplier lead times, safety stock, and minimum order quantities. The prototype exposes the calculation for review.',
    },
    {
      title: 'Order preparation',
      text: 'Products at or below their reorder point are ranked by margin at risk. Merchandisers can export an order sheet; the prototype does not place orders.',
    },
  ],
}


/**
 * Merchandising Dashboard, named Merchandising Platform until 2026-09-26 (brief v19; copy from Harlie's editorial pass,
 * v23): a compact page. The introduction and three sections on the left; the recording fixed beside them, playing at
 * 1.5 times its speed within the current section's segment (the Overview and catalog, the Canyon Pouch panel and its
 * working, both on a loop; then Inventory's replenishment view, played once and held).
 *
 * Facts (the recording, PlanetArt/Merchandising Dashboard/Dashboard Video.mov; footer: "Portfolio project. Synthetic
 * catalog, no backend, nothing leaves your browser."): an independent prototype with synthetic data, built outside
 * work (the project's README) from the centralized tool concept Harlie presented to engineering at PlanetArt. When it
 * was built is not confirmed (the v27 brief said during the internship; the repository's first commit is later), so
 * the lede does not say; Overview 0 to 6s; the Canyon Pouch panel with its working 11.5 to 20.4s ("The console does
 * not place orders."); Inventory from 20.4s, its Needs replenishment view (51 SKUs, 15,064 suggested units, $353,249
 * order cost, rows ranked by margin at risk, Export order sheet never clicked) until the Over 120 days cover filter is
 * clicked at about 22.15s (0 units, $0, every row Overstocked); Ask with "There is no language model involved" at
 * 39.4s. Not claimed: PlanetArt data or use, real orders, measured results.
 *
 * Harlie's QA pass, 2026-09-28: the order preparation step's loop ran on to 25.5s, so for two thirds of it the page
 * showed the overstock view (0 units, $0) beside "Products at or below their reorder point are ranked by margin at
 * risk"; it now ends at 21.5s, before the pointer reaches the filter, and holds there. The lede says the data is
 * synthetic, as the recording's own footer does.
 *
 * Harlie's brief of 2026-09-28: the lede gives the origin and the purpose; each section states only logic the dashboard
 * does not show (the formula itself is on screen in the calculation drawer). The three headings stay, so the three
 * segments still line up. "It does not place orders" moves out of the last sentence into a small note under it
 * (StoryStep.note), so the page does not end on a defensive qualification.
 */
export const MERCH = {
  title: 'Merchandising Dashboard',
  meta: ['Product design and build', 'Independent project · 2026'],
  lede: (
    <p>
      I built this prototype outside work, on synthetic data, from a concept I presented to engineering at PlanetArt. It helps merchandisers decide what to reorder and how much.
    </p>
  ),
  /** The recording's segment for each decision (seconds), and one still per step for reduced motion. */
  // The catalog's product records to 11.42s, the calculation panel opening at 11.46s, the reorder page from 20.42s
  // (its replenishment view held at 21.5s, the pointer still above the filters). Each segment starts on its own first
  // frame and ends before the next one's.
  segments: [
    [0, 11.45],
    [11.46, 20.4],
    [20.44, 21.5, 'hold'],
  ] as const,
  stills: [0.5, 15.2, 21.6],
  /** Descriptive headings (Harlie's editorial pass, v23); the reasoning behind each and one small note (2026-09-28). */
  decisions: [
    {
      title: 'Product information',
      text: 'Product, vendor, stock, and sales data share one view, not a tool per question.',
    },
    {
      title: 'Reorder calculations',
      text: 'Each order covers one more lead time of demand beyond the reorder point, so a delivery doesn’t immediately trigger another.',
    },
    {
      title: 'Order preparation',
      text: 'Ranking by margin at risk, not units left, puts fast sellers ahead of cheap items that only look urgent.',
      // The prototype's scope, set small under the step (the drawer's own note says both).
      note: 'Exports to CSV. It does not place orders.',
    },
  ],
}

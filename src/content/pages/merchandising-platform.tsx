
/**
 * Merchandising Platform (brief v19): a compact page. The introduction and
 * three decisions on the left; the recording fixed beside them, its time
 * following the scroll through each decision's segment (the Overview and
 * catalog, the Canyon Pouch panel and its working, Inventory with its order
 * sheet); one scope line.
 *
 * Facts (the recording, PlanetArt/Merchandising Dashboard/Dashboard
 * Video.mov; footer: "Portfolio project. Synthetic catalog, no backend,
 * nothing leaves your browser."): an independent prototype with synthetic
 * data, built after the internship (Harlie, brief v5); Overview 0 to 6s;
 * the Canyon Pouch panel with its working 11.5 to 20.4s ("The console does
 * not place orders."); Inventory with Export order sheet 20.4 to 25.5s (never
 * clicked); Ask with "There is no language model involved" at 39.4s.
 * Not claimed: PlanetArt data or use, real orders, measured results.
 */
export const MERCH = {
  title: 'Merchandising Platform',
  meta: ['Independent project', 'Product design and build', '2026'],
  lede: (
    <p>
      After my PlanetArt internship, I built an independent prototype that brings catalog, stock, sales, and replenishment information into one workspace,
      so a merchandiser can see what to reorder and why.
    </p>
  ),
  status: 'Working prototype with synthetic data. It does not place orders.',
  /** The recording's segment for each decision (seconds), and one still per step for reduced motion. */
  segments: [
    [0, 11.5],
    [11.5, 20.4],
    [20.4, 25.5],
  ] as const,
  stills: [0.5, 15.2, 21.6],
  decisions: [
    {
      title: 'Bring information together',
      text: 'Each catalog row joins product, vendor, stock, and trailing sales, and a product’s panel adds its unit economics, so a reorder can be judged in one place.',
    },
    {
      title: 'Make recommendations understandable',
      text: 'Every suggested quantity shows its working, from sales velocity and lead time to the supplier minimum that set it.',
    },
    {
      title: 'Keep the user in control',
      text: 'The console ranks what needs replenishment and exports an order sheet for review. Deciding and ordering stay with the merchandiser.',
    },
  ],
  note: 'Synthetic catalog. The Ask screen in the recording matches questions to fixed query patterns, with no language model involved.',
}

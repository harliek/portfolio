import type { Chapter } from '../../components/case/ChapterDemo'

/**
 * Merchandising Platform (brief v18): a compact page. The introduction, the
 * recording as a walkthrough beside it (its poster and first frame are the
 * Overview, the same view as the homepage tile), three decisions, one scope
 * line.
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
  chapters: [
    { label: 'Bring information together', caption: 'The overview and catalog put each product’s vendor, stock, and recent sales on one row.', start: 0, end: 11.5, still: 0.5 },
    { label: 'Explain the quantity', caption: 'A product panel suggests 200 units and opens the working behind that number.', start: 11.5, end: 20.4, still: 15.2 },
    { label: 'Keep the merchandiser in control', caption: 'Inventory ranks what needs replenishment and ends in an order sheet to review.', start: 20.4, end: 25.5, still: 21.6 },
  ] satisfies Chapter[],
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

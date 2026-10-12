
/**
 * Merchandising Dashboard, named Merchandising Platform until 2026-09-26 (brief v19; copy from Harlie's editorial pass,
 * v23): a compact page. The introduction and three sections on the left; the recording fixed beside them, playing at
 * 1.5 times its speed within the current section's segment (the Overview and catalog, the Canyon Pouch panel and its
 * working, both on a loop; then Inventory's replenishment view, played once and held).
 *
 * Facts (the recording, PlanetArt/Merchandising Dashboard/Dashboard Video.mov; footer: "Portfolio project. Synthetic
 * catalog, no backend, nothing leaves your browser."): an independent prototype with synthetic data (Harlie's copy
 * brief of 2026-09-28: developed "later", after the internship; v27 had said during it); Overview 0 to 6s; the Canyon Pouch panel with its working 11.5 to 20.4s ("The console does
 * not place orders."); Inventory from 20.4s, its Needs replenishment view (51 SKUs, 15,064 suggested units, $353,249
 * order cost, rows ranked by margin at risk, Export order sheet never clicked) until the Over 120 days cover filter is
 * clicked at about 22.15s (0 units, $0, every row Overstocked); Ask with "There is no language model involved" at
 * 39.4s. Not claimed: PlanetArt data or use, real orders, measured results.
 *
 * Harlie's QA pass, 2026-09-28: the order preparation step's loop ran on to 25.5s, so for two thirds of it the page
 * showed the overstock view (0 units, $0) beside "Products at or below their reorder point are ranked by margin at
 * risk"; it now ends at 21.5s, before the pointer reaches the filter, and holds there. The recording's own footer
 * says the data is synthetic.
 */
export const MERCH = {
  title: 'Merchandising Platform',
  /**
   * The work, then the company and the year (Harlie's request, 2026-10-12: PlanetArt, not independent; earlier the same
   * day "Independent Product Development · 2026", and before that the internship role, then "PlanetArt · 2026").
   */
  meta: ['Product Development', 'PlanetArt · 2026'],
  // Harlie's copy brief of 2026-09-29, verbatim. The internship half: deck pp.10–12 (workflows "fragmented across
  // multiple disconnected tools"; the centralized workspace concept). "Eight tools and hundreds of spreadsheets" and
  // the security feedback stay out: no project document records them.
  lede: (
    <p>
      During my internship at PlanetArt, I identified an opportunity to improve how merchandising teams access product information and make inventory decisions. I subsequently designed and built a centralized merchandising platform prototype in React.
    </p>
  ),
  /** The recording's segment for each decision (seconds), and one still per step for reduced motion. */
  // Four sections (Harlie's text of 2026-09-30): the overview and its "Needs a decision" list to 5.95s (Operational
  // problem), the catalog's product records from 6.0s, where the catalog opens, to 11.42s (Data model), the calculation
  // panel opening at 11.46s (Decision logic), the reorder page from 20.42s (its replenishment view held at 21.5s, the
  // pointer still above the filters; Prioritization). Each segment starts on its own first frame and ends before the
  // next one's.
  segments: [
    [0, 5.95],
    [6.0, 11.45],
    [11.46, 20.4],
    [20.44, 21.5, 'hold'],
  ] as const,
  stills: [0.5, 8.0, 15.2, 21.6],
  /**
   * Harlie's text of 2026-10-12, verbatim, in four sections (before, the text of 2026-09-30 (it supersedes the copy brief of 2026-09-29: Product
   * information; Replenishment), each with its own recording segment. Checked against the prototype's source
   * (~/Documents/merch-console):
   * - the record (ProductDrawer.tsx): list price, landed cost, fulfilment, channel fee, contribution, stock position,
   *   28-day sales and the vendor's lead time and minimum order in one panel;
   * - the calculation (src/lib/inventory.ts assess()): 28-day sales velocity and its variation, available stock (on
   *   hand less committed), units on order, the vendor's quoted lead time and minimum order, plus a safety buffer; the
   *   panel's "Show the working" lists each input and step before any export;
   * - the ranking (Inventory.tsx, the Needs replenishment view): margin at risk = stockout probability × daily sales ×
   *   lead time × contribution per unit (price less landed cost, fulfilment and channel fee; margin.ts), so an
   *   estimated contribution margin, not profit.
   * Removed per the brief: the result summary, the extended reorder explanation, the backend and order-placement
   * statements and the Ask explanation (the meta says independent prototype and synthetic data).
   */
  decisions: [
    {
      title: 'Operational problem',
      text: 'Product information was fragmented across catalog, supplier, inventory, and sales systems, making it difficult to evaluate product status and prioritize decisions.',
    },
    {
      title: 'Data model',
      text: 'I designed a centralized system connecting product information, supplier requirements, inventory, sales history, and promotional performance through a shared SKU identifier.',
    },
    {
      title: 'Decision logic',
      text: 'I developed inventory recommendations based on sales patterns, stock levels, and supplier constraints, with calculations visible for review.',
    },
    {
      title: 'Prioritization',
      text: 'I designed a ranking system based on estimated contribution margin at risk, identifying products with the greatest potential financial impact from inventory shortages. I presented the prototype to PlanetArt’s product and engineering teams.',
    },
  ],
}

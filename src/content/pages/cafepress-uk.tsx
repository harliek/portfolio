/**
 * CafePress UK (brief v19; copy from Harlie's editorial pass, v23, and the
 * September 26 copy): a compact page. The introduction, then three sections,
 * each beside one of Harlie's storefront prototype pictures (PlanetArt/cafepress
 * uk): the homepage first, then the drinkware page, then the page with the
 * assistant panel. No captions (Harlie's request).
 *
 * Sources: the internship deck (PlanetArt/planetart presentation.pdf, "CafePress UK B2B Launch", 08/20/2026), by the
 * PDF's own page numbers (the printed slide numbers differ): p.3, the feasibility of a UK B2B launch, assessed through
 * competitors, vendors and assortment, the site experience, and operational readiness; p.4, competitor sites were
 * category-led, featured recognizable brands and eco-friendly products, and often mirrored US-style merchandising;
 * p.5, UK vendors including PF Concept and Ralawise, and the takeaway, adapt the existing B2B model "with targeted
 * localization"; p.7, UK product terms; p.8, the storefront prototype and the working "CPBUK TOP NAV" category sheet,
 * with its "Natural or Recycled – Filter" note; p.9, the three recommendations (adapt the US model, localize the
 * assortment selectively toward UK-relevant brands and eco-friendly products, and strengthen product data, vendor
 * coordination and merchandising workflows); p.10, merchandising work was highly manual and repeated across
 * spreadsheets. Recommendations and a prototype only; nothing was launched.
 *
 * Harlie's brief of 2026-09-28: the lede carries the question and the central recommendation, the top of the page's
 * hierarchy; the three findings support it, each in its own shape (a cause then a decision, an action, a
 * recommendation with its context), and name only what shaped the recommendation. Trivial localization (prices in
 * pounds) is gone. The third heading takes the deck's own term, "Operational readiness".
 */
export const CAFEPRESS = {
  title: 'CafePress UK',
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt · 2026'],
  lede: (
    <p>
      I evaluated whether CafePress’s US B2B model could be adapted for the UK, and recommended adapting it with targeted localization, since UK competitors often mirrored US-style merchandising.
    </p>
  ),
  /** Three supporting findings, in the September 26 order (Harlie's brief, 2026-09-28: the criteria, not a list). */
  findings: [
    {
      title: 'Suppliers and assortment',
      text: 'UK-relevant brands and eco-friendly products recurred across competitors, so I weighted the proposed assortment toward both.',
    },
    {
      title: 'Storefront localization',
      text: 'I drafted UK category navigation against competitors’ menus, in British product terms, with a filter for natural or recycled products.',
    },
    {
      title: 'Operational readiness',
      text: 'Before any UK launch, I recommended strengthening product data, vendor coordination, and merchandising workflows, work that was still largely manual.',
    },
  ],
}

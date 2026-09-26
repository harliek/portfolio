/**
 * CafePress UK (brief v19; copy from Harlie's editorial pass, v23, and the
 * September 26 copy): a compact page. The introduction, then three sections,
 * each beside one of Harlie's storefront prototype pictures (PlanetArt/cafepress
 * uk): the homepage first, then the drinkware page, then the page with the
 * assistant panel. No captions (Harlie's request).
 *
 * Sources: the internship deck (PlanetArt/planetart presentation.pdf,
 * "CafePress UK B2B Launch", 08/20/2026) and the storefront prototype
 * (PlanetArt/cafepress uk/uk web.png). p.4: the feasibility of a UK B2B
 * launch, assessed through competitors, vendors and assortment, the site
 * experience, and operational readiness; p.5: competitor sites were
 * category-led, featured recognizable brands and eco-friendly products, and
 * often mirrored US-style merchandising; p.6: UK vendors including PF
 * Concept and Ralawise; p.7: UK wording and pricing in GBP; p.8 and p.9:
 * operational readiness, manual and repeated spreadsheet work. The
 * storefront shows Basket, a UK phone number with office hours, fast UK
 * delivery and UK-based support. Recommendations and a prototype only;
 * nothing was launched.
 */
export const CAFEPRESS = {
  title: 'CafePress UK',
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt · 2026'],
  lede: (
    <p>
      At PlanetArt, I assessed whether CafePress’s US B2B model could be adapted for the UK.
    </p>
  ),
  /** Harlie's wording (the September 26 copy, in its order). */
  findings: [
    {
      title: 'Suppliers and assortment',
      text: 'I evaluated UK suppliers and identified potential launch products based on competitor assortments, recognizable brands, and eco-friendly options.',
    },
    {
      title: 'Storefront localization',
      text: 'I recommended UK product terminology and prices in pounds, and explored local contact and delivery messaging in an early storefront prototype.',
    },
    {
      title: 'Operational recommendations',
      text: 'I identified changes to product data, vendor coordination, and merchandising workflows needed to support the proposed storefront.',
    },
  ],
}

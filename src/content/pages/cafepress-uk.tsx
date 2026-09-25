/**
 * CafePress UK (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and three short sections, with the
 * storefront pictures fixed beside them, crossfading with each section (the
 * internship's storefront prototype, then two later images, each captioned
 * so the later ones are not presented as project work); one scope note.
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
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt – 2026'],
  lede: (
    <p>
      At PlanetArt, I assessed the feasibility of a UK B2B storefront through competitor research, vendor evaluation, assortment planning, and operational
      review. I also developed early storefront prototype elements.
    </p>
  ),
  /** Harlie's editorial pass (v23): descriptive headings, a short supporting list, one scope note. */
  findings: [
    {
      title: 'Localization',
      text: 'I identified changes to terminology, pricing, and service information for a UK audience. Recommendations included UK product terminology and prices in pounds; prototype elements explored local contact and delivery messaging.',
    },
    {
      title: 'Vendor and assortment research',
      text: 'I evaluated UK suppliers, including PF Concept and Ralawise, and selected potential launch products based on competitor assortments, recognizable brands, and eco-friendly options.',
    },
    {
      title: 'Launch recommendations',
      text: 'I recommended adapting the existing US B2B structure for the UK market, supported by localized product data, vendor coordination, and merchandising workflows.',
    },
  ],
}

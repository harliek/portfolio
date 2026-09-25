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
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt · 2026'],
  lede: (
    <p>
      At PlanetArt, I assessed whether CafePress’s US B2B model could be adapted for the UK through market research, operational review, and early storefront prototyping.
    </p>
  ),
  /** Harlie's editorial pass (v23): descriptive headings, a short supporting list, one scope note. */
  findings: [
    {
      title: 'Adapting the storefront',
      text: 'I recommended UK product terminology and prices in pounds, and explored local contact and delivery information in the prototype.',
    },
    {
      title: 'Evaluating suppliers and products',
      text: 'I evaluated UK suppliers and identified potential launch products based on competitor ranges, recognizable brands, and eco-friendly options.',
    },
    {
      title: 'Defining launch requirements',
      text: 'My recommendations covered the product data, vendor coordination, and merchandising workflows needed to support a UK storefront.',
    },
  ],
}

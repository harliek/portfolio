/**
 * CafePress UK (brief v19): a compact page. The research question and three
 * short findings, with the storefront prototype fixed beside them, moving to
 * the part each finding is about (the header's UK details, the products, the
 * category row).
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
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt', 'June to August 2026'],
  lede: (
    <p>
      Could CafePress bring its B2B storefront to the UK? I researched competitors, UK vendors and assortment, the site experience, and operational
      readiness, then coded a localized storefront prototype from the findings.
    </p>
  ),
  status: 'Research, recommendations, and a storefront prototype for a potential UK launch. Nothing was launched.',
  caption: 'The storefront prototype, coded from the research.',
  /** Where each finding sits in the storefront (source pixels; crops/cafepress-uk.ts): the header's UK details, the products, the category row. */
  regions: [
    { x: 960, y: 10, w: 712, h: 401 },
    { x: 776, y: 228, w: 896, h: 444 },
    { x: 0, y: 0, w: 1040, h: 585 },
  ],
  findings: [
    {
      title: 'Localization',
      text: 'Small differences in wording and presentation matter to UK buyers. The prototype uses UK terms such as Basket, a UK phone number with office hours, and messages about fast UK delivery and UK-based support. I also recommended showing prices in pounds.',
    },
    {
      title: 'Assortment',
      text: 'Competitors featured recognizable brands and eco-friendly products. Using UK vendors including PF Concept and Ralawise, I curated potential launch items around UK-relevant brands, eco-friendly options, and common B2B categories.',
    },
    {
      title: 'Operations',
      text: 'Competitor sites were category-led and close to the US model, so I recommended adapting the existing structure and preparing product data, vendor coordination, and merchandising workflows before any launch.',
    },
  ],
}

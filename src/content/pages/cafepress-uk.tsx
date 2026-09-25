import type { ImageId } from '../media'

/**
 * CafePress UK (brief v17): research turned into visible choices. Hero, the
 * launch question, research-led decisions on an annotated storefront, the
 * localized storefront, the assortment considered, and the recommendations
 * with their status.
 *
 * Sources: the internship deck (PlanetArt/planetart presentation.pdf,
 * "CafePress UK B2B Launch", 08/20/2026) and the storefront prototype
 * (PlanetArt/cafepress uk/uk web.png).
 *  - p.4: "To assess the feasibility of a UK B2B launch, I focused on four
 *    areas": competitive landscape; vendor and product assortment;
 *    merchandising and site experience; operational readiness.
 *  - p.5: sites "clear, category-led, and easy to browse"; recognizable
 *    brands featured; eco-friendly products "a visible and recurring
 *    product theme"; UK offerings "often mirrored US-style merchandising".
 *  - p.6: "Using UK vendors including PF Concept and Ralawise, I curated a
 *    broad assortment of potential launch items across key categories."
 *  - p.7: Color to Colour, Personalized to Personalised, Pants to Trousers
 *    (and others); pricing in GBP; a cooler, wetter climate (jackets and
 *    umbrellas); "Potential UK-relevant ideas: Outerwear and rainy-day
 *    essentials · Eco-friendly workplace kits · Football event and team
 *    celebration merchandise · Branded drinkware and desk bundles".
 *  - p.8: the three recommendations; p.9: manual, repeated spreadsheet work.
 *  - The storefront: eight categories, Basket, a UK phone number with
 *    office hours, Fast UK Delivery, Volume Discounts, UK-Based Support; no
 *    prices.
 * The deck does not record which supplier would carry which item or what
 * constrained each, so the assortment table names the vendor base and says
 * so; nothing is invented. No team response is documented.
 */
export const CAFEPRESS = {
  title: 'CafePress UK',
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt', 'June to August 2026'],
  summary: (
    <p>
      I researched the UK B2B promotional-products market for CafePress, evaluating competitors, UK vendors and assortment, the site experience, and operational
      readiness. Then I <strong>coded a localized storefront prototype</strong> from the findings.
    </p>
  ),
  hero: 'cp-cover' as ImageId,

  question: {
    heading: 'Could CafePress bring its B2B storefront to the UK, and what would have to change?',
    lead: 'To assess the feasibility of a UK launch, I looked at four areas.',
    areas: [
      { title: 'Competitive landscape', text: 'How comparable businesses structure their B2B sites, categories, and product presentation.' },
      { title: 'Vendor and product assortment', text: 'What items, brands, and sourcing options could support a UK launch.' },
      { title: 'Merchandising and site experience', text: 'How assortment and navigation could translate into a UK storefront.' },
      { title: 'Operational readiness', text: 'What workflows, tools, and processes a launch would need.' },
    ],
  },

  decisions: {
    heading: 'Decisions on the storefront',
    image: 'cp-storefront' as ImageId,
    markers: [
      { n: 1, x: 36, y: 21.5, label: 'Category navigation' },
      { n: 2, x: 86, y: 9.5, label: 'UK contact and Basket' },
      { n: 3, x: 16, y: 69.5, label: 'Delivery and support' },
    ],
    items: [
      {
        n: 1,
        kind: 'Retained',
        title: 'A category-led structure',
        text: 'Eight categories from Clothing & Workwear to Industries. Competitor sites were category-led and UK offerings often mirrored US-style merchandising, so the familiar structure stayed.',
      },
      {
        n: 2,
        kind: 'Changed',
        title: 'UK terms and contact',
        text: 'Basket, and a UK phone number with office hours. Small differences in wording and presentation could matter to UK buyers.',
      },
      {
        n: 3,
        kind: 'Changed',
        title: 'Local promises',
        text: 'Fast UK Delivery, Volume Discounts, and UK-Based Support, stated where a business buyer decides whether to order.',
      },
    ],
  },

  localization: {
    heading: 'The localized storefront',
    lead: 'US terms I recommended adapting for UK buyers, reviewed for a promotional-products store.',
    pairs: [
      ['Cart', 'Basket'],
      ['Personalized', 'Personalised'],
      ['Color', 'Colour'],
      ['Pants', 'Trousers'],
    ] as const,
    note: 'Basket appears in the storefront; the other pairs come from my localization research, which also recommended showing prices in pounds.',
    detail: 'cp-header-nav' as ImageId,
  },

  assortment: {
    heading: 'Assortment considered',
    lead: 'Using UK vendors including PF Concept and Ralawise, I curated a broad assortment of potential launch items. These are three of the directions it pointed to.',
    columns: ['Product or category', 'Supplier considered', 'Reason to include', 'Constraint'],
    rows: [
      {
        product: 'Eco-friendly workplace kits',
        supplier: 'UK vendor base (PF Concept, Ralawise)',
        reason: 'Eco-friendly products appeared consistently across competitor assortments.',
        constraint: 'Not documented in the research',
      },
      {
        product: 'Outerwear and rainy-day essentials',
        supplier: 'UK vendor base (PF Concept, Ralawise)',
        reason: 'A cooler, wetter climate makes jackets and umbrellas more relevant in assortment and promotion.',
        constraint: 'Not documented in the research',
      },
      {
        product: 'Football event and team merchandise',
        supplier: 'UK vendor base (PF Concept, Ralawise)',
        reason: 'Football events and team celebrations are a UK-relevant occasion for branded goods.',
        constraint: 'Not documented in the research',
      },
    ],
    note: 'The research did not assign suppliers or record constraints item by item.',
  },

  recommendations: {
    heading: 'Recommendations',
    rows: [
      {
        kind: 'Retain',
        title: 'Adapt the existing US B2B model.',
        evidence: 'Competitor sites were category-led, and UK offerings often mirrored US-style merchandising.',
        implication: 'Build the UK site from CafePress’s proven structure instead of a separate strategy.',
      },
      {
        kind: 'Localize',
        title: 'Localize the assortment selectively.',
        evidence: 'Recognizable brands and eco-friendly products recurred across competitor assortments.',
        implication: 'Prioritize UK-relevant brands and eco-friendly options, with UK terms and prices in pounds.',
      },
      {
        kind: 'Prepare',
        title: 'Support launch with operational readiness.',
        evidence: 'Merchandising work was manual and often repeated across spreadsheets and systems.',
        implication: 'Have product data, vendor coordination, and merchandising workflows ready before rollout.',
      },
    ],
    status: 'Storefront prototype presented for a potential UK launch.',
  },
}

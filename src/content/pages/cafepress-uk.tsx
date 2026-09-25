/**
 * CafePress UK (brief v16): an editorial composition built from the
 * storefront prototype itself (PlanetArt/cafepress uk/uk web.png, 1672×941)
 * and the research behind it.
 *
 * Facts: PlanetArt internship, June to August 2026 (résumé); the storefront
 * shows the eight categories below, "Basket", a UK phone number with office
 * hours, and fast UK delivery, volume discounts, quality branding and
 * UK-based support. It shows no prices, so no GBP pricing is shown as work.
 * The US to UK word pairs are the localization recommendations of Harlie's
 * internship deck (p. 7), set as type and labelled as research, never as a
 * slide. Status: a prototype for a potential UK launch, not a launch.
 */
export const CAFEPRESS = {
  title: 'CafePress UK',
  meta: ['Product Operations and Merchandising Intern', 'PlanetArt', 'June to August 2026'],
  status: 'Prototype for a potential UK launch',
  summary: (
    <p>
      I researched the UK B2B promotional-products market for CafePress, evaluating competitors, UK vendors and assortment, the site experience, and
      operational readiness. Then I <strong>coded a localized storefront prototype</strong> from the findings.
    </p>
  ),
  categories: {
    title: 'Category structure',
    body: 'Competitors in the UK market were clear, category-led, and easy to browse, and they often mirrored US-style merchandising. I organized the storefront the same way, with eight categories from Clothing & Workwear to Industries.',
    items: ['Clothing & Workwear', 'Drinkware', 'Bags', 'Office & Stationery', 'Tech', 'Eco-Friendly', 'Events & Gifts', 'Industries'],
  },
  localization: {
    title: 'Localization',
    body: 'Small differences in wording, pricing, and presentation could matter to UK buyers. I localized the storefront with UK terms such as Basket, a UK phone number with office hours, and messages about fast UK delivery and UK-based support.',
    label: 'UK terms from my localization research',
    pairs: [
      ['Color', 'Colour'],
      ['Personalized', 'Personalised'],
      ['Organization', 'Organisation'],
      ['Pants', 'Trousers'],
      ['Sneakers', 'Trainers'],
      ['Sweatshirt', 'Jumper'],
      ['Soccer', 'Football'],
    ] as const,
  },
  assortment: {
    title: 'Assortment',
    body: (
      <p>
        Using UK vendors such as PF Concept and Ralawise, I <strong>curated a broad assortment of potential launch items</strong>. Competitors featured
        recognizable brands and eco-friendly products, so I focused on UK-relevant brands, eco-friendly options, and breadth across common B2B categories.
      </p>
    ),
  },
  result: {
    lead: 'I presented the storefront to the team with three recommendations.',
    items: [
      'Adapt the US B2B model.',
      'Localize the assortment selectively, with UK-relevant brands and eco-friendly products.',
      'Prepare product data and vendor workflows before a UK launch.',
    ],
  },
}

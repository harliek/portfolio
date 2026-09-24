import type { VisualStep } from '../../components/case/StickyVisual'

/**
 * CafePress UK: copy from the client's brief (revision-brief.md, Page 1),
 * checked against the internship presentation (PlanetArt/planetart
 * presentation.pdf pp. 3–9), the storefront prototype (PlanetArt/cafepress
 * uk/uk web.png) and the résumé. See docs/content-provenance.md.
 * The page never calls this a UK launch: no launch is evidenced.
 *
 * Highlight coordinates are percentages of the 1672 / 941 sticky frame.
 *
 * Step 1 (`planetart-competitors`, 1880×1000, contained, so the slide sits
 * between 2.745% bands): the three "Key patterns observed" bullets the
 * paragraph names (category-led sites, recognizable brands, eco-friendly
 * products), source x 40–1330, y 500–686.
 *
 * Step 2 (`planetart-uk`) is shown as a detail. Page CSS scales the storefront
 * by --cp-detail-zoom (1.727) from its top right corner, which leaves source
 * x 704–1672, y 0–545 in view: the pound sign beside No Setup Fees, the
 * Basket, and the category row from Office & Stationery to Industries,
 * including Eco-Friendly. The highlight is the header (source y 0–228), in
 * those zoomed coordinates. Step 3 returns to the full interface.
 * The prototype shows no prices, so the copy never claims GBP prices on it.
 */
export const CAFEPRESS_UK = {
  description: (
    <p>
      An internship project at PlanetArt on how the CafePress offer of branded promotional products for businesses could be adapted for UK customers.
    </p>
  ),
  summary: <p>Market research, recommendations, and a localized storefront prototype. This was not a production launch.</p>,
  heroCaption: 'The localized CafePress Business UK storefront prototype, created during the internship.',
  context: (
    <>
      <p>During my internship at PlanetArt, I researched the UK promotional products market and developed a localized CafePress storefront prototype.</p>
      <p>I was a Product Operations & Merchandising Intern from June to August 2026.</p>
    </>
  ),
  problem: (
    <p>
      The project required identifying how a UK offer should differ from the existing US storefront. I reviewed competitors, product categories,
      pricing, and localization requirements.
    </p>
  ),
  steps: [
    {
      id: 'competitors',
      title: 'Competitor review',
      body: <p>My research identified recurring product categories, recognizable brands, and environmentally focused ranges among UK competitors.</p>,
      image: 'planetart-competitors',
      highlight: { x: 2.1, y: 50, w: 68.6, h: 17.6 },
      caption: 'Competitor findings from the internship presentation. The highlighted patterns cover categories, brands, and eco-friendly products.',
    },
    {
      id: 'localization',
      title: 'Localization',
      body: <p>I used the findings to inform the language, currency presentation, and assortment shown in the prototype.</p>,
      image: 'planetart-uk',
      highlight: { x: 0.5, y: 0.9, w: 99, h: 40.3 },
      dim: true,
      caption: 'Detail of the prototype header, with the pound sign, the Basket, and a category row that includes Eco-Friendly.',
    },
    {
      id: 'storefront',
      title: 'Storefront prototype',
      body: <p>I translated the recommendations into a storefront that showed how the proposed UK offer could be presented.</p>,
      image: 'planetart-uk',
      caption: 'The full storefront prototype. A proposed experience, not a launched site.',
    },
  ] satisfies VisualStep[],
  /**
   * The storefront is enlarged 1.727 times in step 2 (and in its phone-width
   * figure), so every layer asks for a correspondingly wider source.
   */
  stepSizes: '(min-width: 1320px) 1190px, (min-width: 960px) 95vw, calc(173vw - 70px)',
  results: (
    <p>
      The project produced market research, recommendations, and a localized storefront prototype. The work shown here was not a production launch, and
      measured commercial outcomes are not available.
    </p>
  ),
  resultsFigureCaption: 'UK assortment opportunities and potential suppliers from the internship presentation.',
  related: 'An independent application prototype I developed after the internship, using synthetic data.',
}

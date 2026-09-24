import type { CaseMedia, Rect, StorySection } from '../../components/case/CaseScroll'

/**
 * CafePress UK (route /work/cafepress-uk, CaseScroll states media).
 *
 * Copy is brief-v5 section 23 under the copy rules and lead decision 3 (H1
 * “CafePress UK”; nothing says the store launched). Round 1 of the critique
 * (R1-01, R1-03, R1-05): the metadata gives the role and status; the launch
 * is framed once, in the summary (“for a potential UK launch”), and the result
 * speaks of planning “a UK launch”; What I found ends with the recommendation
 * (deck p. 8, recommendations 1 and 2). Edits to the brief's text, each for
 * accuracy or repetition only:
 * - “UK competitors” → “Competitors in the UK market”. The deck's competitor
 *   slide (p. 5) reviews Printful, Prodigi, Printify, Vistaprint and 4imprint
 *   as comparable businesses for the UK market; not all are UK companies.
 * - “a coded storefront prototype” → “the coded storefront”, so “prototype”
 *   is not repeated from the opening.
 *
 * Sources (PlanetArt/planetart presentation.pdf, dated 08/20/2026, PDF pages):
 * - Opening: résumé (“Led UK pricing, competitor, and vendor research to shape
 *   CafePress’s launch strategy and prototype e-commerce site”); deck p. 1
 *   (“CafePress UK B2B Launch”), p. 2 (“a potential UK launch”), p. 8 (the
 *   same storefront). “Coded” is Harlie's statement; the folder holds only the
 *   screenshot.
 * - The question: deck p. 4 (feasibility of a UK B2B launch), p. 6 takeaway
 *   (“adapt an existing B2B model with targeted localization”).
 * - What I found: deck p. 5, the four “Key patterns observed” (category-led,
 *   recognizable brands, eco-friendly products, UK offerings mirroring
 *   US-style merchandising); p. 6 takeaway; p. 8 “UK Launch Recommendations”
 *   1 (“Adapt the existing US B2B model”, rather than “creating a completely
 *   separate strategy”) and 2 (“Localize the assortment selectively”,
 *   “UK-relevant brands and eco-friendly product options”).
 * - What I made: uk web.png (Basket, Fast UK Delivery, UK-Based Support, a
 *   pound sign, a 020 number with Mon–Fri hours, eight categories); deck p. 8
 *   and p. 9 (recommendations). The prototype shows no prices, so the page
 *   never claims GBP pricing.
 * - The result: Harlie's statement; consistent with deck p. 9.
 *
 * No slide appears on the page (brief-v5 section 24). The stage shows the
 * storefront, then focused crops of its navigation and UK details
 * (src/content/crops/cafepress-uk.ts). Highlights are percentages of each crop.
 */

/** Eco-Friendly in the category row, in cp-header-nav. */
const ECO_CATEGORY: Rect = { x: 17.8, y: 42.9, w: 18.7, h: 10 }
/** The UK phone number and hours, Sign in and Basket, in cp-header-nav. */
const UK_CONTACT: Rect = { x: 24.7, y: 19.5, w: 67.4, h: 15.5 }
/** The headline “Branded Promotional Products for UK Businesses”, in cp-header-brand. */
const UK_HEADLINE: Rect = { x: 9, y: 69.6, w: 90.6, h: 27.9 }

const FULL = 'cp-storefront' as const

export const CAFEPRESS_UK = {
  meta: ['Product Operations and Merchandising Intern · PlanetArt', 'June to August 2026 · Market research and storefront prototype'],
  summary: (
    <p>
      During my PlanetArt internship, I researched the UK B2B promotional-products market and coded a <strong>localized CafePress storefront prototype</strong>{' '}
      for a potential UK launch.
    </p>
  ),
  media: {
    kind: 'states',
    // The storefront and both header crops are 16:9.
    frameRatio: '16 / 9',
    opening: { image: FULL, caption: 'The CafePress Business UK storefront prototype.' },
  } satisfies CaseMedia,
  sections: [
    {
      id: 'question',
      title: 'The question',
      body: (
        <p>
          I examined how CafePress could bring its US business offer to the UK while adapting the parts of the experience that mattered to local customers.
        </p>
      ),
    },
    {
      id: 'found',
      title: 'What I found',
      body: (
        <p>
          Competitors in the UK market used familiar category-led merchandising, prominently featured recognizable brands, and consistently offered eco-friendly
          products. So I recommended <strong>adapting the US B2B model</strong> rather than building a separate UK strategy, and localizing the assortment
          around UK brands and eco-friendly products.
        </p>
      ),
      visual: {
        image: 'cp-header-nav',
        caption: 'The storefront’s category row, with Eco-Friendly as its own category.',
        highlight: ECO_CATEGORY,
        expandTo: FULL,
      },
    },
    {
      id: 'made',
      title: 'What I made',
      body: (
        <p>
          I turned the research into the coded storefront, with <strong>UK wording, local contact details</strong>, and a category structure for the B2B offer. I
          presented it with my market research and recommendations.
        </p>
      ),
      visual: {
        image: 'cp-header-nav',
        caption: 'A UK phone number with office hours, Sign in, and Basket in the header.',
        highlight: UK_CONTACT,
        expandTo: FULL,
      },
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        I gave the team <strong>a concrete UK storefront concept</strong> and a researched approach to assortment and localization that they could use to plan a
        UK launch.
      </p>
    ),
    visual: {
      image: 'cp-header-brand',
      caption: 'The storefront’s name and headline for UK businesses.',
      highlight: UK_HEADLINE,
      expandTo: FULL,
    },
  } satisfies StorySection,
}

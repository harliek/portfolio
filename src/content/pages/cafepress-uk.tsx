import type { CaseMedia, Rect, StorySection } from '../../components/case/CaseScroll'

/**
 * CafePress UK (route /work/cafepress-uk, CaseScroll states media).
 *
 * Copy is brief-v5 section 23 under the copy rules and lead decision 3 (H1
 * “CafePress UK”; nothing says the store launched). Round 1 of the critique
 * (R1-01, R1-03, R1-05): the metadata gives the role and status; the launch
 * is framed in the summary (“for a potential UK launch”) and once more in the
 * result (“before a UK launch”, a recommendation). Round 2 (R2-03) reports the
 * whole investigation: The question names the four areas the deck evaluated,
 * What I found adds the UK vendors the assortment was curated from, What I
 * made no longer repeats the handoff, and The result names the three
 * recommendations. “UK competitors” reads “Competitors in the UK market”: the
 * deck's competitor slide (p. 5) reviews Printful, Prodigi, Printify,
 * Vistaprint and 4imprint as comparable businesses; not all are UK companies.
 *
 * Sources (PlanetArt/planetart presentation.pdf, dated 08/20/2026, slide
 * numbers as printed):
 * - Opening: résumé (“Led UK pricing, competitor, and vendor research to shape
 *   CafePress’s launch strategy and prototype e-commerce site”); deck p. 1
 *   (“CafePress UK B2B Launch”), p. 3 (“a potential UK launch”), p. 7 (the
 *   same storefront). “Coded” is Harlie's statement; the folder holds only the
 *   screenshot.
 * - The question: p. 4 “What I Evaluated for the UK Launch”, the four areas
 *   (competitive landscape, vendor and product assortment, merchandising and
 *   site experience, operational readiness).
 * - What I found: p. 5, the “Key patterns observed” (category-led,
 *   recognizable brands, eco-friendly products, UK offerings mirroring
 *   US-style merchandising); p. 6 (“Using UK vendors including PF Concept and
 *   Ralawise, I curated a broad assortment of potential launch items”, and the
 *   takeaway); p. 8 recommendations 1 (“Adapt the existing US B2B model”) and
 *   2 (“Localize the assortment selectively”, “UK-relevant brands and
 *   eco-friendly product options”).
 * - What I made: uk web.png (Basket, Fast UK Delivery, UK-Based Support, a
 *   pound sign, a 020 number with Mon–Fri hours, eight categories). The
 *   prototype shows no prices, so the page never claims GBP pricing.
 * - The result: p. 8, the three recommendations (the third, “Support launch
 *   with operational readiness”, names product data, vendor coordination and
 *   merchandising workflows). That she presented them is Harlie's statement.
 *
 * No slide appears on the page (brief-v5 section 24). The stage shows the
 * storefront, then focused crops of its navigation and UK details
 * (src/content/crops/cafepress-uk.ts). Highlights are percentages of each crop.
 */

/** Eco-Friendly in the category row, in cp-header-nav. */
const ECO_CATEGORY: Rect = { x: 17.8, y: 42.9, w: 18.7, h: 10 }
/** The UK phone number and hours, Sign in and Basket, in cp-header-nav. */
const UK_CONTACT: Rect = { x: 24.7, y: 19.5, w: 67.4, h: 15.5 }
/** The headline “Branded Promotional Products for UK Businesses”, in cp-header-brand (source x 62–714, y 282–400; at least 60px inside every crop edge). */
const UK_HEADLINE: Rect = { x: 6, y: 48.2, w: 62.7, h: 20.2 }

const FULL = 'cp-storefront' as const

export const CAFEPRESS_UK = {
  meta: ['Product Operations and Merchandising Intern · PlanetArt', 'June to August 2026 · Market research and storefront prototype'],
  summary: (
    <p>
      During my PlanetArt internship, I researched the UK B2B promotional-products market and coded a localized CafePress storefront prototype for a
      potential UK launch.
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
          Could CafePress bring its US business offer to the UK? I looked at competitors, UK vendors and assortment, the site experience, and the
          operations it would need.
        </p>
      ),
    },
    {
      id: 'found',
      title: 'What I found',
      body: (
        <p>
          Competitors in the UK market used category-led merchandising, featured recognizable brands, and consistently offered eco-friendly products, much
          like the US. So I recommended <strong>adapting the US B2B model</strong> and localizing the assortment around UK brands and eco-friendly
          products, which I curated from UK vendors such as PF Concept and Ralawise.
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
          I turned the research into the coded storefront, with UK wording, local contact details, and a category structure for the B2B offer.
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
        I presented the storefront and <strong>three recommendations</strong> to the team, adapting the US model, localizing the assortment selectively, and
        preparing product data and vendor workflows before a UK launch.
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

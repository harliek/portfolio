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
 * Round 5 (R5-01, R5-02, R5-11): the summary starts with Harlie's action (the
 * metadata names PlanetArt), each section has one job (What I found reports
 * the findings and the curation, The result alone gives the recommendations),
 * and captions that only name what the image shows were shortened or removed.
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
 *   Ralawise, I curated a broad assortment of potential launch items”).
 * - What I made: uk web.png (Basket, Fast UK Delivery, UK-Based Support, a
 *   pound sign, a 020 number with Mon–Fri hours, eight categories). The
 *   prototype shows no prices, so the page never claims GBP pricing.
 * - The result: p. 8, the three recommendations (1 “Adapt the existing US B2B
 *   model”; 2 “Localize the assortment selectively”, “UK-relevant brands and
 *   eco-friendly product options”; 3 “Support launch with operational
 *   readiness”, naming product data, vendor coordination and merchandising
 *   workflows). That she presented them is Harlie's statement.
 *
 * No slide appears on the page (brief-v5 section 24). The stage shows the
 * storefront, then focused crops of its navigation and UK details
 * (src/content/crops/cafepress-uk.ts). Highlights are percentages of each crop.
 * A click on a detail opens the whole storefront at actual size on that
 * detail. Phones show narrower crops of the same details (`phone`, round 4,
 * R4-06), which read in place; the whole storefront still opens its detail view.
 */

/** Eco-Friendly in the category row, in cp-header-nav. */
const ECO_CATEGORY: Rect = { x: 17.8, y: 42.9, w: 18.7, h: 10 }
/** The UK phone number and hours, Sign in and Basket, in cp-header-nav. */
const UK_CONTACT: Rect = { x: 24.7, y: 19.5, w: 67.4, h: 15.5 }
/** The headline “Branded Promotional Products for UK Businesses”, in cp-header-brand (source x 62–714, y 282–400; at least 60px inside every crop edge). */
const UK_HEADLINE: Rect = { x: 6, y: 48.2, w: 62.7, h: 20.2 }
/** Eco-Friendly in the phone crop cp-phone-nav (source x 1091–1216, y 186–218). */
const ECO_CATEGORY_PHONE: Rect = { x: 8.07, y: 75, w: 19.78, h: 19.05 }
/** The headline in the phone crop cp-phone-headline (source x 60–710, y 282–400). */
const UK_HEADLINE_PHONE: Rect = { x: 1.79, y: 5.65, w: 96.73, h: 33.33 }

const FULL = 'cp-storefront' as const

export const CAFEPRESS_UK = {
  meta: ['Product Operations and Merchandising Intern · PlanetArt', 'June to August 2026 · Market research and storefront prototype'],
  summary: (
    <p>
      I researched the UK B2B promotional-products market and coded a localized CafePress storefront prototype for a potential UK launch.
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
          Could CafePress bring its US business offer to the UK? I evaluated competitors, UK vendors and assortment, the site experience, and the
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
          like the US. Using UK vendors such as PF Concept and Ralawise, I curated a broad assortment of potential launch items.
        </p>
      ),
      visual: {
        image: 'cp-header-nav',
        caption: 'Eco-Friendly as its own category.',
        highlight: ECO_CATEGORY,
        expandTo: FULL,
        phone: { image: 'cp-phone-nav', highlight: ECO_CATEGORY_PHONE },
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
        I presented the storefront to the team with three recommendations, to <strong>adapt the US B2B model</strong>, localize the assortment selectively
        with UK brands and eco-friendly products, and prepare product data and vendor workflows before a UK launch.
      </p>
    ),
    visual: {
      image: 'cp-header-brand',
      highlight: UK_HEADLINE,
      expandTo: FULL,
      phone: { image: 'cp-phone-headline', highlight: UK_HEADLINE_PHONE },
    },
  } satisfies StorySection,
}

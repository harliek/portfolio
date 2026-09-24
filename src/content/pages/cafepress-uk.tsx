import type { CaseMedia, Rect, StorySection } from '../../components/case/CaseScroll'

/**
 * CafePress UK (route /work/cafepress-uk, CaseScroll states media).
 *
 * brief-v8 section 12: a concise case study where each visual shows the
 * finding beside it. The category row with the category structure, the UK
 * contact details and Basket with localization, the products with the
 * assortment, and the complete storefront at the end. Each view is a readable
 * piece of the storefront with one highlight inside it (no tight zoom that cuts
 * the context away); the stage replaces the image only where the finding moves
 * to another part of the page.
 *
 * Project status (lead decision 1, brief-v8 section 12): the H1 is “CafePress
 * UK”; the metadata repeats the cover's subtitle (UK market research and
 * storefront prototype) and the status line says it was a prototype for a
 * potential UK launch, so the page and the cover describe the same work and
 * nothing says a store launched. The cover's embedded “UK Launch” wording is in
 * docs/asset-checklist.md.
 *
 * Sources (PlanetArt/planetart presentation.pdf, titled “CafePress UK B2B
 * Launch”, dated 08/20/2026, slide numbers as printed):
 * - Summary: p. 4 “What I Evaluated for the UK Launch”, the four areas
 *   (competitive landscape, vendor and product assortment, merchandising and
 *   site experience, operational readiness); p. 3 “a potential UK launch”;
 *   p. 7 “Began translating the research into a customer-facing concept”.
 *   The résumé also names the prototype e-commerce site. “Coded” is Harlie's
 *   statement; the folder holds only the screenshot.
 * - Category structure: p. 5, “Sites were generally clear, category-led, and
 *   easy to browse”; “UK offerings often mirrored US-style merchandising”. The
 *   eight categories are the storefront's own row (uk web.png).
 * - Localization: p. 7, “Small market differences may still shape how
 *   CafePress presents products, pricing, and promotions in the UK” (language
 *   shifts, GBP pricing). The UK terms, the 020 number with Mon–Fri hours and
 *   the delivery and support messages are the storefront's own wording. The
 *   prototype shows no prices, so the page never claims GBP pricing.
 * - Assortment: p. 6, “Using UK vendors including PF Concept and Ralawise, I
 *   curated a broad assortment of potential launch items”, its focus areas
 *   (eco-friendly product opportunities, UK-relevant brands, product breadth
 *   across common B2B categories); p. 5, recognizable brands and eco-friendly
 *   products across competitors. The photograph shows the kinds of products
 *   the storefront presents, not the curated list.
 * - The result: p. 8, the three recommendations (1 “Adapt the existing US B2B
 *   model”; 2 “Localize the assortment selectively”, “UK-relevant brands and
 *   eco-friendly product options”; 3 “Support launch with operational
 *   readiness”, naming product data, vendor coordination and merchandising
 *   workflows). That she presented them to the team is Harlie's statement.
 *
 * No slide appears on the page (brief-v5 section 24). Highlights are
 * percentages of each crop (src/content/crops/cafepress-uk.ts). A click opens
 * the complete storefront at actual size on the clicked detail. Phones show
 * narrower crops that read in place (`phone`).
 */

const FULL = 'cp-storefront' as const

/** The category row, Clothing & Workwear to Tech, in cp-header-brand (source x 96–1017, y 180–222). */
const CATEGORY_ROW: Rect = { x: 9.23, y: 30.77, w: 88.56, h: 7.18 }
/** The UK phone number with office hours, Sign in and Basket, in cp-header-nav (source x 1136–1616, y 88–150). */
const UK_CONTACT: Rect = { x: 24.7, y: 19.5, w: 67.4, h: 15.5 }
/** The same row in the phone crop cp-phone-nav. */
const UK_CONTACT_PHONE: Rect = { x: 15.19, y: 16.67, w: 75.95, h: 36.9 }
/** The notebook, mug, tote and bottle, in cp-products (source x 783–1362, y 452–664). */
const PRODUCTS: Rect = { x: 0.8, y: 50.4, w: 65.4, h: 47.6 }

export const CAFEPRESS_UK = {
  meta: ['Product Operations and Merchandising Intern · PlanetArt', 'June to August 2026 · UK market research and storefront prototype'],
  summary: (
    <p>
      I researched the UK B2B promotional-products market for CafePress, evaluating competitors, UK vendors and assortment, the site experience, and
      operational readiness. Then I <strong>coded a localized storefront prototype</strong> from the findings.
    </p>
  ),
  status: 'Storefront prototype for a potential UK launch',
  media: {
    kind: 'states',
    // The storefront and the header crops are 16:9; the products crop is a little wider and sits centred in the same frame.
    frameRatio: '16 / 9',
    opening: { image: 'cp-header-brand', expandTo: FULL, phone: { image: 'cp-phone-headline' } },
  } satisfies CaseMedia,
  sections: [
    {
      id: 'categories',
      title: 'Category structure',
      body: (
        <p>
          Competitors in the UK market were clear, category-led, and easy to browse, and they often mirrored US-style merchandising. I organized the storefront
          the same way, with eight categories from Clothing & Workwear to Industries.
        </p>
      ),
      visual: { image: 'cp-header-brand', highlight: CATEGORY_ROW, expandTo: FULL },
    },
    {
      id: 'localization',
      title: 'Localization',
      body: (
        <p>
          Small differences in wording, pricing, and presentation could matter to UK buyers. I localized the storefront with UK terms such as Basket, a UK
          phone number with office hours, and messages about fast UK delivery and UK-based support.
        </p>
      ),
      visual: { image: 'cp-header-nav', highlight: UK_CONTACT, expandTo: FULL, phone: { image: 'cp-phone-nav', highlight: UK_CONTACT_PHONE } },
    },
    {
      id: 'assortment',
      title: 'Assortment',
      body: (
        <p>
          Using UK vendors such as PF Concept and Ralawise, I <strong>curated a broad assortment of potential launch items</strong>. Competitors featured
          recognizable brands and eco-friendly products, so I focused on UK-relevant brands, eco-friendly options, and breadth across common B2B categories.
        </p>
      ),
      visual: { image: 'cp-products', highlight: PRODUCTS, expandTo: FULL, phone: { image: 'cp-phone-products' } },
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        I presented the storefront to the team with <strong>three recommendations</strong>, to adapt the US B2B model, localize the assortment selectively with
        UK-relevant brands and eco-friendly products, and prepare product data and vendor workflows before a UK launch.
      </p>
    ),
    visual: { image: FULL },
  } satisfies StorySection,
}

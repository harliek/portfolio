import type { Section, Visual } from '../../components/case/CaseScroll'
import type { ImageId } from '../media'

/**
 * CafePress UK (CaseScroll). Copy follows the latest brief (section 18) and is
 * checked against the internship presentation (PlanetArt/planetart
 * presentation.pdf, dated 08/20/2026), the storefront prototype
 * (PlanetArt/cafepress uk/uk web.png) and the résumé. See
 * docs/content-provenance.md.
 *
 * Sources per claim (PDF page numbers):
 * - Five comparable businesses and the four "Key patterns observed": p. 4
 *   (Competitor Findings). "Comparable businesses" is the deck's own term
 *   (p. 3); not all of them are UK-only, so the page does not call them UK
 *   competitors.
 * - Vendors PF Concept and Ralawise, eco-friendly and UK-relevant focus: p. 5.
 *   "Adapt an existing B2B model with targeted localization": p. 5 takeaway.
 * - UK spellings and terms (colour, personalised, trousers, jumper): p. 7.
 * - The prototype: p. 8 and uk web.png. Three recommendations: p. 9.
 * - The prototype shows no prices, so the page never claims GBP pricing on it;
 *   "Basket" and the 020 phone number are read from the prototype itself (the
 *   number may be a placeholder, so it is called a UK-format number).
 * - No launch, conversion or revenue result exists; the status line in the
 *   metadata says so once, and nothing else repeats it.
 *
 * Highlights are percentages of each crop (src/content/crops/cafepress-uk.ts).
 */

export const CAFEPRESS_UK = {
  situation: (
    <p>
      During my PlanetArt internship, I researched the UK promotional-products market and developed a <strong>localized CafePress storefront prototype</strong>.
      The work set out how CafePress could present its business offer to UK customers.
    </p>
  ),
  opening: {
    kind: 'image',
    image: 'cafepress-monitor',
    caption: 'The localized storefront prototype, shown on a desktop display.',
    enlarge: 'cp-storefront',
  } satisfies Visual,
  sections: [
    {
      id: 'problem',
      title: 'Problem',
      blocks: [
        {
          id: 'problem-text',
          body: (
            <p>
              CafePress already had a business-to-business offer in the US. To judge whether it could serve UK businesses, I needed to find out{' '}
              <strong>how comparable companies presented promotional products to UK buyers</strong> and which parts of the US offer would have to change.
            </p>
          ),
        },
      ],
    },
    {
      id: 'contribution',
      title: 'My contribution',
      blocks: [
        {
          id: 'competitors',
          title: 'Competitor review',
          body: (
            <>
              <p>
                I reviewed five comparable businesses, Printful, Prodigi, Printify, Vistaprint, and 4imprint. The main finding was that{' '}
                <strong>UK offerings often mirrored US-style merchandising</strong> rather than introducing a different model. The sites were organized by
                category, featured recognizable brands, and showed eco-friendly products as a recurring theme.
              </p>
              <p>I also reviewed UK vendors, including PF Concept and Ralawise, and curated potential products with a focus on eco-friendly ranges and UK-relevant brands.</p>
            </>
          ),
          visual: {
            kind: 'image',
            image: 'cp-competitors',
            caption: 'Competitor Findings slide from my internship presentation.',
            highlight: { x: 1, y: 66.4, w: 90, h: 6 },
          },
        },
        {
          id: 'positioning',
          title: 'UK positioning',
          body: (
            <p>
              The research suggested that CafePress could adapt its existing model with <strong>targeted localization</strong> instead of building a separate
              one. The prototype presents the offer as CafePress Business UK, with a headline addressed to UK businesses and a fast UK delivery notice at the top
              of the page.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'cp-header-brand',
            caption: 'The CafePress Business UK name and headline in the storefront prototype.',
            highlight: { x: 8.1, y: 15.5, w: 42.4, h: 22.9 },
          },
        },
        {
          id: 'categories',
          title: 'Category navigation',
          body: (
            <p>
              Like the competitor sites, the prototype is organized by product category. <strong>Eco-Friendly has its own place in the category row</strong>,
              in line with my recommendation to prioritize eco-friendly products and UK-relevant brands.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'cp-header-nav',
            caption: 'Detail of the prototype’s category row, with Eco-Friendly beside Tech and Events & Gifts.',
            highlight: { x: 18, y: 41.9, w: 18.5, h: 11.5 },
          },
        },
        {
          id: 'wording',
          title: 'UK wording and contact details',
          body: (
            <p>
              My localization research listed UK spellings and terms such as colour, personalised, trousers, and jumper. The prototype follows the same
              conventions, with a <strong>Basket</strong> instead of a cart and a UK-format phone number with office hours.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'cp-header-nav',
            caption: 'The phone number, Sign in, and Basket in the prototype’s header.',
            highlight: { x: 24.7, y: 19.5, w: 67.7, h: 15 },
          },
        },
        {
          id: 'prototype',
          title: 'Storefront prototype',
          body: (
            <p>
              The completed prototype brings these decisions together on one homepage. It gave the recommendations a{' '}
              <strong>concrete customer-facing example</strong>, and I included it in my internship presentation alongside the research.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'cp-storefront',
            caption: 'The complete storefront prototype.',
          },
        },
      ],
    },
  ] satisfies Section[],
  results: (
    <p>
      The internship produced a competitor and vendor review, the storefront prototype, and <strong>three recommendations</strong>, to adapt the existing US
      B2B model, localize the assortment selectively, and have product data, vendor coordination, and merchandising workflows ready before any launch.
    </p>
  ),
  resultsFigure: {
    image: 'cp-recommendations',
    caption: 'Recommendations slide from my internship presentation, dated 20 August 2026.',
  } satisfies { image: ImageId; caption: string },
  /** The next-project row carries the relationship, so there is exactly one related link. */
  next: 'A separate project I built independently after the internship, using synthetic data.',
}

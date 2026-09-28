import type { ImageAsset } from '../media'

/**
 * Focused crops for the CafePress UK page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * One source, the storefront prototype itself (PlanetArt/cafepress uk/uk web.png,
 * 1672×941), cut at full resolution. Each view pairs with one finding
 * (brief-v8 section 12) and keeps its surroundings, so a highlight marks the
 * detail inside a readable piece of the page instead of zooming it away:
 * - cp-header-nav (712×401, the top right): the UK phone number with office
 *   hours, Sign in and Basket, the category row's right end and the photograph's
 *   top, for localization (0.9×, text about 16px).
 * - cp-products (896×444, the hero photograph): the branded notebook, mug, tote
 *   and bottle and the workwear, for the assortment (0.72×).
 * - cp-storefront, the complete storefront, at the end.
 * Every crop keeps whole words at its edges. The page shows the whole
 * storefront with the first section, then the drinkware page and the page
 * with the assistant panel (media.ts), without captions (Harlie's request).
 */
const crop = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'original-artifact',
  synthetic: false,
  source: 'PlanetArt/cafepress uk/uk web.png',
  ...a,
})

export const CAFEPRESS_UK_CROPS = {
  'cp-storefront': crop({
    id: 'cp-storefront',
    width: 1672,
    height: 941,
    widths: [640, 960, 1280, 1672],
    // Shortened in Harlie's QA pass, 2026-09-28 (it listed about 70 words of the page's parts): the details that carry
    // the localization, each checked against the picture.
    alt: 'The CafePress Business UK storefront prototype: UK delivery and no-setup-fee notices, a UK phone number and Basket, product categories including Eco-Friendly, and the headline Branded Promotional Products for UK Businesses.',
    role: 'CafePress UK, the first section\'s picture (the CafePress homepage) and the larger view behind every crop',
    crop: 'The whole 1672×941 screenshot',
  }),
  'cp-header-nav': crop({
    id: 'cp-header-nav',
    width: 712,
    height: 401,
    widths: [640, 712],
    alt: 'Detail of the storefront prototype. A No Setup Fees notice with a pound sign, the UK phone number 020 3946 0018 with hours Monday to Friday 9am to 5pm, Sign in and Basket, and the categories Tech, Eco-Friendly, Events & Gifts and Industries above the hero photograph.',
    role: 'CafePress UK stage (localization: the UK phone number, office hours and Basket)',
    crop: 'x 960–1672, y 10–411 of the 1672×941 screenshot',
  }),
  'cp-products': crop({
    id: 'cp-products',
    width: 896,
    height: 444,
    widths: [640, 896],
    alt: 'Detail of the storefront prototype. The hero photograph of three colleagues with branded products, a notebook and pen, a mug, a canvas tote bag and a steel bottle, and a branded jacket, hoodie and polo shirt, all printed Northfield Solutions.',
    role: 'CafePress UK stage (the assortment)',
    crop: 'x 776–1672, y 228–672 of the 1672×941 screenshot (the hero photograph, from the right of the headline block to the service strip)',
  }),
} satisfies Record<string, ImageAsset>

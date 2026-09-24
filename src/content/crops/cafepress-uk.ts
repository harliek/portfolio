import type { ImageAsset } from '../media'
import type { CropRegion } from '.'

/**
 * Focused crops for the CafePress UK page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * One source, the storefront prototype itself (PlanetArt/cafepress uk/uk web.png,
 * 1672×941), cut at full resolution. Each view pairs with one finding
 * (brief-v8 section 12) and keeps its surroundings, so a highlight marks the
 * detail inside a readable piece of the page instead of zooming it away:
 * - cp-header-brand (1040×585, the top left): the logo, search, notices, the
 *   category row from Clothing & Workwear to Tech and the headline, for the
 *   category structure (0.62× at the 645px desktop stage, text about 11px).
 * - cp-header-nav (712×401, the top right): the UK phone number with office
 *   hours, Sign in and Basket, the category row's right end and the photograph's
 *   top, for localization (0.9×, text about 16px).
 * - cp-products (896×444, the hero photograph): the branded notebook, mug, tote
 *   and bottle and the workwear, for the assortment (0.72×).
 * - cp-storefront, the complete storefront, at the end.
 * Every crop keeps whole words at its edges. No presentation slide is used on
 * this page (brief-v5 section 24); the deck's findings appear as written copy.
 *
 * Phones (round 4, R4-06): the stacked figures below 600px use narrower crops
 * (cp-phone-*) that read in place: the headline block, the header's right side
 * with the category row, and the products. At a 350px column the 18px
 * navigation text shows at about 10px (0.55×) and the headline's 22px
 * subheading at about 11.5px (0.52×). They have no enlarge control; the
 * complete storefront (the last figure) still opens its detail view.
 *
 * CAFEPRESS_UK_REGIONS: where each desktop detail sits in the whole storefront
 * (source pixels), so the larger view opens at actual size on the clicked detail.
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
    alt: 'The CafePress Business UK storefront prototype. Notices for fast UK delivery, volume discounts and no setup fees; the logo, search, a UK phone number, Sign in and Basket; a category row from Clothing & Workwear to Industries, including Eco-Friendly; the headline Branded Promotional Products for UK Businesses; service points including UK-based support; and Shop Popular Categories.',
    role: 'CafePress UK stage (the complete storefront, at the end) and the larger view behind every crop',
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
  'cp-header-brand': crop({
    id: 'cp-header-brand',
    width: 1040,
    height: 585,
    widths: [640, 960, 1040],
    alt: 'Detail of the storefront prototype. Fast UK Delivery and Volume Discounts notices, the CafePress Business UK logo beside the search field, the categories Clothing & Workwear to Tech, and the headline Branded Promotional Products for UK Businesses above its subheading and the Shop Now and Bulk Orders buttons.',
    role: 'CafePress UK stage (opening; the category structure)',
    crop: 'x 0–1040, y 0–585 of the 1672×941 screenshot, the top left of the page, ending between the search field’s placeholder and its magnifier, after Tech in the category row, and below the buttons (round 3, R3-06, every word whole)',
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
  'cp-phone-nav': crop({
    id: 'cp-phone-nav',
    width: 632,
    height: 168,
    widths: [632],
    alt: 'Detail of the storefront prototype. The end of the search field, the UK phone number 020 3946 0018 with hours Monday to Friday 9am to 5pm, Sign in and Basket, and the categories Eco-Friendly, Events & Gifts and Industries.',
    role: 'CafePress UK stacked figure on phones (localization, with the category row)',
    crop: 'x 1040–1672, y 60–228 of the 1672×941 screenshot (the header row below the notices, and the category row from Eco-Friendly)',
  }),
  'cp-phone-headline': crop({
    id: 'cp-phone-headline',
    width: 672,
    height: 354,
    widths: [672],
    alt: 'Detail of the storefront prototype. The headline Branded Promotional Products for UK Businesses, its subheading about low minimums, volume pricing and fast UK delivery, the Shop Now and Bulk Orders buttons, and the note Ideal for small teams and bulk orders alike.',
    role: 'CafePress UK stacked figure on phones (opening)',
    crop: 'x 48–720, y 262–616 of the 1672×941 screenshot (the headline block, before the hero photograph)',
  }),
  'cp-phone-products': crop({
    id: 'cp-phone-products',
    width: 590,
    height: 232,
    widths: [590],
    alt: 'Detail of the storefront prototype. Branded products on a table, a notebook and pen, a mug, a canvas tote bag and a steel bottle, all printed Northfield Solutions.',
    role: 'CafePress UK stacked figure on phones (the assortment)',
    crop: 'x 782–1372, y 440–672 of the 1672×941 screenshot (the products in the hero photograph)',
  }),
} satisfies Record<string, ImageAsset>

/** Each desktop detail's rectangle in the whole storefront (source pixels; cp-storefront is the whole screenshot). */
export const CAFEPRESS_UK_REGIONS = {
  'cp-header-nav': { of: 'cp-storefront', x: 960, y: 10, w: 712, h: 401 },
  'cp-header-brand': { of: 'cp-storefront', x: 0, y: 0, w: 1040, h: 585 },
  'cp-products': { of: 'cp-storefront', x: 776, y: 228, w: 896, h: 444 },
} satisfies Record<string, CropRegion>

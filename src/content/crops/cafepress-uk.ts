import type { ImageAsset } from '../media'
import type { CropRegion } from '.'

/**
 * Focused crops for the CafePress UK page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * One source, the storefront prototype itself (PlanetArt/cafepress uk/uk web.png,
 * 1672×941). Every crop is 16:9, the page's one stage ratio, cut at full
 * resolution. The header detail (712×401) shows the interface text at about
 * 15px at the 645px desktop stage (0.9×); the headline view (1040×585) is
 * shown at 0.62×, so its large type stays sharp. No presentation slide is used on this page
 * (brief-v5 section 24); the deck's findings appear as written copy.
 *
 * Phones (round 4, R4-06): the stacked figures below 600px use narrower crops
 * (cp-phone-*) of the header's right side and of the headline block, cut so
 * every word stays whole. At a 350px column the 18px navigation text shows at
 * about 10px (0.55×) and the headline's 22px subheading at about 11.5px
 * (0.52×). They read in place, so these figures have no enlarge control; the
 * whole storefront (the opening figure) still opens its detail view.
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
    caption: 'The CafePress Business UK storefront prototype.',
    role: 'CafePress UK stage (opening) and the larger view behind every crop',
    crop: 'The whole 1672×941 screenshot',
  }),
  'cp-header-nav': crop({
    id: 'cp-header-nav',
    width: 712,
    height: 401,
    widths: [640, 712],
    alt: 'Detail of the storefront prototype. A No Setup Fees notice with a pound sign, the UK phone number 020 3946 0018 with hours Monday to Friday 9am to 5pm, Sign in and Basket, and the categories Tech, Eco-Friendly, Events & Gifts and Industries above the hero photograph.',
    caption: 'The right side of the storefront header and its category row.',
    role: 'CafePress UK stage (category navigation; UK contact details)',
    crop: 'x 960–1672, y 10–411 of the 1672×941 screenshot',
  }),
  'cp-header-brand': crop({
    id: 'cp-header-brand',
    width: 1040,
    height: 585,
    widths: [640, 960, 1040],
    alt: 'Detail of the storefront prototype. Fast UK Delivery and Volume Discounts notices, the CafePress Business UK logo beside the search field, the categories Clothing & Workwear to Tech, and the headline Branded Promotional Products for UK Businesses above its subheading and the Shop Now and Bulk Orders buttons.',
    caption: 'The CafePress Business UK name and headline.',
    role: 'CafePress UK stage (the UK storefront concept)',
    crop: 'x 0–1040, y 0–585 of the 1672×941 screenshot, the top left of the page, ending between the search field’s placeholder and its magnifier, after Tech in the category row, and below the buttons (round 3, R3-06, every word whole, the headline at about 1.6× the opening view)',
  }),
  'cp-phone-nav': crop({
    id: 'cp-phone-nav',
    width: 632,
    height: 168,
    widths: [632],
    alt: 'Detail of the storefront prototype. The end of the search field, the UK phone number 020 3946 0018 with hours Monday to Friday 9am to 5pm, Sign in and Basket, and the categories Eco-Friendly, Events & Gifts and Industries.',
    caption: 'The right side of the storefront header and its category row.',
    role: 'CafePress UK stacked figure on phones (category navigation; UK contact details)',
    crop: 'x 1040–1672, y 60–228 of the 1672×941 screenshot (the header row below the notices, and the category row from Eco-Friendly)',
  }),
  'cp-phone-headline': crop({
    id: 'cp-phone-headline',
    width: 672,
    height: 354,
    widths: [672],
    alt: 'Detail of the storefront prototype. The headline Branded Promotional Products for UK Businesses, its subheading about low minimums, volume pricing and fast UK delivery, the Shop Now and Bulk Orders buttons, and the note Ideal for small teams and bulk orders alike.',
    caption: 'The storefront’s headline for UK businesses.',
    role: 'CafePress UK stacked figure on phones (the UK storefront concept)',
    crop: 'x 48–720, y 262–616 of the 1672×941 screenshot (the headline block, before the hero photograph)',
  }),
} satisfies Record<string, ImageAsset>

/** Each desktop detail's rectangle in the whole storefront (source pixels; cp-storefront is the whole screenshot). */
export const CAFEPRESS_UK_REGIONS = {
  'cp-header-nav': { of: 'cp-storefront', x: 960, y: 10, w: 712, h: 401 },
  'cp-header-brand': { of: 'cp-storefront', x: 0, y: 0, w: 1040, h: 585 },
} satisfies Record<string, CropRegion>

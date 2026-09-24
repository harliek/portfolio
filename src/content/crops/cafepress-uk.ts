import type { ImageAsset } from '../media'

/**
 * Focused crops for the CafePress UK page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * One source, the storefront prototype itself (PlanetArt/cafepress uk/uk web.png,
 * 1672×941). The two header details (712×401 each) are 16:9, the
 * page's one stage ratio, cut at full resolution, so the interface text is
 * about 15px at the 645px desktop stage (0.9×). No presentation slide is used on this page
 * (brief-v5 section 24); the deck's findings appear as written copy.
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
    width: 712,
    height: 401,
    widths: [640, 712],
    alt: 'Detail of the storefront prototype. A Fast UK Delivery notice, the CafePress Business UK logo, the categories Clothing & Workwear, Drinkware and Bags, and the headline Branded Promotional Products for UK Businesses.',
    caption: 'The CafePress Business UK name and headline.',
    role: 'CafePress UK stage (the UK storefront concept)',
    crop: 'x 0–712, y 6–407 of the 1672×941 screenshot (the next category and the subheading start just outside it)',
  }),
} satisfies Record<string, ImageAsset>

import type { ImageAsset } from '../media'

/**
 * Focused crops for the CafePress UK page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * One source, the storefront prototype itself (PlanetArt/cafepress uk/uk web.png,
 * 1672×941), cut at full resolution. Only cp-storefront, the complete
 * storefront, is left: the two detail crops (cp-header-nav, cp-products) were
 * no longer rendered, and their entries are in archive/media-registry-unplaced.ts
 * (2026-09-29). The page shows the whole storefront with the first section,
 * then the drinkware page and the page with the assistant panel (media.ts),
 * without captions (Harlie's request).
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
    alt: 'The CafePress Business UK storefront concept from the internship presentation, with UK delivery and no-setup-fee notices, a UK phone number and Basket, product categories including Eco-Friendly, and the headline Branded Promotional Products for UK Businesses.',
    role: 'CafePress UK, the first section\'s picture (the CafePress homepage) and the larger view behind every crop',
    crop: 'The whole 1672×941 screenshot',
  }),
} satisfies Record<string, ImageAsset>

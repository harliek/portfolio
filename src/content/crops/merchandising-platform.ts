import type { ImageAsset } from '../media'

/**
 * Crops for this page (scripts/crops/merchandising-platform.json →
 * node scripts/prepare-media.mjs crops merchandising-platform). Keys are image
 * ids; each entry is a full ImageAsset (type: 'image') with the dimensions the
 * task prints.
 *
 * The case page shows the recording itself (brief-v5 section 15: no screenshot
 * slideshow), so the earlier walkthrough crops (catalog, economics, working,
 * inventory, ask) were retired. `mp-overview` stays because projects.ts uses
 * it as the page's `hero` (warmed by the carousel transition). It comes from
 * the 0.3s frame (2940×1486) of PlanetArt/Merchandising Dashboard/Dashboard
 * Video.mov, extracted with
 * `ffmpeg -ss 0.3 -i … -frames:v 1 .media-cache/frames/merch-overview.png`,
 * without the navigation column (x 440 to 2917).
 */
const VIDEO = 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov'

const crop = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'independent-prototype',
  synthetic: true,
  source: VIDEO,
  ...a,
})

export const MERCHANDISING_PLATFORM_CROPS = {
  'mp-overview': crop({
    id: 'mp-overview',
    width: 2477,
    height: 1486,
    widths: [640, 960, 1280, 1600],
    alt: 'Merchandising platform overview with synthetic data, reading “Product, vendor, inventory, pricing, promotion and sales data joined into one view.” Cards for net revenue, contribution, revenue at risk and inventory held, a daily revenue chart, a category mix, and a Needs a decision list that starts with Everyday Notebook is out of stock.',
    caption: 'The overview joins product, vendor, inventory, pricing, promotion, and sales data in one view.',
    role: 'Merchandising Platform hero (warmed by the carousel transition)',
    timestamp: 0.3,
    crop: 'x 440 to 2917, y 0 to 1486 of the 0.3s frame (the navigation column is left out)',
  }),
} satisfies Record<string, ImageAsset>

import type { ImageAsset } from '../media'

/**
 * Crops for this page (scripts/crops/spreadsheet-agent.json →
 * node scripts/prepare-media.mjs crops spreadsheet-agent). Keys are image ids;
 * each entry is a full ImageAsset (type: 'image') with the dimensions the task
 * prints.
 *
 * The case page shows the recording itself (brief-v5 section 15: no screenshot
 * slideshow), so the earlier walkthrough crops (request, plan, unused words,
 * plan panel, sheet, list) were retired. `sa-overview` stays because
 * projects.ts uses it as the page's `hero` (warmed by the carousel
 * transition). It comes from the 25.3s frame (2940×1486) of Spreadsheet
 * Agent/Spreadsheet Video.mov (.media-cache/frames/sheet-returned.png, the
 * FRAMES list in scripts/prepare-media.mjs), without the navigation column
 * (x 465 to 2940).
 */
const VIDEO = 'Spreadsheet Agent/Spreadsheet Video.mov'

const crop = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'prototype-recording',
  synthetic: true,
  source: VIDEO,
  ...a,
})

export const SPREADSHEET_AGENT_CROPS = {
  'sa-overview': crop({
    id: 'sa-overview',
    width: 2475,
    height: 1485,
    widths: [640, 960, 1280, 1920],
    alt: 'Spreadsheet Agent with the saved Vendor Pricing and Margin sheet (SKU, product name, vendor, cost, retail price and margin columns) beside the assistant panel, where the request “Compare vendor prices across B2B products” is answered with a reply that Vendor Pricing and Margin is ready, with 1,200 rows and 6 columns from the Northwind catalog.',
    caption: 'The saved sheet beside the assistant panel that produced it.',
    role: 'Spreadsheet Agent hero (warmed by the carousel transition)',
    timestamp: 25.3,
    crop: 'x 465 to 2940, y 0 to 1485 of the 25.3s frame (the left navigation column is left out)',
  }),
} satisfies Record<string, ImageAsset>

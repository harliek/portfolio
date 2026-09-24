import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/merchandising-platform.json →
 * node scripts/prepare-media.mjs crops merchandising-platform). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * Every crop comes from a 2940×1486 frame of the recording
 * (PlanetArt/Merchandising Dashboard/Dashboard Video.mov), extracted with
 * `ffmpeg -ss <t> -i … -frames:v 1 .media-cache/frames/<name>.png`:
 *   0.3s  merch-overview       Overview (the pointer rests in empty space)
 *   6.5s  merch-catalog-top    Catalog with its filters and header row (pointer on the sidebar)
 *   14.2s merch-working        Canyon Pouch drawer with "Show the working" open
 *   18.2s merch-economics      Canyon Pouch drawer scrolled to unit economics (pointer on Close)
 *   20.4s merch-inventory      Inventory, Needs replenishment (pointer on the sidebar)
 *   46.0s merch-ask            Ask with "What is out of stock?" and the query it ran
 * The case frame is 5:3 (like Spreadsheet Agent). Whole screens leave out the
 * navigation column (x 440–2917); the drawer details are 1036×622 (about 14px
 * text in a 620px frame). No pointer falls inside any crop.
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
    alt: 'Merch Console overview with synthetic data, reading “Product, vendor, inventory, pricing, promotion and sales data joined into one view.” Cards for net revenue, contribution, revenue at risk and inventory held, a daily revenue chart, a category mix, and a Needs a decision list that starts with Everyday Notebook is out of stock.',
    caption: 'The overview joins product, vendor, inventory, pricing, promotion, and sales data in one view.',
    role: 'Merchandising Platform case opening (demo poster)',
    timestamp: 0.3,
    crop: 'x 440–2917, y 0–1486 of the 0.3s frame (the navigation column is left out)',
  }),
  'mp-catalog': crop({
    id: 'mp-catalog',
    width: 2477,
    height: 1486,
    widths: [640, 960, 1280, 1600],
    alt: 'Merch Console catalog, reading “Every SKU with its vendor, unit economics, stock position and trailing performance on one row.” Filters for category, vendor and stock state, 240 of 240 SKUs, and rows with product, vendor, status, price, margin, 28-day units and revenue, on hand, cover and state; Everyday Notebook shows 0 on hand and Out of stock.',
    caption: 'The catalog, with one row per product.',
    role: 'Merchandising Platform case frame (catalog and inventory)',
    timestamp: 6.5,
    crop: 'x 440–2917, y 0–1486 of the 6.5s frame (the navigation column is left out)',
  }),
  'mp-economics': crop({
    id: 'mp-economics',
    width: 1036,
    height: 622,
    widths: [640, 960, 1036],
    alt: 'Part of the Canyon Pouch product record, showing a chance of running out before a restock arrives 0%, modeled over the next 45 days against 903 units available; unit economics with list price $70.91, landed cost $39.36, landed cost 12 weeks ago $41.43, fulfillment cost $6.13, web channel fee $2.06, contribution $23.36 per unit or 32.9% of price, and break-even price $46.85.',
    caption: 'The stock-out estimate and unit economics in the Canyon Pouch record.',
    role: 'Merchandising Platform case frame (product economics and stock context)',
    timestamp: 18.2,
    crop: 'x 1904–2940, y 597–1219 of the 18.2s frame (the product drawer)',
  }),
  'mp-working': crop({
    id: 'mp-working',
    width: 1036,
    height: 622,
    widths: [640, 960, 1036],
    alt: 'The working behind the Canyon Pouch order, with v = 11.71 units per day, σ = 4.15 units per day, L = 45 days; lead time demand 527.1 units; safety stock = 1.645 × σ × √L = 45.8 units; reorder point 573.0 units; order up to 1100.1 units; order = 1100.1 − 903 − 0 = 197.1, rounded up and floored at the 200 unit MOQ = 200 units. Below it, the note “This is a calculation and a CSV export. The console does not place orders.”',
    caption: 'The working behind the Canyon Pouch order quantity.',
    role: 'Merchandising Platform case frame (replenishment calculation)',
    timestamp: 14.2,
    crop: 'x 1904–2940, y 605–1227 of the 14.2s frame (the product drawer, “Show the working” open)',
  }),
  'mp-inventory': crop({
    id: 'mp-inventory',
    width: 2477,
    height: 1486,
    widths: [640, 960, 1280, 1600],
    alt: 'Merch Console Inventory, reading “Continuous-review planning. Safety stock is sized for a 95% service level. Rows are ranked by margin at risk rather than by remaining units.” An Export order sheet button, cards for SKUs in view, suggested units, order cost and margin at risk, and the Needs replenishment list with lead time, availability, velocity, cover, reorder point, risk, order quantity and state for each product.',
    caption: 'The Inventory view, with the products that need replenishment and Export order sheet.',
    role: 'Merchandising Platform case frame (replenishment list and export)',
    timestamp: 20.4,
    crop: 'x 440–2917, y 0–1486 of the 20.4s frame (the navigation column is left out)',
  }),
  'mp-ask': crop({
    id: 'mp-ask',
    width: 1167,
    height: 700,
    widths: [640, 960, 1167],
    alt: 'Merch Console Ask screen, reading “Type a merchandising question and this runs it against the joined catalog. It matches your question against a fixed set of query shapes and shows you the query it ran. There is no language model involved.” The question “What is out of stock?”, suggested questions, and the query it ran, with the metric Products at risk of stocking out, category All, and vendor All.',
    caption: 'The Ask screen with the question “What is out of stock?” and the query it ran.',
    role: 'Merchandising Platform case frame (Ask)',
    timestamp: 46.0,
    crop: 'x 462–1629, y 0–700 of the 46.0s frame',
  }),
} satisfies Record<string, ImageAsset>

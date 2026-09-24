import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/spreadsheet-agent.json →
 * node scripts/prepare-media.mjs crops spreadsheet-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * Every crop comes from a 2940×1486 frame of the recording
 * (Spreadsheet Agent/Spreadsheet Video.mov), extracted by the FRAMES list in
 * scripts/prepare-media.mjs into .media-cache/frames/: 17.7s
 * sheet-request-typed (the request, fully typed), 21.7s sheet-plan-review
 * (the build plan; the pointer rests above Build sheet), 25.3s
 * sheet-returned (the saved sheet) and 34.0s sheet-list-new (All Sheets).
 * The case frame is 5:3, so the walkthrough crops share that
 * ratio (the close crops at 1060×636, about 15px UI text in a 620px frame).
 * `sa-plan-panel` (the whole assistant panel) is the enlargement target for
 * both plan crops.
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
    alt: 'Spreadsheet Agent with the saved Vendor Pricing and Margin sheet (SKU, product name, vendor, cost, retail price and margin columns) beside the assistant panel, where the request “Compare vendor prices across B2B products” is answered: “Vendor Pricing and Margin is ready: 1,200 rows and 6 columns from the Northwind catalog.”',
    caption: 'The saved sheet beside the assistant panel that produced it.',
    role: 'Spreadsheet Agent case opening (whole workspace without the navigation column)',
    timestamp: 25.3,
    crop: 'x 465–2940, y 0–1485 of the 25.3s frame (the left navigation column is left out)',
  }),
  'sa-request': crop({
    id: 'sa-request',
    width: 1060,
    height: 636,
    widths: [640, 960, 1060],
    alt: 'The assistant panel headed Build a sheet from company data, with the instruction “Describe the result you need. Review the data source and logic before anything is added to your sheet.” and the typed request “Compare vendor prices across B2B products”.',
    caption: 'The assistant panel with the typed request.',
    role: 'Spreadsheet Agent case frame (request)',
    timestamp: 17.7,
    crop: 'x 1880–2940, y 0–636 of the 17.7s frame',
  }),
  'sa-plan': crop({
    id: 'sa-plan',
    width: 1060,
    height: 636,
    widths: [640, 960, 1060],
    alt: 'Under the request, a card labelled Review before building, Build plan, with an Edit plan control. Source: Northwind product catalog, 1,200 synthetic records, approved for this workspace. Filters: no filters, every product is included. Columns: SKU, Product Name, Vendor, Cost, Retail Price, Margin Percent.',
    caption: 'The proposed plan under the request, with Edit plan at the top.',
    role: 'Spreadsheet Agent case frame (plan: source, filters, columns)',
    timestamp: 21.7,
    crop: 'x 1880–2940, y 104–740 of the 21.7s frame',
  }),
  'sa-plan-unused': crop({
    id: 'sa-plan-unused',
    width: 1060,
    height: 636,
    widths: [640, 960, 1060],
    alt: 'The lower part of the build plan. Sort: Product Name, ascending. Row limit: all matching rows. A note reads “Not used: compare, across. These words did not map to a field or filter, so they had no effect on the plan.” Below: 1,200 rows, 6 columns, Discard and Build sheet.',
    caption: 'Sorting, the row limit and the words the plan did not use, above Build sheet.',
    role: 'Spreadsheet Agent case frame (plan: unrecognized words)',
    timestamp: 21.7,
    crop: 'x 1880–2940, y 598–1234 of the 21.7s frame',
  }),
  'sa-plan-panel': crop({
    id: 'sa-plan-panel',
    width: 800,
    height: 1486,
    widths: [480, 800],
    alt: 'The whole assistant panel: the request “Compare vendor prices across B2B products” and the build plan with its source, filters, columns, sort, row limit, the words not used, and the Discard and Build sheet controls.',
    caption: 'The complete build plan, shown for review before the sheet is created.',
    role: 'Enlargement of the Spreadsheet Agent plan crops',
    timestamp: 21.7,
    crop: 'x 2140–2940, y 0–1486 of the 21.7s frame (the assistant panel)',
  }),
  'sa-sheet': crop({
    id: 'sa-sheet',
    width: 1674,
    height: 1004,
    widths: [640, 960, 1280, 1674],
    alt: 'The Vendor Pricing and Margin sheet, marked Saved with 1,200 rows and 6 columns, with an editing toolbar, a formula bar showing cell A2 as B2B-1596, a source line reading northwind.catalog.products[].sku, and the first rows of the grid.',
    caption: 'The saved sheet with its editing toolbar, formula bar and source line.',
    role: 'Spreadsheet Agent case frame (the saved sheet)',
    timestamp: 25.3,
    crop: 'x 465–2139, y 0–1004 of the 25.3s frame (the sheet area)',
  }),
  'sa-list': crop({
    id: 'sa-list',
    width: 1624,
    height: 974,
    widths: [640, 960, 1280, 1624],
    alt: 'All Sheets, “Every sheet in this workspace, built from the Northwind catalog,” with Vendor Pricing and Margin listed first, dated Today, followed by Out of Stock Product Report and Northstar Vendor Report.',
    caption: 'All Sheets, with the new sheet listed first.',
    role: 'Spreadsheet Agent case frame (sheet list)',
    timestamp: 34.0,
    crop: 'x 490–2114, y 0–974 of the 34.0s frame',
  }),
} satisfies Record<string, ImageAsset>

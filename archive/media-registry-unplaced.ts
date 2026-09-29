/**
 * Unplaced media registry entries.
 *
 * These are the registry entries removed from src/content/media.ts and src/content/crops/*.ts on 2026-09-29,
 * because nothing on the site renders them (they were bundled into every page's JS). Their provenance notes are
 * kept here, verbatim. To use one again, paste it back into the registry: images into IMAGES and videos into
 * VIDEOS in media.ts (a video needs its poster image back too: merch-replenish, spreadsheet-agent-poster), crops
 * into their page's crops file with the helper that builds them (crop, conversation, screen, copied below).
 *
 * The files of these entries are no longer in public/media. Those of planetart-concept-*, sa-ui-request,
 * merch-promotions, aristocracy-photo-*, cp-header-nav and cp-products were removed in the same cleanup; the rest,
 * kept at first for the archived v15 components (archive/v15-src) and git stash@{0}, were removed later on 2026-09-29
 * with Harlie's approval ("Delete archive-only media"). All are recoverable from git history, as are their
 * prepare-media.mjs steps; restoring an entry, the archive or the stash means restoring its files too. The exceptions,
 * still served by plain URL: merch-console-poster-960/1600 (.jpg and .webp; their .avif files were removed) and
 * merch-console-960.mp4 (src/content/field.ts, src/pages/work/MerchandisingPlatform.tsx), so the merch-console-poster,
 * merch-overview and merch-console records below are also their provenance (merch-console-1600.mp4 was removed).
 *
 * The homepage room (brief v15; not rendered since brief v16) was moved here from media.ts on 2026-09-29, verbatim,
 * when its files were removed: UNPLACED_ROOM_IMAGES and UNPLACED_STAGE_MEDIA, at the end.
 *
 * Not compiled, linted or deployed (archive/ is outside tsconfig and eslint).
 */
import type { ImageAsset, VideoAsset } from '../src/content/media'

const img = (a: Omit<ImageAsset, 'type'>): ImageAsset => ({ type: 'image', ...a })

/* From src/content/media.ts, IMAGES (a section header is copied where the rest of its section stays there). */
export const UNPLACED_IMAGES = {
  /*
   * Carousel objects (scripts/prepare-media.mjs, task `objects`): the seven
   * supplied transparent PNGs from `final png tiles/`, trimmed to their
   * visible pixels (alpha kept). The six project covers carry their titles
   * inside the artwork and are concept cover artwork, never evidence; the
   * embedded wording is tracked in docs/asset-checklist.md. Links give
   * their accessible names in HTML, so the images are decorative there.
   */
  'obj-about': img({
    id: 'obj-about', file: 'obj-about', width: 1108, height: 1346, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Portrait of Harlie Katz, cut out against a transparent background.',
    provenance: 'portrait', synthetic: false,
    source: 'final png tiles/about me.png', role: 'Homepage carousel About Me object, About page portrait',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),

  /* PlanetArt */
  'planetart-uk': img({
    id: 'planetart-uk', file: 'planetart-uk', width: 1672, height: 941, widths: [800, 1200, 1672], fallback: 'jpg',
    alt: 'Full CafePress Business UK website prototype with UK product categories, a hero for branded promotional products, delivery and support highlights, and a row of popular categories.',
    caption: 'Prototype view. A proposed experience, not a launched site.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/cafepress uk/uk web.png', role: 'Storefront prototype chapter (full screenshot)',
  }),
  'planetart-concept-dashboard': img({
    id: 'planetart-concept-dashboard', file: 'planetart-concept-dashboard', width: 808, height: 514, widths: [808], fallback: 'jpg',
    alt: 'Original concept dashboard from the internship presentation with sales, profit, inventory-alert, and promotion summaries, a sales chart, revenue by category, and a task calendar.',
    caption: 'Original concept from the internship presentation. Proposed capabilities are not evidence of production deployment.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 11 (embedded image, native 808×514)', role: 'Original concept chapter',
    notes: 'Extracted at its native embedded resolution; not upscaled.',
  }),
  'planetart-concept-workflow': img({
    id: 'planetart-concept-workflow', file: 'planetart-concept-workflow', width: 620, height: 414, widths: [620], fallback: 'jpg',
    alt: 'Original concept map from the internship presentation, a merchandising dashboard branching into summary and alerts, products and inventory, vendor costs and pricing, and promotions and status.',
    caption: 'Concept structure from the same presentation.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 12 (embedded image, native 620×414)', role: 'Original concept chapter (supporting)',
  }),
  'planetart-concept-table': img({
    id: 'planetart-concept-table', file: 'planetart-concept-table', width: 681, height: 217, widths: [681], fallback: 'jpg',
    alt: 'Original product spreadsheet from the internship presentation with rows of products with vendor, category, website status, units sold and inventory columns.',
    caption: 'Product information kept in spreadsheets, from the internship presentation.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 11 (embedded image, native 681×217)', role: 'PlanetArt decision scene (before)',
    notes: 'Low resolution; shown no wider than native on 1x screens. Vendor names in the sheet are generic (“Vendor 1…”).',
  }),
  'sheet-plan': img({
    id: 'sheet-plan', file: 'sheet-plan', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Spreadsheet Agent assistant panel headed Review before building, showing a build plan with the source Northwind product catalog of 1,200 synthetic records, no filters, six columns, sort order, row limit, and the request words that were not used.',
    caption: 'The proposed build plan shown for review before the sheet is created.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Spreadsheet Agent approach (plan review)', timestamp: 20.5,
  }),
  'merch-replenish': img({
    id: 'merch-replenish', file: 'merch-replenish', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console product drawer for Canyon Pouch in the synthetic demo, showing a replenishment calculation, stock position and vendor lead time, with a note that the console does not place orders.',
    caption: 'Product detail with a replenishment calculation in the synthetic demo.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Merchandising Platform approach (product detail)', timestamp: 12.0,
  }),
  'merch-inventory': img({
    id: 'merch-inventory', file: 'merch-inventory', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console Inventory screen in the synthetic demo, ranking products that need replenishment by margin at risk, with an Export order sheet button.',
    caption: 'Inventory ranks what needs replenishment and exports an order sheet for review.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Merchandising Platform scrub still (inventory)', timestamp: 21.6,
  }),
  // Brief v19: the whole Spreadsheet Agent interface at 16:10, nothing cropped at either side.
  'sa-ui-request': img({
    id: 'sa-ui-request', file: 'sa-ui-request', width: 2880, height: 1800, widths: [800, 1200, 1600, 2400], fallback: 'jpg',
    alt: 'Spreadsheet Agent with an empty untitled sheet; the assistant panel holds the request “Create a sheet of B2B products with vendor, cost, retail price, and margin.”',
    caption: 'The request, before anything is built.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'spreadsheetagent.netlify.app (live prototype, captured 2026-09-25 at 1440 × 900 with the request “Create a sheet of B2B products with vendor, cost, retail price, and margin”)', role: 'Spreadsheet Agent step 1',
  }),
  'merch-ask': img({
    id: 'merch-ask', file: 'merch-ask', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console Ask screen in the synthetic demo, matching the question What is out of stock against fixed query shapes and listing products at risk of stocking out.',
    caption: 'The Ask screen matches questions to fixed query shapes. No language model is involved.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Merchandising Platform (review state; verifies no model integration)', timestamp: 46.0,
  }),
  'merch-promotions': img({
    id: 'merch-promotions', file: 'merch-promotions', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console Promotions screen in the synthetic demo, listing active, scheduled and ended promotions with their discounts.',
    caption: 'Promotions view in the synthetic demo.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Merchandising Platform (optional state)', timestamp: 36.5,
  }),
  'merch-catalog': img({
    id: 'merch-catalog', file: 'merch-catalog', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console catalog table in the synthetic demo listing products, vendors, margins, revenue, and stock status.',
    caption: 'Catalog view in the synthetic demo.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent prototype still', timestamp: 8.5,
  }),
  'merch-console-poster': img({
    id: 'merch-console-poster', file: 'merch-console-poster', width: 2940, height: 1486, widths: [960, 1600], fallback: 'jpg',
    alt: '', provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Video poster', timestamp: 0.3,
    notes: 'Opening Overview screen (0.3s), so the poster does not repeat the 8.5s catalog still; the cursor sits in empty space.',
  }),

  /* Spreadsheet Agent */
  'sheet-request': img({
    id: 'sheet-request', file: 'sheet-request', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Spreadsheet Agent with an empty untitled sheet; the assistant panel’s request field reads “Compare vendor prices across.”',
    caption: 'The request being entered.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Step 1 still', timestamp: 12.9,
  }),
  'sheet-returned': img({
    id: 'sheet-returned', file: 'sheet-returned', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Returned “Vendor Pricing and Margin” sheet with SKU, product, vendor, cost, retail price, and margin columns, beside the assistant panel.',
    caption: 'The returned sheet, with demo data.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Step 2 still', timestamp: 25.3,
  }),
  'sheet-list': img({
    id: 'sheet-list', file: 'sheet-list', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'The All Sheets view, now listing “Vendor Pricing and Margin” first among the saved sheets.',
    caption: 'Back in the collection of sheets.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Step 3 still', timestamp: 35.5,
  }),
  'spreadsheet-agent-poster': img({
    id: 'spreadsheet-agent-poster', file: 'spreadsheet-agent-poster', width: 2940, height: 1486, widths: [960, 1600], fallback: 'jpg',
    alt: '', provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Video poster', timestamp: 21,
    notes: 'The build plan under review (21s; the cursor rests in empty space below Row limit), so a visitor who sees only the poster (reduced motion, autoplay refused) still sees the review step.',
  }),

  /* Valiance */
  'valiance-messages': img({
    id: 'valiance-messages', file: 'valiance-messages', width: 1672, height: 941, widths: [800, 1200, 1672], fallback: 'jpg',
    alt: 'Illustrative leasing conversation with notes identifying current-data needs, approval boundaries, and human handoff.',
    caption: 'A leasing web chat between a prospective resident, the assistant, and a leasing team member.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/messages.png', role: 'Requirements chapter supporting image',
    notes: 'The image itself carries a small “Reconstruction · Invented data” footer; the property name and people are invented.',
  }),

  /* Jumpstart */
  'jumpstart-competitors': img({
    id: 'jumpstart-competitors', file: 'jumpstart-competitors', width: 2494, height: 1380, widths: [800, 1200, 1680, 2494], fallback: 'png',
    alt: 'Pitch slide comparing Jumpstart, Robinhood, Zogo, and Acorn on four features (educational, forum, gamified, real-time market data), as the team assessed them in 2024.',
    caption: 'Competitive comparison from the 2024 program pitch; a record of the team’s positioning assumptions at the time.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/competitors.png', role: 'Positioning chapter',
    notes: 'Historical assumptions; not a current description of the named companies.',
  }),

  /* Shift */
  'aristocracy-photo-234': img({
    id: 'aristocracy-photo-234', file: 'aristocracy-photo-234', width: 4252, height: 5665, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Aristocracy campaign photograph of three men in navy, burgundy, and black patterned suits against a pale studio backdrop.',
    caption: 'Aristocracy campaign photograph from the supplied project materials.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-234.jpg', role: 'Campaign imagery group',
  }),
  'aristocracy-photo-103': img({
    id: 'aristocracy-photo-103', file: 'aristocracy-photo-103', width: 4243, height: 5653, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Aristocracy campaign photograph of two men in pale teal and dusty pink pinstripe suits against a pale studio backdrop.',
    caption: 'Aristocracy campaign photograph from the supplied project materials.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-103.jpg', role: 'Campaign imagery group',
  }),
  'aristocracy-photo-077': img({
    id: 'aristocracy-photo-077', file: 'aristocracy-photo-077', width: 3775, height: 5030, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Aristocracy campaign photograph of three men in a grey check suit, a white dinner jacket, and a black jacket with check trousers.',
    caption: 'Aristocracy campaign photograph from the supplied project materials.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-077.jpg', role: 'Campaign imagery group',
  }),

  /* Presentation-frame fragments and posters (real frames only). */
  'merch-overview': img({
    id: 'merch-overview', file: 'merch-console-poster', width: 2940, height: 1486, widths: [960, 1600], fallback: 'jpg',
    alt: 'Merch Console overview in the synthetic demo, with product, vendor, inventory, pricing, promotion and sales data joined into one view.',
    caption: 'Merch Console overview screen. Synthetic data, separate from PlanetArt’s internal systems.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Presentation fragment (Merch Console overview)', timestamp: 0.3,
    notes: 'Same derivative files as merch-console-poster. The recording’s Ask screen states “There is no language model involved.”',
  }),
  'sheet-interpreting': img({
    id: 'sheet-interpreting', file: 'sheet-interpreting', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Spreadsheet Agent with an empty untitled sheet while the assistant panel shows “Interpreting request” for “Compare vendor prices across B2B products.”',
    caption: 'The simulated interpreting state between request and sheet.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Presentation fragment (Spreadsheet Agent transformation step)', timestamp: 18.9,
  }),
} satisfies Record<string, ImageAsset>

const v = (a: Omit<VideoAsset, 'type'>): VideoAsset => ({ type: 'video', ...a })

/* From src/content/media.ts, VIDEOS. */
export const UNPLACED_VIDEOS = {
  'merch-console': v({
    id: 'merch-console', title: 'Merchandising Dashboard walkthrough', width: 1600, height: 808, duration: 56.3,
    variants: [
      { src: '/media/video/merch-console-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 1_894_643 },
      { src: '/media/video/merch-console-1600.mp4', width: 1600, height: 808, bytes: 4_806_528 },
    ],
    poster: 'merch-replenish', posterTimestamp: 12, startAt: 11, hasAudio: false,
    caption: 'Recorded walkthrough of the 240-product catalog.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov (2940×1486, 60fps timebase, 57.3s)',
    notes: 'Silent screen recording (variable frame rate, 60fps timebase) encoded at 30fps and trimmed at 56.3s, before the macOS capture toolbar appears. The assistant-style panel is not evidence of a live model connection. The first play starts at 11s, just before the Canyon Pouch drawer opens (about 11.7 to 18s) with its 200 unit quantity and Show the working; the poster is that drawer at 12s (merch-replenish, the same 2940×1486 frame size), so a visitor who sees only the poster still sees the calculation.',
  }),
  'spreadsheet-agent': v({
    id: 'spreadsheet-agent', title: 'Spreadsheet Agent walkthrough', width: 1600, height: 808, duration: 36.4,
    variants: [{ src: '/media/video/spreadsheet-agent-1600.mp4', width: 1600, height: 808, bytes: 2_108_339 }],
    poster: 'spreadsheet-agent-poster', posterTimestamp: 21, startAt: 16.5, hasAudio: false,
    caption: 'From request to build plan to saved sheet.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (2940×1486, 60fps timebase, 37.8s)',
    notes: 'Silent screen recording (variable frame rate, 60fps timebase) encoded at 30fps and trimmed at 36.4s, before the macOS capture toolbar appears. The first play starts at 16.5s (the request almost typed): the build plan is on screen from 19.5 to 22.5s and the saved sheet from 25.3s.',
  }),
  /*
   * Edited, accelerated previews of the two recordings above (scripts/prepare-media.mjs, task `previews`), played
   * inline on the case pages with the label "Edited preview · 1.5× speed"; expanding plays the complete recording at
   * original speed, at the matching moment (the page's time map). Every moving part plays at exactly 1.5×; the edits
   * are cuts between screens (short dissolves), idle stretches left out, and still holds that give a state time to be
   * read. Neither implies how fast the product responds. No startAt: each begins on its strongest moment.
   */
  'merch-console-preview': v({
    id: 'merch-console-preview', title: 'Merchandising Dashboard walkthrough', width: 1600, height: 808, duration: 10.33,
    variants: [
      { src: '/media/video/merch-console-preview-960.mp4', width: 960, height: 484, maxViewport: 899, bytes: 404_235 },
      { src: '/media/video/merch-console-preview-1600.mp4', width: 1600, height: 808, bytes: 855_664 },
    ],
    poster: 'merch-replenish', posterTimestamp: 0, hasAudio: false,
    caption: 'Edited preview at 1.5× speed of the dashboard recording.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'Edited from PlanetArt/Merchandising Dashboard/Dashboard Video.mov (through its site encode, merch-console-1600.mp4, because the original is an iCloud placeholder that could not be downloaded; same timeline)',
    notes: 'Three parts of the complete recording at 1.5×: the Canyon Pouch drawer from 12.0s (200 units, the Kestrel Goods 200 unit minimum, the note that the console makes a calculation and a CSV export and does not place orders) with Show the working opened and held 3s; Inventory with Export order sheet (20.45 to 21.6s, held 1.3s); Ask running “What is out of stock?” with the query it ran above the answer (44.0 to 46.4s, held 1.8s). 0.25s dissolves between parts and back to the first frame. The poster (merch-replenish, 12.0s) is the first frame.',
  }),
  'spreadsheet-agent-preview': v({
    id: 'spreadsheet-agent-preview', title: 'Spreadsheet Agent walkthrough', width: 1600, height: 808, duration: 10.17,
    variants: [
      { src: '/media/video/spreadsheet-agent-preview-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 469_056 },
      { src: '/media/video/spreadsheet-agent-preview-1600.mp4', width: 1600, height: 808, bytes: 987_436 },
    ],
    poster: 'spreadsheet-agent-poster', posterTimestamp: 2.97, hasAudio: false,
    caption: 'Edited preview at 1.5× speed of the spreadsheet recording.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'Edited from Spreadsheet Agent/Spreadsheet Video.mov (2940×1486)',
    notes: 'One continuous stretch of the complete recording, 17.0 to 28.75s, at 1.5× (the sheet list and most of the typing, 0 to 17s, are left out): the request finishes (held 0.3s), the build plan appears at 1.8s (held 0.8s with the pointer on Build sheet), the sheet is created and fills to 1,200 rows from 5.8s, the reply that it is ready (held 1.2s), then a short scroll; a 0.3s dissolve back to the first frame. The poster is the build plan (21.0s of the recording, 2.97s here), so reduced motion and a refused autoplay still show the review step.',
  }),
} satisfies Record<string, VideoAsset>

/**
 * From src/content/crops/cafepress-uk.ts (scripts/crops/cafepress-uk.json). Its header, as it was:
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

export const UNPLACED_CAFEPRESS_UK_CROPS = {
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

/**
 * From src/content/crops/ai-leasing-agent.ts (scripts/crops/ai-leasing-agent.json). Its header, as it was:
 *
 * A view of one illustrative conversation (Valiance Capital/messages.png,
 * 1672×941, invented names and data; its own footer reads “Reconstruction ·
 * Invented data”). The page labels it “Illustrative conversation” once, and the
 * enlarged view opens the whole illustration (valiance-messages).
 *
 * - ala-conversation: the three messages with their avatars, names and times
 *   (Jordan, the prospective renter; Oski, the assistant; Sam, from the leasing
 *   team), cut in the white space above Jordan and above the message field, so
 *   no line of text is split. It is the ONE image of the desktop and tablet
 *   stage (brief-v8 section 11): the page emphasises one message after another
 *   over it instead of replacing it. At the 645px desktop stage the 18px chat
 *   text shows at about 14px (0.78×).
 */
const conversation = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'synthetic-example',
  synthetic: true,
  source: 'Valiance Capital/messages.png',
  ...a,
})

export const UNPLACED_AI_LEASING_AGENT_CROPS = {
  'ala-conversation': conversation({
    id: 'ala-conversation',
    width: 831,
    height: 640,
    widths: [640, 831],
    alt: 'Illustrative web chat for Maple Court apartments. Jordan, a prospective renter, asks for a two-bedroom under $2,600 near campus for August, mentions one cat and an August 15 move-in, and asks whether the application fee can be waived and unit 2B held. The assistant, Oski, offers general information about floor plans, pet policies, and the application process, and says the fee waiver and unit hold need review by leasing staff, who it will connect. Sam, from the Maple Court leasing team, takes over, offering to help with the fee waiver request and unit hold, and asks for an email or phone number.',
    role: 'AI Leasing Agent stage (desktop and tablet): the whole exchange, with each message emphasised in turn',
    crop: 'x 262–1093, y 208–848 of messages.png (the three messages, without the chat header and the message field)',
  }),
} satisfies Record<string, ImageAsset>

/**
 * From src/content/crops/jumpstart-finance.ts (scripts/crops/jumpstart-finance.json). Its header, as it was:
 *
 * Three of the original 2024 prototype screens (the profile, lessons and
 * community screens, proto 2–4), each cropped to its phone body (584×1194 in
 * every file) plus 8px of transparent margin, so all three sit in a 600×1210
 * canvas at exactly the same size. The case page itself now shows Harlie's
 * tile phones (jf-tile-*); these crops are no longer rendered.
 * Sources are the matte-removed full-resolution screens that
 * `node scripts/prepare-media.mjs images` writes to .media-cache/covers/
 * (from JumpStart Finance/proto 2–4.png; the screens are untouched).
 */
const screen = (id: string, proto: number, rect: string, alt: string): ImageAsset => ({
  id,
  type: 'image',
  file: id,
  width: 600,
  height: 1210,
  widths: [320, 480, 600],
  fallback: 'png',
  transparent: true,
  alt,
  provenance: 'original-artifact',
  synthetic: false,
  source: `JumpStart Finance/proto ${proto}.png`,
  role: 'Prototype screen crop (not rendered since the case page uses jf-tile-*)',
  crop: `${rect} of .media-cache/covers/proto-${proto}.png (the phone body plus 8px of transparent margin)`,
  opaque: { x: 1.33, y: 0.66, w: 97.33, h: 98.68 },
})

export const UNPLACED_JUMPSTART_FINANCE_CROPS = {
  'jf-screen-lessons': screen(
    'jf-screen-lessons',
    3,
    'x 14–614, y 9–1219',
    'Jumpstart prototype lessons screen with a lesson search field and a lesson card, Introduction to the basics of personal finance, with Start learning and Start the test buttons.',
  ),
  'jf-screen-progress': screen(
    'jf-screen-progress',
    2,
    'x 9–609, y 30–1240',
    'Jumpstart prototype profile screen for User 1 at Level 1, above a winding path of numbered levels.',
  ),
  'jf-screen-community': screen(
    'jf-screen-community',
    4,
    'x 18–618, y 5–1215',
    'Jumpstart prototype community screen with a member’s question about optimizing an investment portfolio in volatile markets, replies from other members, and each member’s level beside their name.',
  ),
} satisfies Record<string, ImageAsset>

/**
 * From src/content/media.ts, IMAGES and STAGE_MEDIA, as they were (moved 2026-09-29, when Harlie let the room files
 * go). Their files (room-1280.mp4, room-portrait-480.mp4, room-poster-*, room-poster-portrait-*) and the `room` task of
 * scripts/prepare-media.mjs that made them (with its note on the seam-free loop) are in git history; the source,
 * Background video.m4v, stays at the project root.
 */
export const UNPLACED_ROOM_IMAGES = {
  /*
   * The homepage room (scripts/prepare-media.mjs, task `room`): the first
   * frame of the seam-free loop. Not rendered since brief v16 (the homepage
   * plays the film, HomeFilm); kept, with STAGE_MEDIA.room, until Harlie
   * decides whether the room files can go. The portrait crop served
   * portrait phones.
   */
  'room-poster': img({
    id: 'room-poster', file: 'room-poster', width: 1280, height: 720, widths: [640, 960, 1280], fallback: 'jpg',
    alt: '',
    provenance: 'decorative-background', synthetic: false,
    source: 'Background video.m4v (frame 0)', role: 'Homepage room background poster (reduced motion, loading)',
  }),
  'room-poster-portrait': img({
    id: 'room-poster-portrait', file: 'room-poster-portrait', width: 480, height: 720, widths: [480], fallback: 'jpg',
    alt: '',
    provenance: 'decorative-background', synthetic: false,
    source: 'Background video.m4v (frame 0)', role: 'Homepage room background poster on portrait phones',
    crop: 'Centred 480×720 crop (x 400 to 880 of 1280×720), around the vanishing point',
  }),
} satisfies Record<string, ImageAsset>

export const UNPLACED_STAGE_MEDIA = {
  /**
   * The homepage's environment (brief v15): a dark architectural corridor
   * with a central vanishing point, glossy floor reflections and violet,
   * teal and small red uplights. The supplied file is a dolly in and back
   * that stops short (a plain loop snaps); the derivatives replay its
   * forward move out and back on one smooth path, at rest at the loop point,
   * so the loop has no visible seam (scripts/prepare-media.mjs, task `room`).
   * 12s per loop, 24fps, muted H.264. `portrait`: a centred crop for portrait
   * phones. Not rendered since brief v16; its files stay in public/media for now.
   */
  room: {
    desktop: { src: '/media/video/room-1280.mp4', width: 1280, height: 720, poster: 'room-poster' as const, bytes: 2_341_969 },
    portrait: { src: '/media/video/room-portrait-480.mp4', width: 480, height: 720, poster: 'room-poster-portrait' as const, bytes: 782_609 },
    source: 'Background video.m4v (1280×720, 24fps, 7.29s, 175 frames; the H.264 stream, frames 0 to 93)',
  },
} as const

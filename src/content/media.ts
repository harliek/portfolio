/**
 * Media provenance manifest.
 *
 * Every public image and video derivative is described here: where it came
 * from, what it is, whether its data is synthetic, and the alt text and
 * caption used on the site. Derivatives are produced by
 * scripts/prepare-media.mjs; widths below match the generated files
 * (public/media/img/{file}-{width}.{avif,webp,jpg|png}).
 *
 * The provenance field records whether each item is an original artifact,
 * a later reconstruction, a synthetic illustration, or a retrospective
 * diagram, so they are never confused here. The site shows no label for it.
 */

import { CROP_IMAGES } from './crops'

export type Provenance =
  | 'original-artifact'
  | 'independent-prototype'
  | 'synthetic-example'
  | 'retrospective-diagram'
  | 'prototype-recording'
  | 'agency-work'
  | 'personal-work'
  | 'portrait'
  /** Harlie's own hand-made diagram placed in a DiagramSlot (src/content/slots.ts). */
  | 'own-diagram'
  /** An art-directed atmospheric prop (AI-generated: no text, logos, UI or devices) placed in a PropSlot. */
  | 'art-directed-prop'
  /** A supplied presentation mockup (a device rendering for covers); not evidence of the product's format or content. */
  | 'presentation-mockup'
  /** Supplied illustrative cover artwork for a project tile (not evidence). */
  | 'cover-artwork'
  /** A supplied decorative environment behind a page (no project content, never captioned). */
  | 'decorative-background'

export interface ImageAsset {
  id: string
  type: 'image'
  /** Derivative basename under /media/img/. */
  file: string
  /** Intrinsic dimensions of the largest derivative's source. */
  width: number
  height: number
  /** Generated widths (never larger than the source). */
  widths: number[]
  fallback: 'jpg' | 'png'
  /** Has meaningful transparency (e.g. phone screenshots); no edge ring or box. */
  transparent?: boolean
  alt: string
  caption?: string
  provenance: Provenance
  synthetic: boolean
  /** Path of the original, relative to the project root (or old portfolio). */
  source: string
  role: string
  crop?: string
  /** Frame timestamp in seconds for stills taken from a recording. */
  timestamp?: number
  /**
   * The opaque object's bounds inside a transparent canvas, in percent of
   * the canvas (e.g. a phone body without its soft halo). Used to fit hit
   * areas and judge apparent size by the visible object, not the canvas.
   */
  opaque?: { x: number; y: number; w: number; h: number }
  notes?: string
}

export interface VideoVariant {
  src: string
  width: number
  height: number
  /** Use this variant when the viewport is at most this wide. */
  maxViewport?: number
  bytes: number
}

export interface VideoAsset {
  id: string
  type: 'video'
  title: string
  width: number
  height: number
  /** Seconds. */
  duration: number
  variants: VideoVariant[]
  poster: ImageId
  posterTimestamp: number
  /**
   * Seconds. Where the first playback begins (DemoVideo applies it once, before
   * the recording first plays; the loop then restarts from 0).
   */
  startAt?: number
  hasAudio: boolean
  caption: string
  provenance: Provenance
  synthetic: boolean
  source: string
  notes?: string
}

const img = (a: Omit<ImageAsset, 'type'>): ImageAsset => ({ type: 'image', ...a })

export const IMAGES = {
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
  'obj-merchandising-platform': img({
    id: 'obj-merchandising-platform', file: 'obj-merchandising-platform', width: 1536, height: 1024, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a desktop monitor showing a merchandising dashboard titled Merchandising Platform.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/merch dash.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'obj-cafepress-uk': img({
    id: 'obj-cafepress-uk', file: 'obj-cafepress-uk', width: 1162, height: 1075, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a green and white CafePress mug.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/cafepress uk.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'obj-spreadsheet-agent': img({
    id: 'obj-spreadsheet-agent', file: 'obj-spreadsheet-agent', width: 1536, height: 993, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a laptop showing a spreadsheet with an assistant panel, titled Spreadsheet Agent.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/spreadsheet agent.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'obj-ai-leasing-agent': img({
    id: 'obj-ai-leasing-agent', file: 'obj-ai-leasing-agent', width: 1085, height: 1359, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a tablet showing an apartment leasing website and chat, titled AI Leasing Agent.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/ai leasing.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'obj-creative-production': img({
    id: 'obj-creative-production', file: 'obj-creative-production', width: 1424, height: 957, widths: [160, 240, 360, 480, 720, 960], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a camera whose screen shows a filmmaker at sunset.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/creative production.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'obj-jumpstart-finance': img({
    id: 'obj-jumpstart-finance', file: 'obj-jumpstart-finance', width: 892, height: 1667, widths: [160, 240, 360, 480, 720, 892], fallback: 'png', transparent: true,
    alt: 'Cover artwork of a phone showing the Jumpstart app with lessons and progress.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final png tiles/jumpstart.png', role: 'Carousel object, case opening cover, next-project thumbnail',
    crop: 'Trimmed to visible pixels (alpha ≥ 8) plus 16px of transparent margin.',
  }),
  'film-bg-poster': img({
    id: 'film-bg-poster', file: 'film-bg-poster', width: 1920, height: 1080, widths: [960, 1280, 1920], fallback: 'jpg',
    alt: '',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio/_superseded/dist-old/home-bg.mp4 (frame at 12.5s)', role: 'Homepage film poster (HomeFilm; the only picture with reduced motion)',
  }),
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
  'art-portfolio-poster': img({
    id: 'art-portfolio-poster', file: 'art-portfolio-poster', width: 960, height: 540, widths: [640, 960], fallback: 'jpg',
    alt: 'Close view of wet pink, violet, and orange paint from the art portfolio video.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/posters/art-tile.jpg', role: 'About art portfolio preview poster',
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
  // Brief v21: homepage tiles prepared by Harlie (PNG Tiles/), made free-standing: backgrounds outside the objects removed, nothing inside altered.
  'jf-tile-home': img({
    id: 'jf-tile-home', file: 'jf-tile-home', width: 901, height: 1672, widths: [450, 901], fallback: 'png', transparent: true,
    alt: 'Jumpstart Finance home screen on a phone: total balance, a tip to diversify, shortcuts to portfolio, budget, banks, stocks, taxes and spending, and recent events.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 1.png (supplied by Harlie)', role: 'Jumpstart homepage tile, phone 1',
    crop: 'The white page around the phone removed (edge-connected fill; the rim anti-aliased toward the bezel).',
  }),
  'jf-tile-profile': img({
    id: 'jf-tile-profile', file: 'jf-tile-profile', width: 902, height: 1672, widths: [451, 902], fallback: 'png', transparent: true,
    alt: 'Jumpstart Finance profile screen on a phone: the learning journey with level 1 progress, 3 of 12 lessons, and the next levels.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 2.png (supplied by Harlie)', role: 'Jumpstart homepage tile, phone 2',
    crop: 'The white page around the phone removed (edge-connected fill; the rim anti-aliased toward the bezel).',
  }),
  'jf-tile-third': img({
    id: 'jf-tile-third', file: 'jf-tile-third', width: 788, height: 1628, widths: [394, 788], fallback: 'png', transparent: true,
    alt: 'Jumpstart Finance community screen on a phone: members asking and answering questions about investing.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 3.png (supplied by Harlie, already transparent)', role: 'Jumpstart homepage tile, phone 3',
    crop: 'Trimmed to its content.',
  }),
  // The three phones together (Profile, Home, Community), for the larger view on the case page (Harlie's request).
  'jf-phones-all': img({
    id: 'jf-phones-all', file: 'jf-phones-all', width: 2684, height: 1730, widths: [900, 1400, 2684], fallback: 'png', transparent: true,
    alt: 'Three Jumpstart Finance phone screens side by side: the learning path on the profile, the home screen with topics, and the community forum.',
    provenance: 'original-artifact', synthetic: false,
    source: 'Composed from PNG Tiles/jumpstart tile 1 to 3 (supplied by Harlie)', role: 'Jumpstart case page: the phones, larger',
  }),
  'cp-drinkware': img({
    id: 'cp-drinkware', file: 'cp-drinkware', width: 1672, height: 941, widths: [640, 960, 1280, 1672], fallback: 'jpg',
    alt: 'A CafePress Business UK drinkware page with a free UK delivery offer over £100, price and colour filters, and three drinkware products priced in pounds.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PlanetArt/cafepress uk/drinkware web.png (added by Harlie, 2026-09-25)', role: 'CafePress UK, the second section\'s picture (restored by Harlie\'s request, without a caption)',
  }),
  'about-art': img({
    id: 'about-art', file: 'about-art', width: 1440, height: 1796, widths: [480, 960, 1440], fallback: 'jpg',
    alt: 'A charcoal portrait by Harlie of an elderly woman in a headscarf, drawn in white on black.',
    provenance: 'original-artifact', synthetic: false,
    source: 'public/creative/art/oldwoman.JPG (the creative portfolio’s Charcoal Art page)', role: 'About, Creative work: the Art card',
  }),
  'about-art-time-unspoken': img({
    id: 'about-art-time-unspoken', file: 'about-art-time-unspoken', width: 480, height: 600, widths: [240, 480], fallback: 'jpg',
    alt: 'Time Unspoken, a charcoal portrait by Harlie of an elderly bearded man in a dark hood, one hand over his mouth.',
    provenance: 'personal-work', synthetic: false,
    source: 'public/creative/art/oldman.jpg (Time Unspoken, the creative portfolio’s Charcoal Art page), cropped to 4:5', role: 'About, Creative work: the Art card',
  }),
  'about-art-written-by-time': img({
    id: 'about-art-written-by-time', file: 'about-art-written-by-time', width: 480, height: 600, widths: [240, 480], fallback: 'jpg',
    alt: 'Written by Time, a charcoal portrait by Harlie of an old man with wild white hair and a full beard, staring straight out.',
    provenance: 'personal-work', synthetic: false,
    source: 'public/creative/art/oldman2.JPG (Written by Time, the creative portfolio’s Charcoal Art page), cropped to 4:5', role: 'About, Creative work: the Art card',
  }),
  'cp-assistant': img({
    id: 'cp-assistant', file: 'cp-assistant', width: 1672, height: 941, widths: [640, 960, 1280, 1672], fallback: 'jpg',
    alt: 'The CafePress Business UK storefront with an AI assistant panel open beside drinkware products priced in pounds.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PlanetArt/cafepress uk/cafepress uk ai agent.png (added by Harlie, 2026-09-25)', role: 'CafePress UK, the third section\'s picture (restored by Harlie\'s request, without a caption)',
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
  // Harlie's three AI Leasing images (Valiance Capital/, 2026-09-25, v29): illustrative mockups with invented people and figures.
  'valiance-listing': img({
    id: 'valiance-listing', file: 'valiance-listing', width: 1448, height: 1086, widths: [800, 1200, 1448], fallback: 'jpg',
    alt: 'A rental listing for a two-bedroom at 2425 Durant Ave, Berkeley, with the AI leasing assistant, powered by Valiance Capital and The Berkeley Group, answering questions about availability, pricing and pets.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/ai leasing 1.png (supplied by Harlie)', role: 'AI Leasing stage: inquiry scope and live property data',
  }),
  'valiance-dashboard': img({
    id: 'valiance-dashboard', file: 'valiance-dashboard', width: 1448, height: 1086, widths: [800, 1200, 1448], fallback: 'jpg',
    alt: 'A Valiance Capital and The Berkeley Group leasing dashboard across all 18 properties, with flagged conversations, recent messages, upcoming tours and message topics such as availability, pricing and tours.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/leasing dashboard 2.png (supplied by Harlie)', role: 'AI Leasing stage: testing and deployment',
  }),
  'valiance-inbox': img({
    id: 'valiance-inbox', file: 'valiance-inbox', width: 1536, height: 1024, widths: [800, 1200, 1536], fallback: 'jpg',
    alt: 'A leasing inbox with conversations flagged as needing a person, a renter conversation that confirms availability and books a tour, and the assistant’s notes.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/leasing messages 3.png (supplied by Harlie)', role: 'AI Leasing stage: staff escalation',
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
  'aristocracy-poster': img({
    id: 'aristocracy-poster', file: 'aristocracy-poster', width: 4000, height: 3000, widths: [960, 1440], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy.mp4', role: 'Video poster (4:3, uncropped)',
    timestamp: 30.5, notes: 'Every frame in 29.8–43.8s carries a burned-in subtitle; the uncropped poster keeps it. 30.5s differs from the 43.8s hero crop so the poster does not repeat it.',
  }),
  'nickleby-poster': img({
    id: 'nickleby-poster', file: 'nickleby-poster', width: 1138, height: 640, widths: [1138], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Nickleby Capital Video 1.mp4', role: 'Video poster',
    timestamp: 12, notes: 'Clean interview frame after the opening title card; no subtitle on screen.',
  }),
  'heck-poster': img({
    id: 'heck-poster', file: 'heck-poster', width: 1920, height: 1080, widths: [1280, 1920], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Heck Video.mp4', role: 'Video poster', timestamp: 30,
  }),
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

  /* About */
  headshot: img({
    id: 'headshot', file: 'headshot', width: 644, height: 755, widths: [360, 640], fallback: 'jpg',
    alt: 'Harlie Katz.', provenance: 'portrait', synthetic: false, source: 'personal assets/headshot copy.PNG', role: 'About portrait',
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
  'film-artistic-end': img({
    id: 'film-artistic-end', file: 'film-artistic-end', width: 1536, height: 895, widths: [640, 1280, 1536], fallback: 'jpg',
    alt: 'Poster for the short film An Artistic End, a woman covered in pink and violet paint leans against a painted wall, with the hand-lettered title.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art.jpg', role: 'Film page still',
  }),
  // Focused evidence crops, one registry per case study (src/content/crops/).
  ...CROP_IMAGES,
} satisfies Record<string, ImageAsset>

export type ImageId = keyof typeof IMAGES

const v = (a: Omit<VideoAsset, 'type'>): VideoAsset => ({ type: 'video', ...a })

export const VIDEOS = {
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
  aristocracy: v({
    id: 'aristocracy', title: 'Aristocracy', width: 1440, height: 1080, duration: 87.6,
    variants: [
      { src: '/media/video/aristocracy-960.mp4', width: 960, height: 720, maxViewport: 899, bytes: 9_841_702 },
      { src: '/media/video/aristocracy-1440.mp4', width: 1440, height: 1080, bytes: 20_235_447 },
    ],
    poster: 'aristocracy-poster', posterTimestamp: 30.5, hasAudio: true,
    caption: 'Agency campaign film. Shown here as part of the production work I supported.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Aristocracy.mp4 (4000×3000, 87.6s, 544MB; never served)',
  }),
  nickleby: v({
    id: 'nickleby', title: 'Nickleby Capital', width: 1138, height: 640, duration: 100.3,
    variants: [{ src: '/media/video/nickleby-640.mp4', width: 1138, height: 640, bytes: 7_407_595 }],
    poster: 'nickleby-poster', posterTimestamp: 12, hasAudio: true,
    caption: 'Interview film produced by Shift Content for Nickleby Capital.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Nickleby Capital Video 1.mp4 (1138×640, 100.3s)',
    notes: 'Lossless fast-start remux of the source. Nickleby Capital Video 2.mp4 is intentionally not published.',
  }),
  heck: v({
    id: 'heck', title: 'The Night Club Global Tour', width: 1920, height: 1080, duration: 37.2,
    variants: [
      { src: '/media/video/heck-720.mp4', width: 1280, height: 720, maxViewport: 899, bytes: 7_729_175 },
      { src: '/media/video/heck-1080.mp4', width: 1920, height: 1080, bytes: 12_927_297 },
    ],
    poster: 'heck-poster', posterTimestamp: 30, hasAudio: true,
    caption: 'Agency event film for The Night Club Global Tour, a run club event with Gymshark, with HECK branding in the film.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Heck Video.mp4 (1920×1080, 37.2s, 98.4MB)',
  }),
  'art-portfolio': v({
    id: 'art-portfolio', title: 'Art portfolio preview', width: 960, height: 540, duration: 12.26,
    variants: [{ src: '/media/video/art-portfolio-960.mp4', width: 960, height: 540, bytes: 1_929_395 }],
    poster: 'art-portfolio-poster', posterTimestamp: 1.5, hasAudio: false,
    caption: 'Paint in motion, from the original art portfolio.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art-tile.mp4 (1280×720, 12.26s; audio-free)',
    notes: 'Silent ambient loop for the About art portfolio preview. Scaled to 960px, no audio stream.',
  }),
} satisfies Record<string, VideoAsset>

export type VideoId = keyof typeof VIDEOS

/**
 * Decorative, muted, looping media behind the homepage. Not project
 * evidence. HomeFilm plays `film` (one file per device); `room` is no longer
 * rendered (StageBackground).
 */
export const STAGE_MEDIA = {
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
  /**
   * The original film background of Harlie's first portfolio homepage
   * (a woman in a black leather corset and red gloves, lit in red and blue).
   * Behind the homepage until brief v15 replaced it with the room, and again
   * since brief v16: HomeFilm plays it there (the poster alone with reduced
   * motion). Audio removed; 30fps H.264.
   */
  film: {
    desktop: { src: '/media/video/film-bg-1920.mp4', width: 1920, height: 1080, poster: 'film-bg-poster' as const, bytes: 2_503_862 },
    mobile: { src: '/media/video/film-bg-1280.mp4', width: 1280, height: 720, poster: 'film-bg-poster' as const, bytes: 1_160_726 },
    source: 'old portfolio/_superseded/dist-old/home-bg.mp4 (identical to the live original, and to public/creative/home-bg.mp4 until that copy was re-encoded smaller on 2026-09-26; 1920×1080, 25.4s; audio removed)',
  },
} as const

export const getImage = (id: ImageId): ImageAsset => IMAGES[id]
export const getVideo = (id: VideoId): VideoAsset => VIDEOS[id]

const IMG_BASE = '/media/img/'

/** Builds a srcset for one format. */
export function srcSet(asset: ImageAsset, format: 'avif' | 'webp' | 'jpg' | 'png'): string {
  return asset.widths.map((w) => `${IMG_BASE}${asset.file}-${w}.${format} ${w}w`).join(', ')
}

/** Fallback src: the widest variant not above `preferred`. */
export function fallbackSrc(asset: ImageAsset, preferred = 1200): string {
  const w = [...asset.widths].reverse().find((x) => x <= preferred) ?? asset.widths[0]
  return `${IMG_BASE}${asset.file}-${w}.${asset.fallback}`
}

/** Largest available variant (used by the enlargement dialog). */
export function largestSrc(asset: ImageAsset, format: 'avif' | 'webp' | 'jpg' | 'png'): string {
  return `${IMG_BASE}${asset.file}-${asset.widths[asset.widths.length - 1]}.${format}`
}

/**
 * Media provenance manifest.
 *
 * Every public image and video derivative is described here: where it came
 * from, what it is, whether its data is synthetic, and the alt text and
 * caption used on the site. Derivatives are produced by
 * scripts/prepare-media.mjs; widths below match the generated files
 * (public/media/img/{file}-{width}.{avif,webp,jpg|png}).
 *
 * The provenance field drives a visible label in figure captions so an
 * original artifact is never confused with a later reconstruction,
 * a synthetic illustration, or a retrospective diagram.
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

/** Visible caption label per provenance class (null = no label). */
export const PROVENANCE_LABEL: Record<Provenance, string | null> = {
  'original-artifact': 'Original artifact',
  'independent-prototype': 'Independent prototype · Synthetic data',
  'synthetic-example': 'Illustrative · Synthetic',
  'retrospective-diagram': 'Retrospective diagram',
  'prototype-recording': 'Prototype recording · Demo data',
  'agency-work': 'Agency work',
  'personal-work': 'Personal work',
  portrait: null,
  'own-diagram': 'Diagram by Harlie',
  'art-directed-prop': 'Art-directed prop (AI-generated)',
  'presentation-mockup': 'Presentation mockup',
  'cover-artwork': 'Illustrative cover artwork',
}

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
  hasAudio: boolean
  caption: string
  provenance: Provenance
  synthetic: boolean
  source: string
  notes?: string
}

const COVER_WIDTHS = [240, 480, 720, 960, 1200]

const img = (a: Omit<ImageAsset, 'type'>): ImageAsset => ({ type: 'image', ...a })

export const IMAGES = {
  /*
   * Carousel tiles (scripts/prepare-media.mjs, task `tiles`): one supplied
   * image per project from `final tiles/`, matched by content and cut to an
   * upright 3:4 tile around a focal point (originals untouched). Illustrative
   * cover artwork, not evidence.
   */
  'tile-cafepress-uk': img({
    id: 'tile-cafepress-uk', file: 'tile-cafepress-uk', width: 971, height: 1295, widths: [320, 480, 640, 960], fallback: 'jpg',
    alt: 'CafePress Business UK branded products on a sunlit desk: a tote bag, water bottle, mugs, hoodie, notebooks, and a lanyard in green and white.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/cp uk.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, y 113 to 1408 of 971×1619',
  }),
  'tile-merchandising-platform': img({
    id: 'tile-merchandising-platform', file: 'tile-merchandising-platform', width: 1086, height: 1448, widths: [320, 480, 640, 960], fallback: 'jpg',
    alt: 'A laptop on a sunlit desk showing a merchandising dashboard with product totals, sales performance, inventory status, top categories, and recent orders.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/merch.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, full image (1086×1448)',
  }),
  'tile-spreadsheet-agent': img({
    id: 'tile-spreadsheet-agent', file: 'tile-spreadsheet-agent', width: 1086, height: 1448, widths: [320, 480, 640, 960], fallback: 'jpg',
    alt: 'A laptop showing a spreadsheet of marketing performance beside an assistant panel, with SheetAgent branding on a mug and a notebook.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/speadsheet.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, full image (1086×1448)',
  }),
  'tile-ai-leasing-agent': img({
    id: 'tile-ai-leasing-agent', file: 'tile-ai-leasing-agent', width: 971, height: 1295, widths: [320, 480, 640, 960], fallback: 'jpg',
    alt: 'An apartment listing card with photos and a monthly price beside a leasing assistant chat, over a sunlit residential courtyard.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/valiance.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, y 162 to 1457 of 971×1619',
  }),
  'tile-jumpstart-finance': img({
    id: 'tile-jumpstart-finance', file: 'tile-jumpstart-finance', width: 971, height: 1295, widths: [320, 480, 640, 960], fallback: 'jpg',
    alt: 'Hands sketching a Jumpstart Finance concept map on paper, with notes about financial education, a student journey, and saving goals.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/jump.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, y 81 to 1376 of 971×1619',
  }),
  'tile-client-work': img({
    id: 'tile-client-work', file: 'tile-client-work', width: 941, height: 1255, widths: [320, 480, 640, 941], fallback: 'jpg',
    alt: 'An interview being filmed in a studio: a man speaking in an armchair, lit by a softbox, with a camera and a crew member in the foreground.',
    provenance: 'cover-artwork', synthetic: true,
    source: 'final tiles/shift.png', role: 'Homepage carousel tile, Work shelf thumbnail, next-project link',
    crop: '3:4 crop, y 292 to 1547 of 941×1672',
  }),
  'tile-about': img({
    id: 'tile-about', file: 'tile-about', width: 566, height: 755, widths: [320, 480, 566], fallback: 'jpg',
    alt: 'Portrait of Harlie Katz.',
    provenance: 'portrait', synthetic: false,
    source: 'personal assets/headshot copy.PNG', role: 'Homepage carousel About Me tile',
    crop: '3:4 crop at full height, x 33 to 599 of 644×755 (centred on the face)',
  }),
  /*
   * Carousel phones (scripts/prepare-media.mjs, task `phones`): the supplied
   * transparent PNG presentation mockups, normalized so every phone body is
   * the same height on one 944×1744 canvas (body 1600px tall, 72px from the
   * top). Presentation artwork, not evidence: screen content is illustrative.
   */
  'phone-cafepress-uk': img({
    id: 'phone-cafepress-uk', file: 'phone-cafepress-uk', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. CafePress Business UK storefront on a phone, with a hero for branded products for UK businesses, product categories, and featured products priced in pounds.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/uk.png', role: 'Homepage carousel phone',
    opaque: { x: 10.59, y: 4.13, w: 78.81, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  'phone-merchandising-platform': img({
    id: 'phone-merchandising-platform', file: 'phone-merchandising-platform', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Merchandising dashboard on a phone, with sales and inventory totals, a product assortment row, an inventory mix chart, vendor performance, and recent orders.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/merch dash.png', role: 'Homepage carousel phone',
    opaque: { x: 9.0, y: 4.13, w: 82.1, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  'phone-spreadsheet-agent': img({
    id: 'phone-spreadsheet-agent', file: 'phone-spreadsheet-agent', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Spreadsheet Agent on a phone, a product sheet with channel, units, revenue, growth, and margin columns above an assistant panel listing insights.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/spreadsheet.png', role: 'Homepage carousel phone',
    opaque: { x: 9.64, y: 4.13, w: 80.93, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  'phone-ai-leasing-agent': img({
    id: 'phone-ai-leasing-agent', file: 'phone-ai-leasing-agent', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Leasing website on a phone showing an apartment listing with photos and a monthly price, and a leasing assistant chat window below.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/valiance.png', role: 'Homepage carousel phone',
    opaque: { x: 10.38, y: 4.13, w: 79.34, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  'phone-jumpstart-finance': img({
    id: 'phone-jumpstart-finance', file: 'phone-jumpstart-finance', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Jumpstart financial education app on a phone, with a featured lesson, learning categories, a learning journey progress ring, recommended lessons, and community discussions.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/jumpstart.png', role: 'Homepage carousel phone',
    opaque: { x: 10.38, y: 4.13, w: 79.24, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  'phone-client-work': img({
    id: 'phone-client-work', file: 'phone-client-work', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Shift Content agency app on a phone, with a hero about content production, service categories, recent projects, and a content calendar.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/final png tiles/shift.png', role: 'Homepage carousel phone',
    opaque: { x: 7.52, y: 4.13, w: 84.96, h: 91.74 },
    notes: 'Supplied presentation mockup with a baked halo; screen content is illustrative, not product evidence.',
  }),
  /*
   * Supplied redraws of the 2024 Jumpstart prototype screens (same task and
   * canvas as the carousel phones). They add details the 2024 prototype did
   * not have, so they are presentation only; the case study's evidence is
   * the original screens (jumpstart-proto-1..4).
   */
  'jumpstart-mockup-home': img({
    id: 'jumpstart-mockup-home', file: 'jumpstart-mockup-home', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Redrawn Jumpstart home screen on a phone with a total balance, an assistant tip, learning topics such as portfolio, budget, banks, stocks, taxes, and spending, and recent activity.',
    caption: 'Presentation mockup redrawn from the 2024 prototype.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/jumpstart home.png', role: 'Jumpstart presentation image',
    opaque: { x: 7.73, y: 4.13, w: 84.53, h: 91.74 },
  }),
  'jumpstart-mockup-lessons': img({
    id: 'jumpstart-mockup-lessons', file: 'jumpstart-mockup-lessons', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Redrawn Jumpstart lessons screen on a phone with a featured introduction to personal finance and a grid of popular lessons.',
    caption: 'Presentation mockup redrawn from the 2024 prototype.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/jumpstart lessons.png', role: 'Jumpstart presentation image',
    opaque: { x: 7.63, y: 4.13, w: 84.96, h: 91.74 },
  }),
  'jumpstart-mockup-path': img({
    id: 'jumpstart-mockup-path', file: 'jumpstart-mockup-path', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Redrawn Jumpstart progress screen on a phone with a profile, points, and a winding learning journey of levels.',
    caption: 'Presentation mockup redrawn from the 2024 prototype.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/jumpstart path.png', role: 'Jumpstart presentation image',
    opaque: { x: 7.52, y: 4.13, w: 85.06, h: 91.74 },
  }),
  'jumpstart-mockup-community': img({
    id: 'jumpstart-mockup-community', file: 'jumpstart-mockup-community', width: 944, height: 1744, widths: [264, 396, 528, 792], fallback: 'png', transparent: true,
    alt: 'Presentation mockup. Redrawn Jumpstart community screen on a phone with member questions and replies about investing, each labeled with the member’s level.',
    caption: 'Presentation mockup redrawn from the 2024 prototype.',
    provenance: 'presentation-mockup', synthetic: true,
    source: 'png assets/jumpstart chat.png', role: 'Jumpstart presentation image',
    opaque: { x: 7.84, y: 4.13, w: 84.43, h: 91.74 },
  }),
  'cafepress-monitor': img({
    id: 'cafepress-monitor', file: 'cafepress-monitor', width: 1418, height: 1066, widths: [720, 1080, 1400], fallback: 'png', transparent: true,
    alt: 'The CafePress Business UK storefront prototype shown on a desktop monitor, with UK delivery and volume discount notices, a UK phone number, product categories, and a hero for branded promotional products for UK businesses.',
    caption: 'Storefront prototype presented on a desktop display.',
    provenance: 'presentation-mockup', synthetic: false,
    source: 'png assets/uk website.png (a supplied monitor mockup of PlanetArt/cafepress uk/uk web.png)', role: 'CafePress UK opening image',
    crop: 'Trimmed to the visible pixels plus 12px of transparent margin.',
  }),
  'art-portfolio-poster': img({
    id: 'art-portfolio-poster', file: 'art-portfolio-poster', width: 960, height: 540, widths: [640, 960], fallback: 'jpg',
    alt: 'Close view of wet pink, violet, and orange paint from the art portfolio video.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/posters/art-tile.jpg', role: 'About art portfolio preview poster',
  }),
  /*
   * 3:4 cover compositions (scripts/prepare-media.mjs, task `covers`): the
   * carousel tiles, Work shelf thumbnails and next-project links. Each holds
   * real evidence, contained, with a magnified crop of the same evidence.
   */
  'cover-cafepress-uk': img({
    id: 'cover-cafepress-uk', file: 'cover-cafepress-uk', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'CafePress Business UK storefront prototype above the internship’s Competitor Findings slide, which lists the competitors reviewed and the key patterns observed.',
    caption: 'Storefront prototype and competitor research from the internship.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/cafepress uk/uk web.png; PlanetArt/planetart presentation.pdf, page 4 (slide 5)', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Full storefront screenshot at 1080px wide (y 236), then the Competitor Findings slide region x 30–1770, y 24–774 of the 1880×1000 crop at 1080px wide (y 898), on a dark violet-lit 1200×1600 surface. The logo row at the bottom right of the slide is left out.',
  }),
  'cover-merchandising-platform': img({
    id: 'cover-merchandising-platform', file: 'cover-merchandising-platform', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Merch Console prototype with synthetic data, the catalog table above a magnified product drawer showing a replenishment calculation for Canyon Pouch.',
    caption: 'Independent prototype with synthetic data.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov (8.5s and 12.0s frames)', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Catalog frame at 1080px wide, then the drawer region x 1896–2940, y 0–800 of the 12.0s frame.',
  }),
  'cover-spreadsheet-agent': img({
    id: 'cover-spreadsheet-agent', file: 'cover-spreadsheet-agent', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Spreadsheet Agent prototype, the returned Vendor Pricing and Margin sheet above a magnified build plan headed Review before building.',
    caption: 'Prototype recording with demo data and simulated AI responses.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (25.3s and 20.5s frames)', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Returned-sheet frame at 1080px wide, then the assistant panel x 2168–2940, y 240–1230 of the 20.5s frame at 620px wide.',
  }),
  'cover-ai-leasing-agent': img({
    id: 'cover-ai-leasing-agent', file: 'cover-ai-leasing-agent', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Illustrative leasing web chat with invented data, labelled as such, shown whole above a magnified view of the message thread in which the assistant hands a fee waiver request to a leasing team member.',
    caption: 'Illustrative conversation with invented data. Not a production screenshot.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/messages.png', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Full image at 1080px wide, then the thread region x 268–1140, y 210–830 at 1080px wide; the label text is added on the cover.',
  }),
  'cover-jumpstart-finance': img({
    id: 'cover-jumpstart-finance', file: 'cover-jumpstart-finance', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Three Jumpstart prototype phone screens together, the home screen with learning topics in front of the lessons and level path screens.',
    caption: 'Prototype screens developed for the student venture.',
    provenance: 'original-artifact', synthetic: false,
    source: 'JumpStart Finance/proto 1.png, proto 2.png, proto 3.png', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Phone frames with the opaque matte removed, on a dark green-lit surface.',
  }),
  'cover-client-work': img({
    id: 'cover-client-work', file: 'cover-client-work', width: 1200, height: 1600, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Three stills from agency client films, an interview from Nickleby Capital, three men in tailored suits from Aristocracy, and a runner from The Night Club Global Tour.',
    caption: 'Frames from three agency client films.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Nickleby Capital Video 1.mp4 (12s), Aristocracy.mp4 (55s), Heck Video.mp4 (10s)', role: 'Carousel tile, Work shelf thumbnail, next-project link',
    crop: 'Uncropped 16:9 frames (Aristocracy cropped above its burned-in subtitle) on a warm-lit surface.',
  }),

  /* PlanetArt */
  'planetart-uk': img({
    id: 'planetart-uk', file: 'planetart-uk', width: 1672, height: 941, widths: [800, 1200, 1672], fallback: 'jpg',
    alt: 'Full CafePress Business UK website prototype with UK product categories, a hero for branded promotional products, delivery and support highlights, and a row of popular categories.',
    caption: 'Prototype view. A proposed experience, not a launched site.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/cafepress uk/uk web.png', role: 'Storefront prototype chapter (full screenshot)',
  }),
  'planetart-competitors': img({
    id: 'planetart-competitors', file: 'planetart-competitors', width: 1880, height: 1000, widths: [800, 1200, 1880], fallback: 'jpg',
    alt: 'Internship slide titled Competitor Findings, covering Printful, Prodigi, Printify, Vistaprint, and 4imprint, with observed patterns such as category-led sites, prominent brands, and a recurring eco-friendly theme.',
    caption: 'Competitive landscape.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 4 (slide 5)', role: 'UK research evidence (left)',
    crop: 'Page rendered at 200dpi (2000×1125), cropped to x 60–1940, y 60–1060.',
  }),
  'planetart-assortment': img({
    id: 'planetart-assortment', file: 'planetart-assortment', width: 1952, height: 1040, widths: [800, 1200, 1952], fallback: 'jpg',
    alt: 'Internship slide titled Curated UK Assortment Opportunities, listing focus areas and featured brands curated through UK vendors PF Concept and Ralawise.',
    caption: 'Potential UK suppliers and assortment.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 5 (slide 6)', role: 'UK research evidence (right)',
    crop: 'Page rendered at 200dpi, cropped to x 36–1988, y 60–1100.',
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
  'merch-vendors': img({
    id: 'merch-vendors', file: 'merch-vendors', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console vendor view with scorecards for fill rate, on-time delivery, consistency, quality, and cost trend.',
    caption: 'Vendor information within the same prototype.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent prototype still', timestamp: 28.7,
  }),
  'merch-drawer': img({
    id: 'merch-drawer', file: 'merch-drawer', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console product detail drawer showing stock-out risk, unit economics, and trailing 28-day figures for one product.',
    caption: 'A product detail view for reviewing related information.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent prototype still', timestamp: 53.9,
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
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Video poster', timestamp: 1.5,
    notes: 'Opening sheet-list frame, so the poster does not repeat the 25.3s hero and step-2 still.',
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
  'jumpstart-proto-1': img({
    id: 'jumpstart-proto-1', file: 'jumpstart-proto-1', transparent: true, width: 638, height: 1216, widths: [320, 638], fallback: 'png',
    alt: 'Jumpstart prototype home screen with a sample balance, learning topics such as portfolio, budget, banks, stocks, taxes, and spending, and a list of simulated events.',
    caption: 'Overview of the financial-learning prototype.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 1.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-2': img({
    id: 'jumpstart-proto-2', file: 'jumpstart-proto-2', transparent: true, width: 616, height: 1242, widths: [320, 616], fallback: 'png',
    alt: 'Jumpstart prototype profile screen with a winding path of numbered learning levels.',
    caption: 'A visible path through learning levels.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 2.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-3': img({
    id: 'jumpstart-proto-3', file: 'jumpstart-proto-3', transparent: true, width: 624, height: 1228, widths: [320, 624], fallback: 'png',
    alt: 'Jumpstart prototype lessons screen with a lesson search field and lesson cards, starting with an introduction to personal finance.',
    caption: 'Short lessons organized into a learning sequence.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 3.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-4': img({
    id: 'jumpstart-proto-4', file: 'jumpstart-proto-4', transparent: true, width: 628, height: 1232, widths: [320, 628], fallback: 'png',
    alt: 'Jumpstart prototype community screen with member questions and replies about investing, each labeled with the member’s level.',
    caption: 'A proposed community space alongside individual learning.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 4.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-competitors': img({
    id: 'jumpstart-competitors', file: 'jumpstart-competitors', width: 2494, height: 1380, widths: [800, 1200, 1680, 2494], fallback: 'png',
    alt: 'Pitch slide comparing Jumpstart, Robinhood, Zogo, and Acorn on four features (educational, forum, gamified, real-time market data), as the team assessed them in 2024.',
    caption: 'Competitive comparison from the 2024 program pitch; a record of the team’s positioning assumptions at the time.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/competitors.png', role: 'Positioning chapter',
    notes: 'Historical assumptions; not a current description of the named companies.',
  }),
  'jumpstart-business-model': img({
    id: 'jumpstart-business-model', file: 'jumpstart-business-model', width: 2016, height: 852, widths: [800, 1200, 2016], fallback: 'png',
    alt: 'Pitch slide of four proposed tiers, free basic features and educational content, $0.99 in-app purchases, a $10.49 monthly premium subscription, and a $100 yearly premium subscription.',
    caption: 'Proposed free and paid tiers from the program pitch. These were business-model assumptions, not revenue results.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/business model.png', role: 'Business-model chapter',
  }),
  'jumpstart-traction': img({
    id: 'jumpstart-traction', file: 'jumpstart-traction', width: 2040, height: 492, widths: [600, 1000, 2040], fallback: 'jpg',
    alt: 'Excerpt of the program pitch slide titled Traction and Validation, with the line 150 sign-ups in 24 hours.',
    caption: 'Excerpt of the traction slide from the team’s 2024 program pitch.',
    provenance: 'original-artifact', synthetic: false,
    source: 'JumpStart Finance/jumpstart presentation.pdf.pdf, page 10', role: 'Jumpstart Finance results (evidence for the reported sign-ups)',
    crop: 'Page 10 at 200dpi (4000×2250), region x 0–2040, y 1560–2052: the slide title and its first bullet. The second bullet, the Instagram profile and the reels are left out.',
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
  'film-aristocracy-a': img({
    id: 'film-aristocracy-a', file: 'film-aristocracy-a', width: 4000, height: 2250, widths: [320, 640], fallback: 'jpg',
    alt: 'Aristocracy film still of two models walking past the hand-drawn set between lights.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy.mp4', role: 'Film-strip still', timestamp: 10,
    crop: '16:9 crop above the burned-in subtitle.',
  }),
  'film-aristocracy-b': img({
    id: 'film-aristocracy-b', file: 'film-aristocracy-b', width: 4000, height: 2250, widths: [320, 640], fallback: 'jpg',
    alt: 'Aristocracy film still of three men in tailored suits beside a hand-drawn vintage car.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy.mp4', role: 'Film-strip still', timestamp: 55,
    crop: '16:9 crop above the burned-in subtitle.',
  }),
  'film-nickleby-a': img({
    id: 'film-nickleby-a', file: 'film-nickleby-a', width: 1138, height: 640, widths: [320, 640], fallback: 'jpg',
    alt: 'Nickleby Capital film still of an interviewee speaking, with a burned-in subtitle.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Nickleby Capital Video 1.mp4', role: 'Film-strip still', timestamp: 25,
  }),
  'film-nickleby-b': img({
    id: 'film-nickleby-b', file: 'film-nickleby-b', width: 1138, height: 640, widths: [320, 640], fallback: 'jpg',
    alt: 'Nickleby Capital film still of the interviewee seated in an armchair, holding a question card, with a burned-in subtitle.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Nickleby Capital Video 1.mp4', role: 'Film-strip still', timestamp: 50,
    notes: 'A wide interview frame. The previous B-roll frame (70s) was replaced so no shot reads as Harlie’s own footage; individual camera credits are not documented.',
  }),
  'film-heck-a': img({
    id: 'film-heck-a', file: 'film-heck-a', width: 1920, height: 1080, widths: [320, 640], fallback: 'jpg',
    alt: 'The Night Club Global Tour event film still of a runner smiling while carrying HECK-branded food under purple light.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Heck Video.mp4', role: 'Film-strip still', timestamp: 10,
  }),
  'film-heck-b': img({
    id: 'film-heck-b', file: 'film-heck-b', width: 1920, height: 1080, widths: [320, 640], fallback: 'jpg',
    alt: 'The Night Club Global Tour event film still of runners in reflective vests laughing on a city street at night.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Heck Video.mp4', role: 'Film-strip still', timestamp: 20,
  }),
  'stage-poster-desktop': img({
    id: 'stage-poster-desktop', file: 'stage-poster-desktop', width: 1112, height: 834, widths: [1112], fallback: 'jpg',
    alt: '', provenance: 'portrait', synthetic: false,
    source: 'inspiration/working-model-assets/background video.mp4 (frame 0)', role: 'Decorative background poster (desktop)',
    notes: 'Decorative architectural environment supplied in the Working Model asset pack; contains no project content.',
  }),
  'stage-poster-mobile': img({
    id: 'stage-poster-mobile', file: 'stage-poster-mobile', width: 470, height: 834, widths: [470], fallback: 'jpg',
    alt: '', provenance: 'portrait', synthetic: false,
    source: 'inspiration/working-model-assets/background video.mp4 (frame 0, centred 9:16 crop)', role: 'Decorative background poster (mobile)',
  }),
  /*
   * Drawings: every file in the previous portfolio's public/art folder.
   * `caption` is Harlie's own title from that portfolio (absent where the
   * old site gave none). Awards and publication notes are not shown.
   */
  'drawing-oldwoman': img({
    id: 'drawing-oldwoman', file: 'drawing-oldwoman', width: 1440, height: 1796, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of an elderly woman in a head scarf, her face deeply lined.',
    caption: 'A Life, Beautifully Worn',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/oldwoman.JPG', role: 'Art archive',
  }),
  'drawing-oldman': img({
    id: 'drawing-oldman', file: 'drawing-oldman', width: 1705, height: 2131, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of an elderly bearded man in a hood, a hand raised to his mouth.',
    caption: 'Time Unspoken',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/oldman.jpg', role: 'Art archive',
  }),
  'drawing-oldman2': img({
    id: 'drawing-oldman2', file: 'drawing-oldman2', width: 1440, height: 1799, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing of an elderly man with a white beard and a deeply lined face, looking straight ahead.',
    caption: 'Written by Time',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/oldman2.JPG', role: 'Art archive',
  }),
  'drawing-eye': img({
    id: 'drawing-eye', file: 'drawing-eye', width: 2446, height: 1668, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Close drawing of a single eye surrounded by deeply creased skin.',
    caption: 'Etched in Iris',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/eye.jpg', role: 'Art archive',
  }),
  'drawing-hands': img({
    id: 'drawing-hands', file: 'drawing-hands', width: 1179, height: 964, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing in white on black of two reaching hands, with a small figure in a flowing dress running between them.',
    caption: 'The Inevitable',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/hands.jpg', role: 'Art archive',
  }),
  'drawing-draw': img({
    id: 'drawing-draw', file: 'drawing-draw', width: 1130, height: 1468, widths: [480, 800, 1130], fallback: 'jpg',
    alt: 'Mixed media drawing of a woman with hair across her face and a cigarette at her lips, framed by a camera, a guitar neck, pencils and a book on a handwritten page.',
    caption: 'Written Under Glass',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/draw.jpg', role: 'Art archive',
  }),
  'drawing-smoke': img({
    id: 'drawing-smoke', file: 'drawing-smoke', width: 1679, height: 2098, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing of a woman with slicked back hair holding a cigarette to her lips.',
    caption: 'Illusion of Control',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/smoke.jpg', role: 'Art archive',
  }),
  'drawing-bite': img({
    id: 'drawing-bite', file: 'drawing-bite', width: 1816, height: 2271, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Close drawing of a woman’s face with closed eyes and a cigarette between her lips.',
    caption: 'Ember Kiss',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/bite.jpg', role: 'Art archive',
  }),
  'drawing-nyu': img({
    id: 'drawing-nyu', file: 'drawing-nyu', width: 861, height: 1202, widths: [480, 800, 861], fallback: 'jpg',
    alt: 'Drawing of a young woman with freckles looking directly at the viewer.',
    caption: 'She Is Art',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/nyu.jpg', role: 'Art archive',
  }),
  'drawing-close': img({
    id: 'drawing-close', file: 'drawing-close', width: 1920, height: 2400, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Close drawing of a woman’s face half covered by wet strands of hair.',
    caption: 'Soaked in Silence',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/close.jpg', role: 'Art archive',
  }),
  'drawing-body': img({
    id: 'drawing-body', file: 'drawing-body', width: 1179, height: 1447, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing in a few loose white strokes on black suggesting the outline of a standing figure.',
    caption: 'The Body’s Burden',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/body.jpg', role: 'Art archive',
  }),
  'drawing-baby': img({
    id: 'drawing-baby', file: 'drawing-baby', width: 1179, height: 1446, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing of a mother with her eyes closed holding a sleeping baby against her face.',
    caption: 'In Her Arms',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/baby.jpg', role: 'Art archive',
  }),
  'drawing-two': img({
    id: 'drawing-two', file: 'drawing-two', width: 1179, height: 1340, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing in white on black of a woman’s face paired with a second face in profile.',
    caption: 'Two Truths and 100 Lies',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/two.jpg', role: 'Art archive',
  }),
  'drawing-long': img({
    id: 'drawing-long', file: 'drawing-long', width: 2249, height: 2547, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of a woman’s face emerging from darkness, hair across her cheek.',
    caption: 'Lingering Ache',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/long.jpg', role: 'Art archive',
  }),
  'drawing-sex': img({
    id: 'drawing-sex', file: 'drawing-sex', width: 2661, height: 3253, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing of a woman’s tearful face beside a white outline figure, surrounded by handwritten lines of text.',
    caption: 'Sex Over Morals',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/sex.jpg', role: 'Art archive',
  }),
  'drawing-scribble': img({
    id: 'drawing-scribble', file: 'drawing-scribble', width: 1179, height: 1458, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing of a woman’s face with closed eyes beneath tangled white scribbled lines.',
    caption: 'White Noise',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/scribble.jpg', role: 'Art archive',
  }),
  'drawing-square': img({
    id: 'drawing-square', file: 'drawing-square', width: 1179, height: 1433, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing of a face emerging from dark scribbles, one eye covered by a black square on a stick.',
    caption: 'Blind Spot',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/square.jpg', role: 'Art archive',
  }),
  'drawing-tree': img({
    id: 'drawing-tree', file: 'drawing-tree', width: 1179, height: 1456, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Expressive drawing of a face with closed eyes behind dense vertical strokes.',
    caption: 'Deluge',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/tree.jpg', role: 'Art archive',
  }),
  'drawing-blur': img({
    id: 'drawing-blur', file: 'drawing-blur', width: 1179, height: 1468, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing of a woman whose face dissolves into horizontal smudges above her shoulders.',
    caption: 'Diminished Self',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/blur.jpg', role: 'Art archive',
  }),
  'drawing-drip': img({
    id: 'drawing-drip', file: 'drawing-drip', width: 1179, height: 1460, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Expressive drawing of a woman’s face dissolving into vertical drips.',
    caption: 'Slipping Mind',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/drip.jpg', role: 'Art archive',
  }),
  'drawing-turn': img({
    id: 'drawing-turn', file: 'drawing-turn', width: 1179, height: 1156, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing in white on black of a woman’s face in profile with her eyes closed.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/turn.jpg', role: 'Art archive',
  }),
  'drawing-line': img({
    id: 'drawing-line', file: 'drawing-line', width: 1170, height: 1448, widths: [480, 800, 1170], fallback: 'jpg',
    alt: 'Drawing in white line on black of a woman’s silhouette looking upward.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/line.jpg', role: 'Art archive',
  }),
  'drawing-man': img({
    id: 'drawing-man', file: 'drawing-man', width: 1986, height: 1581, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of an older bearded man exhaling smoke from a cigarette.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/man.jpg', role: 'Art archive',
  }),
  'film-artistic-end': img({
    id: 'film-artistic-end', file: 'film-artistic-end', width: 1536, height: 895, widths: [640, 1280, 1536], fallback: 'jpg',
    alt: 'Poster for the short film An Artistic End, a woman covered in pink and violet paint leans against a painted wall, with the hand-lettered title.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art.jpg', role: 'Film page still',
  }),
  'film-before-i-wilt': img({
    id: 'film-before-i-wilt', file: 'film-before-i-wilt', width: 1536, height: 1024, widths: [640, 1280, 1536], fallback: 'jpg',
    alt: 'Still from Before I Wilt, a young woman holding a red flower faces an older woman holding a wilted one, as if in a mirror.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/wilt.jpg', role: 'Film page still',
  }),
  'film-alex': img({
    id: 'film-alex', file: 'film-alex', width: 1536, height: 1024, widths: [640, 1280, 1536], fallback: 'jpg',
    alt: 'Still from Alex, two women meet in a parking garage, with the hand-lettered title.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/shana.png', role: 'Film page still',
  }),
  'film-my-world': img({
    id: 'film-my-world', file: 'film-my-world', width: 1536, height: 1024, widths: [640, 1280, 1536], fallback: 'jpg',
    alt: 'Still from My World, an older couple embraces on a blanket by the water at sunset, with the hand-lettered title.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/world.png', role: 'Film page still',
  }),
  'film-velvet': img({
    id: 'film-velvet', file: 'film-velvet', width: 2924, height: 1630, widths: [640, 1280, 1920], fallback: 'jpg',
    alt: 'Still from Velvet is Her Blood, a young woman with curly hair holds a knife against a glittering curtain.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/blood.png', role: 'Film page still',
  }),
  'film-first-edition': img({
    id: 'film-first-edition', file: 'film-first-edition', width: 1774, height: 1232, widths: [640, 1280, 1774], fallback: 'jpg',
    alt: 'Aerial still from First Edition, a white catamaran crossing open water.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/peter.png', role: 'Film page still',
  }),
  'film-relay': img({
    id: 'film-relay', file: 'film-relay', width: 2144, height: 1226, widths: [640, 1280, 1920], fallback: 'jpg',
    alt: 'Still from the Relay for Life film, a cancer survivor speaks at an evening track event.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/hope.png', role: 'Film page still',
  }),
  // Focused evidence crops, one registry per case study (src/content/crops/).
  ...CROP_IMAGES,
} satisfies Record<string, ImageAsset>

export type ImageId = keyof typeof IMAGES

const v = (a: Omit<VideoAsset, 'type'>): VideoAsset => ({ type: 'video', ...a })

export const VIDEOS = {
  'merch-console': v({
    id: 'merch-console', title: 'Merch Console walkthrough', width: 1600, height: 808, duration: 56.3,
    variants: [
      { src: '/media/video/merch-console-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 1_894_643 },
      { src: '/media/video/merch-console-1600.mp4', width: 1600, height: 808, bytes: 4_806_528 },
    ],
    poster: 'merch-console-poster', posterTimestamp: 0.3, hasAudio: false,
    caption: 'Recorded walkthrough of the Merch Console prototype.',
    provenance: 'independent-prototype', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov (2940×1486, 60fps timebase, 57.3s)',
    notes: 'Silent screen recording (variable frame rate, 60fps timebase) encoded at 30fps and trimmed at 56.3s, before the macOS capture toolbar appears. The assistant-style panel is not evidence of a live model connection.',
  }),
  'spreadsheet-agent': v({
    id: 'spreadsheet-agent', title: 'Spreadsheet Agent walkthrough', width: 1600, height: 808, duration: 36.4,
    variants: [
      { src: '/media/video/spreadsheet-agent-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 992_352 },
      { src: '/media/video/spreadsheet-agent-1600.mp4', width: 1600, height: 808, bytes: 2_108_339 },
    ],
    poster: 'spreadsheet-agent-poster', posterTimestamp: 1.5, hasAudio: false,
    caption: 'Walkthrough from request to saved sheet.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (2940×1486, 60fps timebase, 37.8s)',
    notes: 'Silent screen recording (variable frame rate, 60fps timebase) encoded at 30fps and trimmed at 36.4s, before the macOS capture toolbar appears.',
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
    poster: 'art-portfolio-poster', posterTimestamp: 0, hasAudio: false,
    caption: 'Paint in motion, from the original art portfolio.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art-tile.mp4 (1280×720, 12.26s; audio-free)',
    notes: 'Silent ambient loop for the About art portfolio preview. Scaled to 960px, no audio stream.',
  }),
} satisfies Record<string, VideoAsset>

export type VideoId = keyof typeof VIDEOS

/**
 * Decorative, muted, looping media: the persistent background set
 * (StageBackground). Not project evidence. Exactly one background file is
 * chosen per device.
 */
export const STAGE_MEDIA = {
  background: {
    desktop: { src: '/media/video/stage-desktop.mp4', width: 1112, height: 834, poster: 'stage-poster-desktop' as const, bytes: 760_000 },
    mobile: { src: '/media/video/stage-mobile.mp4', width: 470, height: 834, poster: 'stage-poster-mobile' as const, bytes: 250_000 },
    source: 'inspiration/working-model-assets/background video.mp4 (1112×834, 24fps, 6.08s; audio removed)',
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

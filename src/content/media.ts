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

export type Provenance =
  | 'original-artifact'
  | 'independent-reconstruction'
  | 'synthetic-example'
  | 'retrospective-diagram'
  | 'prototype-recording'
  | 'agency-work'
  | 'personal-work'
  | 'portrait'

/** Visible caption label per provenance class (null = no label). */
export const PROVENANCE_LABEL: Record<Provenance, string | null> = {
  'original-artifact': 'Original artifact',
  'independent-reconstruction': 'Independent reconstruction · Synthetic data',
  'synthetic-example': 'Illustrative · Synthetic',
  'retrospective-diagram': 'Retrospective diagram',
  'prototype-recording': 'Prototype recording · Demo data',
  'agency-work': 'Agency work',
  'personal-work': 'Personal work',
  portrait: null,
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

const COVER_WIDTHS = [480, 800, 1200, 1600]

const img = (a: Omit<ImageAsset, 'type'>): ImageAsset => ({ type: 'image', ...a })

export const IMAGES = {
  /* Covers: deliberate 16:10 compositions shared by home cards and case heroes. */
  'cover-planetart': img({
    id: 'cover-planetart', file: 'cover-planetart', width: 1600, height: 1000, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'CafePress Business UK website prototype: a storefront hero reading “Branded Promotional Products for UK Businesses,” with UK categories and delivery details.',
    caption: 'CafePress UK website prototype created during the internship.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/cafepress uk/uk web.png', role: 'Home card cover and PlanetArt hero',
    crop: 'Full screenshot scaled to 1376px wide, centered on a dark neutral 1600×1000 surface.',
  }),
  'cover-valiance': img({
    id: 'cover-valiance', file: 'cover-valiance', width: 1600, height: 1000, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Diagram titled “A leasing question can require different kinds of answers”: a leasing question branches to general information, current property data, and a human decision.',
    caption: 'A summary of the response boundaries explored in the leasing workflow.',
    provenance: 'retrospective-diagram', synthetic: false,
    source: 'scripts/prepare-media.mjs (coverValianceHtml)', role: 'Home card cover and Valiance hero',
    notes: 'Editorial diagram made for this portfolio from the requirements narrative; not a platform screenshot.',
  }),
  'cover-spreadsheet': img({
    id: 'cover-spreadsheet', file: 'cover-spreadsheet', width: 1600, height: 1000, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Spreadsheet Agent prototype: a returned “Vendor Pricing and Margin” sheet beside an assistant panel showing the request “Compare vendor prices across B2B products.”',
    caption: 'A recorded prototype state using demo data.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Home card cover and Spreadsheet Agent hero',
    timestamp: 25.3, crop: 'x 435–2813 of 2940 (sheet and assistant panel; sidebar removed), full height, scaled to 1600×1000.',
  }),
  'cover-jumpstart': img({
    id: 'cover-jumpstart', file: 'cover-jumpstart', width: 1600, height: 1000, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Two Jumpstart prototype phone screens: a home screen with learning topics and a profile screen with a winding path of levels.',
    caption: 'Prototype screens developed for the student venture.',
    provenance: 'original-artifact', synthetic: false,
    source: 'JumpStart Finance/proto 1.png + proto 2.png', role: 'Home card cover and Jumpstart hero',
    crop: 'Both screens at 880px tall on a dark surface; opaque white matte around the phone frames removed.',
  }),
  'cover-shift': img({
    id: 'cover-shift', file: 'cover-shift', width: 1600, height: 1000, widths: COVER_WIDTHS, fallback: 'jpg',
    alt: 'Still from the Aristocracy campaign film: three men in green, blue, and red suits on a hand-drawn set, one raising a kite.',
    caption: 'Aristocracy campaign film still. Agency production.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Aristocracy.mp4', role: 'Home card cover and Shift hero',
    timestamp: 43.8, crop: '16:10 crop (y 120–2620 of 3000) above the burned-in subtitle. The film itself is never cropped.',
  }),

  /* PlanetArt */
  'planetart-uk': img({
    id: 'planetart-uk', file: 'planetart-uk', width: 1672, height: 941, widths: [800, 1200, 1672], fallback: 'jpg',
    alt: 'Full CafePress Business UK website prototype: UK product categories, a hero for branded promotional products, delivery and support highlights, and a row of popular categories.',
    caption: 'Prototype view. This shows a proposed experience, not evidence of a completed UK launch.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/cafepress uk/uk web.png', role: 'Storefront prototype chapter (full screenshot)',
  }),
  'planetart-competitors': img({
    id: 'planetart-competitors', file: 'planetart-competitors', width: 1880, height: 1000, widths: [800, 1200, 1880], fallback: 'jpg',
    alt: 'Internship slide “Competitor Findings”: Printful, Prodigi, Printify, Vistaprint, and 4imprint, with observed patterns such as category-led sites, prominent brands, and a recurring eco-friendly theme.',
    caption: 'Competitive landscape.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 4 (slide 5)', role: 'UK research evidence (left)',
    crop: 'Page rendered at 200dpi (2000×1125), cropped to x 60–1940, y 60–1060.',
  }),
  'planetart-assortment': img({
    id: 'planetart-assortment', file: 'planetart-assortment', width: 1952, height: 1040, widths: [800, 1200, 1952], fallback: 'jpg',
    alt: 'Internship slide “Curated UK Assortment Opportunities”: focus areas and featured brands curated through UK vendors PF Concept and Ralawise.',
    caption: 'Potential UK suppliers and assortment.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 5 (slide 6)', role: 'UK research evidence (right)',
    crop: 'Page rendered at 200dpi, cropped to x 36–1988, y 60–1100.',
  }),
  'planetart-concept-dashboard': img({
    id: 'planetart-concept-dashboard', file: 'planetart-concept-dashboard', width: 808, height: 514, widths: [808], fallback: 'jpg',
    alt: 'Original concept dashboard from the internship presentation: sales, profit, inventory-alert, and promotion summaries, a sales chart, revenue by category, and a task calendar.',
    caption: 'Original concept from the internship presentation. Proposed capabilities are not evidence of production deployment.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 11 (embedded image, native 808×514)', role: 'Original concept chapter',
    notes: 'Extracted at its native embedded resolution; not upscaled.',
  }),
  'planetart-concept-workflow': img({
    id: 'planetart-concept-workflow', file: 'planetart-concept-workflow', width: 620, height: 414, widths: [620], fallback: 'jpg',
    alt: 'Original concept map from the internship presentation: a merchandising dashboard branching into summary and alerts, products and inventory, vendor costs and pricing, and promotions and status.',
    caption: 'Concept structure from the same presentation.',
    provenance: 'original-artifact', synthetic: false,
    source: 'PlanetArt/planetart presentation.pdf, page 12 (embedded image, native 620×414)', role: 'Original concept chapter (supporting)',
  }),
  'merch-catalog': img({
    id: 'merch-catalog', file: 'merch-catalog', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console catalog table in the synthetic demo: products, vendors, margins, revenue, and stock status.',
    caption: 'Catalog view in the synthetic demo.',
    provenance: 'independent-reconstruction', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent rebuild still', timestamp: 8.5,
  }),
  'merch-vendors': img({
    id: 'merch-vendors', file: 'merch-vendors', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console vendor view: scorecards for fill rate, on-time delivery, consistency, quality, and cost trend.',
    caption: 'Vendor information within the same prototype.',
    provenance: 'independent-reconstruction', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent rebuild still', timestamp: 28.7,
  }),
  'merch-drawer': img({
    id: 'merch-drawer', file: 'merch-drawer', width: 2940, height: 1486, widths: [800, 1200, 1600], fallback: 'jpg',
    alt: 'Merch Console product detail drawer: stock-out risk, unit economics, and trailing 28-day figures for one product.',
    caption: 'A product detail view for reviewing related information.',
    provenance: 'independent-reconstruction', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Independent rebuild still', timestamp: 53.9,
  }),
  'merch-console-poster': img({
    id: 'merch-console-poster', file: 'merch-console-poster', width: 2940, height: 1486, widths: [960, 1600], fallback: 'jpg',
    alt: '', provenance: 'independent-reconstruction', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', role: 'Video poster', timestamp: 8.5,
    notes: '8.5s chosen over 10.3s so the cursor sits in empty space rather than over row text.',
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
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', role: 'Video poster', timestamp: 25.3,
  }),

  /* Valiance */
  'valiance-messages': img({
    id: 'valiance-messages', file: 'valiance-messages', width: 1672, height: 941, widths: [800, 1200, 1672], fallback: 'jpg',
    alt: 'Illustrative leasing conversation with notes identifying current-data needs, approval boundaries, and human handoff.',
    caption: 'Illustrative leasing scenario. Synthetic conversation; not a production screenshot.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/messages.png', role: 'Requirements chapter supporting image',
    notes: 'The image itself carries a small “Reconstruction · Invented data” footer; the property name and people are invented.',
  }),

  /* Jumpstart */
  'jumpstart-proto-1': img({
    id: 'jumpstart-proto-1', file: 'jumpstart-proto-1', width: 638, height: 1216, widths: [320, 638], fallback: 'png',
    alt: 'Jumpstart prototype home screen: a sample balance, learning topics such as portfolio, budget, banks, stocks, taxes, and spending, and a list of simulated events.',
    caption: 'Overview of the financial-learning prototype.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 1.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-2': img({
    id: 'jumpstart-proto-2', file: 'jumpstart-proto-2', width: 616, height: 1242, widths: [320, 616], fallback: 'png',
    alt: 'Jumpstart prototype profile screen with a winding path of numbered learning levels.',
    caption: 'A visible path through learning levels.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 2.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-3': img({
    id: 'jumpstart-proto-3', file: 'jumpstart-proto-3', width: 624, height: 1228, widths: [320, 624], fallback: 'png',
    alt: 'Jumpstart prototype lessons screen: a lesson search field and lesson cards, starting with an introduction to personal finance.',
    caption: 'Short lessons organized into a learning sequence.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/proto 3.png', role: 'Prototype chapter',
    crop: 'Opaque matte outside the phone frame removed; screen untouched.',
  }),
  'jumpstart-proto-4': img({
    id: 'jumpstart-proto-4', file: 'jumpstart-proto-4', width: 628, height: 1232, widths: [320, 628], fallback: 'png',
    alt: 'Jumpstart prototype community screen: member questions and replies about investing, each labeled with the member’s level.',
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
    alt: 'Pitch slide of four proposed tiers: free basic features and educational content, $0.99 in-app purchases, a $10.49 monthly premium subscription, and a $100 yearly premium subscription.',
    caption: 'Proposed free and paid tiers from the program pitch. These were business-model assumptions, not revenue results.',
    provenance: 'original-artifact', synthetic: false, source: 'JumpStart Finance/business model.png', role: 'Business-model chapter',
  }),

  /* Shift */
  'aristocracy-poster': img({
    id: 'aristocracy-poster', file: 'aristocracy-poster', width: 4000, height: 3000, widths: [960, 1440], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy.mp4', role: 'Video poster (4:3, uncropped)',
    timestamp: 43.8, notes: 'Every frame in 29.8–43.8s carries a burned-in subtitle; the uncropped poster keeps it.',
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
    alt: 'Aristocracy campaign photograph: three men in navy, burgundy, and black patterned suits against a pale studio backdrop.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-234.jpg', role: 'Campaign imagery group',
  }),
  'aristocracy-photo-103': img({
    id: 'aristocracy-photo-103', file: 'aristocracy-photo-103', width: 4243, height: 5653, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Aristocracy campaign photograph: two men in pale teal and dusty pink pinstripe suits against a pale studio backdrop.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-103.jpg', role: 'Campaign imagery group',
  }),
  'aristocracy-photo-077': img({
    id: 'aristocracy-photo-077', file: 'aristocracy-photo-077', width: 3775, height: 5030, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Aristocracy campaign photograph: three men in a grey check suit, a white dinner jacket, and a black jacket with check trousers.',
    provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy-077.jpg', role: 'Campaign imagery group',
  }),

  /* About */
  headshot: img({
    id: 'headshot', file: 'headshot', width: 644, height: 755, widths: [360, 640], fallback: 'jpg',
    alt: 'Harlie Katz.', provenance: 'portrait', synthetic: false, source: 'personal assets/headshot copy.PNG', role: 'About portrait',
  }),
  'drawing-oldwoman': img({
    id: 'drawing-oldwoman', file: 'drawing-oldwoman', width: 1440, height: 1796, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of an elderly woman in a head scarf, her face deeply lined.',
    caption: 'Portrait study.', provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/oldwoman.JPG', role: 'About drawings',
  }),
  'drawing-oldman': img({
    id: 'drawing-oldman', file: 'drawing-oldman', width: 1705, height: 2131, widths: [480, 800, 1200], fallback: 'jpg',
    alt: 'Drawing in white on black of an elderly bearded man in a hood, a hand raised to his mouth.',
    caption: 'Portrait study.', provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/oldman.jpg', role: 'About drawings',
  }),
  'drawing-hands': img({
    id: 'drawing-hands', file: 'drawing-hands', width: 1179, height: 964, widths: [480, 800, 1179], fallback: 'jpg',
    alt: 'Drawing in white on black of two reaching hands, with a small figure in a flowing dress running between them.',
    caption: 'Hand study.', provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/art/hands.jpg', role: 'About drawings',
  }),
} satisfies Record<string, ImageAsset>

export type ImageId = keyof typeof IMAGES

const v = (a: Omit<VideoAsset, 'type'>): VideoAsset => ({ type: 'video', ...a })

export const VIDEOS = {
  'merch-console': v({
    id: 'merch-console', title: 'Merch Console walkthrough', width: 1600, height: 808, duration: 57.3,
    variants: [
      { src: '/media/video/merch-console-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 1_900_000 },
      { src: '/media/video/merch-console-1600.mp4', width: 1600, height: 808, bytes: 4_800_000 },
    ],
    poster: 'merch-console-poster', posterTimestamp: 8.5, hasAudio: false,
    caption: 'Recorded walkthrough of the independent Merch Console prototype.',
    provenance: 'independent-reconstruction', synthetic: true,
    source: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov (2940×1486, 60fps, 57.3s)',
    notes: 'Silent screen recording; reduced to 30fps. The assistant-style panel is not evidence of a live model connection.',
  }),
  'spreadsheet-agent': v({
    id: 'spreadsheet-agent', title: 'Spreadsheet Agent walkthrough', width: 1600, height: 808, duration: 37.8,
    variants: [
      { src: '/media/video/spreadsheet-agent-960.mp4', width: 960, height: 486, maxViewport: 899, bytes: 1_000_000 },
      { src: '/media/video/spreadsheet-agent-1600.mp4', width: 1600, height: 808, bytes: 2_100_000 },
    ],
    poster: 'spreadsheet-agent-poster', posterTimestamp: 25.3, hasAudio: false,
    caption: 'Recorded walkthrough. The AI response is simulated; this is not a demonstration of live model execution.',
    provenance: 'prototype-recording', synthetic: true,
    source: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (2940×1486, 60fps, 37.8s)',
    notes: 'Silent screen recording; reduced to 30fps.',
  }),
  aristocracy: v({
    id: 'aristocracy', title: 'Aristocracy', width: 1440, height: 1080, duration: 87.6,
    variants: [
      { src: '/media/video/aristocracy-960.mp4', width: 960, height: 720, maxViewport: 899, bytes: 9_800_000 },
      { src: '/media/video/aristocracy-1440.mp4', width: 1440, height: 1080, bytes: 20_200_000 },
    ],
    poster: 'aristocracy-poster', posterTimestamp: 43.8, hasAudio: true,
    caption: 'Agency campaign film. Shown here as part of the production work I supported.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Aristocracy.mp4 (4000×3000, 87.6s, 544MB; never served)',
  }),
  nickleby: v({
    id: 'nickleby', title: 'Nickleby Capital', width: 1138, height: 640, duration: 100.3,
    variants: [{ src: '/media/video/nickleby-640.mp4', width: 1138, height: 640, bytes: 7_400_000 }],
    poster: 'nickleby-poster', posterTimestamp: 12, hasAudio: true,
    caption: 'One film from the supplied Nickleby Capital project materials.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Nickleby Capital Video 1.mp4 (1138×640, 100.3s)',
    notes: 'Lossless fast-start remux of the source. Nickleby Capital Video 2.mp4 is intentionally not published.',
  }),
  heck: v({
    id: 'heck', title: 'The Night Club / HECK', width: 1920, height: 1080, duration: 37.2,
    variants: [
      { src: '/media/video/heck-720.mp4', width: 1280, height: 720, maxViewport: 899, bytes: 7_700_000 },
      { src: '/media/video/heck-1080.mp4', width: 1920, height: 1080, bytes: 12_900_000 },
    ],
    poster: 'heck-poster', posterTimestamp: 30, hasAudio: true,
    caption: 'Agency event film. The title follows the project context and branding visible in the supplied materials.',
    provenance: 'agency-work', synthetic: false,
    source: 'Shift Content/Heck Video.mp4 (1920×1080, 37.2s, 98.4MB)',
  }),
} satisfies Record<string, VideoAsset>

export type VideoId = keyof typeof VIDEOS

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

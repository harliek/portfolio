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
 *
 * Entries nothing on the site renders were moved to
 * archive/media-registry-unplaced.ts on 2026-09-29 (not bundled), with
 * their provenance notes. The same day the files only those entries used,
 * and the homepage room's (STAGE_MEDIA.room, room-poster), were removed from
 * public/media (git history keeps them).
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
   * The seventh, obj-about, is no longer rendered; its entry is in
   * archive/media-registry-unplaced.ts.
   */
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
  'art-portfolio-poster': img({
    id: 'art-portfolio-poster', file: 'art-portfolio-poster', width: 960, height: 540, widths: [640, 960], fallback: 'jpg',
    alt: 'Close view of wet pink, violet, and orange paint from the art portfolio video.',
    provenance: 'personal-work', synthetic: false,
    source: 'old portfolio copy/public/posters/art-tile.jpg', role: 'About art portfolio preview poster',
  }),

  /* PlanetArt */
  // Brief v21: homepage tiles prepared by Harlie (PNG Tiles/), made free-standing: backgrounds outside the objects removed, nothing inside altered.
  'jf-tile-home': img({
    id: 'jf-tile-home', file: 'jf-tile-home', width: 901, height: 1672, widths: [450, 901], fallback: 'png', transparent: true,
    alt: 'A 2026 redraw of the Jumpstart Finance prototype’s home screen on a phone: total balance, a tip to diversify, shortcuts to portfolio, budget, banks, stocks, taxes and spending, and recent events.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 1.png (supplied by Harlie)', role: 'Jumpstart homepage tile, phone 1',
    crop: 'The white page around the phone removed (edge-connected fill; the rim anti-aliased toward the bezel).',
  }),
  'jf-tile-profile': img({
    id: 'jf-tile-profile', file: 'jf-tile-profile', width: 902, height: 1672, widths: [451, 902], fallback: 'png', transparent: true,
    alt: 'A 2026 redraw of the Jumpstart Finance prototype’s profile screen on a phone: a learning journey with level progress and the next levels.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 2.png (supplied by Harlie)', role: 'Jumpstart homepage tile, phone 2',
    crop: 'The white page around the phone removed (edge-connected fill; the rim anti-aliased toward the bezel).',
  }),
  'jf-tile-third': img({
    id: 'jf-tile-third', file: 'jf-tile-third', width: 788, height: 1628, widths: [394, 788], fallback: 'png', transparent: true,
    alt: 'A 2026 redraw of the Jumpstart Finance prototype’s community screen on a phone: members asking and answering questions about investing.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PNG Tiles/jumpstart tile 3.png (supplied by Harlie, already transparent)', role: 'Jumpstart homepage tile, phone 3',
    crop: 'Trimmed to its content.',
  }),
  // The three phones together (Profile, Home, Community), for the larger view on the case page (Harlie's request).
  // Only ever opened in ImageDialog, which loads the largest width, so 2684 is the only width kept (2026-09-29).
  'jf-phones-all': img({
    id: 'jf-phones-all', file: 'jf-phones-all', width: 2684, height: 1730, widths: [2684], fallback: 'png', transparent: true,
    alt: 'Three Jumpstart Finance phone screens redrawn in 2026 from the 2024 prototype: the learning path on the profile, the home screen with topics, and the community forum.',
    provenance: 'original-artifact', synthetic: false,
    source: 'Composed from PNG Tiles/jumpstart tile 1 to 3 (supplied by Harlie)', role: 'Jumpstart case page: the phones, larger',
  }),
  'cp-drinkware': img({
    id: 'cp-drinkware', file: 'cp-drinkware', width: 1672, height: 941, widths: [640, 960, 1280, 1672], fallback: 'jpg',
    alt: 'An illustration of a CafePress Business UK drinkware page, made after the internship, with a free UK delivery offer over £100, price and colour filters, and three drinkware products priced in pounds.',
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
    alt: 'An illustration of the proposed AI assistant panel on the CafePress Business UK storefront, made after the internship, open beside drinkware products priced in pounds.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'PlanetArt/cafepress uk/cafepress uk ai agent.png (added by Harlie, 2026-09-25)', role: 'CafePress UK, the third section\'s picture (restored by Harlie\'s request, without a caption)',
  }),

  /* Valiance */
  // Harlie's three AI Leasing images (Valiance Capital/, 2026-09-25, v29): illustrative mockups with invented people and figures.
  'valiance-listing': img({
    id: 'valiance-listing', file: 'valiance-listing', width: 1448, height: 1086, widths: [800, 1200, 1448], fallback: 'jpg',
    alt: 'Illustrative mockup, not the deployed assistant. A rental listing for a two-bedroom at 2425 Durant Ave, Berkeley, with an AI leasing assistant labeled as powered by Valiance Capital and The Berkeley Group, answering questions about availability, pricing and pets.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/ai leasing 1.png (supplied by Harlie)', role: 'AI Leasing stage: inquiry scope and live property data',
  }),
  'valiance-dashboard': img({
    id: 'valiance-dashboard', file: 'valiance-dashboard', width: 1448, height: 1086, widths: [800, 1200, 1448], fallback: 'jpg',
    alt: 'Illustrative mockup with invented figures, not the deployed system. A leasing dashboard branded Valiance Capital and The Berkeley Group across 18 properties, with flagged conversations, recent messages, upcoming tours and message topics such as availability, pricing and tours.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/leasing dashboard 2.png (supplied by Harlie)', role: 'AI Leasing stage: testing and deployment',
  }),
  'valiance-inbox': img({
    id: 'valiance-inbox', file: 'valiance-inbox', width: 1536, height: 1024, widths: [800, 1200, 1536], fallback: 'jpg',
    alt: 'Illustrative mockup, not the deployed system. A leasing inbox with conversations flagged as needing a person, a renter conversation that confirms availability and books a tour, and the assistant’s notes.',
    provenance: 'synthetic-example', synthetic: true,
    source: 'Valiance Capital/leasing messages 3.png (supplied by Harlie)', role: 'AI Leasing stage: staff escalation',
  }),

  /*
   * Shift. The three film posters are only ever a <video poster> (FilmDialog, via posterSrc; the Creative Production
   * tile's hard-coded URL), which takes one file: they exist as JPEG and WebP at the one width used, with no AVIF and
   * no other widths (2026-09-29), so never pass them to ResponsiveImage or srcSet.
   */
  'aristocracy-poster': img({
    id: 'aristocracy-poster', file: 'aristocracy-poster', width: 4000, height: 3000, widths: [960], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Aristocracy.mp4', role: 'Video poster (4:3, uncropped)',
    timestamp: 30.5, notes: 'Every frame in 29.8–43.8s carries a burned-in subtitle; the uncropped poster keeps it. 30.5s differs from the 43.8s hero crop so the poster does not repeat it.',
  }),
  'nickleby-poster': img({
    id: 'nickleby-poster', file: 'nickleby-poster', width: 1138, height: 640, widths: [1138], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Nickleby Capital Video 1.mp4', role: 'Video poster',
    timestamp: 12, notes: 'Clean interview frame after the opening title card; no subtitle on screen.',
  }),
  'heck-poster': img({
    id: 'heck-poster', file: 'heck-poster', width: 1920, height: 1080, widths: [1280], fallback: 'jpg',
    alt: '', provenance: 'agency-work', synthetic: false, source: 'Shift Content/Heck Video.mp4', role: 'Video poster', timestamp: 30,
  }),

  /* About */
  headshot: img({
    id: 'headshot', file: 'headshot', width: 644, height: 755, widths: [360, 640], fallback: 'jpg',
    alt: 'Harlie Katz.', provenance: 'portrait', synthetic: false, source: 'personal assets/headshot copy.PNG', role: 'About portrait',
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
 * evidence. HomeFilm plays `film` (one file per device). The brief v15 room
 * (`room`, not rendered since brief v16) was removed on 2026-09-29; its
 * entries are in archive/media-registry-unplaced.ts.
 */
export const STAGE_MEDIA = {
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

/** The widest variant not above `preferred` (the narrowest when none is). */
const widthFor = (asset: ImageAsset, preferred: number) => [...asset.widths].reverse().find((x) => x <= preferred) ?? asset.widths[0]

/** Fallback src: the widest variant not above `preferred`. */
export function fallbackSrc(asset: ImageAsset, preferred = 1200): string {
  return `${IMG_BASE}${asset.file}-${widthFor(asset, preferred)}.${asset.fallback}`
}

/**
 * A video poster: the frame and width fallbackSrc picks, as WebP (a quarter to two fifths fewer bytes than the JPEG;
 * a poster attribute takes one URL, with no fallback, so not AVIF; 2026-09-29).
 */
export function posterSrc(asset: ImageAsset, preferred = 1200): string {
  return `${IMG_BASE}${asset.file}-${widthFor(asset, preferred)}.webp`
}

/** Largest available variant (used by the enlargement dialog). */
export function largestSrc(asset: ImageAsset, format: 'avif' | 'webp' | 'jpg' | 'png'): string {
  return `${IMG_BASE}${asset.file}-${asset.widths[asset.widths.length - 1]}.${format}`
}

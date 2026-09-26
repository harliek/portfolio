import type { ImageId } from './media'
import { projectById, projectPath, type ProjectId } from './projects'

/**
 * The homepage's project field, in Harlie's order (2026-09-26): About me (opens the About page), CafePress UK, AI
 * Leasing Agent, Spreadsheet Agent, Creative Production, Merchandising Platform, Jumpstart Finance, Creative
 * Portfolio (opens /creative/). The first sits at the far left when the tiles come into view. The films sit in the
 * rounded frame and play muted; the Jumpstart phones grow and shrink a little in turn, and the leasing conversation
 * arrives message by message. The field is one flat strip that loops endlessly and turns by itself. The case studies'
 * order (projects.ts: the Work menu, Previous and Next) is the same without About me and Creative Portfolio.
 *
 * `line` is one plain sentence per project, kept to what the case studies
 * support (prototypes stay prototypes; qualifiers such as simulated AI
 * responses and synthetic data are stated in the case studies).
 */
/** One transparent cutout of a real interface element, placed in the 16:10 tile box (percent of its width and height). */
export interface CutoutPiece {
  image: ImageId
  x: number
  y: number
  w: number
  z?: number
}

/** One turn of the leasing conversation: the renter (initials) or the assistant (an icon). */
export interface ChatLine {
  from: 'renter' | 'assistant'
  text: string
}

export type PlaneMedia =
  | { kind: 'video'; src: string; poster: string; position?: string }
  | { kind: 'image'; image: ImageId; position?: string }
  | { kind: 'screens'; screens: readonly ImageId[] }
  | { kind: 'cutouts'; pieces: readonly CutoutPiece[] }
  /** One transparent picture placed like a cutout, shown as its separate widgets (boxes in source pixels, each with how much it grows). */
  | { kind: 'widgets'; image: ImageId; x: number; y: number; w: number; boxes: readonly (readonly [number, number, number, number, number])[] }
  | { kind: 'chat'; initials: string; lines: readonly ChatLine[] }

/** Kinds shown as free-standing objects over the page (no card, frame or ground behind them). */
export const isFree = (m: PlaneMedia) => m.kind === 'screens' || m.kind === 'cutouts' || m.kind === 'widgets' || m.kind === 'chat'

export interface FieldProject {
  /** A case study, 'about' for the About me tile (the /about page) or 'creative' for the creative portfolio (/creative/). */
  id: ProjectId | 'about' | 'creative'
  title: string
  line: string
  media: PlaneMedia
  /** Accessible description of the plane's picture (for the link's name). */
  alt: string
}

export const FIELD_YEARS = '2024–2026'

export const FIELD: readonly FieldProject[] = [
  {
    id: 'about',
    title: 'About me',
    line: 'AI product management, strategy, and implementation',
    // Harlie's video for the tile (about tile.m4v, 1280x720, 18.2s), muted at normal speed; it loops at its end.
    media: { kind: 'video', src: '/media/video/about-tile-960.mp4', poster: '/media/img/about-tile-poster-960.jpg', position: '50% 40%' },
    alt: 'Harlie Katz speaking to the camera in front of a bookshelf',
  },
  {
    id: 'cafepress-uk',
    title: 'CafePress UK',
    line: 'Market research, assortment planning, and early UK storefront prototyping.',
    // Harlie's video for the tile (cafepress uk tile.mov, 2330x1234, 10.3s): 1.0 to 7.3s at its own speed, then the
    // same in reverse, so the page scrolls down and back up in one seamless loop (12.5s; Harlie's requests). In the
    // rounded frame like Creative Production, muted. Kept to the left so the CafePress logo stays in the frame.
    media: { kind: 'video', src: '/media/video/cafepress-tile-960.mp4', poster: '/media/img/cafepress-tile-poster-960.jpg', position: '25% 0%' },
    alt: 'A recording scrolling through the CafePress Business storefront: custom products, categories, featured brands and customer reviews',
  },
  {
    id: 'ai-leasing-agent',
    title: 'AI Leasing Agent',
    line: 'Requirements, workflow design, and testing for an AI leasing assistant.',
    // Shortened from the messages in the case study's illustrative conversation (valiance-messages): general questions
    // answered, the fee waiver and the unit hold routed to the leasing staff. No availability, price or appointment is confirmed.
    media: {
      kind: 'chat',
      initials: 'J',
      lines: [
        { from: 'renter', text: 'Hi! I’m looking for a two-bedroom near campus for August. I have one cat.' },
        { from: 'assistant', text: 'Thanks for reaching out! I can help with floor plans, pet policies, and the application process.' },
        { from: 'renter', text: 'Can you waive the application fee and hold unit 2B?' },
        { from: 'assistant', text: 'Requests to waive the fee or hold a unit need review by our leasing staff. I’ll connect you with a team member.' },
      ],
    },
    alt: 'An illustrative leasing conversation: a renter asks about a two-bedroom, a fee waiver and a unit hold, and the assistant answers the general questions and passes the requests to the leasing staff',
  },
  {
    id: 'spreadsheet-agent',
    title: 'Spreadsheet Agent',
    line: 'A rules-based prototype for generating editable spreadsheets from written requests.',
    // Harlie's choice (Spreadsheet Agent/Spreadsheet Video.mov from 24s, the sheet built and scrolled, then All Sheets;
    // ends at 36.6s, before the screen-capture toolbar appears), muted at normal speed; it loops at its end.
    media: { kind: 'video', src: '/media/video/spreadsheet-tile-960.mp4', poster: '/media/img/spreadsheet-tile-poster-960.jpg', position: '50% 0%' },
    alt: 'A recording of Spreadsheet Agent: a finished sheet of B2B products with vendor, cost, retail price and margin, then the list of saved sheets',
  },
  {
    id: 'client-work',
    title: 'Creative Production',
    line: 'Client film production at Shift Content.',
    // The whole film (1:40), muted at normal speed; it continues where it left off and loops only at its end.
    media: { kind: 'video', src: '/media/video/nickleby-640.mp4', poster: '/media/img/nickleby-poster-1138.jpg', position: '40% 45%' },
    alt: 'The Nickleby Capital interview film',
  },
  {
    id: 'merchandising-platform',
    title: 'Merchandising Platform',
    line: 'An independent prototype for product analysis and replenishment planning.',
    // The merchandising dashboard recording (Harlie's request; PlanetArt/Merchandising Dashboard/Dashboard Video.mov
    // through its site encode, merch-console-960.mp4, 56.3s): the whole walkthrough, muted at normal speed, looping.
    media: { kind: 'video', src: '/media/video/merch-console-960.mp4', poster: '/media/img/merch-console-poster-960.jpg', position: '30% 50%' },
    alt: 'A recording of the Merchandising Platform prototype: the overview, the product catalog, a product’s reorder calculation, the inventory and the vendors',
  },
  {
    id: 'jumpstart-finance',
    title: 'Jumpstart Finance',
    line: 'Product development for a financial education app concept.',
    media: {
      kind: 'screens',
      // Harlie's three phones (PNG Tiles/jumpstart tile 1 to 3), made free-standing.
      screens: ['jf-tile-profile', 'jf-tile-home', 'jf-tile-third'],
    },
    alt: 'Three Jumpstart Finance phone screens: home, the learning journey, and the community',
  },
  {
    id: 'creative',
    title: 'Creative Portfolio',
    line: 'Film and visual art',
    // The paint video from the About page's Creative Portfolio card (art-portfolio-960.mp4), muted; it loops at its end.
    media: { kind: 'video', src: '/media/video/art-portfolio-960.mp4', poster: '/media/img/art-portfolio-poster-960.jpg' },
    alt: 'Wet pink, violet and orange paint in motion, from the art portfolio',
  },
]

/** Where a tile leads: its case study, or the About page. */
export const fieldPath = (item: FieldProject) =>
  item.id === 'about' ? '/about' : item.id === 'creative' ? '/creative/' : projectPath(projectById(item.id))

/** The creative portfolio is a separate build outside the router: its tile opens with a full page load. */
export const isExternalTile = (item: FieldProject) => item.id === 'creative'

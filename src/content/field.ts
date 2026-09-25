import type { ImageId } from './media'
import type { ProjectId } from './projects'

/**
 * The homepage's project field, in the site's project order (brief v19, by
 * impact; projects.ts). Brief v20: most projects are free-standing objects
 * over the page rather than screenshot cards (cutouts of real interface
 * elements, the three original app screens, the leasing conversation as live
 * message bubbles); Creative Production keeps its film frame, playing the
 * whole film at normal speed. The field loops endlessly and turns by itself.
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
  | { kind: 'chat'; initials: string; lines: readonly ChatLine[] }

/** Kinds shown as free-standing objects over the page (no card, frame or ground behind them). */
export const isFree = (m: PlaneMedia) => m.kind === 'screens' || m.kind === 'cutouts' || m.kind === 'chat'

export interface FieldProject {
  id: ProjectId
  title: string
  line: string
  media: PlaneMedia
  /** Accessible description of the plane's picture (for the link's name). */
  alt: string
}

export const FIELD_YEARS = '2024–2026'

export const FIELD: readonly FieldProject[] = [
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
    id: 'merchandising-platform',
    title: 'Merchandising Platform',
    line: 'An independent prototype for product analysis and replenishment planning.',
    // Harlie's tile (PNG Tiles/Merchandising Tile.png), contained in the box at the shared scale.
    media: { kind: 'cutouts', pieces: [{ image: 'merch-object', x: 3, y: 12.7, w: 94 }] },
    alt: 'An illustrative merchandising dashboard with sample product, vendor, inventory and promotion counts, a sales chart and revenue by category',
  },
  {
    id: 'spreadsheet-agent',
    title: 'Spreadsheet Agent',
    line: 'A rules-based prototype for generating editable spreadsheets from written requests.',
    // Harlie's tile (PNG Tiles/spreadsheet tile.png, transparent), contained in the box at the shared scale.
    media: { kind: 'cutouts', pieces: [{ image: 'sa-object', x: 3, y: 18.7, w: 94 }] },
    alt: 'Spreadsheet Agent with a generated B2B apparel assortment beside the assistant panel and its request',
  },
  {
    id: 'cafepress-uk',
    title: 'CafePress UK',
    line: 'Market research, assortment planning, and early UK storefront prototyping.',
    // An illustrative mockup Harlie made for the tile (PNG Tiles/cafepress uk tile.png).
    media: { kind: 'cutouts', pieces: [{ image: 'cp-object', x: 3.1, y: 3, w: 93.8 }] },
    alt: 'An illustrative CafePress Business UK storefront mockup with a T-shirt, tote bag and mug priced in pounds',
  },
  {
    id: 'client-work',
    title: 'Creative Production',
    line: 'Client film production at Shift Content.',
    // The whole film (1:40), muted at normal speed; it continues where it left off and loops only at its end.
    media: { kind: 'video', src: '/media/video/nickleby-640.mp4', poster: '/media/img/nickleby-poster-1138.jpg', position: '40% 45%' },
    alt: 'The Nickleby Capital interview film',
  },
]

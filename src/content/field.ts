import type { ImageId } from './media'
import { projectById, projectPath, type ProjectId } from './projects'

/**
 * The homepage's project field, in Harlie's order: Creative Portfolio (opens /creative/; first, at the far left when
 * the page opens, Harlie's request, 2026-09-29; About me had been first since 2026-09-27), About me (opens the About
 * page), Creative Production, Spreadsheet Assistant, CafePress UK, Merchandising Dashboard, Jumpstart Finance, AI
 * Leasing Agent (Harlie's order of 2026-09-29, with Spreadsheet Assistant moved after Creative Production at their
 * later request that day; the loop brings AI Leasing Agent round just before Creative Portfolio). The films sit in the rounded
 * frame and play muted; the Jumpstart phones grow and shrink a little in turn, and the leasing conversation arrives
 * message by message. The field is one flat strip that loops endlessly and turns by itself. The case studies' order
 * (projects.ts: the Work menu, Previous and Next) is the same without About me and Creative Portfolio.
 *
 * The footage's posters are WebP, the same frames as the JPEGs they replaced and together about a third smaller
 * (Harlie's approval, 2026-09-29; performance audit C4/F7). A poster has no fallback: Safari without WebP (macOS 10.15
 * and older) shows none before the first frame, and under reduced motion none at all.
 *
 * `line` is one short caption per tile, a noun phrase without a full stop
 * like "Film and visual art" (Harlie's brief, 2026-09-28: six of them ended
 * with one), kept to what the case studies support (prototypes stay
 * prototypes; qualifiers such as simulated AI responses and synthetic data
 * are stated in the case studies). About me's names the About page's
 * sections; it had repeated the tagline printed just above the strip.
 * Copy brief of 2026-09-28: each project tile's line is Harlie's supporting description, a short noun phrase
 * (Creative Production's follows their pattern; Creative Portfolio's matches the About page's card line).
 * Copy brief of 2026-09-29: CafePress UK's is a storefront concept (the deck's concept image, not a coded prototype),
 * Creative Production's names the work rather than "support", and Creative Portfolio's follows Harlie's sentence.
 */
/** One turn of the leasing conversation: the renter (initials) or the assistant (an icon). */
export interface ChatLine {
  from: 'renter' | 'assistant'
  text: string
}

/**
 * A tile's picture: footage in the rounded frame, the Jumpstart phones, or the leasing conversation. (Stills, cutouts
 * and widget compositions were retired with the tiles that used them; Harlie's brief, 2026-09-28, code cleanup.)
 */
export type PlaneMedia =
  | { kind: 'video'; src: string; poster: string; position?: string }
  | { kind: 'screens'; screens: readonly ImageId[] }
  | { kind: 'chat'; initials: string; lines: readonly ChatLine[] }

/** Kinds shown as free-standing objects over the page (no card, frame or ground behind them). */
export const isFree = (m: PlaneMedia) => m.kind === 'screens' || m.kind === 'chat'

export interface FieldProject {
  /** A case study, 'about' for the About me tile (the /about page), or 'creative' for the creative portfolio. */
  id: ProjectId | 'about' | 'creative'
  title: string
  line: string
  media: PlaneMedia
  /** Accessible description of the plane's picture (for the link's name). */
  alt: string
}

export const FIELD: readonly FieldProject[] = [
  {
    id: 'creative',
    title: 'Creative Portfolio',
    line: 'Original films, drawings, and visual studies',
    // The paint video from the About page's Creative Portfolio card (art-portfolio-960.mp4), muted; it loops.
    media: { kind: 'video', src: '/media/video/art-portfolio-960.mp4', poster: '/media/img/art-portfolio-poster-960.webp' },
    alt: 'Wet pink, violet and orange paint in motion, from the art portfolio',
  },
  {
    id: 'about',
    title: 'About me',
    line: 'Cognitive science, applied AI, and product development',
    // Harlie's video for the tile (about tile.m4v, 1280x720, 18.2s), muted at normal speed; it loops at its end.
    media: { kind: 'video', src: '/media/video/about-tile-960.mp4', poster: '/media/img/about-tile-poster-960.webp', position: '50% 40%' },
    alt: 'Harlie Katz speaking to the camera in front of a bookshelf',
  },
  {
    id: 'client-work',
    title: 'Creative Production',
    line: 'Client campaigns, film production, and photography',
    // The film's first 35.6s, ending at a scene cut (nickleby-tile-cut-640.mp4: the start of nickleby-640.mp4's video
    // stream, without the audio the muted tile never plays; scripts/prepare-media.mjs, task `video`), muted at normal
    // speed; it continues where it left off and loops at its end. It replaced the whole 1:40 film, 5.6 MB and the homepage's largest download, mostly never seen
    // (Harlie's approval, 2026-09-29; performance audit F9). The film dialog on the Creative Production page keeps the
    // whole film, nickleby-640.mp4, with its sound.
    media: { kind: 'video', src: '/media/video/nickleby-tile-cut-640.mp4', poster: '/media/img/nickleby-poster-1138.webp', position: '40% 45%' },
    alt: 'The Nickleby Capital interview film',
  },
  {
    id: 'spreadsheet-agent',
    title: 'Spreadsheet Assistant',
    line: 'Written requests into reviewable plans and editable sheets',
    // Harlie's choice (Spreadsheet Agent/Spreadsheet Video.mov from 24s, the sheet built and scrolled, then All Sheets;
    // ends at 36.6s, before the screen-capture toolbar appears), muted at normal speed; it loops at its end.
    media: { kind: 'video', src: '/media/video/spreadsheet-tile-960.mp4', poster: '/media/img/spreadsheet-tile-poster-960.webp', position: '50% 0%' },
    alt: 'A recording of the Spreadsheet Assistant prototype: a finished sheet of B2B products with vendor, cost, retail price and margin, then the list of saved sheets',
  },
  {
    id: 'cafepress-uk',
    title: 'CafePress UK',
    line: 'UK market strategy and localized storefront prototype',
    // Harlie's video for the tile (cafepress uk tile.mov, 2330x1234, 10.3s): 1.0 to 5.3s at its own speed, then the
    // same in reverse, so the page scrolls down and back up in one seamless loop (8.5s; Harlie's requests). In the
    // rounded frame like Creative Production, muted. Kept to the left so the CafePress logo stays in the frame.
    media: { kind: 'video', src: '/media/video/cafepress-tile-960.mp4', poster: '/media/img/cafepress-tile-poster-960.webp', position: '25% 0%' },
    // The recording shows the live US site, the model the UK research assessed (the case study's opening); it was
    // described as if it were Harlie's UK prototype (Harlie's brief, 2026-09-28).
    alt: 'A recording scrolling through CafePress Business’s US storefront, the model the UK research started from: custom products, categories, featured brands and customer reviews',
  },
  {
    id: 'merchandising-platform',
    title: 'Merchandising Dashboard',
    line: 'Connecting product, supplier, sales, and promotion data',
    // The merchandising dashboard recording (Harlie's request; PlanetArt/Merchandising Dashboard/Dashboard Video.mov
    // through its site encode, merch-console-960.mp4, 56.3s): the whole walkthrough, muted at normal speed, looping.
    media: { kind: 'video', src: '/media/video/merch-console-960.mp4', poster: '/media/img/merch-console-poster-960.webp', position: '30% 50%' },
    alt: 'A recording of the Merchandising Dashboard prototype: the overview, the product catalog, a product’s reorder calculation, the inventory and the vendors',
  },
  {
    id: 'jumpstart-finance',
    title: 'Jumpstart Finance',
    line: 'Financial education for students through interactive learning',
    media: {
      kind: 'screens',
      // Harlie's three phones (PNG Tiles/jumpstart tile 1 to 3), made free-standing.
      screens: ['jf-tile-profile', 'jf-tile-home', 'jf-tile-third'],
    },
    alt: 'Three Jumpstart Finance phone screens, redrawn in 2026 from the 2024 prototype: the learning journey, the home screen, and the community forum',
  },
  {
    id: 'ai-leasing-agent',
    title: 'AI Leasing Agent',
    line: 'Defining and testing an assistant for recurring leasing questions',
    // Shortened from the messages in the case study's illustrative conversation (valiance-messages): general questions
    // answered, the fee waiver and the unit hold routed to the leasing staff. No availability, price or appointment is
    // confirmed.
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
]

/** Where a tile leads: its case study, or the About page. */
export const fieldPath = (item: FieldProject) =>
  item.id === 'about' ? '/about' : item.id === 'creative' ? '/creative/' : projectPath(projectById(item.id))

/** The creative portfolio is a separate build outside the router: its tile opens with a full page load. */
export const isExternalTile = (item: FieldProject) => item.id === 'creative'

import type { ImageId } from './media'
import type { ProjectId } from './projects'

/**
 * The homepage's project field, in the site's project order (brief v19, by
 * impact; projects.ts). Each project is a 16:10 picture of its own work: the
 * leasing conversation, the three original app screens (floating cutouts, no
 * card), the Inventory screen, the whole Spreadsheet Agent interface, the
 * storefront header and the Nickleby footage. The field loops endlessly.
 *
 * `line` is one plain sentence per project, kept to what the case studies
 * support (prototypes stay prototypes; qualifiers such as simulated AI
 * responses and synthetic data are stated in the case studies).
 */
export type PlaneMedia =
  | { kind: 'video'; src: string; poster: string; position?: string }
  | { kind: 'image'; image: ImageId; position?: string }
  | { kind: 'screens'; screens: readonly ImageId[] }

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
    line: 'Defined the workflow and development requirements for an AI leasing assistant.',
    media: { kind: 'image', image: 'la-cover' },
    alt: 'An illustrative leasing conversation annotated with data needs, approval boundaries and human handoff',
  },
  {
    id: 'jumpstart-finance',
    title: 'Jumpstart Finance',
    line: 'A gamified financial learning app, taken from concept to prototype and pitch.',
    media: {
      kind: 'screens',
      screens: ['jf-screen-lessons', 'jf-screen-progress', 'jf-screen-community'],
    },
    alt: 'Three screens of the original 2024 Jumpstart prototype: lessons, progress and community',
  },
  {
    id: 'merchandising-platform',
    title: 'Merchandising Platform',
    line: 'A prototype that brings product, inventory, vendor, promotion, and replenishment data into one view.',
    media: { kind: 'image', image: 'merch-tile' },
    alt: 'The Inventory screen of the Merchandising Platform prototype, with suggested order quantities',
  },
  {
    id: 'spreadsheet-agent',
    title: 'Spreadsheet Agent',
    line: 'A prototype that turns a written request into a reviewed plan and an editable spreadsheet.',
    media: { kind: 'image', image: 'sa-ui-sheet' },
    alt: 'The whole Spreadsheet Agent interface, with a finished sheet beside the request and the rules that built it',
  },
  {
    id: 'cafepress-uk',
    title: 'CafePress UK',
    line: 'UK market research and a localized storefront prototype for a potential launch.',
    media: { kind: 'image', image: 'cp-cover' },
    alt: 'The header and category navigation of the CafePress Business UK storefront prototype',
  },
  {
    id: 'client-work',
    title: 'Creative Production',
    line: 'Creative strategy, production, and client support at Shift Content.',
    media: { kind: 'video', src: '/media/video/nickleby-loop-trim-1138.mp4', poster: '/media/img/nickleby-loop-poster.jpg', position: '40% 45%' },
    alt: 'Footage from the Nickleby Capital interview film',
  },
]

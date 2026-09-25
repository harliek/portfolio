import type { ImageId } from './media'
import type { ProjectId } from './projects'

/**
 * The homepage's project field (brief v16): each project is a rectangular
 * plane of its own work (interface footage, the storefront, the app's
 * screens, film), never a device or object. Order: Merchandising and
 * Spreadsheet never adjacent; the field loops.
 *
 * `line` is one plain sentence per project, kept to what the case studies
 * support (prototypes stay prototypes; qualifiers such as simulated AI
 * responses and synthetic data are stated in the case studies).
 */
export type PlaneMedia =
  | { kind: 'video'; src: string; poster: string; position?: string }
  | { kind: 'image'; image: ImageId; position?: string; pan?: 'left' | 'right' }
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
    id: 'merchandising-platform',
    title: 'Merchandising Platform',
    line: 'A prototype that brings product, inventory, vendor, promotion, and replenishment data into one view.',
    media: { kind: 'video', src: '/media/video/merch-console-preview-960.mp4', poster: '/media/img/merch-console-poster-960.jpg', position: '50% 40%' },
    alt: 'The Merchandising Platform prototype in use',
  },
  {
    id: 'cafepress-uk',
    title: 'CafePress UK',
    line: 'UK market research and a localized storefront prototype for a potential launch.',
    media: { kind: 'image', image: 'planetart-uk', position: '50% 30%', pan: 'left' },
    alt: 'The CafePress Business UK storefront prototype',
  },
  {
    id: 'spreadsheet-agent',
    title: 'Spreadsheet Agent',
    line: 'A prototype that turns a written request into a reviewed plan and an editable spreadsheet.',
    media: { kind: 'video', src: '/media/video/spreadsheet-agent-preview-960.mp4', poster: '/media/img/spreadsheet-agent-poster-960.jpg', position: '50% 40%' },
    alt: 'The Spreadsheet Agent prototype building a sheet from a request',
  },
  {
    id: 'ai-leasing-agent',
    title: 'AI Leasing Agent',
    line: 'Defined the workflow and development requirements for an AI leasing assistant.',
    media: { kind: 'image', image: 'valiance-messages', position: '50% 40%', pan: 'right' },
    alt: 'An illustrative leasing conversation annotated with data needs, approval boundaries and human handoff',
  },
  {
    id: 'client-work',
    title: 'Creative Production',
    line: 'Creative strategy, production, and client support at Shift Content.',
    media: { kind: 'video', src: '/media/video/plane-creative-960.mp4', poster: '/media/img/plane-creative-poster.jpg', position: '50% 50%' },
    alt: 'Footage from the Aristocracy campaign film',
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
]

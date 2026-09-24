import type { AccentId } from './accents'
import type { ImageId } from './media'
import { projectById, projectPath, type ProjectId } from './projects'

/**
 * The homepage carousel's objects, in their fixed circular order (the
 * latest brief, section 3): About Me, Merchandising Platform, CafePress UK,
 * Spreadsheet Agent, AI Leasing Agent, Creative Production, Jumpstart
 * Finance, then About Me again. CafePress separates Merchandising Platform
 * and Spreadsheet Agent, and Jumpstart and About Me meet at the wrap, so
 * the two never neighbour each other. Never sorted by name, route or width.
 *
 * Each object is one transparent PNG from `final png tiles/`. The six
 * project covers carry their title and subtitle inside the artwork, so no
 * title is repeated beneath them; the link's accessible name comes from
 * `label`. The About headshot has no embedded title and shows the live
 * text label "About me".
 */

/** What the object is, which sets its display size (perceived visual weight, not one shared height). */
export type ObjectKind = 'headshot' | 'monitor' | 'mug' | 'laptop' | 'tablet' | 'camera' | 'phone'

/**
 * Display size at the 1440×900 reference (CSS px): a width for landscape
 * objects, a height for upright ones (the brief's starting dimensions).
 * The carousel scales these with the viewport.
 */
export const OBJECT_SIZE: Record<ObjectKind, { width?: number; height?: number }> = {
  headshot: { height: 292 },
  monitor: { width: 380 },
  mug: { height: 244 },
  laptop: { width: 384 },
  tablet: { height: 280 },
  camera: { width: 330 },
  phone: { height: 282 },
}

export interface CarouselItem {
  id: AccentId
  /** Case study id (absent for About Me). */
  project?: ProjectId
  /** Visible live name beneath the object (the gallery shows it for every object). */
  name: string
  /** Short subtitle directly beneath the name: revealed on hover or focus, shown by default for the featured object and on touch. */
  subtitle: string
  /** Accessible link name. */
  label: string
  /** Visible live label, only where the artwork has no title (About me). */
  visibleLabel?: string
  /** Superseded by `subtitle` (the gallery no longer shows a separate sentence); kept until the gallery drops it. */
  sentence: string
  path: string
  image: ImageId
  kind: ObjectKind
}

const project = (id: ProjectId, accent: AccentId, image: ImageId, kind: ObjectKind, subtitle: string, sentence: string): CarouselItem => {
  const p = projectById(id)
  return { id: accent, project: id, name: p.name, subtitle, label: p.name, sentence, path: projectPath(p), image, kind }
}

export const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 'about',
    name: 'About Me',
    subtitle: 'Background, experience, and creative work',
    label: 'About Me',
    visibleLabel: 'About me',
    sentence: 'My background, experience, and creative work.',
    path: '/about',
    image: 'obj-about',
    kind: 'headshot',
  },
  project('merchandising-platform', 'merchandising-platform', 'obj-merchandising-platform', 'monitor', 'Catalog and replenishment prototype', 'I built an independent prototype for catalog and replenishment decisions.'),
  project('cafepress-uk', 'cafepress-uk', 'obj-cafepress-uk', 'mug', 'UK market research and storefront prototyping', 'I researched the UK market and developed a localized storefront prototype.'),
  project('spreadsheet-agent', 'spreadsheet-agent', 'obj-spreadsheet-agent', 'laptop', 'A reviewable plan before sheet creation', 'I designed a review step before a request becomes a spreadsheet.'),
  project('ai-leasing-agent', 'ai-leasing-agent', 'obj-ai-leasing-agent', 'tablet', 'Workflow requirements and assistant testing', 'I defined requirements and tested how the assistant handled leasing questions.'),
  project('client-work', 'creative-production', 'obj-creative-production', 'camera', 'Film and campaign production at Shift Content', 'I supported client shoots and campaign work at Shift Content.'),
  project('jumpstart-finance', 'jumpstart-finance', 'obj-jumpstart-finance', 'phone', 'Financial education venture and mobile prototype', 'I led a five-person team developing a financial education concept.'),
]

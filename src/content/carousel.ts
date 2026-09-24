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
  headshot: { height: 285 },
  monitor: { width: 370 },
  mug: { height: 250 },
  laptop: { width: 370 },
  tablet: { height: 272 },
  camera: { width: 330 },
  phone: { height: 272 },
}

export interface CarouselItem {
  id: AccentId
  /** Case study id (absent for About Me). */
  project?: ProjectId
  /** Accessible link name (the visible title is inside the artwork). */
  label: string
  /** Visible live label, only where the artwork has no title (About me). */
  visibleLabel?: string
  /** One short contribution sentence, shown in the reserved caption region on hover or focus. */
  sentence: string
  path: string
  image: ImageId
  kind: ObjectKind
}

const project = (id: ProjectId, accent: AccentId, image: ImageId, kind: ObjectKind, sentence: string): CarouselItem => {
  const p = projectById(id)
  return { id: accent, project: id, label: `${p.name} case study`, sentence, path: projectPath(p), image, kind }
}

export const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 'about',
    label: 'About me',
    visibleLabel: 'About me',
    sentence: 'My background, experience, and creative work.',
    path: '/about',
    image: 'obj-about',
    kind: 'headshot',
  },
  project('merchandising-platform', 'merchandising-platform', 'obj-merchandising-platform', 'monitor', 'I built an independent prototype for catalog and replenishment decisions.'),
  project('cafepress-uk', 'cafepress-uk', 'obj-cafepress-uk', 'mug', 'I researched the UK market and developed a localized storefront prototype.'),
  project('spreadsheet-agent', 'spreadsheet-agent', 'obj-spreadsheet-agent', 'laptop', 'I designed a review step before a request becomes a spreadsheet.'),
  project('ai-leasing-agent', 'ai-leasing-agent', 'obj-ai-leasing-agent', 'tablet', 'I defined requirements and tested how the assistant handled leasing questions.'),
  project('client-work', 'creative-production', 'obj-creative-production', 'camera', 'I supported client shoots and campaign work at Shift Content.'),
  project('jumpstart-finance', 'jumpstart-finance', 'obj-jumpstart-finance', 'phone', 'I led a five-person team developing a financial education concept.'),
]

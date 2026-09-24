import type { AccentId } from './accents'
import type { ImageId } from './media'
import { projectById, projectPath, type ProjectId } from './projects'

/**
 * The homepage's transparent PNG objects (plan-v11 deliverables 4 and 10).
 *
 * All seven objects form the homepage carousel, in this fixed circular
 * order: About Me, Merchandising Platform, CafePress UK Launch, Spreadsheet
 * Agent, AI Leasing Agent, Film and Campaign Work, Student Founder of
 * Fintech Venture, then About Me again. A fresh visit selects Merchandising
 * Platform, with About Me as its left neighbour and CafePress UK Launch on
 * its right. Never sorted by name, route or width.
 *
 * Every object carries its own label beneath it (its display title and
 * subtitle, Harlie's label table; About Me has no subtitle), which travels
 * and scales with the object. The link's accessible name is the title; the
 * subtitle describes it.
 */

/** What the object is, which sets its display size (perceived visual weight, not one shared height). */
export type ObjectKind = 'headshot' | 'monitor' | 'mug' | 'laptop' | 'tablet' | 'camera' | 'phone'

/**
 * Reference size at 1440×900 (CSS px): a width for landscape objects, a
 * height for upright ones. Each destination's CoverSlot (coverGeometry.ts)
 * sizes its reserved cover from these; the homepage carousel has its own
 * sizes (GALLERY.area and GALLERY.factor in src/config/carousel.ts).
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
  /** Display title (matches the PNG's embedded title; Harlie's label table). */
  name: string
  /** Display subtitle (matches the PNG's embedded subtitle; About Me has none). */
  subtitle: string
  /** Accessible link name. */
  label: string
  path: string
  image: ImageId
  kind: ObjectKind
}

const project = (id: ProjectId, accent: AccentId, image: ImageId, kind: ObjectKind): CarouselItem => {
  const p = projectById(id)
  return { id: accent, project: id, name: p.displayName, subtitle: p.displaySubtitle, label: p.displayName, path: projectPath(p), image, kind }
}

/** The About portrait: the carousel's About Me tile (a link to /about) and the About page's portrait. */
export const PORTRAIT_ITEM: CarouselItem = {
  id: 'about',
  name: 'About Me',
  // Harlie's label table: About Me has no subtitle.
  subtitle: '',
  label: 'About Harlie Katz',
  path: '/about',
  image: 'obj-about',
  kind: 'headshot',
}

/** The homepage carousel: About Me and the six projects, in their fixed circular order. */
export const GALLERY_ITEMS: CarouselItem[] = [
  PORTRAIT_ITEM,
  project('merchandising-platform', 'merchandising-platform', 'obj-merchandising-platform', 'monitor'),
  project('cafepress-uk', 'cafepress-uk', 'obj-cafepress-uk', 'mug'),
  project('spreadsheet-agent', 'spreadsheet-agent', 'obj-spreadsheet-agent', 'laptop'),
  project('ai-leasing-agent', 'ai-leasing-agent', 'obj-ai-leasing-agent', 'tablet'),
  project('client-work', 'creative-production', 'obj-creative-production', 'camera'),
  project('jumpstart-finance', 'jumpstart-finance', 'obj-jumpstart-finance', 'phone'),
]

/**
 * Every PNG object that can move into a destination's cover slot (the route
 * transition and CoverSlot look objects up here by id and by path): the
 * About portrait and the six projects, the carousel's seven objects.
 */
export const CAROUSEL_ITEMS: CarouselItem[] = GALLERY_ITEMS

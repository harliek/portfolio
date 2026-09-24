import type { AccentId } from './accents'
import type { ImageId } from './media'
import { projectById, projectPath, type ProjectId } from './projects'

/**
 * The homepage gallery's objects, in their fixed circular order (the
 * latest brief): About Me, Merchandising Platform, CafePress UK,
 * Spreadsheet Agent, AI Leasing Agent, Creative Production, Jumpstart
 * Finance, then About Me again. CafePress separates Merchandising Platform
 * and Spreadsheet Agent, and Jumpstart and About Me meet at the wrap, so
 * the two never neighbour each other. Never sorted by name, route or width.
 *
 * Each object is one transparent PNG from `final png tiles/`. Every object
 * shows its live name beneath it and, on hover or keyboard focus (and by
 * default for the featured object), its subtitle directly below the name.
 * The link's accessible name is `label`; the subtitle describes it.
 */

/** What the object is, which sets its display size (perceived visual weight, not one shared height). */
export type ObjectKind = 'headshot' | 'monitor' | 'mug' | 'laptop' | 'tablet' | 'camera' | 'phone'

/**
 * Reference size at 1440×900 (CSS px): a width for landscape objects, a
 * height for upright ones. The homepage gallery scales these by depth and
 * viewport (src/config/carousel.ts), and each destination's CoverSlot
 * (coverGeometry.ts) sizes its reserved cover from them.
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
  /** Display title (matches the PNG's embedded title; Harlie's label table). Shown live only for the foremost object. */
  name: string
  /** Display subtitle (matches the PNG's embedded subtitle; About Me has none). Shown only for the foremost object. */
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

export const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 'about',
    name: 'About Me',
    // Harlie's label table: About Me has no subtitle.
    subtitle: '',
    label: 'About Me',
    path: '/about',
    image: 'obj-about',
    kind: 'headshot',
  },
  project('merchandising-platform', 'merchandising-platform', 'obj-merchandising-platform', 'monitor'),
  project('cafepress-uk', 'cafepress-uk', 'obj-cafepress-uk', 'mug'),
  project('spreadsheet-agent', 'spreadsheet-agent', 'obj-spreadsheet-agent', 'laptop'),
  project('ai-leasing-agent', 'ai-leasing-agent', 'obj-ai-leasing-agent', 'tablet'),
  project('client-work', 'creative-production', 'obj-creative-production', 'camera'),
  project('jumpstart-finance', 'jumpstart-finance', 'obj-jumpstart-finance', 'phone'),
]

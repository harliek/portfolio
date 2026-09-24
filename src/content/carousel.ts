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
  /** Visible live name beneath the object (never with "case study" appended). */
  name: string
  /** Short subtitle directly beneath the name: revealed on hover or focus, shown by default for the featured object and on touch. */
  subtitle: string
  /** Accessible link name. */
  label: string
  path: string
  image: ImageId
  kind: ObjectKind
}

const project = (id: ProjectId, accent: AccentId, image: ImageId, kind: ObjectKind, subtitle: string): CarouselItem => {
  const p = projectById(id)
  return { id: accent, project: id, name: p.name, subtitle, label: p.name, path: projectPath(p), image, kind }
}

export const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 'about',
    name: 'About Me',
    subtitle: 'Background, experience, and creative work',
    label: 'About Me',
    path: '/about',
    image: 'obj-about',
    kind: 'headshot',
  },
  project('merchandising-platform', 'merchandising-platform', 'obj-merchandising-platform', 'monitor', 'Catalog and replenishment prototype'),
  project('cafepress-uk', 'cafepress-uk', 'obj-cafepress-uk', 'mug', 'UK market research and storefront prototyping'),
  project('spreadsheet-agent', 'spreadsheet-agent', 'obj-spreadsheet-agent', 'laptop', 'A reviewable plan before sheet creation'),
  project('ai-leasing-agent', 'ai-leasing-agent', 'obj-ai-leasing-agent', 'tablet', 'Workflow requirements and assistant testing'),
  project('client-work', 'creative-production', 'obj-creative-production', 'camera', 'Film and campaign production at Shift Content'),
  project('jumpstart-finance', 'jumpstart-finance', 'obj-jumpstart-finance', 'phone', 'Financial education venture and mobile prototype'),
]

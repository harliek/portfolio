import type { ImageId } from './media'
import { PROJECTS, projectPath, type ProjectAccent } from './projects'

/**
 * The homepage carousel's tiles, in order: the six projects, then About Me.
 * Each tile is one link (image and caption) with a name, a persistent action
 * line and a short description revealed on hover or focus.
 */
export interface CarouselItem {
  id: string
  name: string
  /** Revealed on hover or keyboard focus (always visible in the swipe row). */
  description: string
  /** Persistent action line under the name (an arrow follows it). */
  action: string
  path: string
  /** Upright 3:4 tile artwork. */
  cover: ImageId
  accent: ProjectAccent
}

export const CAROUSEL_ITEMS: CarouselItem[] = [
  ...PROJECTS.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    action: 'View case study',
    path: projectPath(p),
    cover: p.cover,
    accent: p.accent,
  })),
  {
    id: 'about',
    name: 'About Me',
    description: 'Background, experience, and creative work.',
    action: 'View About page',
    path: '/about',
    cover: 'tile-about',
    accent: 'violet',
  },
]

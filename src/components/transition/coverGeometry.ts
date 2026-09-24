import { CAROUSEL_ITEMS, OBJECT_SIZE, type CarouselItem } from '../../content/carousel'
import { getImage } from '../../content/media'

/** The carousel object with this id (an accent id, as in `data-cover-source` and `data-cover-slot`). */
export const coverItem = (id: string | null | undefined): CarouselItem | undefined => (id ? CAROUSEL_ITEMS.find((x) => x.id === id) : undefined)

/** The carousel object a route opens (About or a case study). */
export const coverItemForPath = (path: string): CarouselItem | undefined => CAROUSEL_ITEMS.find((x) => x.path === path)

/**
 * Rendered width (CSS px, before any narrow-screen limit) of a CoverSlot at
 * `scale` times the object's carousel reference size (OBJECT_SIZE: a width
 * for landscape objects, a height for upright ones).
 */
export function coverSlotWidth(item: CarouselItem, scale: number): number {
  const image = getImage(item.image)
  const ref = OBJECT_SIZE[item.kind]
  const ratio = image.width / image.height
  return Math.round((ref.width ?? (ref.height ?? 280) * ratio) * scale)
}

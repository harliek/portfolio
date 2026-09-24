import type { CSSProperties } from 'react'
import type { AccentId } from '../../content/accents'
import { CAROUSEL_ITEMS, OBJECT_SIZE } from '../../content/carousel'
import { getImage } from '../../content/media'
import { ResponsiveImage } from '../media/ResponsiveImage'

interface CoverSlotProps {
  /** The carousel item whose PNG object sits here (e.g. 'merchandising-platform', 'about'). */
  id: AccentId
  /**
   * Scale of the object's carousel reference size (OBJECT_SIZE). The case
   * opening uses a modest cover (default 0.72) so the product media on the
   * right stays the main visual.
   */
  scale?: number
  /** Literal `sizes` for the image; defaults to the rendered width. */
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * The reserved place of a carousel object on its destination page (the case
 * opening's left column, the About portrait). Its box has the object's exact
 * aspect ratio and a fixed width, so the page never shifts and the route
 * transition (projectTransition.ts) can move the same PNG from the carousel
 * into this box. `data-cover-slot` names the object; the transition hides
 * the slot's own image while the moving copy travels, then reveals it.
 * Direct loads simply render the PNG in place.
 */
export function CoverSlot({ id, scale = 0.72, sizes, priority = true, className }: CoverSlotProps) {
  const item = CAROUSEL_ITEMS.find((x) => x.id === id)
  if (!item) return null
  const image = getImage(item.image)
  const ref = OBJECT_SIZE[item.kind]
  const ratio = image.width / image.height
  const width = Math.round((ref.width ?? (ref.height ?? 280) * ratio) * scale)
  const style = { '--cover-w': `${width}px`, aspectRatio: `${image.width} / ${image.height}` } as CSSProperties
  return (
    <div className={['cover-slot', className].filter(Boolean).join(' ')} data-cover-slot={id} style={style}>
      <ResponsiveImage image={item.image} sizes={sizes ?? `${width}px`} fit="contain" decorative priority={priority} />
    </div>
  )
}

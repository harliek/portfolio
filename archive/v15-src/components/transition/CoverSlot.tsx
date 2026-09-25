import type { CSSProperties } from 'react'
import type { AccentId } from '../../content/accents'
import { getImage } from '../../content/media'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { coverItem, coverSlotWidth } from './coverGeometry'
import './transition.css'

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
 * opening's cover, the About portrait). Its box has the object's exact
 * aspect ratio and a fixed width, so the page never shifts and the route
 * transition (projectTransition.ts) can move the same PNG from the carousel
 * into this box: `data-cover-slot` names the object, and during the view
 * transition the slot (or its glow wrapper) carries the shared
 * view-transition-name. Direct loads simply render the PNG in place.
 */
export function CoverSlot({ id, scale = 0.72, sizes, priority = true, className }: CoverSlotProps) {
  const item = coverItem(id)
  if (!item) return null
  const image = getImage(item.image)
  const width = coverSlotWidth(item, scale)
  const style = { '--cover-w': `${width}px`, aspectRatio: `${image.width} / ${image.height}` } as CSSProperties
  return (
    <div className={['cover-slot', className].filter(Boolean).join(' ')} data-cover-slot={id} style={style}>
      <ResponsiveImage image={item.image} sizes={sizes ?? `${width}px`} fit="contain" decorative priority={priority} />
    </div>
  )
}

import { useEffect, useRef, type MouseEvent } from 'react'
import { OBJECT_SIZE, type CarouselItem } from '../../content/carousel'
import { getImage } from '../../content/media'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { warmProject } from '../transition/projectTransition'
import { fitHitArea } from './objectHull'

/** Height of the About object's live "About me" label (px at size factor 1). */
export const LABEL_HEIGHT = 36

export interface ObjectBox {
  /** Image box (the PNG at its perceived-weight size, exact aspect ratio). */
  imgW: number
  imgH: number
  /** Whole object: the image plus, for About, the live label beneath it. */
  boxW: number
  boxH: number
}

/** Display size of an object at size factor `u` (OBJECT_SIZE is the 1440×900 reference). */
export function objectBox(item: CarouselItem, u: number): ObjectBox {
  const image = getImage(item.image)
  const ratio = image.width / image.height
  const ref = OBJECT_SIZE[item.kind]
  const imgW = ref.width ? ref.width * u : (ref.height ?? 260) * u * ratio
  const imgH = imgW / ratio
  const labelH = item.visibleLabel ? LABEL_HEIGHT * u : 0
  return { imgW, imgH, boxW: imgW, boxH: imgH + labelH }
}

/** A `sizes` value covering the largest rendered width of an object (the arc's closest, hovered position on a large screen). */
export function objectSizes(item: CarouselItem, u = 1.2) {
  return `${Math.round(objectBox(item, u).imgW)}px`
}

/** Plain left click without modifier keys (other clicks keep the browser's own behaviour, e.g. open in a new tab). */
export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

/** Prepares a destination ahead of the click (hover, focus, touch start): its code and its cover image. */
export const warm = (path: string) => warmProject(path)

/**
 * The visible object inside a carousel link: a soft grounding shadow, then
 * the lift wrapper (hover and focus move it forward and scale it) holding
 * the PNG with its alpha-aware accent glow, the silhouette hit area, and,
 * for About, the live "About me" label.
 *
 * `data-cover-source` marks the element wrapping the image: the shared-image
 * route transition (projectTransition.ts) moves this same PNG into the
 * destination page's cover slot.
 */
export function CarouselObject({ item, priority }: { item: CarouselItem; priority: boolean }) {
  const artRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)

  useEffect(() => fitHitArea(artRef.current?.querySelector('img') ?? null, hitRef.current), [])

  return (
    <>
      <span className="hobj__floor" aria-hidden="true" />
      <span className="hobj__lift">
        <span className="hobj__figure">
          <span ref={artRef} className="hobj__art" data-cover-source={item.id}>
            <ResponsiveImage image={item.image} sizes={objectSizes(item)} decorative fit="contain" priority={priority} />
          </span>
          <span ref={hitRef} className="hobj__hit" data-hit="" aria-hidden="true" />
        </span>
        {item.visibleLabel && (
          <span className="hobj__label" data-hit="">
            {item.visibleLabel}
          </span>
        )}
      </span>
    </>
  )
}

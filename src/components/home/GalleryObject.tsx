import { useEffect, useRef, type Ref } from 'react'
import type { CarouselItem } from '../../content/carousel'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { fitHitArea } from './objectHull'

interface GalleryObjectProps {
  item: CarouselItem
  /** `sizes` for the image: its featured (largest) rendered width. */
  sizes: string
  priority: boolean
  /** The positioned element (DepthGallery writes its depth transform every frame). */
  objectRef: Ref<HTMLSpanElement>
}

/**
 * One PNG object standing on the floor of the room, all transparent (no
 * card, frame or backing), in layers from the floor up:
 *
 * - `spill`: the project's accent light spilling onto the floor beneath it;
 * - `reflect`: a faint, flipped copy fading within a short distance (the
 *   glossy floor), never strong enough to read as a second object;
 * - `shadow`: a soft contact shadow where it touches the floor;
 * - `lift`: the hover and focus wrapper (forward and +5%; the gallery's
 *   depth transform stays on the outer element) holding the PNG with its
 *   alpha-aware two-layer glow (home.css) and the room's light on it
 *   (`shade`, masked by the same image: a cool light from above, darker
 *   towards the floor);
 * - `hit`: the silhouette pointer target, outside the lift, so it stays
 *   where the object rests: lifting the object never moves the target out
 *   from under the pointer (no hover flicker along the object's lower edge).
 *
 * `data-cover-source` marks the element wrapping the image: the shared-image
 * route transition (projectTransition.ts) moves this same PNG into the
 * destination page's cover slot.
 */
export function GalleryObject({ item, sizes, priority, objectRef }: GalleryObjectProps) {
  const artRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)

  const shadeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const img = artRef.current?.querySelector('img') ?? null
    const stopHit = fitHitArea(img, hitRef.current)
    // The room's light on the artwork: masked by the same (already loaded) file, so it follows the silhouette.
    const shade = shadeRef.current
    const applyShade = () => {
      if (img?.currentSrc && shade) shade.style.maskImage = `url("${img.currentSrc}")`
    }
    if (img?.complete) applyShade()
    img?.addEventListener('load', applyShade)
    return () => {
      stopHit()
      img?.removeEventListener('load', applyShade)
    }
  }, [])

  return (
    <span ref={objectRef} className="gobj__object">
      <span className="gobj__spill" aria-hidden="true" />
      <span className="gobj__reflect" aria-hidden="true">
        <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} />
      </span>
      <span className="gobj__shadow" aria-hidden="true" />
      <span className="gobj__lift">
        <span ref={artRef} className="gobj__art" data-cover-source={item.id}>
          <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} />
          <span ref={shadeRef} className="gobj__shade" aria-hidden="true" />
        </span>
      </span>
      <span ref={hitRef} className="gobj__hit" data-hit="" aria-hidden="true" />
    </span>
  )
}

import { useLayoutEffect, useRef, type Ref } from 'react'
import { GALLERY } from '../../config/carousel'
import type { CarouselItem } from '../../content/carousel'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { fitHitArea } from './objectHull'

interface GalleryObjectProps {
  item: CarouselItem
  index: number
  /** `sizes` for the image: its featured (largest) rendered width. */
  sizes: string
  priority: boolean
  /** The positioned element (DepthGallery writes its depth transform every frame). */
  objectRef: Ref<HTMLSpanElement>
  /**
   * Called once when the object can be shown: its image has loaded and
   * decoded (or failed, so its notice shows). `instant` (no fade) when that
   * happened at once as the gallery mounted (a cached image, such as on
   * Back). A stable function.
   */
  onReady: (index: number, instant: boolean) => void
}

/**
 * One PNG object standing on the floor of the room, all transparent (no
 * card, frame or backing), in layers from the floor up:
 *
 * - `spill`: the project's accent light spilling onto the floor beneath it;
 * - `reflect`: a faint, flipped copy fading within a short distance (the
 *   glossy floor), never strong enough to read as a second object;
 * - `shadow`: a soft contact shadow where it touches the floor;
 * - `lift`: the hover and focus wrapper (forward and slightly larger; the
 *   gallery's depth transform stays on the outer element) holding the PNG
 *   with its alpha-aware two-layer glow (home.css) and the room's light on
 *   it (`shade`, masked by the same image: a cool light from above, darker
 *   towards the floor; invisible until the mask is set, so it never shows
 *   as a rectangle);
 * - `hit`: the silhouette pointer target, outside the lift, so it stays
 *   where the object rests: lifting the object never moves the target out
 *   from under the pointer (no hover flicker along the object's lower edge).
 *
 * Until its image has decoded, DepthGallery keeps the whole object and its
 * name hidden (never a name, a light pool or a panel without its object).
 *
 * `data-cover-source` marks the element wrapping the image: the shared-image
 * route transition (projectTransition.ts) moves this same PNG into the
 * destination page's cover slot.
 */
export function GalleryObject({ item, index, sizes, priority, objectRef, onReady }: GalleryObjectProps) {
  const artRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)
  const shadeRef = useRef<HTMLSpanElement>(null)

  // A layout effect, so an image already loaded at mount is shown in the gallery's first frame.
  useLayoutEffect(() => {
    const img = artRef.current?.querySelector('img') ?? null
    const stopHit = fitHitArea(img, hitRef.current)
    const shade = shadeRef.current
    const mountedAt = performance.now()
    const soon = () => performance.now() - mountedAt < GALLERY.appear.instantWithin
    let alive = true
    let done = false
    const ready = (instant: boolean) => {
      if (done || !alive) return
      done = true
      onReady(index, instant)
    }
    // The room's light on the artwork: masked by the same (already loaded) file, so it follows the silhouette.
    const applyShade = () => {
      if (!img?.currentSrc || !shade) return
      shade.style.maskImage = `url("${img.currentSrc}")`
      if ('masked' in shade.dataset) return
      // Shown at once (the object itself fades in), not with the depth steps' slow transition.
      shade.style.transition = 'none'
      shade.dataset.masked = ''
      void getComputedStyle(shade).opacity
      shade.style.transition = ''
    }
    const onLoad = () => {
      applyShade()
      if (!done && img) void img.decode().then(() => ready(soon()), () => ready(soon()))
    }
    const onError = () => ready(soon())
    if (!img) ready(true)
    else if (img.complete && img.naturalWidth) {
      applyShade()
      ready(true)
    }
    img?.addEventListener('load', onLoad)
    img?.addEventListener('error', onError)
    return () => {
      alive = false
      stopHit()
      img?.removeEventListener('load', onLoad)
      img?.removeEventListener('error', onError)
    }
  }, [index, onReady])

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

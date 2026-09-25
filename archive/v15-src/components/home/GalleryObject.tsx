import { useLayoutEffect, useRef, type Ref } from 'react'
import { GALLERY } from '../../config/carousel'
import type { CarouselItem } from '../../content/carousel'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { fitHitArea } from './objectHull'

interface GalleryObjectProps {
  item: CarouselItem
  index: number
  /** `sizes` for the image: its largest rendered width. */
  sizes: string
  priority: boolean
  /** The scaled and turned element (DepthGallery writes its slot transform and its layers' opacity every frame). */
  objectRef: Ref<HTMLSpanElement>
  /**
   * Called once when the object can be shown: its image has loaded and
   * decoded (or failed, so its notice shows). `instant` (no fade) when that
   * happened at once as the carousel mounted (a cached image, such as on
   * Back). A stable function.
   */
  onReady: (index: number, instant: boolean) => void
}

/**
 * One PNG object of the homepage carousel, all transparent (no card, frame
 * or backing), standing on the room's floor (brief v15). In layers:
 *
 * - `lift`: the hover and focus wrapper (+6% about the silhouette's bottom
 *   centre, its visual baseline, so the bottom edge stays where it is; not
 *   with reduced motion) holding:
 *   - `ground`: what grounds it on the glossy floor (home.css), beneath the
 *     art: a soft contact shadow under its base, and a faint reflection of
 *     the PNG mirrored about its visual baseline, fading out within a
 *     short distance (none for the portrait, whose bust fades out before
 *     the floor);
 *   - `art`, the PNG itself (first image, so the route transition finds it); on hover
 *     and focus it takes a thin red contour (home.css: zero-blur
 *     drop-shadows on its own alpha, about 1px, no glow or spread);
 *   - `glow`: the same image beneath it with an alpha-aware rim and halo
 *     in the project's accent (drop-shadows, never a box), the object's own
 *     light; its opacity is the light by slot (strong on the selected
 *     object, subtle beside it, almost none beyond), so no filter changes
 *     while objects move;
 *   - `dim`: a dark veil masked by the silhouette (objects away from the
 *     centre recede a little without turning see-through);
 * - `hit`: the silhouette pointer target, outside the lift.
 *
 * Every opacity here is written per frame by DepthGallery from the
 * object's slot. Until its image has decoded, the whole object and its
 * label stay hidden.
 *
 * `data-cover-source` marks the element wrapping the image: the shared-image
 * route transition (projectTransition.ts) moves this same PNG into the
 * destination page's cover slot.
 */
export function GalleryObject({ item, index, sizes, priority, objectRef, onReady }: GalleryObjectProps) {
  const artRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)

  // A layout effect, so an image already loaded at mount is shown in the carousel's first frame.
  useLayoutEffect(() => {
    const art = artRef.current
    const img = art?.querySelector('img') ?? null
    const stopHit = fitHitArea(img, hitRef.current)
    const veil = art?.querySelector<HTMLElement>('.gobj__dim') ?? null
    const mountedAt = performance.now()
    const soon = () => performance.now() - mountedAt < GALLERY.appear.instantWithin
    let alive = true
    let done = false
    const ready = (instant: boolean) => {
      if (done || !alive) return
      done = true
      onReady(index, instant)
    }
    // The dimming veil: masked by the same (already loaded) file, so it follows the silhouette.
    const applyMask = () => {
      if (!img?.currentSrc || !veil) return
      veil.style.maskImage = `url("${img.currentSrc}")`
      veil.dataset.masked = ''
    }
    const onLoad = () => {
      applyMask()
      if (!done && img) void img.decode().then(() => ready(soon()), () => ready(soon()))
    }
    const onError = () => ready(soon())
    if (!img) ready(true)
    else if (img.complete && img.naturalWidth) {
      applyMask()
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
      <span className="gobj__lift">
        <span className="gobj__ground" aria-hidden="true">
          <span className="gobj__shadow" />
          {item.kind !== 'headshot' && (
            <span className="gobj__reflection">
              <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={false} loading="eager" />
            </span>
          )}
        </span>
        <span ref={artRef} className="gobj__art" data-cover-source={item.id}>
          <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} loading="eager" />
          <span className="gobj__glow" aria-hidden="true">
            <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} loading="eager" />
          </span>
          <span className="gobj__dim" aria-hidden="true" />
        </span>
      </span>
      <span ref={hitRef} className="gobj__hit" data-hit="" aria-hidden="true" />
    </span>
  )
}

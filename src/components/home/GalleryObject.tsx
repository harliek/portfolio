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
  /** The scaled and turned element (DepthGallery writes its depth transform and its layers' opacity every frame). */
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
 * card, frame or backing), lit by one light model (plan-v9 decision 7,
 * motion-plan P2), in layers from the floor up:
 *
 * - `spill`: the project's accent light on the floor beneath it;
 * - `reflect`: a faint, blurred, short reflection on the glossy floor (a
 *   hint of the floor, never a second object);
 * - `shadow`: a soft contact shadow where it touches the floor, lighter and
 *   narrower as the object lifts;
 * - `lift`: the hover and focus wrapper (up and slightly larger; the
 *   gallery transform stays on the outer element) holding the art:
 *   - the PNG itself (first, so the route transition finds it);
 *   - `glow`: the same image beneath it with the alpha-aware rim and halo
 *     in the accent (drop-shadows, never a box); its opacity carries the
 *     light by depth, so no filter changes while objects travel;
 *   - `shade`: the room's cool light from above, masked by the silhouette;
 *   - `dim`: a dark veil masked by the silhouette (farther objects dim
 *     without turning see-through);
 * - `hit`: the silhouette pointer target, outside the lift, so it stays
 *   where the object rests.
 *
 * Every opacity here is written per frame by DepthGallery from the
 * object's depth. Until its image has decoded, the whole object and its
 * label stay hidden.
 *
 * `data-cover-source` marks the element wrapping the image: the shared-image
 * route transition (projectTransition.ts) moves this same PNG into the
 * destination page's cover slot.
 */
export function GalleryObject({ item, index, sizes, priority, objectRef, onReady }: GalleryObjectProps) {
  const artRef = useRef<HTMLSpanElement>(null)
  const hitRef = useRef<HTMLSpanElement>(null)

  // A layout effect, so an image already loaded at mount is shown in the gallery's first frame.
  useLayoutEffect(() => {
    const art = artRef.current
    const img = art?.querySelector('img') ?? null
    const stopHit = fitHitArea(img, hitRef.current)
    const veils = art ? Array.from(art.querySelectorAll<HTMLElement>('.gobj__shade, .gobj__dim')) : []
    const mountedAt = performance.now()
    const soon = () => performance.now() - mountedAt < GALLERY.appear.instantWithin
    let alive = true
    let done = false
    const ready = (instant: boolean) => {
      if (done || !alive) return
      done = true
      onReady(index, instant)
    }
    // The room's light and the dimming veil: masked by the same (already loaded) file, so they follow the silhouette.
    const applyMasks = () => {
      if (!img?.currentSrc) return
      for (const veil of veils) {
        veil.style.maskImage = `url("${img.currentSrc}")`
        if ('masked' in veil.dataset) continue
        // Shown at once (the object itself fades in), not with the depth steps' slower transition.
        veil.style.transition = 'none'
        veil.dataset.masked = ''
        void getComputedStyle(veil).opacity
        veil.style.transition = ''
      }
    }
    const onLoad = () => {
      applyMasks()
      if (!done && img) void img.decode().then(() => ready(soon()), () => ready(soon()))
    }
    const onError = () => ready(soon())
    if (!img) ready(true)
    else if (img.complete && img.naturalWidth) {
      applyMasks()
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
        <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} loading="eager" />
      </span>
      <span className="gobj__shadow" aria-hidden="true" />
      <span className="gobj__lift">
        <span ref={artRef} className="gobj__art" data-cover-source={item.id}>
          <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} loading="eager" />
          <span className="gobj__glow" aria-hidden="true">
            <ResponsiveImage image={item.image} sizes={sizes} decorative fit="contain" priority={priority} loading="eager" />
          </span>
          <span className="gobj__shade" aria-hidden="true" />
          <span className="gobj__dim" aria-hidden="true" />
        </span>
      </span>
      <span ref={hitRef} className="gobj__hit" data-hit="" aria-hidden="true" />
    </span>
  )
}

import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { EASE, gsap } from '../../lib/gsap'
import { warmProject } from './projectTransition'

/**
 * The project opening (brief v17, shortened in brief v21): one continuous movement, about 300ms.
 *
 *   1. The clicked cover is frozen: that exact frame is cloned where it is
 *      (a playing video stops on its current frame). The caller fades the
 *      captions and lets the rest of its scene recede (`onStart`); the
 *      captions are gone within 100ms.
 *   2. The route changes underneath at once. The new page's hero text and
 *      hero media wait (`data-hero-waiting`, `data-hero-flying` on <html>;
 *      case-v16.css), so no title is ever shown twice and the ground stays
 *      the same near-black.
 *   3. The frame flies from the card into the destination's hero image
 *      position (`[data-hero-media]`) over 500ms. When it is mostly in
 *      place, the destination's title and text arrive (a short fade, 12px
 *      of rise).
 *   4. On landing, the real hero appears under the frame and the frame
 *      fades away; where the hero is a different picture, this is the only
 *      crossfade, after the landing.
 *
 * No titles ride on the frame, and there is no fade-to-black stage. A
 * free-standing picture (`data-free`: Jumpstart's three phones, the cutout
 * compositions, the leasing conversation) travels without a ground or frame,
 * its objects keeping their arrangement as the box moves. If the
 * destination has no hero image (or it cannot be found within 1.5s), the
 * frame fades out over the new page (after at most 600ms). Reduced motion: a plain navigation
 * (the page's own short opacity reveal).
 */
export function expandFrame({
  media,
  path,
  navigate,
  onStart,
}: {
  media: HTMLElement | null
  path: string
  navigate: (path: string) => void
  onStart?: () => void
}) {
  if (prefersReducedMotion() || !media) {
    navigate(path)
    return
  }
  warmProject(path)
  onStart?.()
  const root = document.documentElement
  const rect = media.getBoundingClientRect()
  const overlay = document.createElement('div')
  overlay.className = 'frame-expand'
  overlay.setAttribute('aria-hidden', 'true')
  if (media.dataset.kind) overlay.dataset.kind = media.dataset.kind
  if (media.dataset.free !== undefined) overlay.dataset.free = ''
  const clone = media.cloneNode(true) as HTMLElement
  clone.classList.add('frame-expand__media')
  const sourceVideo = media.querySelector('video')
  const cloneVideo = clone.querySelector('video')
  if (sourceVideo && cloneVideo) {
    cloneVideo.muted = true
    cloneVideo.pause()
    cloneVideo.currentTime = sourceVideo.currentTime
  }
  overlay.append(clone)
  const radius = getComputedStyle(media.closest('.plane__frame, .cx-next__frame') ?? media).borderRadius
  Object.assign(overlay.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: radius })
  document.body.append(overlay)

  const finish = () => {
    root.removeAttribute('data-hero-waiting')
    root.removeAttribute('data-hero-flying')
    gsap.to(overlay, { opacity: 0, duration: 0.18, ease: EASE.arrive, onComplete: () => overlay.remove() })
  }

  // Let the captions fade, then change the page under the picture at once.
  window.setTimeout(() => {
    root.setAttribute('data-hero-waiting', '')
    root.setAttribute('data-hero-flying', '')
    // The router saves this page's scroll position for Back and starts the new page at its top (ScrollRestoration).
    navigate(path)
    const started = performance.now()
    const seek = () => {
      const dest = window.location.pathname === path ? document.querySelector<HTMLElement>('[data-hero-media]') : null
      const box = dest?.getBoundingClientRect()
      if (dest && box && box.width > 0) {
        // The destination's text arrives right away (a short fade), while the picture settles into place.
        root.removeAttribute('data-hero-waiting')
        gsap.to(overlay, {
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          borderRadius: getComputedStyle(dest).borderRadius,
          duration: 0.3,
          ease: EASE.move,
          onComplete: finish,
        })
        return
      }
      if (performance.now() - started > 600) return finish()
      requestAnimationFrame(seek)
    }
    requestAnimationFrame(seek)
  }, 60)
}

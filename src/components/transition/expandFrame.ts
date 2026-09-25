import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { EASE, gsap } from '../../lib/gsap'
import { warmProject } from './projectTransition'

/**
 * The project opening (brief v17, items 4 to 6): one continuous movement.
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
 * picture made of several cutouts (Jumpstart's three phones, `data-kind`
 * "screens") travels without a ground or frame, the phones keeping their
 * arrangement as the box moves, and lands on the page's own three phones. If the
 * destination has no hero image (or it cannot be found within 1.5s), the
 * frame fades out over the new page. Reduced motion: a plain navigation
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
    gsap.to(overlay, { opacity: 0, duration: 0.28, ease: EASE.arrive, onComplete: () => overlay.remove() })
  }

  // Let the captions fade (about 100ms), then change the page under the frame.
  window.setTimeout(() => {
    root.setAttribute('data-hero-waiting', '')
    root.setAttribute('data-hero-flying', '')
    navigate(path)
    window.scrollTo(0, 0)
    const started = performance.now()
    const seek = () => {
      const dest = window.location.pathname === path ? document.querySelector<HTMLElement>('[data-hero-media]') : null
      const box = dest?.getBoundingClientRect()
      if (dest && box && box.width > 0) {
        const to = getComputedStyle(dest).borderRadius
        let revealed = false
        gsap.to(overlay, {
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          borderRadius: to,
          duration: 0.5,
          ease: EASE.move,
          onUpdate() {
            // The destination's text arrives once the image is mostly in position.
            if (!revealed && this.progress() > 0.7) {
              revealed = true
              root.removeAttribute('data-hero-waiting')
            }
          },
          onComplete: finish,
        })
        return
      }
      if (performance.now() - started > 1500) return finish()
      requestAnimationFrame(seek)
    }
    requestAnimationFrame(() => requestAnimationFrame(seek))
  }, 110)
}

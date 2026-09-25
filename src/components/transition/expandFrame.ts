import { EASE, gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { warmProject } from './projectTransition'

/**
 * The project opening (brief v16, section 7): the chosen frame of real work
 * expands to the window's edges while everything else recedes, its title
 * attached to the frame and growing with it; the frame then dips to black
 * as the route changes and the new page fades in (two pictures are never
 * blended over each other). Used by the homepage field and the next-project
 * link at the end of each case study.
 *
 * `media` is the element holding the frame's picture or footage; it is
 * cloned (a playing video continues from the same moment). `onStart` lets
 * the caller hold its own motion and let the rest of its scene recede.
 * Reduced motion: a plain navigation.
 */
export function expandFrame({
  media,
  title,
  titleSize,
  path,
  navigate,
  onStart,
}: {
  media: HTMLElement | null
  title: string
  /** The title's starting size (px), e.g. the caption it grows from. */
  titleSize?: number
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
  const rect = media.getBoundingClientRect()
  const overlay = document.createElement('div')
  overlay.className = 'frame-expand'
  overlay.setAttribute('aria-hidden', 'true')
  const clone = media.cloneNode(true) as HTMLElement
  clone.classList.add('frame-expand__media')
  const sourceVideo = media.querySelector('video')
  const cloneVideo = clone.querySelector('video')
  if (sourceVideo && cloneVideo) {
    cloneVideo.muted = true
    cloneVideo.currentTime = sourceVideo.currentTime
    void cloneVideo.play().catch(() => {})
  }
  const label = document.createElement('p')
  label.className = 'frame-expand__title'
  label.textContent = title
  overlay.append(clone, label)
  Object.assign(overlay.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
  document.body.append(overlay)

  const done = () => {
    gsap.to([clone, label], {
      opacity: 0,
      duration: 0.26,
      ease: EASE.arrive,
      onComplete: () => {
        navigate(path)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => gsap.to(overlay, { opacity: 0, duration: 0.5, ease: EASE.arrive, onComplete: () => overlay.remove() })),
        )
      },
    })
  }
  gsap.set(label, { fontSize: titleSize ?? 24 })
  gsap.to(overlay, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, duration: 0.85, ease: EASE.move, onComplete: done })
  gsap.to(label, { opacity: 1, fontSize: Math.min(80, Math.max(32, window.innerWidth * 0.05)), duration: 0.85, ease: EASE.move })
}

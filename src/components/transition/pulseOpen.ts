import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { warmProject } from './projectTransition'

/** The pulse's timing (ms): the homepage fades away while the light blooms, then the new page is revealed. */
const OUT = 170
const IN = 220
/** The longest the reveal waits for the new page to be drawn (a route still loading), before revealing anyway. */
const WAIT = 450

/**
 * Opening a page from a homepage tile (Harlie's request): one quick, soft light pulse from the clicked tile, about
 * 400ms in all, replacing the old shared-element flight (which could hang when the new page had no matching place).
 *
 *   1. A soft glow blooms outward from the tile's centre while the homepage fades to the dark ground (170ms).
 *   2. The route changes under the dark ground; the new page renders in its finished layout (nothing is held back or
 *      moved into place, so nothing shifts afterwards).
 *   3. As soon as the new page is drawn, the ground fades away and the glow finishes fading, revealing it (220ms).
 *
 * One pulse, no copy of the tile, no frozen frame, no pause between the pages. A page outside the router (the
 * creative portfolio) loads in full after step 1. Reduced motion: a plain fade, no glow. Back (or a page restored
 * from the browser's cache) removes anything left of it at once.
 */
export function pulseOpen({
  from,
  path,
  navigate,
  external = false,
  onStart,
}: {
  from: HTMLElement | null
  path: string
  navigate: (path: string) => void
  /** A page outside the router: a full page load. */
  external?: boolean
  onStart?: () => void
}) {
  if (!external) warmProject(path)
  onStart?.()
  const reduced = prefersReducedMotion()
  const overlay = document.createElement('div')
  overlay.className = 'tile-pulse'
  overlay.setAttribute('aria-hidden', 'true')
  const veil = document.createElement('div')
  veil.className = 'tile-pulse__veil'
  overlay.append(veil)
  let glow: HTMLDivElement | null = null
  if (!reduced && from) {
    const r = from.getBoundingClientRect()
    const size = Math.max(r.width, r.height)
    glow = document.createElement('div')
    glow.className = 'tile-pulse__glow'
    Object.assign(glow.style, { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, width: `${size}px`, height: `${size}px` })
    overlay.append(glow)
  }
  document.body.append(overlay)

  let done = false
  const remove = () => {
    if (done) return
    done = true
    overlay.remove()
    window.removeEventListener('popstate', remove)
    window.removeEventListener('pageshow', onShow)
  }
  const onShow = (e: PageTransitionEvent) => {
    if (e.persisted) remove()
  }
  window.addEventListener('popstate', remove)
  window.addEventListener('pageshow', onShow)

  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 140 : OUT, easing: ease, fill: 'forwards' })
  glow?.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.55)' },
      { opacity: 0.9, transform: 'translate(-50%, -50%) scale(1.6)', offset: 0.42 },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(3.4)' },
    ],
    { duration: OUT + IN + 20, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'forwards' },
  )

  window.setTimeout(
    () => {
      if (done) return
      if (external) {
        // The creative portfolio loads in full; the dark ground stays until it does.
        window.location.assign(path)
        return
      }
      // The router saves this page's scroll position for Back and starts the new page at its top (ScrollRestoration).
      navigate(path)
      const started = performance.now()
      const reveal = () => {
        if (done) return
        const drawn = window.location.pathname === path && document.querySelector('main h1')
        if (!drawn && performance.now() - started < WAIT) {
          requestAnimationFrame(reveal)
          return
        }
        const out = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 160 : IN, easing: ease, fill: 'forwards' })
        out.onfinish = remove
      }
      requestAnimationFrame(reveal)
    },
    reduced ? 140 : OUT,
  )
}

import { useSyncExternalStore } from 'react'

/**
 * The single motion preference for the whole site: the operating system's
 * `prefers-reduced-motion`, followed live. There is no on-page setting
 * (brief v8: no visible Reduce motion toggle), and a value stored by the
 * earlier footer toggle is ignored and cleared.
 *
 * Every motion feature reads this (gallery, pointer trail, background video,
 * sticky highlights, route transitions, reveals), and CSS reads the mirrored
 * `html[data-motion]` attribute ('reduce' or 'full'), so script and styles
 * always agree.
 */

const QUERY = '(prefers-reduced-motion: reduce)'
/** The earlier footer toggle's stored override: no longer read. */
const LEGACY_KEY = 'hk-motion'

const hasWindow = typeof window !== 'undefined'
const mql = hasWindow ? window.matchMedia(QUERY) : null
const listeners = new Set<() => void>()

/** True when the operating system asks for reduced motion. */
export function motionReduced(): boolean {
  return Boolean(mql?.matches)
}

function apply() {
  if (!hasWindow) return
  document.documentElement.dataset.motion = motionReduced() ? 'reduce' : 'full'
}

if (hasWindow) {
  apply()
  mql?.addEventListener('change', () => {
    apply()
    listeners.forEach((l) => l())
  })
  try {
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* Storage unavailable: nothing was stored. */
  }
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useMotionPreference() {
  const reduced = useSyncExternalStore(subscribeMotion, motionReduced, () => false)
  return { reduced }
}

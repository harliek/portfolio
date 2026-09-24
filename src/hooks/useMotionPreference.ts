import { useSyncExternalStore } from 'react'

/**
 * The single motion preference for the whole site.
 *
 * Default: the operating system's `prefers-reduced-motion`. The footer's
 * "Reduce motion" toggle stores a per-viewer override in localStorage
 * ('reduce' or 'allow'); choosing the same value as the OS clears it.
 * Every motion feature reads this (carousel, pointer trail, background
 * video, sticky highlights, route transitions, reveals), and CSS reads the
 * mirrored `html[data-motion]` attribute instead of the media query, so the
 * toggle and the OS setting behave identically everywhere.
 */

const QUERY = '(prefers-reduced-motion: reduce)'
const KEY = 'hk-motion'

type Override = 'reduce' | 'allow' | null

const hasWindow = typeof window !== 'undefined'
const mql = hasWindow ? window.matchMedia(QUERY) : null
const listeners = new Set<() => void>()

function readOverride(): Override {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === 'reduce' || v === 'allow' ? v : null
  } catch {
    return null
  }
}

let override: Override = hasWindow ? readOverride() : null

/** True when motion should be reduced (the override wins over the OS setting). */
export function motionReduced(): boolean {
  if (override) return override === 'reduce'
  return Boolean(mql?.matches)
}

function apply() {
  if (!hasWindow) return
  document.documentElement.dataset.motion = motionReduced() ? 'reduce' : 'full'
}

function emit() {
  apply()
  listeners.forEach((l) => l())
}

if (hasWindow) {
  apply()
  mql?.addEventListener('change', emit)
  // Another tab changed the preference.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    override = readOverride()
    emit()
  })
}

/** Sets the preference; matching the OS value removes the stored override. */
export function setReducedMotion(reduce: boolean) {
  const os = Boolean(mql?.matches)
  override = reduce === os ? null : reduce ? 'reduce' : 'allow'
  try {
    if (override) window.localStorage.setItem(KEY, override)
    else window.localStorage.removeItem(KEY)
  } catch {
    /* Storage unavailable: the choice lasts for this page view. */
  }
  emit()
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useMotionPreference() {
  const reduced = useSyncExternalStore(subscribeMotion, motionReduced, () => false)
  return { reduced, setReduced: setReducedMotion }
}

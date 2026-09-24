import type { NavigationType } from 'react-router-dom'

/**
 * Which object the homepage carousel had selected, per history entry, so
 * browser Back from a project returns to the same selection instead of
 * resetting it (the page's scroll position is restored by the router's
 * ScrollRestoration). A fresh visit (a link, the address bar, a reload, or
 * an in-app link to /) starts at the intended opening (Merchandising
 * Platform selected, About Me on its left).
 *
 * Positions are kept in memory (in-app Back) and in sessionStorage (Back
 * into a reloaded document, e.g. from the creative portfolio, which is a
 * separate page load). The carousel stores its position in items (0 to
 * 7), so it survives a different window size.
 */
export interface SavedPosition {
  /** Carousel position in items. */
  pos?: number
}

const STORAGE_KEY = 'hk-home-carousel'
const memory = new Map<string, SavedPosition>()

/** How this document was loaded ('navigate', 'reload', 'back_forward'). */
function documentNavigation(): string | undefined {
  try {
    return (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type
  } catch {
    return undefined
  }
}

function readStorage(): Record<string, SavedPosition> {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, SavedPosition>) : {}
  } catch {
    return {}
  }
}

/** The saved position for this history entry, only when it was reached with Back or Forward. */
export function recallPosition(key: string, navigationType: NavigationType): SavedPosition | null {
  if (navigationType !== 'POP') return null
  const inMemory = memory.get(key)
  if (inMemory) return inMemory
  // The first render of a document: only a Back/Forward load restores (a reload or a new visit starts fresh).
  if (documentNavigation() !== 'back_forward') return null
  const stored = readStorage()[key]
  return stored && typeof stored.pos === 'number' && Number.isFinite(stored.pos) ? stored : null
}

/** Remembers the position in memory (cheap; call as often as needed). */
export function notePosition(key: string, position: SavedPosition) {
  memory.set(key, { ...memory.get(key), ...position })
}

/** Writes the remembered position for `key` to sessionStorage (on unmount and pagehide). */
export function persistPosition(key: string) {
  const position = memory.get(key)
  if (!position) return
  try {
    const all = readStorage()
    all[key] = position
    // Keep the store small: the most recent 20 entries.
    const keys = Object.keys(all)
    for (const k of keys.slice(0, Math.max(0, keys.length - 20))) delete all[k]
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* Storage unavailable: in-app Back still restores from memory. */
  }
}

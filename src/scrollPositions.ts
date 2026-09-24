/**
 * Scroll restoration keys (used by <ScrollRestoration getKey> in PageShell).
 *
 * react-router gives the first history entry of every freshly loaded
 * document the key 'default', so by default every fresh load in a tab would
 * share one saved position: a second link pasted into the same tab would
 * open mid-page and ignore its #hash. The first entry is therefore keyed by
 * its URL instead; entries created by in-app navigation keep their own key,
 * so Back and Forward still return to where the visitor was.
 */
export const SCROLL_STORAGE_KEY = 'react-router-scroll-positions'

interface KeyLocation {
  key: string
  pathname: string
  search: string
  hash: string
}

export const scrollKey = (l: KeyLocation) => (l.key === 'default' ? `${l.pathname}${l.search}${l.hash}` : l.key)

/**
 * A new arrival (a typed URL, a link from elsewhere, not a reload and not
 * Back/Forward) starts at the top or at its #hash: forget any position saved
 * for this URL earlier in the tab. Runs once, before the router mounts.
 */
function forgetOnNewArrival() {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (!nav || nav.type !== 'navigate') return
    const raw = window.sessionStorage.getItem(SCROLL_STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Record<string, number>
    const { pathname, search, hash } = window.location
    delete saved.default
    delete saved[`${pathname}${search}${hash}`]
    window.sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(saved))
  } catch {
    /* Storage unavailable: nothing was saved either. */
  }
}

if (typeof window !== 'undefined') forgetOnNewArrival()

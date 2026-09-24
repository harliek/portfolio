import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

/** The element to focus for a section target: its first heading, else the target itself. */
function focusTarget(el: HTMLElement): HTMLElement {
  const heading = el.matches('h1, h2, h3') ? el : el.querySelector<HTMLElement>('h1, h2')
  return heading ?? el
}

function focusQuietly(el: HTMLElement) {
  if (!el.hasAttribute('tabindex') && !el.matches('a[href], button, input, select, textarea')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/**
 * Scrolls a section to the top of the view (below the header, via the
 * root's scroll-padding). A newly shown page is still rising into place
 * (.route-reveal translates it a few px), so the scroll subtracts that
 * offset: the section ends exactly in place when the reveal finishes.
 */
function scrollToAnchor(el: HTMLElement) {
  el.scrollIntoView({ block: 'start' })
  const reveal = el.closest<HTMLElement>('.route-reveal')
  const transform = reveal ? getComputedStyle(reveal).transform : 'none'
  const offset = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform).m42 : 0
  if (Math.abs(offset) > 0.5) window.scrollBy(0, -offset)
}

/**
 * Scrolls to an in-page section by id (smoothly unless motion is reduced;
 * the root's scroll-padding keeps it clear of the sticky header) and moves
 * keyboard focus to its heading. Returns false when the id is not on the
 * page, so a link can fall back to ordinary navigation.
 */
export function goToSection(id: string, behavior?: ScrollBehavior): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior: behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth'), block: 'start' })
  focusQuietly(focusTarget(el))
  return true
}

/**
 * After client-side navigation, move focus to the new page's H1 so screen
 * reader and keyboard users start at the top of the new content, or, when
 * the URL has a hash (e.g. "About" → `/#about`, "Contact" → `#contact`), to
 * that section, scrolled into place below the header. Focus never scrolls
 * by itself; Back and Forward keep the restored scroll position.
 *
 * The initial load is left alone for focus, but a direct link with a hash
 * is re-aligned once the page has laid out (images and the carousel can
 * shift the target after the router's first scroll). Pages that manage
 * focus themselves (e.g. the project transition) set data-focus-managed on
 * <main> for one navigation.
 */
export function RouteFocus() {
  const location = useLocation()
  const navType = useNavigationType()
  // The location focus was last handled for. Comparing keys (not a boolean
  // "first run" flag) keeps StrictMode's double effect in dev from acting
  // twice on one navigation.
  const handled = useRef(location.key)

  // Direct load with a hash: re-align after layout settles, unless the
  // visitor has already scrolled.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    let userScrolled = false
    const onUser = () => {
      userScrolled = true
    }
    window.addEventListener('wheel', onUser, { passive: true, once: true })
    window.addEventListener('touchmove', onUser, { passive: true, once: true })
    window.addEventListener('keydown', onUser, { once: true })
    const align = () => {
      if (userScrolled) return
      const el = document.getElementById(decodeURIComponent(hash))
      if (el) scrollToAnchor(el)
    }
    const t1 = window.setTimeout(align, 60)
    const t2 = window.setTimeout(align, 450)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('wheel', onUser)
      window.removeEventListener('touchmove', onUser)
      window.removeEventListener('keydown', onUser)
    }
  }, [])

  useEffect(() => {
    if (handled.current === location.key) return
    handled.current = location.key
    const main = document.getElementById('main')
    if (!main) return
    if (main.dataset.focusManaged === 'true') {
      delete main.dataset.focusManaged
      return
    }
    const hash = location.hash.slice(1)
    let inner = 0
    // Two frames: the lazily rendered page has committed and laid out.
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const anchor = hash ? document.getElementById(decodeURIComponent(hash)) : null
        if (anchor) {
          // Back/Forward restore their own position; new navigations land on the section.
          if (navType !== 'POP') scrollToAnchor(anchor)
          focusQuietly(focusTarget(anchor))
          return
        }
        focusQuietly(main.querySelector<HTMLElement>('h1') ?? main)
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [location.key, location.hash, navType])

  return null
}

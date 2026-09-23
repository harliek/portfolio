import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * After client-side navigation, move focus to the new page's H1 so screen
 * reader and keyboard users start at the top of the new content. The initial
 * load is left alone. Focus never scrolls (scroll restoration handles that).
 * Pages that manage focus themselves (e.g. the project transition) can set
 * data-focus-managed on <main> for one navigation.
 */
export function RouteFocus() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const main = document.getElementById('main')
    if (!main) return
    if (main.dataset.focusManaged === 'true') {
      delete main.dataset.focusManaged
      return
    }
    // Wait a frame so the lazily rendered page has committed.
    const id = requestAnimationFrame(() => {
      const h1 = main.querySelector<HTMLElement>('h1')
      const target = h1 ?? main
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, navType])

  return null
}

import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '../../content/site'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

export function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onHome = pathname === '/'
  const inWork = onHome || pathname.startsWith('/work/')
  const onAbout = pathname === '/about'

  // On the homepage, "Work" moves to the work region instead of reloading the route.
  const onWorkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const target = document.getElementById('work')
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    target.focus({ preventScroll: true })
  }

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="shell site-header__inner">
        <Link to="/" className="site-brand">
          {SITE.name}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <ul>
            <li>
              <Link
                to="/"
                onClick={onWorkClick}
                data-active={inWork}
                aria-current={onHome ? 'page' : inWork ? 'true' : undefined}
              >
                Work
              </Link>
            </li>
            <li>
              <Link to="/about" data-active={onAbout} aria-current={onAbout ? 'page' : undefined}>
                About
              </Link>
            </li>
            <li>
              <a href={SITE.resume} target="_blank" rel="noopener noreferrer" aria-label="Open résumé PDF in a new tab.">
                Resume <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

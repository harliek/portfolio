import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { prefetchRoute } from '../../routes'
import { WorkShelf } from './WorkShelf'

const SHELF_ID = 'work-shelf'
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, video, [contenteditable], [tabindex]:not([tabindex="-1"])'

/** Moves to the footer's contact section in place (every page has it). */
export function goToContact(e?: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById('contact')
  if (!target) return
  e?.preventDefault()
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

/**
 * Header: "Harlie Katz" (home) on the left; Work, About and Contact on the
 * right. Work is a button that opens the Work shelf (WorkShelf.tsx). The
 * current section carries a thin violet underline (not colour alone).
 */
export function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Shelf thumbnails load only once the visitor shows interest in Work (hover, focus or open).
  const [warm, setWarm] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const workRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes the shelf (adjusting state while rendering, not in an effect).
  const [seen, setSeen] = useState(pathname)
  if (seen !== pathname) {
    setSeen(pathname)
    setOpen(false)
  }

  // Escape, a click outside, or focus leaving the header closes the shelf.
  // Focus returns to Work, except when the click itself landed on something
  // focusable (a link, a button, a field), which keeps the focus it was given.
  useEffect(() => {
    if (!open) return
    const header = headerRef.current
    const focusWork = () => workRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setOpen(false)
      focusWork()
    }
    const onPointer = (e: PointerEvent) => {
      if (header?.contains(e.target as Node)) return
      const hadFocus = header?.contains(document.activeElement)
      setOpen(false)
      const interactive = e.target instanceof Element && e.target.closest(INTERACTIVE)
      // After the browser's own mousedown focus handling (which would otherwise focus <main>).
      if (hadFocus && !interactive) window.setTimeout(focusWork, 0)
    }
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !header?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('focusin', onFocus)
    }
  }, [open])

  const active = projectForPath(pathname)
  const inWork = Boolean(active)
  const onAbout = pathname === '/about'

  return (
    <header ref={headerRef} className="site-header" data-scrolled={scrolled} data-shelf-open={open || undefined}>
      <div className="shell site-header__inner">
        <Link to="/" className="site-brand" aria-current={pathname === '/' ? 'page' : undefined}>
          {SITE.name}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list" role="list">
            <li>
              <button
                ref={workRef}
                type="button"
                className="site-nav__item site-nav__work"
                aria-expanded={open}
                aria-controls={SHELF_ID}
                data-active={inWork}
                onClick={() => {
                  setWarm(true)
                  setOpen((o) => !o)
                }}
                onPointerEnter={() => setWarm(true)}
                onFocus={() => setWarm(true)}
              >
                Work
                <svg className="site-nav__chevron" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <WorkShelf
                id={SHELF_ID}
                open={open}
                thumbs={warm || open}
                activeId={active?.id}
                onNavigate={() => setOpen(false)}
                onClose={() => {
                  setOpen(false)
                  workRef.current?.focus({ preventScroll: true })
                }}
              />
            </li>
            <li>
              <Link
                to="/about"
                className="site-nav__item"
                data-active={onAbout}
                aria-current={onAbout ? 'page' : undefined}
                onPointerEnter={() => prefetchRoute('/about')}
                onFocus={() => prefetchRoute('/about')}
              >
                About
              </Link>
            </li>
            <li>
              <a href="#contact" className="site-nav__item" onClick={goToContact}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

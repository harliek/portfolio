import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { goToSection } from './RouteFocus'
import { MobileMenu, WorkShelf } from './WorkShelf'

const SHELF_ID = 'work-shelf'
const MENU_ID = 'site-menu'
const DESKTOP_QUERY = '(min-width: 900px)'
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, video, [contenteditable], [tabindex]:not([tabindex="-1"])'
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const modified = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

/** Moves to the footer's contact area in place (every professional page has it). */
export function goToContact(e?: MouseEvent<HTMLAnchorElement>) {
  if (e && modified(e)) return
  if (goToSection('contact')) e?.preventDefault()
}

/**
 * Header: a two-line home link on the left ("Harlie Katz" over
 * "Professional portfolio"); Work, About and Contact on the right.
 *
 * - Work is a button that opens the Work shelf (WorkShelf.tsx): click
 *   toggles, Escape or a click outside closes (focus returns to Work),
 *   Arrow Down or keyboard activation moves focus to the first project.
 * - About opens the dedicated About page (`/about`).
 * - Contact scrolls to the single contact area in the footer (`#contact`).
 *
 * Below 900px the three become one "Menu" button with an accessible panel
 * (six projects, About, Contact): focus stays inside, Escape closes, the
 * page behind does not scroll.
 */
export function Header() {
  const { pathname } = useLocation()
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Keyboard opening moves focus into the shelf; a mouse click does not.
  const [focusFirst, setFocusFirst] = useState(false)
  // Shelf thumbnails load only once the visitor shows interest in Work (hover, focus or open).
  const [warm, setWarm] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const workRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation, or crossing the desktop breakpoint, closes the shelf or
  // menu (adjusting state while rendering, not in an effect).
  const [seen, setSeen] = useState({ pathname, desktop })
  if (seen.pathname !== pathname || seen.desktop !== desktop) {
    setSeen({ pathname, desktop })
    setOpen(false)
  }

  // Desktop shelf: Escape, a click outside, or focus leaving the header
  // closes it. Focus returns to Work, except when the click itself landed on
  // something focusable (a link, a button, a field), which keeps the focus.
  useEffect(() => {
    if (!open || !desktop) return
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
  }, [open, desktop])

  // Mobile menu: the page behind is locked, Tab cycles within the header
  // (home link, Menu, the panel's links), Escape closes and returns focus.
  useEffect(() => {
    if (!open || desktop) return
    const header = headerRef.current
    const root = document.documentElement
    root.classList.add('is-menu-open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        menuRef.current?.focus({ preventScroll: true })
        return
      }
      if (e.key !== 'Tab' || !header) return
      const items = [...header.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]') && el.getClientRects().length > 0)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !header.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !header.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      root.classList.remove('is-menu-open')
    }
  }, [open, desktop])

  /** Closes the menu at once (and unlocks the page) before an in-page scroll. */
  const closeNow = () => {
    document.documentElement.classList.remove('is-menu-open')
    setOpen(false)
  }

  const onAbout = (e: MouseEvent<HTMLAnchorElement>) => {
    if (modified(e)) return
    setOpen(false)
  }

  const onContact = (e: MouseEvent<HTMLAnchorElement>) => {
    if (modified(e)) return
    e.preventDefault()
    closeNow()
    goToSection('contact')
  }

  const active = projectForPath(pathname)
  const inWork = Boolean(active)
  const onAboutPage = pathname === '/about'

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-scrolled={scrolled}
      data-open={open ? (desktop ? 'shelf' : 'menu') : undefined}
    >
      <div className="shell site-header__inner">
        <Link to="/" className="site-brand" aria-current={pathname === '/' ? 'page' : undefined}>
          <span className="site-brand__name">{SITE.name}</span>
          <span className="site-brand__role">Professional portfolio</span>
        </Link>

        {desktop ? (
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
                  onClick={(e) => {
                    setWarm(true)
                    // detail === 0: activated from the keyboard (Enter or Space).
                    setFocusFirst(!open && e.detail === 0)
                    setOpen(!open)
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowDown') return
                    e.preventDefault()
                    setWarm(true)
                    setFocusFirst(true)
                    setOpen(true)
                  }}
                  onPointerEnter={() => setWarm(true)}
                  onFocus={() => setWarm(true)}
                >
                  Work
                  <svg className="site-nav__chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <WorkShelf
                  id={SHELF_ID}
                  open={open}
                  focusFirst={focusFirst}
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
                  data-active={onAboutPage}
                  aria-current={onAboutPage ? 'page' : undefined}
                  onClick={onAbout}
                >
                  About
                </Link>
              </li>
              <li>
                <a href="#contact" className="site-nav__item" onClick={onContact}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        ) : (
          <button
            ref={menuRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen(!open)}
          >
            <span className="menu-button__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {open ? 'Close' : 'Menu'}
          </button>
        )}
      </div>

      {!desktop && (
        <MobileMenu
          id={MENU_ID}
          open={open}
          activeId={active?.id}
          aboutCurrent={onAboutPage}
          onNavigate={() => setOpen(false)}
          onAbout={onAbout}
          onContact={onContact}
        />
      )}
    </header>
  )
}

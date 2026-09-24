import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ExternalMark, MobileMenu, WorkShelf } from './WorkShelf'

const SHELF_ID = 'work-shelf'
const MENU_ID = 'site-menu'
const DESKTOP_QUERY = '(min-width: 900px)'
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, video, [contenteditable], [tabindex]:not([tabindex="-1"])'
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** The restored original creative homepage: an isolated static build, opened with a full page load. */
const CREATIVE_HREF = '/creative/'

const modified = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

/**
 * Cancels the click that completes the current press, so a press on the
 * dimmed page below the open shelf only closes the shelf and never also
 * opens or follows what is underneath. The guard lasts one press: it goes
 * with that click, shortly after a release that produced none (a drag), on a
 * cancelled pointer, or at the next key press, so no later click or keyboard
 * activation is ever lost.
 */
function swallowPressClick() {
  let timer = 0
  const done = () => {
    window.clearTimeout(timer)
    window.removeEventListener('click', stop, true)
    window.removeEventListener('pointerup', released, true)
    window.removeEventListener('pointercancel', done, true)
    window.removeEventListener('keydown', done, true)
  }
  const stop = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    done()
  }
  const released = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(done, 400)
  }
  window.addEventListener('click', stop, true)
  window.addEventListener('pointerup', released, true)
  window.addEventListener('pointercancel', done, true)
  window.addEventListener('keydown', done, true)
}

/**
 * Header. On the homepage there is no brand (the page's own identity block
 * is the introduction), only the navigation. On every other page a smaller
 * home link sits on the left: "Harlie Katz" (28px, the homepage title's pale
 * core and soft lavender glow at a smaller size) over "Professional
 * portfolio". Navigation on the right:
 *
 * - Work: a button that opens the Work shelf (WorkShelf.tsx). Click toggles;
 *   Escape, a click outside or focus leaving closes it (focus returns to
 *   Work); Arrow Down or keyboard activation moves focus to the first project.
 * - About: the dedicated About page (`/about`).
 * - Creative Portfolio: a plain link to the restored original creative
 *   homepage (`/creative/`, a separate build, so a full page load).
 *
 * Below 900px the three become one "Menu" button with an accessible panel
 * (six projects, About, Creative Portfolio): focus stays inside, Escape
 * closes, the page behind does not scroll.
 *
 * On a case study the header carries that project's accent (`--accent`), so
 * its hover and focus states match the page; elsewhere they are lavender.
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

  // Desktop shelf: Escape, a click outside Work and its shelf, or focus
  // leaving them (e.g. Tab on to About) closes it. Focus returns to Work,
  // except when the click itself landed on something focusable (a link, a
  // button, a field), which keeps the focus. A click on the dimmed page only
  // closes the shelf (what is underneath is not activated); the header's own
  // links (home, About, Creative Portfolio) work directly.
  useEffect(() => {
    if (!open || !desktop) return
    const scope = workRef.current?.closest('li')
    const focusWork = () => workRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setOpen(false)
      focusWork()
    }
    const onPointer = (e: PointerEvent) => {
      if (scope?.contains(e.target as Node)) return
      const hadFocus = scope?.contains(document.activeElement)
      setOpen(false)
      if (!headerRef.current?.contains(e.target as Node)) swallowPressClick()
      const interactive = e.target instanceof Element && e.target.closest(INTERACTIVE)
      // After the browser's own mousedown focus handling (which would otherwise focus <main>).
      if (hadFocus && !interactive) window.setTimeout(focusWork, 0)
    }
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !scope?.contains(e.target)) setOpen(false)
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

  const onAbout = (e: MouseEvent<HTMLAnchorElement>) => {
    if (modified(e)) return
    setOpen(false)
  }

  const home = pathname === '/'
  const active = projectForPath(pathname)
  const inWork = Boolean(active)
  const onAboutPage = pathname === '/about'

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-home={home || undefined}
      data-scrolled={scrolled}
      data-open={open ? (desktop ? 'shelf' : 'menu') : undefined}
      style={active ? accentVars(active.accent) : undefined}
    >
      <div className="shell site-header__inner">
        {!home && (
          <Link to="/" className="site-brand">
            <span className="site-brand__name">{SITE.name}</span>
            <span className="site-brand__role">Professional portfolio</span>
          </Link>
        )}

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
                <a href={CREATIVE_HREF} className="site-nav__item">
                  Creative Portfolio
                  <ExternalMark />
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
          creativeHref={CREATIVE_HREF}
          onNavigate={() => setOpen(false)}
          onAbout={onAbout}
        />
      )}
    </header>
  )
}

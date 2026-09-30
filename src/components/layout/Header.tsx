import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { projectForPath } from '../../content/projects'
import { stageRouteFor } from '../../config/stage'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { PageLink } from '../transition/PageLink'
import { changePage, leaveSite, type Direction } from '../transition/pageChange'
import { isPlainClick } from '../transition/warm'
import { pillWidth } from './pill'
import { ExternalMark, MobileMenu } from './WorkShelf'

/** Scroll (px) past which the bar gathers into the floating pill: early, so nothing passes under the transparent bar. */
const FLOAT_AT = 12

const MENU_ID = 'site-menu'
const DESKTOP_QUERY = '(min-width: 900px)'
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
/** Everything on the page outside the header: out of reach while the small-screen menu covers it. */
const BEHIND_MENU = '.skip-link, #main, .site-end'

/** The restored original creative homepage: an isolated static build, opened with a full page load. */
const CREATIVE_HREF = '/creative/'

const modified = (e: MouseEvent) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

/**
 * Header, styled after Harlie's original portfolio (brief v14): a transparent bar on every professional page, the
 * same on each route. As soon as the page scrolls (past FLOAT_AT, 12px) it becomes a resizable navbar (after
 * Aceternity's): the bar's contents gather into a narrower floating pill with a blurred, translucent ground and a soft
 * shadow, and back again at the top; the header keeps its height throughout. After a page change it takes the new
 * page's state at once, so it never morphs after the page has arrived (Harlie's brief, 2026-09-28). Hovering an item
 * draws nothing on it: the cursor's outline is the header's only hover (Harlie's requests, 2026-09-27 and 2026-09-28).
 * At the left, "← Back" on case studies and About (brief v21: it returns to the previous view in the site; opened
 * from outside, it goes to the homepage's project collection, centred on the project just left), then HOME (a link to
 * "/"); the navigation at the right. Every item is small capitals with wide tracking (layout.css); the current page's
 * item is set in white with a soft glow, and keyboard focus draws a thin line under the words inside the focus ring.
 *
 * - About: the dedicated About page (`/about`).
 * - Creative Portfolio: a plain link to the restored original creative
 *   homepage (`/creative/`, a separate build, so a full page load), with a
 *   small arrow for leaving the professional site.
 *
 * Below 900px they become one "Menu" button (the same small capitals) with an accessible panel (six projects, About,
 * Creative Portfolio): the page behind is inert and does not scroll, Tab and Shift+Tab go round the header and the
 * panel in every browser, and Escape closes. A page chosen from it changes with the menu still open, so the menu
 * leaves with the page being left (Harlie's brief, 2026-09-28). HOME stays at the left at every width.
 *
 * Every state uses the statement blue violet (the per-project accents, rose, lime and amber, were read by no rule and
 * are gone; Harlie's QA pass, 2026-09-28: blue violet only). Keyboard focus is a near-white line inside a blue violet
 * ring, so it never reads as the pointer's light (Harlie's brief, 2026-09-28; layout.css). The
 * header is --header-height tall as a bar and as the floating pill alike, and --header-safe (tokens.css) is the
 * navigation's safe area for anything that settles below it.
 */
export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const [open, setOpen] = useState(false)
  // Resizable navbar (after Aceternity's): as soon as the page scrolls (the bar is transparent), it becomes a floating pill.
  const [floating, setFloating] = useState(() => typeof window !== 'undefined' && window.scrollY > FLOAT_AT)
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)

  // Any navigation, or crossing the desktop breakpoint, closes the shelf or
  // menu (adjusting state while rendering, not in an effect).
  const [seen, setSeen] = useState({ pathname, desktop })
  if (seen.pathname !== pathname || seen.desktop !== desktop) {
    setSeen({ pathname, desktop })
    setOpen(false)
  }

  // The floating pill hugs its contents (Harlie's request: no big gap): the left group, a 40px gap, the navigation.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const measure = () => {
      const width = pillWidth(header)
      if (width !== null) header.style.setProperty('--pill-w', `${width}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    header.querySelectorAll('.site-header__start, .site-nav, .menu-button').forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [desktop, pathname])

  // A page change: the header takes the new page's state at once, as the new page is pictured (Harlie's brief,
  // 2026-09-28: it caught up only at the next scroll event, so the pill unfolded into the bar 520 to 640ms after the
  // page had arrived, "← BACK" sliding along). Read once every layout effect of the change has run, the router's
  // scroll restoration included (it comes after the header in PageShell).
  useLayoutEffect(() => {
    let live = true
    queueMicrotask(() => {
      const next = window.scrollY > FLOAT_AT
      if (!live || next === headerRef.current?.hasAttribute('data-floating')) return
      flushSync(() => setFloating(next))
    })
    return () => {
      live = false
    }
  }, [pathname])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setFloating(window.scrollY > FLOAT_AT)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Small-screen menu: the page behind is locked and inert, Tab and Shift+Tab go round the header's items and the
  // panel's links, and Escape closes and returns focus to Menu. Tab is moved here rather than left to the browser, so
  // it stays in the menu in Safari too, whose default Tab skips links (Harlie's brief, 2026-09-28: Tab went from Back
  // to the contact form's Name field behind the menu, and the locked page scrolled to it); a focus that lands outside
  // the header anyway is brought back.
  useEffect(() => {
    if (!open || desktop) return
    const header = headerRef.current
    const root = document.documentElement
    root.classList.add('is-menu-open')
    // Only what this menu made inert is released again.
    const behind = [...document.querySelectorAll<HTMLElement>(BEHIND_MENU)].filter((el) => !el.inert)
    behind.forEach((el) => {
      el.inert = true
    })
    const shown = (el: HTMLElement) => !el.closest('[inert]') && el.getClientRects().length > 0
    const items = () => (header ? [...header.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(shown) : [])
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        menuRef.current?.focus({ preventScroll: true })
        return
      }
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return
      const list = items()
      if (list.length === 0) return
      e.preventDefault()
      const at = list.indexOf(document.activeElement as HTMLElement)
      const step = e.shiftKey ? -1 : 1
      const next = at < 0 ? (e.shiftKey ? list.length - 1 : 0) : (at + step + list.length) % list.length
      list[next].focus()
    }
    const onFocusIn = (e: FocusEvent) => {
      if (!header || !(e.target instanceof Node) || header.contains(e.target)) return
      items()[0]?.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocusIn)
      behind.forEach((el) => {
        el.inert = false
      })
      root.classList.remove('is-menu-open')
      header?.querySelectorAll('[data-pressed]').forEach((el) => el.removeAttribute('data-pressed'))
    }
  }, [open, desktop])

  /**
   * A plain click on HOME or a page in the menu. With the menu open, the page changes with the menu still showing, so
   * it leaves with the page being left (Harlie's brief, 2026-09-28: the menu snapped shut, the old page came back
   * for 200ms and only then came apart); the new route closes it (above) as the new page is drawn. It closes at once
   * when there is no change to carry it (the same page, a change already under way, or an ordinary navigation). A
   * modified click opens a new tab and leaves it open.
   */
  const toPage = (to: string, direction?: Direction) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return
    if (!open) return
    // PageLink leaves a click it sees handled alone (isPlainClick): the change is started here, to see how it went.
    e.preventDefault()
    const link = e.currentTarget
    if (changePage({ to, navigate, direction }) !== 'started') setOpen(false)
    // The chosen entry stays pressed while the menu leaves with the page (layout.css), so the tap reads at once.
    else link.dataset.pressed = ''
  }

  const home = pathname === '/'
  const active = projectForPath(pathname)
  const inWork = Boolean(active)
  const onAboutPage = pathname === '/about'
  const canGoBack = inWork || onAboutPage

  /**
   * The previous view in the site when there is one (react-router numbers its entries); otherwise the project
   * collection. Either way with the page change every in-site link has (pageChange.ts), its pieces sweeping to the
   * right.
   */
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    // Opened from outside: the collection, centred on the project just left (ProjectField reads `from`).
    const started =
      idx > 0
        ? changePage({ to: -1, navigate, direction: 'back' })
        : changePage({ to: '/', state: { toWork: true, from: active?.id }, navigate, direction: 'back' })
    // As for the pages above: an open menu leaves with the page, unless there is no change to carry it.
    if (started !== 'started') setOpen(false)
  }

  /** The creative portfolio is a separate site: its own full page load, after this page's outgoing half. */
  const toCreative = (e: MouseEvent<HTMLAnchorElement>) => {
    if (modified(e)) return
    e.preventDefault()
    leaveSite(CREATIVE_HREF)
  }

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-open={open ? 'menu' : undefined}
      data-floating={floating || undefined}
      data-route={stageRouteFor(pathname)}
    >
      <div className="site-header__inner">
        <div className="site-header__start">
          {canGoBack && (
            <button type="button" className="site-nav__item site-back" onClick={goBack}>
              <span className="site-back__arrow" aria-hidden="true">
                ←
              </span>
              Back
            </button>
          )}
          <PageLink to="/" direction="back" className="site-nav__item site-home" data-active={home} aria-current={home ? 'page' : undefined} onClick={toPage('/', 'back')}>
            Home
          </PageLink>
        </div>

        {desktop ? (
          <nav className="site-nav" aria-label="Primary">
            <ul className="site-nav__list" role="list">
              <li>
                <PageLink
                  to="/about"
                  className="site-nav__item"
                  data-active={onAboutPage}
                  aria-current={onAboutPage ? 'page' : undefined}
                >
                  About
                </PageLink>
              </li>
              <li>
                <a href={CREATIVE_HREF} className="site-nav__item site-nav__item--alt" onClick={toCreative}>
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
          onNavigate={toPage}
        />
      )}
    </header>
  )
}


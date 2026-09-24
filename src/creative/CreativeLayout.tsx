import { useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigationType } from 'react-router-dom'
import { RouteFocus } from '../components/layout/RouteFocus'
import { SCROLL_STORAGE_KEY, scrollKey } from '../scrollPositions'
import '../styles/creative-legacy.css'
import { LayerContext } from './lib/Lightbox'
import { Header } from './site/Header'

/**
 * The restored creative portfolio (/creative, /creative/art, /creative/film).
 *
 * Rendered outside the professional PageShell: its own restored header, and
 * each page ends with the original Contact band and footer. No background
 * video, professional header/footer or pointer trail. Everything it styles is
 * scoped under `.legacy-creative` (src/styles/creative-legacy.css).
 *
 * The original's Playfair Display comes from Google Fonts (as it did there),
 * requested only while this layout is mounted; Inter is the site's own
 * self-hosted file.
 */

const FONT_LINKS: { id: string; rel: string; href: string; crossOrigin?: string }[] = [
  { id: 'lc-font-pre-1', rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { id: 'lc-font-pre-2', rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    id: 'lc-font-css',
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap',
  },
]

function useLegacyFonts() {
  useEffect(() => {
    const added: HTMLLinkElement[] = []
    for (const l of FONT_LINKS) {
      if (document.getElementById(l.id)) continue
      const el = document.createElement('link')
      el.id = l.id
      el.rel = l.rel
      el.href = l.href
      if (l.crossOrigin) el.crossOrigin = l.crossOrigin
      document.head.appendChild(el)
      added.push(el)
    }
    return () => added.forEach((el) => el.remove())
  }, [])
}

/**
 * Arriving from a professional page (a link, not a fresh load or Back), focus
 * starts at the new page's H1 (or its #hash target), as RouteFocus does for
 * navigation within the creative pages.
 */
function useArrivalFocus() {
  const arrival = useRef(useNavigationType())
  useEffect(() => {
    if (arrival.current === 'POP') return
    const id = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1)
      const target =
        (hash ? document.getElementById(decodeURIComponent(hash)) : null) ??
        document.querySelector<HTMLElement>('.legacy-creative main h1')
      if (!target) return
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [])
}

export default function CreativeLayout() {
  const { pathname } = useLocation()
  const [layer, setLayer] = useState<HTMLDivElement | null>(null)
  useLegacyFonts()
  useArrivalFocus()

  return (
    <LayerContext.Provider value={layer}>
      <div className="legacy-creative">
        <a className="lc-skip" href="#main">
          Skip to content
        </a>
        <Header />
        <div className="lc-route" key={pathname}>
          <Outlet />
        </div>
        <div className="lc-layer" ref={setLayer} />
      </div>
      <RouteFocus />
      <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORAGE_KEY} />
    </LayerContext.Provider>
  )
}

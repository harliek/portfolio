import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
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
 * RouteFocus moves focus to the new page's H1 after every in-app navigation,
 * including arriving here from a professional page (link, Back or Forward).
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

export default function CreativeLayout() {
  const { pathname } = useLocation()
  const [layer, setLayer] = useState<HTMLDivElement | null>(null)
  useLegacyFonts()

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

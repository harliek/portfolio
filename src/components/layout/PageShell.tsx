import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { useMediaPlayback } from '../../hooks/useMediaPlayback'
import { SCROLL_STORAGE_KEY, scrollKey } from '../../scrollPositions'
import { ImageDialogProvider } from '../media/ImageDialog'
import { Footer } from './Footer'
import { Header } from './Header'
import { PointerTrail } from './PointerTrail'
import { RouteFocus } from './RouteFocus'
import { StageBackground, type StageRoute } from './StageBackground'

const routeOf = (pathname: string): StageRoute =>
  pathname === '/'
    ? 'home'
    : pathname.startsWith('/work/')
      ? 'case'
      : pathname === '/about'
        ? 'about'
        : pathname === '/art' || pathname === '/film'
          ? 'creative'
          : 'other'

/**
 * Root layout: the persistent background set (mounted once, outside the
 * keyed route content, so the same <video> keeps playing across every
 * navigation), skip link, header with the Work shelf, main (the new page
 * rises 6px as it settles; no blank beat), the footer with Contact and the
 * "Reduce motion" toggle on every page, and the pointer trail.
 */
export function PageShell() {
  const { pathname } = useLocation()
  useMediaPlayback()
  return (
    <ImageDialogProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <StageBackground route={routeOf(pathname)} />
      <Header />
      <main id="main" className="site-main" tabIndex={-1}>
        <div key={pathname} className="route-reveal">
          <Outlet />
        </div>
      </main>
      <Footer />
      <PointerTrail />
      <RouteFocus />
      <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORAGE_KEY} />
    </ImageDialogProvider>
  )
}

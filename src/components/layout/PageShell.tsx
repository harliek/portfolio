import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { stageRouteFor } from '../../config/stage'
import { useMediaPlayback } from '../../hooks/useMediaPlayback'
import { SCROLL_STORAGE_KEY, scrollKey } from '../../scrollPositions'
import { ImageDialogProvider } from '../media/ImageDialog'
import { Footer } from './Footer'
import { Header } from './Header'
import { PointerTrail } from './PointerTrail'
import { RouteFocus } from './RouteFocus'
import { StageBackground } from './StageBackground'

/**
 * Root layout of the professional site: the persistent background set
 * (mounted once, outside the keyed route content, so the same <video> keeps
 * playing across every navigation), skip link, header with the Work shelf,
 * main (the new page rises 6px as it settles; no blank beat), the footer
 * (the single contact area and the "Reduce motion" setting), and the
 * pointer trail. The creative portfolio has its own layout.
 */
export function PageShell() {
  const { pathname } = useLocation()
  useMediaPlayback()
  return (
    <ImageDialogProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <StageBackground route={stageRouteFor(pathname)} />
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

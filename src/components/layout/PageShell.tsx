import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { useMediaPlayback } from '../../hooks/useMediaPlayback'
import { ImageDialogProvider } from '../media/ImageDialog'
import { Footer } from './Footer'
import { Header } from './Header'
import { RouteFocus } from './RouteFocus'

/** Root layout: skip link, header, main (with route reveal), footer. */
export function PageShell() {
  const { pathname } = useLocation()
  useMediaPlayback()
  return (
    <ImageDialogProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="site-main" tabIndex={-1}>
        <div key={pathname} className="route-reveal">
          <Outlet />
        </div>
      </main>
      <Footer />
      <RouteFocus />
      <ScrollRestoration />
    </ImageDialogProvider>
  )
}

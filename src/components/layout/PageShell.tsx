import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { stageRouteFor } from '../../config/stage'
import { useMediaPlayback } from '../../hooks/useMediaPlayback'
import { SCROLL_STORAGE_KEY, scrollKey } from '../../scrollPositions'
import { ImageDialogProvider } from '../media/ImageDialog'
import { FilmSlotContext } from './filmSlot'
import { Footer } from './Footer'
import { CaseGround } from './CaseGround'
import { CustomCursor } from './CustomCursor'
import { Header } from './Header'
import { OrbBackground } from './OrbBackground'
import { PointerTrail } from './PointerTrail'
import { RouteFocus } from './RouteFocus'
import { StageBackground } from './StageBackground'

/**
 * Root layout of the professional site: the background set (mounted once, outside the keyed route content), skip
 * link, header (with the small-screen menu), main (the new page arrives whole; no blank beat), the footer, the pointer
 * trail and the pointer itself. Motion follows the operating system's reduced-motion preference only. The restored
 * creative portfolio is a separate static build at /creative/, outside this shell.
 */
export function PageShell() {
  const { pathname } = useLocation()
  const route = stageRouteFor(pathname)
  const [filmSlot, setFilmSlot] = useState<HTMLDivElement | null>(null)
  useMediaPlayback()
  return (
    <FilmSlotContext.Provider value={filmSlot}>
      <ImageDialogProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StageBackground />
        {/* Harlie's Orb shader behind the remaining pages (not found); idle on the homepage (the film covers it), the case studies and About. */}
        <OrbBackground active={route === 'other'} />
        {/* The case studies and About: the Nebula Drift field with the cursor's blue violet light (CaseGround). */}
        <CaseGround on={route === 'case' || route === 'about'} />
        {/* The homepage portals its film here: outside the route wrapper, whose reveal animation would capture position: fixed. */}
        <div ref={setFilmSlot} id="stage-film" className="stage-film" />
        <Header />
        <main id="main" className="site-main" tabIndex={-1}>
          <div key={pathname} className="route-reveal">
            <Outlet />
          </div>
        </main>
        <Footer />
        <PointerTrail />
        {/* The pointer as a glowing ball of light that outlines what it hovers (Harlie's request). */}
        <CustomCursor />
        <RouteFocus />
        <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORAGE_KEY} />
      </ImageDialogProvider>
    </FilmSlotContext.Provider>
  )
}


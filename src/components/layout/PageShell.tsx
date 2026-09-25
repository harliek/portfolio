import { useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { stageRouteFor } from "../../config/stage";
import { useMediaPlayback } from "../../hooks/useMediaPlayback";
import { SCROLL_STORAGE_KEY, scrollKey } from "../../scrollPositions";
import { ImageDialogProvider } from "../media/ImageDialog";
import { FilmSlotContext } from "./filmSlot";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { PointerTrail } from "./PointerTrail";
import { RouteFocus } from "./RouteFocus";
import { StageBackground } from "./StageBackground";

/**
 * Root layout of the professional site: the persistent background set
 * (mounted once, outside the keyed route content, so the same <video> keeps
 * playing across every navigation), skip link, header (no brand on the
 * homepage) with the Work shelf, main (the new page rises 6px as it
 * settles; no blank beat; no rise while a carousel object travels into it),
 * the compact footer (the copyright line), and the pointer trail. Motion
 * follows the operating system's reduced-motion preference only. The restored creative portfolio is a separate static
 * build at /creative/, outside this shell.
 */
export function PageShell() {
  const { pathname } = useLocation();
  const [filmSlot, setFilmSlot] = useState<HTMLDivElement | null>(null);
  useMediaPlayback();
  return (
    <FilmSlotContext.Provider value={filmSlot}>
      <ImageDialogProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StageBackground route={stageRouteFor(pathname)} />
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
        <RouteFocus />
        <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORAGE_KEY} />
      </ImageDialogProvider>
    </FilmSlotContext.Provider>
  );
}

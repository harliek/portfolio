/**
 * The persistent background set (StageBackground, mounted once in PageShell):
 * the film on the homepage, a quiet near-black ground on every other page
 * (case studies, About, the not-found page; no architectural video, walls,
 * floor or reflection line). CSS-side values (the film's overlay, the
 * ground's faint tone) live in src/styles/stage.css.
 */
export const STAGE = {
  background: {
    /** Choose the smaller film file below this width (one file per device, chosen once). */
    mobileBelow: 600,
    /** The film fades in over its poster once frames are actually playing (ms). */
    fadeInMs: 800,
    /**
     * The page's visible images load before the film is requested, so on a
     * slow connection the content (not the decorative film) gets the
     * bandwidth first; the film starts after at most this long regardless (ms).
     */
    contentFirstMaxMs: 4000,
  },
  film: {
    /**
     * Arriving on the homepage, the film fades in over the near-black ground
     * over this long (ms); leaving it, the film fades out quicker
     * (`fadeOutMs`), so the next page's content is not seen over the film for
     * long. While a project opens from the carousel, at the transition's
     * quicker pace (stage.css `data-hurry`).
     */
    fadeMs: 550,
    fadeOutMs: 260,
    /** The film's veil darkens slightly as the page scrolls this share of the window height (the projects entering). */
    enterShare: 0.85,
  },
} as const

/** The background treatment per route (stage.css `data-route`). */
export type StageRoute = 'home' | 'case' | 'about' | 'other'

/** The background treatment for a professional-site pathname (stage.css `data-route`). */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

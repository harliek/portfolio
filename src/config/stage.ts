/**
 * The persistent background set (StageBackground, mounted once in PageShell):
 * the film on the homepage, the architectural room on every other page.
 * CSS-side values (the film's overlay, the room's shade per route, reading
 * gradients, the floor-line band) live in src/styles/stage.css as custom
 * properties.
 */
export const STAGE = {
  background: {
    /** Choose the portrait video file below this width (one file per device, chosen once). */
    mobileBelow: 600,
    /** The video fades in over the poster once frames are actually playing (ms). */
    fadeInMs: 800,
    /**
     * The page's visible images load before the video is requested, so on a
     * slow connection the content (not the decorative set) gets the bandwidth
     * first; the video starts after at most this long regardless (ms).
     */
    contentFirstMaxMs: 4000,
    /** The room's playback speed per route: About is calmer. The same element plays on every interior route (it never restarts). */
    rate: { home: 1, case: 1, about: 0.6, other: 0.8 },
  },
  film: {
    /**
     * The film (homepage) and the room (every other page) cross-fade over
     * this long when the route changes (ms); while a project opens from the
     * carousel, at the transition's quicker pace (stage.css `data-hurry`).
     */
    fadeMs: 550,
    /** The film's veil darkens slightly as the page scrolls this share of the window height (the projects entering). */
    enterShare: 0.85,
  },
} as const

export type StageRoute = keyof typeof STAGE.background.rate

/** The background treatment for a professional-site pathname (stage.css `data-route`). */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

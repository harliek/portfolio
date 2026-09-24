/**
 * The persistent background set (StageBackground, mounted once in PageShell).
 * CSS-side values (shade per route, reading gradients, the floor-line band)
 * live in src/styles/stage.css as custom properties.
 */
export const STAGE = {
  background: {
    /** Choose the portrait video file below this width (one file per device, chosen once). */
    mobileBelow: 600,
    /** The video fades in over the poster once frames are actually playing (ms). */
    fadeInMs: 800,
    /** Playback speed per route: About is calmer. The same element plays on every route (it never restarts). */
    rate: { home: 1, case: 1, about: 0.6, other: 0.8 },
  },
} as const

export type StageRoute = keyof typeof STAGE.background.rate

/** The background treatment for a professional-site pathname (stage.css `data-route`). */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

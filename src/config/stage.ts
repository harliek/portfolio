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
    /** Playback speed per route: About is calmer. */
    rate: { home: 1, case: 1, about: 0.6, other: 0.8 },
  },
  /**
   * Homepage reading treatment (`--read` 0 → 1): starts once the visitor
   * has scrolled `start` viewport heights and is complete `span` viewport
   * heights later, by the time About fills the screen.
   */
  homeReading: { start: 0.12, span: 0.5 },
} as const

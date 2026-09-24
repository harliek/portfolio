/**
 * The persistent background set (StageBackground, mounted once in PageShell).
 * CSS-side values (shade per route, reading scrims) live in
 * src/styles/stage.css as custom properties.
 */
export const STAGE = {
  background: {
    /** Choose the portrait video file below this width (one file per device, chosen once). */
    mobileBelow: 600,
    /** The video fades in over the poster once frames are actually playing (ms). */
    fadeInMs: 800,
    /** Playback speed per route: About, Art and Film are calmer. */
    rate: { home: 1, case: 1, about: 0.6, creative: 0.6, other: 0.8 },
  },
} as const

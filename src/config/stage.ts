/**
 * The persistent background set (StageBackground, mounted once in PageShell):
 * the room (a dark architectural corridor, brief v15) on the homepage, a
 * quiet near-black ground on every other page (case studies, About, the
 * not-found page; no video, walls, floor or reflection line). CSS-side
 * values (the room's shade, the ground's faint tone) live in
 * src/styles/stage.css; the media in STAGE_MEDIA.room (src/content/media.ts).
 */
export const STAGE = {
  background: {
    /** Portrait windows narrower than this take the room's portrait crop (the full frame otherwise). */
    portraitBelow: 600,
    /** The room fades in over its poster once frames are actually playing (ms; the same picture, so it cannot be seen). */
    fadeInMs: 800,
    /**
     * The page's visible images load before the room is requested, so on a
     * slow connection the content (not the decorative video) gets the
     * bandwidth first; the video starts after at most this long regardless (ms).
     */
    contentFirstMaxMs: 4000,
  },
  room: {
    /**
     * Arriving on the homepage, the room fades in over the near-black ground
     * over this long (ms); leaving it, the room fades out quicker
     * (`fadeOutMs`), so the next page's content is not seen over the room for
     * long. While a project opens from the carousel, at the transition's
     * quicker pace (stage.css `data-hurry`).
     */
    fadeMs: 550,
    fadeOutMs: 260,
  },
} as const

/** The background treatment per route (stage.css `data-route`). */
export type StageRoute = 'home' | 'case' | 'about' | 'other'

/** The background treatment for a professional-site pathname (stage.css `data-route`). */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

import type { OpeningImage } from '../content/projects'

/**
 * What a destination that is not a case study shows first beside its
 * heading, fetched and decoded while the old page stays. Case studies declare
 * theirs in src/content/projects.ts (`hero`, the page's real opening media
 * with the `sizes` its component passes); an entry here overrides that.
 */
const OPENING_MEDIA: Record<string, readonly OpeningImage[]> = {
  // About (warmed from its homepage tile): only its code, none of its images.
  '/about': [],
}

/**
 * Before a page change (src/components/transition/pageChange.ts) starts, the
 * page being left stays live while the destination's code loads and its
 * opening media decode (usually done already on hover or focus: warm.ts).
 * These cap that wait; the change itself has its own timing in pageChange.ts.
 */
export const TRANSITION = {
  /** Longest wait for the destination's opening media (decoded) before changing anyway. */
  mediaWaitMs: 400,
  /** Longest wait for the route's code before an ordinary navigation (react-router still keeps the old page until it arrives). */
  chunkWaitMs: 8000,
  /** A wait longer than this (a slow connection) shows a thin line in the destination's accent across the top. */
  progressDelayMs: 320,
  /** Opening media of destinations other than case studies (OPENING_MEDIA above). */
  openingMedia: OPENING_MEDIA,
} as const

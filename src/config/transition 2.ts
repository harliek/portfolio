import type { ObjectKind } from '../content/carousel'

/**
 * The project route transition (src/components/transition/projectTransition.ts,
 * brief-v8 section 6): no empty interval.
 *
 * 1. Wait: the page being left stays as it is until the destination's code
 *    has loaded and its cover object and opening image have decoded (usually
 *    done on hover or focus already). Caps: `mediaWaitMs` for the images,
 *    `chunkWaitMs` for the code (then an ordinary navigation).
 * 2. Change, one view transition: the old page fades out while the new page
 *    (heading and opening media included) fades in over `pageMs`,
 *    complementary and blended additively, so the room behind never dims.
 * 3. Meanwhile the clicked PNG moves into the destination's cover slot over
 *    `coverMs` with a uniform scale (never stretched or flipped). The page
 *    never waits for it.
 *
 * Click to settled is the wait (normally a frame or two) + max(pageMs,
 * coverMs) ≈ 420ms. `hardCapMs` ends any animation.
 */
export const TRANSITION = {
  /** The cross-fade of the whole page (old out, new in, same curve). */
  pageMs: 380,
  /** The PNG's move into its slot. */
  coverMs: 420,
  pageEase: 'cubic-bezier(0.33, 0, 0.25, 1)',
  /** Quick to leave, gentle on arrival. */
  coverEase: 'cubic-bezier(0.3, 0.1, 0.15, 1)',
  /** Longest wait for the destination's cover file and opening image (decoded) before changing anyway. */
  mediaWaitMs: 1200,
  /** Longest wait for the route's code before an ordinary navigation (react-router still keeps the old page until it arrives). */
  chunkWaitMs: 8000,
  /** Inside the change (the browser holds the picture of the old page meanwhile): longest wait for React to render the new route. */
  renderWaitMs: 1000,
  /** Inside the change: longest wait for the slot image to decode. */
  slotDecodeMs: 250,
  /** Inside the change: longest wait for the new page's opening media (its image, or a video's poster or first frame). */
  openingMediaWaitMs: 1200,
  /** A slot less visible than this share cannot receive the move (the copy fades with the old page instead). */
  minSlotVisible: 0.35,
  /** Absolute end of the animated part, from its start. */
  hardCapMs: 2400,
  /**
   * Warming fetches the file each destination's cover slot will show, so the
   * browser picks the same srcset candidate: About passes its own `sizes`;
   * case studies size the cover by its height per object (keep in step with
   * CaseScroll's COVER_HEIGHT; a mismatch only costs a fetch at the click).
   */
  slotSizes: { '/about': '(min-width: 720px) 340px, 232px' } as Record<string, string>,
  caseCoverHeights: { monitor: 232, laptop: 232, mug: 236, tablet: 272, camera: 228, phone: 292, headshot: 280 } as Record<ObjectKind, number>,
} as const

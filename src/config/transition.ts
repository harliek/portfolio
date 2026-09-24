import type { ObjectKind } from '../content/carousel'
import type { OpeningImage } from '../content/projects'
import { MOTION } from './motion'

/**
 * What a destination that is not a case study shows first beside its
 * heading, fetched and decoded with its cover object while the old page
 * stays. Case studies declare theirs in src/content/projects.ts (`hero`, the
 * page's real opening media with the `sizes` its component passes); an entry
 * here overrides that.
 */
const OPENING_MEDIA: Record<string, readonly OpeningImage[]> = {
  // About opens with the portrait (its cover slot) beside the introduction.
  '/about': [],
}

/**
 * The project route transition (src/components/transition/projectTransition.ts):
 * "move closer" (spec/motion-plan.md P3), with no empty interval.
 *
 * 1. Wait: the page being left stays as it is (live) until the destination's
 *    code has loaded and its cover object and opening media have decoded
 *    (usually done on hover or focus already). Caps: `mediaWaitMs` for the
 *    images, `chunkWaitMs` for the code (then an ordinary navigation). A wait
 *    past `progressDelayMs` shows a thin accent line at the top.
 * 2. Change, one view transition, all on the motion system's move step
 *    (MOTION.t.move, 420ms) with the arrive curve (front-loaded, no
 *    overshoot):
 *    - the chosen PNG advances into the destination's cover slot (`coverMs`),
 *      with a uniform scale, never stretched or flipped;
 *    - the rest of the scene steps back: every other PNG object of the page
 *      being left (the other gallery objects, the portrait anchor) shrinks
 *      towards its floor, rises a little towards the horizon and dims away
 *      (`stepBack`);
 *    - the page being left fades out while the new page (its heading and
 *      opening media included, live) fades in (`pageMs`), complementary and
 *      blended additively, so the room behind (the same video) never dims.
 *    The browser holds the picture of the old page while the new route renders
 *    and its slot and opening media are checked (capped by `renderWaitMs`,
 *    `slotDecodeMs`, `openingMediaWaitMs`; normally a few milliseconds).
 *
 * Click to settled is the wait (normally a frame or two) + 420ms. `hardCapMs`
 * ends any change.
 */
export const TRANSITION = {
  /** The cross-fade of the whole page (old out, new in, the same curve, so the two always sum to one scene). */
  pageMs: MOTION.t.move,
  pageEase: MOTION.ease.arrive,
  /** The chosen PNG's move into its slot. */
  coverMs: MOTION.t.move,
  coverEase: MOTION.ease.arrive,
  /**
   * The rest of the scene steps back while the chosen object advances.
   * - Each other PNG object shrinks to `scale` about its floor point, rises
   *   by `rise` (a share of its own height: towards the horizon, as the
   *   gallery places farther objects higher) and moves `converge` of its
   *   distance towards the chosen object (receding in perspective) over `ms`
   *   on the arrive curve, while it dims away over `fadeMs` on the exchange
   *   curve (it stays visible while the recession shows; the arriving page
   *   covers it, since it recedes behind that page). At
   *   most `max` objects, the ones in view (transition.css has one rule per
   *   name, `hk-back-0` to `hk-back-9`).
   * - The rest of the page's content (title, labels, text) eases back to
   *   `sceneScale` about the chosen object and clears over `sceneMs`, a
   *   little sooner than the new page arrives, so old and new headings barely
   *   overlap. The room is not part of it: it stays whole.
   */
  stepBack: {
    enabled: true,
    scale: 0.72,
    rise: 0.07,
    converge: 0.1,
    ms: MOTION.t.move,
    moveEase: MOTION.ease.arrive,
    fadeMs: 360,
    fadeEase: MOTION.ease.exchange,
    sceneScale: 0.985,
    sceneMs: 360,
    sceneEase: MOTION.ease.arrive,
    max: 10,
  },
  /** Longest wait for the destination's cover file and opening media (decoded) before changing anyway. */
  mediaWaitMs: 1600,
  /** Longest wait for the route's code before an ordinary navigation (react-router still keeps the old page until it arrives). */
  chunkWaitMs: 8000,
  /** Inside the change (the browser holds the picture of the old page meanwhile): longest wait for React to render the new route. */
  renderWaitMs: 1000,
  /** Inside the change: longest wait for the slot image to decode. */
  slotDecodeMs: 250,
  /**
   * Inside the change: longest wait for the new page's opening media (its
   * image, or a video's poster or first frame). The display is held still
   * meanwhile (the background video included), so this stays short: the
   * waiting belongs before the change, while the old page is live.
   */
  openingMediaWaitMs: 450,
  /**
   * A wait longer than this (a slow connection) shows a thin line in the
   * destination's accent across the top of the viewport, so the click is
   * visibly under way while the old page stays. It leaves with the old page.
   */
  progressDelayMs: 320,
  /** Longest time that line stays after an ordinary navigation takes over (the route's code still loading). */
  progressHoldMs: 15000,
  /** A slot less visible than this share cannot receive the move (the copy fades with the old page instead). */
  minSlotVisible: 0.35,
  /** Absolute end of a change, from its start (the capped waits above plus the animation fit well inside it). */
  hardCapMs: 3200,
  /**
   * Warming fetches the file each destination's cover slot will show, so the
   * browser picks the same srcset candidate: About passes its own `sizes`;
   * case studies size the cover by its height per object (keep in step with
   * CaseScroll's COVER_HEIGHT; a mismatch only costs a fetch at the click).
   */
  slotSizes: { '/about': '(min-width: 720px) 340px, 232px' } as Record<string, string>,
  /** Opening media of destinations other than case studies (OPENING_MEDIA above). */
  openingMedia: OPENING_MEDIA,
  caseCoverHeights: { monitor: 232, laptop: 232, mug: 236, tablet: 272, camera: 228, phone: 292, headshot: 280 } as Record<ObjectKind, number>,
} as const

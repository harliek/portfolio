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
 * "move closer" (spec/motion-plan.md P3), with no empty interval and no
 * double exposure (brief v13, plan v12 item 14): the page being left and the
 * new page are never seen at partial opacity over each other.
 *
 * 1. Wait: the page being left stays as it is (live) until the destination's
 *    code has loaded and its cover object and opening media have decoded
 *    (usually done on hover or focus already). Caps: `mediaWaitMs` for the
 *    images, `chunkWaitMs` for the code (then an ordinary navigation). A wait
 *    past `progressDelayMs` shows a thin accent line at the top.
 * 2. Change, one view transition of `pageMs` (MOTION.t.move, 420ms) in two
 *    parts that follow each other:
 *    - out (`outMs`): the page being left clears. Its content eases back a
 *      little about the chosen object and fades; every other PNG object of
 *      it shrinks towards its floor, rises a little towards the horizon and
 *      fades (`stepBack`); its picture of the room fades to the live new
 *      room already beneath it (the same background set, now showing the
 *      destination's treatment), so the room never dims to black;
 *    - in (the rest, `pageMs - outMs`): the new page (its heading and opening
 *      media included, live) fades in, rising `inRisePx`, on the arrive curve.
 *    Across both, the chosen PNG advances into the destination's cover slot
 *    (`coverMs`, arrive curve, front-loaded, no overshoot) with a uniform
 *    scale, never stretched or flipped, so a frame is never empty. The header
 *    is the same on both pages; what differs in it changes in the out part.
 *    The browser holds the picture of the old page while the new route renders
 *    and its slot and opening media are checked (capped by `renderWaitMs`,
 *    `slotDecodeMs`, `openingMediaWaitMs`; normally a few milliseconds).
 *
 * Click to settled is the wait (normally a frame or two) + 420ms. `hardCapMs`
 * ends any change. Reduced motion: an ordinary navigation, no animation.
 */
export const TRANSITION = {
  /** The whole change: the old page's `outMs`, then the new page's arrival over the remainder. */
  pageMs: MOTION.t.move,
  /** The root pictures' group (the viewport, which does not move) runs over the whole change on this curve. */
  pageEase: MOTION.ease.arrive,
  /**
   * The page being left clears in this first part (its content, the other
   * objects and its picture of the room, all together); the new page only
   * starts once it has gone.
   */
  outMs: 170,
  /**
   * Ease-in: the old page stays clearly visible while it steps back and clears
   * at the very end, just as the new one begins (on the front-loaded arrive
   * curve), so there is at most a frame with neither (a text link has no
   * moving object to carry that moment).
   */
  outEase: 'cubic-bezier(0.42, 0, 1, 1)',
  /** The new page arrives over the rest of the change (pageMs - outMs) on this curve, rising this far. */
  inEase: MOTION.ease.arrive,
  inRisePx: 6,
  /** The chosen PNG's move into its slot (across both parts). */
  coverMs: MOTION.t.move,
  coverEase: MOTION.ease.arrive,
  /**
   * The rest of the scene steps back during the out part while the chosen
   * object advances.
   * - Each other PNG object shrinks to `scale` about its floor point, rises
   *   by `rise` (a share of its own height: towards the horizon, as the
   *   gallery places farther objects higher) and moves `converge` of its
   *   distance towards the chosen object (receding in perspective) on
   *   `moveEase`, while it fades. At most `max` objects, the ones in view
   *   (transition.css has one rule per name, `hk-back-0` to `hk-back-9`).
   *   Off (`enabled: false`), they simply clear with the page's content.
   * - The rest of the page's content (title, labels, text) eases back to
   *   `sceneScale` about the chosen object as it clears. The room is not part
   *   of it.
   */
  stepBack: {
    enabled: true,
    scale: 0.72,
    rise: 0.07,
    converge: 0.1,
    moveEase: MOTION.ease.arrive,
    sceneScale: 0.985,
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
  slotSizes: { '/about': '(min-width: 960px) 300px, (min-width: 720px) 260px, 240px' } as Record<string, string>,
  /** Opening media of destinations other than case studies (OPENING_MEDIA above). */
  openingMedia: OPENING_MEDIA,
  caseCoverHeights: { monitor: 232, laptop: 232, mug: 236, tablet: 272, camera: 228, phone: 292, headshot: 280 } as Record<ObjectKind, number>,
} as const

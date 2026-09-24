import type { ObjectKind } from '../content/carousel'
import type { ImageId } from '../content/media'

/** The `sizes` of the case studies' media stage (CaseScroll STAGE_SIZES, ConversationStage SIZES). */
const STAGE_SIZES = '(min-width: 1368px) 645px, (min-width: 960px) 47vw, calc(100vw - 40px)'

/** PhoneGroup's PHONE_SIZES (Jumpstart Finance). */
const PHONE_SIZES = '(min-width: 1368px) 240px, (min-width: 960px) 18vw, 37vw'

/**
 * What each destination shows first beside its heading (the image, or the
 * video poster, that fills its opening media stage), fetched and decoded
 * with the cover while the old page stays, so the page and its media
 * arrive together. Keep in step with the pages and the `sizes` their
 * components pass (a mismatch only costs a short wait inside the change,
 * capped by openingMediaWaitMs; in development the transition log records
 * "opening not warmed"). Routes not listed fall back to projects.ts `hero`.
 */
const OPENING_MEDIA: Record<string, readonly { image: ImageId; sizes: string }[]> = {
  '/work/merchandising-platform': [{ image: 'merch-replenish', sizes: STAGE_SIZES }],
  '/work/cafepress-uk': [{ image: 'cp-header-brand', sizes: STAGE_SIZES }],
  '/work/spreadsheet-agent': [{ image: 'spreadsheet-agent-poster', sizes: STAGE_SIZES }],
  '/work/valiance': [{ image: 'ala-conversation', sizes: STAGE_SIZES }],
  // FilmScroll POSTER_SIZES: the first film's poster.
  '/work/creative-production': [{ image: 'nickleby-poster', sizes: '(min-width: 960px) 620px, calc(100vw - 32px)' }],
  // PhoneGroup PHONE_SIZES: the three original prototype screens.
  '/work/jumpstart': [
    { image: 'jf-screen-lessons', sizes: PHONE_SIZES },
    { image: 'jf-screen-progress', sizes: PHONE_SIZES },
    { image: 'jf-screen-community', sizes: PHONE_SIZES },
  ],
  // About opens with the portrait (its cover slot) beside the introduction.
  '/about': [],
}

/**
 * The project route transition (src/components/transition/projectTransition.ts,
 * brief-v8 section 6): no empty interval.
 *
 * 1. Wait: the page being left stays as it is (live) until the destination's
 *    code has loaded and its cover object and opening media (`openingMedia`)
 *    have decoded (usually done on hover or focus already). Caps:
 *    `mediaWaitMs` for the images, `chunkWaitMs` for the code (then an
 *    ordinary navigation). A wait past `progressDelayMs` shows a thin accent
 *    line at the top.
 * 2. Change, one view transition. The browser holds a picture of the old page
 *    while the new route renders and its slot and opening media are checked
 *    (capped by `renderWaitMs`, `slotDecodeMs`, `openingMediaWaitMs`; normally
 *    a few milliseconds). Then the old page fades out while the new page
 *    (heading and opening media included) fades in over `pageMs`,
 *    complementary and blended additively, so the room behind never dims.
 * 3. Meanwhile the clicked PNG moves into the destination's cover slot over
 *    `coverMs` with a uniform scale (never stretched or flipped). The page
 *    never waits for it.
 *
 * Click to settled is the wait (normally a frame or two) + max(pageMs,
 * coverMs) ≈ 420ms. `hardCapMs` ends any change.
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
  /**
   * What each destination shows first beside its heading, warmed with the
   * cover while the old page stays (OPENING_MEDIA above).
   */
  openingMedia: OPENING_MEDIA,
  caseCoverHeights: { monitor: 232, laptop: 232, mug: 236, tablet: 272, camera: 228, phone: 292, headshot: 280 } as Record<ObjectKind, number>,
} as const

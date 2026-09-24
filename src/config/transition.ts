/**
 * The project route transition (src/components/transition/projectTransition.ts):
 * the same PNG object moves from where it was clicked (a carousel object or
 * a next-project thumbnail, `[data-cover-source]`) into its reserved place
 * on the destination page (`[data-cover-slot]`, CoverSlot.tsx).
 *
 * 1. Forward (`forwardMs`): a copy of the clicked image takes its place and
 *    comes a little forward (`forwardScale`, `forwardLift`) while the page
 *    being left fades out (`pageFadeMs`). The carousel is frozen by its caller.
 * 2. The route changes once the route's code has loaded and the slot's
 *    image file has decoded (never later than `navigateCapMs` after the
 *    click; a failed chunk still navigates).
 * 3. Move (`moveMs`): the copy travels in a straight line to the slot,
 *    scaling uniformly (never stretched or flipped). The destination's slot
 *    image and every `[data-cover-reveal]` element stay hidden meanwhile, so
 *    the copy never crosses visible text.
 * 4. Reveal (`revealMs`): the heading, introduction and media fade in
 *    around the landed image; then the slot image replaces the copy in the
 *    same frame and nothing added by the transition remains.
 *
 * Click to landing is forwardMs + route render (usually one or two frames)
 * + moveMs ≈ 450ms. Every wait has a cap; `hardCapMs` ends everything.
 */
export const TRANSITION = {
  forwardMs: 110,
  forwardScale: 1.04,
  /** Upward shift while coming forward (px). */
  forwardLift: 6,
  /** The page being left fades out over this long (it is gone before the move begins). */
  pageFadeMs: 130,
  moveMs: 330,
  revealMs: 210,
  /** Rise of the revealed text and media (px). */
  revealRise: 6,
  /** Longest wait for the route's code before navigating anyway (from the click). */
  navigateCapMs: 650,
  /** Longest wait for the destination's slot after the route change. */
  slotWaitMs: 900,
  /** Once the new page is on screen without the slot, it gets this long to appear before the copy fades away. */
  slotGraceMs: 240,
  /** Longest time the landed copy stands in for a slot image that has not decoded yet. */
  slotImageWaitMs: 700,
  /** A slot less visible than this share of its height cannot receive the move (the copy fades out instead). */
  minSlotVisible: 0.5,
  /** Fade of the copy when the move cannot complete (slot missing or off screen, failed page). */
  abortFadeMs: 160,
  /** Absolute end of any transition after the click: everything is restored. */
  hardCapMs: 2600,
  /** Reveal of the new page when there is no image to move (a text link). */
  plainRevealMs: 240,
  forwardEase: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
  moveEase: 'cubic-bezier(0.45, 0, 0.2, 1)',
  revealEase: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  /**
   * The `sizes` each destination's CoverSlot uses, so warming fetches the
   * same file the slot will show (keep in step with the pages: About passes
   * its own `sizes`; case studies use the slot width at `defaultSlotScale`).
   */
  slotSizes: { '/about': '(min-width: 720px) 340px, 232px' } as Record<string, string>,
  defaultSlotScale: 0.72,
} as const

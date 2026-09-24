/**
 * The project route transition (carousel tile → case study).
 *
 * 1. The carousel freezes; the chosen tile comes a little forward and fades
 *    (`leaveMs`, `leaveScale`, `leaveLift`); the other tiles dim. No turn or
 *    flip: the portrait artwork is never stretched towards a landscape image.
 * 2. The route changes once that has finished and the route's code has
 *    loaded (never later than `navigateCapMs` after the click).
 * 3. The destination's opening frame ([data-case-hero]) stays hidden until
 *    its image has decoded (at most `heroWaitMs`), then appears in place
 *    (`revealMs`, opacity and a 1.5% scale). Nothing is laid over the new page.
 *
 * Next-project links (no tile) use step 3 alone with `plainRevealMs`.
 */
export const TRANSITION = {
  leaveMs: 230,
  leaveScale: 1.06,
  leaveLift: 10,
  navigateCapMs: 700,
  heroWaitMs: 600,
  /** Longest wait for the destination's opening frame to exist before giving up quietly. */
  heroFindMs: 1500,
  revealMs: 240,
  revealScale: 0.985,
  plainRevealMs: 300,
  ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
} as const

/**
 * What the pointer is over, as far as its light is concerned (Harlie's brief, 2026-09-28: "Keep decorative lighting
 * underneath functional UI ... text readable, input boundaries visible, button states clear ... brightest parts not
 * directly over important copy"). One definition for every layer of the pointer's light, so they agree:
 *
 * - `field`: a text field or other form control, where someone types or chooses.
 * - `control`: a link, a button, a video or an embedded player (their own hover states lead).
 * - `form`: anywhere else inside a form (its labels and the gaps between its fields).
 * - `text`: reading copy and its headings (not the display titles, h1, whose letters are far larger than the light;
 *   the trail passes beneath them anyway).
 *
 * CustomCursor writes the answer on the root (html[data-pointer-over]); the ball of light, the soft light and the
 * case studies' ground step back by it (cursor.css, stage.css), and the trail dims by it (PointerTrail). Nothing is
 * weakened elsewhere on the page: only while the pointer is over one of these, and only the light near it.
 */
export type PointerOver = 'field' | 'control' | 'form' | 'text'

const FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
/** Creative Production's film frames (.cw-frame) open their film on a click (2026-09-28), so they are controls too. */
const CONTROL = 'a[href], button, [role="button"], .button, summary, label[for], video, iframe, .plane, .cw-frame'
const TEXT = 'p, li, h2, h3, h4, dt, dd, figcaption, blockquote, label'

/** The pointer's context for the element under it (the first match wins: field, control, form, text), or null. */
export function pointerOver(el: Element | null): PointerOver | null {
  if (!el) return null
  if (el.closest(FIELD)) return 'field'
  if (el.closest(CONTROL)) return 'control'
  if (el.closest('form')) return 'form'
  if (el.closest(TEXT)) return 'text'
  return null
}

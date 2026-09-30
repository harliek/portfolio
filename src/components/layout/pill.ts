/**
 * The floating pill's width as its contents need it (px; Harlie's request: the pill hugs its contents, no big gap):
 * the left group (Back and HOME), a 40px gap, the navigation or the Menu button, and the pill's 8px padding a side
 * (layout.css). Header.tsx sets it on the header as --pill-w. CaseStory derives it the same way (2026-09-30), since it
 * measures a page before the header has measured itself: on a first load, and as a page change adds Back to the pill.
 * Null while the header's contents are not there.
 */
export function pillWidth(header: HTMLElement): number | null {
  const start = header.querySelector<HTMLElement>('.site-header__start')
  const end = header.querySelector<HTMLElement>('.site-nav, .menu-button')
  if (!start || !end) return null
  return Math.ceil(start.scrollWidth + end.scrollWidth + 40 + 16)
}

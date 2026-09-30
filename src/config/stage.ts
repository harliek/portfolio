/**
 * The background treatment per route. PageShell picks the page's ground by it;
 * the header carries it as `data-route` for its styles on the case studies
 * (layout.css).
 */
export type StageRoute = 'home' | 'case' | 'about' | 'other'

/** The background treatment for a professional-site pathname. */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

/**
 * Where a case study's header bar is black (layout.css), as a media query: below 900px, and in any window at most 540px
 * tall (a phone on its side). Elsewhere the header floats as the translucent pill over the page. CaseStory reads the bar
 * as opaque by it (the words' top fade starts under it), rather than from the bar's colour, which eases in over a page
 * change while the new page is first measured. The told case studies kept the black bar up to 1199px for a few hours on
 * 2026-09-30; it went with the words' fading window (Harlie's request, 2026-09-30), whose top fade now takes the lines
 * passing under the pill there. Keep it in step with layout.css (and transition/pieces.ts NARROW).
 */
export const CASE_BAR = '(max-width: 899.98px), (max-height: 540.98px)'

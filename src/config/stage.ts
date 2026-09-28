/**
 * The background treatment per route. PageShell picks the page's ground by it
 * (and passes it to StageBackground); the header carries it as `data-route`
 * for its styles on the case studies (layout.css).
 */
export type StageRoute = 'home' | 'case' | 'about' | 'other'

/** The background treatment for a professional-site pathname. */
export const stageRouteFor = (pathname: string): StageRoute =>
  pathname === '/' ? 'home' : pathname.startsWith('/work/') ? 'case' : pathname === '/about' ? 'about' : 'other'

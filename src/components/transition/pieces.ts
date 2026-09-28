/**
 * The separate pieces a page is made of, for the page change (pageChange.ts): the pieces that come apart, travel and
 * rearrange into the next page (Harlie's request: "make the page deconstruct and build itself like all the separate
 * components").
 */

/**
 * Every page's pieces, in whatever combination the page has: the homepage's name, PORTFOLIO, tagline and each tile's
 * picture and caption; a case study's title, details, introduction, each step and its held picture; Creative
 * Production's films and their words; About's label, name, descriptor, paragraphs, portrait, education and creative
 * cards; and the footer's row (it stays mounted from page to page, but its pieces still leave and arrive).
 */
const PIECES = [
  '.home .hero__name',
  '.home .hero__word',
  '.home .hero__line',
  '.home .plane__frame',
  '.home .plane__caption',
  'main .cx-title',
  'main .cx-meta',
  'main .cx-lede',
  'main .story__step',
  'main .story__stage',
  'main .cw-frame',
  'main .cw-text',
  'main .about-label',
  'main .about-name',
  'main .about-descriptor',
  'main .about-hero__copy > *',
  'main .about-portrait',
  'main .about-section-label',
  'main .about-school',
  'main .about-school__text',
  'main .about-work',
  // The contact form's rows (Harlie's brief, 2026-09-28: About's end left for the homepage showed the form's field
  // outlines and Send Message through the arriving film, as part of the page's background picture).
  'main .about-contact__row',
  'main .about-contact__form > .about-contact__field',
  'main .about-contact__foot',
  'main h1:not(.hero__title)',
  '.site-end__inner > *',
].join(', ')

/**
 * A page's main picture: a case study's held picture, About's portrait, and on Creative Production the film most in
 * view (not the first in the page: from its end, the first film is far above the window and no picture was carried).
 */
const PAGE_HERO = 'main .story__stage, main .cw-frame, main .about-portrait'

/** The pieces that are pictures (the rest are words): they keep their long sweep between pages on a phone. */
export const PICTURES = '.story__stage, .cw-frame, .about-portrait, .about-work, .plane__frame'

/** A page's title: the homepage's PORTFOLIO, or the page's heading. */
const TITLE = '.home .hero__word, main h1:not(.hero__title)'

/** At most this many pieces a side (with the header, the pointer and the backgrounds, about 40 moving layers). */
const MOST = 16

export type Role = 'hero' | 'title' | 'piece'

export interface Piece {
  el: HTMLElement
  rect: DOMRect
  role: Role
  /** Centre, in viewport px. */
  x: number
  y: number
}

const centre = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/**
 * The share of an element's box that can be seen: inside the viewport and below `top` (0 when it is out of view).
 * `top` is where the page can be seen from (an opaque band over the top of the window on phones, coverOf).
 */
function inView(rect: DOMRect, top = 0) {
  const w = Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left)
  const h = Math.min(window.innerHeight, rect.bottom) - Math.max(top, rect.top)
  if (w <= 0 || h <= 0 || !rect.width || !rect.height) return 0
  return (w * h) / (rect.width * rect.height)
}

/** The height of an element's box that can be seen (as inView). */
const seenHeight = (rect: DOMRect, top = 0) => Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(top, rect.top))

/**
 * Narrow or short windows, as the case studies' held band and the header's black bar are laid out (case-v16.css,
 * layout.css: the bar also shows in any window at most 540px tall).
 */
export const NARROW = '(max-width: 899.98px), (max-height: 540.98px)'

/**
 * What covers the top of the window, opaque, on a phone (Harlie's brief, 2026-09-28: steps scrolled under the held band
 * popped out above it and around its moving picture as a page was left): the header's black bar on the case studies,
 * and under it a case study's held band (.cs__media, sticky, black) once it is held. `bottom` is where the page can be
 * seen from (0 when nothing covers it); `band` is the held band, pictured as a layer of its own over the pieces that
 * pass under it (pageChange.ts).
 */
export function coverOf(): { band: HTMLElement | null; bottom: number } {
  if (!window.matchMedia(NARROW).matches) return { band: null, bottom: 0 }
  const header = document.querySelector<HTMLElement>(".site-header[data-route='case']")
  let bottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0
  // Only the phones' band is held (sticky); beside the words (a phone on its side) the column is not a band.
  const band = document.querySelector<HTMLElement>('main .cs__media')
  const rect = band && getComputedStyle(band).position === 'sticky' ? band.getBoundingClientRect() : undefined
  const held = band && rect && rect.height > 0 && rect.top <= bottom + 1 && rect.bottom > bottom
  if (held) bottom = rect.bottom
  return { band: held ? band : null, bottom }
}

/** Below this seen height (px) a piece at the window's edge (or all but hidden under the band) is only a sliver. */
const SLIVER = 16

/**
 * The page's pieces that show only as a sliver (at most SLIVER px seen, at the window's edge or under the band): they
 * are hidden while the page being left is pictured, so they are neither left standing in its background picture while
 * everything else moves (Harlie's brief, 2026-09-28: the bottom edge of a "Watch the film" pill at the top of the
 * window, the edges of the homepage's tiles in its corners) nor carried whole as a piece. pageChange.ts shows them again.
 */
export function sliversInView(): HTMLElement[] {
  const { bottom } = coverOf()
  // The outermost pieces only (one inside another goes as its outer piece does).
  return [...document.querySelectorAll<HTMLElement>(PIECES)].filter((el) => !el.parentElement?.closest(PIECES) && sliver(el.getBoundingClientRect(), topOf(el, bottom)) && getComputedStyle(el).visibility !== 'hidden')
}

/** Where an element can be seen from: below the cover, except the band's own contents. */
const topOf = (el: HTMLElement, cover: number) => (cover && !el.closest('.cs__media') ? cover : 0)

/** Seen at all (on screen, or under the band), but only as a sliver: cut by the window's edge or by the band. */
function sliver(rect: DOMRect, top: number) {
  const onScreen = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
  const seen = seenHeight(rect, top)
  return onScreen && rect.width > 0 && seen <= SLIVER && seen < rect.height - 1
}

/** The homepage tile whose link goes to `path`, when one is in view. */
export function tileFor(path: string | null): HTMLElement | null {
  if (!path || !document.querySelector('.home')) return null
  const plane = [...document.querySelectorAll<HTMLAnchorElement>('.home .plane')].find((a) => a.pathname === path && inView(a.getBoundingClientRect()) > 0.35)
  return plane?.querySelector<HTMLElement>('.plane__frame') ?? null
}

/**
 * The page's pieces in view, measured once: only the outermost of nested pieces (a piece inside another travels with
 * it), not those still waiting to rise in by themselves as they enter the view (data-reveal, no data-in yet), hidden
 * ones or slivers, and at most MOST (the picture and the title first, then the largest), in reading order. On a phone,
 * what is under the header's bar or the held band counts as out of view (coverOf). `hero` names the piece that carries
 * the page's main picture (a homepage tile), when the page's own main picture (the one most in view) is not the one.
 * `leaving`: the page being left, where a piece only partly in view goes as a piece too (thrown out past the edge it
 * stands at): left in the page's picture, it stood still while everything else moved (Harlie's brief, 2026-09-28: the
 * homepage's tile at the bottom corner, for about 250ms). `stay`, when given, collects the boxes of the arriving page's
 * pieces that come with the page's own picture instead (mostly out of view at the window's edge), so the pieces moving
 * in keep clear of them (pageChange.ts).
 */
export function piecesInView(hero?: HTMLElement | null, leaving = false, stay?: DOMRect[]): Piece[] {
  const cover = coverOf().bottom
  const found = [...document.querySelectorAll<HTMLElement>(PIECES)].flatMap((el) => {
    const rect = el.getBoundingClientRect()
    const top = topOf(el, cover)
    // A sliver is hidden while the page is pictured (sliversInView).
    if (sliver(rect, top)) return []
    const share = inView(rect, top)
    if (share <= 0) return []
    // Arriving mostly out of view, it comes with the page (it would travel in as a whole piece). Partly under the held
    // band, it travels under the band's own picture (in the page's picture, the band would uncover it as it went).
    if (!leaving && share < 0.12 && rect.height * share <= 60 && !(top && rect.top < top)) {
      stay?.push(rect)
      return []
    }
    // One still waiting to rise in (no data-in yet) arrives by itself; one that has risen is a piece like any other, so
    // a Creative Production film in view leaves with its words instead of staying behind as the next page builds.
    if (el.matches('[data-reveal]:not([data-in])') || el.closest('[aria-hidden="true"][hidden]')) return []
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.opacity === '0') return []
    return [{ el, rect, role: 'piece' as Role, ...centre(rect) }]
  })
  const outer = found.filter((p) => !found.some((q) => q.el !== p.el && q.el.contains(p.el)))
  // The page's main picture is the one most in view (Creative Production has one for each film).
  const seen = (p: Piece) => p.rect.width * p.rect.height * inView(p.rect)
  const own = document.querySelector('.home') ? [] : outer.filter((p) => p.el.matches(PAGE_HERO) && seen(p) > 0)
  const main = hero ?? own.sort((a, b) => seen(b) - seen(a))[0]?.el ?? null
  const title = document.querySelector<HTMLElement>(TITLE)
  for (const p of outer) {
    if (main && p.el === main) p.role = 'hero'
    else if (title && (p.el === title || p.el.contains(title))) p.role = 'title'
  }
  const rank = (p: Piece) => (p.role === 'piece' ? 0 : 1e9) + seen(p)
  return outer
    .sort((a, b) => rank(b) - rank(a))
    .slice(0, MOST)
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)
}

/** A unit vector from (fx, fy) to (tx, ty) and the distance; straight up when they coincide. */
export function away(fx: number, fy: number, tx: number, ty: number) {
  const dx = tx - fx
  const dy = ty - fy
  const d = Math.hypot(dx, dy)
  return d < 1 ? { x: 0, y: -1, d: 0 } : { x: dx / d, y: dy / d, d }
}

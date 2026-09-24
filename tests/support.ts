import AxeBuilder from '@axe-core/playwright'
import { test as base, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

/**
 * Shared fixtures and helpers for the end-to-end suite.
 *
 * Every test gets an automatic watch on the page: console errors from the
 * site's own origin, uncaught page errors, and failed same-origin requests
 * (network failures other than deliberate aborts, and HTTP 4xx/5xx) fail
 * the test when it ends. Cross-origin noise (YouTube's player, Google Fonts)
 * is not the site's and is ignored.
 */

export interface Problems {
  console: string[]
  requests: string[]
}

export const test = base.extend<{ problems: Problems }>({
  problems: [
    async ({ page, baseURL }, use) => {
      const origin = new URL(baseURL ?? 'http://localhost:4173').origin
      const problems: Problems = { console: [], requests: [] }
      page.on('console', (m) => {
        if (m.type() !== 'error') return
        const url = m.location()?.url ?? ''
        if (url && !url.startsWith(origin)) return
        problems.console.push(`${m.text()}${url ? ` (${url})` : ''}`)
      })
      page.on('pageerror', (e) => problems.console.push(`Uncaught: ${e.message}`))
      page.on('requestfailed', (r) => {
        if (!r.url().startsWith(origin)) return
        const error = r.failure()?.errorText ?? ''
        // A replaced video source, a navigation away from a loading image: deliberate, not broken.
        if (/ERR_ABORTED|ERR_CACHE_OPERATION_NOT_SUPPORTED/.test(error)) return
        problems.requests.push(`${error} ${r.url()}`)
      })
      page.on('response', (r) => {
        if (r.url().startsWith(origin) && r.status() >= 400) problems.requests.push(`${r.status()} ${r.url()}`)
      })
      await use(problems)
      expect(problems.console, 'console errors on the site').toEqual([])
      expect(problems.requests, 'failed same-origin requests').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/* ------------------------------------------------------------------------ */
/* Routes                                                                    */
/* ------------------------------------------------------------------------ */

export interface RouteSpec {
  path: string
  h1: string | RegExp
  title: string
  /** 'pro': the professional shell (header, background, footer #contact); 'creative': the restored creative layout. */
  shell: 'pro' | 'creative'
}

export const ROUTES: RouteSpec[] = [
  { path: '/', h1: 'Harlie Katz, professional portfolio', title: 'Harlie Katz · Portfolio', shell: 'pro' },
  { path: '/work/cafepress-uk', h1: 'CafePress UK', title: 'CafePress UK · Harlie Katz', shell: 'pro' },
  { path: '/work/merchandising-platform', h1: 'Merchandising Platform', title: 'Merchandising Platform · Harlie Katz', shell: 'pro' },
  { path: '/work/spreadsheet-agent', h1: 'Spreadsheet Agent', title: 'Spreadsheet Agent · Harlie Katz', shell: 'pro' },
  { path: '/work/valiance', h1: 'AI Leasing Agent', title: 'AI Leasing Agent · Harlie Katz', shell: 'pro' },
  { path: '/work/jumpstart', h1: 'Jumpstart Finance', title: 'Jumpstart Finance · Harlie Katz', shell: 'pro' },
  { path: '/work/shift', h1: 'Client Work', title: 'Client Work · Harlie Katz', shell: 'pro' },
  { path: '/about', h1: 'Hi, welcome to my portfolio.', title: 'About · Harlie Katz', shell: 'pro' },
  { path: '/creative', h1: 'Creative', title: 'Creative · Harlie Katz', shell: 'creative' },
  { path: '/creative/art', h1: 'Art', title: 'Art · Harlie Katz', shell: 'creative' },
  { path: '/creative/film', h1: 'Film', title: 'Film · Harlie Katz', shell: 'creative' },
  { path: '/no-such-page', h1: 'Page not found', title: 'Page not found · Harlie Katz', shell: 'pro' },
]

/** Old URLs that must keep working: [from, to]. Query and hash are kept. */
export const LEGACY: Array<[string, string]> = [
  ['/work/planetart', '/work/cafepress-uk'],
  ['/work/planetart/console', '/work/merchandising-platform'],
  ['/art', '/creative/art'],
  ['/film', '/creative/film'],
]

/** The six projects in site order (carousel, Work shelf, next-project sequence). */
export const PROJECTS = [
  { name: 'CafePress UK', path: '/work/cafepress-uk', description: 'UK market research and a localized storefront prototype.' },
  { name: 'Merchandising Platform', path: '/work/merchandising-platform', description: 'Product, inventory, and replenishment information in one prototype.' },
  { name: 'Spreadsheet Agent', path: '/work/spreadsheet-agent', description: 'A request, a reviewable plan, and an editable spreadsheet.' },
  { name: 'AI Leasing Agent', path: '/work/valiance', description: 'Requirements and testing for recurring leasing questions.' },
  { name: 'Jumpstart Finance', path: '/work/jumpstart', description: 'A student venture exploring mobile financial education.' },
  { name: 'Client Work', path: '/work/shift', description: 'Production and campaign support at Shift Content.' },
] as const

/** The carousel's seven tiles: the six projects, then About Me. */
export const TILES = [
  ...PROJECTS.map((p) => ({ ...p, action: 'View case study' })),
  { name: 'About Me', path: '/about', description: 'Background, experience, and creative work.', action: 'View About page' },
]

/** The five CaseScroll pages (Client Work has its own film layout). */
export const CASE_PAGES = PROJECTS.filter((p) => p.path !== '/work/shift')

export const nextOf = (path: string) => {
  const i = PROJECTS.findIndex((p) => p.path === path)
  return PROJECTS[(i + 1) % PROJECTS.length]
}

/* ------------------------------------------------------------------------ */
/* Page helpers                                                              */
/* ------------------------------------------------------------------------ */

/** Waits for the next two animation frames (layout and paint have happened). */
export const frames = (page: Page, n = 2) =>
  page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let left = count
        const step = () => (--left <= 0 ? resolve() : requestAnimationFrame(step))
        requestAnimationFrame(step)
      }),
    n,
  )

/** Loads a path and waits until its H1 exists and web fonts are ready. */
export async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('h1').first()).toBeAttached()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await frames(page)
}

/** The moving (or static) arc is laid out. */
export async function carouselReady(page: Page) {
  await expect(page.locator('.arc[data-ready="true"]')).toBeAttached()
  await frames(page)
}

export const isMobile = (info: TestInfo) => info.project.name === 'mobile'

/** No horizontal page scroll. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(scroll, 'page is wider than the viewport').toBeLessThanOrEqual(client + 1)
}

/** Scrolls the window instantly (no smooth scrolling) and waits for the scroll handlers' frame. */
export async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y)
  await frames(page)
}

/** The element's viewport box, read in the page. */
export const box = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
  })

/** Nothing covers the element: the topmost element at its centre is the element itself or inside it. */
export async function expectUncovered(locator: Locator) {
  const hit = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const top = document.elementFromPoint(r.left + Math.min(r.width / 2, 40), r.top + r.height / 2)
    return top ? el === top || el.contains(top) : false
  })
  expect(hit, 'the element is covered by something else').toBe(true)
}

/* ------------------------------------------------------------------------ */
/* Accessibility                                                             */
/* ------------------------------------------------------------------------ */

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/** axe (WCAG 2.0/2.1 A and AA) with zero violations. Cross-origin player iframes are excluded. */
export async function expectAxeClean(page: Page, label: string, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(AXE_TAGS).exclude('iframe[src*="youtube"]')
  if (include) builder = builder.include(include)
  const result = await builder.analyze()
  const summary = result.violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).slice(0, 6).join('\n    ')}`)
  expect(summary, `axe violations: ${label}`).toEqual([])
}

/* ------------------------------------------------------------------------ */
/* Copy rules                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Collects every piece of visitor-readable copy on the page: text nodes
 * (visible or not: visually hidden screen-reader text, closed disclosures,
 * the transcript bodies), the alt, aria-label, title and placeholder
 * attributes, and the document title. Each colon is returned with its
 * context so the caller can apply the whitelist.
 */
export function readCopy(page: Page) {
  return page.evaluate(() => {
    const texts: Array<{ text: string; where: string; tag: string }> = []
    const describe = (el: Element) => {
      const parts: string[] = []
      let node: Element | null = el
      for (let i = 0; node && i < 3; i++, node = node.parentElement) {
        const cls = node.classList.length ? `.${[...node.classList].slice(0, 2).join('.')}` : ''
        parts.unshift(`${node.tagName.toLowerCase()}${cls}`)
      }
      return parts.join(' > ')
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const parent = n.parentElement
      if (!parent || parent.closest('script, style, noscript, template')) continue
      const text = n.textContent ?? ''
      if (!text.trim()) continue
      texts.push({ text, where: describe(parent), tag: parent.tagName.toLowerCase() })
    }
    for (const el of document.body.querySelectorAll('[alt], [aria-label], [title], [placeholder]')) {
      for (const attr of ['alt', 'aria-label', 'title', 'placeholder']) {
        const v = el.getAttribute(attr)
        if (v && v.trim()) texts.push({ text: v, where: `${describe(el)} @${attr}`, tag: `@${attr}` })
      }
    }
    texts.push({ text: document.title, where: 'document.title', tag: 'title' })
    return texts
  })
}

/** Metadata labels where a colon is part of the approved compact format. */
export const METADATA_LABELS = ['Company:', 'Role:', 'Dates:', 'Project status:']

/**
 * The colon whitelist. A colon is allowed only:
 * - as the whole text of a compact metadata label (<dt>Company:</dt> etc.),
 * - in a time or duration (0:42, 1:05:10),
 * - in a URL or scheme (https://, mailto:),
 * Everything else is reported.
 */
export function disallowedColons(texts: Array<{ text: string; where: string; tag: string }>) {
  const bad: string[] = []
  for (const { text, where } of texts) {
    if (!text.includes(':')) continue
    if (METADATA_LABELS.includes(text.trim())) continue
    const stripped = text
      .replace(/\b(?:https?|mailto|tel):\/?\/?\S*/g, '')
      .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, '')
    if (stripped.includes(':')) bad.push(`${where}: “${text.trim().slice(0, 140)}”`)
  }
  return bad
}

export function emDashes(texts: Array<{ text: string; where: string }>) {
  return texts.filter((t) => t.text.includes('—')).map((t) => `${t.where}: “${t.text.trim().slice(0, 140)}”`)
}

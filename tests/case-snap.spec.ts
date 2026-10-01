import { test, expect, open } from './support'
import type { Page } from '@playwright/test'

// One scroll, one section (Harlie's request, 2026-09-30: "After just one scroll, it should switch to the next section"):
// on a told page one wheel notch, and one Page Down, each move the page exactly one step on, landing that step's middle
// on the reading line (the middle of the window, under the floating pill at 1440x900), and back again. The first step
// is current at the top already, so the first scroll goes to the second.
const place = (page: Page) =>
  page.evaluate(() => {
    const steps = [...document.querySelectorAll('.story__step')]
    const current = steps.findIndex((s) => s.hasAttribute('data-current'))
    const box = steps[current].getBoundingClientRect()
    return { y: scrollY, current, onLine: Math.abs(box.top + box.height / 2 - innerHeight / 2) <= 1 }
  })
// Waits for the page to come to rest where it is expected (the move is a smooth scroll, and the machine may be slow to
// start it): the same scroll position 300ms apart (2026-09-30: a read taken while the smooth scroll was still easing the
// last pixel in, at 193.6, was taken for its rest at 193), then checks it stays there: no second place on.
const still = async (page: Page) => {
  const a = await place(page)
  await page.waitForTimeout(300)
  const b = await place(page)
  return { ...b, y: Math.round(b.y), still: a.y === b.y }
}
const lands = async (page: Page, expected: { current: number; onLine?: boolean; y?: number }) => {
  await expect.poll(() => still(page), { intervals: [0], timeout: 8000 }).toMatchObject({ ...expected, still: true })
  const at = await place(page)
  await page.waitForTimeout(500)
  expect(await place(page)).toEqual(at)
}

for (const route of ['merchandising-platform', 'cafepress-uk']) {
  test(`${route}: one wheel notch or Page Down moves one section`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse wheel and keys, at 1440x900')
    await open(page, `/work/${route}`)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await expect(page.locator('html')).toHaveAttribute('data-case-snap', '')
    const words = await page.locator('.story__steps').boundingBox()
    await page.mouse.move(words!.x + 60, 450)
    await lands(page, { y: 0, current: 0 })

    await page.mouse.wheel(0, 100)
    await lands(page, { current: 1, onLine: true })

    await page.keyboard.press('PageDown')
    await lands(page, { current: 2, onLine: true })

    await page.mouse.wheel(0, -100)
    await lands(page, { current: 1, onLine: true })

    await page.keyboard.press('PageUp')
    await lands(page, { y: 0, current: 0 })
  })
}

// A second key pressed while the first one's move is still under way goes one place further, and the page never stops
// between two (2026-09-30, the review: left to Chromium's snapping, two presses 60ms apart rested part way, for good).
test('two quick presses of Arrow Down move two sections', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keys, at 1440x900')
  await open(page, '/work/merchandising-platform')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await lands(page, { y: 0, current: 0 })
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(60)
  await page.keyboard.press('ArrowDown')
  await lands(page, { current: 2, onLine: true })
  await page.keyboard.press('Space')
  await page.waitForTimeout(60)
  await page.keyboard.press('Shift+Space')
  await lands(page, { current: 2, onLine: true })
})

// A phone flick goes one place, however far it would fling (2026-09-30, the review: at 390x844 Chromium's fling passed
// the next place about half the time with a flick of a fifth of the screen). The places: the page's top, each step with
// its middle on the reading line below the held band, and the page's end.
test('a flick on a phone moves one section', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile || browserName !== 'chromium', 'touch, at 390x844 (Chromium: synthesized gestures)')
  await open(page, '/work/cafepress-uk')
  await expect(page.locator('html')).toHaveAttribute('data-case-snap', '')
  const cdp = await page.context().newCDPSession(page)
  const places = () =>
    page.evaluate(() => {
      const covered = parseFloat(document.documentElement.style.getPropertyValue('--snap-top')) || 0
      const read = (covered + innerHeight) / 2
      const steps = [...document.querySelectorAll<HTMLElement>('.story__step')].filter((s) => !s.dataset.snap)
      const mids = steps.map((s) => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - read)
      return [0, ...mids, document.documentElement.scrollHeight - innerHeight]
    })
  const at = await places()
  const index = async () => {
    const y = await page.evaluate(() => scrollY)
    return at.findIndex((p) => Math.abs(p - y) <= 3)
  }
  const flick = (dir: number) =>
    cdp.send('Input.synthesizeScrollGesture', { x: 60, y: Math.round(844 * (dir > 0 ? 0.75 : 0.45)), yDistance: -dir * Math.round(844 * 0.2), speed: 1800, gestureSourceType: 'touch', preventFling: false })
  const rests = async (expected: number) => {
    await expect.poll(async () => ({ ...(await still(page)), index: await index() }), { intervals: [0], timeout: 8000 }).toMatchObject({ still: true, index: expected })
  }
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), at[1])
  await rests(1)
  for (const [dir, expected] of [[1, 2], [-1, 1], [1, 2], [-1, 1]]) {
    await flick(dir)
    await rests(expected)
  }
})

test('the snapping is only on told pages', async ({ page, isMobile }) => {
  await open(page, '/work/cafepress-uk')
  await expect(page.locator('html')).toHaveAttribute('data-case-snap', '')
  // Leaving by the site's own navigation (the page change keeps the document): the root no longer snaps.
  if (isMobile) await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('header').getByRole('link', { name: 'About', exact: true }).filter({ visible: true }).click()
  await page.waitForURL(/\/about$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-case-snap')
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toBe('none')
})

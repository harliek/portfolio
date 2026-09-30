import { test, expect } from '@playwright/test'

for (const route of ['cafepress-uk', 'merchandising-platform', 'spreadsheet-agent', 'valiance', 'jumpstart']) {
  test(`${route} keeps its introduction attached to its reading column`, async ({ page }) => {
    await page.goto(`/work/${route}`)
    await expect(page.locator('.cs__intro')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    // The introduction's words, its lede last: where the compositor holds the fading window, the introduction's own box
    // is held still in the window while its words scroll with the page (case-v16.css, 2026-09-30).
    const gap = () => page.evaluate(() => {
      const intro = document.querySelector('.cs__intro .cx-lede')!.getBoundingClientRect()
      const body = document.querySelector('.cs__body')!.getBoundingClientRect()
      return body.top - intro.bottom
    })
    const initial = await gap()
    for (const fraction of [0.5, 1, 0]) {
      await page.evaluate((f) => window.scrollTo({ top: f * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }), fraction)
      await expect.poll(async () => Math.abs(await gap() - initial)).toBeLessThan(1)
    }
    await expect(page.locator('.story__media-label')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

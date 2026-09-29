import { test as base, expect, type Page } from '@playwright/test'
export const ROUTES = [
  ['/', 'Portfolio'], ['/about', 'Harlie Katz'],
  ['/work/spreadsheet-agent', 'Spreadsheet Assistant'],
  ['/work/creative-production', 'Creative Production'],
  ['/work/cafepress-uk', 'CafePress UK'],
  ['/work/merchandising-platform', 'Merchandising Dashboard'],
  ['/work/jumpstart', 'Jumpstart Finance'], ['/work/valiance', 'AI Leasing Agent'],
  ['/missing-page', 'Page not found'],
] as const
export const test = base.extend<{ errorsChecked: void }>({
  errorsChecked: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('response', r => { if (r.status() >= 400 && r.url().startsWith('http://localhost:4173')) errors.push(`${r.status()} ${r.url()}`) })
    await use()
    expect(errors).toEqual([])
  }, { auto: true }],
})
export { expect }
export async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('h1')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}
export async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
}

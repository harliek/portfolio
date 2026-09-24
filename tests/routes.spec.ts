import { LEGACY, ROUTES, expect, expectNoHorizontalOverflow, frames, open, test } from './support'

/*
 * Every route: direct load, one H1 with the right text, the right shell
 * (professional header and footer contact area, or the restored creative
 * header and footer), the document title, a reload, no horizontal overflow.
 * Console errors and failed same-origin requests fail any test (support.ts).
 */

for (const route of ROUTES) {
  test(`route ${route.path} loads directly and after a reload`, async ({ page }) => {
    await open(page, route.path)
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText(route.h1)
    await expect(page).toHaveTitle(route.title)
    await expect(page.locator('body')).not.toContainText('—')

    if (route.shell === 'pro') {
      const header = page.locator('header.site-header')
      await expect(header).toBeVisible()
      await expect(header.getByRole('link', { name: /Harlie Katz\s*Professional portfolio/ })).toBeVisible()
      await expect(page.locator('footer#contact')).toBeAttached()
      await expect(page.locator('footer#contact').getByRole('heading', { name: 'Contact' })).toBeAttached()
      await expect(page.locator('.stage-bg')).toBeAttached()
      await expect(page.locator('.legacy-creative')).toHaveCount(0)
    } else {
      await expect(page.locator('.legacy-creative header.hd')).toBeVisible()
      await expect(page.locator('.legacy-creative footer.ft')).toBeAttached()
      // Outside the professional shell: no professional header, footer, background video or pointer trail.
      await expect(page.locator('header.site-header')).toHaveCount(0)
      await expect(page.locator('footer#contact')).toHaveCount(0)
      await expect(page.locator('.stage-bg')).toHaveCount(0)
      await expect(page.locator('canvas.pointer-trail')).toHaveCount(0)
    }

    await expectNoHorizontalOverflow(page)

    await page.reload()
    await expect(page.locator('h1')).toHaveText(route.h1)
    await expect(page).toHaveTitle(route.title)
    await frames(page)
    await expectNoHorizontalOverflow(page)
  })
}

test.describe('legacy URLs redirect', () => {
  for (const [from, to] of LEGACY) {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from)
      await expect(page).toHaveURL(new RegExp(`${to.replace(/\//g, '\\/')}$`))
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }

  test('a redirect keeps the query and hash', async ({ page }) => {
    await page.goto('/art?from=old#she-is-her')
    await expect(page).toHaveURL(/\/creative\/art\?from=old#she-is-her$/)
    await expect(page.locator('#she-is-her')).toBeAttached()
    await page.goto('/work/planetart#results')
    await expect(page).toHaveURL(/\/work\/cafepress-uk#results$/)
  })
})

test('the 404 page offers a way back', async ({ page }) => {
  await open(page, '/work/does-not-exist')
  await expect(page.locator('h1')).toHaveText('Page not found')
  await page.getByRole('link', { name: 'View work' }).click()
  await expect(page).toHaveURL(/\/$/)
})

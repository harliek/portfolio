import AxeBuilder from '@axe-core/playwright'
import { test, expect, ROUTES, open, noOverflow } from './support'
for (const [path, heading] of ROUTES) {
  test(`${path} direct load, refresh, semantics and accessibility`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveAccessibleName(new RegExp(heading,'i'))
    await expect(page.locator('.site-header')).toBeVisible()
    await expect(page.locator('footer')).toBeAttached()
    await noOverflow(page)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([])
    await page.reload()
    await expect(page.locator('h1')).toHaveAccessibleName(new RegExp(heading,'i'))
  })
}
for (const [from,to] of [['/work/planetart','/work/cafepress-uk'],['/work/shift','/work/creative-production'],['/art','/creative/art'],['/film','/creative/films']]) {
  test(`${from} preserves legacy navigation`, async ({ page }) => {
    await page.goto(from)
    await expect(page).toHaveURL(new RegExp(to+'$'))
    await expect(page.locator('h1')).toBeVisible()
  })
}
test('malformed URL fragment does not crash the page', async ({ page }) => {
  await open(page, '/about#%E0%A4%A')
  await page.waitForTimeout(550)
  await expect(page.locator('h1')).toHaveText('Harlie Katz', {ignoreCase:true})
})
for (const path of ['/creative/','/creative/art','/creative/films']) {
  test(`${path} archive remains accessible`, async ({ page }) => {
    await open(page,path)
    await noOverflow(page)
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
    await expect(page.getByRole('link',{name:'Professional portfolio',exact:true})).toHaveAttribute('href','/')
  })
}

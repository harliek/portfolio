import { test, expect, open } from './support'
// Two bugs fixed on 2026-09-29 (audit H1 and K2), kept fixed.
test('an enlarged image closes with its page on browser Back',async({page})=>{
  // Reached through the footer's Next, so Back is a real history entry inside the site.
  await open(page,'/work/jumpstart')
  await page.getByRole('link',{name:/^Next project/}).click()
  await expect(page).toHaveURL(/\/work\/valiance$/)
  await expect(page.locator('html')).not.toHaveAttribute('data-shuffle')
  await page.getByRole('button',{name:/Enlarge image/}).first().click()
  const dialog=page.locator('dialog.image-dialog[open]');await expect(dialog).toBeVisible()
  await page.goBack();await expect(page).toHaveURL(/\/work\/jumpstart$/)
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/is-dialog-open/)
  await expect(page.locator('h1')).toBeVisible()
})
test('a page chosen during the HOME glide is kept',async({page,isMobile})=>{
  test.skip(isMobile,'About is inside the menu on phones')
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'/')
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
  // The pill settles first, so neither click lands on a moving header.
  const header=page.locator('.site-header');await expect(header).toHaveAttribute('data-floating')
  await page.locator('.site-header__inner').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)))
  // HOME glides to the top and only then is followed; About, chosen 150ms into the glide, must win.
  await header.getByRole('link',{name:'Home',exact:true}).click()
  await page.waitForTimeout(150)
  await header.getByRole('link',{name:'About',exact:true}).click()
  await page.waitForTimeout(2000)
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('h1')).toHaveAccessibleName(/Harlie Katz/i)
})

import { test, expect, open } from './support'
test('skip link reaches main content',async({page})=>{
  await open(page,'/about'); await page.keyboard.press('Tab')
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused()
  await page.keyboard.press('Enter'); await expect(page.locator('main')).toBeFocused()
})
test('mobile menu closes with Escape and restores focus',async({page,isMobile})=>{
  test.skip(!isMobile,'mobile menu')
  await open(page,'/about')
  const menu=page.locator('.menu-button')
  await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true')
  await expect(page.locator('.site-menu a[href^="/work/"]')).toHaveCount(6)
  await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');await expect(menu).toBeFocused()
})
test('About navigation and Back restore the previous page',async({page,isMobile})=>{
  await open(page,'/work/cafepress-uk')
  await page.evaluate(()=>scrollTo(0,150))
  // The pill settles before y is read and About is clicked: a click on the moving pill retries with scrollIntoView, which moves the page.
  await expect(page.locator('.site-header')).toHaveAttribute('data-floating')
  await page.locator('.site-header__inner').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)))
  const y=await page.evaluate(()=>scrollY)
  if(isMobile)await page.getByRole('button',{name:'Menu',exact:true}).click()
  await page.locator('header').getByRole('link',{name:'About',exact:true}).filter({visible:true}).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('h1')).toBeFocused()
  await page.goBack();await expect(page).toHaveURL(/cafepress-uk$/)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(y,0)
})

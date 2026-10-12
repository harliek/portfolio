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
  // To a section's own place: the page snaps one section at a time, so a fixed offset between two places goes back to the top.
  await page.evaluate(()=>document.querySelectorAll('.story__step')[1].scrollIntoView({block:'center'}))
  await expect.poll(async()=>{const a=await page.evaluate(()=>scrollY);await page.waitForTimeout(200);return a>12&&a===await page.evaluate(()=>scrollY)}).toBe(true)
  // The pill settles before y is read and About is clicked: a click on the moving pill retries with scrollIntoView, which moves the page.
  await expect(page.locator('.site-header')).toHaveAttribute('data-floating')
  await page.locator('.site-header__inner').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)))
  const y=await page.evaluate(()=>scrollY)
  // Pressed as a tap would be: the runner's click can first scroll the sticky header's control into view, which takes a
  // phone's case page to its top before the click (as a tap never does), so Back then rightly returns to the top.
  if(isMobile)await page.getByRole('button',{name:'Menu',exact:true}).evaluate(el=>(el as HTMLElement).click())
  await page.locator('header').getByRole('link',{name:'About',exact:true}).filter({visible:true}).evaluate(el=>(el as HTMLElement).click())
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('h1')).toBeFocused()
  await page.goBack();await expect(page).toHaveURL(/cafepress-uk$/)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(y,0)
})

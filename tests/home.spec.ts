import { test, expect, open, noOverflow } from './support'
test('all eight tiles have unique working destinations and captions',async({page})=>{
  await open(page,'/')
  const links=page.locator('.plane');await expect(links).toHaveCount(8)
  const hrefs=await links.evaluateAll(es=>es.map(e=>e.getAttribute('href')))
  expect(new Set(hrefs).size).toBe(8)
  await expect(page.locator('.plane__line')).toHaveCount(8)
  await noOverflow(page)
})
test('moving tiles wait for the first movement and reduced motion stops movement',async({page,isMobile})=>{
  test.skip(isMobile,'fine pointer motion')
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'/')
  const tile=page.locator('.plane').nth(2)
  const transform=()=>tile.evaluate(e=>(e as HTMLElement).style.transform)
  // No scroll and no pointer movement yet: the strip rests where it starts (Harlie's request, 2026-09-29).
  const resting=await transform();expect(resting).toContain('translate3d')
  await page.waitForTimeout(1200);expect(await transform()).toBe(resting)
  // The first pointer movement sets it drifting (it eases up from rest).
  await page.mouse.move(40,300);await page.mouse.move(90,330)
  await page.waitForTimeout(600);const before=await transform();await page.waitForTimeout(600);expect(await transform()).not.toBe(before)
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.field')).toHaveAttribute('data-reduced','true')
  // Reduced motion holds the drift: it eases to a stop (EASE_V, about 2.6s from full speed), then stays still.
  await expect.poll(async()=>{const a=await transform();await page.waitForTimeout(400);return await transform()===a}).toBe(true)
  const still=await transform();await page.waitForTimeout(400);expect(await transform()).toBe(still)
})

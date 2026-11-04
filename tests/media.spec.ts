import { test, expect } from './support'
for(const [route,label] of [['spreadsheet-agent','Play spreadsheet demo'],['merchandising-platform','Play dashboard demo']]) {
  test(`${route} decodes, plays and respects live reduced motion`,async({page})=>{
    await page.goto('/work/'+route)
    await page.getByRole('button',{name:label,exact:true}).click()
    const video=page.locator('dialog[open] video')
    await video.evaluate((v:HTMLVideoElement)=>v.play())
    const before=await video.evaluate((v:HTMLVideoElement)=>v.currentTime)
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(before+.2)
    await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0)
    await page.emulateMedia({reducedMotion:'reduce'})
    await expect.poll(()=>page.locator('video.story__video').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true)
  })
}
test('three client films decode and play in Chrome',async({page})=>{
  await page.goto('/work/creative-production')
  const buttons=page.getByRole('button',{name:/Watch film/})
  for(let i=0;i<3;i++){
    await buttons.nth(i).click()
    const video=page.locator('dialog[open] video')
    await video.evaluate((v:HTMLVideoElement)=>v.play())
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2)
    await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0)
  }
})

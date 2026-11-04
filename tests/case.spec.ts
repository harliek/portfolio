import AxeBuilder from '@axe-core/playwright'
import {test,expect,open,noOverflow} from './support'
for(const route of ['cafepress-uk','valiance'])test(`${route} image dialog closes and returns keyboard focus`,async({page})=>{
  await open(page,'/work/'+route)
  const trigger=page.getByRole('button',{name:/Enlarge image/}).first()
  await trigger.click();const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible()
  // Checked once the view has faded in: mid-fade, axe blends the counter's colour with the scrim (a false contrast failure under load).
  await dialog.evaluate(d=>Promise.all(d.getAnimations({subtree:true}).map(a=>a.finished)))
  expect((await new AxeBuilder({page}).include('dialog[open]').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused()
  await expect(page.locator('html')).not.toHaveClass(/is-dialog-open/)
})
for(const [route,label] of [['spreadsheet-agent','Play spreadsheet demo'],['merchandising-platform','Play dashboard demo']])test(`${route} demo survives scrolling and closes cleanly`,async({page})=>{
  await open(page,'/work/'+route)
  await page.getByRole('button',{name:label,exact:true}).click()
  const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible()
  const src=await dialog.locator('video').getAttribute('src')
  await page.mouse.wheel(0,900);expect(await dialog.locator('video').getAttribute('src')).toBe(src)
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0)
  await noOverflow(page)
})
test('all three client films open in their own players',async({page})=>{
  await open(page,'/work/creative-production')
  const buttons=page.getByRole('button',{name:/Watch film/});await expect(buttons).toHaveCount(3)
  for(let i=0;i<3;i++){
    await buttons.nth(i).click();const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible()
    await expect(dialog.locator('video')).toHaveAttribute('src',/\.mp4$/)
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(buttons.nth(i)).toBeFocused()
  }
})

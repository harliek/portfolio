import { test, expect, open, noOverflow } from './support'
test('all eight tiles have unique working destinations and captions',async({page})=>{
  await open(page,'/')
  const links=page.locator('.plane');await expect(links).toHaveCount(8)
  const hrefs=await links.evaluateAll(es=>es.map(e=>e.getAttribute('href')))
  expect(new Set(hrefs).size).toBe(8)
  await expect(page.locator('.plane__line')).toHaveCount(8)
  await noOverflow(page)
})
test('the grid: rows in order, centred, footage in view and posters under reduced motion',async({page,isMobile})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'/')
  const items=page.locator('.work-grid__item')
  expect(await items.evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.id))).toEqual(['creative','about','client-work','ai-leasing-agent','cafepress-uk','jumpstart-finance','spreadsheet-agent','merchandising-platform'])
  if(!isMobile){
    // Three, three and two to a row, each row centred.
    const rows=await items.evaluateAll(es=>{
      const by=new Map<number,DOMRect[]>()
      for(const e of es){const r=e.getBoundingClientRect();const k=Math.round(r.top);by.set(k,[...(by.get(k)??[]),r])}
      const w=document.documentElement.clientWidth
      return [...by.values()].map(rs=>({n:rs.length,off:Math.abs(rs[0].left-(w-rs[rs.length-1].right))}))
    })
    expect(rows.map(r=>r.n)).toEqual([3,3,2])
    for(const r of rows)expect(r.off).toBeLessThan(2)
  }
  // Footage is loaded for a tile once it is in view, and an ordinary scroll ends with the footer after the last row.
  await page.locator('.work-grid__item[data-id="merchandising-platform"]').scrollIntoViewIfNeeded()
  await expect.poll(()=>page.locator('.work-grid__item[data-id="merchandising-platform"] video').evaluate(v=>v.hasAttribute('src'))).toBe(true)
  // Scrolled to the page's end (the last row and the footer may already fit the window together), the footer sits
  // whole in the window below the last tile.
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
  await expect.poll(()=>page.evaluate(()=>Math.round(scrollY+innerHeight)>=document.documentElement.scrollHeight-1)).toBe(true)
  expect(await page.evaluate(()=>{const f=document.querySelector('.site-end')!.getBoundingClientRect();const t=document.querySelector('.work-grid__item:last-child')!.getBoundingClientRect();return f.bottom<=innerHeight+1&&f.top>=t.bottom})).toBe(true)
  await noOverflow(page)
  // Reduced motion: posters only.
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.site-end').scrollIntoViewIfNeeded();await page.waitForTimeout(500)
  expect(await page.locator('.work-grid video[src]').count()).toBe(0)
})

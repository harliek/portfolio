import { test, expect, open, noOverflow } from './support'
test('all nine tiles have unique working destinations and captions',async({page})=>{
  await open(page,'/')
  const links=page.locator('.plane');await expect(links).toHaveCount(9)
  const hrefs=await links.evaluateAll(es=>es.map(e=>e.getAttribute('href')))
  expect(new Set(hrefs).size).toBe(9)
  await expect(page.locator('.plane__line')).toHaveCount(9)
  await noOverflow(page)
})
test('the grid: rows in order, centred, footage in view and posters under reduced motion',async({page,isMobile})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'/')
  const items=page.locator('.work-grid__item')
  expect(await items.evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.id))).toEqual(['creative','about','pdr-control','client-work','spreadsheet-agent','cafepress-uk','merchandising-platform','ai-leasing-agent','jumpstart-finance'])
  if(!isMobile){
    // Three to a row, each row centred.
    const rows=await items.evaluateAll(es=>{
      const by=new Map<number,DOMRect[]>()
      for(const e of es){const r=e.getBoundingClientRect();const k=Math.round(r.top);by.set(k,[...(by.get(k)??[]),r])}
      const w=document.documentElement.clientWidth
      return [...by.values()].map(rs=>({n:rs.length,off:Math.abs(rs[0].left-(w-rs[rs.length-1].right))}))
    })
    expect(rows.map(r=>r.n)).toEqual([3,3,3])
    for(const r of rows)expect(r.off).toBeLessThan(2)
  }
  // Footage is loaded for a tile once it is in view, and an ordinary scroll ends with the footer after the last row.
  await page.locator('.work-grid__item[data-id="merchandising-platform"]').scrollIntoViewIfNeeded()
  await expect.poll(()=>page.locator('.work-grid__item[data-id="merchandising-platform"] video').evaluate(v=>v.hasAttribute('src'))).toBe(true)
  // An ordinary scroll to the end shows the footer whole, after the last row. (Scrolled explicitly: with three full rows
  // the footer is already in view once the last row is, so scrollIntoViewIfNeeded no longer moves the page; 2026-11-04.)
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
  await expect.poll(()=>page.evaluate(()=>Math.round(scrollY+innerHeight)>=document.documentElement.scrollHeight-1)).toBe(true)
  await expect.poll(()=>page.evaluate(()=>{const f=document.querySelector('.site-end')!.getBoundingClientRect();const last=[...document.querySelectorAll('.work-grid__item')].pop()!.getBoundingClientRect();return f.top>=last.bottom&&f.bottom<=innerHeight+1})).toBe(true)
  await noOverflow(page)
  // Reduced motion: posters only.
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.site-end').scrollIntoViewIfNeeded();await page.waitForTimeout(500)
  expect(await page.locator('.work-grid video[src]').count()).toBe(0)
})

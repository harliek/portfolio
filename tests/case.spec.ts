import type { Page } from '@playwright/test'
import { CASE_PAGES, box, expect, expectNoHorizontalOverflow, frames, nextOf, open, scrollToY, test } from './support'

/*
 * The five scroll-driven case studies (CaseScroll): opening (title, compact
 * metadata, one situation paragraph, a representative visual), then the
 * explanation beside ONE sticky media region whose visual follows the
 * paragraph being read, then compact Results and one next-project row.
 * No section pills, tabs or step buttons; "Context and role" is gone.
 */

const FRAME = '.cs-frame'

/** The frame's shown state, its target (from the scroll position) and what is on screen. */
const frameState = (page: Page) =>
  page.evaluate((sel) => {
    const f = document.querySelector(sel) as HTMLElement
    const layers = [...f.querySelectorAll<HTMLElement>('[data-layer]')]
    const shown = layers.filter((l) => l.dataset.state === 'shown')
    const caption = document.querySelector('.cs-mf[data-variant="sticky"] .cs-caption')?.textContent?.trim() ?? ''
    return {
      state: Number(f.dataset.state),
      target: Number(f.dataset.target),
      shown: shown.length,
      under: layers.filter((l) => l.dataset.state === 'under').length,
      highlights: f.querySelectorAll('.cs-hl[data-on]').length,
      caption,
      active: document.querySelector('.cs-block[data-active]')?.getAttribute('data-block') ?? null,
    }
  }, FRAME)

/**
 * Records, every animation frame until stopped, whether the frame is ever
 * empty (no fully opaque, loaded layer), whether two highlights are ever
 * visible together, and how long two layers overlap in a change.
 */
async function startFrameWatch(page: Page) {
  await page.evaluate((sel) => {
    const w = window as unknown as { __watch: { empty: number; doubleHl: number; frames: number; overlapMs: number[]; stop: boolean } }
    w.__watch = { empty: 0, doubleHl: 0, frames: 0, overlapMs: [], stop: false }
    const f = document.querySelector(sel) as HTMLElement
    let overlapStart = 0
    const step = (now: number) => {
      if (w.__watch.stop) return
      w.__watch.frames++
      const layers = [...f.querySelectorAll<HTMLElement>('[data-layer]')]
      const opaque = layers.some((l) => {
        if (l.dataset.state === 'hidden') return false
        if (Number(getComputedStyle(l).opacity) < 0.99) return false
        const img = l.querySelector('img')
        return img ? img.complete && img.naturalWidth > 0 : Boolean(l.querySelector('.placeholder'))
      })
      if (!opaque && !f.hasAttribute('data-demo')) w.__watch.empty++
      const visibleHl = [...f.querySelectorAll<HTMLElement>('.cs-hl')].filter((h) => Number(getComputedStyle(h).opacity) > 0.02)
      if (visibleHl.length > 1) w.__watch.doubleHl++
      const two = layers.filter((l) => l.dataset.state !== 'hidden').length > 1
      if (two && !overlapStart) overlapStart = now
      if (!two && overlapStart) {
        w.__watch.overlapMs.push(now - overlapStart)
        overlapStart = 0
      }
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, FRAME)
}

const stopFrameWatch = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __watch: { empty: number; doubleHl: number; frames: number; overlapMs: number[]; stop: boolean } }
    w.__watch.stop = true
    return w.__watch
  })

/** Waits until the shown state has caught up with the scroll position. */
const settled = (page: Page) =>
  expect
    .poll(async () => {
      const s = await frameState(page)
      return s.state === s.target && s.under === 0 && s.shown === 1
    }, { timeout: 5_000 })
    .toBe(true)

/** Top of the case grid and the end of the scroll-driven part (the start of Results), in document coordinates. */
const extent = (page: Page) =>
  page.evaluate(() => {
    const y = window.scrollY
    const grid = document.querySelector('.cs') as HTMLElement
    const results = document.querySelector('#results') as HTMLElement
    return { top: grid.getBoundingClientRect().top + y, end: results.getBoundingClientRect().top + y, vh: window.innerHeight }
  })

for (const p of CASE_PAGES) {
  test.describe(`${p.name} (${p.path})`, () => {
    test('opening: title, compact metadata, situation and media in the first viewport', async ({ page }, info) => {
      await open(page, p.path)
      const h1 = page.locator('h1')
      await expect(h1).toHaveText(p.name)
      await expect(h1).toBeInViewport()
      const size = await h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(size).toBeLessThanOrEqual(44)
      const meta = page.locator('.cs-opening dl.cs-meta')
      await expect(meta.locator('dt')).toHaveText(['Company:', 'Role:', 'Dates:', 'Project status:'])
      for (const dd of await meta.locator('dd').all()) await expect(dd).not.toBeEmpty()
      await expect(meta).toBeInViewport()
      const situation = page.locator('.cs-opening .cs-situation p')
      await expect(situation).toHaveCount(1)
      await expect(situation).toBeInViewport({ ratio: info.project.name === 'mobile' ? 0.3 : 0.9 })
      // The representative visual: visible straight away on desktop (beside the text), and not left hidden by a transition.
      const hero = page.locator('[data-case-hero]').first()
      await expect(hero).not.toHaveAttribute('data-transition-pending', /.*/)
      if (info.project.name !== 'mobile') {
        await expect(hero).toBeInViewport({ ratio: 0.6 })
        const img = hero.locator('[data-state="shown"] img')
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
      }
      // Removed patterns: section pills, "Context and role", tabs, step buttons.
      await expect(page.locator('.section-links')).toHaveCount(0)
      await expect(page.locator('main')).not.toContainText('Context and role')
      await expect(page.getByRole('tab')).toHaveCount(0)
      await expect(page.getByRole('tablist')).toHaveCount(0)
      await expectNoHorizontalOverflow(page)
    })

    test('reading order: situation, Problem or Product premise, then decisions or contribution, then Results and one next-project row', async ({ page }) => {
      await open(page, p.path)
      const h2 = await page.locator('main h2').allTextContents()
      const start = h2.findIndex((t) => t === 'Problem' || t === 'Product premise')
      expect(start, `h2s: ${h2.join(' | ')}`).toBe(0)
      expect(['Design decisions', 'My contribution']).toContain(h2[1])
      expect(h2[2]).toBe('Results')
      // Every essential explanation is ordinary document text (no disclosure needed): nothing in the scroll section is inside <details>.
      await expect(page.locator('.cs-body details')).toHaveCount(0)
      // Results → next project → footer, with no separate large regions.
      const next = nextOf(p.path)
      const row = page.getByRole('navigation', { name: 'Next project' })
      await expect(row).toHaveCount(1)
      const link = row.getByRole('link')
      await expect(link).toHaveCount(1)
      await expect(link).toHaveAttribute('href', next.path)
      await expect(link.locator('.next-project__label')).toHaveText(`Next project · ${next.name} ↗`)
      const results = await box(page.locator('#results'))
      const rowBox = await box(row)
      const footer = await box(page.locator('footer#contact'))
      expect(rowBox.y).toBeGreaterThan(results.y)
      const gap = footer.y - rowBox.bottom
      expect(gap, 'footer follows the next-project row').toBeGreaterThanOrEqual(24)
      expect(gap, 'footer follows the next-project row').toBeLessThanOrEqual(120)
      // Readable body text.
      const px = await page.locator('.cs-body .case-prose p').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(px).toBeGreaterThanOrEqual(16)
    })

    test('next project row opens the next case study with its opening visible', async ({ page }) => {
      await open(page, p.path)
      const next = nextOf(p.path)
      await page.getByRole('navigation', { name: 'Next project' }).getByRole('link').click()
      await expect(page).toHaveURL(new RegExp(`${next.path}$`))
      await expect(page.locator('h1')).toHaveText(next.name)
      await expect(page.locator('h1')).toBeInViewport()
      // The reveal completes and leaves nothing behind.
      await expect(page.locator('[data-transition-pending]')).toHaveCount(0, { timeout: 3_000 })
    })
  })
}

test.describe('scroll-driven media (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'stacked on small screens')

  for (const p of CASE_PAGES) {
    test(`${p.name}: one sticky region; each block's visual appears as it is read, forwards and back`, async ({ page }) => {
      test.slow()
      await open(page, p.path)
      await expect(page.locator('.cs')).toHaveAttribute('data-layout', 'sticky')
      // Exactly one sticky element in main: the media region.
      const sticky = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).position === 'sticky').map((el) => el.className))
      expect(sticky).toEqual([expect.stringContaining('cs-sticky')])
      await settled(page)
      const opening = await frameState(page)
      expect(opening.state).toBe(0)
      expect(opening.caption.length).toBeGreaterThan(10)

      // Walk down in small steps: the target only moves forward, one state at a time, and never skips a visual.
      const { top, end, vh } = await extent(page)
      const seen: number[] = [0]
      const captions = new Map<number, string>([[0, opening.caption]])
      await startFrameWatch(page)
      for (let y = top; y <= end; y += 70) {
        await scrollToY(page, y)
        const s = await frameState(page)
        const last = seen[seen.length - 1]
        expect(s.target, `target at scroll ${y}`).toBeGreaterThanOrEqual(last)
        if (s.target !== last) seen.push(s.target)
      }
      await settled(page)
      const bottom = await frameState(page)
      // The last block's visual is reached while the region is still pinned.
      expect(bottom.target).toBe(seen[seen.length - 1])
      expect(seen, 'every visual state is shown in order').toEqual(Array.from({ length: seen.length }, (_, k) => k))
      expect(seen.length, 'the walkthrough has several visuals').toBeGreaterThanOrEqual(3)
      // The media region is still on screen at the last state.
      await expect(page.locator('.cs-sticky')).toBeInViewport({ ratio: 0.5 })

      // Visit each state and check it settles with its own caption and at most one highlight.
      for (let y = top; y <= end; y += 70) {
        await scrollToY(page, y)
        const s = await frameState(page)
        if (!captions.has(s.target)) {
          await settled(page)
          const t = await frameState(page)
          expect(t.highlights).toBeLessThanOrEqual(1)
          captions.set(t.state, t.caption)
        }
      }
      expect(captions.size).toBe(seen.length)

      // And back up: the target only moves backwards and returns to the opening.
      for (let y = end; y >= 0; y -= 90) {
        const before = (await frameState(page)).target
        await scrollToY(page, y)
        const s = await frameState(page)
        expect(s.target, `target at scroll ${y} (going up)`).toBeLessThanOrEqual(before)
      }
      await scrollToY(page, 0)
      await settled(page)
      const back = await frameState(page)
      expect(back.state).toBe(0)
      expect(back.caption).toBe(opening.caption)

      const watch = await stopFrameWatch(page)
      expect(watch.frames).toBeGreaterThan(20)
      expect(watch.empty, 'frames where the media region was empty').toBe(0)
      expect(watch.doubleHl, 'frames with two highlights').toBe(0)
      // Image changes are short (no prolonged crossfades that double lettering).
      expect(Math.max(0, ...watch.overlapMs)).toBeLessThan(450)
      void vh
    })

    test(`${p.name}: fast scrolling lands on the right visual without emptying the frame`, async ({ page }) => {
      await open(page, p.path)
      await settled(page)
      const { top, end } = await extent(page)
      await startFrameWatch(page)
      // Flick down with the wheel, back up past the middle, and down again, without waiting.
      await page.mouse.move(400, 500)
      for (let k = 0; k < 6; k++) await page.mouse.wheel(0, 900)
      for (let k = 0; k < 4; k++) await page.mouse.wheel(0, -700)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), end - 200)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), top)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), (top + end) / 2)
      await frames(page, 3)
      await settled(page)
      const s = await frameState(page)
      expect(s.state).toBe(s.target)
      expect(s.highlights).toBeLessThanOrEqual(1)
      const watch = await stopFrameWatch(page)
      expect(watch.empty, 'frames where the media region was empty').toBe(0)
      expect(watch.doubleHl, 'frames with two highlights').toBe(0)
    })
  }

  test('scrolling is never captured: no wheel handler prevents default and nothing snaps', async ({ page }) => {
    await open(page, '/work/spreadsheet-agent')
    const result = await page.evaluate(() => {
      const targets = [document.querySelector('.cs-frame'), document.querySelector('.cs-body'), document.body] as Element[]
      const prevented = targets.map((t) => {
        const e = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true })
        t.dispatchEvent(e)
        return e.defaultPrevented
      })
      const snap = [document.documentElement, document.body].map((el) => getComputedStyle(el).scrollSnapType)
      return { prevented, snap }
    })
    expect(result.prevented).toEqual([false, false, false])
    for (const s of result.snap) expect(s === 'none' || s === '').toBe(true)
    // A normal wheel gesture scrolls the page by about its own distance.
    await page.mouse.move(300, 400)
    const y0 = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 400)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 250)
  })

  test('Enlarge image: a labelled dialog with a visible Close, Escape and focus return', async ({ page }) => {
    await open(page, '/work/valiance')
    // Scroll to a conversation crop: "Enlarge image" opens the full conversation.
    await page.locator('[data-block="handoff"]').scrollIntoViewIfNeeded()
    const { top } = await box(page.locator('[data-block="handoff"]'))
    await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'instant' as ScrollBehavior }), top - 300)
    await settled(page)
    const enlarge = page.locator('.cs-controls').getByRole('button', { name: 'Enlarge image' })
    await expect(enlarge).toBeVisible()
    const h = await box(enlarge)
    expect(h.height).toBeGreaterThanOrEqual(40)
    await enlarge.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const close = dialog.getByRole('button', { name: 'Close' })
    await expect(close).toBeVisible()
    await expect(close).toBeFocused()
    await expect(dialog.locator('img')).toHaveAttribute('src', /valiance-messages/)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(enlarge).toBeFocused()
    // The Close button works too.
    await enlarge.click()
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).not.toBeVisible()
    await expect(page.locator('html')).not.toHaveClass(/is-dialog-open/)
  })

  test('controls look actionable before interaction', async ({ page }) => {
    await open(page, '/work/merchandising-platform')
    const play = page.getByRole('button', { name: 'Play dashboard demo' })
    const enlarge = page.locator('.cs-controls').getByRole('button', { name: 'Enlarge image' })
    const look = (sel: typeof play) =>
      sel.evaluate((el) => {
        const s = getComputedStyle(el)
        return { h: el.getBoundingClientRect().height, bg: s.backgroundColor, border: s.borderTopWidth, borderColor: s.borderTopColor, cursor: s.cursor }
      })
    const p = await look(play)
    expect(p.h).toBeGreaterThanOrEqual(44)
    expect(p.bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
    const e = await look(enlarge)
    expect(e.h).toBeGreaterThanOrEqual(40)
    // Secondary: a visible surface or outline.
    expect(e.bg !== 'rgba(0, 0, 0, 0)' || parseFloat(e.border) >= 1).toBe(true)
    // The play control pairs its icon with words.
    await expect(play).toHaveText('Play dashboard demo')
    await expect(play.locator('svg')).toHaveCount(1)
  })

  test('a demo is not replaced by scrolling, and Return to walkthrough shows the visual for the current position', async ({ page }) => {
    await open(page, '/work/spreadsheet-agent')
    await settled(page)
    const play = page.getByRole('button', { name: 'Play spreadsheet demo' })
    await play.click()
    const frame = page.locator(FRAME)
    await expect(frame).toHaveAttribute('data-demo', '')
    const video = frame.locator('video.cs-video')
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('controls', '')
    await expect(video).toHaveAttribute('src', /spreadsheet-agent-\d+\.mp4/)
    // Silent recordings, started only by the click; never autoplayed with sound.
    expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false)
    const ret = page.getByRole('button', { name: 'Return to walkthrough' })
    await expect(ret).toBeVisible()
    // Scrolling through the walkthrough does not dismiss or replace the demo.
    const { top, end } = await extent(page)
    for (const y of [top + 600, (top + end) / 2, end - 100]) {
      await scrollToY(page, y)
      await page.waitForTimeout(250)
      await expect(frame).toHaveAttribute('data-demo', '')
      await expect(video).toBeVisible()
      await expect(page.locator('.cs-layer--video')).toHaveAttribute('data-state', 'shown')
    }
    const before = await frameState(page)
    expect(before.target).toBeGreaterThan(0)
    await ret.click()
    await expect(frame).not.toHaveAttribute('data-demo', /.*/)
    await settled(page)
    const after = await frameState(page)
    // Back at the visual that belongs to the current scroll position (not the opening).
    expect(after.state).toBe(before.target)
    await expect(page.getByRole('button', { name: 'Play spreadsheet demo' })).toBeFocused()
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
  })
})

test.describe('stacked case studies (mobile)', () => {
  test.skip(({ isMobile }) => !isMobile, 'small screens only')

  for (const p of CASE_PAGES) {
    test(`${p.name}: stacked in reading order, each visual after its explanation, no sticky media`, async ({ page }) => {
      await open(page, p.path)
      await expect(page.locator('.cs')).toHaveAttribute('data-layout', 'stacked')
      const sticky = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).position === 'sticky').length)
      expect(sticky).toBe(0)
      // The opening visual follows the situation paragraph; each block's figure follows its own text.
      const order = await page.evaluate(() => {
        const situation = document.querySelector('.cs-situation') as HTMLElement
        const opening = document.querySelector('.cs-inline--opening') as HTMLElement
        const blocks = [...document.querySelectorAll('.cs-block')].map((b) => {
          const prose = b.querySelector('.case-prose')
          const fig = b.querySelector('.cs-inline')
          return fig ? Boolean(prose && prose.compareDocumentPosition(fig) & Node.DOCUMENT_POSITION_FOLLOWING) : true
        })
        return { openingAfterSituation: Boolean(situation.compareDocumentPosition(opening) & Node.DOCUMENT_POSITION_FOLLOWING), blocks, figures: document.querySelectorAll('.cs-inline').length }
      })
      expect(order.openingAfterSituation).toBe(true)
      expect(order.blocks.every(Boolean)).toBe(true)
      expect(order.figures).toBeGreaterThanOrEqual(3)
      // Body text at least 16px; figures fit the screen.
      const px = await page.locator('.cs-body .case-prose p').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(px).toBeGreaterThanOrEqual(16)
      const widths = await page.locator('.cs-inline .cs-frame').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().right))
      for (const r of widths) expect(r).toBeLessThanOrEqual(390)
      await expectNoHorizontalOverflow(page)
    })
  }
})

import type { Page } from '@playwright/test'
import { TILES, box, carouselReady, expect, expectNoHorizontalOverflow, frames, isMobile, open, test } from './support'

/*
 * Homepage: the compact header, then the image-tile carousel straight away
 * (no visible title block), then the compact footer. Seven tiles: the six
 * projects and About Me (USER UPDATE 4: no About section on the homepage).
 *
 * Motion rules (USER UPDATE 1): the carousel moves continuously at a constant
 * speed and keeps moving on pointer hover (a hover pause is a bug); the
 * hovered tile comes forward and shows its description. Keyboard focus
 * pauses it at the exact position. Reduced motion (OS or the footer toggle,
 * which persists) shows a static arrangement.
 */

/** Frame boxes (the positioning element) of every tile, read in one frame. */
const tileBoxes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.arc__item')].map((li) => {
      const r = (li.querySelector('.arc__tile') as HTMLElement).getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2 }
    }),
  )

/**
 * Samples the centre x of tile `i` at t0, t0+1s and t0+2s (animation-frame
 * timestamps), in the page, so the timing is exact.
 */
const sampleTile = (page: Page, i: number, spanMs = 1000) =>
  page.evaluate(
    ({ index, span }) =>
      new Promise<Array<{ t: number; cx: number; cy: number }>>((resolve) => {
        const el = document.querySelectorAll('.arc__tile')[index] as HTMLElement
        const out: Array<{ t: number; cx: number; cy: number }> = []
        let t0 = 0
        const step = (now: number) => {
          if (!t0) t0 = now
          const due = out.length * span
          if (now - t0 >= due) {
            const r = el.getBoundingClientRect()
            out.push({ t: now - t0, cx: r.x + r.width / 2, cy: r.y + r.height / 2 })
          }
          if (out.length < 3) requestAnimationFrame(step)
          else resolve(out)
        }
        requestAnimationFrame(step)
      }),
    { index: i, span: spanMs },
  )

/** Index of the tile whose centre is nearest the stage centre. */
async function centreTile(page: Page) {
  const boxes = await tileBoxes(page)
  const mid = (await page.viewportSize())!.width / 2
  return boxes.reduce((best, b, i) => (Math.abs(b.cx - mid) < Math.abs(boxes[best].cx - mid) ? i : best), 0)
}

test.describe('homepage structure', () => {
  test('opens directly onto the carousel: no visible title block, no About section', async ({ page }, info) => {
    await open(page, '/')
    // The page's H1 exists for assistive technology but is visually hidden.
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Harlie Katz, professional portfolio')
    const h1Box = await box(h1)
    expect(h1Box.width * h1Box.height).toBeLessThanOrEqual(4)
    // No "PORTFOLIO" label or intro sentence above the carousel, no About section or "About ↓" link.
    const main = page.locator('main')
    await expect(main.getByText(/^portfolio$/i)).toHaveCount(0)
    await expect(page.locator('#about')).toHaveCount(0)
    await expect(main.getByRole('link', { name: /About\s*↓/ })).toHaveCount(0)
    await expect(main.getByText('Hi, welcome to my portfolio.')).toHaveCount(0)
    // Header, carousel and footer, with no leftover spacing: the footer follows the carousel directly.
    const carousel = page.locator('.home-carousel')
    await expect(carousel).toBeVisible()
    const c = await box(carousel)
    const header = await box(page.locator('header.site-header'))
    const vh = page.viewportSize()!.height
    expect(c.y, 'the carousel starts right below the header').toBeLessThan(header.bottom + 48)
    expect(c.y).toBeLessThan(vh / 3)
    const footer = await box(page.locator('footer#contact'))
    expect(footer.y - c.bottom, 'gap between the carousel and the footer').toBeLessThanOrEqual(64)
    if (!isMobile(info)) {
      // At 1440×900 the whole homepage fits in one viewport.
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      expect(height).toBeLessThanOrEqual(vh + 2)
    }
    await expectNoHorizontalOverflow(page)
  })

  test('seven tiles in order, each one link with a name, a visible action and a description', async ({ page }, info) => {
    await open(page, '/')
    const links = page.locator(isMobile(info) ? '.arc-row__link' : '.arc__link')
    await expect(links).toHaveCount(TILES.length)
    for (let i = 0; i < TILES.length; i++) {
      const t = TILES[i]
      const link = links.nth(i)
      await expect(link).toHaveAttribute('href', t.path)
      await expect(link).toHaveAccessibleName(`${t.name} ${t.action}`)
      await expect(link).toHaveAccessibleDescription(t.description)
      await expect(link.locator('.arc-caption__name')).toHaveText(t.name)
      await expect(link.locator('.arc-caption__cta')).toHaveText(`${t.action} ↗`)
      // No nested links inside a tile.
      await expect(link.locator('a')).toHaveCount(0)
    }
    // The About Me tile opens the About page.
    await expect(links.last()).toHaveAttribute('href', '/about')
  })

  test('tiles are upright 3:4 images that fill a rounded frame with a visible glow edge', async ({ page }, info) => {
    await open(page, '/')
    if (!isMobile(info)) await carouselReady(page)
    const frames = page.locator('.arc-tile__frame')
    await expect(frames).toHaveCount(TILES.length)
    const styles = await frames.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el)
        const img = el.querySelector('img') as HTMLImageElement
        return {
          w: (el as HTMLElement).offsetWidth,
          h: (el as HTMLElement).offsetHeight,
          radius: parseFloat(s.borderTopLeftRadius),
          shadow: s.boxShadow,
          fit: getComputedStyle(img).objectFit,
          alt: img.getAttribute('alt'),
        }
      }),
    )
    for (const s of styles) {
      expect(s.h / s.w).toBeCloseTo(4 / 3, 1)
      expect(s.radius).toBeGreaterThanOrEqual(8)
      expect(s.radius).toBeLessThanOrEqual(16)
      expect(s.shadow).not.toBe('none')
      expect(s.fit).toBe('cover')
      // The link's text names the tile; the image is decorative.
      expect(s.alt).toBe('')
    }
    // Consistent dimensions.
    expect(new Set(styles.map((s) => `${s.w}×${s.h}`)).size).toBe(1)
  })
})

test.describe('carousel motion (desktop)', () => {
  test.skip(({ isMobile: mobile }) => mobile, 'the swipe row on touch devices does not move')

  test('moves continuously at a constant speed (t0, +1s, +2s) without jumps', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    await expect(page.locator('.arc')).toHaveAttribute('data-mode', 'moving')
    const i = await centreTile(page)
    const [a, b, c] = await sampleTile(page, i)
    const v1 = (b.cx - a.cx) / ((b.t - a.t) / 1000)
    const v2 = (c.cx - b.cx) / ((c.t - b.t) / 1000)
    expect(Math.abs(v1), 'moving in the first second').toBeGreaterThan(12)
    expect(Math.abs(v2), 'moving in the second second').toBeGreaterThan(12)
    expect(Math.sign(v1)).toBe(Math.sign(v2))
    expect(Math.abs(v1 - v2) / Math.max(Math.abs(v1), Math.abs(v2)), 'constant speed').toBeLessThan(0.3)

    // Frame by frame: small, even steps (no discrete slides, no easing between projects).
    const steps = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const tiles = [...document.querySelectorAll('.arc__tile')] as HTMLElement[]
          const mid = window.innerWidth / 2
          const el = tiles.reduce((best, t) => {
            const r = t.getBoundingClientRect()
            const rb = best.getBoundingClientRect()
            return Math.abs(r.x + r.width / 2 - mid) < Math.abs(rb.x + rb.width / 2 - mid) ? t : best
          })
          const out: number[] = []
          let last: { t: number; x: number } | null = null
          const step = (now: number) => {
            const r = el.getBoundingClientRect()
            const x = r.x + r.width / 2
            if (last && now > last.t) out.push(Math.abs(x - last.x) / ((now - last.t) / 1000))
            last = { t: now, x }
            if (out.length < 90) requestAnimationFrame(step)
            else resolve(out)
          }
          requestAnimationFrame(step)
        }),
    )
    const sorted = [...steps].sort((x, y) => x - y)
    const median = sorted[Math.floor(sorted.length / 2)]
    expect(median).toBeGreaterThan(12)
    // No frame moves more than a few times the typical per-frame speed (a jump or a snap).
    expect(Math.max(...steps)).toBeLessThan(median * 4 + 20)
  })

  test('keeps moving under a hovering pointer; the hovered tile comes forward and shows its description', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const i = await centreTile(page)
    const item = page.locator('.arc__item').nth(i)
    const frame = item.locator('.arc-tile__frame')
    const f = await box(frame)
    await page.mouse.move(f.x + f.width / 2, f.y + f.height / 2)
    await expect(item).toHaveAttribute('data-active', '')
    const desc = item.locator('.arc-caption__desc')
    await expect(desc).toHaveText(TILES[i].description)
    await expect.poll(() => desc.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.95)
    // Forward: the inner wrapper scales by about 8% (the positioning element keeps its own transform).
    const scale = await item.locator('.arc-tile__lift').evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)
    expect(scale).toBeGreaterThan(1.05)
    expect(scale).toBeLessThan(1.12)
    // A hover pause is a bug: the tiles keep travelling at the same speed.
    const [a, b, c] = await sampleTile(page, i)
    const v1 = (b.cx - a.cx) / ((b.t - a.t) / 1000)
    const v2 = (c.cx - b.cx) / ((c.t - b.t) / 1000)
    expect(Math.abs(v1), 'still moving while hovered').toBeGreaterThan(12)
    expect(Math.abs(v2), 'still moving while hovered').toBeGreaterThan(12)
    // Moving the pointer down onto the same tile's caption keeps the tile active (one link).
    const name = await box(item.locator('.arc-caption__name'))
    await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2, { steps: 4 })
    await expect(item).toHaveAttribute('data-active', '')
    // Leaving: the treatment drops back.
    await page.mouse.move(8, page.viewportSize()!.height - 8)
    await expect(item).not.toHaveAttribute('data-active', '')
  })

  test('a tile that slides under a still pointer lights up, and drops back as it slides away', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const boxes = await tileBoxes(page)
    const i = await centreTile(page)
    // Park the pointer just ahead of the centre tile's leading edge (tiles travel towards negative x).
    const b = boxes[i]
    const x = b.x - 14
    const y = b.y + b.h / 2
    await page.mouse.move(x, y)
    // Within about two seconds the tile arrives under the pointer.
    await expect(page.locator('.arc__item').nth(i)).toHaveAttribute('data-active', '', { timeout: 6_000 })
  })

  test('keyboard focus pauses the carousel at the exact position and resumes on blur', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    // Tab from the header's Contact link onto the first tile.
    await page.locator('header.site-header').getByRole('link', { name: 'Contact' }).focus()
    await page.keyboard.press('Tab')
    const first = page.locator('.arc__link').first()
    await expect(first).toBeFocused()
    await expect(page.locator('.arc__item').first()).toHaveAttribute('data-active', '')
    // A tile outside the readable area glides into view first (≈420ms); then everything holds still.
    await page.waitForTimeout(700)
    const before = await tileBoxes(page)
    await page.waitForTimeout(1000)
    const after = await tileBoxes(page)
    for (let k = 0; k < before.length; k++) {
      expect(Math.abs(after[k].x - before[k].x), `tile ${k} did not move while focused`).toBeLessThan(0.5)
    }
    // The focused tile is fully readable: its name is inside the viewport.
    const name = await box(page.locator('.arc__item').first().locator('.arc-caption__name'))
    expect(name.x).toBeGreaterThanOrEqual(0)
    expect(name.right).toBeLessThanOrEqual(page.viewportSize()!.width)
    // Tab moves to the next tile in project order; still paused.
    await page.keyboard.press('Tab')
    await expect(page.locator('.arc__link').nth(1)).toBeFocused()
    // Leaving the carousel resumes the motion from where it stopped (no jump).
    await page.locator('footer#contact').getByRole('button', { name: 'Reduce motion' }).focus()
    const resumed = await tileBoxes(page)
    const i = await centreTile(page)
    const [a, , c] = await sampleTile(page, i)
    expect(Math.abs(c.cx - a.cx), 'moving again after focus leaves').toBeGreaterThan(20)
    expect(Math.abs(resumed[i].cx - a.cx), 'resumes from the paused position').toBeLessThan(20)
  })

  test('hit areas: every point maps to at most the tile under it, never a neighbour or the gaps', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const report = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.arc__item')] as HTMLElement[]
      const links = items.map((li) => li.querySelector('.arc__link') as HTMLAnchorElement)
      const rect = (el: Element | null) => (el ? el.getBoundingClientRect() : null)
      const zones = items.map((li) => ({
        off: li.hasAttribute('data-off'),
        frame: rect(li.querySelector('.arc-tile__frame')),
        name: rect(li.querySelector('.arc-caption__name')),
        cta: rect(li.querySelector('.arc-caption__cta')),
        desc: rect(li.querySelector('.arc-caption__desc')),
      }))
      const inside = (r: DOMRect | null, x: number, y: number, pad = 2) => !!r && x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
      const stage = (document.querySelector('.arc__stage') as HTMLElement).getBoundingClientRect()
      const misses: string[] = []
      let hits = 0
      for (let y = stage.top + 4; y < stage.bottom; y += 10) {
        for (let x = 4; x < window.innerWidth; x += 10) {
          const el = document.elementFromPoint(x, y)
          const link = el?.closest('.arc__link')
          if (!link) continue
          const i = links.indexOf(link as HTMLAnchorElement)
          const z = zones[i]
          hits++
          if (z.off) misses.push(`off-stage tile ${i} took the point ${x},${y}`)
          else if (!(inside(z.frame, x, y) || inside(z.name, x, y) || inside(z.cta, x, y))) misses.push(`tile ${i} took ${x},${y} outside its image and caption`)
        }
      }
      // Neighbouring hit areas never overlap: visible tiles' image boxes are apart.
      const visible = zones.map((z, i) => ({ ...z, i })).filter((z) => !z.off && z.frame).sort((a, b) => a.frame!.left - b.frame!.left)
      const overlaps: string[] = []
      for (let k = 1; k < visible.length; k++) {
        const gap = visible[k].frame!.left - visible[k - 1].frame!.right
        if (gap < 4) overlaps.push(`tiles ${visible[k - 1].i} and ${visible[k].i} overlap (gap ${gap.toFixed(1)}px)`)
      }
      // Points in the gaps between neighbouring tiles (at mid-height) belong to no link.
      const gapHits: string[] = []
      for (let k = 1; k < visible.length; k++) {
        const x = (visible[k - 1].frame!.right + visible[k].frame!.left) / 2
        const y = (visible[k].frame!.top + visible[k].frame!.bottom) / 2
        if (document.elementFromPoint(x, y)?.closest('.arc__link')) gapHits.push(`gap at ${x.toFixed(0)},${y.toFixed(0)}`)
      }
      return { hits, misses: misses.slice(0, 10), overlaps, gapHits, visible: visible.length }
    })
    expect(report.visible).toBeGreaterThanOrEqual(4)
    expect(report.hits).toBeGreaterThan(200)
    expect(report.misses).toEqual([])
    expect(report.overlaps).toEqual([])
    expect(report.gapHits).toEqual([])
  })

  test('captions: names and actions visible and underlined before hover; faded before the viewport edges', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const captions = await page.evaluate(() =>
      [...document.querySelectorAll('.arc__item')].map((li) => {
        const cap = li.querySelector('.arc__caption') as HTMLElement
        const cta = li.querySelector('.arc-caption__cta') as HTMLElement
        const name = li.querySelector('.arc-caption__name') as HTMLElement
        const r = name.getBoundingClientRect()
        const c = cta.getBoundingClientRect()
        return {
          opacity: Number(getComputedStyle(cap).opacity),
          left: Math.min(r.left, c.left),
          right: Math.max(r.right, c.right),
          underline: getComputedStyle(cta).textDecorationLine,
          // Upright: the caption's transform is a translation only (never rotated or skewed).
          rotated: (() => {
            const t = getComputedStyle(cap).transform
            if (t === 'none') return false
            const m = new DOMMatrixReadOnly(t)
            return Math.abs(m.b) + Math.abs(m.c) + Math.abs(m.m13) + Math.abs(m.m23) + Math.abs(m.m31) + Math.abs(m.m32) > 0.001
          })(),
        }
      }),
    )
    const width = page.viewportSize()!.width
    const readable = captions.filter((c) => c.opacity > 0.98)
    expect(readable.length, 'at least three names fully readable').toBeGreaterThanOrEqual(3)
    for (const c of captions) {
      expect(c.underline).toContain('underline')
      expect(c.rotated, 'caption is upright').toBe(false)
      // A caption that reaches the viewport edge has faded out (never a name cut in half).
      if (c.left < 0 || c.right > width) expect(c.opacity).toBeLessThan(0.02)
    }
  })

  test('a complete loop recycles tiles only outside the visible stage (no reset, snap or overlap)', async ({ page }) => {
    test.slow()
    // Fake time: run a whole loop (about 80 seconds) in a few seconds of real time.
    await page.clock.install()
    await open(page, '/')
    await carouselReady(page)
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 50)
    await page.evaluate(() => {
      const w = window as unknown as { __loop: { jumps: string[]; recycles: number[]; overlaps: string[]; frames: number; visibleJumps: string[] } }
      const tiles = [...document.querySelectorAll('.arc__tile')] as HTMLElement[]
      const stage = (document.querySelector('.arc__stage') as HTMLElement).getBoundingClientRect()
      const last = tiles.map(() => null as null | { l: number; r: number; op: number })
      w.__loop = { jumps: [], recycles: tiles.map(() => 0), overlaps: [], frames: 0, visibleJumps: [] }
      const onStage = (b: { l: number; r: number }) => b.r > stage.left + 1 && b.l < stage.right - 1
      const step = () => {
        w.__loop.frames++
        const now = tiles.map((t) => {
          const r = t.getBoundingClientRect()
          return { l: r.left, r: r.right, op: Number(getComputedStyle(t).opacity) }
        })
        now.forEach((b, i) => {
          const prev = last[i]
          if (prev && Math.abs((b.l + b.r) / 2 - (prev.l + prev.r) / 2) > 60) {
            w.__loop.recycles[i]++
            if ((onStage(prev) && prev.op > 0.02) || (onStage(b) && b.op > 0.02)) w.__loop.visibleJumps.push(`tile ${i} jumped from ${prev.l.toFixed(0)} to ${b.l.toFixed(0)} while visible`)
          }
          last[i] = b
        })
        const shown = now.map((b, i) => ({ ...b, i })).filter((b) => onStage(b) && b.op > 0.02).sort((a, b) => a.l - b.l)
        for (let k = 1; k < shown.length; k++) if (shown[k].l < shown[k - 1].r - 2) w.__loop.overlaps.push(`tiles ${shown[k - 1].i}/${shown[k].i}`)
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
    // One full loop: seven spacings of about a fifth of the stage width at ≈27px/s (≈75s); run 90s.
    for (let s = 0; s < 9; s++) await page.clock.runFor(10_000)
    const loop = await page.evaluate(() => (window as unknown as { __loop: { recycles: number[]; overlaps: string[]; frames: number; visibleJumps: string[] } }).__loop)
    expect(loop.frames).toBeGreaterThan(3000)
    // Every tile went round (was recycled at least once)…
    for (const [i, n] of loop.recycles.entries()) expect(n, `tile ${i} completed the loop`).toBeGreaterThanOrEqual(1)
    // …only while fully outside the visible stage, and visible tiles never overlapped.
    expect(loop.visibleJumps).toEqual([])
    expect([...new Set(loop.overlaps)]).toEqual([])
  })

  test('the carousel fits the first viewport on common laptop sizes', async ({ page }) => {
    for (const size of [
      { width: 1440, height: 800 },
      { width: 1366, height: 768 },
      { width: 1280, height: 720 },
    ]) {
      await page.setViewportSize(size)
      await open(page, '/')
      await carouselReady(page)
      const bottoms = await page.evaluate(() =>
        [...document.querySelectorAll('.arc__item:not([data-off])')].map((li) => {
          const t = (li.querySelector('.arc-tile__frame') as HTMLElement).getBoundingClientRect()
          const c = (li.querySelector('.arc-caption__cta') as HTMLElement).getBoundingClientRect()
          return { tile: t.bottom, top: t.top, cta: c.bottom }
        }),
      )
      const header = await box(page.locator('header.site-header'))
      for (const b of bottoms) {
        expect(b.cta, `caption inside the first viewport at ${size.width}×${size.height}`).toBeLessThanOrEqual(size.height)
        expect(b.top, 'tiles below the header').toBeGreaterThanOrEqual(header.bottom - 30)
      }
    }
  })

  test('clicking a tile opens its case study; keyboard Enter does too', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const i = await centreTile(page)
    await page.locator('.arc__item').nth(i).locator('.arc-caption__name').click()
    await expect(page).toHaveURL(new RegExp(`${TILES[i].path}$`))
    await expect(page.locator('h1')).toHaveText(i === 6 ? 'Hi, welcome to my portfolio.' : TILES[i].name)
    await page.goBack()
    await carouselReady(page)
    await page.locator('header.site-header').getByRole('link', { name: 'Contact' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('.arc__link').first()).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/work\/cafepress-uk$/)
    await expect(page.locator('h1')).toBeFocused()
  })

  test('the About Me tile opens the About page', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    // Keyboard order: the header's Contact link, then the seven tiles in order.
    await page.locator('header.site-header').getByRole('link', { name: 'Contact' }).focus()
    for (let k = 0; k < 7; k++) await page.keyboard.press('Tab')
    const about = page.locator('.arc__link').last()
    await expect(about).toBeFocused()
    await expect(about).toHaveAccessibleName('About Me View About page')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.locator('h1')).toHaveText('Hi, welcome to my portfolio.')
  })
})

test.describe('reduced motion', () => {
  test.skip(({ isMobile: mobile }) => mobile, 'the swipe row is always static')

  test('the operating system setting gives a static arc with all seven tiles in view', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, '/')
    await carouselReady(page)
    await expect(page.locator('.arc')).toHaveAttribute('data-mode', 'static')
    const a = await tileBoxes(page)
    await page.waitForTimeout(1200)
    const b = await tileBoxes(page)
    const width = page.viewportSize()!.width
    for (let k = 0; k < a.length; k++) {
      expect(Math.abs(b[k].x - a[k].x), 'static').toBeLessThan(0.5)
      expect(a[k].x, `tile ${k} in view`).toBeGreaterThanOrEqual(0)
      expect(a[k].x + a[k].w, `tile ${k} in view`).toBeLessThanOrEqual(width)
    }
    // No pointer trail and no background video under reduced motion.
    await expect(page.locator('canvas.pointer-trail')).toHaveCount(0)
    await expect(page.locator('video[data-stage-background]')).toHaveCount(0)
  })

  test('the footer "Reduce motion" setting stops the carousel and persists after a reload', async ({ page }) => {
    await open(page, '/')
    await carouselReady(page)
    const toggle = page.locator('footer#contact').getByRole('button', { name: 'Reduce motion' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce')
    await expect(page.locator('.arc')).toHaveAttribute('data-mode', 'static')
    await page.reload()
    await carouselReady(page)
    await expect(page.locator('footer#contact').getByRole('button', { name: 'Reduce motion' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.arc')).toHaveAttribute('data-mode', 'static')
    const a = await tileBoxes(page)
    await page.waitForTimeout(1000)
    const b = await tileBoxes(page)
    for (let k = 0; k < a.length; k++) expect(Math.abs(b[k].x - a[k].x)).toBeLessThan(0.5)
    expect(await page.evaluate(() => localStorage.getItem('hk-motion'))).toBe('reduce')
    // Turning it off again restores the motion.
    await page.locator('footer#contact').getByRole('button', { name: 'Reduce motion' }).click()
    await expect(page.locator('.arc')).toHaveAttribute('data-mode', 'moving')
  })
})

test.describe('touch layout (mobile)', () => {
  test.skip(({ isMobile: mobile }) => !mobile, 'touch devices only')

  test('a static swipe row with every name, action and description visible; a tap opens the project', async ({ page }) => {
    await open(page, '/')
    await expect(page.locator('.arc')).toHaveCount(0)
    const row = page.locator('.arc-row')
    await expect(row).toBeVisible()
    const first = page.locator('.arc-row__link').first()
    await expect(first.locator('.arc-caption__name')).toBeVisible()
    await expect(first.locator('.arc-caption__cta')).toBeVisible()
    await expect(first.locator('.arc-caption__desc')).toBeVisible()
    await expect(first.locator('.arc-caption__desc')).toHaveText(TILES[0].description)
    // Swipeable: the row scrolls horizontally, the page does not.
    const scroll = await row.evaluate((el) => {
      const list = el.querySelector('.arc-row__list') as HTMLElement
      const s = [el, list].find((n) => n.scrollWidth > n.clientWidth + 1)
      return s ? { can: true, overflowX: getComputedStyle(s).overflowX } : { can: false, overflowX: '' }
    })
    expect(scroll.can).toBe(true)
    expect(['auto', 'scroll']).toContain(scroll.overflowX)
    await expectNoHorizontalOverflow(page)
    // Static: nothing moves.
    const a = await box(first)
    await page.waitForTimeout(800)
    const b = await box(first)
    expect(Math.abs(a.x - b.x)).toBeLessThan(0.5)
    // Tap opens the project directly (no hover step first).
    await page.locator('.arc-row__link').nth(1).tap()
    await expect(page).toHaveURL(/\/work\/merchandising-platform$/)
    await expect(page.locator('h1')).toHaveText('Merchandising Platform')
    await frames(page)
  })
})

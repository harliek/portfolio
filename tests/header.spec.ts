import { PROJECTS, box, expect, expectUncovered, frames, open, test } from './support'

/*
 * Header: one two-line home link ("Harlie Katz" / "Professional portfolio"),
 * then Work, About and Contact. No Resume, Art or Film in the primary
 * navigation. Work opens a compact shelf of the six projects (desktop) that
 * works with click, keyboard and Escape; small screens get an accessible
 * menu.
 */

test.describe('header', () => {
  test('one home link, then Work, About and Contact only', async ({ page }, info) => {
    await open(page, '/work/spreadsheet-agent')
    const header = page.locator('header.site-header')
    const home = header.getByRole('link', { name: /Harlie Katz\s*Professional portfolio/ })
    await expect(home).toHaveAttribute('href', '/')
    await expect(home.locator('.site-brand__name')).toHaveText('Harlie Katz')
    await expect(home.locator('.site-brand__role')).toHaveText('Professional portfolio')
    const size = await home.locator('.site-brand__name').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const sub = await home.locator('.site-brand__role').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    if (info.project.name !== 'mobile') {
      expect(size).toBeGreaterThanOrEqual(20)
      expect(size).toBeLessThanOrEqual(24)
      expect(sub).toBeGreaterThanOrEqual(12)
      expect(sub).toBeLessThanOrEqual(14)
    }
    // Nothing for Resume, Art or Film in the header.
    for (const name of [/resum|résumé/i, /^art$/i, /^film$/i]) {
      await expect(header.getByRole('link', { name })).toHaveCount(0)
      await expect(header.getByRole('button', { name })).toHaveCount(0)
    }
    // Compact.
    const h = await box(header)
    expect(h.height).toBeLessThanOrEqual(80)
    await home.click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('Work shelf (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop header only')

  test('Work opens the six projects in order; click, Escape and outside click', async ({ page }) => {
    await open(page, '/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('button', { name: 'Work' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
    const work = nav.getByRole('button', { name: 'Work' })
    const shelf = page.locator('#work-shelf')
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    await expect(work).toHaveAttribute('aria-controls', 'work-shelf')
    await expect(shelf).not.toBeVisible()

    await work.click()
    await expect(work).toHaveAttribute('aria-expanded', 'true')
    await expect(shelf).toBeVisible()
    const links = shelf.getByRole('link')
    await expect(links).toHaveCount(6)
    for (const [i, p] of PROJECTS.entries()) {
      await expect(links.nth(i)).toHaveAttribute('href', p.path)
      await expect(links.nth(i)).toContainText(p.name)
      // Visibly actionable before hover.
      await expect(links.nth(i)).toContainText('View case study ↗')
      await expect(links.nth(i)).toBeVisible()
    }
    // Mouse opening leaves focus on Work; Escape closes and keeps focus there.
    await expect(work).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    await expect(shelf).not.toBeVisible()
    await expect(work).toBeFocused()

    // Click toggles.
    await work.click()
    await expect(work).toHaveAttribute('aria-expanded', 'true')
    await work.click()
    await expect(work).toHaveAttribute('aria-expanded', 'false')

    // A click outside closes it.
    await work.click()
    await expect(shelf).toBeVisible()
    await page.mouse.click(700, 840)
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    await expect(shelf).not.toBeVisible()
  })

  test('keyboard: Enter opens and focuses the first project, arrows move, Escape returns to Work', async ({ page }) => {
    await open(page, '/')
    const work = page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Work' })
    await work.focus()
    await page.keyboard.press('Enter')
    await expect(work).toHaveAttribute('aria-expanded', 'true')
    const links = page.locator('#work-shelf').getByRole('link')
    await expect(links.first()).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(links.nth(1)).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(links.nth(2)).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(links.nth(1)).toBeFocused()
    await page.keyboard.press('End')
    await expect(links.nth(5)).toBeFocused()
    // Tab works as usual inside the shelf.
    await page.keyboard.press('Shift+Tab')
    await expect(links.nth(4)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    await expect(work).toBeFocused()
    // Enter on a project navigates; the shelf closes and the new heading is visible, not covered.
    await page.keyboard.press('Enter')
    await expect(links.first()).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/work\/merchandising-platform$/)
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Merchandising Platform')
    await expect(h1).toBeInViewport()
    await frames(page)
    await expectUncovered(h1)
  })

  test('following a shelf link closes the shelf and marks the current project', async ({ page }) => {
    await open(page, '/about')
    const work = page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Work' })
    await work.click()
    await page.locator('#work-shelf').getByRole('link', { name: /Client Work/ }).click()
    await expect(page).toHaveURL(/\/work\/shift$/)
    await expect(work).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#work-shelf')).not.toBeVisible()
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Client Work')
    await expect(h1).toBeInViewport()
    await expectUncovered(h1)
    await work.click()
    await expect(page.locator('#work-shelf').getByRole('link', { name: /Client Work/ })).toHaveAttribute('aria-current', 'page')
  })

  test('About opens the About page; Contact reaches the footer contact area', async ({ page }) => {
    await open(page, '/work/valiance')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: 'Contact' }).click()
    const contact = page.locator('footer#contact')
    await expect(contact.getByRole('heading', { name: 'Contact' })).toBeInViewport()
    await nav.getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.locator('h1')).toHaveText('Hi, welcome to my portfolio.')
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'small screens only')

  test('an accessible menu: six projects in two columns, About, Contact; focus stays inside; Escape closes', async ({ page }) => {
    await open(page, '/')
    const menu = page.getByRole('button', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('navigation', { name: 'Primary' })).not.toBeVisible()
    await menu.click()
    const toggle = page.locator('button.menu-button')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator('#site-menu')
    await expect(panel).toBeVisible()
    const projects = panel.locator('.site-menu__work').getByRole('link')
    await expect(projects).toHaveCount(6)
    for (const [i, p] of PROJECTS.entries()) await expect(projects.nth(i)).toHaveAttribute('href', p.path)
    // Two columns.
    const xs = new Set(await projects.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left))))
    expect(xs.size).toBe(2)
    await expect(panel.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    await expect(panel.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
    // The page behind is locked.
    await expect(page.locator('html')).toHaveClass(/is-menu-open/)
    // Tab cycles within the header.
    for (let k = 0; k < 14; k++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('header.site-header')))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
    await expect(page.locator('html')).not.toHaveClass(/is-menu-open/)
  })

  test('a menu link navigates and closes the menu; Contact scrolls to the footer', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.locator('#site-menu').getByRole('link', { name: /AI Leasing Agent/ }).click()
    await expect(page).toHaveURL(/\/work\/valiance$/)
    await expect(page.locator('button.menu-button')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('h1')).toHaveText('AI Leasing Agent')
    await expect(page.locator('h1')).toBeInViewport()
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.locator('#site-menu').getByRole('link', { name: 'Contact' }).click()
    await expect(page.locator('footer#contact').getByRole('heading', { name: 'Contact' })).toBeInViewport()
    await page.getByRole('button', { name: 'Menu' }).click()
    await page.locator('#site-menu').getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL(/\/about$/)
  })
})

test.describe('footer: the single contact area', () => {
  test('email, LinkedIn, résumé and the motion setting, once per page', async ({ page }) => {
    await open(page, '/about')
    const footer = page.locator('footer#contact')
    await expect(footer.getByRole('link', { name: 'harliekatz@berkeley.edu' })).toHaveAttribute('href', 'mailto:harliekatz@berkeley.edu')
    await expect(footer.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', /linkedin\.com\/in\/harliekatz/)
    const resume = footer.getByRole('link', { name: /View résumé/ })
    await expect(resume).toHaveAttribute('href', '/resume/harlie-katz-resume.pdf')
    await expect(resume).toHaveAttribute('target', '_blank')
    await expect(footer.getByRole('button', { name: 'Reduce motion' })).toHaveAttribute('aria-pressed', /true|false/)
    // Email and LinkedIn appear once on the page (no second contact block in About).
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1)
    await expect(page.locator('a[href*="linkedin.com"]')).toHaveCount(1)
    // The résumé PDF exists.
    const res = await page.request.get('/resume/harlie-katz-resume.pdf')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('pdf')
  })
})

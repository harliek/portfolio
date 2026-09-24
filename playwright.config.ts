import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end checks run against the PRODUCTION build served by `vite preview`
 * on port 4173 (the same SPA fallback a static host needs), not the dev
 * server. An already running preview is reused; stop it and rebuild after
 * changing the app (see README, Tests).
 *
 * Projects
 * - desktop  1440×900, bundled Chromium, fine pointer.
 * - mobile   Pixel 7 (390×844, touch, coarse pointer).
 * - media    1440×900 in the installed Google Chrome (`channel: 'chrome'`),
 *            which decodes the site's H.264 recordings and films; only
 *            tests/media.spec.ts. Playwright's bundled Chromium cannot.
 * - screens  review screenshots (tests tagged @screens, no assertions),
 *            written to tests/screenshots/ (git-ignored).
 */
const assertions = { grepInvert: /@screens/, testIgnore: /media\.spec\.ts/ }

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', ...assertions, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', ...assertions, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    {
      name: 'media',
      testMatch: /media\.spec\.ts/,
      grepInvert: /@screens/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'screens',
      testMatch: /screens\.spec\.ts/,
      grep: /@screens/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
})

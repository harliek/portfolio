# Build log

Concise record of decisions, significant fixes, tests actually run, and open limitations.

## Initial state (2026-09-23)

- Directory: `/Users/harliekatz/Desktop/portfolio final`.
- Contents at start: source folders only (`PlanetArt/`, `Valiance Capital/`, `JumpStart Finance/`, `Shift Content/`, `personal assets/`, `inspiration/`, `design:portfolio rules/`). No `package.json`, no application source, no Git repository.
- Git: absent. Initialized a new repository on `main`; no remote added.
- Originals fingerprinted with SHA-1 (38 files) before any work, so their integrity can be re-verified at handoff.
- Environment: Node 24.11.0 (satisfies `>=22.12`), npm 11.6.1, ffmpeg with libx264, poppler (`pdftoppm`, `pdfimages`, `pdftotext`). No speech-recognition tool installed.

## Phase 1 — Audit and foundation

- Read `DESIGN_RULES.md` and reconciled it per the brief (dark theme, no scroll-scrubbed intro, no word reveals, no default blur, strategic project order).
- Scaffold: generated the official `create-vite` `react-ts` template in a scratch directory and copied its `tsconfig*.json`. The template now ships oxlint; replaced with ESLint + typescript-eslint as the brief allows.
- **TypeScript version:** registry `latest` is 7.0.2, but `typescript-eslint@8.70.1` declares `typescript >=4.8.4 <6.1.0`. Installed **6.0.3**, the nearest compatible stable release (the official Vite template also pins `~6.0.2`).
- Installed exact versions: react 19.3.0, react-dom 19.3.0, react-router-dom 7.18.4, gsap 3.15.0, vite 8.3.0, @vitejs/plugin-react 6.1.1, typescript 6.0.3, eslint 10.11.0, typescript-eslint 8.70.1, eslint-plugin-react-hooks 7.1.1, @playwright/test 1.63.0, @axe-core/playwright 4.13.0, sharp 0.35.4. No peer-dependency warnings.
- Font: Inter 4.1 `InterVariable.woff2` from the official rsms/inter GitHub release, license copied to `public/fonts/Inter-LICENSE.txt`.
- Media pipeline `scripts/prepare-media.mjs` (ffmpeg, poppler, sharp, Playwright for typographic compositions). Outputs to `public/media/`; intermediates to ignored `.media-cache/`.
  - Chromium blocks `file://` loads from `about:blank`, which left two covers blank on the first run. Fixed by inlining images and the font as data URIs.
  - The Jumpstart phone PNGs have an opaque white or pale-green matte. The fix removes only the matte (a flood fill from the border, stopped by the black bezel); screen content is untouched.
  - The Merch Console poster uses 8.5s instead of 10.3s so the cursor sits in empty space.
  - Every Aristocracy frame between 29.8s and 43.8s carries a burned-in subtitle. The 16:10 cover crops above it; the 4:3 player poster (43.8s) keeps it, because the film is never cropped.
- Routing: `createBrowserRouter` with lazy case-study/About chunks, `ScrollRestoration`, focus-to-H1 after client navigation.
- Checks run: `tsc -b` ✓, `eslint .` ✓, `vite build` ✓; Playwright smoke test of all 8 routes on the production preview — titles and H1s correct, no console errors, no failed requests.

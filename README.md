# Harlie Katz — portfolio

A static React site with a spatial homepage, five case studies, and an About page. It is built with Vite, React 19, TypeScript, plain CSS custom properties, GSAP (core, ScrollTrigger, Flip) and React Router.

## Requirements

- **Node 22.12 or newer** (see `.nvmrc`). Development used Node 24.11.
- npm 10+.
- To regenerate media only: `ffmpeg` with libx264, poppler (`pdftoppm`, `pdfimages`), and the original source folders in the project root. Built media is already committed under `public/media/`, so ordinary development does not need these.

## Run locally

```bash
nvm use            # or any Node >= 22.12
npm ci
npm run dev        # http://localhost:5173
```

## Build and preview the production site

```bash
npm run build      # type-checks (tsc -b), then builds to dist/
npm run preview    # serves dist/ at http://localhost:4173 with SPA fallback
```

`npm run check` runs typecheck, lint and build together.

## Tests

End-to-end tests run against the production build (Playwright starts `npm run build && npm run preview` automatically):

```bash
npx playwright install chromium   # first time only
npm run test:e2e                  # functional, content and axe accessibility checks
npx playwright test --grep @screens   # writes review screenshots to tests/screenshots/
```

Media playback tests use the locally installed Google Chrome (`channel: 'chrome'`), because Playwright's bundled Chromium cannot decode H.264. When Chrome is missing, those assertions are skipped with an annotation.

## Project structure

```
src/
  content/      projects.ts (shared navigation data), media.ts (provenance manifest),
                site.ts (identity and verified links), transcripts.tsx
  config/       motion.ts (GSAP values), carousel.ts (spatial arc geometry)
  components/   layout/, work/ (carousel, snap rail, index), case-study/, media/, diagrams/
  pages/        Home, About, NotFound, work/<case study>
  hooks/        reduced motion, media playback policy, page meta, reveal
  styles/       tokens, base, layout, components, work, case-studies, pages/<page>.css
scripts/prepare-media.mjs   reproducible media pipeline (originals → public/media)
docs/                       build log, asset audit, content provenance, transcripts, QA report
tests/                      Playwright specs
```

Original source materials (`PlanetArt/`, `Valiance Capital/`, `JumpStart Finance/`, `Shift Content/`, `personal assets/`, `inspiration/`) stay where they are. Git ignores them, and the site never serves them. Only the optimized derivatives in `public/media/` and the résumé in `public/resume/` are public.

### Regenerating media

```bash
npm run media                          # everything
node scripts/prepare-media.mjs video   # videos only (skips existing files; FORCE=1 to redo)
node scripts/prepare-media.mjs images  # frames, PDF excerpts, images, covers, social image
```

If you change a derivative's dimensions or widths, update the matching entry in `src/content/media.ts`. Record provenance changes in `docs/asset-audit.md`.

## Deploying (static hosting)

The site is a static single-page app. Deployment has **not** been set up or performed.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **SPA fallback (required):** every unknown path must serve `index.html` with status 200. The client router then renders the right page or the custom 404.
  - Netlify: already configured in `netlify.toml` (and `public/_redirects`).
  - Vercel: add a rewrite of `/(.*)` to `/index.html`.
  - Cloudflare Pages: `_redirects` works as-is.
  - Nginx: `try_files $uri /index.html;`.
- **Caching:**
  - `/assets/*` is content-hashed: `Cache-Control: public, max-age=31536000, immutable`.
  - `/fonts/*` can also be immutable.
  - `/media/*` is not hashed: use a week plus revalidation. Rename files if the content changes.
  - `index.html` should not be cached long.
- **Node version on the host:** 22.12+ (`NODE_VERSION` in `netlify.toml`).

### Setting the final site URL and social metadata

There is no production domain yet, so no canonical URL is declared. Once a domain is chosen:

1. In `index.html`, change `og:image` to an absolute URL (for example `https://example.com/social-preview.jpg`) and add `<meta property="og:url" content="https://example.com/">` plus `<link rel="canonical" href="https://example.com/">`.
2. Page titles and descriptions update on client-side navigation (`usePageMeta`). **Limitation:** crawlers that do not run JavaScript, including most social-card scrapers, only see the defaults in `index.html`. Per-route social previews would need prerendering (for example a small script that writes `dist/work/<slug>/index.html` with route-specific meta). That is not part of this build.

## Documentation

- `docs/build-log.md`: decisions, significant fixes, tests actually run.
- `docs/asset-audit.md`: every public asset, its source, processing and publication notes.
- `docs/content-provenance.md`: sources for each public claim, deliberately excluded claims, unresolved questions.
- `docs/transcripts.md`: how the film transcripts were produced and checked.
- `docs/qa-report.md`: responsive, accessibility, keyboard, reduced-motion and performance results.
- `THIRD_PARTY_NOTICES.md`: licenses. GSAP uses its own Standard “no charge” license, not MIT; Inter uses the SIL OFL.

# Harlie Katz — portfolio

A static React site presented as a persistent “presentation frame”: a dark architectural video set that keeps playing while project evidence is rearranged inside it. It covers a one-viewport homepage (a slow, controllable project carousel plus a direct index), five case studies of four scenes each, Art, Film and About.

## Site map

| Path | Page |
|---|---|
| `/` | Home: identity, the project stage (auto-advancing under strict rules; `← 01 / 05 → Pause`), “Explore work” index (`/#all-projects`), contact line |
| `/work/planetart` · `/work/valiance` · `/work/spreadsheet-agent` · `/work/jumpstart` · `/work/shift` | Case studies: 01 Overview · 02 Insight · 03 Decision · 04 Outcome |
| `/art` | Selected drawings (lazy) |
| `/film` | Featured short film, short films, client and production work (lazy; YouTube loads only after a click, privacy-enhanced) |
| `/about` | About, contact, and a closing sequence of drawings and film (lazy) |
| `*` | Custom 404 |

Navigation: **Work** (menu: the five projects + All work) · **Art** · **Film** · **About** · **Resume ↗**.

It is built with Vite, React 19, TypeScript and React Router. Styling is plain CSS custom properties. GSAP (core, ScrollTrigger, Flip) handles all motion. No Tailwind, Motion or Three.js; see `design:portfolio rules/DESIGN_RULES.md`.

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
  content/      projects.ts (the six work entries, order, labels, routes, next project),
                media.ts (provenance manifest), site.ts (identity and verified links),
                creative.ts (films), slots.ts (empty diagram slots, debug flag), transcripts.tsx,
                pages/<id>.ts(x) (one copy file per page: cafepress-uk, merchandising-platform,
                spreadsheet-agent, ai-leasing-agent, jumpstart-finance, client-work, about, art)
  config/       motion.ts (motion values: shelf, crossfade, highlight, route, trail),
                carousel.ts (concave carousel geometry and speed), stage.ts (background set)
  components/   layout/ (PageShell, Header, WorkShelf, Footer with Reduce motion, StageBackground,
                PointerTrail, RouteFocus), home/ (ConcaveCarousel, SelectedWork),
                case/ (CaseLayout, CaseOpening, CaseSection, StickyVisual, Results, NextProject),
                pages/<id>/ (page-specific parts), transition/ (image continuity), creative/
                (FilmPlayer, CreativeNav), media/ (ResponsiveImage, Figure, VideoFigure, ImageDialog,
                DiagramSlot)
  pages/        Home, About, Art, Film, NotFound, RouteError, work/<Project>.tsx
  hooks/        useMotionPreference (single motion source), media playback policy, page meta, reveal
  styles/       tokens, base, layout, components, stage, home, case, creative, pages/<id>.css
scripts/prepare-media.mjs   reproducible media pipeline (originals → public/media)
docs/                       build log, asset audit, content provenance, transcripts, QA report
tests/                      Playwright specs
```

Original source materials (`PlanetArt/`, `Valiance Capital/`, `JumpStart Finance/`, `Shift Content/`, `personal assets/`, `inspiration/`) stay where they are. Git ignores them, and the site never serves them. Only the optimized derivatives in `public/media/` and the résumé in `public/resume/` are public.

### Regenerating media

```bash
npm run media                          # everything
node scripts/prepare-media.mjs video   # videos only (skips existing files; FORCE=1 to redo)
node scripts/prepare-media.mjs images  # frames, PDF excerpts, images, social image
node scripts/prepare-media.mjs covers  # the six 3:4 cover compositions (needs the images task's cache)
node scripts/prepare-media.mjs creative  # all 23 drawings and the film stills
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
- `docs/site-structure.md`: the site architecture: routes, header and Work shelf, footer and the motion preference, the concave carousel, the shared case-study layout and sticky visual section, route transitions, pointer trail, empty diagram slots and their debug flag, and where each page's files live.
- `docs/media-plan.md`: every image and video, its placement, source and aspect ratio, and what is still needed from Harlie.
- `THIRD_PARTY_NOTICES.md`: licenses. GSAP uses its own Standard “no charge” license, not MIT; Inter uses the SIL OFL.

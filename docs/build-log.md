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

## Phases 2–3: homepage foundation, About, and five case studies (checkpoints `eb6a439`, `75936aa`)

- Built by parallel agents, each owning one page's files and working from exact-copy page briefs. Shared components and tokens were written first so every page reuses them.
- **Shared fixes from agent reports:**
  - Reveals animate opacity only, so unrevealed sections stay focusable.
  - The image dialog fits tall images and hides Previous/Next when there is only one image.
  - Chapter anchors use a single scroll offset.
  - The sticky split layout is opt-in.
  - A `HydrateFallback` was added.
  - The dev watcher ignores `.media-cache`.
- **Media fixes:**
  - The screen recordings are trimmed to 56.3s and 36.4s, before the macOS capture toolbar appears. It first shows at 56.45s and 36.55s, detected by scanning for the toolbar's blue button.
  - Posters no longer repeat hero frames. Spreadsheet Agent uses its 1.5s opening, Aristocracy 30.5s, and Merch Console the 0.3s Overview.
  - Jumpstart phone mattes are removed, including stray corner specks, by keeping only the largest connected component.
  - The Spreadsheet cover crop now starts at x=520, clear of the sidebar button.
- **Transcripts:** all three films. Words follow the burned-in subtitles, cross-checked with faster-whisper speech recognition and forced alignment (see `docs/transcripts.md`). No human listening pass has been done yet.

## Phase 4: spatial carousel and transitions (checkpoint `cede5ce`)

- Built as an implement, review, fix pipeline: one implementer, two independent reviewers (interaction and design/accessibility), and a fixer that reproduced all 19 findings. In parallel, independent auditors checked each case study and the About page (copy, facts, axe, responsive layout, media).
- **Reveals:** switched from ScrollTrigger to IntersectionObserver, which removes ScrollTrigger's permanent animation-frame loop on case pages.
- **Other fixes:**
  - `RouteFocus` is safe under StrictMode.
  - A route `ErrorBoundary` renders inside the page shell.
  - Focus rings are drawn outside light screenshots.
  - The dialog chrome is opaque.
  - Caption separators are real text.

## Redesign: “The Working Model” (brief received 2026-09-23)

- The newer brief supersedes parts of the original: it requires a pinned, scroll-scrubbed opening and a decorative autoplaying background video, and it turns each project into a composition of evidence fragments.
- The background video is the supplied `inspiration/working-model-assets/background video.mp4`:
  - The audio is stripped.
  - Desktop: 1112×834, 0.76 MB. Mobile: a 470×834 portrait crop, 0.25 MB.
  - Each has a frame-0 poster, so the page never flashes black.
- The Shift stage preview is a 6s muted 16:9 crop of the Aristocracy film, cropped above the burned-in subtitles. The stage also uses real film-strip stills and the Spreadsheet Agent “Interpreting request” frame.
- **Not used:**
  - `tiles-v2` and `tiles-v3-concept` (AI-generated covers with invented interfaces).
  - `planetart tile final.jpeg` (invented vendor names).
  - The stage PNGs. The video is the room instead.
- **Positioning line:** refined to “Turning complex ideas into clear product systems.”, pending Harlie's confirmation (question Q13).

## Library adoption (client decision, 2026-09-23)

- **Research:** a research agent covered 16 sources, installed and ran the Lightswind slider, and measured bundle sizes.
- **Client choice:** selective adoption, with the 3D image slider as the homepage project stage.
- **Installed exact versions:** motion 13.4.2, clsx 2.1.1, tailwind-merge 3.7.0, tailwindcss 4.3.3 and @tailwindcss/vite 4.3.3.
- **Tailwind setup:** utilities only, prefixed `tw:`, no preflight reset, and only `src/components/ui/` scanned. A test compile confirmed this.
- **Import alias:** `@/` is configured through `paths` only. TypeScript 6 rejects `baseUrl` with error TS5101.
- **Not run:** `shadcn init` and `lightswind init`, because both rewrite global CSS and config.
- **Not installed:** Three.js.
- **`DESIGN_RULES.md`:** amended.
- **Ported by hand** (see `THIRD_PARTY_NOTICES.md`):
  - The Lightswind ring geometry, driven by GSAP.
  - Motion Primitives Image Comparison and Progressive Blur, used only in lazily loaded case-study chunks.
- The first Working Model run was stopped mid-architect when the client redirected to the ring. It was relaunched from the partial work on disk.

## Direction change: the persistent presentation frame (2026-09-23, latest)

- Harlie's newest brief supersedes the ring and library decisions:
  - no Tailwind, Motion or Three.js;
  - no continuous carousel rotation;
  - a persistent background video in the shared shell on every route;
  - a shallow-arc project carousel whose center card is largest, modeled on `inspiration/carousel.png` without copying its imagery;
  - case studies rebuilt as presentation frames of at most five scenes.
- **Rollback:**
  - Removed motion, clsx, tailwind-merge, tailwindcss and @tailwindcss/vite.
  - Deleted `src/styles/tailwind.css` and `src/lib/utils.ts`.
  - Reverted the Vite plugin, the `@/` alias and the tsconfig `paths`.
  - Withdrew the `DESIGN_RULES.md` amendment and updated the notices and README.
  - The in-flight ring workflow was stopped. Its reusable parts carry forward: the poster-first background stage, the per-project evidence compositions, the line and assembly helpers, and the Flip transition.
- **Copy corrections:** the brief's project index lists Valiance as 2026 and Shift as 2023. The site keeps the dates evidenced by the résumé and the case studies (Valiance Oct 2024–Jun 2025; Shift Jan–May 2026).

## Revision: ordinary scrolling, concave carousel, six projects (2026-09-23)

Per the client's latest brief. Replaced the PresentationStage engine, scene dots, the homepage stage/carousel and the dev-only dotted slot frames. Added: six projects (PlanetArt split into CafePress UK and Merchandising Platform; `/work/planetart` and the old site's `/creative*` URLs redirect), header Work shelf, footer contact with the site-wide Reduce motion toggle (`useMotionPreference`, the single motion source), pointer trail (canvas), concave constant-speed carousel with exact-phase freeze, shared case layout (`CaseLayout`, `StickyVisual`, `Results`, `NextProject`), image-continuity route transition, one automatic reload for failed route chunks, six 3:4 cover compositions and all 23 drawings via the media pipeline. Docs: `docs/site-structure.md` (replaces `presentation-frame.md`), `docs/media-plan.md`.

Verified with Playwright against the dev server at 1440×900, 1280×720, 768×1024, 390×844 and 360×740: carousel angular rate constant (≈0.0174 rad/s, ≈18px/s at the centre; ≤2.4px per frame), exact freeze on tile hover, caption hover and keyboard focus, resume at the same speed, recycling only outside the clipped arc (1440, 1920, 2560 wide), reserved caption space, touch swipe row, reduced motion via OS emulation and via the footer toggle (persisted, removes the background video and trail, freezes the arc with all six tiles), Work shelf (six fit at 1440, scrollable with cues at 1024, two columns at 390; Escape, outside click and Close return focus to Work; closes on navigation; H1 not covered), all 15 routes including legacy URLs, the same background `<video>` element across every navigation, transition ≈440ms with no blank beat, Back restores position, sticky sections (activation, highlight, crossfade, caption, in-frame demo), Client Work tabs (Video 1 default, pause on switch, no autoplay, position kept), no horizontal overflow, no dotted or dashed borders, no em dashes or colons in visitor copy (text, alt, aria-label, titles), axe clean (WCAG 2.x A/AA) on every route at 1440 and 390, console clean. `tsc -p tsconfig.app.json --noEmit` and `eslint src` pass. `vite build` was not run (parallel agents).

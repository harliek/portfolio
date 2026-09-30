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

### 2026-09-29 — text continuity and editorial revision
- Preserved the existing dirty working tree and current visual system. Removed CaseStory's independent introduction-release mode; the introduction and reading blocks now retain their relative spacing, with ordinary scrolling on compact screens.
- Revised About's second paragraph, expanded Education around human and computational intelligence, and rewrote Contact to lead with contribution and mutual growth. Tightened repetitive project sentences without introducing new project outcomes.
- Removed small media labels and About preview descriptions; retained titles/actions, accessible image/video descriptions, and concise reconstruction/illustration context in project metadata.
- Verified all five product pages and About in Chromium at 1440×900, 1280×720, 768×1024, and 390×844, including reduced motion. No page exceptions or horizontal overflow; introduction/body spacing drift below 0.1px. Inspected desktop/mobile screenshots.
- Typecheck, targeted ESLint, and production build passed. Production Playwright regression `case-text-continuity.spec.ts`: 10 passed (desktop/mobile). Older full-suite tests reference previous components and were not claimed as passing.

### 2026-09-29 — performance and dead-code cleanup (no visible change)
- Runtime: removed `<video>` elements now let go of their files (`useMediaPlayback`), so leaving the homepage no longer keeps ~2 MB of tile footage downloading under the next page; the Nebula field sleeps from the start instead of drawing ~380 black frames after a direct load, and ignores the pointer under reduced motion; the cursor's breathing pauses while the ball is hidden; PointerTrail holds its last target weakly (the page just left is freed); one IntersectionObserver instead of two on the homepage stage; late async work after unmount guarded in CaseStory and `useActionState`.
- Gallery circles reuse the card's files (`sizes` shared): 6 image requests → 3 on CafePress UK and AI Leasing.
- Bundle: 34 media-registry entries nothing renders moved to `archive/media-registry-unplaced.ts` (the chunk every page preloads: 14.5 → 9.1 KB gzip); GSAP in its own long-cached chunk.
- Removed: dead CSS rules and custom properties, the unused `@` alias and `components.json`, dead props and branches (EndRoom `zone`, StageLayer node variant, `data-hero-media`, StageBackground `route`, `MOTION.shelf`, OpeningImage `media`), 75 unreferenced image files (6.0 MB: planetart-concept-*, sa-ui-request-*, merch-promotions-*, aristocracy-photo-*, cp-header-nav-*, cp-products-*, jf-phones-all-900/1400) and their generator entries. Files still used by `archive/v15-src` or `stash@{0}` were kept.
- Fixed the flaky header Back test (it clicked while the header pill was still moving); removed the empty `screens` Playwright project; corrected stale comments, README structure, THIRD_PARTY_NOTICES and docs/motion-components.md.
- Verified: tsc (app + node), `eslint .`, production build; full Playwright suite 65 passed, 2 skipped; deterministic screenshots of every route at 1440 and 390 identical to the pre-change build apart from resampling inside the gallery circles; page text, links, images and videos identical on every route.

### 2026-09-29 — approved changes after the performance audit
- Bug fixes (Harlie's approval): the enlarged image closes when browser Back/Forward changes the page; a page chosen while HOME's glide is still scrolling is no longer overridden by the glide; Safari/iOS now get the same one automatic reload after a deploy (WebKit's MIME-type message and Vite's CSS-preload message are recognised). New `tests/regressions.spec.ts` fails on the earlier build and passes now.
- Homepage: the "Pause the moving projects" button is removed (Harlie's request; keyboard focus, dragging, reduced motion and a hidden tab still hold the drift); the tiles stay still until the first scroll or pointer movement; order Creative Portfolio (far left), About me, Creative Production, Spreadsheet Assistant, CafePress UK, Merchandising Dashboard, Jumpstart Finance, AI Leasing Agent (Previous/Next loops AI Leasing Agent → Creative Production); a never-loaded tile wholly left of the window no longer loads its footage at start.
- Media: the Creative Production tile plays the film's first 35.6 s (2.3 MB, was the whole 5.6 MB film); the Merchandising page plays a 26 s stream-copy cut (3.0 MB, was 5.8 MB), and "Play dashboard demo" still plays the whole recording; video posters are WebP (same frames, SSIM ≥ 0.986); 200 files kept only for `archive/v15-src`, `stash@{0}` and the undecided room background removed from public/media (36.7 MB, recoverable from git history).
- Fonts: Inter keeps only the OpenType features the site uses (112 → 82 KB) and Playfair Display is subset to the site's characters (42 → 27 KB); rendering compared glyph for glyph in Chromium, WebKit and Firefox; `?v=2` on both `@font-face` URLs because /fonts is cached as immutable.
- Copy (Harlie's requests): "AI Leasing Assistant" → "AI Leasing Agent"; case meta lines: Spreadsheet "Independent project · 2026"; CafePress and Merchandising "Product Operations and Merchandising Intern / PlanetArt · 2026"; Jumpstart "Student Founder and CEO / Student venture · 2024"; AI Leasing "Leasing and Operations Associate / Valiance Capital · 2024–2025" (the provenance labels removed).
- Tests: the image-dialog accessibility check waits for the view to finish fading in (it failed intermittently under load on the old build too).
- Verified: tsc (app + node), `eslint .`, production build, full Playwright suite (desktop, mobile, media), route crawl with no failed requests or console errors.
- GSAP ScrollTrigger was replaced separately afterwards (see the next entry).
- Later the same day (Harlie's requests): the homepage subtitle reads "AI Product Strategy, Deployment & Implementation" ("&" kept with "Implementation" where it wraps on phones), and the phone Work menu no longer labels Spreadsheet Assistant and Merchandising Dashboard "Independent prototype" (their rows show the name alone). Full Playwright suite: 68 passed, 3 skipped.

### 2026-09-29 — GSAP removed (Harlie's approval, audit D1/E4/G1)
- `src/lib/scrollProgress.ts` reproduces the part of ScrollTrigger the site used (the homepage's `--enter`/`--settle`, the case studies' current step and measurements, every refresh moment: load, fonts, the 200 ms resize debounce with the touch toolbar rule, orientation, fullscreen, a tab shown at a new size, and `history.scrollRestoration`); `src/lib/ticker.ts` reproduces GSAP's clock for the homepage glide and the resize wait (lag smoothing, its sleep checks). `gsap` is uninstalled.
- Gone: ScrollTrigger's permanent frame loop and 250 ms timer on every page (idle pages: 64 frames/s → 0, main thread ~17 → ~0.2 ms/s) and 107 KB raw / 41 KB gzip of every first load.
- Verified against the previous build: 8 routes × 8 profiles, 30+ scroll positions and every step threshold ±2 px, 66 sequences (resizes, toolbar, orientation, page changes, late fonts, fullscreen, hidden tab, reload/Back/Forward), Firefox and WebKit sweeps, a frame-by-frame A/B of the clock against gsap-core 3.15.0 (35 scenarios); no difference. Full Playwright suite: 68 passed, 3 skipped.

### 2026-09-30 — copy (Harlie's text, verbatim)
- About: the two introduction paragraphs, the Education paragraph and the "Get in touch" invitation are Harlie's new text; the invitation now runs the form's full width (Education keeps its measure). The About descriptor and the site description say "AI product strategy, deployment, and implementation".
- Creative Production: the Nickleby Capital, Aristocracy London and The Night Club x Gymshark Global Tour texts are Harlie's new text (the section heading still reads "The Night Club Global Tour").
- Verified: tsc, `eslint .`, production build, full Playwright suite (68 passed, 3 skipped).
- Link-preview card regenerated (`node scripts/prepare-media.mjs social`) with the homepage subtitle, "AI Product Strategy, Deployment & Implementation" (it still read "AI product management, strategy, and implementation"); `og:image` is now the absolute https://harliekatz.com/social-preview.jpg?v=2, since crawlers such as LinkedIn and Facebook ignore relative image URLs.

### 2026-09-30 — the titles' dock on all text, with the pink and glow (deployed 2026-09-30)
- Harlie's requests: "Is there any way to do the cool effect that's on the titles? on all of the text ... Like instead of it growing bigger, it would do that ... But also you can do the like light pink glow on the titles too. So it all has the same effect", then "you dont have to do every letter if thats easier" and "For the titles, do letter by letter, though. Like, including titles in the sections."
- The hover lift no longer grows blocks (the 7% `scale` and `--lift-scale` are gone). Every text unit keeps the pale pink (`--lift-color`) with the rose glow, and the titles now take it too (PORTFOLIO with its outline and the name above it, the case and Creative Production titles, About's name).
- The Floating-Dock swell (`dockLetters.ts`) now runs on every unit through one delegated pointer listener (`dockText.ts`). Letters: the existing titles, step headings, film names, About's label, section labels, school name line and card titles, the not-found and route-error headings. Whole words: the homepage line, details lines, introductions, step and film texts, About's descriptor, paragraphs, credentials, coursework, Education paragraph, invitation and sent line, the route error's sentence, the footer's copyright. The existing titles swell exactly as before (same transforms; settled swell pixel-identical to the previous build with the new colour neutralised).
- Engine: plain text is drawn by a pool of copies made on first need, each clipped to a run of letters or words that sit alike. Paragraphs peak at 11 to 16 copies, a two-line case title at 20 (it had one per letter). Lines keep their start and widen only into free room: the held picture, a step's moving line, About's portrait, clipping or masked boxes (a case study's fading window) and the viewport's 16px gutter stop them, and a full line swells less. Running text gives way vertically only by what grown letters would overlap. The layer clips to that room, so the page never scrolls sideways.
- The glow is now a `drop-shadow` filter on the words' element (`--lift-glow` 5px at 55%, `--lift-glow-strong` 6px at 80%), measured closest to the old text-shadows. It lights the swelling copies as one, with no seams.
- The homepage's name sits above PORTFOLIO for the pointer (`position: relative; z-index: 1`): PORTFOLIO's letter boxes covered its lower half. Nothing is drawn differently.
- Verified on a scratch build (Chromium 1440×900 and 1024×768, 96 units on 7 pages including a flipped case page, Creative Production, the 404 and the route error; WebKit 1440×900, 46 units). Every unit swells with pink and the right glow; after leaving, its crop is pixel-identical to never hovered; the DOM is back to its rest markup; the dock runs 0 frames at rest (0 rAF/s on case, About and 404 pages); no horizontal scroll; no overlap with the held picture, header, portrait, moving line or footer links. The sent line's address stays clickable in its own colour.
- Reduced motion: colour and glow, no swell. Touch emulation: nothing. The first move over the longest paragraph (342 characters) costs about 5 ms; per frame the dock's script takes 0.2 to 0.5 ms (p95 ≤ 1.2 ms), plus 0.3 to 0.7 ms style and 0.3 to 0.45 ms paint.
- Checks: tsc, `eslint src`, full Playwright suite (68 passed, 3 skipped).
- Open at deploy (Harlie asked to publish before the review round finished): while About's "could not be sent" line swells, the first letters of its drawn email address sit left of the real link and don't take the click; the focus ring there frames the link's rest place. Fixes follow with the review round.

### 2026-09-30 — case pages: new copy, side-by-side stage, player, reading window (deployed 2026-09-30)
- Harlie's revised four-section copy on the five told case studies, verbatim, current names, no numbers.
- Gallery circles in a row under the image; the stage shifted outward (`--stage-shift`); text and stage swap sides every other case study (`data-flip`, caseSide.ts).
- A small glowing player under each recording (MiniControls): a line with a knob, previous/next part, play/pause; its ring shows only on hover, press or keyboard focus.
- The reading window: a fading window fixed to the viewport, the current step bright and the others at 50%, one moving pink line; steps closer together (`--steps-gap`). The Jumpstart phones glow tighter and bluer (`--glow-media-drop`).
- The fading window no longer flickers during fast scrolling where scroll-driven animations exist: the introduction and steps are held by the compositor (`animation-timeline: scroll()`, words counter-slid in `.cs__words`), `#root` clipped below a told page's end; the top fade slides in over the first 24–50px instead of strengthening. Measured by frame-by-frame screencast: Chromium 0 of 3,695 moving frames bright (was 1,263); WebKit 5 of 527 (was 95), first frames of some keyboard scrolls; 360×640 phones a few frames when flicking up from the page's end. Firefox keeps the per-scroll path.
- Checks at deploy: tsc, eslint, scratch build, full Playwright suite (66 passed, 3 skipped in the full run under heavy machine load; the 2 timed-out 404 runs passed 4/4 and 2/2 when rerun alone).

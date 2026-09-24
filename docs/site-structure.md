# Site structure

The portfolio is an ordinary, scrolling website in a dark architectural setting: a fixed background video, a concave project carousel on the homepage, a Work shelf in the header, and one shared case-study layout with a single short sticky visual section per product page. This document replaces `presentation-frame.md` (the pinned presentation engine, scene dots and the old homepage carousel were removed).

Stack: React 19, TypeScript, Vite, react-router-dom (data router), GSAP, plain CSS with custom properties. No Tailwind, Motion or Three.js.

## Routes

| Route | Page file | Notes |
|---|---|---|
| `/` | `src/pages/Home.tsx` | Intro, concave carousel, Selected work index, contact link |
| `/work/cafepress-uk` | `src/pages/work/CafePressUK.tsx` | Project 1 |
| `/work/merchandising-platform` | `src/pages/work/MerchandisingPlatform.tsx` | Project 2 |
| `/work/spreadsheet-agent` | `src/pages/work/SpreadsheetAgent.tsx` | Project 3 |
| `/work/valiance` | `src/pages/work/AILeasingAgent.tsx` | Project 4, AI Leasing Agent (route kept) |
| `/work/jumpstart` | `src/pages/work/JumpstartFinance.tsx` | Project 5 (route kept) |
| `/work/shift` | `src/pages/work/ClientWork.tsx` | Project 6, Client Work (route kept) |
| `/about` | `src/pages/About.tsx` | Biography, experience, art portfolio link, featured film |
| `/art` | `src/pages/Art.tsx` | Art archive (all drawings), linked from About |
| `/film` | `src/pages/Film.tsx` | Films, linked from About and `/art` |

Legacy URLs replace themselves (keeping any hash): `/work/planetart` → `/work/cafepress-uk`, `/work/planetart/console` → `/work/merchandising-platform`, and the previous portfolio's `/creative`, `/creative/art`, `/creative/film` → `/art`, `/film`. Art and Film are not in the header.

Every route except Home is a lazy chunk (`src/routes.tsx`, `routeChunks`, `prefetchRoute` on hover and focus). If a chunk fails to load (an old tab after a deploy, a restarted dev server), `RouteError` reloads the page once by itself; a `sessionStorage` guard (`hk-chunk-reload`) prevents loops and is cleared whenever a chunk loads.

## Projects

`src/content/projects.ts` is the single list, in this order, with the exact names and supporting labels from the brief: CafePress UK, Merchandising Platform, Spreadsheet Agent, AI Leasing Agent, Jumpstart Finance, Client Work. Each entry has `slug` (route), `label` (carousel caption), `category` (Work shelf), `summary` (Selected work index), `year`, `dateRange`, `role`, `status`, `cover` (3:4 composition), `accent` (violet, green for Jumpstart, warm for Client Work) and `next`. The next-project order is the list order, wrapping from Client Work to CafePress UK.

## Shell

`src/components/layout/PageShell.tsx` mounts, once: the skip link, `StageBackground`, `Header`, the route outlet, `Footer`, `PointerTrail`, `RouteFocus` and `ScrollRestoration`.

- **Scroll positions** (`src/scrollPositions.ts`). react-router gives the first history entry of every freshly loaded document the key `default`, so by default every fresh load in a tab shared one saved position (a second link pasted into the same tab opened mid-page and ignored its `#hash`). `ScrollRestoration getKey={scrollKey}` keys that first entry by its URL instead; entries created by in-app navigation keep their own key, so Back and Forward return to where the visitor was, and a reload keeps its position. Before the router mounts, a new arrival (navigation type `navigate`) forgets any position saved for its own URL, so it starts at the top or at its `#hash`. Anchors land about 24px under the header: the root's `scroll-padding-top` (header + 16px, `base.css`) plus an 8px `scroll-margin-top` on sections (never both as full header offsets).

- **Background set** (`StageBackground.tsx`, `src/styles/stage.css`). The architectural video is mounted once and never unmounts, so it never restarts on navigation. The poster is painted first; content never waits for the video. A dark shade per route (home lightest, case darker, About/Art/Film darkest) and a restrained violet floor light. Nothing aligns to the floor horizon. `.reading-scrim` puts a dark translucent field behind reading columns so the horizon never runs through body text.
- **Header** (`Header.tsx`). Left, "Harlie Katz" (home). Right, Work (a button that opens the shelf), About, Contact (moves to the footer's `#contact` on the current page). The current section has a thin violet underline.
- **Work shelf** (`WorkShelf.tsx`, styles in `layout.css`). A horizontal shelf of the six projects under the header: a small 3:4 thumbnail, the name and a short category per project, an active-project indicator (violet bar, `aria-current="page"`) and a visible Close button. Opening takes ~250ms: the Work control moves 6px left while the entries slide in from the right and fade in; the page never moves. Wide screens (≥1200px): Close sits above the row, and the six entries share the full content width as small cards with the name and category each on one line. Intermediate widths (640–1199px) scroll horizontally with edge fades as overflow cues; phones (<640px) show a two-column menu. Ordinary links. Escape and Close return focus to Work; a click outside closes it and returns focus to Work unless the click landed on something focusable (a link, a button, a field), which keeps its focus; focus leaving the header closes it; any navigation closes it, so it never covers the destination's H1. The thumbnails are rendered only once the visitor hovers, focuses or opens Work, so a closed shelf downloads nothing. Tunables: `MOTION.shelf`.
- **Footer** (`Footer.tsx`), on every page, `id="contact"`: email, LinkedIn, Download resume, and the **Reduce motion** toggle. The résumé is the portfolio copy (`scripts/portfolio-resume.py`: the original without the phone number and the response-time claim; see `docs/media-plan.md`).
- **Route focus.** After client-side navigation, focus moves to the new page's H1 (or a hash target); focus never scrolls.

## Motion preference (single source)

`src/hooks/useMotionPreference.ts`. The default follows the operating system's `prefers-reduced-motion`. The footer toggle (`aria-pressed`) stores a per-viewer override in `localStorage` (`hk-motion`: `reduce` or `allow`; choosing the OS value removes the key) and syncs across tabs. The effective value is mirrored on `<html data-motion="reduce|full">`; CSS uses that attribute instead of the media query (`base.css` shortens every transition and animation under `reduce`).

Everything that moves reads it: the carousel (static arrangement), the background (poster only, no video request), the pointer trail (off), sticky highlights and crossfades (instant), the route reveal and image continuity (off), smooth scrolling (off). `useReducedMotion()` and `prefersReducedMotion()` are thin wrappers over the same store.

## Homepage

- **Intro.** "Harlie Katz" (H1, 34–60px), a small "Portfolio" label, and the one sentence from the brief.
- **Concave carousel** (`src/components/home/ConcaveCarousel.tsx`, config `src/config/carousel.ts`, styles `home.css`).
  - Geometry: six independent tiles on the inside of a curved wall around the viewer. A tile at arc position `s` turns by `θ = s / R` and is placed with `translateZ(R) rotateY(-θ) translateZ(-R)` under a CSS perspective equal to `R` on the tiles' parent list. The centre tile faces the viewer at natural size; tiles towards the edges turn inward and read closer and taller. `R = 3.8 × tile width`. Tiles are 3:4 (`--tile-h`: 250–368px, bounded by 25vw and 37vh; on short desktop windows ≤760px tall, 280–368px bounded by 40vh, so 1280×720 gets ≈288px), 14px radius, 28px gaps, a restrained edge reflection (top highlight, coloured lower rim) and a faint pool of light under the arc. Four tiles fully and one or two partially visible on wide desktops.
  - Captions face the viewer: the tile and its link keep `transform-style: preserve-3d`, and each caption is turned back by `rotateY(θ)` (origin at its top centre) in the same frame loop, so names, sentences and "View project" are never slanted. The stage reserves 8% of the tile height extra at the bottom, so an edge tile's hovered caption never meets the clip.
  - Movement: one continuous phase (arc length, px) increases at a constant 18px/s (≈95s per six-project cycle). Every tile's transform is derived from the phase in one `requestAnimationFrame` loop that writes `style.transform` directly (no React state per frame). The loop runs only while moving: it stops while any tile or its caption is hovered (exact phase kept: no snap, no scale change, no delay), while keyboard focus is inside, while the page is hidden or the carousel is off screen, and resumes at the same speed (a 90ms grace after the pointer leaves lets it cross the gap to the next tile). Frame steps are capped at 50ms so a stalled frame never jumps.
  - Recycling: positions wrap at ±L/2 (L = 6 tile spacings), which is always outside the clipped arc (max width 1760px, 4% edge fades). Verified at 1440, 1920 and 2560px wide.
  - Captions: the project name is always visible under each tile; the supporting label and "View project" appear on hover or keyboard focus in reserved space (no layout shift). The tile and caption are one link and one hover region.
  - Keyboard: each tile is one link (named by the project, described by its label). Only tiles wholly inside the clipped view (clear of the 4% edge fades) are in the tab order; the tab stops are updated as tiles travel and never while focus is inside, so a focused tile is always fully visible and nothing moves while it has focus. Every project is also in the Selected work index directly below. Only keyboard focus (`:focus-visible`) freezes the arc: focus from a click, a right-click or a Cmd-click does not, because the pointer's hover already pauses it and leaving resumes it.
  - Touch and coarse pointers, and windows narrower than 700px even with a mouse: a static, horizontally swipeable row with names, labels and direct links (`SwipeRow`; with a fine pointer it shows a thin scrollbar as an overflow cue). Reduced motion: the arc is frozen with all six tiles in view and focusable (gentler radius, smaller tiles) on screens ≥1100px, the swipe row below that. No arrows, pause button or instruction text.
- **Selected work** (`SelectedWork.tsx`, `id="selected-work"`): six rows of name, one factual sentence, timeframe and a link.
- A small "Contact Harlie" link to the footer.

## Case-study layout

Shared components in `src/components/case/` with styles in `src/styles/case.css`:

```tsx
<CaseLayout project={project} className="page-<id>">
  <CaseOpening project description summary note hero subtitle? facts? />
  <CaseSection id="context" title="Context and role">…</CaseSection>
  <CaseSection id="problem" title="Problem" aside?>…</CaseSection>
  <CaseSection id="approach" title="Approach" wide>
    <StickyVisual steps ratio? demo? sizes?>{optional DiagramSlot}</StickyVisual>
  </CaseSection>
  <Results figure?>…</Results>
  <NextProject current={project.id} />
</CaseLayout>
```

- Desktop: content 1200px; text column 38% (left), media 57% (right), gap 56px; body 16–18px at 1.55; paragraphs ≤62ch; title 34–44px; section headings 22–26px; captions 14px. Text stays left and media right in every section.
- **Opening** (`CaseOpening`): title (H1), subtitle, a concise description, Role/Timeframe/Status (`defaultFacts` from `projects.ts`), an optional status line (`note`, e.g. "Simulated AI responses. No live model connection."), a short result summary, one representative image (`hero`, marked `data-case-hero` for image continuity) and the four section links. Everything is visible at once; nothing waits for an animation.
- **Section links** (`SectionLinks`): Context and role, Problem, Approach, Results. They scroll to the real sections (smooth only when motion is allowed), move focus to the heading and update the hash. Sections have `scroll-margin-top` for the sticky header.
- **StickyVisual** (`StickyVisual.tsx`): two or three steps (`VisualStep`: `title`, `body`, `image`, optional `highlight` `{x,y,w,h}` in % of the frame, `dim`, `marker`, `caption`). Desktop (≥960px): the paragraphs scroll as ordinary content while the frame is sticky in the right column only within the section. An IntersectionObserver band at the middle of the viewport picks the active step (no wheel interception, no snapping): its region is highlighted (220ms) with an optional gentle dim of everything else, or the frame crossfades to its screenshot (250ms), and the `aria-live` caption updates (with the numbered marker when `marker` is set). The active paragraph gets an accent rule; inactive paragraphs stay fully readable. An Enlarge button (named with the image's alt text) opens the current image in the shared dialog. `demo={{ video, poster? }}` adds Watch demo directly beneath the frame, in one row with the caption beside it (`.sv-sticky[data-demo]`, the same on both walkthrough pages); the recording plays inside the same frame with native controls and focus moves to it; the button then reads Close demo (a plain button, no pressed state). Below 960px: no sticky behaviour; each paragraph is followed by its own image with the same highlight (images are contained and centred in the section's frame ratio, and interface images have an Enlarge button), and the demo is a click-to-play facade at the top of the section whose visible label reads "Watch demo" with the length written out ("56 s"); `poster` can give it a different real frame so it does not repeat a nearby image.
  - Pinning: `useStickyFigureHeight` measures the sticky figure (ResizeObserver) and writes `--sv-fig-h` on the grid. The last step's minimum height is `max(clamp(300px, 44vh, 440px), 2 × (sticky top + figure height) − 100vh)`, so every figure (a wide interface, the conversation, a phone) stays pinned until the last paragraph has passed the middle of the viewport; other steps are `clamp(360px, 54vh, 500px)`. Measured extra travel: about 890–960px at 1440×900 and 690–840px at 1280×720; the frame top stays at 104px through step 3 on all five pages. `ConversationSteps` (AI Leasing Agent) uses the same hook.
- **Results** (`Results.tsx`): ordinary flow, `id="results"`, a short paragraph and an optional small evidence figure (Jumpstart: the pitch's traction excerpt). No metric cards or counters. Merchandising Platform repeats the same markup with its own readable crop (`EvidenceCrop`).
- **NextProject** (`NextProject.tsx`): the next project's cover, name, label and "View project", then "All work" (to `/#selected-work`). `RelatedProject` is the small cross-link used between CafePress UK and Merchandising Platform (a `div`, so `.case-prose p` styles never apply to it).
- **Case-level CSS couplings to know about.** `cafepress-uk.css` relies on StickyVisual's markup for its Localization close-up (`.sv-layer:has(img[src*='/planetart-uk-'])`, `.sv-grid:has(.sv-step:last-child[data-active])`, `.sv-stack .sv-step:nth-child(2)`), and `spreadsheet-agent.css` re-crops the stacked frames with variables from the page component. Update those files if StickyVisual's markup changes. Captions (`.case-caption`) carry a soft dark text halo so they stay at AA contrast when they rest on the bright floor horizon; boundary notes (`.case-note`) are 16px below 960px.
- **Client Work** uses `CaseLayout` but not the STAR layout: an introduction, a tab row (Nickleby Capital, Aristocracy, The Night Club Global Tour; tabs pattern with arrow keys), one stable 16:9 player (≈60% of the row, ≤500px tall) beside Client context, My contribution and Deliverable, stills, an optional transcript, and "Other agency work". Switching tabs pauses the previous film, crossfades the poster in the same frame (220ms), updates the text and keeps the scroll position; nothing plays until Play is pressed.

### Where each page's files live (one owner per page)

| Page | Page | Copy | Parts | CSS |
|---|---|---|---|---|
| CafePress UK | `src/pages/work/CafePressUK.tsx` | `src/content/pages/cafepress-uk.tsx` | `src/components/pages/cafepress-uk/` | `src/styles/pages/cafepress-uk.css` |
| Merchandising Platform | `src/pages/work/MerchandisingPlatform.tsx` | `src/content/pages/merchandising-platform.tsx` | `src/components/pages/merchandising-platform/` | `src/styles/pages/merchandising-platform.css` |
| Spreadsheet Agent | `src/pages/work/SpreadsheetAgent.tsx` | `src/content/pages/spreadsheet-agent.tsx` | `src/components/pages/spreadsheet-agent/` | `src/styles/pages/spreadsheet-agent.css` |
| AI Leasing Agent | `src/pages/work/AILeasingAgent.tsx` | `src/content/pages/ai-leasing-agent.tsx` | `src/components/pages/ai-leasing-agent/` | `src/styles/pages/ai-leasing-agent.css` |
| Jumpstart Finance | `src/pages/work/JumpstartFinance.tsx` | `src/content/pages/jumpstart-finance.tsx` | `src/components/pages/jumpstart-finance/` | `src/styles/pages/jumpstart-finance.css` |
| Client Work | `src/pages/work/ClientWork.tsx` | `src/content/pages/client-work.tsx` | `src/components/pages/client-work/` | `src/styles/pages/client-work.css` |
| About | `src/pages/About.tsx` | `src/content/pages/about.tsx` | `src/components/pages/about/` | `src/styles/pages/about.css` |
| Art | `src/pages/Art.tsx` | `src/content/pages/art.ts` | `src/components/pages/art/` | `src/styles/pages/art.css` |
| Film | `src/pages/Film.tsx` | `src/content/creative.ts` (shared with About) | `src/components/pages/film/` | `src/styles/pages/film.css` |

Scope page CSS under the page class (`.page-<id>`). Shared files (`projects.ts`, `media.ts`, `components/case/*`, `case.css`, `layout.css`, `stage.css`, `tokens.css`) are changed only by the lead. `src/components/creative/` (FilmPlayer, CreativeNav) and `src/styles/creative.css` are shared by About, Art and Film.

## Route transitions

`src/components/transition/projectTransition.ts` (`openProject`, settings in `src/config/transition.ts`), used by the homepage carousel's objects, next-project links and the Work shelf. The page being left stays live while the destination's code, cover object and opening media load (warmed on hover, focus and touch-down by `warmProject(path)`). Then one view transition of 420ms in two parts that never overlap, so the old and new pages are never seen at partial opacity over each other: first (170ms) the old page clears (its content eases back and fades, the other objects recede and fade, its picture of the background fades to the live destination background beneath); then (250ms) the new page fades in, rising 6px. Across both, the clicked PNG moves into the destination's cover slot (`CoverSlot.tsx`) with a uniform scale, so no frame is empty; from a text link nothing moves. Back/Forward cancels a waiting transition. Reduced motion or no View Transitions support: an ordinary navigation. `ScrollRestoration` returns Back to the previous position (see Scroll positions).

## Pointer trail

`src/components/layout/PointerTrail.tsx`, config `MOTION.trail`. One fixed canvas (`pointer-events: none`, `aria-hidden`) draws a ~34px line behind the real mouse pointer: a 1.2px ivory core with a soft violet halo, tapering to the tail, fading within ~190ms after movement stops. Points live in a ref; one animation-frame loop runs only while the line is visible; no React updates on movement. It is 40% as bright over text (a tag check of the element under the pointer). Off for touch and coarse pointers (`(hover: hover) and (pointer: fine)` required), under reduced motion, and whenever anything is fullscreen.

## Diagram slots (empty = nothing)

`src/content/slots.ts` and `src/components/media/DiagramSlot.tsx`. Slots mark where Harlie's own diagrams may go: `ai-leasing-agent-diagram`, `merchandising-platform-diagram`, `jumpstart-finance-diagram`. The site contains no generated flowcharts. An empty slot renders nothing (no box, no space) in development and production.

**Debug flag (off by default):** add `?debug=slots` to a URL, or run `localStorage.setItem('hk-debug-slots', '1')` in the console, to show each empty slot as a thin solid outline with its id and brief. Remove the key to turn it off.

To fill a slot: add the file to `scripts/prepare-media.mjs`, add an `IMAGES` entry with provenance `own-diagram` (the caption reads "Diagram by Harlie") and set `image` on the slot.

## Performance notes

- The project transition uses the browser's View Transitions and CSS only (no GSAP). The unused `useReveal` hook was removed.
- Inter is subset to the characters the site uses (112KB instead of 344KB, still preloaded); see `docs/media-plan.md` and `scripts/subset-font.sh`.
- Work shelf thumbnails load only after interest in Work.
- Not done: `src/content/media.ts` (≈38KB) is still one module in the entry chunk; splitting the art, film and transcript entries into their routes would shrink it. Run `npm run build` once no other agent is working and record the real chunk sizes (the committed `dist/` is out of date).

## Focus and accessibility

Focus outlines are a clean 2px solid ring (`--focus-ring`), drawn around media frames for image buttons. The image dialog's backdrop is opaque, so nothing from the page shows around an enlarged image. One H1 per page; landmarks; real links and buttons; 44px targets; the tabs, shelf and dialog follow their ARIA patterns. axe (WCAG 2.0/2.1/2.2 A and AA) reports no violations on any route at 1440 and 390 wide, with and without reduced motion.

## Tuning

- Carousel: `src/config/carousel.ts` (speed, radius, static radius, start offset, resume grace) and `home.css` (`--tile-h`, `--tile-gap`, `--caption-h`, `--pad-top`).
- Carousel breakpoints: `CAROUSEL.arcMinWidth` (700px; narrower windows get the row), `CAROUSEL.staticArcMinWidth` (1100px), `CAROUSEL.edgeFade` (0.04, matches the mask).
- Shelf, crossfade, highlight, route (`continuityMs`, `overlayFadeShare`, `heroFadeFrom`), trail: `src/config/motion.ts`; CSS durations `--dur-crossfade`, `--dur-highlight`, `--dur-route-reveal` in `tokens.css`.
- Background: `src/config/stage.ts` (file choice, fade-in, playback rate per route) and `stage.css` (shade per route).
- Case layout: `case.css` (`--case-max`, `--case-gap`, `--case-body`, sticky step heights and the last-step formula). The AI Leasing Agent frame height cap (460px) is in `ai-leasing-agent.css`.

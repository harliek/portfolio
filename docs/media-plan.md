# Media plan

Every image and video on the site, where it is placed, where it came from and its aspect ratio, followed by what is still needed from Harlie. Derivatives are produced by `scripts/prepare-media.mjs` (never by hand) into `public/media/img/<file>-<width>.{avif,webp,jpg|png}` and `public/media/video/`; each has an entry with alt text, caption and provenance in `src/content/media.ts`.

Rules that apply to everything below: real evidence only; screenshots are contained, never cropped into unreadable strips; original evidence colours are kept; AI-generated imagery may only be used for optional cover atmosphere or material backgrounds and never as UI, research, client settings or project evidence (none is used today).

## Priority list from the brief, and what exists

| Project | Asked for | File(s) today | Status |
|---|---|---|---|
| CafePress UK | Cover composition using the actual storefront | `cover-cafepress-uk` (1200×1600, 3:4): the full storefront above the internship's Competitor Findings slide (title, competitors reviewed, key patterns observed; the bottom logo row is left out), so the tile shows both halves of the project | Done (regenerated in the final revision; it previously showed the storefront hero twice) |
| | One clean full storefront capture | `planetart-uk` (1672×941, 16:9) | Done (opening image, sticky steps 2–3) |
| | One localization detail crop | A CSS close-up of `planetart-uk` in sticky step 2: the image is enlarged 1.727× from the top right (`src/styles/pages/cafepress-uk.css`), showing source x 704–1672, y 0–545 (the £ icon beside No Setup Fees, Basket, and the category row with Eco-Friendly); step 3 eases back to the full interface | Done without a new file. The prototype shows no prices, so the page does not claim pricing in pounds |
| | One readable research slide crop | `planetart-competitors` (1880×1000; step 1, shown whole with the three pattern bullets highlighted), `planetart-assortment` (1952×1040; Results) | Done |
| Merchandising Platform | One catalog cover | `cover-merchandising-platform` (3:4) | Done |
| | One product detail capture | `merch-drawer` (2940×1486, 53.9s) | Done |
| | One inventory or review capture | `merch-replenish` (12.0s), also `merch-ask`, `merch-vendors`, `merch-promotions` | Done |
| | One video poster from the walkthrough | `merch-console-poster` = `merch-overview` (0.3s) in the desktop frame; below 960px the Watch demo facade uses `merch-vendors` (28.7s) so the phone layout does not repeat the opening image or the step 1 catalog | Done |
| Spreadsheet Agent | Request, plan review, generated sheet, editable output, video poster | `sheet-request` (12.9s), `sheet-plan` (20.5s), `sheet-returned` (25.3s), `sheet-list` (35.5s), `spreadsheet-agent-poster` (1.5s), `cover-spreadsheet-agent` (3:4) | Done. No frame shows a cell being edited; the page says the sheet "opens in an editable grid" |
| AI Leasing Agent | One labelled illustrative conversation cover | `cover-ai-leasing-agent` (3:4), labelled "Illustrative conversation, invented data" on the image | Done |
| | Three crops for general information, current information, handoff | CSS crops and highlights with a gentle dim on `valiance-messages`. The sticky frame shows the message thread only (source x 268–1088, y 218–836, about 4:3, at most about 460px tall) so it sits at the scale of the other product frames; below 960px each paragraph gets its own excerpt | Done without new files |
| | A user-supplied diagram | Slot `ai-leasing-agent-diagram` (renders nothing while empty) | **Needed from Harlie, optional** |
| Jumpstart Finance | Three individual phone captures | `jumpstart-proto-3` (lessons), `jumpstart-proto-2` (levels), `jumpstart-proto-4` (community), plus `jumpstart-proto-1` (home) | Done |
| | One three-phone cover composition | `cover-jumpstart-finance` (3:4) and a three-phone opening overview built from the individual PNGs | Done |
| | One research or program-pitch artifact supporting the stated result | `jumpstart-traction` (2040×492, about 4.1:1): an excerpt of the pitch's "Traction & Validation" slide (PDF p. 10 at 200dpi, x 0–2040, y 1560–2052) with only the title and "150 sign-ups in 24 hours". Left out: the second bullet ("Encouraging customer interviews", unverified), the Instagram profile with other people's handles and the reels with people's faces. Placed beside the Results paragraph; the business model follows as supporting material | Done. **Harlie to confirm the excerpt may be published** |
| Client Work | A Nickleby Video 1 poster | `nickleby-poster` (1138×640, 16:9, 12s of "Nickleby Capital Video 1.mp4") | Done |
| | An Aristocracy poster | `aristocracy-poster` (4000×3000, 4:3; shown contained in the 16:9 player) | Done. A 16:9 poster without the burned-in subtitle would fill the frame better |
| | A verified run-club or HECK poster | `heck-poster` (1920×1080, 30s of "Heck Video.mp4") | Done |
| | Actual production stills where available | Film stills `film-*-a/b` (two per film; `film-nickleby-b` is now a wide interview frame at 50s instead of the B-roll frame at 70s, so no shot reads as Harlie's own footage); Aristocracy campaign photographs `aristocracy-photo-234/103/077` | Partly. **Behind-the-scenes photos from Harlie's own production days are needed** if she has them |
| About | An appropriately cropped portrait | `headshot` (644×755) | Done. A larger original would allow a sharper 280px retina image |
| | A composition using actual drawings | `drawing-oldwoman`, `drawing-hands`, `drawing-nyu` (the art portfolio link) | Done |
| | An Artistic End poster or still | `film-artistic-end` (1536×895) | Done |

## Cover compositions (3:4)

All six are rendered by the `covers` task in `scripts/prepare-media.mjs` from real evidence into 1200×1600 masters (widths 240, 480, 720, 960, 1200). They serve the homepage carousel tiles, the Work shelf thumbnails (240w, loaded only once the visitor hovers, focuses or opens Work) and the next-project links. Ambient light is violet, green for Jumpstart and warm for Client Work. Regenerate with `node scripts/prepare-media.mjs covers`, or one cover with `node scripts/prepare-media.mjs covers cover-cafepress-uk` (it reads frames, PDF renders and matte-free phone PNGs from `.media-cache`, produced by the `images` task).

## Other generated files

- `public/social-preview.jpg` (1200×630, `og:image`): "Harlie Katz", a small "Portfolio" label and the homepage sentence. `node scripts/prepare-media.mjs social`.
- `public/resume/harlie-katz-resume.pdf`: the portfolio copy of the résumé, made by `scripts/portfolio-resume.py` from `personal assets/Harlie Katz Resume PDF copy.pdf` (which is never modified). It removes exactly two things, the phone number and ", reducing response time by 95%", by moving vector copies of the original text (fonts, spacing and links unchanged, text still selectable). Everything else is Harlie's own wording; see `docs/content-provenance.md`, Q1.
- `public/fonts/InterVariable.woff2`: Inter variable (wght and opsz axes, all OpenType features) subset to Latin, Latin-1, Latin Extended-A, punctuation, arrows and a few symbols, 112KB instead of 344KB. Source `scripts/fonts/InterVariable.full.woff2`; regenerate with `scripts/subset-font.sh` (needs fonttools and brotli) after adding copy with other characters.
- `jumpstart-traction`: `node scripts/prepare-media.mjs traction`.

## Art archive

All 23 drawings from the previous portfolio (`old portfolio copy/public/art/`) are published as `drawing-*` (widths 480, 800, up to 1200) with Harlie's own titles as captions, grouped in her four series (The Art of Aging, A Portrait in Ash, She is Her, Lines of Loss) plus three further studies the old site did not place in a series (`drawing-turn`, `drawing-line`, `drawing-man`, shown without invented titles). "Published in BSB Magazine" and awards are not shown. The two explicit pieces (`drawing-sex`, `drawing-body`) appear only in their series on `/art`, never on the homepage or About.

## Still needed from Harlie

1. Her own diagrams, only if she wants them: AI Leasing Agent (which questions the assistant answers, which need current data, which go to staff), Merchandising Platform (how product, pricing, inventory and vendor information connect), Jumpstart (lesson, level and community structure). Each has an empty slot that renders nothing until filled (see `docs/site-structure.md`, Diagram slots).
2. Confirmation that the Jumpstart pitch excerpt (`jumpstart-traction`, title and the 150 sign-ups line only) may be published.
3. Behind-the-scenes or on-set photographs from the Shift Content productions she supported (Aristocracy, Nickleby Capital, The Night Club Global Tour), if any exist.
4. Optionally a 16:9 Aristocracy poster frame without burned-in subtitles, and a higher-resolution original of the headshot.
5. Titles, if any, for the three drawings the old site left out of its series (`turn.jpg`, `line.jpg`, `man.jpg`).
6. Merchandising Platform: a still of the Catalog at 6.0s of `Dashboard Video.mov` (title, description, filters, "Export 240 rows" and the column headers; widths 800/1200/1600) to replace or sit beside `merch-catalog` (8.5s, rows only; step 1's highlight would need re-measuring), optionally a decision-state still at about 2.0s ("Needs a decision"), and a 2400px or 2940px derivative (or a 2x crop of the Adjust section, source x 1904–2922, y 1134–1486) of `merch-drawer` so the Results crop is sharp on 2x screens. These can be extracted from the recording without Harlie; they are listed so the page owner can decide.
7. Spreadsheet Agent: 2400px or 2940px derivatives of `sheet-request`, `sheet-plan` and `sheet-returned` (12.9s, 20.5s, 25.3s) so the phone crops stay sharp at devicePixelRatio 3, and optionally a crop of `sheet-list` (35.5s, about x 16–45%, y 0–48%) for a readable Results image. Also extractable from the recording.
8. Her decision on the résumé items listed in `docs/content-provenance.md`, Q1 (the portfolio copy removes only the phone number and the response-time claim).
9. (Done) The social preview now reads "Harlie Katz", "Portfolio" and the homepage sentence.

## Removed in this revision

The 16:10 covers (`cover-planetart`, `cover-spreadsheet`, `cover-jumpstart`, `cover-shift`), the generated Valiance card (`cover-valiance-scenario`), and the Shift preview loop (`shift-preview.mp4`, `shift-preview-poster`) were deleted with their pipeline steps.

## Inventory

`Placed in` lists the source files that reference each id (generated from `src/content/media.ts` and `src/**`). "Not placed" entries are real evidence kept for the page owners.

| Id | Files | Size (ratio) | Placed in | Source |
|---|---|---|---|---|
| `cover-cafepress-uk` | media/img/cover-cafepress-uk-* | 1200×1600 (3:4) | content/projects | PlanetArt/cafepress uk/uk web.png; PlanetArt/planetart presentation.pdf, page 4 (slide 5) |
| `cover-merchandising-platform` | media/img/cover-merchandising-platform-* | 1200×1600 (3:4) | content/projects | PlanetArt/Merchandising Dashboard/Dashboard Video.mov (8.5s and 12.0s frames) |
| `cover-spreadsheet-agent` | media/img/cover-spreadsheet-agent-* | 1200×1600 (3:4) | content/projects | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (25.3s and 20.5s frames) |
| `cover-ai-leasing-agent` | media/img/cover-ai-leasing-agent-* | 1200×1600 (3:4) | content/projects | Valiance Capital/messages.png |
| `cover-jumpstart-finance` | media/img/cover-jumpstart-finance-* | 1200×1600 (3:4) | content/projects | JumpStart Finance/proto 1.png, proto 2.png, proto 3.png |
| `cover-client-work` | media/img/cover-client-work-* | 1200×1600 (3:4) | content/projects | Shift Content/Nickleby Capital Video 1.mp4 (12s), Aristocracy.mp4 (55s), Heck Video.mp4 (10s) |
| `planetart-uk` | media/img/planetart-uk-* | 1672×941 (1.78:1) | components/pages/cafepress-uk/StorefrontHero, content/pages/cafepress-uk | PlanetArt/cafepress uk/uk web.png |
| `planetart-competitors` | media/img/planetart-competitors-* | 1880×1000 (1.88:1) | content/pages/cafepress-uk | PlanetArt/planetart presentation.pdf, page 4 (slide 5) |
| `planetart-assortment` | media/img/planetart-assortment-* | 1952×1040 (1.88:1) | pages/work/CafePressUK | PlanetArt/planetart presentation.pdf, page 5 (slide 6) |
| `planetart-concept-dashboard` | media/img/planetart-concept-dashboard-* | 808×514 (1.57:1) | **not placed** (available evidence) | PlanetArt/planetart presentation.pdf, page 11 (embedded image, native 808×514) |
| `planetart-concept-workflow` | media/img/planetart-concept-workflow-* | 620×414 (1.50:1) | **not placed** (available evidence) | PlanetArt/planetart presentation.pdf, page 12 (embedded image, native 620×414) |
| `planetart-concept-table` | media/img/planetart-concept-table-* | 681×217 (3.14:1) | **not placed** (available evidence) | PlanetArt/planetart presentation.pdf, page 11 (embedded image, native 681×217) |
| `sheet-plan` | media/img/sheet-plan-* | 2940×1486 (1.98:1) | content/pages/spreadsheet-agent | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `merch-replenish` | media/img/merch-replenish-* | 2940×1486 (1.98:1) | content/pages/merchandising-platform | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-ask` | media/img/merch-ask-* | 2940×1486 (1.98:1) | pages/work/MerchandisingPlatform | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-promotions` | media/img/merch-promotions-* | 2940×1486 (1.98:1) | **not placed** (available evidence) | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-catalog` | media/img/merch-catalog-* | 2940×1486 (1.98:1) | content/pages/merchandising-platform | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-vendors` | media/img/merch-vendors-* | 2940×1486 (1.98:1) | pages/work/MerchandisingPlatform (stacked Watch demo poster) | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-drawer` | media/img/merch-drawer-* | 2940×1486 (1.98:1) | content/pages/merchandising-platform | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `merch-console-poster` | media/img/merch-console-poster-* | 2940×1486 (1.98:1) | poster (video or background) | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `sheet-request` | media/img/sheet-request-* | 2940×1486 (1.98:1) | content/pages/spreadsheet-agent | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `sheet-returned` | media/img/sheet-returned-* | 2940×1486 (1.98:1) | components/pages/spreadsheet-agent/SheetHero, content/pages/spreadsheet-agent | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `sheet-list` | media/img/sheet-list-* | 2940×1486 (1.98:1) | pages/work/SpreadsheetAgent | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `spreadsheet-agent-poster` | media/img/spreadsheet-agent-poster-* | 2940×1486 (1.98:1) | poster (video or background) | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `valiance-messages` | media/img/valiance-messages-* | 1672×941 (1.78:1) | components/pages/ai-leasing-agent/ConversationHero, content/pages/ai-leasing-agent | Valiance Capital/messages.png |
| `jumpstart-proto-1` | media/img/jumpstart-proto-1-* | 638×1216 (0.52:1) | components/pages/jumpstart-finance/PhonesHero | JumpStart Finance/proto 1.png |
| `jumpstart-proto-2` | media/img/jumpstart-proto-2-* | 616×1242 (0.50:1) | components/pages/jumpstart-finance/PhonesHero, content/pages/jumpstart-finance | JumpStart Finance/proto 2.png |
| `jumpstart-proto-3` | media/img/jumpstart-proto-3-* | 624×1228 (0.51:1) | components/pages/jumpstart-finance/PhonesHero, content/pages/jumpstart-finance | JumpStart Finance/proto 3.png |
| `jumpstart-proto-4` | media/img/jumpstart-proto-4-* | 628×1232 (0.51:1) | content/pages/jumpstart-finance | JumpStart Finance/proto 4.png |
| `jumpstart-competitors` | media/img/jumpstart-competitors-* | 2494×1380 (1.81:1) | **not placed** (available evidence) | JumpStart Finance/competitors.png |
| `jumpstart-business-model` | media/img/jumpstart-business-model-* | 2016×852 (2.37:1) | pages/work/JumpstartFinance | JumpStart Finance/business model.png |
| `jumpstart-traction` | media/img/jumpstart-traction-* | 2040×492 (4.1:1) | pages/work/JumpstartFinance (Results) | JumpStart Finance/jumpstart presentation.pdf.pdf, page 10 (excerpt) |
| `aristocracy-poster` | media/img/aristocracy-poster-* | 4000×3000 (4:3) | poster (video or background) | Shift Content/Aristocracy.mp4 |
| `nickleby-poster` | media/img/nickleby-poster-* | 1138×640 (16:9) | pages/Film | Shift Content/Nickleby Capital Video 1.mp4 |
| `heck-poster` | media/img/heck-poster-* | 1920×1080 (16:9) | poster (video or background) | Shift Content/Heck Video.mp4 |
| `aristocracy-photo-234` | media/img/aristocracy-photo-234-* | 4252×5665 (0.75:1) | **not placed** (available evidence) | Shift Content/Aristocracy-234.jpg |
| `aristocracy-photo-103` | media/img/aristocracy-photo-103-* | 4243×5653 (0.75:1) | **not placed** (available evidence) | Shift Content/Aristocracy-103.jpg |
| `aristocracy-photo-077` | media/img/aristocracy-photo-077-* | 3775×5030 (3:4) | **not placed** (available evidence) | Shift Content/Aristocracy-077.jpg |
| `headshot` | media/img/headshot-* | 644×755 (0.85:1) | pages/About | personal assets/headshot copy.PNG |
| `merch-overview` | media/img/merch-console-poster-* | 2940×1486 (1.98:1) | components/pages/merchandising-platform/ConsoleHero | PlanetArt/Merchandising Dashboard/Dashboard Video.mov |
| `sheet-interpreting` | media/img/sheet-interpreting-* | 2940×1486 (1.98:1) | **not placed** (available evidence) | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov |
| `film-aristocracy-a` | media/img/film-aristocracy-a-* | 4000×2250 (16:9) | content/pages/client-work | Shift Content/Aristocracy.mp4 |
| `film-aristocracy-b` | media/img/film-aristocracy-b-* | 4000×2250 (16:9) | content/pages/client-work | Shift Content/Aristocracy.mp4 |
| `film-nickleby-a` | media/img/film-nickleby-a-* | 1138×640 (16:9) | content/pages/client-work | Shift Content/Nickleby Capital Video 1.mp4 |
| `film-nickleby-b` | media/img/film-nickleby-b-* | 1138×640 (16:9) | content/pages/client-work | Shift Content/Nickleby Capital Video 1.mp4 (50s, wide interview frame) |
| `film-heck-a` | media/img/film-heck-a-* | 1920×1080 (16:9) | content/pages/client-work | Shift Content/Heck Video.mp4 |
| `film-heck-b` | media/img/film-heck-b-* | 1920×1080 (16:9) | content/pages/client-work | Shift Content/Heck Video.mp4 |
| `stage-poster-desktop` | media/img/stage-poster-desktop-* | 1112×834 (4:3) | poster (video or background) | inspiration/working-model-assets/background video.mp4 (frame 0) |
| `stage-poster-mobile` | media/img/stage-poster-mobile-* | 470×834 (0.56:1) | poster (video or background) | inspiration/working-model-assets/background video.mp4 (frame 0, centred 9:16 crop) |
| `drawing-oldwoman` | media/img/drawing-oldwoman-* | 1440×1796 (0.80:1) | content/pages/about, content/pages/art | old portfolio copy/public/art/oldwoman.JPG |
| `drawing-oldman` | media/img/drawing-oldman-* | 1705×2131 (0.80:1) | content/pages/art | old portfolio copy/public/art/oldman.jpg |
| `drawing-oldman2` | media/img/drawing-oldman2-* | 1440×1799 (0.80:1) | content/pages/art | old portfolio copy/public/art/oldman2.JPG |
| `drawing-eye` | media/img/drawing-eye-* | 2446×1668 (1.47:1) | content/pages/art | old portfolio copy/public/art/eye.jpg |
| `drawing-hands` | media/img/drawing-hands-* | 1179×964 (1.22:1) | content/pages/about, content/pages/art | old portfolio copy/public/art/hands.jpg |
| `drawing-draw` | media/img/drawing-draw-* | 1130×1468 (0.77:1) | content/pages/art | old portfolio copy/public/art/draw.jpg |
| `drawing-smoke` | media/img/drawing-smoke-* | 1679×2098 (0.80:1) | content/pages/art | old portfolio copy/public/art/smoke.jpg |
| `drawing-bite` | media/img/drawing-bite-* | 1816×2271 (0.80:1) | content/pages/art | old portfolio copy/public/art/bite.jpg |
| `drawing-nyu` | media/img/drawing-nyu-* | 861×1202 (0.72:1) | content/pages/about, content/pages/art | old portfolio copy/public/art/nyu.jpg |
| `drawing-close` | media/img/drawing-close-* | 1920×2400 (0.80:1) | content/pages/art | old portfolio copy/public/art/close.jpg |
| `drawing-body` | media/img/drawing-body-* | 1179×1447 (0.81:1) | content/pages/art | old portfolio copy/public/art/body.jpg |
| `drawing-baby` | media/img/drawing-baby-* | 1179×1446 (0.82:1) | content/pages/art | old portfolio copy/public/art/baby.jpg |
| `drawing-two` | media/img/drawing-two-* | 1179×1340 (0.88:1) | content/pages/art | old portfolio copy/public/art/two.jpg |
| `drawing-long` | media/img/drawing-long-* | 2249×2547 (0.88:1) | content/pages/art | old portfolio copy/public/art/long.jpg |
| `drawing-sex` | media/img/drawing-sex-* | 2661×3253 (0.82:1) | content/pages/art | old portfolio copy/public/art/sex.jpg |
| `drawing-scribble` | media/img/drawing-scribble-* | 1179×1458 (0.81:1) | content/pages/art | old portfolio copy/public/art/scribble.jpg |
| `drawing-square` | media/img/drawing-square-* | 1179×1433 (0.82:1) | content/pages/art | old portfolio copy/public/art/square.jpg |
| `drawing-tree` | media/img/drawing-tree-* | 1179×1456 (0.81:1) | content/pages/art | old portfolio copy/public/art/tree.jpg |
| `drawing-blur` | media/img/drawing-blur-* | 1179×1468 (0.80:1) | content/pages/art | old portfolio copy/public/art/blur.jpg |
| `drawing-drip` | media/img/drawing-drip-* | 1179×1460 (0.81:1) | content/pages/art | old portfolio copy/public/art/drip.jpg |
| `drawing-turn` | media/img/drawing-turn-* | 1179×1156 (1.02:1) | content/pages/art | old portfolio copy/public/art/turn.jpg |
| `drawing-line` | media/img/drawing-line-* | 1170×1448 (0.81:1) | content/pages/art | old portfolio copy/public/art/line.jpg |
| `drawing-man` | media/img/drawing-man-* | 1986×1581 (1.26:1) | content/pages/art | old portfolio copy/public/art/man.jpg |
| `film-artistic-end` | media/img/film-artistic-end-* | 1536×895 (1.72:1) | content/creative | old portfolio copy/public/art.jpg |
| `film-before-i-wilt` | media/img/film-before-i-wilt-* | 1536×1024 (3:2) | content/creative | old portfolio copy/public/wilt.jpg |
| `film-alex` | media/img/film-alex-* | 1536×1024 (3:2) | content/creative | old portfolio copy/public/shana.png |
| `film-my-world` | media/img/film-my-world-* | 1536×1024 (3:2) | content/creative | old portfolio copy/public/world.png |
| `film-velvet` | media/img/film-velvet-* | 2924×1630 (1.79:1) | content/creative | old portfolio copy/public/blood.png |
| `film-first-edition` | media/img/film-first-edition-* | 1774×1232 (1.44:1) | content/creative | old portfolio copy/public/peter.png |
| `film-relay` | media/img/film-relay-* | 2144×1226 (1.75:1) | content/creative | old portfolio copy/public/hope.png |
| `merch-console` | media/video/merch-console-960.mp4, media/video/merch-console-1600.mp4 | 1600×808 (1.98:1) | pages/work/MerchandisingPlatform | PlanetArt/Merchandising Dashboard/Dashboard Video.mov (2940×1486, 60fps timebase, 57.3s) |
| `spreadsheet-agent` | media/video/spreadsheet-agent-960.mp4, media/video/spreadsheet-agent-1600.mp4 | 1600×808 (1.98:1) | content/projects, pages/work/SpreadsheetAgent | PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov (2940×1486, 60fps timebase, 37.8s) |
| `aristocracy` | media/video/aristocracy-960.mp4, media/video/aristocracy-1440.mp4 | 1440×1080 (4:3) | content/pages/client-work | Shift Content/Aristocracy.mp4 (4000×3000, 87.6s, 544MB; never served) |
| `nickleby` | media/video/nickleby-640.mp4 | 1138×640 (16:9) | content/pages/client-work | Shift Content/Nickleby Capital Video 1.mp4 (1138×640, 100.3s) |
| `heck` | media/video/heck-720.mp4, media/video/heck-1080.mp4 | 1920×1080 (16:9) | content/pages/client-work | Shift Content/Heck Video.mp4 (1920×1080, 37.2s, 98.4MB) |

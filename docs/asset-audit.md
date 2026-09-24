# Asset audit

This file lists every public asset: where it came from, how it was processed, what it shows, and whether publishing it raises questions. Claims in the site copy are traced in [`content-provenance.md`](content-provenance.md).

**Method (2026-09-23).** Byte counts come from `ls -l`. Dimensions come from `sharp` metadata (derivatives and originals) and `ffprobe` (video). PDF excerpts were checked with `pdfimages -list`, and frames and footers with contact sheets built by `ffmpeg`. Sizes are in bytes (B), and MB means 10^6 B. Derivatives are produced by `scripts/prepare-media.mjs`; its cache report is in `.media-cache/dimensions.json`. Originals are read in place and are never committed, because `.gitignore` excludes the source folders.

## Summary

| Item | Measured |
|---|---|
| `public/media/img/` | 288 files = 96 variants × 3 formats; 22,256,133 B in total (AVIF 96 files 4,311,838 B · WebP 96 files 6,164,010 B · JPG 81 files 8,278,484 B · PNG 15 files 3,501,801 B) |
| Manifest coverage | Every `id × width × {avif, webp, fallback}` in `src/content/media.ts` exists. No orphan files. |
| `public/media/video/` | 9 MP4 files, 68,024,467 B in total. All use H.264 in `ftyp → moov → free → mdat` order (fast start checked from box order). |
| Metadata | Image derivatives carry no EXIF, XMP, IPTC or ICC data. Video derivatives carry only an `encoder` tag, with no creation time or location. |
| Image encoding | `ui` preset: AVIF q72 4:4:4, WebP q90, JPG q90 4:4:4 mozjpeg. `photo` preset: AVIF q58, WebP q80, JPG q82 mozjpeg. JPG fallbacks are flattened on `#11131b`. No image is enlarged (`withoutEnlargement`). |
| Video delivery | `VideoFigure` loads nothing until the user clicks. It serves the variant with `maxViewport: 899` at viewports ≤ 899 px and the larger variant otherwise. |
| Manifest `bytes` | The `bytes` values in `VIDEOS` are the measured sizes rounded down to 0.1 MB. |

## Final video sizes vs targets

| File | Frame | Duration | Video / audio bitrate | Bytes | Target | Result |
|---|---|---|---|---|---|---|
| `aristocracy-1440.mp4` | 1440×1080, 25 fps | 87.616 s | 1,711 kb/s High / AAC 131 kb/s | 20,235,447 | Desktop < 35 MB | Within |
| `aristocracy-960.mp4` | 960×720, 25 fps | 87.616 s | 762 / 131 kb/s | 9,841,702 | (mobile variant) | Within 35 MB |
| `nickleby-640.mp4` | 1138×640, 30 fps | 100.333 s | 445 kb/s Main / AAC 136 kb/s | 7,407,595 | < 10 MB | Within |
| `heck-1080.mp4` | 1920×1080, 25 fps | 37.248 s | 2,641 / 130 kb/s | 12,927,297 | < 12 MB | **Over by 927,297 B (+7.7%).** Kept for quality: CRF 23, maxrate 2.6 Mbps, bufsize 5.2 Mbps. |
| `heck-720.mp4` | 1280×720, 25 fps | 37.248 s | 1,524 / 130 kb/s | 7,729,175 | (mobile variant) | Within 12 MB |
| `merch-console-1600.mp4` | 1600×808, 30 fps | 57.367 s | 671 kb/s, no audio | 4,831,328 | < 10 MB | Within |
| `merch-console-960.mp4` | 960×486, 30 fps | 57.367 s | 263 kb/s, no audio | 1,906,546 | < 10 MB | Within |
| `spreadsheet-agent-1600.mp4` | 1600×808, 30 fps | 37.833 s | 449 kb/s, no audio | 2,138,518 | < 10 MB | Within |
| `spreadsheet-agent-960.mp4` | 960×486, 30 fps | 37.833 s | 210 kb/s, no audio | 1,006,859 | < 10 MB | Within |

Encode settings: libx264 `-preset slow`, High profile, yuv420p, with BT.709 colour tags set by the script. Aristocracy uses CRF 23 with maxrate 3000k at 1440 and CRF 24 with maxrate 1600k at 960. HECK uses CRF 23 with maxrate 2600k at 1080 and CRF 24 with maxrate 1500k at 720. Film audio is AAC 128k stereo. The screen recordings use CRF 23 at 1600 and CRF 24 at 960, `fps=30`, with no audio. Nickleby is a stream-copy remux: `-c copy -movflags +faststart`.

## Processing notes

- **Jumpstart phones.** The supplied PNGs sit on an opaque white or pale-green matte. `removeMatte()` flood-fills light pixels (luminance > 120) that connect to the image border. The black bezel stops the fill, and the 1 px edge is softened. Screen content inside the bezel is untouched. The PNG fallback keeps the transparency.
- **Merch Console poster.** The poster is taken at 8.5 s rather than 10.3 s so the cursor sits in empty table space rather than over row text. It is the same frame as `merch-catalog`, and the 1600 px files are byte-identical to it. Likewise, `spreadsheet-agent-poster-1600.*` is byte-identical to `sheet-returned-1600.*`.
- **Aristocracy subtitles.** Burned-in voiceover subtitles appear on almost every frame from about 2 s to about 83 s (checked at 1 s steps). The only subtitle-free frames are the opening second, a few dark transition frames, and the closing “Aristocracy London” logo card from about 84 s. The build log confirms that every frame from 29.8 s to 43.8 s carries one. The 4:3 poster at 43.8 s keeps the subtitle ("when to stop"), because the film is never cropped. The 16:10 home and hero cover crops above it (y 120–2620).
- **PlanetArt concept images.** These were extracted with `pdfimages` at their native embedded resolution: 808×514 on PDF page 11 and 620×414 on PDF page 12, both embedded JPEGs at about 200 ppi. They are low resolution and were never enlarged. At the time of writing, `src/styles/pages/planetart.css` caps them at 620 CSS px plus frame padding, so neither is shown above native size on 1x screens. Because the embedded sources are already JPEG, re-encoding them adds one generation of loss.
- **PlanetArt slide excerpts.** PDF pages 4 and 5 were rendered at 200 dpi (720×405 pt → 2000×1125 px) and then cropped. Page numbers in this file are PDF page numbers. The printed slide footers run one higher (p. 4 is printed "5"), and "7" is printed on two pages.
- **Screen recordings.** Both sources are variable-frame-rate captures with a 60 fps timebase (`r_frame_rate 60/1`). Their measured averages are 37.65 fps (Merch Console, 64800/1721) and 26.58 fps (Spreadsheet Agent, 60300/2269). The derivatives are constant 30 fps, which halves the nominal rate. For the Spreadsheet recording, whose average was below 30 fps, frames are duplicated rather than dropped.
- **Recording tails.** The last ~1 s of both recordings shows the macOS screen-capture toolbar ("Options", "Capture", "Stop Screen Recording"). It is present in all four derivatives. A polish item to consider: trim the tails.
- **Nickleby.** The file is a lossless fast-start remux: its stream parameters and bitrates match the source, and the file is 1 B smaller. The source was already H.264 Main at about 0.45 Mbps with the index at the front, so re-encoding would only have lost quality.
- **Poster vs video size.** Posters for the screen recordings are 1600×809 and 960×485, while the videos are 1600×808 and 960×486, because the rounding differs. The 1 px difference is not visible.

---

<a id="planetart"></a>

## PlanetArt / CafePress

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes (AVIF / WebP / fallback) | Crop / frame |
|---|---|---|---|
| `cover-planetart` | `PlanetArt/cafepress uk/uk web.png` (1672×941 PNG, 1,685,325 B) | 480, 800, 1200, 1600 JPG · 1600: 97,742 / 140,164 / 236,337 | Full screenshot scaled to 1376 px wide and centred on a 1600×1000 dark radial surface (Playwright render) |
| `planetart-uk` | same file | 800, 1200, 1672 JPG · 1672: 130,058 / 188,528 / 306,470 | None; native size |
| `planetart-competitors` | `PlanetArt/planetart presentation.pdf` p. 4 ("Competitor Findings"; 17 pp., 1,602,455 B) | 800, 1200, 1880 JPG · 1880: 47,773 / 84,100 / 144,987 | 200 dpi render, x 60–1940, y 60–1060 (1880×1000) |
| `planetart-assortment` | same PDF, p. 5 ("Curated UK Assortment Opportunities") | 800, 1200, 1952 JPG · 1952: 68,344 / 106,886 / 174,443 | 200 dpi render, x 36–1988, y 60–1100 (1952×1040) |
| `planetart-concept-dashboard` | same PDF, p. 11, embedded image 808×514 | 808 JPG only · 21,369 / 26,864 / 42,112 | Native, not enlarged |
| `planetart-concept-workflow` | same PDF, p. 12, embedded image 620×414 | 620 JPG only · 26,214 / 33,306 / 43,345 | Native, not enlarged |
| `merch-catalog` | `PlanetArt/Merchandising Dashboard/Dashboard Video.mov` (2940×1486, 57.345 s, 26,453,178 B) | 800, 1200, 1600 (1600×809) JPG · 56,095 / 75,522 / 137,164 | Frame 8.5 s |
| `merch-vendors` | same recording | 800, 1200, 1600 · 39,818 / 57,814 / 123,346 | Frame 28.7 s |
| `merch-drawer` | same recording | 800, 1200, 1600 · 59,882 / 82,896 / 143,267 | Frame 53.9 s |
| `merch-console-poster` | same recording | 960, 1600 · 56,095 / 75,522 / 137,164 | Frame 8.5 s (chosen for cursor placement) |
| `merch-console` (video) | same recording; H.264 Main, VFR (60 fps timebase, ~37.7 fps average), 3,684 kb/s, no audio | `merch-console-1600.mp4` 4,831,328 B; `merch-console-960.mp4` 1,906,546 B | Uncropped; poster 8.5 s |

### Classification

| ID | Display role | Provenance label | Synthetic | Original artifact or later work |
|---|---|---|---|---|
| `cover-planetart` | Home card cover; PlanetArt hero | Original artifact | No | Internship artifact inside a new portfolio composition |
| `planetart-uk` | Storefront prototype chapter | Original artifact | No | Internship artifact |
| `planetart-competitors` | UK research pair (left) | Original artifact | No | Internship presentation excerpt |
| `planetart-assortment` | UK research pair (right) | Original artifact | No | Internship presentation excerpt |
| `planetart-concept-dashboard` | Original concept chapter | Original artifact | No (see uncertainty) | Internship concept prototype |
| `planetart-concept-workflow` | Original concept chapter (supporting) | Original artifact | No | Internship concept map |
| `merch-catalog`, `merch-vendors`, `merch-drawer` | Independent rebuild stills | Independent prototype · Synthetic data (label renamed 2026-09-24; was “Independent reconstruction”) | Yes | Later independent prototype, separate from PlanetArt’s systems |
| `merch-console-poster` | Video poster (alt `""`) | Independent prototype · Synthetic data (label renamed 2026-09-24; was “Independent reconstruction”) | Yes | Later independent prototype, separate from PlanetArt’s systems |
| `merch-console` | Independent rebuild player | Independent prototype · Synthetic data (label renamed 2026-09-24; was “Independent reconstruction”) | Yes | Later independent prototype, separate from PlanetArt’s systems |

### Alt text and captions (from `media.ts`)

| ID | Alt | Caption |
|---|---|---|
| `cover-planetart` | CafePress Business UK website prototype: a storefront hero reading “Branded Promotional Products for UK Businesses,” with UK categories and delivery details. | CafePress UK website prototype created during the internship. |
| `planetart-uk` | Full CafePress Business UK website prototype: UK product categories, a hero for branded promotional products, delivery and support highlights, and a row of popular categories. | Prototype view. This shows a proposed experience, not evidence of a completed UK launch. |
| `planetart-competitors` | Internship slide “Competitor Findings”: Printful, Prodigi, Printify, Vistaprint, and 4imprint, with observed patterns such as category-led sites, prominent brands, and a recurring eco-friendly theme. | Competitive landscape. (The page uses one group caption: “Research from the internship presentation, covering the competitive landscape and potential UK suppliers.”) |
| `planetart-assortment` | Internship slide “Curated UK Assortment Opportunities”: focus areas and featured brands curated through UK vendors PF Concept and Ralawise. | Potential UK suppliers and assortment. (Group caption as above.) |
| `planetart-concept-dashboard` | Original concept dashboard from the internship presentation: sales, profit, inventory-alert, and promotion summaries, a sales chart, revenue by category, and a task calendar. | Original concept from the internship presentation. Proposed capabilities are not evidence of production deployment. |
| `planetart-concept-workflow` | Original concept map from the internship presentation: a merchandising dashboard branching into summary and alerts, products and inventory, vendor costs and pricing, and promotions and status. | Concept structure from the same presentation. |
| `merch-catalog` | Merch Console catalog table in the synthetic demo: products, vendors, margins, revenue, and stock status. | Catalog view in the synthetic demo. |
| `merch-vendors` | Merch Console vendor view: scorecards for fill rate, on-time delivery, consistency, quality, and cost trend. | Vendor information within the same prototype. |
| `merch-drawer` | Merch Console product detail drawer: stock-out risk, unit economics, and trailing 28-day figures for one product. | A product detail view for reviewing related information. |
| `merch-console` | (Player title “Merch Console walkthrough”) | Recorded walkthrough of the independent Merch Console prototype. |

### Publication notes

- **Synthetic status, verified from frames.** Every frame's sidebar footer reads “Portfolio project. Synthetic catalog, no backend, nothing leaves your browser.” (checked on `.media-cache/frames/merch-catalog.png` and across a 3 s contact sheet). The header reads “240 SKUs · demo data”. The “Ask” view states “There is no language model involved.” The site does not use the synthetic figures in the recording, such as the net revenue and SKU counts.
- **Employer material.** The storefront prototype, the slide excerpts and both concept images are PlanetArt/CafePress internship work. Permission from the employer to publish them has not been independently confirmed.
- **Third-party marks.** The competitor slide shows the Printful, Prodigi, Printify, Vistaprint and 4imprint logos. The assortment slide shows about a dozen apparel and drinkware brand logos (e.g. Nike, adidas, Gildan, Stanley) and names the vendors PF Concept and Ralawise. The storefront and workflow images carry CafePress marks.
- **Storefront image contents.** The storefront header shows a phone number, “020 3946 0018, Mon–Fri 9am–5pm”, and lifestyle photography of three people. It is not known whether the number is a placeholder or a real line, or whether the photography is stock, AI-generated or licensed.
- **Concept dashboard figures.** The dashboard shows figures such as net sales of $155,930.20, gross profit of $95,669.20 and “Today 2026-07-20”. The materials do not say whether these are placeholders or real internal data. Until confirmed, treat them as a disclosure risk.

---

<a id="valiance"></a>

## Valiance Capital

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes | Crop / frame |
|---|---|---|---|
| `cover-valiance` | Generated by `scripts/prepare-media.mjs` (`coverValianceHtml`); 1600×1000 Playwright render set in Inter | 480, 800, 1200, 1600 JPG · 1600: 20,533 / 36,512 / 71,877 | None |
| `valiance-messages` | `Valiance Capital/messages.png` (1672×941 PNG, 1,558,720 B) | 800, 1200, 1672 JPG · 1672: 124,147 / 173,706 / 258,652 | None; native size |

### Classification

| ID | Display role | Provenance label | Synthetic | Original artifact or later work |
|---|---|---|---|---|
| `cover-valiance` | Home card cover; Valiance hero | Retrospective diagram | No (no data) | Later explanation, drawn for this portfolio from the requirements narrative; not a platform screenshot |
| `valiance-messages` | Requirements chapter supporting image | Illustrative · Synthetic | Yes | Later illustration; the image's own footer reads “Reconstruction · Invented data” |

### Alt text and captions

| ID | Alt | Caption |
|---|---|---|
| `cover-valiance` | Diagram titled “A leasing question can require different kinds of answers”: a leasing question branches to general information, current property data, and a human decision. | A summary of the response boundaries explored in the leasing workflow. |
| `valiance-messages` | Illustrative leasing conversation with notes identifying current-data needs, approval boundaries, and human handoff. | Illustrative leasing scenario. Synthetic conversation; not a production screenshot. |

### Publication notes

- **Evidence is thin.** The only other Valiance files are `Valiance-logo.svg` (264×69) and `berkeley group.png` (1036×382); neither is published. No Valiance file shows the production assistant or names its platform.
- **Contents of `messages.png`.** The property “Maple Court Apartments” and the people “Jordan” and “Sam” are invented, according to the manifest. The assistant persona is named **“Oski”** and has a bear avatar; Oski is the UC Berkeley mascot's name. The image also contains a photorealistic building photograph with a “Maple Court” sign. Two things are unknown: whether the persona reflects the real deployment, and where the building image came from (generated, stock, or a real property). Neither is established.

---

<a id="spreadsheet-agent"></a>

## Spreadsheet Agent

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes | Crop / frame |
|---|---|---|---|
| `cover-spreadsheet` | `PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov` (2940×1486, 37.81 s, 12,766,643 B) | 480, 800, 1200, 1600 JPG · 1600: 95,721 / 130,690 / 221,651 | Frame 25.3 s; x 435–2813 (2378 px, sidebar removed), full height, resized to 1600×1000 |
| `sheet-request` | same recording | 800, 1200, 1600 (1600×809) · 34,554 / 46,868 / 103,000 | Frame 12.9 s |
| `sheet-returned` | same recording | 800, 1200, 1600 · 81,452 / 114,100 / 185,079 | Frame 25.3 s |
| `sheet-list` | same recording | 800, 1200, 1600 · 87,554 / 125,034 / 188,733 | Frame 35.5 s |
| `spreadsheet-agent-poster` | same recording | 960, 1600 · 81,452 / 114,100 / 185,079 | Frame 25.3 s |
| `spreadsheet-agent` (video) | same recording; H.264 Main, VFR (60 fps timebase, ~26.6 fps average), 2,697 kb/s, no audio; tagged `ReplayKitRecording` | `spreadsheet-agent-1600.mp4` 2,138,518 B; `spreadsheet-agent-960.mp4` 1,006,859 B | Uncropped; poster 25.3 s |

### Classification

All Spreadsheet Agent assets are labeled “Prototype recording · Demo data” and are marked synthetic. They are artifacts of an independent prototype, not employer work; the recording file was created on 2026-09-23. The two poster frames have an empty alt (`""`).

### Alt text and captions

| ID | Alt | Caption |
|---|---|---|
| `cover-spreadsheet` | Spreadsheet Agent prototype: a returned “Vendor Pricing and Margin” sheet beside an assistant panel showing the request “Compare vendor prices across B2B products.” | A recorded prototype state using demo data. |
| `sheet-request` | Spreadsheet Agent with an empty untitled sheet; the assistant panel’s request field reads “Compare vendor prices across.” | The request being entered. |
| `sheet-returned` | Returned “Vendor Pricing and Margin” sheet with SKU, product, vendor, cost, retail price, and margin columns, beside the assistant panel. | The returned sheet, with demo data. |
| `sheet-list` | The All Sheets view, now listing “Vendor Pricing and Margin” first among the saved sheets. | Back in the collection of sheets. |
| `spreadsheet-agent` | (Player title “Spreadsheet Agent walkthrough”) | Recorded walkthrough. The AI response is simulated; this is not a demonstration of live model execution. |

### Publication notes

- **Demo data, as shown on screen.** The recording's build plan reads “Northwind product catalog · 1,200 synthetic records · approved for this workspace”. The plan also says “Not used: compare, across. These words did not map to a field or filter”, which fits keyword mapping rather than a language model.
- **Download control.** A “Download CSV” button is visible in the stills. The recording never uses it.
- **No cell edits.** No cell-level edit appears in the recording; this was checked at 2 fps from 24 to 34 s and at 2.5 s intervals across the whole file. After the sheet is built, the recording only shows scrolling, a return to All Sheets, and starring the new sheet. See the provenance file for the copy this affects.
- **Folder location.** The source file sits inside the `PlanetArt/` folder, although the site presents the project as independent. See the provenance file.

---

<a id="jumpstart"></a>

## Jumpstart Finance

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes (AVIF / WebP / fallback) | Crop / processing |
|---|---|---|---|
| `cover-jumpstart` | `JumpStart Finance/proto 1.png` + `proto 2.png` (matte removed) | 480, 800, 1200, 1600 JPG · 1600: 32,021 / 53,698 / 125,188 | Both screens at 880 px tall, 72 px apart, on a 1600×1000 dark radial surface with a drop shadow |
| `jumpstart-proto-1` | `proto 1.png` (638×1216 RGBA, 352,084 B) | 320, 638 PNG · 638: 30,274 / 44,488 / 289,813 | Matte removed; screen untouched |
| `jumpstart-proto-2` | `proto 2.png` (616×1242, 338,159 B) | 320, 616 PNG · 616: 21,240 / 27,516 / 310,502 | Matte removed |
| `jumpstart-proto-3` | `proto 3.png` (624×1228, 525,004 B) | 320, 624 PNG · 624: 51,655 / 71,408 / 580,620 | Matte removed |
| `jumpstart-proto-4` | `proto 4.png` (628×1232, 459,768 B) | 320, 628 PNG · 628: 39,084 / 50,518 / 403,139 | Matte removed |
| `jumpstart-competitors` | `JumpStart Finance/competitors.png` (2494×1380 RGBA, 720,512 B); content matches pitch p. 4 | 800, 1200, 1680, 2494 PNG · 2494: 62,210 / 114,336 / 441,796 | None |
| `jumpstart-business-model` | `JumpStart Finance/business model.png` (2016×852 RGBA, 136,422 B); content matches pitch p. 7 | 800, 1200, 2016 PNG · 2016: 21,404 / 45,810 / 68,238 | None |

### Classification

Every Jumpstart asset is an original artifact of the 2024 venture, labeled “Original artifact” and not synthetic. The same phone screens appear in the pitch deck on pp. 5–6. Sample balances and events on the screens are prototype content, not real accounts. `cover-jumpstart` places original artifacts in a new portfolio composition.

### Alt text and captions

| ID | Alt | Caption |
|---|---|---|
| `cover-jumpstart` | Two Jumpstart prototype phone screens: a home screen with learning topics and a profile screen with a winding path of levels. | Prototype screens developed for the student venture. |
| `jumpstart-proto-1` | Jumpstart prototype home screen: a sample balance, learning topics such as portfolio, budget, banks, stocks, taxes, and spending, and a list of simulated events. | Overview of the financial-learning prototype. |
| `jumpstart-proto-2` | Jumpstart prototype profile screen with a winding path of numbered learning levels. | A visible path through learning levels. |
| `jumpstart-proto-3` | Jumpstart prototype lessons screen: a lesson search field and lesson cards, starting with an introduction to personal finance. | Short lessons organized into a learning sequence. |
| `jumpstart-proto-4` | Jumpstart prototype community screen: member questions and replies about investing, each labeled with the member’s level. | A proposed community space alongside individual learning. |
| `jumpstart-competitors` | Pitch slide comparing Jumpstart, Robinhood, Zogo, and Acorn on four features (educational, forum, gamified, real-time market data), as the team assessed them in 2024. | Competitive comparison from the 2024 program pitch; a record of the team’s positioning assumptions at the time. |
| `jumpstart-business-model` | Pitch slide of four proposed tiers: free basic features and educational content, $0.99 in-app purchases, a $10.49 monthly premium subscription, and a $100 yearly premium subscription. | Proposed free and paid tiers from the program pitch. These were business-model assumptions, not revenue results. |

### Publication notes

- **Competitor slide.** It names Robinhood, Zogo and “Acorn” (the slide's spelling), with the team's checkmark assessments from 2024. The caption frames these as historical assumptions.
- **Teammates.** The prototype screens belong to a five-person team project. No teammate faces or names are published.
- **Typo in the artifact.** The business-model slide misspells “Suscription”. The image is published unaltered, and the alt text uses the correct spelling.

---

<a id="shift"></a>

## Shift Content

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes (AVIF / WebP / JPG) | Crop / frame |
|---|---|---|---|
| `cover-shift` | `Shift Content/Aristocracy.mp4` (4000×3000, 25 fps, 87.6 s, 49.4 Mb/s, 544,167,507 B) | 480, 800, 1200, 1600 · 1600: 79,637 / 106,440 / 168,790 | Frame 43.8 s; 16:10 crop y 120–2620 (above the subtitle), resized to 1600×1000; `photo` preset |
| `aristocracy-poster` | same film | 960, 1440 · 1440: 75,223 / 102,404 / 163,508 | Frame 43.8 s, full 4:3, subtitle visible |
| `aristocracy` (video) | same film; AAC 48 kHz stereo 317 kb/s | `aristocracy-1440.mp4` 20,235,447 B; `aristocracy-960.mp4` 9,841,702 B | 4:3 preserved, never cropped |
| `nickleby-poster` | `Shift Content/Nickleby Capital Video 1.mp4` (1138×640, 30 fps, 100.333 s, 7,407,596 B) | 1138 only · 28,844 / 33,660 / 56,239 | Frame 12.0 s; interview frame after the “NICKELBY PRESENTS” / “MEET THE MAKERS” opening, no subtitle |
| `nickleby` (video) | same file | `nickleby-640.mp4` 7,407,595 B (lossless remux) | Uncropped |
| `heck-poster` | `Shift Content/Heck Video.mp4` (1920×1080, 25 fps, 37.24 s, 20.8 Mb/s, 98,408,949 B) | 1280, 1920 · 1920: 128,732 / 162,516 / 231,951 | Frame 30.0 s |
| `heck` (video) | same file; AAC 48 kHz stereo 317 kb/s | `heck-1080.mp4` 12,927,297 B; `heck-720.mp4` 7,729,175 B | Uncropped |
| `aristocracy-photo-234` | `Shift Content/Aristocracy-234.jpg` (4252×5665, 13,946,426 B) | 480, 800, 1200 (1200×1598) · 68,251 / 84,086 / 120,532 | None; `photo` preset |
| `aristocracy-photo-103` | `Shift Content/Aristocracy-103.jpg` (4243×5653, 15,703,475 B) | 480, 800, 1200 (1200×1599) · 76,181 / 108,210 / 144,593 | None |
| `aristocracy-photo-077` | `Shift Content/Aristocracy-077.jpg` (3775×5030, 12,895,215 B) | 480, 800, 1200 (1200×1599) · 101,244 / 170,824 / 197,441 | None |

### Classification

Every Shift asset is labeled “Agency work” and is not synthetic. All are original agency deliverables supplied by Harlie; none are reconstructions. Posters use alt `""`, because the player carries the title.

### Alt text and captions

| ID | Alt | Caption |
|---|---|---|
| `cover-shift` | Still from the Aristocracy campaign film: three men in green, blue, and red suits on a hand-drawn set, one raising a kite. | Aristocracy campaign film still. Agency production. |
| `aristocracy` | (Player title “Aristocracy”) | Agency campaign film. Shown here as part of the production work I supported. |
| `nickleby` | (Player title “Nickleby Capital”) | One film from the supplied Nickleby Capital project materials. |
| `heck` | (Player title “The Night Club / HECK”) | Agency event film. The title follows the project context and branding visible in the supplied materials. |
| `aristocracy-photo-234` | Aristocracy campaign photograph: three men in navy, burgundy, and black patterned suits against a pale studio backdrop. | (One group caption for the photo set: “Selected campaign imagery from the supplied project materials.”) |
| `aristocracy-photo-103` | Aristocracy campaign photograph: two men in pale teal and dusty pink pinstripe suits against a pale studio backdrop. | (group caption) |
| `aristocracy-photo-077` | Aristocracy campaign photograph: three men in a grey check suit, a white dinner jacket, and a black jacket with check trousers. | (group caption) |

### Publication notes

- **Authorship and rights.**
  - The photographer of the Aristocracy stills is unknown. The files carry no author or copyright field; their camera metadata reads Sony ILCE-7M4, captured 2026-02-26. Harlie is not credited as photographer.
  - Clearance from the agency and its clients (Aristocracy London, Nickleby Capital, The Night Club/Gymshark/HECK) is not documented.
  - The films show identifiable models, interviewees and event participants.
  - Music in all three films has not been checked for licensing.
- **On-screen titles and spelling.** Aristocracy opens with the on-screen title “The Theatre of the Train Journey” and ends on an “Aristocracy London” logo card. The Nickleby title card reads “NICKELBY PRESENTS”, while the logo reads “nickleby capital”; the site uses “Nickleby”. The Nickleby film includes on-screen name captions for interviewees. The site does not repeat these names.
- **HECK film.** It shows “Night Club” banners with Gymshark branding, a Gymshark storefront sign, “London” apparel, and HECK packaging and an end card. File metadata gives a creation time of 2026-02-02 for HECK and 2026-03-04 for Aristocracy, both inside the Jan–May 2026 internship.

---

<a id="about"></a>

## About

### Inventory

| ID | Source (native) | Derivatives · largest variant bytes (AVIF / WebP / JPG) | Crop |
|---|---|---|---|
| `headshot` | `personal assets/headshot copy.PNG` (644×755, 692,244 B) | 360, 640 (640×750) · 22,106 / 25,952 / 39,768 | None |
| `drawing-oldwoman` | `/Users/harliekatz/Desktop/old portfolio copy/public/art/oldwoman.JPG` (1440×1796, 604,863 B; file metadata creator “Instagram”) | 480, 800, 1200 (1200×1497) · 174,519 / 268,416 / 263,466 | None; `photo` preset |
| `drawing-oldman` | `.../old portfolio copy/public/art/oldman.jpg` (1705×2131, 763,591 B) | 480, 800, 1200 (1200×1500) · 89,083 / 126,686 / 166,860 | None |
| `drawing-hands` | `.../old portfolio copy/public/art/hands.jpg` (1179×964, 535,245 B) | 480, 800, 1179 · 80,019 / 110,916 / 121,511 | None |

### Classification, alt text and captions

| ID | Role | Label · synthetic | Alt | Caption |
|---|---|---|---|---|
| `headshot` | About portrait (eager, not zoomable) | Portrait, no label · No | Harlie Katz. | — |
| `drawing-oldwoman` | About drawings | Personal work · No | Drawing in white on black of an elderly woman in a head scarf, her face deeply lined. | Portrait study. |
| `drawing-oldman` | About drawings | Personal work · No | Drawing in white on black of an elderly bearded man in a hood, a hand raised to his mouth. | Portrait study. |
| `drawing-hands` | About drawings | Personal work · No | Drawing in white on black of two reaching hands, with a small figure in a flowing dress running between them. | Hand study. |

### Publication notes

- **Drawing titles.** The drawings are Harlie's own earlier work. The captions are descriptive only. Titles and series names from the old portfolio were deliberately not imported (see provenance).
- **Reference images.** Whether any portrait study was drawn from a third-party reference photograph is not recorded.

---

<a id="site"></a>

## Site-wide assets

| Asset | Source | Public path · size | Notes |
|---|---|---|---|
| Résumé PDF | `personal assets/Harlie Katz Resume PDF copy.pdf` (1 page, 52,012 B; PDF title “2026 Resume - Harlie Katz – Figma Make”, created 2026-09-23) | `public/resume/harlie-katz-resume.pdf`, 52,012 B, byte-identical (`cmp`); downloads as `Harlie-Katz-Resume.pdf` | Linked from the footer on every page, from About, and from the `<noscript>` fallback. **The PDF contains a phone number and claims the site deliberately excludes** (see provenance, unresolved question 1). |
| Inter font | Inter 4.1 `InterVariable.woff2`, from the official rsms/inter GitHub release (per build log and `THIRD_PARTY_NOTICES.md`; version not re-read from the font tables) | `public/fonts/InterVariable.woff2`, 352,240 B (SHA-256 `693b77d4…a8e3`); license `public/fonts/Inter-LICENSE.txt`, 4,380 B (SIL OFL 1.1) | Preloaded in `index.html`. Also embedded as a data URI, at build time only, in the Playwright compositions (`cover-valiance`, social preview). |
| `social-preview.jpg` | Rendered by `socialHtml()` in `prepare-media.mjs` (Playwright, 1200×630 PNG, 219,718 B in cache) → mozjpeg q86 | `public/social-preview.jpg`, 1200×630, 18,329 B | Text reads “Harlie Katz / AI product, strategy & operations.” on a dark blue-violet field. Made for this site; no third-party content. `og:image` is still a relative URL, and most link-preview scrapers need an absolute URL once the domain is fixed. |
| `favicon.svg` | Hand-written SVG in the repo | `public/favicon.svg`, 285 B, viewBox 64×64 | “HK” stroke monogram in `#f4f5fa` on a `#11131b` rounded square. Made for this site. |

---

## Source materials intentionally not published

| File | Measured | Reason |
|---|---|---|
| `Shift Content/Nickleby Capital Video 2.mp4` | 1138×640, 41.045 s, 1,676,655 B | Editorial choice: same client as Video 1, and the page shows one film per project |
| `Shift Content/Aristocracy.mp4` (master) | 4000×3000, 87.6 s, 544,167,507 B | Far too large to serve; only 1440/960 derivatives are public |
| `Shift Content/Heck Video.mp4` (master) | 1920×1080, 37.24 s, 98,408,949 B | Only derivatives are served |
| `PlanetArt/Merchandising Dashboard/Dashboard Video.mov` | 2940×1486, 57.345 s, 26,453,178 B | MOV screen recording; derivatives only |
| `PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov` | 2940×1486, 37.81 s, 12,766,643 B | MOV screen recording; derivatives only |
| `Shift Content/Shift journals.pdf` | 5 pp., 89,335 B | Private internship journals and a course report. Used only as evidence; they contain candid remarks and name the agency founder. |
| `Shift Content/Film case studies.pdf` | 2 pp., 54,328 B | The agency's own project write-ups; used only as evidence |
| `Shift Content/shift content deck.pdf` | 12 pp., 11,729,742 B | The agency's internal hospitality pitch deck (pricing, founder contact details) |
| `Shift Content/Olympus.io Projects.pdf` | 28 pp., 1,143,476 B | Enterprise AI research notes about a third-party company. Not one of the five projects, and filed in the Shift folder although it is not Shift work. |
| `PlanetArt/planetart presentation.pdf` (other pages) | 17 pp., 1,602,455 B | Only pp. 4, 5 (crops) and 11, 12 (embedded images) are used. The other pages hold exchange rates, AI-opportunity slides, a product grid and branded mock-ups. |
| `JumpStart Finance/jumpstart presentation.pdf.pdf` | 12 pp., 5,456,265 B | Only the separately supplied `competitors.png` and `business model.png` are used. Excluded: team photos and names, the anxiety statistic, TAM/SAM/SOM, the milestones and the funding ask. |
| `PlanetArt/planetart_com_logo.jpeg` | 200×200, 4,056 B | Not needed |
| `Valiance Capital/Valiance-logo.svg` | 264×69, 4,415 B | Not needed |
| `Valiance Capital/berkeley group.png` | 1036×382, 63,174 B | Not needed |
| `JumpStart Finance/jumpstart.png` | 1128×288 wordmark, 100,616 B | Not needed |
| `inspiration/` | 4 files: `3D timeline.webp` 30,316 B; `style.web.webp` 46,398 B; `carousel.png` 796,226 B; `carousel vid.mov` 27,435,266 B | Design references only |
| `design:portfolio rules/*.pdf` | 4 research PDFs (932,744 – 17,729,048 B) | Design research only. `DESIGN_RULES.md` is a build input, not content. |
| Other old-portfolio artwork and titles | e.g. `oldman2.JPG`, `eye.jpg`, series titles | Only three drawings are used, with descriptive captions |

#!/usr/bin/env node
/**
 * Reproducible media pipeline for the portfolio.
 *
 * Reads original materials in place (never modifies or moves them) and writes
 * optimized derivatives to public/media/. Intermediate renders (PDF pages,
 * extracted frames, composed covers) go to .media-cache/, which is ignored.
 *
 * Usage:
 *   node scripts/prepare-media.mjs            # everything
 *   node scripts/prepare-media.mjs video      # video derivatives only
 *   node scripts/prepare-media.mjs images     # frames, PDF excerpts, images, covers
 *   node scripts/prepare-media.mjs stage      # background set video + posters, film stills
 *   node scripts/prepare-media.mjs creative   # Art drawings (all 23), film stills
 *   node scripts/prepare-media.mjs covers     # 3:4 cover compositions (carousel, Work shelf, next project)
 *   node scripts/prepare-media.mjs covers cover-cafepress-uk   # one cover only
 *   node scripts/prepare-media.mjs social     # link-preview image only
 *   node scripts/prepare-media.mjs traction   # Jumpstart pitch traction excerpt only
 *   node scripts/prepare-media.mjs phones     # carousel phone PNGs (normalized), CafePress monitor, art video
 *
 * Requires: ffmpeg/ffprobe, poppler (pdftoppm, pdfimages), sharp, and
 * Playwright's Chromium (for the typographic cover and social image).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OLD_ART = '/Users/harliekatz/Desktop/old portfolio copy/public/art'
const CACHE = join(ROOT, '.media-cache')
const OUT = join(ROOT, 'public', 'media')
const IMG = join(OUT, 'img')
const VID = join(OUT, 'video')

const src = (p) => join(ROOT, p)
const ensure = (d) => mkdirSync(d, { recursive: true })
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
const report = []

/* ------------------------------------------------------------------ */
/* Video                                                                */
/* ------------------------------------------------------------------ */

const VIDEOS = [
  // Screen recordings: 60fps timebase → 30fps, no audio stream, no cropping.
  // `trim` ends each recording before the macOS capture toolbar appears
  // (first visible at 56.45s and 36.55s respectively).
  { id: 'merch-console', src: 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', trim: 56.3, variants: [
    { suffix: '1600', scale: '1600:-2', crf: 23, fps: 30 },
    { suffix: '960', scale: '960:-2', crf: 24, fps: 30 },
  ], audio: false },
  { id: 'spreadsheet-agent', src: 'Spreadsheet Agent/Spreadsheet Video.mov', trim: 36.4, variants: [
    { suffix: '1600', scale: '1600:-2', crf: 23, fps: 30 },
    { suffix: '960', scale: '960:-2', crf: 24, fps: 30 },
  ], audio: false },
  // Aristocracy: 4000×3000 master (544MB). Preserve 4:3.
  { id: 'aristocracy', src: 'Shift Content/Aristocracy.mp4', variants: [
    { suffix: '1440', scale: '1440:1080', crf: 23, maxrate: '3000k' },
    { suffix: '960', scale: '960:720', crf: 24, maxrate: '1600k' },
  ], audio: true },
  { id: 'heck', src: 'Shift Content/Heck Video.mp4', variants: [
    { suffix: '1080', scale: '1920:1080', crf: 23, maxrate: '2600k' },
    { suffix: '720', scale: '1280:720', crf: 24, maxrate: '1500k' },
  ], audio: true },
]

function encodeVideo(v) {
  for (const variant of v.variants) {
    const out = join(VID, `${v.id}-${variant.suffix}.mp4`)
    if (existsSync(out) && !process.env.FORCE) { report.push(`skip ${out}`); continue }
    const vf = [`scale=${variant.scale}:flags=lanczos`]
    if (variant.fps) vf.push(`fps=${variant.fps}`)
    const args = ['-y', '-v', 'error', '-i', src(v.src), ...(v.trim ? ['-t', String(v.trim)] : []),
      '-map', '0:v:0', ...(v.audio ? ['-map', '0:a:0?'] : []),
      '-vf', vf.join(','),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(variant.crf),
      '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      ...(variant.maxrate ? ['-maxrate', variant.maxrate, '-bufsize', `${parseInt(variant.maxrate) * 2}k`] : []),
      ...(v.audio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']),
      '-movflags', '+faststart', out]
    console.log(`encoding ${out}`)
    run('ffmpeg', args)
    report.push(`${out} ${(statSync(out).size / 1e6).toFixed(1)}MB`)
  }
}

function copyNickleby() {
  // Source is already H.264 Main/yuv420p, ~0.45 Mbps, moov-first. Re-encoding
  // would only lose quality, so remux losslessly with fast-start.
  const out = join(VID, 'nickleby-640.mp4')
  run('ffmpeg', ['-y', '-v', 'error', '-i', src('Shift Content/Nickleby Capital Video 1.mp4'),
    '-c', 'copy', '-movflags', '+faststart', out])
  report.push(`${out} ${(statSync(out).size / 1e6).toFixed(1)}MB (lossless remux)`)
}

/* ------------------------------------------------------------------ */
/* Frames and PDF excerpts (into cache)                                 */
/* ------------------------------------------------------------------ */

const FRAMES = [
  // [cache name, source, seconds]
  ['merch-catalog', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 8.5],
  ['merch-overview', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 0.3],
  ['merch-vendors', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 28.7],
  ['merch-drawer', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 53.9],
  ['sheet-request', 'Spreadsheet Agent/Spreadsheet Video.mov', 12.9],
  ['sheet-returned', 'Spreadsheet Agent/Spreadsheet Video.mov', 25.3],
  ['sheet-list', 'Spreadsheet Agent/Spreadsheet Video.mov', 35.5],
  ['sheet-start', 'Spreadsheet Agent/Spreadsheet Video.mov', 1.5],
  ['sheet-plan', 'Spreadsheet Agent/Spreadsheet Video.mov', 20.5],
  ['merch-replenish', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 12.0],
  ['merch-ask', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 46.0],
  ['merch-promotions', 'PlanetArt/Merchandising Dashboard/Dashboard Video.mov', 36.5],
  ['aristocracy-poster', 'Shift Content/Aristocracy.mp4', 30.5],
  ['nickleby-poster', 'Shift Content/Nickleby Capital Video 1.mp4', 12.0],
  ['heck-poster', 'Shift Content/Heck Video.mp4', 30.0],
]

function extractFrames() {
  const dir = join(CACHE, 'frames')
  ensure(dir)
  for (const [name, file, t] of FRAMES) {
    const out = join(dir, `${name}.png`)
    run('ffmpeg', ['-y', '-v', 'error', '-ss', String(t), '-i', src(file), '-frames:v', '1', out])
  }
}

function extractPdf() {
  const dir = join(CACHE, 'pdf')
  ensure(dir)
  const deck = src('PlanetArt/planetart presentation.pdf')
  // Slides 4 (competitors) and 5 (curated UK assortment) at 200dpi → 2000×1125.
  run('pdftoppm', ['-r', '200', '-f', '4', '-l', '5', '-png', deck, join(dir, 'slide')])
  // PDF pages 11 and 12 embed the original concept images at native resolution
  // (808×514 dashboard on page 11, 620×414 concept map on page 12).
  run('pdfimages', ['-f', '11', '-l', '12', '-png', deck, join(dir, 'embedded')])
}

/* ------------------------------------------------------------------ */
/* Image variants                                                       */
/* ------------------------------------------------------------------ */

/**
 * Writes `${id}-${w}.{avif,webp,jpg|png}` for each width not exceeding the
 * source width. `fallback` is 'jpg' for photos and screenshots, 'png' for
 * images that need transparency.
 */
async function variants(id, input, widths, { fallback = 'jpg', quality = 'photo' } = {}) {
  const base = sharp(input, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  const srcW = meta.autoOrient?.width ?? meta.width
  const srcH = meta.autoOrient?.height ?? meta.height
  const used = [...new Set(widths.map((w) => Math.min(w, srcW)))]
  const q = quality === 'ui'
    ? { avif: { quality: 72, chromaSubsampling: '4:4:4' }, webp: { quality: 90, smartSubsample: true }, jpg: { quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true } }
    : { avif: { quality: 58 }, webp: { quality: 80 }, jpg: { quality: 82, mozjpeg: true } }
  for (const w of used) {
    const resized = () => sharp(input, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true })
    await resized().avif(q.avif).toFile(join(IMG, `${id}-${w}.avif`))
    await resized().webp(q.webp).toFile(join(IMG, `${id}-${w}.webp`))
    if (fallback === 'png') await resized().png({ compressionLevel: 9, palette: false }).toFile(join(IMG, `${id}-${w}.png`))
    else await resized().flatten({ background: '#11131b' }).jpeg(q.jpg).toFile(join(IMG, `${id}-${w}.jpg`))
  }
  report.push(`${id}: ${srcW}×${srcH} → ${used.join(', ')}`)
  return { width: srcW, height: srcH, widths: used }
}


/**
 * The supplied phone screenshots sit on an opaque white or pale-green matte.
 * Remove only the matte: flood-fill light pixels reachable from the image
 * border (the black phone bezel stops the fill), then soften the 1px edge.
 * Screen content inside the bezel is never touched.
 */
async function removeMatte(input, out) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  const removed = new Uint8Array(w * h)
  const stack = []
  const seed = (x, y) => { const k = y * w + x; if (!removed[k] && lum(k * 4) > 120) { removed[k] = 1; stack.push(k) } }
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1) }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y) }
  while (stack.length) {
    const k = stack.pop(); const x = k % w; const y = (k - x) / w
    if (x > 0) seed(x - 1, y); if (x < w - 1) seed(x + 1, y)
    if (y > 0) seed(x, y - 1); if (y < h - 1) seed(x, y + 1)
  }
  // Keep only the largest remaining component (the phone); drop stray specks
  // of the matte that the border fill could not reach (e.g. a dark corner).
  const label = new Int32Array(w * h).fill(-1)
  const sizes = []
  for (let start = 0; start < w * h; start++) {
    if (removed[start] || label[start] !== -1) continue
    const id = sizes.length
    let size = 0
    const q = [start]
    label[start] = id
    while (q.length) {
      const k = q.pop(); size++
      const x = k % w; const y = (k - x) / w
      const nb = [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, y > 0 ? k - w : -1, y < h - 1 ? k + w : -1]
      for (const n of nb) if (n >= 0 && !removed[n] && label[n] === -1) { label[n] = id; q.push(n) }
    }
    sizes.push(size)
  }
  const keep = sizes.indexOf(Math.max(...sizes))
  for (let k = 0; k < w * h; k++) if (!removed[k] && label[k] !== keep) removed[k] = 1
  for (let k = 0; k < w * h; k++) {
    const i = k * 4
    if (removed[k]) { data[i + 3] = 0; continue }
    const x = k % w; const y = (k - x) / w
    const edge = (x > 0 && removed[k - 1]) || (x < w - 1 && removed[k + 1]) || (y > 0 && removed[k - w]) || (y < h - 1 && removed[k + w])
    if (edge) { data[i + 3] = Math.round(255 * (1 - lum(i) / 255)); data[i] = data[i + 1] = data[i + 2] = 0 }
  }
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(out)
  return out
}

async function cropTo(input, out, { left, top, width, height }) {
  await sharp(input).extract({ left, top, width, height }).png().toFile(out)
  return out
}

/* ------------------------------------------------------------------ */
/* Typographic compositions (Playwright)                                 */
/* ------------------------------------------------------------------ */

async function renderHtml(html, out, width, height) {
  const { chromium } = await import('@playwright/test')
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out, type: 'png' })
  await browser.close()
  return out
}

// Compositions are rendered from about:blank, which cannot load file:// URLs,
// so fonts and images are inlined as data URIs.
const dataUrl = (p, type) => `data:${type};base64,${readFileSync(p).toString('base64')}`
const fontUrl = dataUrl(join(ROOT, 'public/fonts/InterVariable.woff2'), 'font/woff2')
const fileUrl = (p) => dataUrl(p, 'image/png')
const baseCss = `
@font-face { font-family: Inter; src: url('${fontUrl}') format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { background: #11131b; color: #f4f5fa; font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
`

function socialHtml() {
  return `<!doctype html><html><head><style>${baseCss}
body { background:
  radial-gradient(60% 80% at 78% 60%, rgba(82,103,255,.28) 0%, rgba(120,96,232,.12) 40%, rgba(9,10,15,0) 75%), #090a0f;
  padding: 88px 96px; display: flex; flex-direction: column; justify-content: flex-end; }
h1 { font-size: 104px; font-weight: 560; letter-spacing: -0.045em; line-height: 1; }
.kicker { margin-top: 28px; font-size: 24px; font-weight: 500; color: #b0b4c3; letter-spacing: 0.08em; text-transform: uppercase; }
p { margin-top: 18px; max-width: 900px; font-size: 38px; line-height: 1.25; color: #d9dbe4; letter-spacing: -0.015em; }
</style></head><body><h1>Harlie Katz</h1><div class="kicker">Portfolio</div><p>Selected work in applied AI, product development, and creative production.</p></body></html>`
}

/** The link-preview card: the homepage's own opening text (no other positioning line). */
async function social() {
  await renderHtml(socialHtml(), join(CACHE, 'social-preview.png'), 1200, 630)
  await sharp(join(CACHE, 'social-preview.png')).jpeg({ quality: 86, mozjpeg: true }).toFile(join(ROOT, 'public', 'social-preview.jpg'))
}

/**
 * Jumpstart Results evidence: an excerpt of the program pitch's Traction &
 * Validation slide (PDF page 10 at 200dpi, 4000×2250), limited to the title
 * and the line "150 sign-ups in 24 hours". Left out: the second bullet
 * ("Encouraging customer interviews", not verified), the Instagram profile
 * with other people's handles, and the reels with people's faces.
 */
async function jumpstartTraction() {
  const dir = join(CACHE, 'pdf')
  ensure(dir)
  run('pdftoppm', ['-r', '200', '-f', '10', '-l', '10', '-png', src('JumpStart Finance/jumpstart presentation.pdf.pdf'), join(dir, 'jumpstart')])
  const page = readdirSync(dir).find((n) => /^jumpstart-0*10\.png$/.test(n))
  const out = join(dir, 'jumpstart-traction.png')
  await sharp(join(dir, page)).extract({ left: 0, top: 1560, width: 2040, height: 492 }).toFile(out)
  return variants('jumpstart-traction', out, [600, 1000, 2040], { quality: 'ui' })
}

/* ------------------------------------------------------------------ */
/* Images task                                                          */
/* ------------------------------------------------------------------ */

async function images() {
  ensure(IMG)
  ensure(join(CACHE, 'covers'))
  extractFrames()
  extractPdf()
  const F = (n) => join(CACHE, 'frames', `${n}.png`)
  const dims = {}

  // Jumpstart phones without their opaque matte (see removeMatte).
  const phone = (n) => join(CACHE, 'covers', `proto-${n}.png`)
  for (const n of [1, 2, 3, 4]) await removeMatte(src(`JumpStart Finance/proto ${n}.png`), phone(n))

  // Carousel / shelf / next-project covers are the 3:4 compositions (task `covers`, covers3x4()).

  // PlanetArt evidence
  dims['planetart-uk'] = await variants('planetart-uk', src('PlanetArt/cafepress uk/uk web.png'), [800, 1200, 1672], { quality: 'ui' })
  const pdf = (n) => join(CACHE, 'pdf', n)
  await cropTo(pdf('slide-04.png'), pdf('competitors-crop.png'), { left: 60, top: 60, width: 1880, height: 1000 })
  await cropTo(pdf('slide-05.png'), pdf('assortment-crop.png'), { left: 36, top: 60, width: 1952, height: 1040 })
  dims['planetart-competitors'] = await variants('planetart-competitors', pdf('competitors-crop.png'), [800, 1200, 1880], { quality: 'ui' })
  dims['planetart-assortment'] = await variants('planetart-assortment', pdf('assortment-crop.png'), [800, 1200, 1952], { quality: 'ui' })
  // Locate the embedded originals by their native size rather than by index.
  const embedded = async (w, h) => {
    for (const f of readdirSync(join(CACHE, 'pdf')).filter((n) => n.startsWith('embedded-'))) {
      const m = await sharp(pdf(f)).metadata()
      if (m.width === w && m.height === h) return pdf(f)
    }
    throw new Error(`embedded image ${w}×${h} not found`)
  }
  dims['planetart-concept-dashboard'] = await variants('planetart-concept-dashboard', await embedded(808, 514), [808], { quality: 'ui' })
  dims['planetart-concept-workflow'] = await variants('planetart-concept-workflow', await embedded(620, 414), [620], { quality: 'ui' })
  // The product spreadsheet embedded beside the "Problem" text (PDF page 11):
  // the real "before" state to the concept dashboard's "after".
  dims['planetart-concept-table'] = await variants('planetart-concept-table', await embedded(681, 217), [681], { quality: 'ui' })
  for (const n of ['merch-catalog', 'merch-vendors', 'merch-drawer']) {
    dims[n] = await variants(n, F(n), [800, 1200, 1600], { quality: 'ui' })
  }
  dims['merch-console-poster'] = await variants('merch-console-poster', F('merch-overview'), [960, 1600], { quality: 'ui' })

  // Spreadsheet Agent
  for (const n of ['sheet-request', 'sheet-returned', 'sheet-list']) {
    dims[n] = await variants(n, F(n), [800, 1200, 1600], { quality: 'ui' })
  }
  for (const n of ['sheet-plan', 'merch-replenish', 'merch-ask', 'merch-promotions']) {
    dims[n] = await variants(n, F(n), [800, 1200, 1600], { quality: 'ui' })
  }
  dims['spreadsheet-agent-poster'] = await variants('spreadsheet-agent-poster', F('sheet-start'), [960, 1600], { quality: 'ui' })

  // Valiance
  dims['valiance-messages'] = await variants('valiance-messages', src('Valiance Capital/messages.png'), [800, 1200, 1672], { quality: 'ui' })

  // Jumpstart (phone frames carry transparency → PNG fallback)
  for (const n of [1, 2, 3, 4]) {
    dims[`jumpstart-proto-${n}`] = await variants(`jumpstart-proto-${n}`, phone(n), [320, 640], { fallback: 'png', quality: 'ui' })
  }
  dims['jumpstart-competitors'] = await variants('jumpstart-competitors', src('JumpStart Finance/competitors.png'), [800, 1200, 1680, 2494], { fallback: 'png', quality: 'ui' })
  dims['jumpstart-business-model'] = await variants('jumpstart-business-model', src('JumpStart Finance/business model.png'), [800, 1200, 2016], { fallback: 'png', quality: 'ui' })
  dims['jumpstart-traction'] = await jumpstartTraction()

  // Shift
  dims['aristocracy-poster'] = await variants('aristocracy-poster', F('aristocracy-poster'), [960, 1440])
  dims['nickleby-poster'] = await variants('nickleby-poster', F('nickleby-poster'), [1138])
  dims['heck-poster'] = await variants('heck-poster', F('heck-poster'), [1280, 1920])
  for (const n of ['234', '103', '077']) {
    dims[`aristocracy-photo-${n}`] = await variants(`aristocracy-photo-${n}`, src(`Shift Content/Aristocracy-${n}.jpg`), [480, 800, 1200])
  }

  // About
  dims['headshot'] = await variants('headshot', src('personal assets/headshot copy.PNG'), [360, 640])
  dims['drawing-oldwoman'] = await variants('drawing-oldwoman', join(OLD_ART, 'oldwoman.JPG'), [480, 800, 1200])
  dims['drawing-oldman'] = await variants('drawing-oldman', join(OLD_ART, 'oldman.jpg'), [480, 800, 1200])
  dims['drawing-hands'] = await variants('drawing-hands', join(OLD_ART, 'hands.jpg'), [480, 800, 1179])

  // Social preview + résumé
  await social()
  ensure(join(ROOT, 'public', 'resume'))
  // The portfolio copy: the original without the phone number and the response-time claim (scripts/portfolio-resume.py).
  run('python3', [join(ROOT, 'scripts', 'portfolio-resume.py'), src('personal assets/Harlie Katz Resume PDF copy.pdf'), join(ROOT, 'public', 'resume', 'harlie-katz-resume.pdf')])

  writeFileSync(join(CACHE, 'dimensions.json'), JSON.stringify(dims, null, 2))
}


/* ------------------------------------------------------------------ */
/* Working Model stage (homepage atmosphere + moving fragments)          */
/* ------------------------------------------------------------------ */

const STAGE_SRC = 'inspiration/working-model-assets/background video.mp4'

/**
 * Background stage: a decorative 6s architectural loop (1112×834, 24fps).
 * Audio is stripped. Desktop keeps the full 4:3 frame (CSS covers it at
 * object-position 50% 55%); mobile gets a portrait crop so phones never
 * download the wide file. Posters are frame 0 of each, so the page never
 * flashes black before playback.
 */
async function workingModel() {
  ensure(VID); ensure(IMG); ensure(join(CACHE, 'frames'))
  const enc = (out, vf, crf) => {
    run('ffmpeg', ['-y', '-v', 'error', '-i', src(STAGE_SRC), '-an', '-vf', vf,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-tune', 'grain', '-movflags', '+faststart', join(VID, out)])
    report.push(`${out} ${(statSync(join(VID, out)).size / 1e6).toFixed(2)}MB`)
  }
  // Mobile: 9:16 crop centred at 50% (the floor reflection stays in the lower third).
  enc('stage-desktop.mp4', 'scale=1112:834', 22)
  enc('stage-mobile.mp4', 'crop=470:834:(iw-470)/2:0', 22)
  const frame = (name, vf) => {
    const out = join(CACHE, 'frames', `${name}.png`)
    run('ffmpeg', ['-y', '-v', 'error', '-i', src(STAGE_SRC), '-frames:v', '1', '-vf', vf, out])
    return out
  }
  await variants('stage-poster-desktop', frame('stage-poster-desktop', 'scale=1112:834'), [1112], { quality: 'photo' })
  await variants('stage-poster-mobile', frame('stage-poster-mobile', 'crop=470:834:(iw-470)/2:0'), [470], { quality: 'photo' })

  // Film-strip stills (real frames from the three published films).
  const STILLS = [
    ['film-aristocracy-a', 'Shift Content/Aristocracy.mp4', 10, 'crop=4000:2250:0:150'],
    ['film-aristocracy-b', 'Shift Content/Aristocracy.mp4', 55, 'crop=4000:2250:0:150'],
    ['film-nickleby-a', 'Shift Content/Nickleby Capital Video 1.mp4', 25, 'null'],
    // A wide interview frame (not B-roll: individual camera credits are not documented).
    ['film-nickleby-b', 'Shift Content/Nickleby Capital Video 1.mp4', 50, 'null'],
    ['film-heck-a', 'Shift Content/Heck Video.mp4', 10, 'null'],
    ['film-heck-b', 'Shift Content/Heck Video.mp4', 20, 'null'],
  ]
  for (const [name, file, t, vf] of STILLS) {
    const out = join(CACHE, 'frames', `${name}.png`)
    run('ffmpeg', ['-y', '-v', 'error', '-ss', String(t), '-i', src(file), '-frames:v', '1', '-vf', vf, out])
    await variants(name, out, [320, 640])
  }

  // Spreadsheet Agent intermediate state: "Interpreting request" (18.9s).
  const interp = join(CACHE, 'frames', 'sheet-interpreting.png')
  run('ffmpeg', ['-y', '-v', 'error', '-ss', '18.9', '-i', src('Spreadsheet Agent/Spreadsheet Video.mov'), '-frames:v', '1', interp])
  await variants('sheet-interpreting', interp, [800, 1200, 1600], { quality: 'ui' })
}

/* ------------------------------------------------------------------ */
/* Creative work: Art and Film pages (from Harlie's previous portfolio)  */
/* ------------------------------------------------------------------ */

/* Every drawing in the previous portfolio's public/art folder (23 files); the Art archive shows them all in Harlie's own series. */
const ART = ['oldwoman.JPG', 'oldman.jpg', 'oldman2.JPG', 'eye.jpg', 'hands.jpg', 'baby.jpg', 'close.jpg', 'nyu.jpg', 'turn.jpg', 'two.jpg', 'long.jpg', 'drip.jpg', 'line.jpg', 'tree.jpg',
  'bite.jpg', 'blur.jpg', 'body.jpg', 'draw.jpg', 'man.jpg', 'scribble.jpg', 'sex.jpg', 'smoke.jpg', 'square.jpg']
const FILM_STILLS = [
  ['film-artistic-end', 'art.jpg'], ['film-before-i-wilt', 'wilt.jpg'], ['film-alex', 'shana.png'], ['film-my-world', 'world.png'],
  ['film-velvet', 'blood.png'], ['film-first-edition', 'peter.png'], ['film-relay', 'hope.png'],
]
const OLD_PUBLIC = '/Users/harliekatz/Desktop/old portfolio copy/public'

async function creative() {
  ensure(IMG)
  for (const f of ART) {
    const id = 'drawing-' + f.replace(/\.(jpe?g|JPG)$/, '').toLowerCase()
    await variants(id, join(OLD_ART, f), [480, 800, 1200])
  }
  for (const [id, f] of FILM_STILLS) await variants(id, join(OLD_PUBLIC, f), [640, 1280, 1920])
}

/* ------------------------------------------------------------------ */
/* 3:4 cover compositions (carousel tiles, Work shelf thumbnails,        */
/* next-project links). Real evidence only, each screenshot CONTAINED    */
/* (never cropped into an unreadable strip); a second, magnified crop of */
/* the same evidence fills the portrait. Ambient light: violet, green    */
/* for Jumpstart, warm for client films. Masters 1200x1600.              */
/* ------------------------------------------------------------------ */

const COVER_3x4 = [240, 480, 720, 960, 1200]

/** A dark room with one soft pool of ambient light behind the evidence. */
const room = (tint) => `
body { position: relative; width: 1200px; height: 1600px; overflow: hidden; background:
  radial-gradient(70% 42% at 50% 34%, ${tint} 0%, rgba(11,12,18,0) 72%),
  radial-gradient(90% 60% at 50% 100%, rgba(255,255,255,.035) 0%, rgba(11,12,18,0) 60%),
  #0b0c12; }
.pane { position: absolute; border-radius: 18px; overflow: hidden; background: #fff;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,.10), 0 40px 80px -30px rgba(0,0,0,.85), 0 12px 30px -12px rgba(0,0,0,.6); }
.pane img { display: block; width: 100%; height: 100%; object-fit: cover; }
.crop { position: absolute; border-radius: 18px; overflow: hidden;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,.10), 0 40px 80px -30px rgba(0,0,0,.85); }
.crop img { position: absolute; display: block; max-width: none; }
.tag { position: absolute; left: 60px; top: 58px; padding: 10px 18px; border-radius: 999px; background: rgba(11,12,18,.72);
  box-shadow: inset 0 0 0 1.5px rgba(238,234,226,.28); color: #eeeae2; font: 500 26px/1 Inter, sans-serif; letter-spacing: .01em; }
`

/**
 * One magnified region of a source image, shown in a box of the given size.
 * `region` is in source pixels; the region is scaled to fill the box width.
 */
const cropBox = (file, sw, sh, region, box) => {
  const k = box.w / region.w
  return `<div class="crop" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${Math.round(region.h * k)}px">
    <img src="${fileUrl(file)}" style="width:${Math.round(sw * k)}px;height:${Math.round(sh * k)}px;left:${Math.round(-region.x * k)}px;top:${Math.round(-region.y * k)}px"></div>`
}

const pane = (file, box) => `<div class="pane" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px"><img src="${fileUrl(file)}"></div>`

const doc = (tint, body) => `<!doctype html><html><head><style>${baseCss}${room(tint)}</style></head><body>${body}</body></html>`

/** `covers <id>` renders one cover only (e.g. `covers cover-cafepress-uk`). */
const only = (id) => !process.argv[3] || process.argv[3] === id

async function covers3x4() {
  ensure(IMG); ensure(join(CACHE, 'covers'))
  const F = (n) => join(CACHE, 'frames', `${n}.png`)
  const out = (id) => join(CACHE, 'covers', `${id}.png`)
  const violet = 'rgba(150,120,235,.30)'
  const uk = src('PlanetArt/cafepress uk/uk web.png')
  const msgs = src('Valiance Capital/messages.png')
  for (const n of ['merch-catalog', 'merch-replenish', 'sheet-returned', 'sheet-plan']) {
    if (!existsSync(F(n))) throw new Error(`missing frame ${n}; run the images task first`)
  }

  // CafePress UK: the whole storefront prototype, then the research behind it (the
  // Competitor Findings slide: title, competitors reviewed, key patterns observed;
  // the logo row at the bottom right is left out). The pair is centred vertically.
  const findings = join(CACHE, 'pdf', 'competitors-crop.png')
  if (!existsSync(findings)) throw new Error('missing competitors-crop.png; run the images task first')
  if (only('cover-cafepress-uk')) await renderHtml(doc(violet,
    pane(uk, { x: 60, y: 236, w: 1080, h: 608 }) +
    cropBox(findings, 1880, 1000, { x: 30, y: 24, w: 1740, h: 750 }, { x: 60, y: 898, w: 1080 })), out('cover-cafepress-uk'), 1200, 1600)

  // Merchandising Platform: the synthetic catalog, then the product drawer with its replenishment calculation.
  if (only('cover-merchandising-platform')) await renderHtml(doc(violet,
    pane(F('merch-catalog'), { x: 60, y: 150, w: 1080, h: 546 }) +
    cropBox(F('merch-replenish'), 2940, 1486, { x: 1896, y: 0, w: 1044, h: 800 }, { x: 60, y: 750, w: 1080 })), out('cover-merchandising-platform'), 1200, 1600)

  // Spreadsheet Agent: the returned sheet, then the build plan shown for review before the sheet is created.
  if (only('cover-spreadsheet-agent')) await renderHtml(doc('rgba(150,170,235,.26)',
    pane(F('sheet-returned'), { x: 60, y: 150, w: 1080, h: 546 }) +
    cropBox(F('sheet-plan'), 2940, 1486, { x: 2168, y: 240, w: 772, h: 990 }, { x: 290, y: 746, w: 620 })), out('cover-spreadsheet-agent'), 1200, 1600)

  // AI Leasing Agent: the illustrative (synthetic) conversation, labelled on the cover itself, then its message thread.
  if (only('cover-ai-leasing-agent')) await renderHtml(doc(violet,
    '<p class="tag">Illustrative conversation, invented data</p>' +
    pane(msgs, { x: 60, y: 150, w: 1080, h: 608 }) +
    cropBox(msgs, 1672, 941, { x: 268, y: 210, w: 872, h: 620 }, { x: 60, y: 808, w: 1080 })), out('cover-ai-leasing-agent'), 1200, 1600)

  // Jumpstart Finance: three prototype phones together (overview only), green ambient.
  const phone = (n) => join(CACHE, 'covers', `proto-${n}.png`)
  if (only('cover-jumpstart-finance')) await renderHtml(`<!doctype html><html><head><style>${baseCss}${room('rgba(92,201,138,.24)')}
.ph { position: absolute; height: auto; filter: drop-shadow(0 34px 44px rgba(0,0,0,.55)); }
</style></head><body>
<img class="ph" src="${fileUrl(phone(3))}" style="left:40px;top:430px;width:460px">
<img class="ph" src="${fileUrl(phone(2))}" style="right:40px;top:430px;width:452px">
<img class="ph" src="${fileUrl(phone(1))}" style="left:50%;transform:translateX(-50%);top:262px;width:560px">
</body></html>`, out('cover-jumpstart-finance'), 1200, 1600)

  // Client Work: one real frame from each of the three agency films, warm ambient.
  const still = (file, box) => `<div class="pane" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${Math.round(box.w * 9 / 16)}px;background:#000"><img src="${fileUrl(file)}"></div>`
  if (only('cover-client-work')) await renderHtml(doc('rgba(233,176,103,.22)',
    still(F('nickleby-poster'), { x: 60, y: 70, w: 1000 }) +
    still(join(CACHE, 'frames', 'film-aristocracy-b.png'), { x: 140, y: 540, w: 1000 }) +
    still(join(CACHE, 'frames', 'film-heck-a.png'), { x: 60, y: 1010, w: 1000 })), out('cover-client-work'), 1200, 1600)

  const dimsFile = join(CACHE, 'covers-3x4.json')
  const dims = existsSync(dimsFile) ? JSON.parse(readFileSync(dimsFile, 'utf8')) : {}
  for (const id of ['cover-cafepress-uk', 'cover-merchandising-platform', 'cover-spreadsheet-agent', 'cover-ai-leasing-agent', 'cover-jumpstart-finance', 'cover-client-work']) {
    if (!only(id)) continue
    dims[id] = await variants(id, out(id), COVER_3x4, { quality: id === 'cover-client-work' ? 'photo' : 'ui' })
  }
  writeFileSync(join(CACHE, 'covers-3x4.json'), JSON.stringify(dims, null, 2))
}

/* ------------------------------------------------------------------ */
/* Phone mockups (homepage carousel) and presentation mockups           */
/* ------------------------------------------------------------------ */

/**
 * The supplied transparent phone PNGs (png assets/final png tiles/) use
 * different canvases and margins, so the same CSS height would draw
 * phones of different apparent sizes. Each phone body is measured from
 * its opaque pixels (alpha ≥ 250, which excludes the soft baked halo),
 * scaled so every body is PHONE_BODY_H tall, and centred on one shared
 * transparent canvas. Artwork is never cropped, stretched, or recoloured;
 * the baked halo is kept as supplied.
 */
const PHONES = [
  { id: 'phone-cafepress-uk', src: 'png assets/final png tiles/uk.png' },
  { id: 'phone-merchandising-platform', src: 'png assets/final png tiles/merch dash.png' },
  { id: 'phone-spreadsheet-agent', src: 'png assets/final png tiles/spreadsheet.png' },
  { id: 'phone-ai-leasing-agent', src: 'png assets/final png tiles/valiance.png' },
  { id: 'phone-jumpstart-finance', src: 'png assets/final png tiles/jumpstart.png' },
  { id: 'phone-client-work', src: 'png assets/final png tiles/shift.png' },
  // Supplied redraws of the 2024 Jumpstart prototype screens (presentation only; the case uses the original screens as evidence).
  { id: 'jumpstart-mockup-home', src: 'png assets/jumpstart home.png' },
  { id: 'jumpstart-mockup-lessons', src: 'png assets/jumpstart lessons.png' },
  { id: 'jumpstart-mockup-path', src: 'png assets/jumpstart path.png' },
  { id: 'jumpstart-mockup-community', src: 'png assets/jumpstart chat.png' },
]
const PHONE_BODY_H = 1600
const PHONE_PAD = 72
const PHONE_CANVAS = { width: 944, height: PHONE_BODY_H + PHONE_PAD * 2 }
const PHONE_WIDTHS = [264, 396, 528, 792]

async function alphaBox(input, threshold) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] >= threshold) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, canvasW: info.width, canvasH: info.height }
}

async function phones() {
  ensure(join(CACHE, 'phones'))
  const dims = {}
  for (const ph of PHONES) {
    if (!only(ph.id)) continue
    const input = src(ph.src)
    const body = await alphaBox(input, 250)
    const k = PHONE_BODY_H / body.height
    const scaledW = Math.round(body.canvasW * k)
    const scaledH = Math.round(body.canvasH * k)
    const scaled = await sharp(input).ensureAlpha().resize({ width: scaledW, height: scaledH, kernel: 'lanczos3' }).png().toBuffer()
    // Place the scaled canvas so the body is centred horizontally and starts PHONE_PAD from the top.
    const bodyLeft = Math.round(body.left * k)
    const bodyTop = Math.round(body.top * k)
    const bodyW = Math.round(body.width * k)
    const offX = Math.round((PHONE_CANVAS.width - bodyW) / 2) - bodyLeft
    const offY = PHONE_PAD - bodyTop
    // Crop the scaled canvas to what falls inside the shared canvas (only transparent margin is lost).
    const cl = Math.max(0, -offX), ct = Math.max(0, -offY)
    const cw = Math.min(scaledW - cl, PHONE_CANVAS.width - Math.max(0, offX))
    const ch = Math.min(scaledH - ct, PHONE_CANVAS.height - Math.max(0, offY))
    const piece = await sharp(scaled).extract({ left: cl, top: ct, width: cw, height: ch }).png().toBuffer()
    const master = join(CACHE, 'phones', `${ph.id}.png`)
    await sharp({ create: { width: PHONE_CANVAS.width, height: PHONE_CANVAS.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: piece, left: Math.max(0, offX), top: Math.max(0, offY) }])
      .png()
      .toFile(master)
    const check = await alphaBox(master, 250)
    report.push(`${ph.id}: body ${body.width}×${body.height} in ${body.canvasW}×${body.canvasH} → body ${check.width}×${check.height} at (${check.left},${check.top})`)
    dims[ph.id] = { ...(await variants(ph.id, master, PHONE_WIDTHS, { fallback: 'png', quality: 'ui' })), body: { x: check.left, y: check.top, w: check.width, h: check.height } }
  }
  if (only('cafepress-monitor')) {
    // A desktop monitor presenting the actual storefront prototype (PlanetArt/cafepress uk/uk web.png). Trimmed to its visible pixels.
    const input = src('png assets/uk website.png')
    const b = await alphaBox(input, 8)
    const pad = 12
    const trimmed = join(CACHE, 'phones', 'cafepress-monitor.png')
    await sharp(input).extract({ left: Math.max(0, b.left - pad), top: Math.max(0, b.top - pad), width: Math.min(b.canvasW, b.width + pad * 2), height: Math.min(b.canvasH, b.height + pad * 2) }).png().toFile(trimmed)
    dims['cafepress-monitor'] = await variants('cafepress-monitor', trimmed, [720, 1080, 1400], { fallback: 'png', quality: 'ui' })
  }
  if (only('art-portfolio')) {
    // The original creative portfolio's art video, re-encoded without audio for the About preview.
    const out = join(VID, 'art-portfolio-960.mp4')
    run('ffmpeg', ['-y', '-v', 'error', '-i', join(OLD_PUBLIC, 'art-tile.mp4'), '-map', '0:v:0', '-vf', 'scale=960:-2:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
      '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out])
    report.push(`${out} ${(statSync(out).size / 1e6).toFixed(1)}MB`)
    dims['art-portfolio-poster'] = await variants('art-portfolio-poster', join(OLD_PUBLIC, 'posters', 'art-tile.jpg'), [640, 960])
  }
  writeFileSync(join(CACHE, 'phones.json'), JSON.stringify(dims, null, 2))
}
/* ------------------------------------------------------------------ */

const task = process.argv[2] ?? 'all'
ensure(CACHE); ensure(OUT); ensure(VID); ensure(IMG)
if (task === 'video' || task === 'all') {
  for (const v of VIDEOS) encodeVideo(v)
  copyNickleby()
}
if (task === 'images' || task === 'all') await images()
if (task === 'stage' || task === 'all') await workingModel()
if (task === 'creative' || task === 'all') await creative()
if (task === 'covers' || task === 'all') await covers3x4()
if (task === 'social') await social()
if (task === 'traction') await jumpstartTraction()
if (task === 'phones' || task === 'all') await phones()
console.log(report.join('\n'))
if (existsSync(join(CACHE, 'dimensions.json'))) console.log('dimensions → .media-cache/dimensions.json')

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
 *   node scripts/prepare-media.mjs stage      # Working Model background stage + fragments
 *
 * Requires: ffmpeg/ffprobe, poppler (pdftoppm, pdfimages), sharp, and
 * Playwright's Chromium (for the typographic cover and social image).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from 'node:fs'
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
  { id: 'spreadsheet-agent', src: 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', trim: 36.4, variants: [
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
  ['sheet-request', 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', 12.9],
  ['sheet-returned', 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', 25.3],
  ['sheet-list', 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', 35.5],
  ['sheet-start', 'PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov', 1.5],
  ['aristocracy-poster', 'Shift Content/Aristocracy.mp4', 30.5],
  ['aristocracy-cover', 'Shift Content/Aristocracy.mp4', 43.8],
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

function coverPlanetArtHtml() {
  return `<!doctype html><html><head><style>${baseCss}
body { position: relative; width: 1600px; height: 1000px; background:
  radial-gradient(90% 70% at 50% 45%, #1b1e2b 0%, #11131b 70%); }
.shot { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 1376px; border-radius: 14px; overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 30px 60px -20px rgba(0,0,0,.6); }
.shot img { display: block; width: 100%; height: auto; }
</style></head><body><div class="shot"><img src="${fileUrl(src('PlanetArt/cafepress uk/uk web.png'))}"></div></body></html>`
}

function coverJumpstartHtml() {
  return `<!doctype html><html><head><style>${baseCss}
body { display: flex; align-items: center; justify-content: center; gap: 72px; background:
  radial-gradient(80% 70% at 50% 50%, #1a1d29 0%, #11131b 70%); }
img { height: 880px; width: auto; display: block; filter: drop-shadow(0 30px 40px rgba(0,0,0,.45)); }
</style></head><body>
<img src="${fileUrl(join(CACHE, 'covers', 'proto-1.png'))}">
<img src="${fileUrl(join(CACHE, 'covers', 'proto-2.png'))}">
</body></html>`
}

/** The Valiance hero and cover: an editorial diagram, not a chat UI. */
function coverValianceHtml() {
  // Fixed 1600×1000 canvas with explicit coordinates so connectors land exactly.
  const routes = [
    { n: '01', label: 'General information', top: 420, human: false },
    { n: '02', label: 'Current property data', top: 548, human: false },
    { n: '03', label: 'Human decision', top: 676, human: true },
  ]
  const H = 108, startTop = 536, startH = 132, startRight = 112 + 380, routeLeft = 660
  const cy = startTop + startH / 2
  const paths = routes.map((r) => {
    const y = r.top + H / 2
    const mid = (startRight + routeLeft) / 2
    return `<path d="M${startRight} ${cy} C ${mid} ${cy}, ${mid} ${y}, ${routeLeft} ${y}" fill="none" stroke="${r.human ? '#7860e8' : '#5a607a'}" stroke-width="2"/>`
  }).join('')
  return `<!doctype html><html><head><style>${baseCss}
body { position: relative; width: 1600px; height: 1000px; background:
  radial-gradient(60% 55% at 72% 62%, rgba(82,103,255,.10) 0%, rgba(17,19,27,0) 70%), #11131b; }
h1 { position: absolute; left: 112px; top: 104px; width: 1120px; font-size: 64px; line-height: 1.06; font-weight: 560; letter-spacing: -0.04em; text-wrap: balance; }
.start { position: absolute; left: 112px; top: ${startTop}px; width: 380px; height: ${startH}px; border: 2px solid #aab4ff; border-radius: 20px; display: flex; align-items: center; padding: 0 36px; font-size: 38px; font-weight: 540; letter-spacing: -0.02em; }
.route { position: absolute; left: ${routeLeft}px; width: 828px; height: ${H}px; border-radius: 16px; background: #191c28; box-shadow: inset 0 0 0 1.5px #303545; display: flex; align-items: center; gap: 28px; padding: 0 36px; font-size: 40px; font-weight: 480; letter-spacing: -0.02em; }
.route.human { box-shadow: inset 0 0 0 1.5px #7860e8; }
.n { font-size: 26px; color: #b0b4c3; font-variant-numeric: tabular-nums; width: 40px; }
svg { position: absolute; inset: 0; }
</style></head><body>
<h1>A leasing question can require different kinds of answers</h1>
<svg width="1600" height="1000" viewBox="0 0 1600 1000">${paths}</svg>
<div class="start">Leasing question</div>
${routes.map((r) => `<div class="route${r.human ? ' human' : ''}" style="top:${r.top}px"><span class="n">${r.n}</span>${r.label}</div>`).join('')}
</body></html>`
}

function socialHtml() {
  return `<!doctype html><html><head><style>${baseCss}
body { background:
  radial-gradient(60% 80% at 78% 60%, rgba(82,103,255,.28) 0%, rgba(120,96,232,.12) 40%, rgba(9,10,15,0) 75%), #090a0f;
  padding: 88px 96px; display: flex; flex-direction: column; justify-content: flex-end; }
h1 { font-size: 104px; font-weight: 560; letter-spacing: -0.045em; line-height: 1; }
p { margin-top: 24px; font-size: 40px; color: #b0b4c3; letter-spacing: -0.015em; }
</style></head><body><h1>Harlie Katz</h1><p>AI product, strategy &amp; operations.</p></body></html>`
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
  const C = (n) => join(CACHE, 'covers', `${n}.png`)
  const dims = {}
  const COVER_W = [480, 800, 1200, 1600]

  // Jumpstart phones without their opaque matte (see removeMatte).
  const phone = (n) => join(CACHE, 'covers', `proto-${n}.png`)
  for (const n of [1, 2, 3, 4]) await removeMatte(src(`JumpStart Finance/proto ${n}.png`), phone(n))

  // Covers — deliberate 16:10 compositions shared by homepage cards and case heroes.
  await renderHtml(coverPlanetArtHtml(), C('planetart'), 1600, 1000)
  await renderHtml(coverValianceHtml(), C('valiance'), 1600, 1000)
  await renderHtml(coverJumpstartHtml(), C('jumpstart'), 1600, 1000)
  // Spreadsheet: returned-sheet frame (2940×1486); crop sheet + assistant to 16:10.
  // x 520–2898 clears the sidebar's green button and keeps the assistant text.
  await sharp(F('sheet-returned')).extract({ left: 520, top: 0, width: 2378, height: 1486 }).resize(1600, 1000).png().toFile(C('spreadsheet'))
  // Shift: Aristocracy frame (4000×3000); 16:10 crop above the burned-in subtitle.
  await sharp(F('aristocracy-cover')).extract({ left: 0, top: 120, width: 4000, height: 2500 }).resize(1600, 1000).png().toFile(C('shift'))
  for (const id of ['planetart', 'valiance', 'spreadsheet', 'jumpstart', 'shift']) {
    dims[`cover-${id}`] = await variants(`cover-${id}`, C(id), COVER_W, { quality: id === 'shift' ? 'photo' : 'ui' })
  }

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
  for (const n of ['merch-catalog', 'merch-vendors', 'merch-drawer']) {
    dims[n] = await variants(n, F(n), [800, 1200, 1600], { quality: 'ui' })
  }
  dims['merch-console-poster'] = await variants('merch-console-poster', F('merch-overview'), [960, 1600], { quality: 'ui' })

  // Spreadsheet Agent
  for (const n of ['sheet-request', 'sheet-returned', 'sheet-list']) {
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
  await renderHtml(socialHtml(), join(CACHE, 'social-preview.png'), 1200, 630)
  await sharp(join(CACHE, 'social-preview.png')).jpeg({ quality: 86, mozjpeg: true }).toFile(join(ROOT, 'public', 'social-preview.jpg'))
  ensure(join(ROOT, 'public', 'resume'))
  copyFileSync(src('personal assets/Harlie Katz Resume PDF copy.pdf'), join(ROOT, 'public', 'resume', 'harlie-katz-resume.pdf'))

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

  // Shift preview: a short, muted, subtitle-free 16:9 crop of the Aristocracy
  // film for the homepage stage. The published film is never cropped.
  const shiftPrev = join(VID, 'shift-preview.mp4')
  run('ffmpeg', ['-y', '-v', 'error', '-ss', '41.0', '-t', '6.0', '-i', src('Shift Content/Aristocracy.mp4'), '-an',
    '-vf', 'crop=4000:2250:0:150,scale=1280:720:flags=lanczos,fps=25',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-maxrate', '1800k', '-bufsize', '3600k',
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', shiftPrev])
  report.push(`shift-preview.mp4 ${(statSync(shiftPrev).size / 1e6).toFixed(2)}MB`)
  const prevPoster = join(CACHE, 'frames', 'shift-preview-poster.png')
  run('ffmpeg', ['-y', '-v', 'error', '-ss', '41.0', '-i', src('Shift Content/Aristocracy.mp4'), '-frames:v', '1',
    '-vf', 'crop=4000:2250:0:150,scale=1280:720:flags=lanczos', prevPoster])
  await variants('shift-preview-poster', prevPoster, [640, 1280])

  // Film-strip stills (real frames from the three published films).
  const STILLS = [
    ['film-aristocracy-a', 'Shift Content/Aristocracy.mp4', 10, 'crop=4000:2250:0:150'],
    ['film-aristocracy-b', 'Shift Content/Aristocracy.mp4', 55, 'crop=4000:2250:0:150'],
    ['film-nickleby-a', 'Shift Content/Nickleby Capital Video 1.mp4', 25, 'null'],
    ['film-nickleby-b', 'Shift Content/Nickleby Capital Video 1.mp4', 70, 'null'],
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
  run('ffmpeg', ['-y', '-v', 'error', '-ss', '18.9', '-i', src('PlanetArt/Spreadsheet Agent/Spreadsheet Video.mov'), '-frames:v', '1', interp])
  await variants('sheet-interpreting', interp, [800, 1200, 1600], { quality: 'ui' })
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
console.log(report.join('\n'))
if (existsSync(join(CACHE, 'dimensions.json'))) console.log('dimensions → .media-cache/dimensions.json')

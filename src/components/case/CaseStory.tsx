import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getImage, type ImageId } from '../../content/media'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'
import { ResponsiveImage } from '../media/ResponsiveImage'
import type { Project } from '../../content/projects'
import { CaseTitle } from './CasePage'

export interface StoryStep {
  title: string
  text: ReactNode
  /** A quotation shown on its own under the text (e.g. the demonstrated request, word for word). */
  quote?: string
  /** One or two specific points, only where useful. */
  bullets?: readonly string[]
}

/** A rectangle of a picture, in its source pixels. */
export interface Region {
  x: number
  y: number
  w: number
  h: number
}

/** One layer of a stage that changes by crossfading: a picture (contained, never cropped) or composed content. */
export type StageLayer = { image: ImageId; alt?: string } | { node: ReactNode; label: string }

/**
 * What the fixed stage shows. Each kind holds one state per step:
 * - video: a real recording; its time follows the scroll through each step's segment;
 * - layers: distinct artifacts, crossfading as the steps change (`show` picks the layer per step);
 * - crops: parts of one picture, crossfading as the steps change (null shows all of it); never panned or zoomed;
 * - phones: the app's screens; the step's own screen comes forward (`step` on each phone).
 */
export type Stage =
  | {
      kind: 'video'
      src: string
      poster: string
      width: number
      height: number
      /** Seconds [start, end] for each step. */
      segments: readonly (readonly [number, number])[]
      /** One still (seconds) per step, used under reduced motion. */
      stills: readonly number[]
      label: string
    }
  | { kind: 'layers'; aspect: number; layers: readonly StageLayer[]; show: readonly number[] }
  | { kind: 'crops'; image: ImageId; regions: readonly (Region | null)[] }
  | { kind: 'phones'; phones: readonly { image: ImageId; name: string; step: number }[] }

/** The reading line (a share of the window's height from the top): a step becomes current when its top reaches it. */
const line = () => (window.matchMedia('(max-width: 899.98px)').matches ? 0.66 : 0.5)

/** The screen stages' picture width: the laptop's screen is 74% of the laptop's width. */
const STAGE_SIZES = '(min-width: 1296px) 560px, (min-width: 900px) 44vw, 72vw'

/**
 * The laptop Harlie supplied (device-laptop, the third version, trimmed to
 * its glow at 1313x734) and the transparent screen in it (x 172 to 1141,
 * y 71 to 647), as shares of the whole. The screen box reaches half a pixel
 * under the bezel on each side, so no seam shows between the picture and
 * the frame.
 */
const LAPTOP = { w: 1313, h: 734, x: 171.5, y: 70.5, sw: 971, sh: 578 }

/** A recording or screenshot sitting in the laptop's screen, behind the laptop picture. */
function Laptop({ aspect, children }: { aspect: number; children: ReactNode }) {
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`
  return (
    <div className="story__stage story__laptop" style={{ '--aspect': LAPTOP.w / LAPTOP.h } as CSSProperties}>
      <div
        className="story__screen"
        data-hero-media=""
        style={{ left: pct(LAPTOP.x, LAPTOP.w), top: pct(LAPTOP.y, LAPTOP.h), width: pct(LAPTOP.sw, LAPTOP.w), height: pct(LAPTOP.sh, LAPTOP.h) }}
      >
        <div className="story__fit" style={{ '--media-aspect': aspect } as CSSProperties}>
          {children}
        </div>
      </div>
      <ResponsiveImage image="device-laptop" sizes="(min-width: 1296px) 780px, (min-width: 900px) 62vw, 100vw" decorative priority className="story__laptop-frame" />
    </div>
  )
}

/**
 * A case study told in a few compact steps (brief v21). The introduction and
 * three or four short groups (a heading, one explanation, at most two
 * specific points) run down the left; the stage stays in place on the right
 * (recordings and screenshots sit in the screen of Harlie's laptop picture,
 * contained, behind the laptop; Jumpstart's phones stand free),
 * below the header, centred in its column and never taller than about 58% of
 * the window, so the whole composition sits inside the window with a gutter
 * on each side. Its opening state is level with the introduction.
 *
 * A step becomes the current one when its top reaches the reading line, and
 * the stage changes with it at that moment: a recording follows the scroll
 * through that step's segment (faster when scrolling faster, holding when
 * scrolling stops, backwards when scrolling up), artifacts and picture parts
 * crossfade in about 220ms, a phone comes forward. Only the steps' own
 * positions drive this; the length of the rest of the page never does
 * (should the page end before the last step could reach the line, just
 * enough space is added under the steps). The current step takes an accent
 * rule and a brighter heading; the others stay fully readable.
 *
 * Phones (below 900px): the introduction, then a compact stage held under
 * the header (at most about 30% of the screen), with the steps below it.
 *
 * The stage is the landing point of the project opening (`data-hero-media`).
 * Reduced motion: no easing or crossfade, and a recording shows one still
 * per step.
 */
export function CaseStory({
  title,
  meta,
  lede,
  status,
  steps,
  stage,
  caption,
  captions,
  note,
  result,
}: {
  title: string
  meta: readonly string[]
  lede: ReactNode
  status?: ReactNode
  steps: readonly StoryStep[]
  stage: Stage
  /** A short line under the stage (what the picture is). */
  caption?: ReactNode
  /** Or one line per step, following the current step (the first shows before any step is current). */
  captions?: readonly ReactNode[]
  /** A scope line after the steps. */
  note?: ReactNode
  /** A result after the steps (a heading and one or two sentences), shown like a step but not part of the scroll story. */
  result?: { title: string; text: ReactNode }
  /** The case study's project (the footer carries Previous and Next project). */
  project?: Project
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(-1)
  /** The stage's per-frame listener (a recording's time). */
  const follow = useRef<((k: number, local: number) => void) | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const n = steps.length
    /** Scroll positions where each step becomes current, the page's last scroll position, and the space added under the steps. */
    const m = { t: [0], end: 1, pad: 0 }
    const measure = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      const items = [...list.children] as HTMLElement[]
      const tops = items.map((el) => el.getBoundingClientRect().top + y)
      // The words end with the last step, or with a result after the steps.
      const body = list.parentElement ?? list
      const tail = (body.lastElementChild as HTMLElement | null) ?? items[n - 1]
      const lastBottom = tail.getBoundingClientRect().bottom + y
      const footer = document.querySelector<HTMLElement>('.site-end')
      const footerBox = footer?.getBoundingClientRect()
      const footerTop = footerBox ? footerBox.top + y : document.documentElement.scrollHeight
      const footerH = footerBox?.height ?? 0
      // At the end of the page the words end level with the bottom of the held picture (Harlie's request), so the
      // footer follows close under both; on phones (the picture is not held beside the words) a short gap.
      const stage = list.closest('.cs')?.querySelector<HTMLElement>('.story__hold > .story__stage')
      const wide = !window.matchMedia('(max-width: 899.98px)').matches
      const want = wide && stage ? Math.max(24, vh - footerH - stage.getBoundingClientRect().bottom) : 56
      const pad = Math.max(0, Math.round(m.pad + want - (footerTop - lastBottom)))
      if (pad !== m.pad) {
        m.pad = pad
        body.style.paddingBottom = pad ? `${pad}px` : ''
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }
      // Each step becomes current when its top reaches the reading line; if the page ends before the last one can,
      // the changes are spaced evenly over the scroll that is left, keeping room for the last step's own movement.
      const end = Math.max(1, document.documentElement.scrollHeight - vh)
      const raw = tops.map((top) => top - line() * vh)
      const lim = end - Math.min(0.35 * vh, 260)
      if (raw[n - 1] > lim) {
        // A short page: start earlier if need be, and finish the changes with room left for the last step.
        const start = Math.min(raw[0], Math.max(-vh, lim - (n - 1) * 80))
        const stop = Math.max(start + (n - 1) * 20, Math.min(lim, end - 1))
        const span = raw[n - 1] - raw[0] || 1
        m.t = raw.map((r) => start + ((r - raw[0]) * (stop - start)) / span)
      } else m.t = raw
      m.end = end
    }
    const update = () => {
      const y = window.scrollY
      if (y < m.t[0]) {
        setActive(-1)
        follow.current?.(-1, 0)
        return
      }
      let k = 0
      while (k < n - 1 && y >= m.t[k + 1]) k++
      const span = k < n - 1 ? m.t[k + 1] - m.t[k] : Math.max(1, m.end - m.t[k])
      setActive(k)
      follow.current?.(k, Math.min(1, Math.max(0, (y - m.t[k]) / span)))
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onRefresh: () => {
        measure()
        update()
      },
      onUpdate: update,
    })
    return () => {
      trigger.kill()
      ;(list.parentElement ?? list).style.paddingBottom = ''
    }
  }, [steps.length])

  const bind = useCallback((fn: ((k: number, local: number) => void) | null) => {
    follow.current = fn
  }, [])

  // Wide windows: the stage is fixed in the window for the whole page (Harlie's request), so the footer rises
  // beneath it at the end. Its holder takes the right column's place and width, measured from the column.
  const mediaRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const col = mediaRef.current
    if (!col) return
    const place = () => {
      const box = col.getBoundingClientRect()
      col.style.setProperty('--hold-left', `${box.left.toFixed(1)}px`)
      col.style.setProperty('--hold-width', `${box.width.toFixed(1)}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(col)
    window.addEventListener('resize', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [])

  return (
    <div className="cs story" data-started={active >= 0 || undefined}>
      <header className="cs__intro" data-hero-reveal>
        <CaseTitle title={title} meta={meta} />
        <div className="cx-lede">{lede}</div>
        {status && <p className="cx-status">{status}</p>}
      </header>
      <div ref={mediaRef} className="cs__media story__media">
        <div className="story__hold">
          <StageView stage={stage} active={active} bind={bind} />
          {(captions ? captions[Math.max(0, Math.min(active, captions.length - 1))] : caption) && (
            <div className="story__below">
              <p className="cx-caption story__caption">{captions ? captions[Math.max(0, Math.min(active, captions.length - 1))] : caption}</p>
            </div>
          )}
        </div>
      </div>
      <div className="cs__body" data-hero-reveal>
        <ol ref={listRef} className="story__steps" role="list">
          {steps.map((s, k) => (
            <li key={s.title} className="story__step" data-current={k === active || undefined}>
              <h2 className="story__title">{s.title}</h2>
              <p className="story__text">{s.text}</p>
              {s.quote && (
                <blockquote className="story__quote">
                  <p>{s.quote}</p>
                </blockquote>
              )}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="story__points">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {result && (
          <section className="story__result" aria-label={result.title}>
            <h2 className="story__title">{result.title}</h2>
            <p className="story__text">{result.text}</p>
          </section>
        )}
        {note && <p className="cs__note">{note}</p>}
      </div>
    </div>
  )
}

function StageView({ stage, active, bind }: { stage: Stage; active: number; bind: (fn: ((k: number, local: number) => void) | null) => void }) {
  if (stage.kind === 'video') return <VideoStage stage={stage} bind={bind} />
  if (stage.kind === 'phones') {
    return (
      <div className="story__stage story__phones" data-hero-media="" data-focus={active >= 0 || undefined}>
        {stage.phones.map((p) => (
          <div key={p.image} className="story__phone" data-on={p.step === active || undefined}>
            <ResponsiveImage image={p.image} sizes="(min-width: 1100px) 190px, 26vw" alt={`${p.name} screen`} priority />
          </div>
        ))}
      </div>
    )
  }
  if (stage.kind === 'crops') return <CropStage stage={stage} active={active} />
  const shown = stage.show[Math.max(0, active)] ?? 0
  return (
    <Laptop aspect={stage.aspect}>
      {stage.layers.map((layer, k) => (
        <div key={k} className="story__layer" data-on={k === shown || undefined} aria-hidden={k === shown ? undefined : true}>
          {'image' in layer ? <ResponsiveImage image={layer.image} sizes={STAGE_SIZES} priority={k === 0} alt={layer.alt} /> : layer.node}
        </div>
      ))}
    </Laptop>
  )
}

/** The recording, its time eased toward the scroll's (and one still per step under reduced motion). */
function VideoStage({ stage, bind }: { stage: Extract<Stage, { kind: 'video' }>; bind: (fn: ((k: number, local: number) => void) | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    let target = stage.segments[0][0]
    let frame = 0
    const tick = () => {
      frame = 0
      if (video.readyState >= 1 && !video.seeking) {
        const d = target - video.currentTime
        if (Math.abs(d) > 1 / 60) video.currentTime = prefersReducedMotion() ? target : video.currentTime + d * 0.45
      }
      if (Math.abs(target - video.currentTime) > 1 / 60) frame = requestAnimationFrame(tick)
    }
    bind((k, local) => {
      const i = Math.max(0, k)
      const [a, b] = stage.segments[i]
      target = prefersReducedMotion() ? (k < 0 ? a : stage.stills[i]) : k < 0 ? a : a + (b - a) * local
      if (!frame) frame = requestAnimationFrame(tick)
    })
    // Some browsers paint a seeked frame only once the video has played: play and pause it once, muted, when it first shows.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (video.paused && video.currentTime === 0) void video.play().then(() => video.pause(), () => {})
    })
    io.observe(video)
    return () => {
      bind(null)
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stage, bind])

  return (
    <Laptop aspect={stage.width / stage.height}>
      <video
        ref={ref}
        className="story__video"
        src={stage.src}
        poster={stage.poster}
        width={stage.width}
        height={stage.height}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-label={stage.label}
      />
    </Laptop>
  )
}

/** Parts of one picture, one per step, each shown whole in the same frame and crossfading (the picture is never panned or zoomed). */
function CropStage({ stage, active }: { stage: Extract<Stage, { kind: 'crops' }>; active: number }) {
  const asset = getImage(stage.image)
  const W = asset.width
  const H = asset.height
  const layers = [null, ...stage.regions]
  const shown = active >= 0 ? active + 1 : 0
  return (
    <Laptop aspect={W / H}>
      {layers.map((r, k) => {
        let transform = 'none'
        if (r) {
          const s = Math.max(1, Math.min(W / r.w, H / r.h))
          const clamp = (v: number, lo: number) => Math.min(0, Math.max(lo, v))
          const tx = clamp(W / 2 - (r.x + r.w / 2) * s, W - W * s)
          const ty = clamp(H / 2 - (r.y + r.h / 2) * s, H - H * s)
          transform = `translate(${((tx / W) * 100).toFixed(3)}%, ${((ty / H) * 100).toFixed(3)}%) scale(${s.toFixed(4)})`
        }
        const on = k === shown
        return (
          <div key={k} className="story__layer" data-on={on || undefined} aria-hidden={on ? undefined : true}>
            <div className="story__crop" style={{ transform }}>
              <ResponsiveImage image={stage.image} sizes="(min-width: 1296px) 1200px, (min-width: 900px) 80vw, 160vw" priority={k === 0} decorative={k > 0} />
            </div>
          </div>
        )
      })}
    </Laptop>
  )
}

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ClientFilm } from '../../../content/pages/client-work'
import { fallbackSrc, getImage, getVideo, type VideoAsset } from '../../../content/media'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { ExpandIcon } from '../../media/Figure'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { shortDuration, spokenDuration } from '../../media/duration'
import { FilmDialog, type FilmState } from './FilmDialog'

/*
 * FilmPlayer: one stable 16:9 frame for the Creative Production films.
 *
 * Two modes, decided by the parent (FilmScroll):
 * - Preview: the film plays muted, looping, with native controls, when at
 *   least 35% of the frame is visible (only where `preview` allows it: the
 *   sticky player, and the first stacked player). The parent may change the
 *   film while it only previews (scrolling); the new poster is decoded before
 *   it replaces the old one, and the new recording is attached only once the
 *   film has stayed for SETTLE ms, so fast scrolling loads nothing in passing.
 *   A visitor's pause stops the previews until they start a film.
 * - Opened: the visitor pressed Watch film or Watch with sound, unmuted,
 *   played, scrubbed, went full screen, or expanded the film. The player
 *   reports it (onOpen) and the parent keeps this film in place while the
 *   page scrolls. It no longer loops and is never restarted by scrolling:
 *   when it leaves the viewport it pauses and stays paused (nothing plays
 *   sound because of scrolling).
 *
 * Autoplay refused, reduced motion, a player without previews, or a paused
 * preview: the poster with one obvious Watch film button (a direct gesture,
 * so it plays with sound). `silenced` (another film was opened) pauses this
 * one. Expand (inside the frame, never on the native control bar) opens a
 * larger view from the same time and pauses this copy; closing it restores
 * the time and state here. The site-wide media policy (useMediaPlayback)
 * treats the muted preview as ambient (`data-ambient`).
 */

/** Share of the frame that must be visible before a preview starts. */
const PLAY_RATIO = 0.35
/** A preview's film must stay this long (ms) before its recording is attached. */
const SETTLE = 280
/** Poster change (ms): the new poster fades in over the old one. */
const POSTER_FADE = 120

type FilmId = ClientFilm['id']

/** The smallest variant that fills the frame sharply (the film contained in a 16:9 box, at most 2× density). */
function pickVariant(video: VideoAsset, frameWidth: number): VideoAsset['variants'][number] {
  const ratio = video.width / video.height
  const shown = Math.min(frameWidth, ((frameWidth * 9) / 16) * ratio)
  const need = shown * Math.min(window.devicePixelRatio || 1, 2) * 0.95
  return video.variants.find((v) => v.width >= need) ?? video.variants[video.variants.length - 1]
}

/** Resolves when an image has decoded (or failed, or is missing). */
function whenDecoded(img: HTMLImageElement | null | undefined): Promise<void> {
  if (!img) return Promise.resolve()
  if (img.complete) return img.naturalWidth ? img.decode().catch(() => {}) : Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(() => resolve()), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

/** "Interview film for Nickleby Capital by Shift Content · 1 min 40 s". */
export const filmCaption = (film: ClientFilm) => `${film.kind} for ${film.client} by Shift Content · ${shortDuration(getVideo(film.video).duration)}`

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  )
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path d="M2.5 6h2.2L8 3.3v9.4L4.7 10H2.5z" fill="currentColor" />
      <path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.9a5.8 5.8 0 0 1 0 8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

interface FilmPlayerProps {
  /** The films whose posters this frame holds (the sticky player: all; a stacked player: its own). */
  films: ClientFilm[]
  /** The film to show. */
  film: ClientFilm
  variant: 'sticky' | 'inline'
  /** May play a muted preview by itself. */
  preview: boolean
  /** The visitor opened this film (parent state): it stays in place and is never restarted by scrolling. */
  opened: boolean
  /** Another film was opened: stop this one. */
  silenced: boolean
  onOpen: (id: FilmId) => void
  /** `sizes` of the posters. */
  sizes: string
  priority?: boolean
}

export function FilmPlayer({ films, film, variant, preview, opened, silenced, onOpen, sizes, priority = false }: FilmPlayerProps) {
  const reduced = useReducedMotion()
  const captionId = useId()
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const target = Math.max(0, films.findIndex((f) => f.id === film.id))
  /** The poster shown (`front`), the one fading out underneath (`prev`). */
  const [view, setView] = useState({ front: target, prev: -1 })
  /** The film whose recording is attached (its index), or -1. */
  const [attached, setAttached] = useState(target)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [previewsStopped, setPreviewsStopped] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)
  const [expanded, setExpanded] = useState<FilmState | null>(null)
  /** Imperative state read by media event handlers (never rendered). */
  const ctl = useRef({ inView: false, autoStart: false, selfPause: false, selfMute: false, selfSeek: false, expanded: false, pendingPlay: false, opened, silenced, preview, reduced, previewsStopped })
  useLayoutEffect(() => {
    Object.assign(ctl.current, { opened, silenced, preview, reduced, previewsStopped })
  })

  const front = films[view.front] ?? films[0]
  const asset = getVideo(front.video)
  const posterAsset = getImage(asset.poster)
  const isAttached = attached === view.front

  // A new film: wait for its poster, then fade it in over the current one.
  useEffect(() => {
    if (target === view.front) return
    let cancelled = false
    const img = frameRef.current?.querySelector<HTMLImageElement>(`[data-poster="${target}"] img`)
    void whenDecoded(img).then(() => {
      if (!cancelled) setView((v) => ({ front: target, prev: v.front }))
    })
    return () => {
      cancelled = true
    }
  }, [target, view.front])

  // The previous poster hides once the new one has fully appeared.
  useEffect(() => {
    if (view.prev < 0) return
    const id = window.setTimeout(() => setView((v) => ({ ...v, prev: -1 })), reduced ? 0 : POSTER_FADE + 40)
    return () => window.clearTimeout(id)
  }, [view.prev, reduced])

  // Attach the shown film's recording once it has stayed (at once when opened).
  useEffect(() => {
    if (attached === view.front) return
    const id = window.setTimeout(() => setAttached(view.front), opened ? 0 : SETTLE)
    return () => window.clearTimeout(id)
  }, [attached, view.front, opened])

  /** Pauses without counting as the visitor's pause. */
  const autoPause = useCallback(() => {
    const v = videoRef.current
    if (!v || v.paused) return
    ctl.current.selfPause = true
    v.pause()
  }, [])

  /** Starts the muted preview when allowed. */
  const tryPreview = useCallback(() => {
    const v = videoRef.current
    const c = ctl.current
    if (!v || !v.paused || !c.preview || c.opened || c.silenced || c.reduced || c.previewsStopped || c.expanded || !c.inView) return
    if (document.visibilityState === 'hidden') return
    if (!v.muted) {
      c.selfMute = true
      v.muted = true
    }
    c.autoStart = true
    v.play().then(
      () => {
        c.autoStart = false
      },
      (err: unknown) => {
        c.autoStart = false
        // AbortError: interrupted (the film changed or scrolled away); not a refusal.
        if (err instanceof DOMException && err.name === 'NotAllowedError') setBlocked(true)
      },
    )
  }, [])

  const open = useCallback(() => {
    ctl.current.opened = true
    onOpen(front.id)
  }, [onOpen, front.id])

  // Visibility: a preview starts at 35% visible; any playback pauses once the frame is out of view.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.intersectionRatio >= PLAY_RATIO) {
          ctl.current.inView = true
          tryPreview()
        } else if (!entry.isIntersecting) {
          ctl.current.inView = false
          autoPause()
        }
      },
      { threshold: [0, PLAY_RATIO] },
    )
    io.observe(frame)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPreview()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [tryPreview, autoPause])

  // State changes from the parent or the preference: stop what may no longer play, start what may.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (silenced || (reduced && !opened)) autoPause()
    else if (!opened) {
      // Back to previewing (the visitor picked another film): silent first, then the preview rules apply.
      if (!v.muted) {
        ctl.current.selfMute = true
        v.muted = true
      }
      tryPreview()
    }
  }, [silenced, reduced, opened, preview, previewsStopped, isAttached, autoPause, tryPreview])

  // A newly attached recording: a clean state, then the preview if allowed.
  const attachVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el
      if (!el) return
      const c = ctl.current
      el.muted = !c.opened
      el.defaultMuted = el.muted
      // Watch film was pressed before this recording was attached: play it now (still within the gesture's activation).
      if (c.pendingPlay) {
        c.pendingPlay = false
        el.muted = false
        el.play().catch(() => {})
      }
    },
    [],
  )

  const onLoadedData = () => {
    setHasFrame(true)
    tryPreview()
  }

  const onPlay = () => {
    const c = ctl.current
    setPlaying(true)
    setBlocked(false)
    // Started from the native controls or the keyboard (not by the preview): the visitor opened the film.
    if (!c.autoStart && !c.opened) open()
  }

  const onPause = () => {
    const v = videoRef.current
    const c = ctl.current
    setPlaying(false)
    if (c.selfPause) {
      c.selfPause = false
      return
    }
    // The visitor paused a preview: no more previews until they start a film.
    if (v && !v.ended && !c.expanded && !c.opened && document.visibilityState !== 'hidden') setPreviewsStopped(true)
  }

  const onVolumeChange = () => {
    const v = videoRef.current
    const c = ctl.current
    if (c.selfMute) {
      c.selfMute = false
      return
    }
    if (v && !v.muted && !c.opened) open()
  }

  const onSeeking = () => {
    const v = videoRef.current
    const c = ctl.current
    if (c.selfSeek) {
      c.selfSeek = false
      return
    }
    // A looping preview seeks back to the start by itself.
    if (v && !c.opened && !(v.loop && v.currentTime < 0.3)) open()
  }

  // Full screen from the native controls counts as opening the film.
  useEffect(() => {
    const onFullscreen = () => {
      if (document.fullscreenElement && document.fullscreenElement === videoRef.current && !ctl.current.opened) open()
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => document.removeEventListener('fullscreenchange', onFullscreen)
  }, [open])

  /** Watch film / Watch with sound: from the start, with sound (a direct gesture). */
  const watch = () => {
    const v = videoRef.current
    const c = ctl.current
    setPreviewsStopped(false)
    open()
    if (!v) {
      c.pendingPlay = true
      return
    }
    if (v.currentTime > 0.05) {
      c.selfSeek = true
      v.currentTime = 0
    }
    v.loop = false
    v.muted = false
    v.play().then(
      () => v.focus({ preventScroll: true }),
      () => {},
    )
  }

  const openExpanded = () => {
    const v = videoRef.current
    if (!v) return
    const c = ctl.current
    const wasPreview = !c.opened
    const play = (!v.paused && !v.ended) || !c.opened
    c.expanded = true
    open()
    autoPause()
    // From a preview the visitor asked to watch: the larger view plays with sound.
    setExpanded({ time: v.currentTime, play, muted: wasPreview ? false : v.muted, volume: v.volume })
  }

  const closeExpanded = (result: FilmState) => {
    const v = videoRef.current
    const c = ctl.current
    setExpanded(null)
    c.expanded = false
    if (v) {
      if (Number.isFinite(result.time) && Math.abs(v.currentTime - result.time) > 0.05) {
        c.selfSeek = true
        v.currentTime = result.time
      }
      if (v.muted !== result.muted) c.selfMute = true
      v.muted = result.muted
      v.volume = result.volume
      if (result.play) v.play().catch(() => {})
    }
    expandRef.current?.focus({ preventScroll: true })
  }

  // Another recording (or none, while a new film settles): no frame and no playback yet (the poster stays underneath).
  const videoKey = isAttached ? front.id : ''
  const [stateFor, setStateFor] = useState(videoKey)
  if (stateFor !== videoKey) {
    setStateFor(videoKey)
    setHasFrame(false)
    setPlaying(false)
  }

  // Poster only (one obvious Watch film): no preview here, reduced motion, autoplay refused, or another film opened.
  const posterOnly = !opened && !playing && (!preview || reduced || blocked || silenced)
  // A preview (playing, or paused by the visitor): Watch with sound starts the film properly.
  const showSound = !opened && !posterOnly && (playing || previewsStopped)
  // The frame's width, estimated from the layout (sticky: the 52% media column, at most 645px).
  const frameWidth = variant === 'sticky' ? Math.min(645, window.innerWidth * 0.5) : window.innerWidth
  const src = pickVariant(asset, frameWidth).src
  const name = front.name

  return (
    <figure className="fp" data-variant={variant}>
      <div
        ref={frameRef}
        className="fp-frame"
        data-film={front.id}
        data-mode={opened ? 'opened' : playing ? 'preview' : 'poster'}
        data-has-frame={(isAttached && hasFrame) || undefined}
      >
        {films.map((f, i) => (
          <div key={f.id} className="fp-poster" data-poster={i} data-state={i === view.front ? 'shown' : i === view.prev ? 'under' : 'hidden'} aria-hidden="true">
            <ResponsiveImage
              image={getVideo(f.video).poster}
              sizes={sizes}
              decorative
              fit="contain"
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : variant === 'sticky' ? 'eager' : 'lazy'}
              fetchPriority={priority && i === 0 ? undefined : variant === 'sticky' ? 'low' : 'auto'}
            />
          </div>
        ))}
        {posterOnly && (
          <span className="fp-center">
            <button type="button" className="button fp-watch" onClick={watch}>
              <PlayIcon />
              Watch film
              <span className="visually-hidden">
                , {name}, {spokenDuration(asset.duration)}, with sound
              </span>
            </button>
          </span>
        )}
        {showSound && (
          <button type="button" className="fp-sound" onClick={watch}>
            <SoundIcon />
            <span aria-hidden="true">Watch with sound</span>
            <span className="visually-hidden">Watch {name} from the start with sound</span>
          </button>
        )}
        <button ref={expandRef} type="button" className="fp-expand" aria-label={`Expand ${name} film`} onClick={openExpanded} disabled={!isAttached}>
          <ExpandIcon />
        </button>
        {/* After the frame controls in the DOM, so Tab reaches Watch and Expand before the native controls. */}
        {isAttached && (
          <video
            key={front.id}
            ref={attachVideo}
            className="fp-video"
            src={src}
            poster={fallbackSrc(posterAsset, 1600)}
            width={asset.width}
            height={asset.height}
            loop={!opened}
            playsInline
            controls={!posterOnly}
            preload={opened || (preview && !reduced) ? 'auto' : 'none'}
            data-ambient={opened ? undefined : ''}
            aria-label={`${name} film`}
            aria-describedby={captionId}
            onLoadedData={onLoadedData}
            onPlay={onPlay}
            onPause={onPause}
            onVolumeChange={onVolumeChange}
            onSeeking={onSeeking}
          />
        )}
      </div>
      <figcaption id={captionId} className="fp-caption">
        {filmCaption(front)}
      </figcaption>
      {expanded && (
        <FilmDialog asset={asset} title={name} caption={filmCaption(front)} posterSrc={fallbackSrc(posterAsset, 1600)} start={expanded} onClose={closeExpanded} />
      )}
    </figure>
  )
}

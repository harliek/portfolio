import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { ClientFilm } from '../../../content/pages/client-work'
import { fallbackSrc, getImage, getVideo, type VideoAsset } from '../../../content/media'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { DemoControls } from '../../media/DemoControls'
import { enterFullscreen, NATIVE_FULLSCREEN, returnFocus } from '../../media/fullscreen'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { spokenDuration } from '../../media/duration'
import { onFramePresented } from '../../media/videoFrame'
import { FilmDialog, type FilmState } from './FilmDialog'

/*
 * FilmPlayer: one Creative Production film in its own section (brief-v8
 * section 13), at the film's own proportions, in the case studies' player
 * frame (case.css .cs-player): the film, its picture clean (brief-v15: no
 * timer or native timeline over it), then the compact bar below it that the
 * product recordings use (DemoControls). No caption.
 *
 * Modes (the page, FilmScroll, coordinates the three players):
 * - Poster: never played. The poster with one obvious Watch film button (a
 *   direct gesture, so it plays from the start with sound), in the quiet
 *   secondary style of the recordings' Play demo, so no solid red sits on the
 *   film. The bar holds Play (the same action) and Expand.
 * - Preview: while `preview` is true (this film is the one most in view,
 *   nothing plays with sound, no reduced motion, the visitor has not paused a
 *   preview) it plays muted and looping; when `preview` turns false it pauses
 *   where it is. The bar holds Pause (a visitor's pause stops the previews on
 *   the page), Watch with sound (starts it properly from the beginning) and
 *   Expand; Play on a paused preview makes it the visitor's, still muted.
 * - Opened: the visitor pressed Watch film or Watch with sound, played,
 *   unmuted, sought, went full screen or expanded it. It is theirs: it no
 *   longer loops, nothing restarts or switches it, and its position is kept.
 *   The bar is complete: play or pause, the seek slider, sound, Expand. Like
 *   every film here it pauses once it is completely out of view (and stays
 *   paused there; nothing plays sound because of scrolling).
 * A click on the picture is a pointer shortcut for the bar's first control.
 * When Watch film or Watch with sound leaves the page (the film starts), focus
 * moves to the bar's Pause button.
 * The page is told when the film plays with sound (`onSound`), so no preview
 * starts beside it, and when the visitor pauses a preview (`onPreviewPause`),
 * which stops the previews on the page. One film with sound at a time is the
 * site-wide media policy (useMediaPlayback).
 *
 * Expand opens a larger view at the same moment and pauses this copy; closing
 * it restores the time and state here and returns focus to Expand. On a phone
 * or a touch screen, Expand puts this film itself in the browser's full screen
 * (a dialog would be no larger than the frame).
 *
 * The poster wins the bandwidth: the recording loads only once the poster has
 * loaded and the film is about to preview or play. The recording stays
 * transparent over the poster until it has put a frame on screen, then fades
 * in (client-work.css .fp-video; at once under reduced motion).
 */

type FilmId = ClientFilm['id']

/** The fixed navigation's height (tokens.css --header-height): what lies under it is out of view. */
export const headerHeight = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0

/** The smallest variant that fills the frame sharply (at most 2× density). */
function pickVariant(video: VideoAsset, frameWidth: number): VideoAsset['variants'][number] {
  const need = frameWidth * Math.min(window.devicePixelRatio || 1, 2) * 0.95
  return video.variants.find((v) => v.width >= need) ?? video.variants[video.variants.length - 1]
}

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
  film: ClientFilm
  /** This film may play its muted preview now (decided by the page). */
  preview: boolean
  /** The visitor opened this film (page state). */
  opened: boolean
  onOpen: (id: FilmId) => void
  /** Whether this film is playing with sound. */
  onSound: (id: FilmId, audible: boolean) => void
  /** The visitor paused this film's preview. */
  onPreviewPause: () => void
  /** 'sticky': beside its text (desktop); 'stacked': the column's width. */
  layout: 'sticky' | 'stacked'
  /** `sizes` of the poster. */
  sizes: string
  priority?: boolean
}

export function FilmPlayer({ film, preview, opened, onOpen, onSound, onPreviewPause, layout, sizes, priority = false }: FilmPlayerProps) {
  const reduced = useReducedMotion()
  const asset = getVideo(film.video)
  const posterAsset = getImage(asset.poster)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  // The frame's width, estimated from the layout (beside the text: the 52% media column, at most 645px).
  const [src] = useState(() => pickVariant(asset, layout === 'sticky' ? Math.min(645, window.innerWidth * 0.5) : window.innerWidth).src)
  /** The poster file the picture loaded (undefined until then; '' if it failed). */
  const [posterSrc, setPosterSrc] = useState<string>()
  const posterReady = posterSrc !== undefined
  const [playing, setPlaying] = useState(false)
  /** It has played at least once (its paused frame now stands for it, in place of the poster and Watch film). */
  const [started, setStarted] = useState(false)
  /** The recording has put a frame on screen (it is shown from then on, over the poster). */
  const [hasFrame, setHasFrame] = useState(false)
  const [expanded, setExpanded] = useState<FilmState | null>(null)
  /** This film itself is in full screen (touch Expand): the browser's own controls are there only then, so it can be left. */
  const [fullscreen, setFullscreen] = useState(false)
  /** Imperative state read by media event handlers (never rendered). */
  const ctl = useRef({ autoStart: false, selfPause: false, selfMute: false, selfSeek: false, expanded: false, blocked: false, opened, preview, reduced, posterReady })
  useLayoutEffect(() => {
    Object.assign(ctl.current, { opened, preview, reduced, posterReady })
  })

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
    if (!v || !v.paused || !c.preview || c.opened || c.reduced || c.expanded || c.blocked || !c.posterReady || document.visibilityState === 'hidden') return
    if (!v.muted) {
      c.selfMute = true
      v.muted = true
    }
    v.loop = true
    c.autoStart = true
    v.play().then(
      () => {
        c.autoStart = false
      },
      (err: unknown) => {
        c.autoStart = false
        // Autoplay refused (a browser policy): the poster with Watch film stays. AbortError (it lost the preview, or
        // scrolled away) is not a refusal.
        if (err instanceof DOMException && err.name === 'NotAllowedError') c.blocked = true
      },
    )
  }, [])

  const report = useCallback(() => {
    const v = videoRef.current
    if (v) onSound(film.id, !v.paused && !v.muted && v.volume > 0)
  }, [onSound, film.id])

  const open = useCallback(() => {
    const c = ctl.current
    const v = videoRef.current
    if (v) v.loop = false
    if (c.opened) return
    c.opened = true
    onOpen(film.id)
  }, [onOpen, film.id])

  // The poster first: note the file it loaded, then the recording may load and preview.
  useEffect(() => {
    const img = frameRef.current?.querySelector<HTMLImageElement>('.fp-poster img')
    if (!img) {
      setPosterSrc('')
      return
    }
    const done = () => setPosterSrc(img.naturalWidth ? img.currentSrc || img.src : '')
    if (img.complete) {
      done()
      return
    }
    img.addEventListener('load', done)
    img.addEventListener('error', done)
    return () => {
      img.removeEventListener('load', done)
      img.removeEventListener('error', done)
    }
  }, [])

  // The page's decision (and the preference): preview, or pause a preview where it is. An opened film is the visitor's.
  useEffect(() => {
    if (opened) return
    if (preview && !reduced) tryPreview()
    else autoPause()
  }, [preview, opened, reduced, posterReady, tryPreview, autoPause])

  // Any film pauses once it is completely out of view, the part under the navigation included (not while it is in full
  // screen, where the page is not what is watched).
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting && !document.fullscreenElement) autoPause()
      },
      { rootMargin: `-${headerHeight()}px 0px 0px 0px` },
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

  // The recording appears once it has a frame of its own (never the black box of a playing video without one).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    return onFramePresented(v, () => setHasFrame(true))
  }, [])

  // Full screen (touch Expand) counts as opening the film. Leaving it returns focus to Expand when nothing holds it.
  useEffect(() => {
    const onChange = () => {
      const own = Boolean(videoRef.current) && document.fullscreenElement === videoRef.current
      setFullscreen((was) => {
        if (was && !own) requestAnimationFrame(() => returnFocus(expandRef.current))
        return own
      })
      if (own) open()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [open])

  // Leaving the page always stops playback.
  useEffect(() => {
    const v = videoRef.current
    return () => {
      v?.pause()
    }
  }, [])

  const onPlay = () => {
    const c = ctl.current
    setPlaying(true)
    setStarted(true)
    // Started by the visitor (the bar, a click on the picture, or the browser's controls in full screen), not by the
    // preview: the visitor opened the film.
    if (!c.autoStart) open()
    report()
  }

  const onPause = () => {
    const v = videoRef.current
    const c = ctl.current
    setPlaying(false)
    report()
    if (c.selfPause) {
      c.selfPause = false
      return
    }
    // The visitor paused a preview: no more previews on the page until they start a film.
    if (v && !v.ended && !c.expanded && !c.opened && document.visibilityState !== 'hidden') onPreviewPause()
  }

  const onVolumeChange = () => {
    const v = videoRef.current
    const c = ctl.current
    if (c.selfMute) c.selfMute = false
    else if (v && !v.muted) open()
    report()
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

  /**
   * Watch film / Watch with sound: from the start, with sound (a direct gesture). The button that was pressed leaves
   * as the film starts, so focus moves to the bar's Pause button.
   */
  const watch = () => {
    const v = videoRef.current
    const c = ctl.current
    if (!v) return
    open()
    if (v.currentTime > 0.05) {
      c.selfSeek = true
      v.currentTime = 0
    }
    if (v.muted) c.selfMute = true
    v.muted = false
    v.play().then(
      () => playRef.current?.focus({ preventScroll: true }),
      () => {},
    )
  }

  const openExpanded = () => {
    const v = videoRef.current
    if (!v) return
    const c = ctl.current
    const wasPreview = !c.opened
    // From the poster or a preview the visitor asked to watch, so it plays (with sound); a paused film stays paused.
    const play = (!v.paused && !v.ended) || wasPreview
    if (window.matchMedia(NATIVE_FULLSCREEN).matches) {
      // This film itself in full screen (started within the gesture). Without full screen support, the dialog below takes over.
      open()
      if (wasPreview && v.muted) {
        c.selfMute = true
        v.muted = false
      }
      if (play && v.paused) v.play().catch(() => {})
      if (enterFullscreen(v)) return
    }
    c.expanded = true
    open()
    autoPause()
    // The larger view opens on what is on screen here (this frame, or the poster).
    const from = hasFrame ? v : (frameRef.current?.querySelector<HTMLImageElement>('.fp-poster img') ?? null)
    setExpanded({ time: v.currentTime, play, muted: wasPreview ? false : v.muted, volume: v.volume, from })
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
    const back = () => expandRef.current?.focus({ preventScroll: true })
    back()
    // Leaving full screen inside the view can drop focus to the page after this runs: return it once more.
    requestAnimationFrame(() => {
      if (!document.activeElement || document.activeElement === document.body) back()
    })
  }

  // Poster: one obvious Watch film. Preview (playing, or paused where it was): Watch with sound in the bar.
  const posterMode = !opened && !playing && !started
  const showSound = !opened && started
  const ratio = asset.width / asset.height
  const mode = opened ? 'opened' : playing ? 'preview' : started ? 'paused' : 'poster'

  /**
   * The bar's play or pause control (and a click on the picture). Poster: Watch film. A preview: its pause is the
   * visitor's (onPause stops the previews), and play resumes it as the visitor's own (onPlay opens it).
   */
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (posterMode) watch()
    else if (v.paused || v.ended) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <figure className="fp" data-mode={mode} data-layout={layout} style={{ '--film-r': ratio } as CSSProperties}>
      <div className="cs-player fp-player">
        <div ref={frameRef} className="fp-frame" data-has-frame={hasFrame || undefined}>
          <div className="fp-poster" aria-hidden="true">
            <ResponsiveImage image={asset.poster} sizes={sizes} decorative fit="contain" priority={priority} />
          </div>
          <video
            ref={videoRef}
            className="fp-video"
            src={src}
            poster={posterSrc || undefined}
            width={asset.width}
            height={asset.height}
            playsInline
            // Nothing over the picture (the bar below is the player's); the browser's own controls appear only while
            // this film is in full screen (touch Expand), so it can be left there.
            controls={fullscreen}
            controlsList={fullscreen ? undefined : 'nofullscreen'}
            preload={opened || started || (preview && posterReady && !reduced) ? 'auto' : 'none'}
            aria-label={`${film.name} film`}
            onPlay={onPlay}
            onPause={onPause}
            onVolumeChange={onVolumeChange}
            onSeeking={onSeeking}
            onClick={fullscreen ? undefined : togglePlay}
          />
          {posterMode && (
            <span className="fp-center">
              <button type="button" className="button button--secondary fp-watch" onClick={watch}>
                <PlayIcon />
                Watch film
                <span className="visually-hidden">
                  , {film.name}, {spokenDuration(asset.duration)}, with sound
                </span>
              </button>
            </span>
          )}
        </div>
        {/*
          The compact bar below the film inside its frame (DemoControls, as the product recordings): Play and Expand on
          the poster; Pause, Watch with sound and Expand while it previews; the complete bar once it is the visitor's.
        */}
        <DemoControls
          videoRef={videoRef}
          title={`${film.name} film`}
          noun="film"
          duration={asset.duration}
          hasAudio={asset.hasAudio}
          seekable={opened}
          sound={opened}
          onTogglePlay={togglePlay}
          playRef={playRef}
          onExpand={openExpanded}
          expandLabel={`Expand film, ${film.name}`}
          expandRef={expandRef}
        >
          {showSound && (
            <button type="button" className="fp-sound" onClick={watch}>
              <SoundIcon />
              Watch with sound
              <span className="visually-hidden">, {film.name}, from the start</span>
            </button>
          )}
        </DemoControls>
      </div>
      {expanded && <FilmDialog asset={asset} title={film.name} posterSrc={fallbackSrc(posterAsset, 1600)} start={expanded} onClose={closeExpanded} />}
    </figure>
  )
}

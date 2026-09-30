import { type KeyboardEvent, type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react'
import './MiniControls.css'

/**
 * A small glowing player under a recording on the page (Harlie's requests, 2026-09-30: "add a little cute play pause
 * forward back video line under the videos", "it should glow", then two music players' layouts as models, "not exactly
 * like it more cute and glowy"): a thin glowing line with a knob showing where the recording is (click or drag it, or
 * move it with the arrow keys: it is a slider), and under it previous, play or pause in a glowing ring, and next.
 * Previous and next move between the recording's parts (`marks`: the parts the page's steps use), as a music player
 * moves between tracks: previous goes back to the start of the current part, or to the one before when already at its
 * start. Without marks they move 5 seconds. The recording's own logic decides what the controls mean for it (CaseStory's VideoStage):
 * `onUse` tells it the visitor has taken over, `onPlay`/`onPause` carry a visitor's play or pause.
 *
 * The line follows playback on every frame only while the recording plays (it stops when it pauses, ends or leaves the
 * page); otherwise it moves with the recording's own time and seek events. Nothing runs while nothing plays.
 */
const SKIP = 5

/** Moves a recording to `t` seconds, within its length. */
function seekTo(el: HTMLVideoElement, t: number) {
  const d = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0
  el.currentTime = Math.max(0, d ? Math.min(d - 0.05, t) : t)
}

const fmt = (s: number) => {
  const t = Math.max(0, Math.round(s))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

export function MiniControls({
  video,
  label,
  marks,
  onUse,
  onPlay,
  onPause,
}: {
  video: RefObject<HTMLVideoElement | null>
  /** Where the recording's parts start (seconds), for previous and next. */
  marks?: readonly number[]
  /** What is being controlled, for the controls' names ("Merchandising Dashboard recording"). */
  label: string
  /** Any use of the controls (a skip, a seek, play or pause). */
  onUse: () => void
  onPlay: () => void
  onPause: () => void
}) {
  const [paused, setPaused] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = video.current
    const line = lineRef.current
    if (!el || !line) return
    let frame = 0
    const dur = () => (Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0)
    const paint = () => {
      const d = dur()
      line.style.setProperty('--p', d ? String(Math.min(1, el.currentTime / d)) : '0')
    }
    // Once per presented video frame where the browser can say so (the recording's own 24-30 frames a second), else
    // once per animation frame; only while it plays.
    const perFrame = 'requestVideoFrameCallback' in el
    const next = () => (perFrame ? el.requestVideoFrameCallback(follow) : requestAnimationFrame(follow))
    const cancel = (id: number) => (perFrame ? el.cancelVideoFrameCallback(id) : cancelAnimationFrame(id))
    function follow() {
      paint()
      frame = el!.paused || el!.ended ? 0 : next()
    }
    const read = () => {
      setPaused(el.paused)
      setTime(el.currentTime)
      setDuration(dur())
      paint()
      if (!el.paused && !frame) frame = next()
      if (el.paused && frame) {
        cancel(frame)
        frame = 0
      }
    }
    const events = ['play', 'playing', 'pause', 'ended', 'timeupdate', 'seeked', 'durationchange', 'loadedmetadata', 'emptied'] as const
    events.forEach((n) => el.addEventListener(n, read))
    read()
    return () => {
      events.forEach((n) => el.removeEventListener(n, read))
      if (frame) cancel(frame)
    }
  }, [video])

  const seek = (t: number) => {
    const el = video.current
    if (!el) return
    onUse()
    seekTo(el, t)
  }
  const skip = (dir: -1 | 1) => {
    const t = video.current?.currentTime ?? 0
    if (!marks?.length) return seek(t + dir * SKIP)
    const starts = [...marks].sort((a, b) => a - b)
    let i = 0
    while (i < starts.length - 1 && starts[i + 1] <= t + 0.05) i++
    if (dir < 0) seek(t - starts[i] > 1 ? starts[i] : starts[Math.max(0, i - 1)])
    else seek(starts[i + 1] ?? starts[0])
  }
  const toggle = () => {
    const el = video.current
    if (!el) return
    onUse()
    if (el.paused) onPlay()
    else onPause()
  }

  const at = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const d = video.current?.duration
    if (!d || !Number.isFinite(d) || !r.width) return
    seek(((e.clientX - r.left) / r.width) * d)
  }
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    at(e)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) at(e)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = video.current?.currentTime ?? 0
    const to =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? t + SKIP
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? t - SKIP
      : e.key === 'Home' ? 0
      : e.key === 'End' ? Infinity
      : null
    if (to === null) return
    e.preventDefault()
    seek(to)
  }

  const previous = (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect x="2.6" y="3" width="2.3" height="10" rx="1" fill="currentColor" />
      <path d="M13.4 3.6v8.8a.55.55 0 0 1-.86.45L6.4 8.45a.55.55 0 0 1 0-.9l6.14-4.4a.55.55 0 0 1 .86.45Z" fill="currentColor" />
    </svg>
  )
  const next = (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect x="11.1" y="3" width="2.3" height="10" rx="1" fill="currentColor" />
      <path d="M2.6 3.6v8.8a.55.55 0 0 0 .86.45L9.6 8.45a.55.55 0 0 0 0-.9L3.46 3.15a.55.55 0 0 0-.86.45Z" fill="currentColor" />
    </svg>
  )
  const prevLabel = marks?.length ? 'Previous part' : `Back ${SKIP} seconds`
  const nextLabel = marks?.length ? 'Next part' : `Forward ${SKIP} seconds`

  return (
    <div className="mini-ctl" role="group" aria-label={`${label} controls`}>
      <div
        ref={lineRef}
        className="mini-ctl__line"
        role="slider"
        tabIndex={0}
        aria-label={`${label} position`}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onKeyDown={onKey}
      >
        <span className="mini-ctl__track" aria-hidden="true">
          <span className="mini-ctl__fill" />
          <span className="mini-ctl__knob" />
        </span>
      </div>
      <div className="mini-ctl__buttons">
        <button type="button" className="mini-ctl__btn" aria-label={prevLabel} title={prevLabel} onClick={() => skip(-1)}>
          {previous}
        </button>
        <button type="button" className="mini-ctl__btn mini-ctl__btn--play" aria-label={paused ? 'Play recording' : 'Pause recording'} title={paused ? 'Play' : 'Pause'} onClick={toggle}>
          {paused ? (
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path d="M4.8 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <rect x="3.5" y="2.5" width="3" height="11" rx="1.2" fill="currentColor" />
              <rect x="9.5" y="2.5" width="3" height="11" rx="1.2" fill="currentColor" />
            </svg>
          )}
        </button>
        <button type="button" className="mini-ctl__btn" aria-label={nextLabel} title={nextLabel} onClick={() => skip(1)}>
          {next}
        </button>
      </div>
    </div>
  )
}

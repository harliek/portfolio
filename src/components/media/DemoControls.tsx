import { useCallback, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type Ref, type RefObject } from 'react'
import { ExpandIcon } from './ExpandIcon'

/*
 * DemoControls: the compact control bar BELOW a product recording (brief-v13, DemoVideo and its larger view):
 * play or pause, a seek slider, sound, and the player's enlarge control. Nothing is drawn over the recording
 * itself (no timer, no native timeline), so its picture stays clean.
 *
 * - One source of truth: the <video> element. The bar reads it through a small external store (paused, muted,
 *   position, duration) refreshed by the element's own events; it keeps no playback state of its own, and every
 *   action goes to the element or, for play and pause, to the player's handler (DemoVideo applies its autoplay
 *   rules there).
 * - Seek: a native range input named "Seek" whose position is given to assistive technology as text ("0:04 of
 *   0:10"); nothing shows a running time. Keyboard: arrows move 5% of the recording, Page Up and Page Down 20%,
 *   Home and End go to the start and the end.
 * - Sound: a recording without an audio track shows the control disabled, named "This recording has no sound", so
 *   the bar never offers a switch that does nothing.
 * - Colour (case.css .cs-controls): neutral at rest; the project accent only on the focused or pressed control and
 *   on the slider while it is dragged.
 */

interface Snapshot {
  paused: boolean
  muted: boolean
  /** Seconds. */
  time: number
  /** Seconds (the manifest's until the element knows its own). */
  duration: number
}

const EVENTS = ['play', 'pause', 'playing', 'timeupdate', 'seeking', 'seeked', 'durationchange', 'loadedmetadata', 'volumechange', 'ended', 'emptied'] as const

/**
 * A read-only view of one <video> element for useSyncExternalStore: the snapshot changes only when the element does.
 * The element is given at subscription (after the commit, when the player's ref is set).
 */
function createVideoStore(fallbackDuration: number) {
  let snap: Snapshot = { paused: true, muted: true, time: 0, duration: fallbackDuration }
  const listeners = new Set<() => void>()
  let el: HTMLVideoElement | null = null

  const read = () => {
    if (!el) return
    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : fallbackDuration
    const next: Snapshot = { paused: el.paused, muted: el.muted, time: Math.min(el.currentTime, duration), duration }
    if (next.paused === snap.paused && next.muted === snap.muted && next.time === snap.time && next.duration === snap.duration) return
    snap = next
    listeners.forEach((l) => l())
  }

  const subscribe = (video: HTMLVideoElement | null, listener: () => void) => {
    listeners.add(listener)
    if (!el && video) {
      el = video
      EVENTS.forEach((name) => el?.addEventListener(name, read))
    }
    read()
    return () => {
      listeners.delete(listener)
      if (listeners.size || !el) return
      EVENTS.forEach((name) => el?.removeEventListener(name, read))
      el = null
    }
  }

  return { subscribe, getSnapshot: () => snap, read }
}

/** "1:05" (minutes and seconds), for the slider's spoken position. */
const clock = (s: number) => {
  const t = Math.max(0, Math.round(s))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  )
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="0.8" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="0.8" fill="currentColor" />
    </svg>
  )
}

/** A speaker; `off` adds a cross (muted) and `none` a slash (no sound track). */
function SoundGlyph({ state }: { state: 'on' | 'off' | 'none' }) {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      {state === 'on' && <path d="M10.6 5.4a3.6 3.6 0 0 1 0 5.2M12.4 3.7a6 6 0 0 1 0 8.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
      {state === 'off' && <path d="m10.6 6.2 3.4 3.6m0-3.6-3.4 3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
      {state === 'none' && <path d="m2 2.5 12 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
    </svg>
  )
}

export interface DemoControlsProps {
  videoRef: RefObject<HTMLVideoElement | null>
  /** The recording's name: the bar is the group "<title> controls". */
  title: string
  /** The manifest's duration in seconds, used until the element has its metadata. */
  duration: number
  /** The recording has a sound track; otherwise the sound control is shown disabled. */
  hasAudio: boolean
  /** Play or pause through the player (its autoplay rules); by default the element itself. */
  onTogglePlay?: () => void
  /** The play and pause button (DemoVideo moves focus here after its own Play demo button). */
  playRef?: Ref<HTMLButtonElement>
  /** The enlarge control at the end of the bar (shown when `onExpand` is given), and its name. */
  onExpand?: () => void
  expandLabel?: string
  expandRef?: Ref<HTMLButtonElement>
}

export function DemoControls({ videoRef, title, duration: fallbackDuration, hasAudio, onTogglePlay, playRef, onExpand, expandLabel = 'Expand video', expandRef }: DemoControlsProps) {
  const [store] = useState(() => createVideoStore(fallbackDuration))
  const subscribe = useCallback((listener: () => void) => store.subscribe(videoRef.current, listener), [store, videoRef])
  const { paused, muted, time, duration } = useSyncExternalStore(subscribe, store.getSnapshot, store.getSnapshot)
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay()
      return
    }
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) v.play().catch(() => {})
    else v.pause()
  }

  const seek = (seconds: number) => {
    const v = videoRef.current
    if (!v || !(duration > 0)) return
    v.currentTime = Math.max(0, Math.min(seconds, duration - 0.05))
    // The element reports its new position at once; the bar follows it without waiting for 'seeking'.
    store.read()
  }

  const onSeekKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const small = Math.max(0.5, duration * 0.05)
    const large = duration * 0.2
    const target =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? time - small
        : e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? time + small
          : e.key === 'PageDown'
            ? time - large
            : e.key === 'PageUp'
              ? time + large
              : e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? duration
                  : undefined
    if (target === undefined) return
    e.preventDefault()
    seek(target)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (v) v.muted = !v.muted
  }

  return (
    <div className="cs-controls" role="group" aria-label={`${title} controls`}>
      <button ref={playRef} type="button" className="cs-ctl" aria-label={paused ? 'Play recording' : 'Pause recording'} onClick={togglePlay}>
        {paused ? <PlayGlyph /> : <PauseGlyph />}
      </button>
      <input
        type="range"
        className="cs-seek"
        min={0}
        max={duration}
        step="any"
        value={time}
        aria-label="Seek"
        aria-valuetext={`${clock(time)} of ${clock(duration)}`}
        style={{ '--p': `${progress}%` } as CSSProperties}
        onChange={(e) => seek(Number(e.currentTarget.value))}
        onKeyDown={onSeekKey}
      />
      {hasAudio ? (
        <button type="button" className="cs-ctl" aria-label={muted ? 'Unmute recording' : 'Mute recording'} onClick={toggleMute}>
          <SoundGlyph state={muted ? 'off' : 'on'} />
        </button>
      ) : (
        <button type="button" className="cs-ctl" disabled aria-label="This recording has no sound" title="This recording has no sound">
          <SoundGlyph state="none" />
        </button>
      )}
      {onExpand && (
        <button ref={expandRef} type="button" className="cs-ctl cs-ctl--expand" aria-label={expandLabel} onClick={onExpand}>
          <ExpandIcon />
        </button>
      )}
    </div>
  )
}

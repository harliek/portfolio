import { useEffect, useState, type RefObject } from 'react'

/** Compact playback controls keep the recording free of a timer overlay. */
export function DemoControls({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const sync = () => {
      setPlaying(!video.paused)
      setMuted(video.muted)
      setProgress(Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration * 100 : 0)
    }
    const events = ['play', 'pause', 'timeupdate', 'loadedmetadata', 'volumechange', 'ended']
    events.forEach((name) => video.addEventListener(name, sync))
    sync()
    return () => events.forEach((name) => video.removeEventListener(name, sync))
  }, [videoRef])
  return (
    <div className="demo-controls" role="group" aria-label="Playback controls">
      <button type="button" aria-label={playing ? 'Pause recording' : 'Play recording'} onClick={() => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) void video.play().catch(() => {})
        else video.pause()
      }}>{playing ? 'Pause' : 'Play'}</button>
      <input type="range" min="0" max="100" step="0.1" value={progress} aria-label="Playback position" aria-valuetext={`${Math.round(progress)} percent`} onInput={(event) => {
        const next = Number(event.currentTarget.value)
        setProgress(next)
        const video = videoRef.current
        if (video && Number.isFinite(video.duration)) video.currentTime = next / 100 * video.duration
      }} />
      <button type="button" aria-label={muted ? 'Unmute recording' : 'Mute recording'} onClick={() => {
        const video = videoRef.current
        if (video) video.muted = !video.muted
      }}>{muted ? 'Sound on' : 'Mute'}</button>
    </div>
  )
}

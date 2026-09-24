import { useEffect } from 'react'

/**
 * Site-wide media policy, mounted once:
 * - starting any video pauses every other playing video;
 * - all media pause when the document becomes hidden.
 * Paused media are never resumed automatically.
 * Ambient loops (`data-ambient`: the muted stage background and the Shift
 * preview) are exempt from the first rule in both directions — they never
 * pause a film and a film start does not count them — and resume
 * themselves when the page is visible again.
 */
export function useMediaPlayback() {
  useEffect(() => {
    const onPlay = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLMediaElement) || target.hasAttribute('data-ambient')) return
      document.querySelectorAll<HTMLMediaElement>('video:not([data-ambient]), audio').forEach((el) => {
        if (el !== target && !el.paused) el.pause()
      })
    }
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return
      document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
        if (!el.paused) el.pause()
      })
    }
    // 'play' does not bubble; capture it at the document.
    document.addEventListener('play', onPlay, true)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('play', onPlay, true)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}

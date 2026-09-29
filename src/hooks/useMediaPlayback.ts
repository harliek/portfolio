import { useEffect } from 'react'

/** Media that produce sound: playing, not muted, audible volume. */
const audible = (el: HTMLMediaElement) => !el.paused && !el.muted && el.volume > 0

/**
 * Site-wide media policy, mounted once (PageShell):
 * - ONE video with sound at a time (brief-v8 section 13): when a video starts
 *   with sound, or a playing one is unmuted, every other playing video or
 *   audio element with sound pauses. Muted previews never pause anything and
 *   are never paused by this rule, so several muted previews may play
 *   together (e.g. the stacked Creative Production films while visible);
 * - all media pause when the document becomes hidden.
 * Paused media are never resumed by this hook. The muted players that play by
 * themselves (a case study's recording, the Creative Production excerpts, the
 * homepage tiles and film) start again themselves when the page is visible
 * again; a film with sound, or a recording's larger view, stays paused until
 * the visitor plays it.
 *
 * Ambient loops (`data-ambient`: the About art preview) are exempt in both
 * directions: they never pause a film and a film start does not count them.
 * They resume themselves when the page is visible again.
 */
export function useMediaPlayback() {
  useEffect(() => {
    const others = (target: HTMLMediaElement) =>
      Array.from(document.querySelectorAll<HTMLMediaElement>('video:not([data-ambient]), audio')).filter((el) => el !== target && !el.paused)

    const enforce = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLMediaElement) || target.hasAttribute('data-ambient') || target.paused) return
      if (!audible(target)) return
      others(target).forEach((el) => {
        if (audible(el)) el.pause()
      })
    }
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return
      document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
        if (!el.paused) el.pause()
      })
    }
    // A <video> React takes out of the page (the homepage's film and tiles, a case's recording, a closed film or
    // larger view) otherwise keeps downloading for 5-20 s, taking bandwidth from the next page's media. Once it is
    // gone it lets go of its file; nothing on the site puts a removed video back. Every video here sets its file with
    // a src attribute (none uses <source> children), so dropping it and calling load() ends the download.
    const release = (video: HTMLVideoElement) => {
      if (video.isConnected) return
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
    const removed = new MutationObserver((records) => {
      const gone: HTMLVideoElement[] = []
      for (const record of records) {
        record.removedNodes.forEach((node) => {
          if (node instanceof HTMLVideoElement) gone.push(node)
          else if (node instanceof Element) node.querySelectorAll('video').forEach((video) => gone.push(video))
        })
      }
      if (gone.length) queueMicrotask(() => gone.forEach(release))
    })
    removed.observe(document.body, { childList: true, subtree: true })

    // 'play' and 'volumechange' do not bubble; capture them at the document.
    document.addEventListener('play', enforce, true)
    document.addEventListener('volumechange', enforce, true)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      removed.disconnect()
      document.removeEventListener('play', enforce, true)
      document.removeEventListener('volumechange', enforce, true)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}

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
 * - exclusive players (`data-exclusive`, e.g. a player that must stop others
 *   even while muted) keep the earlier rule: starting one pauses every other
 *   non-ambient video;
 * - all media pause when the document becomes hidden.
 * Paused media are never resumed by this hook. A case study's DemoVideo
 * resumes itself when the page is visible again (unless the visitor paused
 * it); when this policy pauses a player, the player counts that as the
 * visitor's pause and does not restart on its own. Its larger view pauses the
 * inline copy itself, so two copies of one recording never play.
 *
 * Ambient loops (`data-ambient`: the muted stage background and the About art
 * preview) are exempt in both directions: they never pause a film and a film
 * start does not count them. They resume themselves when the page is visible
 * again.
 */
export function useMediaPlayback() {
  useEffect(() => {
    const others = (target: HTMLMediaElement) =>
      Array.from(document.querySelectorAll<HTMLMediaElement>('video:not([data-ambient]), audio')).filter((el) => el !== target && !el.paused)

    const enforce = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLMediaElement) || target.hasAttribute('data-ambient') || target.paused) return
      if (target.hasAttribute('data-exclusive')) {
        others(target).forEach((el) => el.pause())
        return
      }
      if (!audible(target)) return
      others(target).forEach((el) => {
        if (audible(el) || el.hasAttribute('data-exclusive')) el.pause()
      })
    }
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return
      document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
        if (!el.paused) el.pause()
      })
    }
    // 'play' and 'volumechange' do not bubble; capture them at the document.
    document.addEventListener('play', enforce, true)
    document.addEventListener('volumechange', enforce, true)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('play', enforce, true)
      document.removeEventListener('volumechange', enforce, true)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}

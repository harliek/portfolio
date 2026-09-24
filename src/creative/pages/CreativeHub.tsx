import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { prefetchRoute } from '../../routes'
import { TILES } from '../content'
import { Video } from '../lib/Media'
import { Contact } from '../site/Contact'
import { Foot } from '../site/Foot'

/*
  Two rooms, as in the original. The work is one click away.

  Archive repair: each room carries a visible "View …" cue, so the tiles read
  as links before any hover.
*/

const Arrow = () => (
  <svg width="15" height="10" viewBox="0 0 16 9" fill="none" aria-hidden="true">
    <path d="M0 4.5h15M11.5 1L15 4.5 11.5 8" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

export default function CreativeHub() {
  usePageMeta('Creative', 'Selected film and visual art by Harlie Katz.')

  return (
    <main id="main" className="cv">
      <header className="cv-head lc-shell">
        <h1 className="cv-t lc-display">Creative</h1>
        <p className="cv-d">Selected film and visual art.</p>
      </header>

      <div className="cv-grid lc-shell">
        <Link
          to="/creative/film"
          className="cv-card cv-card--film"
          onPointerEnter={() => prefetchRoute('/creative/film')}
          onFocus={() => prefetchRoute('/creative/film')}
        >
          <span className="cv-media">
            <Video className="cv-fill" src={TILES.film.video} poster={TILES.film.poster} />
          </span>
          <span className="cv-face">
            <span className="cv-text">
              <span className="cv-n lc-serif">Film</span>
              <span className="cv-m">Direction, camera, edit · two festival selections</span>
            </span>
            <span className="cv-go">
              View films
              <Arrow />
            </span>
          </span>
        </Link>

        <Link
          to="/creative/art"
          className="cv-card cv-card--art"
          onPointerEnter={() => prefetchRoute('/creative/art')}
          onFocus={() => prefetchRoute('/creative/art')}
        >
          <span className="cv-media">
            <Video className="cv-fill" src={TILES.art.video} poster={TILES.art.poster} />
          </span>
          <span className="cv-face">
            <span className="cv-text">
              <span className="cv-n lc-serif">Art</span>
              <span className="cv-m">Drawing and paint</span>
            </span>
            <span className="cv-go">
              View art
              <Arrow />
            </span>
          </span>
        </Link>
      </div>

      <Contact />
      <Foot />
    </main>
  )
}

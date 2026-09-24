import '../styles/pages/film.css'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreativeNav } from '../components/creative/CreativeNav'
import { FilmPlayer, watchUrl } from '../components/creative/FilmPlayer'
import { ResponsiveImage } from '../components/media/ResponsiveImage'
import { FEATURED_FILM_ID, filmById, FILMS, publishedLabel, type Film as FilmData } from '../content/creative'
import { projectById, projectPath } from '../content/projects'
import { usePageMeta } from '../hooks/usePageMeta'
import { prefetchRoute } from '../routes'

const FEATURED = filmById(FEATURED_FILM_ID)
const OWN = FILMS.filter((f) => f.kind === 'own' && f.id !== FEATURED.id)
const CLIENT = FILMS.filter((f) => f.kind === 'client')
const CLIENT_WORK = projectById('client-work')
const CLIENT_WORK_PATH = projectPath(CLIENT_WORK)

/** Keeps each separator dot with the role before it, so a wrapped line never starts with “·”. */
const roleText = (role: string) => role.split(' · ').join('\u00a0· ')

const CARD_SIZES = '(min-width: 1280px) 564px, (min-width: 700px) calc((100vw - 104px) / 2), calc(100vw - 40px)'

function YouTubeLink({ film, className, children = 'YouTube' }: { film: FilmData; className: string; children?: string }) {
  return (
    <a href={watchUrl(film.youtubeId)} className={className} target="_blank" rel="noopener noreferrer">
      <span className="visually-hidden">{film.title} on </span>
      <span className="film-link__text">{children}</span>
      <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

function FilmCard({ film, playing, onPlay }: { film: FilmData; playing: boolean; onPlay: () => void }) {
  const titleId = useId()
  return (
    <article id={film.id} className="film-card" aria-labelledby={titleId}>
      <FilmPlayer film={film} sizes={CARD_SIZES} playing={playing} onPlay={onPlay} />
      <div className="film-card__text">
        <h3 id={titleId} className="film-card__title">
          {film.title}
        </h3>
        <p className="film-card__role">{roleText(film.role)}</p>
        <p className="film-card__note">{film.note}</p>
        <p className="film-card__meta">
          <span className="tabular">{publishedLabel(film)}</span>
          <span aria-hidden="true" className="film-card__sep">
            ·
          </span>
          <YouTubeLink film={film} className="film-card__yt" />
        </p>
      </div>
    </article>
  )
}

/**
 * Films (/film, a preserved URL; linked from About and the Drawings page,
 * not the header). The featured short film, the other short films, then
 * client and production work, ending with a link to Client Work for the
 * three Shift Content agency films. Every player is a still with a real
 * button; the privacy-enhanced YouTube embed loads only after a click, and
 * only one film plays at a time. Roles are as listed on Harlie's previous
 * portfolio; festival selections are not shown.
 */
export default function Film() {
  usePageMeta('Films', 'Short films by Harlie Katz, and client and production work.')
  const [playing, setPlaying] = useState<string | null>(null)

  return (
    <article className="page-film">
      <header className="shell film-intro">
        <CreativeNav />
        <p className="film-intro__eyebrow">Art portfolio</p>
        <h1 className="film-intro__title" tabIndex={-1}>
          Films
        </h1>
        <p className="film-intro__lead">Short films and client projects, with my role on each.</p>
      </header>

      <section id={FEATURED.id} className="shell film-featured" aria-labelledby="film-featured-title">
        <div className="film-featured__text">
          <p className="film-eyebrow">Featured short film</p>
          <h2 id="film-featured-title" className="film-featured__title">
            {FEATURED.title}
          </h2>
          <p className="film-featured__note">{FEATURED.note}</p>
          <dl className="film-facts">
            <div>
              <dt>Role</dt>
              <dd>{roleText(FEATURED.role)}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd className="tabular">{publishedLabel(FEATURED).replace('Published on ', 'On ')}</dd>
            </div>
          </dl>
          <YouTubeLink film={FEATURED} className="film-link">
            Watch on YouTube
          </YouTubeLink>
        </div>
        <div className="film-featured__media">
          <FilmPlayer
            film={FEATURED}
            sizes="(min-width: 1280px) 700px, (min-width: 960px) 58vw, calc(100vw - 40px)"
            playing={playing === FEATURED.id}
            onPlay={() => setPlaying(FEATURED.id)}
            priority
            label="Watch film"
          />
        </div>
      </section>

      <section className="shell film-group" aria-labelledby="film-shorts-title">
        <h2 id="film-shorts-title" className="film-group__title">
          Short films
        </h2>
        <ul className="film-grid" role="list">
          {OWN.map((f) => (
            <li key={f.id}>
              <FilmCard film={f} playing={playing === f.id} onPlay={() => setPlaying(f.id)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="shell film-group" aria-labelledby="film-client-title">
        <h2 id="film-client-title" className="film-group__title">
          Client and production work
        </h2>
        <ul className="film-grid" role="list">
          {CLIENT.map((f) => (
            <li key={f.id}>
              <FilmCard film={f} playing={playing === f.id} onPlay={() => setPlaying(f.id)} />
            </li>
          ))}
        </ul>

        <div className="film-shift">
          <span className="film-shift__still">
            <ResponsiveImage image="nickleby-poster" sizes="(min-width: 700px) 320px, calc(100vw - 40px)" decorative fit="cover" />
          </span>
          <div className="film-shift__text">
            <h3 className="film-shift__title">
              <Link
                to={CLIENT_WORK_PATH}
                className="film-shift__link"
                onPointerEnter={() => prefetchRoute(CLIENT_WORK_PATH)}
                onFocus={() => prefetchRoute(CLIENT_WORK_PATH)}
              >
                {CLIENT_WORK.name} at Shift Content
              </Link>
            </h3>
            <p className="film-shift__body">
              Production support on three agency client films, Nickleby Capital, Aristocracy, and The Night Club Global Tour. The films and my contribution to each are on the Client Work page.
            </p>
            <p className="film-shift__cta" aria-hidden="true">
              <span className="film-link__text">View {CLIENT_WORK.name}</span>
              <span>→</span>
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}

import { useCallback, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { CLIENT_FILMS, FILMS, STILL_NOTE, type Film } from '../content'
import { Lightbox } from '../lib/Lightbox'
import { Picture } from '../lib/Media'
import { Contact } from '../site/Contact'
import { Foot } from '../site/Foot'

/*
  The films are the content, so they are not put inside cards and they are
  not all the same size. One work leads each group; the rest are set beside
  it at the sizes the work asks for. (The original's layout, unchanged.)

  Archive repair: the play affordance is a visible "Watch film" label on
  every poster rather than an icon that appeared on hover. A production
  without a film of Harlie's own to publish opens its still, as in the
  original, and says "View still" instead. YouTube (youtube-nocookie) loads
  only after the click.
*/

const PlayIcon = () => (
  <svg width="11" height="13" viewBox="0 0 13 15" fill="none" aria-hidden="true">
    <path d="M0 0l13 7.5L0 15z" fill="currentColor" />
  </svg>
)

const ExpandIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M7 1h4v4M5 11H1V7M11 1L7 5M1 11l4-4" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

export default function FilmPage() {
  usePageMeta('Film', 'Short films and client production work by Harlie Katz.')
  const [open, setOpen] = useState<Film | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <main id="main" className="fl">
      <header className="fl-head lc-shell">
        <p className="fl-crumb">
          <Link to="/creative">Creative</Link>
          <span aria-hidden="true">/</span>
          <b>Film</b>
        </p>
        <h1 className="fl-t lc-display">Film</h1>
      </header>

      <Group id="directed" label="Directed and edited work" films={FILMS} onOpen={setOpen} />
      <Group id="client" label="Client production work" films={CLIENT_FILMS} onOpen={setOpen} />

      <Lightbox open={Boolean(open)} onClose={close} label={open?.title ?? 'Film'}>
        {open?.yt ? (
          <iframe
            className="fl-frame"
            src={`https://www.youtube-nocookie.com/embed/${open.yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={open.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          open && (
            <div className="fl-still">
              <Picture img={open.poster} alt={open.title} sizes="min(760px, 86vw)" eager />
              <p>{STILL_NOTE}</p>
            </div>
          )
        )}
        {open && (
          <div className="fl-lb-copy">
            <p className="fl-lb-t">{open.title}</p>
            <p className="fl-lb-r">{open.role}</p>
            <p className="fl-lb-n">{open.note}</p>
          </div>
        )}
      </Lightbox>

      <Contact />
      <Foot />
    </main>
  )
}

function Group({ id, label, films, onOpen }: { id: string; label: string; films: Film[]; onOpen: (f: Film) => void }) {
  return (
    <section className="fl-group lc-shell" aria-labelledby={`fl-${id}`}>
      <h2 className="lc-label fl-group-k" id={`fl-${id}`}>
        {label}
      </h2>
      <div className="fl-grid">
        {films.map((f, i) => {
          const action = f.yt ? 'Watch film' : 'View still'
          return (
            <article key={f.id} className="fl-item" style={{ gridColumn: `span ${f.span}`, '--i': i } as CSSProperties}>
              <button type="button" onClick={() => onOpen(f)} aria-label={`${action}, ${f.title}`} aria-describedby={`fl-${f.id}-copy`}>
                <span className="fl-media" style={{ aspectRatio: f.ratio }}>
                  <Picture
                    className="fl-img"
                    img={f.poster}
                    alt=""
                    sizes={`(max-width: 860px) calc(100vw - 40px), calc(${f.span} / 12 * min(100vw, 1680px))`}
                    style={{ objectPosition: f.pos ?? '50% 50%' }}
                    eager={f.span === 12}
                  />
                  <span className="fl-play" aria-hidden="true">
                    {f.yt ? <PlayIcon /> : <ExpandIcon />}
                    {action}
                  </span>
                </span>

                <span className="fl-copy" id={`fl-${f.id}-copy`}>
                  <span className="fl-name">{f.title}</span>
                  <span className="fl-role">{f.role}</span>
                  <span className="fl-note">{f.note}</span>
                  {f.awards && <span className="fl-awards">{f.awards.join(' · ')}</span>}
                </span>
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

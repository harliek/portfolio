import '../styles/home.css'
import { ConcaveCarousel } from '../components/home/ConcaveCarousel'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Home: the compact header (PageShell) leads straight onto the image-tile
 * carousel (six projects and About Me); the page's H1 is visually hidden,
 * so no title block pushes the tiles down. The compact site footer (the one
 * contact area) follows. About has its own page, reached from its tile and
 * the header.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  return (
    <div className="home">
      <h1 className="visually-hidden">{SITE.name}, professional portfolio</h1>
      <section className="home-carousel" aria-label="Projects and About">
        <ConcaveCarousel />
      </section>
    </div>
  )
}

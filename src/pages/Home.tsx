import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * The homepage, after Harlie's original (brief v14): the first view is the
 * original background film (StageBackground) and the title (Harlie Katz,
 * PORTFOLIO, the two roles), with only the tops of the nearest project
 * objects at its lower edge; the slowly rotating project carousel stands
 * just below it, over the same film.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)

  return (
    <div className="home">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro__block">
          <h1 className="home-intro__title" id="home-title">
            <span className="home-intro__name">{SITE.name}</span> <span className="home-intro__word">Portfolio</span>
          </h1>
          <p className="home-intro__roles">
            <span>AI Implementation &amp; Strategy</span> <span>Product Engineering &amp; Development</span>
          </p>
        </div>
      </section>
      <DepthGallery />
    </div>
  )
}

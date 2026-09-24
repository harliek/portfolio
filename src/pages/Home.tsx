import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * The homepage: the editorial opening (Harlie Katz, PORTFOLIO, the two roles)
 * and, low in the first view, the slowly rotating project carousel, both over
 * the original background film (StageBackground).
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

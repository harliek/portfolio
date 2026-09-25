import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * The homepage (brief v15): one composition in the first view, over the
 * room (StageBackground, a dark architectural corridor). The title above
 * (Harlie Katz, PORTFOLIO in the editorial serif, the two roles), set like
 * the Creative Art page's; beneath it the slowly rotating project
 * carousel, its objects standing on the room's floor with their captions
 * and controls above the window's lower edge.
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

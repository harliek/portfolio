import '../styles/home.css'
import { HomeCarousel } from '../components/home/HomeCarousel'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Home: the identity block (the page's H1, upper left: the name with a
 * crisp pale core and a soft lavender glow, "Professional portfolio" and
 * the positioning sentence), then the PNG object carousel below it with its
 * reserved caption region, then the compact site footer. The header shows
 * no brand here, so the name appears once at this size.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  return (
    <div className="home">
      <header className="home-id shell">
        <div className="home-id__block" data-carousel-align="">
          <h1 className="home-id__title">
            <span className="home-id__name">
              {SITE.name}
              <span className="visually-hidden">,</span>
            </span>
            <span className="home-id__role">Professional portfolio</span>
          </h1>
          <p className="home-id__line">I research how people work and build prototypes to improve their tools.</p>
        </div>
      </header>
      <section className="home-carousel" aria-label="Projects and About">
        <HomeCarousel />
      </section>
    </div>
  )
}

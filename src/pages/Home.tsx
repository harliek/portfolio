import '../styles/home.css'
import { ConcaveCarousel } from '../components/home/ConcaveCarousel'
import { SelectedWork } from '../components/home/SelectedWork'
import { goToContact } from '../components/layout/Header'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Home: the introduction, the concave carousel, the Selected work index,
 * and a small contact link. Every project is one click away without waiting
 * for any animation.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  return (
    <div className="home">
      <header className="shell home-intro">
        <h1 className="home-intro__name">{SITE.name}</h1>
        <p className="home-intro__kicker">Portfolio</p>
        <p className="home-intro__lead">Selected work in applied AI, product development, and creative production.</p>
      </header>
      <section className="home-carousel" aria-labelledby="home-carousel-title">
        <h2 id="home-carousel-title" className="visually-hidden">
          Projects
        </h2>
        <ConcaveCarousel />
      </section>
      <SelectedWork />
      <p className="shell home-contact">
        <a href="#contact" className="home-contact__link" onClick={goToContact}>
          Contact Harlie <span aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  )
}

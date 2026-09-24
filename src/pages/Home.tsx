import { useLayoutEffect } from 'react'
import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { MotionToggle } from '../components/layout/MotionToggle'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Home: a fixed scene in the architectural room (the document does not
 * scroll here; the header shows no brand and there is no footer section).
 * Upper left, the identity (the page's H1, "Harlie Katz" with its crisp
 * pale core and soft lavender glow) with one very small descriptor beneath
 * it. Below, the depth gallery of project objects (DepthGallery.tsx), with
 * the previous and next arrows and the quiet Reduce motion setting along
 * the bottom edge.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)

  // The scene fills the viewport: no document scroll while the homepage is shown.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('home-scene')
    return () => root.classList.remove('home-scene')
  }, [])

  return (
    <div className="home">
      <header className="home-id shell">
        <div className="home-id__block">
          <h1 className="home-id__title">
            <span className="home-id__name">{SITE.name}</span>
          </h1>
          <p className="home-id__desc">AI product, strategy &amp; operations</p>
        </div>
      </header>
      <DepthGallery>
        <MotionToggle className="home-motion" />
      </DepthGallery>
    </div>
  )
}

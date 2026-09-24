import { useLayoutEffect } from 'react'
import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/*
 * The heavy, rounded display face of the "Portfolio" title (Fraunces, SOFT
 * axis; OFL 1.1; its @font-face is in home.css). Its file starts loading as
 * soon as this module runs, before the first render uses it: the same
 * request the title's text would make, only earlier (a <link rel=preload>
 * issued during that render would arrive too late and fetch it twice).
 */
if (typeof document !== 'undefined') void document.fonts?.load('880 100px "Fraunces Soft"').catch(() => undefined)

/**
 * Home: a fixed scene in the architectural room (the document does not
 * scroll here; the header shows no brand and there is no footer section).
 *
 * Upper left, the title composition (the page's H1), holding about the left
 * quarter of a desktop window: "Harlie Katz" in small type, then the
 * dominant "Portfolio" split into "Port" and "folio" (Fraunces Soft, pale
 * lavender with a violet edge and a pink-violet glow), then the supporting
 * line "AI product, strategy & operations". The H1 reads "Harlie Katz
 * Portfolio": the split word is hidden from assistive technology and
 * "Portfolio" is given once, as one word.
 *
 * Beside and below it, the depth gallery of project objects
 * (DepthGallery.tsx) with the previous and next arrows along the bottom edge.
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
      <header className="home-id">
        <div className="home-id__block">
          <h1 className="home-id__title">
            <span className="home-id__name">{SITE.name}</span> <span className="visually-hidden">Portfolio</span>
            <span className="home-id__word" aria-hidden="true">
              <span className="home-id__port">Port</span>
              <span className="home-id__folio">folio</span>
            </span>
          </h1>
          <p className="home-id__desc">AI product, strategy &amp; operations</p>
        </div>
      </header>
      <DepthGallery />
    </div>
  )
}

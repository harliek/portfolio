import { useLayoutEffect, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/home.css'
import { DepthGallery } from '../components/home/DepthGallery'
import { ResponsiveImage } from '../components/media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../components/transition/projectTransition'
import { PORTRAIT_ITEM } from '../content/carousel'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/** The portrait's rendered width at each breakpoint (home.css .home-portrait), for its `sizes`. */
const PORTRAIT_SIZES = '(max-width: 599.98px) 100px, (max-width: 999.98px) 140px, 200px'

/**
 * Home: a fixed scene in the architectural room (the document does not
 * scroll here; the header shows no brand and there is no footer section).
 *
 * Upper left, the identity block (the page's H1), quiet so the projects
 * lead: "Harlie Katz" in small light type, "PORTFOLIO" on one line in the
 * site's Inter at a light weight with a little tracking (a gallery title,
 * not a logo), then "AI product, strategy & operations", smaller and
 * dimmer. The H1 reads "Harlie Katz Portfolio".
 *
 * Below it, at the left edge, the portrait: a small personal anchor of the
 * identity (not a gallery object), a link to /about ("About Harlie Katz"),
 * with a restrained lavender light. Opening it moves the same PNG into the
 * About page's portrait (the shared-element route transition).
 *
 * The depth gallery of the six projects (DepthGallery.tsx) fills the room,
 * with its two small chevrons along the bottom edge.
 */
export function Home() {
  usePageMeta(undefined, SITE.description)
  const navigate = useNavigate()

  // The scene fills the viewport: no document scroll while the homepage is shown.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('home-scene')
    return () => root.classList.remove('home-scene')
  }, [])

  const openAbout = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    openProject({ path: PORTRAIT_ITEM.path, source: e.currentTarget, navigate })
  }

  return (
    <div className="home">
      <header className="home-id">
        <div className="home-id__block">
          <h1 className="home-id__title">
            <span className="home-id__name">{SITE.name}</span> <span className="home-id__word">Portfolio</span>
          </h1>
          <p className="home-id__desc">AI product, strategy &amp; operations</p>
        </div>
        <a
          href={PORTRAIT_ITEM.path}
          className="home-portrait"
          aria-label={PORTRAIT_ITEM.label}
          draggable={false}
          onClick={openAbout}
          onPointerEnter={() => warmProject(PORTRAIT_ITEM.path)}
          onFocus={() => warmProject(PORTRAIT_ITEM.path)}
        >
          <span className="home-portrait__art" data-cover-source={PORTRAIT_ITEM.id}>
            <ResponsiveImage image={PORTRAIT_ITEM.image} sizes={PORTRAIT_SIZES} decorative fit="contain" priority />
          </span>
        </a>
      </header>
      <DepthGallery />
    </div>
  )
}

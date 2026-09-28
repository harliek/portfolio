import { AboutContent } from '../components/about/AboutContent'
import { ABOUT } from '../content/pages/about'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * /about: the dedicated About page, opened from the carousel's About Me object and the header's About link.
 *
 * It no longer sets About's lavender accent (--accent): the page's links, focus edges and the "Watch on YouTube"
 * hover use the site's statement colour, the deployed site's rose #e66d71 (tokens.css; Harlie's request of 2026-09-28,
 * after a blue violet pass). The pointer's light and the Nebula ground behind the page stay blue violet.
 */
export default function About() {
  usePageMeta('About', ABOUT.description)
  return (
    <article className="page-about">
      <AboutContent />
    </article>
  )
}

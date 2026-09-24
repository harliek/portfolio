import { AboutContent } from '../components/about/AboutContent'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * /about: the dedicated About page (reached from the carousel's About Me
 * tile and the header): biography, résumé, experience, education, the art
 * portfolio and the featured film, with the greeting as the page's H1.
 */
export default function About() {
  usePageMeta('About', 'About Harlie Katz, with background, experience, education, an art portfolio, and a short film.')
  return (
    <article className="page-about">
      <AboutContent headingLevel={1} />
    </article>
  )
}

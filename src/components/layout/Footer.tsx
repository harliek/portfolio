import { useLocation } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { MotionToggle } from './MotionToggle'

/**
 * The compact footer at the end of every interior professional page: the
 * copyright line and the quiet, persistent "Reduce motion" setting. No
 * contact block and no résumé link: email and LinkedIn live quietly at the
 * end of About. On a case study it carries the project's accent.
 *
 * The homepage is a fixed scene without a footer section; it shows the
 * same Reduce motion setting inside the scene (Home.tsx).
 */
export function Footer() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  const project = projectForPath(pathname)
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" style={project ? accentVars(project.accent) : undefined}>
      <div className="shell">
        <div className="site-footer__inner">
          <p className="site-footer__copy tabular">
            © {year} {SITE.name}
          </p>
          <MotionToggle />
        </div>
      </div>
    </footer>
  )
}

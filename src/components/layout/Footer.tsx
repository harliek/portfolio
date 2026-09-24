import { useLocation } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'

/**
 * The compact footer at the end of every interior professional page: the
 * copyright line only. No contact block and no résumé link (email and
 * LinkedIn live quietly at the end of About), and no motion setting (the
 * site follows the operating system's reduced-motion preference). On a
 * case study it carries the project's accent.
 *
 * The homepage is a fixed scene without a footer.
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
        </div>
      </div>
    </footer>
  )
}

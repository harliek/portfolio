import { useLocation } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { projectForPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { useMotionPreference } from '../../hooks/useMotionPreference'

/**
 * The compact footer at the end of every professional page: the copyright
 * line and the quiet, persistent "Reduce motion" setting (a labelled switch
 * that stops the carousel, the background video, the pointer trail and
 * transitions; its default follows the operating system setting). No
 * contact block and no résumé link: email and LinkedIn live quietly at the
 * end of About. On a case study it carries the project's accent.
 */
export function Footer() {
  const { pathname } = useLocation()
  const { reduced, setReduced } = useMotionPreference()
  const project = projectForPath(pathname)
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" style={project ? accentVars(project.accent) : undefined}>
      <div className="shell">
        <div className="site-footer__inner">
          <p className="site-footer__copy tabular">
            © {year} {SITE.name}
          </p>
          <button type="button" className="motion-toggle" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
            <span className="motion-toggle__track" aria-hidden="true">
              <span className="motion-toggle__knob" />
            </span>
            Reduce motion
          </button>
        </div>
      </div>
    </footer>
  )
}

import type { StageRoute } from '../../config/stage'

/**
 * The persistent ground behind every professional page: a quiet near-black
 * (stage.css), mounted once in PageShell. Since brief v16 the homepage owns
 * its film (src/components/home/HomeFilm.tsx, with the pointer refraction),
 * so nothing here plays video; the architectural room of brief v15 is no
 * longer rendered (its files stay in public/media for now).
 */
export function StageBackground({ route }: { route: StageRoute }) {
  return <div className="stage-bg" data-route={route} aria-hidden="true" />
}

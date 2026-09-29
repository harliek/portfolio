/**
 * The persistent ground behind every professional page: a quiet near-black
 * (stage.css), mounted once in PageShell. Since brief v16 the homepage owns
 * its film (src/components/home/HomeFilm.tsx, with the pointer refraction),
 * so nothing here plays video; the architectural room of brief v15 is no
 * longer rendered (its files were removed on 2026-09-29 with Harlie's
 * approval; its entries are in archive/media-registry-unplaced.ts).
 */
export function StageBackground() {
  return <div className="stage-bg" aria-hidden="true" />
}

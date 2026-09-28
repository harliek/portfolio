import { Fragment } from 'react'

/**
 * A metadata line in the form "kind · context" (the homepage tiles' captions, field.ts, and the small-screen menu's
 * project lines, projects.ts `category`; Harlie's brief, 2026-09-28: short metadata such as "Market entry ·
 * PlanetArt"). Each part is kept whole (components.css .meta-part), so a line too long for its column wraps at the
 * dot, the dot staying with the first part, and never inside "Independent prototype". A line without a dot is set as
 * it is.
 */
export function MetaLine({ text }: { text: string }) {
  const parts = text.split(' · ')
  if (parts.length < 2) return text
  return parts.map((part, i) => (
    <Fragment key={part}>
      {i > 0 && ' '}
      <span className="meta-part">{i < parts.length - 1 ? `${part} ·` : part}</span>
    </Fragment>
  ))
}

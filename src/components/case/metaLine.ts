/**
 * A case-study metadata line ("Role · Organization", "Dates · Status") split
 * into the segments it is rendered as (`.cs-meta__seg`, inline-block in
 * case.css), so a narrow screen breaks the line at a middle dot rather than in
 * the middle of a phrase; a segment longer than the line still wraps inside
 * itself. Every segment but the last ends in its dot after a no-break space,
 * so the dot stays at the end of a wrapped line and no line starts with "·".
 */
export const metaSegments = (line: string): string[] => {
  const parts = line.split(' · ')
  return parts.map((part, i) => (i < parts.length - 1 ? `${part}\u00a0·` : part))
}

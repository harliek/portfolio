/**
 * A case-study metadata line ("Role · Organization", "Dates · Status") as
 * rendered: a no-break space before each middle dot keeps the dot at the end
 * of a wrapped line, so a narrow screen never starts a line with "·".
 */
export const metaLine = (line: string) => line.replace(/ · /g, '\u00a0· ')

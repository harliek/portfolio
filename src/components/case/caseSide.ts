import { createContext, useContext } from 'react'

/**
 * Which side of a told case study the stage stands on (Harlie's request, 2026-09-30: "sometimes the text should be on
 * the right and video/image on the left do every other one"). The told pages alternate by their project's `order`
 * (src/content/projects.ts), so they keep alternating if the order changes: an odd order puts the stage on the left and
 * the words on the right (today CafePress UK, 3, and Jumpstart Finance, 5); an even one keeps the words on the left (the
 * Spreadsheet Assistant, 2, the Merchandising Dashboard, 4, the AI Leasing Agent, 6). Creative Production (1) has its
 * own layout and does not read it.
 *
 * CasePage provides it, CaseStory marks its composition with it (data-flip on .cs), and case-v16.css mirrors the two
 * columns wherever the words and the stage stand side by side (at least 900px wide, and phones on their side); phones
 * and tablets held upright keep their one column.
 */
export const StageOnLeftContext = createContext(false)

export const stageOnLeft = (order: number) => order % 2 === 1

export const useStageOnLeft = () => useContext(StageOnLeftContext)

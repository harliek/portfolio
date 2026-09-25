import { createContext, useContext } from 'react'

/**
 * PageShell's fixed slot for the homepage film (outside the route wrapper,
 * whose reveal animation would capture position: fixed). Null until mounted.
 */
export const FilmSlotContext = createContext<HTMLElement | null>(null)

export const useFilmSlot = () => useContext(FilmSlotContext)

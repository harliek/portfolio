import type { FocusEvent, MouseEvent, PointerEvent } from 'react'
import { Link, useNavigate, type LinkProps } from 'react-router-dom'
import { changePage, type Direction } from './pageChange'
import { isPlainClick, warmProject } from './warm'

/**
 * A link to another page in the site that changes the page with the page change (pageChange.ts): the page comes apart
 * and the next one builds itself (Harlie's request: the same transition for every page change). Hover and focus get
 * the destination ready; modified and middle clicks stay native (a new tab or window).
 */
export function PageLink({ to, direction, onClick, onPointerEnter, onFocus, ...props }: Omit<LinkProps, 'to'> & { to: string; direction?: Direction }) {
  const navigate = useNavigate()
  return (
    <Link
      to={to}
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e)
        if (!isPlainClick(e)) return
        e.preventDefault()
        changePage({ to, navigate, direction })
      }}
      onPointerEnter={(e: PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(e)
        warmProject(to)
      }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(e)
        warmProject(to)
      }}
    />
  )
}

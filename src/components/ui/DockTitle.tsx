import { useRef, type HTMLAttributes } from 'react'
import { useDockTitle } from './dockLetters'

/**
 * A heading whose letters magnify under the pointer like Aceternity's
 * Floating Dock (Harlie's request: "use the hover aspect of this effect on
 * title letters"; dockLetters.ts). It renders its text as plain text, so at
 * rest it reads, wraps, kerns and selects exactly as a bare heading would.
 */
export function DockTitle({ as: Tag = 'h1', text, ...props }: { as?: 'h1' | 'h2'; text: string } & HTMLAttributes<HTMLHeadingElement>) {
  const ref = useRef<HTMLHeadingElement>(null)
  useDockTitle(ref)
  return (
    <Tag ref={ref} {...props}>
      <span className="dock-title__text">{text}</span>
    </Tag>
  )
}

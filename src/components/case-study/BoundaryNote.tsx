import type { ReactNode } from 'react'

/**
 * A visible ownership or boundary statement. Never collapsed or hidden.
 * `tone="strong"` is used directly above media whose status must be clear.
 */
export function BoundaryNote({ children, tone = 'default', label }: { children: ReactNode; tone?: 'default' | 'strong'; label?: string }) {
  return (
    <p className={`boundary-note boundary-note--${tone}`}>
      {label && <span className="boundary-note__label">{label}</span>}
      <span>{children}</span>
    </p>
  )
}

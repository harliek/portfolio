import { useState } from 'react'
import { getSlot, slotsDebugEnabled, type SlotId } from '../../content/slots'
import { Figure } from './Figure'

interface DiagramSlotProps {
  id: SlotId
  /** Literal `sizes` for the rendered width. */
  sizes: string
  className?: string
}

/**
 * Harlie's own diagram, when she supplies one (registry: src/content/slots.ts).
 * Empty → renders nothing at all. Only with the explicit debug flag
 * (`?debug=slots` or localStorage `hk-debug-slots` = '1') does an empty slot
 * show a thin solid outline with its id, so placement can be checked.
 */
export function DiagramSlot({ id, sizes, className }: DiagramSlotProps) {
  const slot = getSlot(id)
  const [debug] = useState(slotsDebugEnabled)
  if (slot.image) return <Figure image={slot.image} sizes={sizes} zoom className={['diagram-slot', className].filter(Boolean).join(' ')} />
  if (!debug) return null
  return (
    <div className="slot-debug" data-slot={id} aria-hidden="true">
      <span className="slot-debug__id">{id}</span>
      <span className="slot-debug__brief">{slot.brief}</span>
    </div>
  )
}

import { useMotionPreference } from '../../hooks/useMotionPreference'

/**
 * The quiet, persistent "Reduce motion" setting: a labelled switch that
 * stops the homepage gallery's drift, the background video, the pointer
 * trail and transitions (its default follows the operating system
 * setting). It sits in the footer of every interior page and inside the
 * homepage's fixed scene (which has no footer).
 */
export function MotionToggle({ className }: { className?: string }) {
  const { reduced, setReduced } = useMotionPreference()
  return (
    <button
      type="button"
      className={['motion-toggle', className].filter(Boolean).join(' ')}
      aria-pressed={reduced}
      onClick={() => setReduced(!reduced)}
    >
      <span className="motion-toggle__track" aria-hidden="true">
        <span className="motion-toggle__knob" />
      </span>
      Reduce motion
    </button>
  )
}

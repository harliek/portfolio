import type { CSSProperties } from 'react'

/**
 * A line that types itself (after Aceternity's TypewriterEffectSmooth,
 * @aceternity/typewriter-effect-demo-1, adapted without Tailwind or Motion):
 * after `delay` seconds the text is revealed from the left at a steady pace
 * over `duration` seconds, with a blinking bar riding the edge. The bar
 * leaves at `hideAt` seconds (when the next line starts); without it, it
 * stays and keeps blinking, as in the demo. With `letters`, each letter is
 * its own element (for the hover in home.css); screen readers and copying
 * still get the word once. Reduced motion: the text at once, no bar.
 */
export function TypeLine({ text, delay, duration, hideAt, letters }: { text: string; delay: number; duration: number; hideAt?: number; letters?: boolean }) {
  const style = { '--type-delay': `${delay}s`, '--type-dur': `${duration}s`, '--type-hide': hideAt === undefined ? undefined : `${hideAt}s` } as CSSProperties
  return (
    <span className="type-line" style={style} data-stays={hideAt === undefined || undefined}>
      {letters ? (
        <>
          <span className="visually-hidden">{text}</span>
          <span className="type-line__text" aria-hidden="true">
            {[...text].map((ch, i) => (
              <span key={i} className="type-line__letter">
                {ch}
              </span>
            ))}
          </span>
        </>
      ) : (
        <span className="type-line__text">{text}</span>
      )}
      <span className="type-line__cursor" aria-hidden="true" />
    </span>
  )
}

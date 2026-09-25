import { useCallback, useEffect, useRef, useState } from 'react'

export type ActionState = 'idle' | 'loading' | 'done'

/**
 * The stateful button's two icons (after Aceternity's stateful button,
 * @aceternity/stateful-button, adapted without Motion; styles in
 * components.css): a spinning loader that grows in before the label while
 * the action runs, then a check that holds for two seconds. Decorative.
 */
export function StatefulIcons() {
  return (
    <>
      <svg className="stateful__loader" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
      <svg className="stateful__check" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M9 12l2 2l4 -4" />
      </svg>
    </>
  )
}

/**
 * Runs an action through the stateful button's states: loading while it
 * runs (at least `minMs`, so the loader is seen), done for two seconds, then
 * idle again.
 */
export function useActionState(minMs = 450) {
  const [state, setState] = useState<ActionState>('idle')
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const run = useCallback(
    async (action?: () => unknown) => {
      window.clearTimeout(timer.current)
      setState('loading')
      await Promise.all([Promise.resolve(action?.()), new Promise((r) => window.setTimeout(r, minMs))])
      setState('done')
      timer.current = window.setTimeout(() => setState('idle'), 2000)
    },
    [minMs],
  )
  return [state, run, setState] as const
}

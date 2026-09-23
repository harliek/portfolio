import { usePageMeta } from '../hooks/usePageMeta'

// Phase 1 shell. Completed in Phase 2.
export default function About() {
  usePageMeta('About')
  return (
    <div className="shell">
      <h1 className="t-display" tabIndex={-1}>
        About
      </h1>
    </div>
  )
}

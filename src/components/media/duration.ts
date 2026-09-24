/** "1 min 40 s": durations are written out in visible text (no colon in visitor copy). */
export const shortDuration = (seconds: number) => {
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return [m ? `${m} min` : '', r ? `${r} s` : ''].filter(Boolean).join(' ')
}

/** "1 minute 40 seconds", for accessible names. */
export const spokenDuration = (seconds: number) => {
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  const parts = []
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  if (r) parts.push(`${r} second${r === 1 ? '' : 's'}`)
  return parts.join(' ')
}

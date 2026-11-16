import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { clamp01 } from '@/shared/lib/math'
import { Rise } from '@/shared/ui/Rise'
import { TitleBar } from '@/shared/ui/Window'

/** How a project goes, as four commands a terminal runs. Edit the wording here. */
const STEPS = [
  ['idea', 'You tell us what you need, in your own words.'],
  ['design', 'We show you the screens before any code is written.'],
  ['build', 'We build it and share a working link as it grows.'],
  ['launch', 'We put it live and stay for fixes.'],
] as const
const STEP_MS = 900

/** A terminal that runs the four steps, one after another, the first time it scrolls into view. */
export function Steps() {
  const still = useReducedMotion()
  const [started, setStarted] = useState(false)
  // how many steps have run, with a fraction for the one in progress
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (!started || still) return
    const t0 = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      const next = Math.min(STEPS.length, (now - t0) / STEP_MS)
      setAt(next)
      if (next < STEPS.length) raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [started, still])
  const progress = still ? STEPS.length : at
  return (
    <Rise onSeen={() => setStarted(true)}>
      <div className="win term">
        <TitleBar title="duoforge · build" />
        <pre aria-label={STEPS.map(([name, text]) => `${name}: ${text}`).join(' ')}>
          <span className="p">$</span> <span className="w">duoforge start your-project</span>
          {'\n'}
          {STEPS.map(([name, text], i) => {
            if (progress < i) return null
            const part = clamp01((progress - i) * 1.4)
            const done = part >= 1
            return (
              <span key={name}>
                <span className={done ? 'g' : 'p'}>{done ? '✓' : '…'}</span>{' '}
                <span className="a">{name.padEnd(7)}</span>{' '}
                <span className={done ? undefined : 'p'}>
                  {text.slice(0, Math.round(text.length * part))}
                </span>
                {'\n'}
              </span>
            )
          })}
          {progress >= STEPS.length && (
            <>
              <span className="g">done.</span> <span className="p">Your project is live.</span>
            </>
          )}
        </pre>
      </div>
    </Rise>
  )
}

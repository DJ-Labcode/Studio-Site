import { useEffect, useRef, useState } from 'react'
import { preloadFrames } from '@/shared/lib/frames'
import { MARK } from '@/shared/brand/mark'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { FIRST_FRAMES } from './footage'

const CELLS = [
  ...MARK.d.map((c) => ({ c, fill: 'fill-ink' })),
  ...MARK.f.map((c) => ({ c, fill: 'fill-ember' })),
  ...MARK.spark.map((c) => ({ c, fill: 'fill-spark' })),
]
const MIN_MS = 1800

/**
 * Opening screen: the mark builds block by block while the first frames load.
 * The counter never runs ahead of loading and never faster than the animation.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const loaded = useRef(0)

  useEffect(() => {
    let n = 0
    void preloadFrames(FIRST_FRAMES, () => {
      loaded.current = ++n / FIRST_FRAMES.length
    })
    document.documentElement.classList.add('overflow-hidden')
    const start = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      const time = Math.min((now - start) / MIN_MS, 1)
      setShown((s) => Math.max(s, Math.min(time, loaded.current)))
      raf = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [])

  useEffect(() => {
    if (shown < 1 || leaving) return
    setLeaving(true)
    const t = window.setTimeout(onDone, 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when the counter reaches 100%
  }, [shown])

  const pct = Math.round(shown * 100)
  const visible = Math.round(shown * CELLS.length)
  return (
    <div
      role="status"
      aria-label={`Loading ${pct}%`}
      className={cn(
        'bg-paper fixed inset-0 z-[200] grid place-content-center justify-items-center gap-4 transition duration-700 ease-in-out',
        leaving && 'pointer-events-none scale-105 opacity-0',
      )}
    >
      <svg
        viewBox="0 0 18 16"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="w-[min(220px,50vw)] overflow-visible"
      >
        {CELLS.map(({ c, fill }, i) => (
          <rect
            key={i}
            x={c[0]}
            y={c[1]}
            width="0.92"
            height="0.92"
            className={cn(
              fill,
              'origin-center transition duration-300 [transform-box:fill-box]',
              i < visible ? 'opacity-100' : 'scale-50 opacity-0',
            )}
          />
        ))}
      </svg>
      <p className="font-display text-4xl font-bold tracking-tight tabular-nums">
        {String(pct).padStart(3, '0')}
        <small className="text-muted text-base">%</small>
      </p>
      <p className="text-muted font-mono text-[0.7rem] tracking-[0.2em] uppercase">
        Forging {brand.name}
      </p>
    </div>
  )
}

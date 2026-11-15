import { useEffect, useRef, useState } from 'react'
import { preload } from './ScrollFrames'

const blk = (c0: number, c1: number, r0: number, r1: number) => { const o: [number, number][] = []; for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) o.push([c, r]); return o }
const CELLS: { c: number; r: number; k: 'd' | 'f' | 's' }[] = [
  ...[...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)].map(([c, r]) => ({ c, r, k: 'd' as const })),
  ...[...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)].map(([c, r]) => ({ c, r, k: 'f' as const })),
  ...[...blk(16, 17, 0, 1), [15, 5] as [number, number]].map(([c, r]) => ({ c, r, k: 's' as const })),
]

/** Opening: the mark builds block by block while the first scroll frames load; 0% → 100%, then it lifts away. */
export default function Splash({ urls, onDone }: { urls: string[]; onDone: () => void }) {
  const [loaded, setLoaded] = useState(0)
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    let n = 0
    preload(urls, () => setLoaded(++n / urls.length))
    document.documentElement.classList.add('no-scroll')
    return () => document.documentElement.classList.remove('no-scroll')
  }, [urls])
  // the counter never runs faster than the animation (min ~1.8 s), and never ahead of loading
  const loadedRef = useRef(0)
  loadedRef.current = loaded
  useEffect(() => {
    const t0 = performance.now(); let raf = 0
    const tick = (now: number) => {
      const time = Math.min((now - t0) / 1800, 1)
      setShown((s) => Math.max(s, Math.min(time, loadedRef.current)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  useEffect(() => {
    if (shown >= 1 && !leaving) {
      setLeaving(true)
      setTimeout(() => { document.documentElement.classList.remove('no-scroll'); onDone() }, 900)
    }
  }, [shown, leaving, onDone])
  const pct = Math.round(shown * 100)
  const visible = Math.round(shown * CELLS.length)
  return (
    <div className={`splash ${leaving ? 'is-leaving' : ''}`} role="status" aria-label={`Loading ${pct}%`}>
      <svg viewBox="0 0 18 16" className="splash-mark" shapeRendering="crispEdges" aria-hidden="true">
        {CELLS.map((v, i) => (
          <rect key={i} x={v.c} y={v.r} width="0.92" height="0.92" className={`sm-${v.k} ${i < visible ? 'on' : ''}`} />
        ))}
      </svg>
      <p className="splash-pct">{String(pct).padStart(3, '0')}<small>%</small></p>
      <p className="splash-k mono">Forging DuoForge</p>
    </div>
  )
}

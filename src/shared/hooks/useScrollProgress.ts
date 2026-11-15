import { useEffect, useState, type RefObject } from 'react'
import { clamp01 } from '@/shared/lib/math'

/**
 * How far the viewport has scrolled through a tall section, 0..1.
 * 0 when the section's top reaches the top of the screen, 1 when its bottom reaches the bottom.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      setP(travel > 0 ? Math.round(clamp01(-r.top / travel) * 1000) / 1000 : 0)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [ref])
  return p
}

import { useEffect } from 'react'
import Lenis from 'lenis'
import { setScrollDriver } from '@/shared/lib/scrollTo'

/** Smooth, eased scrolling for the whole site. Skipped when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09, anchors: true })
    setScrollDriver({
      to: (target) => lenis.scrollTo(target),
      lock: (locked) => (locked ? lenis.stop() : lenis.start()),
    })
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      setScrollDriver(null)
      lenis.destroy()
    }
  }, [])
  return null
}

import { useEffect } from 'react'
import Lenis from 'lenis'
import { setScroller } from '@/shared/lib/scrollTo'

/** Smooth, eased scrolling for the whole site. Skipped when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09, anchors: true })
    setScroller((el) => lenis.scrollTo(el))
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      setScroller(null)
      lenis.destroy()
    }
  }, [])
  return null
}

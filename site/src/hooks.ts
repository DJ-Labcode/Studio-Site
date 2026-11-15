import { useEffect, useRef, useState } from 'react'

export const STAGES = [
  'Raw pixels', 'Two developers', 'One forge', 'Sparking the idea', 'Drawing the screens',
  'Writing the code', 'Shipping products', 'Launching', 'Forged',
]

/**
 * Turns the scroll position into a continuous stage (0..8).
 * Every element with data-stage="n" is an anchor: when its centre crosses the
 * middle of the screen the forge is exactly at stage n, and in between it blends.
 * Elements with data-dim make the 3D scene fade back so content stays readable.
 */
export function useForgeProgress() {
  const stage = useRef(0)
  const [hud, setHud] = useState({ pct: 0, idx: 0, dim: false })

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const mid = window.innerHeight / 2
      const anchors = [...document.querySelectorAll<HTMLElement>('[data-stage]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { s: Number(el.dataset.stage), y: r.top + r.height / 2 }
      })
      anchors.sort((a, b) => a.s - b.s)
      let s = anchors[0]?.s ?? 0
      if (anchors.length && mid >= anchors[anchors.length - 1].y) s = anchors[anchors.length - 1].s
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1]
        if (mid >= a.y && mid < b.y) s = a.s + ((mid - a.y) / (b.y - a.y)) * (b.s - a.s)
      }
      // the very top of the page is 0%, even though the first anchor's centre is lower
      if (window.scrollY < 4) s = 0
      stage.current = s
      const dim = [...document.querySelectorAll<HTMLElement>('[data-dim]')].some((el) => {
        const r = el.getBoundingClientRect()
        return r.top < mid && r.bottom > mid
      })
      const pct = Math.round((s / (STAGES.length - 1)) * 100)
      setHud((h) => (h.pct === pct && h.dim === dim ? h : { pct, idx: Math.round(s), dim }))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return { stage, hud }
}

/** true once the element has scrolled into view (stays true) */
export function useInView<T extends HTMLElement>(margin = '-15% 0px') {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, seen] as const
}

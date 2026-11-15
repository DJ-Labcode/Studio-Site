import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Scroll-scrubbed image sequence: a sticky full-screen canvas whose frame follows the scroll position.
 * frames load progressively; the nearest loaded frame is drawn so it never shows a blank.
 */
export function frameUrls(name: string, count: number) {
  return Array.from({ length: count }, (_, i) => `frames/${name}/${String(i + 1).padStart(4, '0')}.webp`)
}

const cache = new Map<string, HTMLImageElement>()
export function preload(urls: string[], onEach?: () => void) {
  return Promise.all(urls.map((u) => new Promise<void>((res) => {
    if (cache.has(u) && cache.get(u)!.complete) { onEach?.(); return res() }
    const im = new Image(); im.decoding = 'async'; im.src = u; cache.set(u, im)
    im.onload = im.onerror = () => { onEach?.(); res() }
  })))
}

export default function ScrollFrames({ urls, vh, id, children }: { urls: string[]; vh: number; id?: string; children?: (p: number) => ReactNode }) {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    preload(urls)
    let raf = 0, last = -1
    const draw = () => {
      raf = 0
      const el = section.current, cv = canvas.current
      if (!el || !cv) return
      const r = el.getBoundingClientRect()
      const prog = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1)
      setP(Math.round(prog * 1000) / 1000)
      const dpr = Math.min(devicePixelRatio || 1, 1.5)
      const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr)
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; last = -1 }
      let i = Math.round(prog * (urls.length - 1))
      // nearest frame that has loaded
      let im: HTMLImageElement | undefined
      for (let d = 0; d < urls.length; d++) {
        const a = cache.get(urls[i - d]), b = cache.get(urls[i + d])
        if (a?.complete && a.naturalWidth) { im = a; i -= d; break }
        if (b?.complete && b.naturalWidth) { im = b; i += d; break }
      }
      if (!im || i === last) return
      last = i
      const g = cv.getContext('2d')!
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight)
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s
      g.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    const tick = setInterval(on, 250) // repaint as frames finish loading
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); clearInterval(tick); cancelAnimationFrame(raf) }
  }, [urls])
  return (
    <section className="seq" ref={section} id={id} style={{ height: `${vh}vh` }}>
      <div className="seq-stage">
        <canvas ref={canvas} className="seq-canvas" aria-hidden="true" />
        {children?.(p)}
      </div>
    </section>
  )
}

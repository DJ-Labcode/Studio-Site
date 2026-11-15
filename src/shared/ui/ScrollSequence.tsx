import { useEffect, useRef, type ReactNode } from 'react'
import { useScrollProgress } from '@/shared/hooks/useScrollProgress'
import { frameAt } from '@/shared/lib/math'
import { loadedFrame, nearestLoaded, preloadFrames } from '@/shared/lib/frames'
import { cn } from '@/shared/lib/cn'

type Props = {
  /** frame image URLs in order; pass an empty list for a scroll-driven stage with no footage */
  urls: readonly string[]
  /** how tall the scroll track is, in viewport heights: more = slower playback */
  heightVh: number
  id?: string
  className?: string
  /** overlays, given the scroll progress 0..1 */
  children?: (progress: number) => ReactNode
}

/**
 * A pinned full-screen stage whose footage is scrubbed by scrolling:
 * scroll down and the frames play forward, scroll up and they rewind.
 */
export function ScrollSequence({ urls, heightVh, id, className, children }: Props) {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawn = useRef(-1)
  const progress = useScrollProgress(section)

  useEffect(() => {
    void preloadFrames(urls)
  }, [urls])

  useEffect(() => {
    const draw = () => {
      const cv = canvas.current
      if (!cv || urls.length === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.round(window.innerWidth * dpr)
      const h = Math.round(window.innerHeight * dpr)
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
        drawn.current = -1
      }
      const i = nearestLoaded(urls, frameAt(progress, urls.length))
      const im = i === undefined ? undefined : loadedFrame(urls[i])
      if (i === undefined || !im || i === drawn.current) return
      drawn.current = i
      // object-fit: cover
      const scale = Math.max(w / im.naturalWidth, h / im.naturalHeight)
      const dw = im.naturalWidth * scale
      const dh = im.naturalHeight * scale
      cv.getContext('2d')?.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }
    draw()
    // repaint as frames finish loading and when the window changes size
    const tick = window.setInterval(draw, 250)
    window.addEventListener('resize', draw)
    return () => {
      window.clearInterval(tick)
      window.removeEventListener('resize', draw)
    }
  }, [urls, progress])

  return (
    <section ref={section} id={id} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className={cn('sticky top-0 h-svh overflow-hidden', className)}>
        {urls.length > 0 && (
          <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />
        )}
        {children?.(progress)}
      </div>
    </section>
  )
}

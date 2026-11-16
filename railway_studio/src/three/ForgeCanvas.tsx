import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { cn } from '@/shared/lib/cn'
import { createForge, type ForgeTrain } from './forge/createForge'

type LabelledTrain = ForgeTrain & { label: string; href: string }

/**
 * The live 3D forge, with a label riding on each train that links to that train's section.
 * Loaded lazily, so three.js never delays the text.
 * If the device cannot start WebGL the canvas stays empty and the labels are hidden.
 */
export default function ForgeCanvas({
  trains,
  label,
}: {
  trains: readonly LabelledTrain[]
  label: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const tags = useRef<(HTMLAnchorElement | null)[]>([])
  const still = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let dispose: (() => void) | undefined
    let cancelled = false
    // paint the project names in the brand font, so wait for it (but never long)
    void Promise.race([
      document.fonts.load('700 50px "Space Grotesk"').catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).then(() => {
      if (cancelled) return
      try {
        dispose = createForge(canvas, { trains, still, labels: tags.current })
        tags.current.forEach((tag) => tag?.classList.remove('invisible'))
      } catch {
        // no WebGL: the card keeps its backdrop and the page works without the scene
      }
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [trains, still])
  return (
    <>
      <canvas ref={ref} role="img" aria-label={label} className="absolute inset-0 size-full" />
      {trains.map((train, i) => (
        <a
          key={train.href}
          ref={(el) => {
            tags.current[i] = el
          }}
          href={train.href}
          style={{ background: train.color }}
          className={cn(
            'invisible absolute top-0 left-0 z-10 rounded-full px-[11px] py-[7px] text-xs leading-none font-semibold whitespace-nowrap text-white transition-opacity will-change-transform hover:outline-2 hover:outline-white',
          )}
        >
          {train.label} <span aria-hidden="true">→</span>
        </a>
      ))}
    </>
  )
}

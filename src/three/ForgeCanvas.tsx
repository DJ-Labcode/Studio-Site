import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { createForge, type ForgeTrain } from './forge/createForge'

/**
 * The live 3D forge. Loaded lazily, so three.js never delays the text.
 * If the device cannot start WebGL the canvas simply stays empty.
 */
export default function ForgeCanvas({
  trains,
  label,
}: {
  trains: readonly ForgeTrain[]
  label: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
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
        dispose = createForge(canvas, { trains, still })
      } catch {
        // no WebGL: the card keeps its backdrop and the page works without the scene
      }
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [trains, still])
  return <canvas ref={ref} role="img" aria-label={label} className="absolute inset-0 size-full" />
}

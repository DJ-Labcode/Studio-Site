import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'

/**
 * The one place a WebGL canvas is created. Import this file lazily
 * (`lazy(() => import('@/three/SceneCanvas'))`) so three.js is only downloaded when a scene is shown.
 */
export default function SceneCanvas({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      role="img"
      aria-label={label}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  )
}

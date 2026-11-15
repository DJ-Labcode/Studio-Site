import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// mostly near-black blocks that only catch the eye when they move, plus a few accents
const COLORS = [
  '#1c1c24',
  '#22222c',
  '#1c1c24',
  '#2a2a36',
  '#ff5a1f',
  '#1c1c24',
  '#22222c',
  '#5b6bff',
]
const COUNT = 70

/** deterministic pseudo-random so the field looks the same on every visit */
function seeded(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function Blocks({ still }: { still: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const blocks = useMemo(() => {
    const rnd = seeded(11)
    return Array.from({ length: COUNT }, (_, i) => ({
      x: (rnd() - 0.5) * 16,
      y: (rnd() - 0.5) * 10,
      z: -rnd() * 6,
      size: 0.06 + rnd() * 0.16,
      speed: 0.06 + rnd() * 0.16,
      spin: (rnd() - 0.5) * 0.6,
      phase: rnd() * Math.PI * 2,
      color: new THREE.Color(COLORS[i % COLORS.length]),
    }))
  }, [])

  useFrame(({ clock, pointer }) => {
    const m = mesh.current
    if (!m) return
    const t = still ? 0 : clock.elapsedTime
    // scrolling pushes the whole field upward a little, so the page and the space move together
    const scroll = window.scrollY * 0.0016
    blocks.forEach((b, i) => {
      const y = ((((b.y + t * b.speed + scroll * (1 + b.z * -0.15) + 5) % 10) + 10) % 10) - 5
      dummy.position.set(
        b.x + Math.sin(t * 0.3 + b.phase) * 0.35 + pointer.x * (0.25 + b.z * -0.05),
        y + pointer.y * 0.15,
        b.z,
      )
      dummy.rotation.set(t * b.spin + b.phase, t * b.spin * 0.7, 0)
      dummy.scale.setScalar(b.size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      if (clock.elapsedTime < 0.2) m.setColorAt(i, b.color)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

/**
 * The ambient layer: a slow field of drifting pixel blocks.
 * It keeps moving while the page is still, and scrolling carries it along.
 */
export default function PixelField({ still = false }: { still?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <Blocks still={still} />
    </Canvas>
  )
}

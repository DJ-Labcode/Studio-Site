import { lazy, Suspense, useSyncExternalStore } from 'react'

const PixelField = lazy(() => import('@/three/PixelField'))

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

/** Fixed behind every page. three.js is loaded lazily, so the text never waits for it. */
export function Ambient() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Suspense fallback={null}>
        <PixelField still={reduced} />
      </Suspense>
    </div>
  )
}

import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

/** True when the visitor has asked their device for less motion. */
export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )

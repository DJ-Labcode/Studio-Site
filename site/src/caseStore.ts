import { useCallback, useEffect, useState } from 'react'

/** The open case study lives in the URL hash (#case-hsc-it) so it can be linked to. */
const read = () => (location.hash.startsWith('#case-') ? location.hash.slice(6) : null)
export const openCase = (id: string) => { location.hash = `case-${id}` }
export function useCase() {
  const [id, setId] = useState<string | null>(read)
  useEffect(() => {
    const on = () => setId(read())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const close = useCallback(() => { history.replaceState(null, '', location.pathname + location.search); setId(null) }, [])
  return { id, close }
}

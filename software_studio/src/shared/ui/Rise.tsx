import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Its child rises into place the first time it scrolls into view. `onSeen` fires at that moment. */
export function Rise({
  className,
  onSeen,
  children,
}: {
  className?: string
  onSeen?: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useRef(onSeen)
  useEffect(() => {
    seen.current = onSeen
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.classList.add('in')
        seen.current?.()
        watch.disconnect()
      },
      { threshold: 0.22 },
    )
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  return (
    <div ref={ref} className={cn('rise', className)}>
      {children}
    </div>
  )
}

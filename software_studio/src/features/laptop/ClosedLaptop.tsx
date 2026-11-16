import { useEffect, useRef } from 'react'
import { brand } from '@/shared/brand'

/** The end of the page: a small laptop whose lid closes on the logo when it scrolls into view. */
export function ClosedLaptop() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const watch = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && el.classList.add('shut'),
      { threshold: 0.4 },
    )
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  const [first, second] = brand.nameParts
  return (
    <footer className="wrap end">
      <div className="closed" ref={ref} aria-hidden="true">
        <div className="top">
          <span>
            {first[0]}
            <b>{second[0]}</b>
          </span>
        </div>
        <div className="bot" />
      </div>
      <p>
        {brand.name} · Web &amp; app studio · {brand.location} · © {new Date().getFullYear()}
      </p>
    </footer>
  )
}

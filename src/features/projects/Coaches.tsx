import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * A row of cards coupled like train coaches, slid sideways by drag, swipe or the arrow buttons.
 * The row keeps the page the same length however many coaches it has.
 */
export function Coaches({
  label,
  caption,
  children,
}: {
  label: string
  caption: ReactNode
  children: ReactNode[]
}) {
  const row = useRef<HTMLDivElement>(null)
  const total = children.length
  const [at, setAt] = useState({ index: 0, start: true, end: total <= 1 })

  useEffect(() => {
    const el = row.current
    if (!el) return
    const read = () => {
      const first = el.children[0]
      const step = first
        ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
        : 1
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      setAt({
        index: end ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / step)),
        start: el.scrollLeft < 4,
        end,
      })
    }
    read()
    el.addEventListener('scroll', read, { passive: true })
    const sizes = new ResizeObserver(read)
    sizes.observe(el)
    return () => {
      el.removeEventListener('scroll', read)
      sizes.disconnect()
    }
  }, [total])

  const move = (by: 1 | -1) => {
    const el = row.current
    const first = el?.children[0]
    if (!el || !first) return
    const step =
      first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
    el.scrollBy({ left: by * step, behavior: 'smooth' })
  }
  const arrow =
    'border-ink bg-surface text-ink hover:bg-ink hover:text-paper grid size-11 cursor-pointer place-items-center rounded-full border-[1.5px] text-lg transition disabled:cursor-default disabled:opacity-30 disabled:hover:bg-surface disabled:hover:text-ink'

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-xs font-medium tracking-[0.16em] uppercase">{caption}</p>
        <div className="text-muted flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] uppercase">
          <button
            type="button"
            aria-label="Previous coach"
            disabled={at.start}
            onClick={() => move(-1)}
            className={arrow}
          >
            ←
          </button>
          <span aria-live="polite">
            Coach {at.index + 1} of {total}
          </span>
          <button
            type="button"
            aria-label="Next coach"
            disabled={at.end}
            onClick={() => move(1)}
            className={arrow}
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={row}
        tabIndex={0}
        role="group"
        aria-label={label}
        className={cn(
          'flex snap-x snap-mandatory [scrollbar-width:none] gap-3.5 overflow-x-auto px-0.5 pt-1 pb-5 md:gap-[22px] [&::-webkit-scrollbar]:hidden',
          // each coach, and the coupling to the next one
          '[&>*]:relative [&>*]:flex-[0_0_min(400px,84%)] [&>*]:snap-start',
          '[&>*:not(:last-child)]:after:absolute [&>*:not(:last-child)]:after:top-[17px] [&>*:not(:last-child)]:after:left-full [&>*:not(:last-child)]:after:h-1.5 [&>*:not(:last-child)]:after:w-3.5 [&>*:not(:last-child)]:after:bg-(--coach) md:[&>*:not(:last-child)]:after:w-[22px]',
        )}
      >
        {children}
      </div>
    </div>
  )
}

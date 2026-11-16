import { useEffect, useRef } from 'react'
import { projects } from '@/content/projects'
import { brand } from '@/shared/brand'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { cn } from '@/shared/lib/cn'
import { useVisit } from '@/shared/state/visit'
import { flapFrame } from './flap'

const firstName = (world: string) =>
  brand.founders.find((f) => f.world === world)?.name.split(' ')[0] ?? ''

const ROWS = projects.map((p) => ({
  slug: p.slug,
  app: p.world === 'app',
  cells: [
    p.world === 'app' ? 'App' : 'Website',
    p.name.replace(' platform', ''),
    firstName(p.world),
  ],
}))
const cols =
  'grid grid-cols-[2.2rem_5.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[2.4rem_6rem_minmax(0,1fr)_6rem] sm:gap-4'

/**
 * A station departure board. Every row is a real project and a link to it.
 * The letters flip into place when the intro ends, then one row re-flips every few seconds.
 */
export function DepartureBoard() {
  const board = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const introDone = useVisit((s) => s.introDone)

  useEffect(() => {
    const el = board.current
    if (!el || still || !introDone) return
    const rows = [...el.querySelectorAll('a')].map((a) =>
      [...a.querySelectorAll<HTMLElement>('[data-flap]')].map((cell) => ({
        cell,
        text: cell.dataset.flap ?? '',
      })),
    )
    const running = new Set<number>()
    const flip = (row: (typeof rows)[number], delay: number) => {
      const start = performance.now() + delay
      const step = (now: number) => {
        running.delete(id)
        let settled = true
        for (const { cell, text } of row) {
          const f = flapFrame(text, now - start)
          cell.textContent = f.text
          settled &&= f.settled
        }
        if (!settled) {
          id = requestAnimationFrame(step)
          running.add(id)
        }
      }
      let id = requestAnimationFrame(step)
      running.add(id)
    }
    rows.forEach((row, i) => flip(row, i * 170))
    let turn = 0
    const again = window.setInterval(() => {
      if (!document.hidden) flip(rows[turn++ % rows.length]!, 0)
    }, 4200)
    return () => {
      window.clearInterval(again)
      running.forEach((id) => cancelAnimationFrame(id))
      rows.flat().forEach(({ cell, text }) => (cell.textContent = text))
    }
  }, [still, introDone])

  return (
    <nav
      ref={board}
      aria-label="Departures: our projects"
      className="bg-board text-amber px-3 pt-3 pb-3.5 font-mono text-xs font-medium sm:px-4 sm:text-[0.8125rem]"
    >
      <div
        aria-hidden="true"
        className={cn(
          cols,
          'border-b border-[#34323f] px-2 pt-1 pb-2.5 text-[0.6875rem] tracking-[0.14em] text-[#8d8a99] uppercase',
        )}
      >
        <span>PF</span>
        <span>Line</span>
        <span>Destination</span>
        <span className="text-right max-sm:hidden">By</span>
      </div>
      {ROWS.map((row) => (
        <a
          key={row.slug}
          href={`#${row.slug}`}
          aria-label={`${row.cells[1]}, ${row.cells[0]?.toLowerCase()} by ${row.cells[2]}`}
          className={cn(
            cols,
            'rounded-md border-b border-[#2b2935] px-2 py-2 leading-none tracking-[0.06em] whitespace-nowrap uppercase last:border-b-0 hover:bg-[#2a2833]',
          )}
        >
          <span
            className={cn(
              'grid size-[1.9em] place-items-center rounded-full',
              row.app ? 'bg-ember text-white' : 'bg-paper text-ink',
            )}
          >
            {row.app ? 2 : 1}
          </span>
          {row.cells.map((text, i) => (
            <span
              key={i}
              data-flap={text}
              className={cn(
                'overflow-hidden',
                i === 2 && 'text-right text-[#c9c5d4] max-sm:hidden',
              )}
            >
              {text}
            </span>
          ))}
        </a>
      ))}
    </nav>
  )
}

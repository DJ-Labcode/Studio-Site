import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { projects, shortName } from '@/content/projects'
import { brand } from '@/shared/brand'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS } from '@/shared/lib/rail'
import { useVisit } from '@/shared/state/visit'
import { flapFrame } from './flap'

const PER_PAGE = 4
const firstName = (world: string) =>
  brand.founders.find((f) => f.world === world)?.name.split(' ')[0] ?? ''

const ROWS = projects.map((p) => ({
  slug: p.slug,
  app: p.world === 'app',
  cells: [p.world === 'app' ? 'App' : 'Website', shortName(p), firstName(p.world)] as const,
}))
const PAGES = Math.max(1, Math.ceil(ROWS.length / PER_PAGE))
const cols =
  'grid grid-cols-[2.2rem_5.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[2.4rem_6rem_minmax(0,1fr)_6rem] sm:gap-4'

/**
 * A station departure board listing the projects, four rows to a page.
 * It turns to the next page every few seconds, so it stays the same size however many projects there are.
 * Each row links to its line on the home page; the full list is the timetable.
 */
export function DepartureBoard() {
  const board = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const introDone = useVisit((s) => s.introDone)
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (PAGES < 2) return
    const turn = window.setInterval(() => {
      if (!document.hidden) setPage((p) => (p + 1) % PAGES)
    }, 5200)
    return () => window.clearInterval(turn)
  }, [])

  // the letters of the page on show flip into place
  useEffect(() => {
    const el = board.current
    if (!el || still || !introDone) return
    const cells = [...el.querySelectorAll<HTMLElement>('[data-flap]')].map((cell) => ({
      cell,
      text: cell.dataset.flap ?? '',
      delay: Number(cell.dataset.row) * 150,
    }))
    const start = performance.now()
    let raf = requestAnimationFrame(function step(now) {
      let settled = true
      for (const { cell, text, delay } of cells) {
        const f = flapFrame(text, now - start - delay)
        cell.textContent = f.text
        settled &&= f.settled
      }
      if (!settled) raf = requestAnimationFrame(step)
    })
    return () => {
      cancelAnimationFrame(raf)
      cells.forEach(({ cell, text }) => (cell.textContent = text))
    }
  }, [page, still, introDone])

  const shown = ROWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
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
      {Array.from({ length: PER_PAGE }, (_, i) => {
        const row = shown[i]
        // an empty slot keeps the board the same height on a short last page
        if (!row)
          return (
            <div key={i} aria-hidden="true" className="h-[2.9em] border-b border-transparent" />
          )
        return (
          <a
            key={row.slug}
            href={`#${row.app ? RAIL_SECTIONS.apps : RAIL_SECTIONS.web}`}
            aria-label={`${row.cells[1]}, ${row.cells[0].toLowerCase()} by ${row.cells[2]}`}
            className={cn(
              cols,
              'h-[2.9em] rounded-md border-b border-[#2b2935] px-2 leading-none tracking-[0.06em] whitespace-nowrap uppercase hover:bg-[#2a2833]',
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
            {row.cells.map((text, c) => (
              <span
                key={c}
                data-flap={text}
                data-row={i}
                className={cn(
                  'overflow-hidden',
                  c === 2 && 'text-right text-[#c9c5d4] max-sm:hidden',
                )}
              >
                {text}
              </span>
            ))}
          </a>
        )
      })}
      <div className="flex items-center justify-between px-2 pt-2.5 text-[0.6875rem] tracking-[0.14em] text-[#8d8a99] uppercase">
        <span>
          Page {page + 1} of {PAGES}
        </span>
        <Link to="/work" className="text-amber underline underline-offset-4">
          Full timetable
        </Link>
      </div>
    </nav>
  )
}

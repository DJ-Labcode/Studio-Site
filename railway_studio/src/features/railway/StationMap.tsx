import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS } from '@/shared/lib/rail'

const STATIONS = [
  { id: RAIL_SECTIONS.top, label: 'Start' },
  { id: RAIL_SECTIONS.web, label: 'Websites' },
  { id: RAIL_SECTIONS.apps, label: 'Apps' },
  { id: RAIL_SECTIONS.about, label: 'About' },
  { id: RAIL_SECTIONS.contact, label: 'Contact' },
] as const

/** Index of the station the middle of the screen has reached. */
function useCurrentStation() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let raf = 0
    const read = () => {
      const doc = document.documentElement
      let at = 0
      STATIONS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) at = i
      })
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) at = STATIONS.length - 1
      setCurrent(at)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return current
}

/**
 * The site's navigation, drawn as a station map: a column of stops on the right edge of a wide
 * screen, and a bar at the bottom of a phone, like an app's tab bar.
 */
export function StationMap() {
  const current = useCurrentStation()
  return (
    <nav
      aria-label="Sections"
      className={cn(
        'group fixed z-40',
        // phone: bottom bar
        'bg-ink bottom-[calc(14px+env(safe-area-inset-bottom,0px))] left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full p-1.5 shadow-[0_8px_24px_rgb(22_21_28/0.22)]',
        // wide: column of stops with the two lines behind it
        'md:top-1/2 md:right-6 md:bottom-auto md:left-auto md:grid md:translate-x-0 md:-translate-y-1/2 md:gap-[22px] md:rounded-none md:bg-transparent md:p-0 md:py-1.5 md:shadow-none',
      )}
    >
      <span
        aria-hidden="true"
        className="bg-ink absolute top-2.5 right-[7px] bottom-2.5 hidden w-0.5 md:block"
      />
      <span
        aria-hidden="true"
        className="bg-ember absolute top-2.5 right-[3px] bottom-2.5 hidden w-0.5 md:block"
      />
      {STATIONS.map((s, i) => {
        const on = i === current
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'location' : undefined}
            className={cn(
              'relative flex items-center rounded-full px-3 py-2.5 text-[0.6875rem] font-medium tracking-[0.08em] uppercase',
              on ? 'bg-ember text-white' : 'text-[#cfcbd6]',
              i === 0 && 'max-md:hidden',
              'md:justify-end md:gap-3 md:bg-transparent md:p-0 md:text-xs md:tracking-[0.12em]',
              on ? 'md:text-ink' : 'md:text-muted',
            )}
          >
            <span
              className={cn(
                'md:bg-paper transition md:px-0.5 md:py-1',
                !on &&
                  'md:translate-x-1.5 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100',
              )}
            >
              {s.label}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'hidden size-3.5 rounded-full border-[2.5px] transition md:block',
                on ? 'border-ember bg-ember scale-125' : 'border-ink bg-paper',
              )}
            />
          </a>
        )
      })}
    </nav>
  )
}

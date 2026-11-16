import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { scrollToId, scrollToY } from '@/shared/lib/scrollTo'
import { SECTIONS } from '@/shared/lib/sections'
import { useVisit } from '@/shared/state/visit'

const icon = (paths: ReactNode) => <svg viewBox="0 0 24 24">{paths}</svg>
const ITEMS: { id: string; label: string; icon: ReactNode }[] = [
  {
    id: SECTIONS.web,
    label: 'Websites',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 9h18M7 6.5h.01" />
      </>,
    ),
  },
  {
    id: SECTIONS.apps,
    label: 'Apps',
    icon: icon(
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>,
    ),
  },
  {
    id: SECTIONS.planner,
    label: 'Planner',
    icon: icon(
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9ZM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />,
    ),
  },
  {
    id: SECTIONS.process,
    label: 'How we work',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M7 10l3 2.5L7 15M12.5 15H17" />
      </>,
    ),
  },
  {
    id: SECTIONS.about,
    label: 'About',
    icon: icon(
      <>
        <circle cx="9" cy="8.5" r="3" />
        <circle cx="16.5" cy="9.5" r="2.3" />
        <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.900 1.8 5.5 5M15 14.300c2.9-.5 5 1.2 5.600 4.200" />
      </>,
    ),
  },
  {
    id: SECTIONS.contact,
    label: 'Contact',
    icon: icon(
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7.5l8 6 8-6" />
      </>,
    ),
  },
]

/** Which section the middle of the screen has reached, or null while still on the home desktop. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string | null>(null)
  useEffect(() => {
    let raf = 0
    const read = () => {
      let at: string | null = null
      for (const item of ITEMS) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) at = item.id
      }
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

/** The site's navigation: a dock of icons at the bottom of the screen, shown once the visitor is inside the laptop. */
export function Dock() {
  const inside = useVisit((s) => s.inside)
  const current = useCurrentSection()
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    scrollToId(id)
  }
  // Home is the desktop inside the laptop, not the view from outside it
  const home = (e: MouseEvent) => {
    e.preventDefault()
    const stage = document.getElementById(SECTIONS.stage)
    if (stage) scrollToY((stage.offsetHeight - window.innerHeight) * 0.74)
  }
  return (
    <nav className={cn('dock', inside && 'show')} aria-label="Sections">
      <a className="home" href={`#${SECTIONS.stage}`} onClick={home}>
        <i>
          <b>{brand.nameParts[0][0]}</b>
          {brand.nameParts[1][0]}
        </i>
        <span>Home</span>
      </a>
      {ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={go(item.id)}
          className={cn(current === item.id && 'on')}
          aria-current={current === item.id ? 'location' : undefined}
          aria-label={item.label}
        >
          {item.icon}
          <span aria-hidden="true">{item.label}</span>
        </a>
      ))}
    </nav>
  )
}

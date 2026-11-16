import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS } from '@/shared/lib/rail'
import { useVisit, type Need } from '@/shared/state/visit'

const CHOICES: { need: Need; label: string; note: string; to: string; fill: string }[] = [
  {
    need: 'website',
    label: 'A website',
    note: 'Platform 1 · Vanashri’s line',
    to: RAIL_SECTIONS.web,
    fill: 'hover:bg-ink aria-[current]:bg-ink',
  },
  {
    need: 'app',
    label: 'An app',
    note: 'Platform 2 · Dhruv’s line',
    to: RAIL_SECTIONS.apps,
    fill: 'hover:border-ember hover:bg-ember aria-[current]:border-ember aria-[current]:bg-ember',
  },
  {
    need: 'both',
    label: 'Both',
    note: 'One studio, both lines',
    to: RAIL_SECTIONS.web,
    fill: 'hover:bg-[linear-gradient(100deg,var(--color-ink)_50%,var(--color-ember)_50%)] aria-[current]:bg-[linear-gradient(100deg,var(--color-ink)_50%,var(--color-ember)_50%)]',
  },
]

/**
 * The three answers to "What do you want to build?". Each is a link down its line; the answer is
 * also remembered, so the contact ticket opens with the same choice already made.
 */
export function Choices() {
  const need = useVisit((s) => s.need)
  const chosen = useVisit((s) => s.chosen)
  const choose = useVisit((s) => s.choose)
  return (
    <div
      role="group"
      aria-label="Choose what you want to build"
      className="grid max-w-[26rem] gap-3"
    >
      {CHOICES.map((c) => (
        <a
          key={c.need}
          href={`#${c.to}`}
          onClick={() => choose(c.need)}
          aria-current={chosen && need === c.need ? 'true' : undefined}
          className={cn(
            'group border-ink bg-surface text-ink font-display grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border-[1.5px] px-5 py-4 text-[1.4rem] leading-tight font-bold tracking-tight transition duration-200',
            'hover:-translate-y-0.5 hover:text-white hover:shadow-[0_14px_26px_-16px_rgb(22_21_28/0.7)] aria-[current]:text-white',
            c.fill,
          )}
        >
          <span aria-hidden="true" className="flex">
            {c.need !== 'app' && (
              <i className="bg-ink border-surface size-[18px] rounded-full border-2" />
            )}
            {c.need !== 'website' && (
              <i
                className={cn(
                  'bg-ember border-surface size-[18px] rounded-full border-2',
                  c.need === 'both' && '-ml-[7px]',
                )}
              />
            )}
          </span>
          <span>
            {c.label}
            <small className="text-muted mt-1 block font-sans text-xs font-medium tracking-wide transition group-hover:text-white/80 group-aria-[current]:text-white/80">
              {c.note}
            </small>
          </span>
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        </a>
      ))}
    </div>
  )
}

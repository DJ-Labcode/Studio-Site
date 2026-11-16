import { Link, useSearchParams } from 'react-router'
import { projects } from '@/content/projects'
import { brand, type World } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { Eyebrow } from '@/shared/ui/Eyebrow'

const FILTERS: { value: World | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Websites' },
  { value: 'app', label: 'Apps' },
]
const firstName = (world: World) =>
  brand.founders.find((f) => f.world === world)?.name.split(' ')[0] ?? ''

/**
 * Every project in one list, drawn as a station timetable, with a filter per line.
 * The filter lives in the address (?line=web), so a filtered view can be linked to.
 */
export function Timetable() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('line')
  const line: World | 'all' = asked === 'web' || asked === 'app' ? asked : 'all'
  const rows = projects.filter((p) => line === 'all' || p.world === line)
  const cell = 'border-b border-[#2b2935] px-2.5 py-3 whitespace-nowrap'
  const head =
    'border-b border-[#34323f] px-2.5 py-2.5 text-left text-[0.6875rem] font-medium tracking-[0.14em] text-[#8d8a99]'

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-5 pt-32 pb-16">
      <Link
        to="/"
        className="border-ink text-ink hover:bg-ink hover:text-paper justify-self-start rounded-xl border-[1.5px] px-4 py-2.5 text-sm font-semibold transition"
      >
        ← Back to the station
      </Link>
      <Eyebrow>
        Timetable <span className="text-ember">·</span> Every project
      </Eyebrow>
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] leading-none font-bold">All departures.</h1>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={line === f.value}
            onClick={() => setParams(f.value === 'all' ? {} : { line: f.value }, { replace: true })}
            className={cn(
              'cursor-pointer rounded-full border-[1.5px] px-4 py-2.5 text-sm font-semibold transition',
              line === f.value
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-surface text-ink hover:border-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-board overflow-x-auto rounded-[18px] px-3.5 pt-2 pb-3">
        <table className="text-amber w-full border-collapse font-mono text-[0.8125rem] font-medium tracking-[0.05em] uppercase tabular-nums">
          <thead>
            <tr>
              <th className={head}>PF</th>
              <th className={head}>Project</th>
              <th className={head}>Line</th>
              <th className={head}>By</th>
              <th className={head}>Status</th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {rows.map((p) => (
              <tr key={p.slug} className="hover:bg-[#2a2833]">
                <td className={cell}>
                  <span
                    className={cn(
                      'inline-grid size-[1.9em] place-items-center rounded-full',
                      p.world === 'app' ? 'bg-ember text-white' : 'bg-paper text-ink',
                    )}
                  >
                    {p.world === 'app' ? 2 : 1}
                  </span>
                </td>
                <td className={cell}>
                  <Link to={`/work/${p.slug}`} className="underline-offset-4 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className={cell}>{p.world === 'app' ? 'App' : 'Website'}</td>
                <td className={cn(cell, 'text-[#c9c5d4]')}>{firstName(p.world)}</td>
                <td className={cn(cell, 'text-[#c9c5d4]')}>{p.status ?? '·'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

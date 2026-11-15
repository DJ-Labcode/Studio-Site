import { brand } from '@/shared/brand'
import { MARK, type Cell } from '@/shared/brand/mark'
import { cn } from '@/shared/lib/cn'

const path = (cells: readonly Cell[]) => cells.map(([c, r]) => `M${c} ${r}h1v1h-1z`).join('')

export function LogoMark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 18 16" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d={path(MARK.d)} className={onDark ? 'fill-white' : 'fill-ink'} />
      <path d={path(MARK.f)} className="fill-ember" />
      <path d={path(MARK.spark)} className="fill-spark" />
    </svg>
  )
}

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const [a, b] = brand.nameParts
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark className="h-7 w-auto" onDark={onDark} />
      <span
        className={cn(
          'font-display text-xl font-bold tracking-tight',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        {a}
        <span className="text-ember">{b}</span>
      </span>
    </span>
  )
}

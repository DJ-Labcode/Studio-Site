import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/** Small uppercase label above a heading. */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-muted text-xs font-medium tracking-[0.16em] uppercase', className)}
      {...props}
    />
  )
}

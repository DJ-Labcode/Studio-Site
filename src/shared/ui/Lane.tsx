import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * The page column of the story home. Its side padding is the space the railway runs in,
 * so every section that uses it lines up with the tracks.
 */
export function Lane({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-[60px] md:px-24', className)}>{children}</div>
  )
}

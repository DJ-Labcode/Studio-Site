import type { CSSProperties } from 'react'
import type { Project } from '@/content/projects'
import { cn } from '@/shared/lib/cn'

/**
 * A phone or browser frame showing the project's real screenshots.
 * Tall screenshots pan slowly on their own; with no screenshots yet, the frame says so.
 */
export function DeviceFrame({ project, className }: { project: Project; className?: string }) {
  const phone = project.device === 'phone'
  const shot = project.shots[0]
  return (
    <div
      style={{ '--hue': project.hue } as CSSProperties}
      className={cn(
        'bg-surface relative overflow-hidden border border-white/15 shadow-[0_40px_120px_-40px_var(--hue)]',
        phone ? 'aspect-[9/19] rounded-[2.2rem] p-2' : 'aspect-[16/10.5] rounded-xl',
        className,
      )}
    >
      {!phone && (
        <div className="flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-white/15" />
          ))}
          <span className="ml-3 h-4 flex-1 rounded bg-white/5" />
        </div>
      )}
      <div
        className={cn(
          'bg-paper [container-type:size] relative overflow-hidden',
          phone ? 'h-full rounded-[1.7rem]' : 'h-[calc(100%-2rem)]',
        )}
      >
        {shot ? (
          <img
            src={shot}
            alt={`${project.name} screenshot`}
            loading="lazy"
            className="animate-pan absolute inset-x-0 top-0 w-full motion-reduce:animate-none"
          />
        ) : (
          <div className="grid h-full place-content-center justify-items-center gap-3 p-6 text-center">
            <span aria-hidden="true" className="size-3 animate-pulse bg-[var(--hue)]" />
            <p className="text-muted font-mono text-[0.65rem] tracking-[0.2em] uppercase">
              Screenshot to be added
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

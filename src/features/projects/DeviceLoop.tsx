import { useEffect, useRef } from 'react'
import type { Project } from '@/content/projects'
import { cn } from '@/shared/lib/cn'

/** A project's looping footage. It only plays while `active`, so one video runs at a time. */
export function DeviceLoop({
  project,
  active,
  className,
}: {
  project: Project
  active: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) void v.play().catch(() => undefined)
    else v.pause()
  }, [active])
  return (
    <video
      ref={ref}
      src={project.video}
      poster={project.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`${project.name} in motion`}
      className={cn('h-auto max-h-full w-auto max-w-full mix-blend-multiply', className)}
    />
  )
}

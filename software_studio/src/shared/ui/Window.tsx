import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** The title bar every window shares: three dots, a title, and anything extra on the right. */
export function TitleBar({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="chrome">
      <i />
      <i />
      <i />
      <span className="t">{title}</span>
      {children}
    </div>
  )
}

/** A software window on the desktop. Pass `title` for the standard title bar, or build your own as the first child. */
export function Window({
  title,
  className,
  children,
  ...rest
}: { title?: ReactNode } & Omit<ComponentProps<'div'>, 'title'>) {
  return (
    <div className={cn('win', className)} {...rest}>
      {title !== undefined && <TitleBar title={title} />}
      {children}
    </div>
  )
}

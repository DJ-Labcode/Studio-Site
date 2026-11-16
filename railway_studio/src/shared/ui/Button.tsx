import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/cn'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[0.95rem] font-semibold leading-none transition duration-150'
const variants = {
  /** solid, with the hard "pixel" shadow that presses in on click */
  primary:
    'bg-ember text-white shadow-[4px_4px_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none',
  ghost: 'border border-line text-ink hover:border-muted hover:bg-surface',
}
type Variant = keyof typeof variants

export function Button({
  variant = 'primary',
  className,
  ...p
}: ComponentProps<'button'> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...p} />
}

export function ButtonLink({
  variant = 'primary',
  className,
  ...p
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...p} />
}

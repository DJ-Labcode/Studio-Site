import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'

/** Attribute on the header logo; the splash animation lands its wordmark exactly on this element. */
export const WORDMARK_ANCHOR = 'data-wordmark-anchor'

/** The name set in the brand type: first half ink, second half ember. */
export function Wordmark({ className, anchor = false }: { className?: string; anchor?: boolean }) {
  const [a, b] = brand.nameParts
  return (
    <span
      {...(anchor ? { [WORDMARK_ANCHOR]: '' } : {})}
      className={cn(
        'font-display text-ink inline-block text-2xl leading-none font-bold tracking-[-0.04em] whitespace-nowrap',
        className,
      )}
    >
      {a}
      <span className="text-ember">{b}</span>
    </span>
  )
}

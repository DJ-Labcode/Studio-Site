import { brand } from '@/shared/brand'
import { Wordmark } from '@/shared/ui/Wordmark'

export function SiteFooter() {
  return (
    <footer className="px-5 pt-6 pb-24 md:pb-10">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
        <Wordmark className="text-xl" />
        <span>Web &amp; app studio · {brand.location}</span>
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
      </div>
    </footer>
  )
}

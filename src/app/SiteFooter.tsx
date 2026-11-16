import { site } from '@/content/site'
import { brand } from '@/shared/brand'
import { PixelWord } from '@/shared/ui/PixelGlyph'
import { Wordmark } from '@/shared/ui/Wordmark'

export function SiteFooter() {
  const credit = (
    <>
      <span>Web &amp; app studio · {brand.location}</span>
      <span>
        © {new Date().getFullYear()} {brand.name}
      </span>
    </>
  )
  // the Blender version keeps its own large pixel wordmark
  if (site.homeVariant === 'blender')
    return (
      <footer className="border-line border-t px-5 pt-16 pb-8">
        <div className="mx-auto max-w-6xl">
          <PixelWord
            text={brand.name}
            accentFrom={brand.nameParts[0].length}
            className="block h-auto w-full"
          />
          <div className="text-muted mt-7 flex flex-wrap justify-between gap-3 font-mono text-xs">
            {credit}
          </div>
        </div>
      </footer>
    )
  return (
    <footer className="px-5 pt-6 pb-24 md:pb-10">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
        <Wordmark className="text-xl" />
        {credit}
      </div>
    </footer>
  )
}

import { brand } from '@/shared/brand'
import { PixelWord } from '@/shared/ui/PixelGlyph'

export function SiteFooter() {
  return (
    <footer className="border-line border-t px-5 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <PixelWord
          text={brand.name}
          accentFrom={brand.nameParts[0].length}
          className="block h-auto w-full"
        />
        <div className="text-muted mt-7 flex flex-wrap justify-between gap-3 font-mono text-xs">
          <span>
            Web &amp; mobile app studio by{' '}
            {brand.founders.map((f) => f.name.split(' ')[0]).join(' & ')}
          </span>
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </div>
    </footer>
  )
}

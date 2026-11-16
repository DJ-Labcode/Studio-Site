import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { site } from '@/content/site'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { ButtonLink } from '@/shared/ui/Button'
import { Wordmark } from '@/shared/ui/Wordmark'

const NAV = [
  ['What we do', '/#what'],
  ['About', '/#about'],
  ['Work', '/#work'],
  ['Contact', '/#contact'],
] as const

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-line bg-paper/85 backdrop-blur-md' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
        <Link to="/" aria-label={`${brand.name} home`}>
          <Wordmark anchor />
        </Link>
        {/* the story home navigates with its station map, so its header is the logo alone */}
        {site.homeVariant === 'blender' && (
          <nav aria-label="Main" className="flex items-center gap-6 text-sm">
            {NAV.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="text-muted hover:text-ink hidden transition-colors md:block"
              >
                {label}
              </Link>
            ))}
            <ButtonLink
              to="/#contact"
              className="px-4 py-2.5 text-sm shadow-[3px_3px_0_var(--color-ink)]"
            >
              Start a project
            </ButtonLink>
          </nav>
        )}
      </div>
    </header>
  )
}

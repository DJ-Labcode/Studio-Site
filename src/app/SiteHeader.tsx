import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { ButtonLink } from '@/shared/ui/Button'
import { Logo } from '@/shared/ui/Logo'

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
          <Logo />
        </Link>
        <ButtonLink
          to="/#forge"
          className="px-4 py-2.5 text-sm shadow-[3px_3px_0_var(--color-ink)]"
        >
          Start a project
        </ButtonLink>
      </div>
    </header>
  )
}

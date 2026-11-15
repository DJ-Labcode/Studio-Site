import { Link, Outlet, ScrollRestoration } from 'react-router'
import { brand } from '@/shared/brand'
import { Logo } from '@/shared/ui/Logo'

export default function RootLayout() {
  return (
    <>
      <header className="border-line bg-paper/85 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label={`${brand.name} home`}>
            <Logo />
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-line text-muted border-t px-5 py-10 text-center font-mono text-xs">
        © {new Date().getFullYear()} {brand.name}
      </footer>
      <ScrollRestoration />
    </>
  )
}

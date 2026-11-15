import { Outlet, ScrollRestoration } from 'react-router'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export default function RootLayout() {
  return (
    <>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}

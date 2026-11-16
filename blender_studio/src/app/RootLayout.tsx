import { Outlet, ScrollRestoration } from 'react-router'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SmoothScroll } from './SmoothScroll'

export default function RootLayout() {
  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}

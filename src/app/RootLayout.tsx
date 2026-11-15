import { Outlet, ScrollRestoration } from 'react-router'
import { Ambient } from './Ambient'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SmoothScroll } from './SmoothScroll'

export default function RootLayout() {
  return (
    <>
      <SmoothScroll />
      <Ambient />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}

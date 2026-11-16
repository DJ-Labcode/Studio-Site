import { Outlet, ScrollRestoration } from 'react-router'
import { SmoothScroll } from './SmoothScroll'

export default function RootLayout() {
  return (
    <>
      <SmoothScroll />
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

import { useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { site } from '@/content/site'
import { Splash } from '@/features/splash'
import { useVisit } from '@/shared/state/visit'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SmoothScroll } from './SmoothScroll'

/** The splash opens the story home on a full page load; visitors who prefer reduced motion skip it. */
const opensWithSplash = () =>
  site.homeVariant === 'story' &&
  window.location.pathname === '/' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function RootLayout() {
  const [splash, setSplash] = useState(() => {
    const plays = opensWithSplash()
    if (!plays) useVisit.getState().finishIntro()
    return plays
  })
  return (
    <>
      <SmoothScroll />
      {splash && (
        <Splash
          onDone={() => {
            setSplash(false)
            useVisit.getState().finishIntro()
          }}
        />
      )}
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  )
}

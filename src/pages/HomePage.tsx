import { useState } from 'react'
import { HeroScreen, PullOut, PushIn, Splash } from '@/features/journey'

/**
 * The home page is one scroll: into the laptop, through the site "inside" it, and back out.
 * The sections inside (worlds, projects, process, builder) are added feature by feature.
 */
export default function HomePage() {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready && <Splash onDone={() => setReady(true)} />}
      <PushIn />
      <section id="inside" aria-label="Inside the laptop">
        <HeroScreen />
      </section>
      <PullOut />
    </>
  )
}

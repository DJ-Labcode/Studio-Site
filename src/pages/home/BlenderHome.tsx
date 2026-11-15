import { useState } from 'react'
import { ContactSection } from '@/features/contact'
import { HeroScreen, PullOut, PushIn, Splash } from '@/features/journey'

/** The Blender version: splash, the desk, the glide into the laptop, and the pull back out. */
export default function BlenderHome() {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready && <Splash onDone={() => setReady(true)} />}
      <PushIn />
      <section aria-label="Inside the laptop">
        <HeroScreen />
      </section>
      <PullOut />
      <ContactSection />
    </>
  )
}

import { useEffect, useState } from 'react'
import WorldView, { type WorldKind } from './components/WorldView'
import Nav from './components/Nav'
import Splash from './components/Splash'
import { PushIn, InsideIntro, PullOut, PUSH } from './components/Journey'
import { Split, WebWorld, AppWorld, Merge } from './components/Worlds'
import CaseStudy from './components/CaseStudy'
import { projects } from './data'
import { useCase, openCase } from './caseStore'
import Builder from './components/Builder'
import Footer from './components/Footer'

const FIRST = ['frames/hero/hero.mp4', ...PUSH.slice(0, 24)].filter((u) => u.endsWith('.webp'))

export default function App() {
  const [ready, setReady] = useState(false)
  const kase = useCase()
  const [world, setWorld] = useState<WorldKind | null>(null)
  useEffect(() => {
    const on = (e: Event) => setWorld((e as CustomEvent<WorldKind>).detail)
    addEventListener('df:world', on)
    return () => removeEventListener('df:world', on)
  }, [])
  const open = projects.find((p) => p.id === kase.id)
  return (
    <>
      {!ready && <Splash urls={FIRST} onDone={() => setReady(true)} />}
      <Nav />
      <main>
        <PushIn />
        <div className="laptop-world">
          <Split />
          <WebWorld />
          <AppWorld />
          <Merge />
          <InsideIntro />
          <Builder />
        </div>
        <PullOut />
      </main>
      <Footer />
      {world && <WorldView kind={world} onClose={() => setWorld(null)} />}
      {open && <CaseStudy p={open} onClose={kase.close} onGo={openCase} />}
    </>
  )
}

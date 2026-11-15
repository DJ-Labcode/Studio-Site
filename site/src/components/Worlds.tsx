import { useState, type CSSProperties } from 'react'
import ScrollFrames from './ScrollFrames'
import { BlueHero } from './Journey'
import { projects } from '../data'
import LiveSite from './LiveSite'
import LiveApp from './LiveApp'
import { openCase } from '../caseStore'
import { openWorld } from './WorldView'

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

const GLYPH: Record<string, string[]> = {
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
}
/** A pixel initial in the same block style as the DuoForge mark. */
export function PixelLetter({ ch, className = '' }: { ch: 'V' | 'D'; className?: string }) {
  return (
    <svg viewBox="0 0 5 7" className={`pxl ${className}`} shapeRendering="crispEdges" aria-hidden="true">
      {GLYPH[ch].flatMap((row, y) => [...row].map((v, x) => (v === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="0.94" height="0.94" /> : null)))}
    </svg>
  )
}

const webs = projects.filter((p) => p.type === 'web')
const apps = projects.filter((p) => p.type === 'app')

/** The blue screen splits into two worlds: web on the left, apps on the right, one stroke between them. */
export function Split() {
  return (
    <ScrollFrames urls={[]} vh={230} id="inside">
      {(p) => {
        const open = seg(p, 0.15, 0.6), reveal = seg(p, 0.45, 0.8)
        return (
          <div className="split" style={{ '--open': open, '--reveal': reveal } as CSSProperties}>
            <div className="split-half split-web" onClick={() => openWorld('web')}>
              <div className="split-inner" style={{ opacity: reveal }}>
                <PixelLetter ch="V" />
                <p className="mono">World one</p>
                <h2>Web</h2>
                <p className="split-who">Vanashri builds websites</p>
                <button className="split-go" onClick={() => openWorld('web')}>Enter the web world <span aria-hidden="true">→</span></button>
              </div>
            </div>
            <div className="split-stroke" aria-hidden="true" />
            <div className="split-half split-app" onClick={() => openWorld('app')}>
              <div className="split-inner" style={{ opacity: reveal }}>
                <PixelLetter ch="D" />
                <p className="mono">World two</p>
                <h2>Apps</h2>
                <p className="split-who">Dhruv builds mobile apps</p>
                <button className="split-go" onClick={() => openWorld('app')}>Enter the app world <span aria-hidden="true">→</span></button>
              </div>
            </div>
            <div className="split-hero" style={{ opacity: 1 - seg(p, 0.05, 0.3) }} aria-hidden={p > 0.3}><BlueHero /></div>
            <p className="split-cap mono" style={{ opacity: seg(p, 0.2, 0.35) * (1 - seg(p, 0.5, 0.62)) }}>Two developers · two worlds</p>
          </div>
        )
      }}
    </ScrollFrames>
  )
}

/** Web world: feels like being inside a browser. Tabs switch between working sites. */
export function WebWorld() {
  const [i, setI] = useState(0)
  const p = webs[i]
  return (
    <section className="world world-web" id="web">
      <div className="world-grid" aria-hidden="true" />
      <div className="wrap">
        <header className="world-head">
          <PixelLetter ch="V" />
          <div>
            <p className="eyebrow"><i className="px" /> World one · Web</p>
            <h2>Vanashri builds the web.</h2>
            <p className="section-intro">Fast, good-looking websites that bring in customers: cafés, studios, shops and startups. Click a tab, then click around inside. Every site here works.</p>
            <button className="world-open" onClick={() => openWorld('web')}>Open the web world <span aria-hidden="true">→</span></button>
          </div>
        </header>
        <div className="web-stage">
          <div className="web-browser">
            <div className="web-tabs" role="tablist" aria-label="Websites">
              {webs.map((w, k) => (
                <button key={w.id} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)} style={{ '--hue': w.hue } as CSSProperties}>
                  <i /> {w.name}
                </button>
              ))}
            </div>
            <LiveSite p={p} key={p.id} />
          </div>
          <aside className="world-info" style={{ '--hue': p.hue } as CSSProperties}>
            <p className="mono world-kind">{p.kind}</p>
            <h3>{p.name}</h3>
            <p>{p.summary}</p>
            <p className="world-result"><i className="px" /> {p.result}</p>
            <ul className="chips">{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
            <button className="btn btn-primary" onClick={() => openCase(p.id)}>Read the case study <span aria-hidden="true">→</span></button>
          </aside>
        </div>
      </div>
    </section>
  )
}

/** App world: feels like being inside a phone. Tap an app icon to open it. */
export function AppWorld() {
  const [i, setI] = useState(0)
  const p = apps[i]
  return (
    <section className="world world-app" id="apps">
      <div className="wrap">
        <header className="world-head">
          <PixelLetter ch="D" />
          <div>
            <p className="eyebrow"><i className="px" /> World two · Apps</p>
            <h2>Dhruv builds apps.</h2>
            <p className="section-intro">Android and iOS from one Flutter codebase, with payments, analytics and AI built in. Tap an app icon to open it, then use it right here.</p>
            <button className="world-open" onClick={() => openWorld('app')}>Open the app world <span aria-hidden="true">→</span></button>
          </div>
        </header>
        <div className="app-stage">
          <aside className="world-info" style={{ '--hue': p.hue } as CSSProperties}>
            <p className="mono world-kind">{p.kind}</p>
            <h3>{p.name}</h3>
            <p>{p.summary}</p>
            <p className="world-result"><i className="px" /> {p.result}</p>
            <ul className="chips">{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
            <button className="btn btn-primary" onClick={() => openCase(p.id)}>Read the case study <span aria-hidden="true">→</span></button>
          </aside>
          <div className="app-phone-wrap"><LiveApp p={p} key={p.id} /></div>
          <div className="app-dock" role="tablist" aria-label="Apps">
            {apps.map((a, k) => (
              <button key={a.id} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)} style={{ '--hue': a.hue } as CSSProperties}>
                <span className="app-ico">{a.name.slice(0, 1)}</span>
                <b>{a.name}</b>
                <small>{a.platforms}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The two worlds slide back together: the team. */
export function Merge() {
  return (
    <ScrollFrames urls={[]} vh={200} id="team">
      {(p) => {
        const join = seg(p, 0.05, 0.6)
        return (
          <div className="merge" style={{ '--join': join } as CSSProperties}>
            <article className="merge-half merge-web">
              <PixelLetter ch="V" />
              <h3>Vanashri</h3>
              <p className="merge-role">Co-founder · Web developer</p>
              <ul className="merge-list"><li>React &amp; Next.js</li><li>UI design</li><li>SEO &amp; speed</li></ul>
            </article>
            <div className="merge-stroke" aria-hidden="true" />
            <article className="merge-half merge-app">
              <PixelLetter ch="D" />
              <h3>Dhruv Jain</h3>
              <p className="merge-role">Co-founder · App &amp; backend developer</p>
              <ul className="merge-list"><li>Flutter</li><li>FastAPI</li><li>AI &amp; RAG</li></ul>
            </article>
            <div className="merge-cap" style={{ opacity: seg(p, 0.55, 0.8) }}>
              <p className="mono">Two worlds · one team</p>
              <h2>Together, we’re <span>DuoForge.</span></h2>
            </div>
          </div>
        )
      }}
    </ScrollFrames>
  )
}
